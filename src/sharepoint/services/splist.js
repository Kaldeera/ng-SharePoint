/**
 * @ngdoc object
 * @name ngSharePoint.SPList
 *
 * @description
 * Represents a SPList object that you could use to access to all SharePoint list properties and data.
 *
 * Is possible create new SPList objects or use a {@link ngSharePoint.SPWeb SPWeb} object to get SPList object instances.
 *
 * *At the moment, not all SharePoint API methods for list objects are implemented in ngSharePoint*
 *
 * @requires ngSharePoint.SPListItem
 * @requires ngSharePoint.SPFolder
 * @requires ngSharePoint.SPContentType
 *
 */


angular.module('ngSharePoint').factory('SPList',

    ['$q', 'SPCache', 'SPFolder', 'SPListItem', 'SPContentType', 'SPObjectProvider',

    function SPList_Factory($q, SPCache, SPFolder, SPListItem, SPContentType, SPObjectProvider) {

        'use strict';


        /**
         * @ngdoc function
         * @name ngSharePoint.SPList#constructor
         * @constructor
         * @methodOf ngSharePoint.SPList
         *
         * @description
         * Instantiates a new `SPList` object that points to a specific SharePoint list. With a
         * list instance is possible to access their properties and get list items.
         *
         * *Note*: this method only instantiates a new `SPList` object initialized for future access to
         * list related API (get list items, folders, documents). This method doesn't retrieve any
         * list properties or information. For retrieve list properties is necessary to call 
         * {@link ngSharePoint.SPList#getProperties getProperties} method.
         *
         * @param {SPWeb} web A valid {@link ngSharePoint.SPWeb SPWeb} object where the list is located
         * @param {string} listId|listName List id or list name.
         * Is possible to specify "UserInfoList" to refer the system list with all site users.
         * @param {object} listProperties Properties to initialize the object
         *
         * @example
         * <pre>
         * new SPList(web, 'Shared documents').then(function(docs) {
         *   // ... do something with the 'docs' object
         * })
         * </pre>
         *
         */
        var SPListObj = function(web, listName, listProperties) {

            if (web === void 0) {
                throw '@web parameter not specified in SPList constructor.';
            }

            if (listName === void 0) {
                throw '@listName parameter not specified in SPList constructor.';
            }


            this.web = web;

            // Cleans the 'listName' parameter.
            this.listName = listName.trim().ltrim('{').rtrim('}');


            if (utils.isGuid(this.listName)) {

                this.apiUrl = '/Lists(guid\'' + this.listName + '\')';

            } else {

                if (this.listName.toLowerCase() == 'userinfolist') {

                    this.apiUrl = '/SiteUserInfoList';

                } else {

                    this.apiUrl = '/Lists/GetByTitle(\'' + this.listName + '\')';

                }
            }


            // Initializes the SharePoint API REST url for the list.
            this.apiUrl = web.apiUrl + this.apiUrl;

            // Gets the list fields (Schema) from the cache if exists.
            this.Fields = SPCache.getCacheValue('SPListFieldsCache', this.apiUrl);

            // Init listProperties (if exists)
            if (listProperties !== void 0) {
                utils.cleanDeferredProperties(listProperties);
                angular.extend(this, listProperties);
            }
        };



        /**
         * Gets the 'ListItemEntityTypeFullName' property for the list and attach it
         * to 'this' object.
         *
         * This property is required for CRUD operations.
         *
         * This method is used internally.
         */
        SPListObj.prototype.getListItemEntityTypeFullName = function() {

            var self = this;
            var def = $q.defer();


            if (this.ListItemEntityTypeFullName) {

                def.resolve(this.ListItemEntityTypeFullName);

            } else {

                self.getProperties().then(function() {
                    def.resolve(self.ListItemEntityTypeFullName);
                });

            }

            return def.promise;

        }; // getListItemEntityTypeFullName



        /**
         * @ngdoc function
         * @name ngSharePoint.SPList#getProperties
         * @methodOf ngSharePoint.SPList
         *
         * @description
         * Makes a call to the SharePoint server and collects all the list properties.
         * The current object is extended with the recovered properties. This means that when this method is executed,
         * any list property is accessible directly. ex: `list.Title`, `list.BaseTemplate`, `list.AllowContentTypes`, etc.
         *
         * For a complete list of list properties go to Microsoft
         * SharePoint {@link https://msdn.microsoft.com/EN-US/library/dn531433.aspx#bk_ListProperties list api reference}
         *
         * SharePoint REST api only returns certain list properties that have primary values. Properties with complex structures
         * like `ContentTypes`, `EffectiveBasePermissions` or `Fields` are not returned directly by the api and is necessary to extend the query
         * to retrieve their values. Is possible to accomplish this with the `query` param.
         *
         * @param {object} query This parameter specify which list properties will be extended and retrieved from the server.
         * By default `Views` property is extended.
         *
         * @returns {promise} promise with an object with all list properties
         *
         * @example
         * This example shows how to retrieve the list properties:
         * <pre>
         *
         *   SharePoint.getCurrentWeb(function(web) {
         *
         *     web.getList("Orders").then(function(list) {
         *
         *        list.getProperties().then(function() {
         *
         *            // at this point we have all list properties
         *            if (!list.EnableAttachments) {
         *                alert("You can't attach any file");
         *            }
         *        });
         *     });
         *
         *   });
         * </pre>
         *
         */
        SPListObj.prototype.getProperties = function(query) {

            var self = this;
            var def = $q.defer();
            var defaultExpandProperties = 'Views';
            // NOTA: Se ha eliminado la expansión automática del objeto 'Forms' debido a
            // que si la lista es la 'SiteUserInfoList' se genera un error porque no
            // tiene formularios sino que se utiliza la página /_layouts/15/UserDisp.aspx
            // para visualizar un usuario y un popup para la edición.

            if (query) {
                query.$expand = defaultExpandProperties + (query.$expand ? ', ' + query.$expand : '');
            } else {
                query = {
                    $expand: defaultExpandProperties
                };
            }


            // Check if the requested properties (query.$expand) are already defined to avoid to make an unnecessary new request to the server.
            if (this.Created !== undefined) {

                var infoIsOk = true;

                // The list properties are already here?
                if (query.$expand !== undefined) {
                    /*
                    if (query.$expand.toLowerCase().indexOf('fields') >= 0 && this.Fields === undefined) infoIsOk = false;
                    if (query.$expand.toLowerCase().indexOf('contenttypes') >= 0 && this.ContentTypes === undefined) infoIsOk = false;
                    */
                    angular.forEach(query.$expand.split(/, */g), function(expandKey) {

                        infoIsOk = infoIsOk && self[expandKey] !== void 0;

                    });

                }


                if (infoIsOk) {

                    def.resolve(this);
                    return def.promise;

                }

            }


            // Make the query to the server.
            var executor = new SP.RequestExecutor(self.web.url);

            executor.executeAsync({

                url: self.apiUrl + utils.parseQuery(query),
                method: 'GET',
                headers: {
                    "Accept": "application/json; odata=verbose"
                },

                success: function(data) {

                    var d = utils.parseSPResponse(data);
                    utils.cleanDeferredProperties(d);

                    angular.extend(self, d);

                    if (self.Fields !== void 0 && self.Fields.results !== void 0) {

                        // process fields --> $expand: 'Fields'

                        var fields = {};

                        angular.forEach(self.Fields.results, function(field) {
                            fields[field.InternalName] = field;
                        });

                        self.Fields = fields;
                        SPCache.setCacheValue('SPListFieldsCache', self.apiUrl, fields);
                    }

                    if (self.ContentTypes !== void 0 && self.ContentTypes.results !== void 0) {

                        // process contenttypes --> $expand: 'ContentTypes'

                        var contentTypes = [];

                        angular.forEach(self.ContentTypes.results, function(contentType) {

                            contentTypes.push(new SPContentType(self, contentType.StringId, contentType));

                        });

                        self.ContentTypes = contentTypes;
                    }

                    def.resolve(d);
                },

                error: function(data, errorCode, errorMessage) {

                    var err = utils.parseError({
                        data: data,
                        errorCode: errorCode,
                        errorMessage: errorMessage
                    });

                    def.reject(err);
                }
            });

            return def.promise;

        }; // getProperties




        /**
         * @ngdoc function
         * @name ngSharePoint.SPList#updateProperties
         * @methodOf ngSharePoint.SPList
         *
         * @description
         * With this method, is possible to modify list properties. The has an object param 
         * with any property to modify and makes a call to the server API in order to modify it.
         *
         * @param {object} properties A object with all the properties to modify
         * @returns {promise} promise with an object that contains all modified list properties
         *
         * @example
         * <pre>
         *   SharePoint.getCurrentWeb(function(web) {
         *
         *     web.getList("Orders").then(function(list) {
         *
         *         list.updateProperties({
         *
         *             EnableAttachments: true,
         *             ForceCheckout: false
         *
         *         }).then(function() {
         *             // ...
         *         });
         *     });
         *
         *   });
         * </pre>
         *
         */
        SPListObj.prototype.updateProperties = function(properties) {

            var self = this;
            var def = $q.defer();
            var executor = new SP.RequestExecutor(self.web.url);

            var body = {
                __metadata: {
                    type: 'SP.List'
                }
            };

            // Sets the properties to update
            angular.extend(body, properties);


            // Set the headers for the REST API call.
            // ----------------------------------------------------------------------------
            var headers = {
                "Accept": "application/json; odata=verbose",
                "content-type": "application/json;odata=verbose",
                "X-HTTP-Method": "MERGE",
                "IF-MATCH": "*" // Overwrite any changes in the item.
                                // Use 'item.__metadata.etag' to provide a way to verify that the object being changed has not been changed since it was last retrieved.
            };

            var requestDigest = document.getElementById('__REQUESTDIGEST');
            // Remote apps that use OAuth can get the form digest value from the http://<site url>/_api/contextinfo endpoint.
            // SharePoint-hosted apps can get the value from the #__REQUESTDIGEST page control if it's available on the SharePoint page.

            if (requestDigest !== null) {
                headers['X-RequestDigest'] = requestDigest.value;
            }


            // Make the call.
            // ----------------------------------------------------------------------------
            executor.executeAsync({

                url: self.apiUrl,
                method: 'POST',
                body: angular.toJson(body),
                headers: headers,

                success: function(data) {

                    var d = utils.parseSPResponse(data);

                    angular.extend(self, properties);

                    def.resolve(properties);

                },

                error: function(data, errorCode, errorMessage) {

                    var err = utils.parseError({
                        data: data,
                        errorCode: errorCode,
                        errorMessage: errorMessage
                    });

                    def.reject(err);
                }
            });


            return def.promise;

        }; // updateProperties




        /**
         * @ngdoc function
         * @name ngSharePoint.SPList#getFields
         * @methodOf ngSharePoint.SPList
         *
         * @description
         * This method retrieves the Fields collection of the list and creates a new object property
         * called "Fields" that contains a named property for every field.
         *
         * After a call to this method, the schema of every field is available in the list and all
         * their properties (default values, validation expressions, choice values or lookup properties).
         *
         * For a complete list of field properties go to Microsoft
         * SharePoint {@link https://msdn.microsoft.com/EN-US/library/dn600182.aspx#bk_FieldProperties field api reference}.
         * Also, there are additional field specific properties that you can retrieve
         * based on the field type:
         * {@link https://msdn.microsoft.com/EN-US/library/dn600182.aspx#bk_FieldCalculated FieldCalculated},
         * {@link https://msdn.microsoft.com/EN-US/library/dn600182.aspx#bk_FieldCollection FieldCollection},
         * {@link https://msdn.microsoft.com/EN-US/library/dn600182.aspx#bk_FieldComputed FieldComputed},
         * {@link https://msdn.microsoft.com/EN-US/library/dn600182.aspx#bk_FieldDateTime FieldDateTime},
         * {@link https://msdn.microsoft.com/EN-US/library/dn600182.aspx#bk_FieldGeolocation FieldGeolocation},
         * {@link https://msdn.microsoft.com/EN-US/library/dn600182.aspx#bk_FieldGuid FieldGuid},
         * {@link https://msdn.microsoft.com/EN-US/library/dn600182.aspx#bk_FieldLookup FieldLookup and FieldUser},
         * {@link https://msdn.microsoft.com/EN-US/library/dn600182.aspx#bk_FieldMultiChoice FieldMultiChoice, FieldChoice, and FieldRatingScale},
         * {@link https://msdn.microsoft.com/EN-US/library/dn600182.aspx#bk_FieldMultiLineText FieldMultiLineText},
         * {@link https://msdn.microsoft.com/EN-US/library/dn600182.aspx#bk_FieldNumber FieldNumber and FieldCurrency},
         * {@link https://msdn.microsoft.com/EN-US/library/dn600182.aspx#bk_FieldText FieldText},
         * {@link https://msdn.microsoft.com/EN-US/library/dn600182.aspx#bk_FieldUrl FieldUrl},
         *
         * With all of this information, you might construct new interfaces (views, forms, etc) that follow
         * definitions of any SharePoint list.
         *
         * *Note*: The list of fields of the list does'nt necessaray be equal to the item content type.
         * If you want to get the content type specific fields, you could call 'getFields' method of
         * the specific content type.
         *
         * @returns {promise} promise with an object that contains all oh the fields schema
         *
         * @example
         * <pre>
         *   // a pre-initialized "list" object ...
         *   list.getFields().then(function() {
         *
         *       // at this point, you have access to the definition of any list field
         *       console.log(list.Fields.Title.DefaultValue);
         *       // this returns '' or any defined value
         *
         *       console.log(list.Fields.DueDate.Required);                 
         *       // this returns true or false
         *
         *       console.log(list.Fields.Editor.ReadOnlyField);
         *       // this returns true
         *
         *       console.log(list.Fields.ProjectStatus.Choices.results);
         *       // this returns on array with available choices ['Open', 'Closed', 'Draft']
         *   });
         *
         * </pre>
         *
         */
        SPListObj.prototype.getFields = function() {

            var self = this;
            var def = $q.defer();

            if (this.Fields !== void 0) {

                def.resolve(this.Fields);

            } else {

                var executor = new SP.RequestExecutor(self.web.url);

                executor.executeAsync({

                    url: self.apiUrl + '/Fields',
                    method: 'GET',
                    headers: {
                        "Accept": "application/json; odata=verbose"
                    },

                    success: function(data) {

                        var d = utils.parseSPResponse(data);
                        var fields = {};

                        angular.forEach(d, function(field) {
                            fields[field.InternalName] = field;
                        });

                        self.Fields = fields;
                        SPCache.setCacheValue('SPListFieldsCache', self.apiUrl, fields);

                        def.resolve(fields);

                    },

                    error: function(data, errorCode, errorMessage) {

                        var err = utils.parseError({
                            data: data,
                            errorCode: errorCode,
                            errorMessage: errorMessage
                        });

                        def.reject(err);
                    }
                });
            }

            return def.promise;

        }; // getFields




        /**
         * @ngdoc function
         * @name ngSharePoint.SPList#getContentTypes
         * @methodOf ngSharePoint.SPList
         *
         * @description
         * This method retrieves the list of all content types of the list.
         *
         * If you call this method, a new `ContentType` property will be set with the array of content types.
         * 
         * @returns {promise} promise with an array of all content types associated with the list.
         * Every element on the array is a {@link ngSharePoint.SPContentType SPContentType} object.
         *
         * @example
         * <pre>
         *   list.getContentTypes().then(function() {
         *
         *     // ContentTypes property are set in the list object
         *     list.ContentTypes.forEach(function(ct) {
         *       console.log(ct.Name);
         *     });
         *   });
         * </pre>
         *
        */
        SPListObj.prototype.getContentTypes = function() {

            var self = this;
            var def = $q.defer();

            if (this.ContentTypes !== void 0) {

                def.resolve(this.ContentTypes);

            } else {

                var executor = new SP.RequestExecutor(self.web.url);

                // We don't cache the content types due to that the user can
                // change its order (the default content type) anytime.

                executor.executeAsync({

                    url: self.apiUrl + '/ContentTypes',
                    method: 'GET',
                    headers: {
                        "Accept": "application/json; odata=verbose"
                    },

                    success: function(data) {

                        var d = utils.parseSPResponse(data);
                        var contentTypes = [];

                        angular.forEach(d, function(contentType) {

                            contentTypes.push(new SPContentType(self, contentType.StringId, contentType));

                        });

                        self.ContentTypes = contentTypes;

                        def.resolve(contentTypes);

                    },

                    error: function(data, errorCode, errorMessage) {

                        var err = utils.parseError({
                            data: data,
                            errorCode: errorCode,
                            errorMessage: errorMessage
                        });

                        def.reject(err);
                    }
                });
            }

            return def.promise;

        }; // getContentTypes



        /**
         * @ngdoc function
         * @name ngSharePoint.SPList#getContentType
         * @methodOf ngSharePoint.SPList
         *
         * @description
         * Gets a specified content type by his Id or name.
         *
         * Internally, this method makes a call to {@link ngSharePoint.SPList#getContentTypes getContentTypes} method.
         *
         * @param {string=} Id|name The Id or the name of the content type to be retrieved. If this parameter is not
         * specified, the method returns the default content type.
         * @returns {promise} promise with the {@link ngSharePoint.SPContentType SPContentType} object.
         *
         * @example
         * This example retrieves the associated Issue content type and logs all his field titles
         * <pre>
         *   list.getContentType('Issue').then(function(issueCt) {
         *
         *     angular.forEach(issueCt.Fields, function(field) {
         *       console.log(field.Title);
         *     });
         *
         *   });
         * </pre>
         *
        */
        SPListObj.prototype.getContentType = function(contentTypeId) {

            var self = this;
            var def = $q.defer();

            self.getContentTypes().then(function() {

                var contentType = self.ContentTypes[0]; //-> Default content type

                angular.forEach(self.ContentTypes, function(ct) {

                    if (ct.StringId === contentTypeId) {

                        contentType = ct;

                    }

                    if (ct.Name === contentTypeId) {

                        contentType = ct;
                    }

                });


                def.resolve(contentType);

            });


            return def.promise;

        }; // getContentType




        /**
         * @ngdoc function
         * @name ngSharePoint.SPList#getRootFolder
         * @methodOf ngSharePoint.SPList
         *
         * @description
         * This method to gets a reference to the root folder of the list.
         *
         * @returns {promise} promise with a {@link ngSharePoint.SPFolder SPFolder} object corresponding
         * to root folder.
         *
         * @example
         * This example retrieves the root folder of a document library to add a new file
         * <pre>
         *   docLibrary.getRootFolder().then(function(folder) {
         *
         *     folder.addFile(...).then(function() {
         *        . . .
         *     });
         *
         *   });
         * </pre>
         *
        */
        SPListObj.prototype.getRootFolder = function() {

            var self = this;
            var def = $q.defer();

            if (this.RootFolder !== void 0) {

                def.resolve(this.RootFolder);

            } else {

                var executor = new SP.RequestExecutor(self.web.url);

                executor.executeAsync({

                    url: self.apiUrl + '/RootFolder',
                    method: 'GET',
                    headers: {
                        "Accept": "application/json; odata=verbose"
                    },

                    success: function(data) {

                        var d = utils.parseSPResponse(data);
                        this.RootFolder = new SPFolder(self.web, d.ServerRelativeUrl, d);
                        this.RootFolder.List = self;

                        def.resolve(this.RootFolder);
                    },

                    error: function(data, errorCode, errorMessage) {

                        var err = utils.parseError({
                            data: data,
                            errorCode: errorCode,
                            errorMessage: errorMessage
                        });

                        def.reject(err);
                    }
                });
            }

            return def.promise;

        }; // getRootFolder




        /**
         * @ngdoc function
         * @name ngSharePoint.SPList#getWorkflowAssociationByName
         * @methodOf ngSharePoint.SPList
         *
         * @description
         * This method search by name a list associated workflow and returns an object with its information.
         * The method only find for enabled workflows.
         *
         * @param {string} workflowName The name of the workflow to be retrieved.
         * @returns {promise} promise with a object corresponding to the associated workflow
         *
         * @example
         * This example retrieves one associated workflow
         * <pre>
         *   list.getWorkflowAssociatedByName('Open project').then(function(workflowInfo) {
         *
         *      console.log(workflowInfo);
         *      . . .
         *
         *   });
         * </pre>
         *
        */
        SPListObj.prototype.getWorkflowAssociationByName = function(workflowName) {

            var self = this;
            var def = $q.defer();

            var executor = new SP.RequestExecutor(self.web.url);

            var params = utils.parseQuery({
                $filter: "enabled eq true and Name eq '" + workflowName + "'"
            });

            executor.executeAsync({

                url: self.apiUrl + '/WorkflowAssociations' + params,
                method: 'GET',
                headers: {
                    "Accept": "application/json; odata=verbose"
                },

                success: function(data) {

                    var d = utils.parseSPResponse(data);
                    if (d.length > 0) {
                        def.resolve(d[0]);
                    } else {
                        def.resolve(undefined);
                    }
                },

                error: function(data, errorCode, errorMessage) {

                    var err = utils.parseError({
                        data: data,
                        errorCode: errorCode,
                        errorMessage: errorMessage
                    });

                    def.reject(err);
                }
            });

            return def.promise;

        };  // getWorkflowAssociationByName




        /**
         * @ngdoc function
         * @name ngSharePoint.SPList#getListItems
         * @methodOf ngSharePoint.SPList
         *
         * @description
         * Use this method to retrieve a collection of items of the list.
         *
         * The method have a `query` parameter that allows you to specify the selection, filters
         * and order options for the data you request from the server.
         * All valid OData options implemented by the SharePoint REST api are accepted.
         *
         * Go to {@link https://msdn.microsoft.com/en-us/library/office/fp142385(v=office.15).aspx SharePoint documentation} for 
         * more information about the OData query oprations in SharePoint REST api
         *
         * By default, this method expands the next properties:
         * * ContentType
         * * File
         * * File/ParentFolder
         * * Folder
         * * Folder/ParentFolder
         * 
         * @param {object=} query A object with all the query options used to retrieve list items.
         *
         * It's possible to specify different query options:
         * <pre>
         *     var query = {
         *          // Use the $filter query option to select
         *          // which items to return
         *          $filter: "filter expression",
         *          // Use $top to indicate the number of items
         *          // to be retrieved (for pagination prouposes)
         *          $top: nn,
         *          // User $orderby to specify how to sort the
         *          // items in your query return set
         *          $orderby: "field1 asc,field2 desc,...",
         *          // to gets additional information of other
         *          // lookup fields
         *          $expand: "field1,field2,..."
         *     };
         *     someList.getListItems(query).then(...);
         * </pre>
         * @param {boolean=} resetPagination With this param you can specify if you want to continue the 
         * previously query and retrieve the next set of items or wants to reset the counter and start a completly new query.
         * 
         * By default SharePoint returns sets of 100 items from the server. You can modify this value with the param `$top`
         * 
         * @returns {promise} promise with a collection of {@link ngSharePoint.SPListItem SPListItem} elements
         * retrieved from the server
         *
         * @example
         * This example retrieves the list of "Closed" projects in a list ordereds by close date
         * <pre>
         *   list.getListItems({
         *
         *      $filter: "ProjectStatus eq 'Closed'",
         *      $orderby: "ClosedDate desc"
         *
         *   }).then(function(listItems) {
         *
         *      console.log(listItems);
         *
         *   });
         * </pre>
         *
         * Supose that you have a list of announcements categorized by department. A `Department` field
         * is a lookup to the "departments" lists and do you want to query the annuncements of the "RRHH" deparment.
         *
         * If you know the ID of the RRHH item in the "departments" list (ex: 2), you would do this query:
         * <pre>
         *      announcementsList.getListItems({ $filter: "Department eq 2"}).then(...);
         * </pre>
         *
         * But if you doesn't knows the ID and wants to make the query by its title, you should to expand 
         * the lookup column, select the desired related column and filter the result set.
         * The query will be similar to this:
         *
         * <pre>
         *      announcementsList.getListItems({
         *
         *          $expand: "Department",
         *          $select: "Department/Title,*",
         *          $filter: "Department/Title eq 'RRHH'"
         *
         *      }).then(...);
         * </pre>
         *
        */
        SPListObj.prototype.getListItems = function(query, resetPagination) {

            var self = this;
            var def = $q.defer();
            var executor = new SP.RequestExecutor(self.web.url);
            var defaultExpandProperties = 'ContentType,File,File/ParentFolder,Folder,Folder/ParentFolder';
            var urlParams = '';

            if (this.$skiptoken !== void 0 && !resetPagination) {

                urlParams = '?' + this.$skiptoken;

            } else {

                if (query) {
                    query.$expand = defaultExpandProperties + (query.$expand ? ', ' + query.$expand : '');
                } else {
                    query = {
                        $expand: defaultExpandProperties
                    };
                }

                urlParams = utils.parseQuery(query);
            }

            executor.executeAsync({

                url: self.apiUrl + '/Items' + urlParams,
                method: 'GET',
                headers: {
                    "Accept": "application/json; odata=verbose"
                },

                success: function(data) {
                    var d = utils.parseSPResponse(data);
                    var items = [];

                    angular.forEach(d, function(item) {

                        if (item.File !== undefined && item.File.__deferred === undefined) {
                            var newFile = SPObjectProvider.getSPFile(self.web, item.File.ServerRelativeUrl, item.File);
                            newFile.List = self;
                            item.File = newFile;
                        }
                        if (item.Folder !== undefined && item.Folder.__deferred === undefined) {
                            var newFolder = SPObjectProvider.getSPFolder(self.web, item.Folder.ServerRelativeUrl, item.Folder);
                            newFolder.List = self;
                            item.Folder = newFolder;
                        }

                        var spListItem = new SPListItem(self, item);
                        items.push(spListItem);
                    });

                    // If pagination is present, save for futher function calls
                    if (data.statusCode != 204 && data.body) {

                        var responseBody = angular.fromJson(data.body || '{ "d": {} }').d;

                        if (responseBody.__next) {
                            self.$skiptoken = '$' + responseBody.__next.substring(responseBody.__next.indexOf('skiptoken'));
                        }
                    }

                    // Returns an array of initialized 'SPListItem' objects.
                    def.resolve(items);

                },

                error: function(data, errorCode, errorMessage) {

                    var err = utils.parseError({
                        data: data,
                        errorCode: errorCode,
                        errorMessage: errorMessage
                    });

                    def.reject(err);
                }
            });

            return def.promise;

        }; // getListItems




        /**
         * @ngdoc function
         * @name ngSharePoint.SPList#getItemById
         * @methodOf ngSharePoint.SPList
         *
         * @description
         * This method gets a specified list item.
         *
         * @param {integer} Id The Id of the item to be retrieved.
         * @param {string} expandProperties Comma separed values with the properties to expand
         * in the REST query
         * @returns {promise} promise with a object of type {@link ngSharePoint.SPListItem SPListItem} corresponding
         * with the element retrieved
         *
         * @example
         * This example retrieves the item specified by the query string over the contextual list.
         * This assumes that this code is executed in a form page
         * <pre>
         *      var itemId = utils.getQueryStringParamByName('ID');
         *
         *      SharePoint.getCurrentWeb().then(function(web) {
         *
         *          web.getList(_spPageContextInfo.pageListId).then(function(list) {
         *
         *              list.getItemById(itemId).then(function(item) {
         *
         *                  $scope.currentItem = item;
         *
         *              });
         *          });
         *
         *      });
         *
         * </pre>
         *
        */
        SPListObj.prototype.getItemById = function(id, expandProperties) {

            var self = this;
            var def = $q.defer();
            var executor = new SP.RequestExecutor(self.web.url);
            var defaultExpandProperties = 'ContentType,File,File/ParentFolder,Folder,Folder/ParentFolder';
            var query = {
                $expand: defaultExpandProperties + (expandProperties ? ', ' + expandProperties : '')
            };

            executor.executeAsync({

                url: self.apiUrl + '/getItemById(' + id + ')' + utils.parseQuery(query),
                method: 'GET',
                headers: {
                    "Accept": "application/json; odata=verbose"
                },

                success: function(data) {

                    var d = utils.parseSPResponse(data);

                    if (d.File !== undefined && d.File.__deferred === undefined) {
                        var newFile = SPObjectProvider.getSPFile(self.web, d.File.ServerRelativeUrl, d.File);
                        newFile.List = self;
                        d.File = newFile;
                    }
                    if (d.Folder !== undefined && d.Folder.__deferred === undefined) {
                        var newFolder = SPObjectProvider.getSPFolder(self.web, d.Folder.ServerRelativeUrl, d.Folder);
                        newFolder.List = self;
                        d.Folder = newFolder;
                    }

                    var spListItem = new SPListItem(self, d);
                    def.resolve(spListItem);
                },

                error: function(data, errorCode, errorMessage) {

                    var err = utils.parseError({
                        data: data,
                        errorCode: errorCode,
                        errorMessage: errorMessage
                    });

                    def.reject(err);
                }
            });

            return def.promise;

        }; // getItemById




        /**
         * @ngdoc function
         * @name ngSharePoint.SPList#getItemProperty
         * @methodOf ngSharePoint.SPList
         *
         * @description
         * This method gets a specified related item property from the list.
         *
         * @param {integer} Id The Id of the item.
         * @param {string} query The REST query after '.../getItemById(<id>)/'
         *
         * @returns {promise} promise with the value of the property. Can be a primary value like a string or
         * an integer or can be a complex value like a item. It depends of the query specified.
         *
         * @example
         * With this method you can obtain related information of a item. You can specify simple expressions
         * or other more sophisticated. The next examples show how you can use it.
         *
         * <pre>
         *   // This returns the name of the author (string)
         *   list.getItemProperty(id, 'Created/Name').then(...);        
         *
         *   // This returns the title of the department (string)
         *   list.getItemProperty(id, 'Department/Title').then(...)     
         *
         *   // This returns the manager of the department (item)
         *   list.getItemProperty(id, 'Department/Manager').then(...)   
         *
         *   // This returns the EMail of the manager's department of the 
         *   // user who was created the item
         *   list.getItemProperty(id, 'Created/Department/Manager/EMail');  
         * </pre>
         *
        */
        SPListObj.prototype.getItemProperty = function(id, query) {

            var self = this;
            var def = $q.defer();
            var executor = new SP.RequestExecutor(self.web.url);

            executor.executeAsync({

                url: self.apiUrl + '/getItemById(' + id + ')/' + query.ltrim('/'),
                method: 'GET',
                headers: {
                    "Accept": "application/json; odata=verbose"
                },

                success: function(data) {

                    var d = utils.parseSPResponse(data);
                    def.resolve(d);
                },

                error: function(data, errorCode, errorMessage) {

                    var err = utils.parseError({
                        data: data,
                        errorCode: errorCode,
                        errorMessage: errorMessage
                    });

                    def.reject(err);
                }
            });

            return def.promise;

        }; // getItemProperty




        /**
         * @ngdoc function
         * @name ngSharePoint.SPList#getDefaultViewUrl
         * @methodOf ngSharePoint.SPList
         *
         * @description
         * Use this method to obtain the default view URL of the list.
         *
         * **Note** This method uses JSOM for retrieve this URL because there aren't
         * any RES API call that returns this value.
         *
         * @returns {promise} promise with the url.
         *
        */
        SPListObj.prototype.getDefaultViewUrl = function() {

            var self = this;
            var def = $q.defer();

            if (this.defaultViewUrl !== void 0) {

                def.resolve(this.defaultViewUrl);
                return def.promise;
            }

            var listGuid = self.Id;

            self.context = new SP.ClientContext(self.web.url);
            var web = self.context.get_web();

            if (self.Id !== void 0) {
                self._list = web.get_lists().getById(self.Id);
            } else {
                self._list = web.get_lists().getByTitle(self.listName);
            }

            self.context.load(self._list, 'DefaultViewUrl');

            self.context.executeQueryAsync(function() {


                self.defaultViewUrl = self._list.get_defaultViewUrl();
                def.resolve(self.defaultViewUrl);


            }, function(sender, args) {

                var err = {
                    Code: args.get_errorCode(),
                    Details: args.get_errorDetails(),
                    TypeName: args.get_errorTypeName(),
                    Value: args.get_errorValue(),
                    message: args.get_message(),
                    request: args.get_request(),
                    stackTrace: args.get_stackTrace()
                };

                def.reject(err);

            });

            return def.promise;

        };   // getDefaultViewUrl




        /**
         * @ngdoc function
         * @name ngSharePoint.SPList#getDefaultEditFormUrl
         * @methodOf ngSharePoint.SPList
         *
         * @description
         * Use this method to obtain the URL of the default edit form.
         *
         * **Note** This method uses JSOM for retrieve this URL because there aren't
         * any RES API call that returns this value.
         *
         * @returns {promise} promise with the url.
         *
        */
        SPListObj.prototype.getDefaultEditFormUrl = function() {

            var self = this;
            var def = $q.defer();

            if (this.defaultEditFormUrl !== void 0) {

                def.resolve(this.defaultEditFormUrl);
                return def.promise;
            }

            var listGuid = self.Id;

            self.context = new SP.ClientContext(self.web.url);
            var web = self.context.get_web();

            if (self.Id !== void 0) {
                self._list = web.get_lists().getById(self.Id);
            } else {
                self._list = web.get_lists().getByTitle(self.listName);
            }

            self.context.load(self._list, 'DefaultEditFormUrl');

            self.context.executeQueryAsync(function() {


                self.defaultEditFormUrl = self._list.get_defaultEditFormUrl();
                def.resolve(self.defaultEditFormUrl);


            }, function(sender, args) {

                var err = {
                    Code: args.get_errorCode(),
                    Details: args.get_errorDetails(),
                    TypeName: args.get_errorTypeName(),
                    Value: args.get_errorValue(),
                    message: args.get_message(),
                    request: args.get_request(),
                    stackTrace: args.get_stackTrace()
                };

                def.reject(err);

            });

            return def.promise;

        };   // getDefaultEditFormUrl




        /**
         * @ngdoc function
         * @name ngSharePoint.SPList#getDefaultDisplayFormUrl
         * @methodOf ngSharePoint.SPList
         *
         * @description
         * Use this method to obtain the URL of the default display form.
         *
         * **Note** This method uses JSOM for retrieve this URL because there aren't
         * any RES API call that returns this value.
         *
         * @returns {promise} promise with the url.
         *
        */
        SPListObj.prototype.getDefaultDisplayFormUrl = function() {

            var self = this;
            var def = $q.defer();

            if (this.defaultDisplayFormUrl !== void 0) {

                def.resolve(this.defaultDisplayFormUrl);
                return def.promise;
            }

            var listGuid = self.Id;

            self.context = new SP.ClientContext(self.web.url);
            var web = self.context.get_web();

            if (self.Id !== void 0) {
                self._list = web.get_lists().getById(self.Id);
            } else {
                self._list = web.get_lists().getByTitle(self.listName);
            }

            self.context.load(self._list, 'DefaultDisplayFormUrl');

            self.context.executeQueryAsync(function() {


                self.defaultDisplayFormUrl = self._list.get_defaultDisplayFormUrl();
                def.resolve(self.defaultDisplayFormUrl);


            }, function(sender, args) {

                var err = {
                    Code: args.get_errorCode(),
                    Details: args.get_errorDetails(),
                    TypeName: args.get_errorTypeName(),
                    Value: args.get_errorValue(),
                    message: args.get_message(),
                    request: args.get_request(),
                    stackTrace: args.get_stackTrace()
                };

                def.reject(err);

            });

            return def.promise;

        };   // getDefaultDisplayFormUrl




        /**
         * @ngdoc function
         * @name ngSharePoint.SPList#getDefaultNewFormUrl
         * @methodOf ngSharePoint.SPList
         *
         * @description
         * Use this method to obtain the URL of the default new form.
         *
         * **Note** This method uses JSOM for retrieve this URL because there aren't
         * any RES API call that returns this value.
         *
         * @returns {promise} promise with the url.
         *
        */
        SPListObj.prototype.getDefaultNewFormUrl = function() {

            var self = this;
            var def = $q.defer();

            if (this.defaultNewFormUrl !== void 0) {

                def.resolve(this.defaultNewFormUrl);
                return def.promise;
            }

            var listGuid = self.Id;

            self.context = new SP.ClientContext(self.web.url);
            var web = self.context.get_web();

            if (self.Id !== void 0) {
                self._list = web.get_lists().getById(self.Id);
            } else {
                self._list = web.get_lists().getByTitle(self.listName);
            }

            self.context.load(self._list, 'DefaultNewFormUrl');

            self.context.executeQueryAsync(function() {


                self.defaultNewFormUrl = self._list.get_defaultNewFormUrl();
                def.resolve(self.defaultNewFormUrl);


            }, function(sender, args) {

                var err = {
                    Code: args.get_errorCode(),
                    Details: args.get_errorDetails(),
                    TypeName: args.get_errorTypeName(),
                    Value: args.get_errorValue(),
                    message: args.get_message(),
                    request: args.get_request(),
                    stackTrace: args.get_stackTrace()
                };

                def.reject(err);

            });

            return def.promise;

        };   // getDefaultNewFormUrl



        /**
         * Creates an item in the list
         * This method is obsolete. Use the SPListItem.save method.
         */
        SPListObj.prototype.createItem = function(properties) {

            var self = this;
            var def = $q.defer();


            self.getListItemEntityTypeFullName().then(function(listItemEntityTypeFullName) {

                var executor = new SP.RequestExecutor(self.web.url);


                // Set the contents for the REST API call.
                // ----------------------------------------------------------------------------
                var body = {
                    __metadata: {
                        type: listItemEntityTypeFullName
                    }
                };

                angular.extend(body, properties);


                // Set the headers for the REST API call.
                // ----------------------------------------------------------------------------
                var headers = {
                    "Accept": "application/json; odata=verbose",
                    "content-type": "application/json;odata=verbose"
                };

                var requestDigest = document.getElementById('__REQUESTDIGEST');
                // Remote apps that use OAuth can get the form digest value from the http://<site url>/_api/contextinfo endpoint.
                // SharePoint-hosted apps can get the value from the #__REQUESTDIGEST page control if it's available on the SharePoint page.

                if (requestDigest !== null) {
                    headers['X-RequestDigest'] = requestDigest.value;
                }


                // Make the call.
                // ----------------------------------------------------------------------------
                executor.executeAsync({

                    url: self.apiUrl + '/items',
                    method: 'POST',
                    body: angular.toJson(body),
                    headers: headers,

                    success: function(data) {

                        var d = utils.parseSPResponse(data);

                        def.resolve(d);
                    },

                    error: function(data, errorCode, errorMessage) {

                        var err = utils.parseError({
                            data: data,
                            errorCode: errorCode,
                            errorMessage: errorMessage
                        });

                        def.reject(err);
                    }
                });

            });


            return def.promise;

        }; // createItem



        /**
         * Updates a specific item in the list
         * This method is obsolete. Use the SPListItem.save method.
         */
        SPListObj.prototype.updateItem = function(id, properties) {

            var self = this;
            var def = $q.defer();


            self.getListItemEntityTypeFullName().then(function(listItemEntityTypeFullName) {

                var executor = new SP.RequestExecutor(self.web.url);


                // Set the contents for the REST API call.
                // ----------------------------------------------------------------------------
                var body = {
                    __metadata: {
                        type: listItemEntityTypeFullName
                    }
                };

                angular.extend(body, properties);


                // Set the headers for the REST API call.
                // ----------------------------------------------------------------------------
                var headers = {
                    "Accept": "application/json; odata=verbose",
                    "content-type": "application/json;odata=verbose",
                    "X-HTTP-Method": "MERGE",
                    "IF-MATCH": "*" // Overwrite any changes in the item.
                                    // Use 'item.__metadata.etag' to provide a way to verify that the object being changed has not been changed since it was last retrieved.
                };

                var requestDigest = document.getElementById('__REQUESTDIGEST');

                if (requestDigest !== null) {
                    headers['X-RequestDigest'] = requestDigest.value;
                }


                // Make the call.
                // ----------------------------------------------------------------------------
                executor.executeAsync({

                    url: self.apiUrl + '/items(' + id + ')',
                    method: 'POST',
                    body: angular.toJson(body),
                    headers: headers,

                    success: function(data) {

                        var d = utils.parseSPResponse(data);

                        def.resolve(d);
                    },

                    error: function(data, errorCode, errorMessage) {

                        var err = utils.parseError({
                            data: data,
                            errorCode: errorCode,
                            errorMessage: errorMessage
                        });

                        def.reject(err);
                    }
                });

            });


            return def.promise;

        }; // updateItem



        /**
         * Removes an item in the list
         * This method is obsolete. Use the SPListItem.remove method.
         */
        SPListObj.prototype.deleteItem = function(id) {

            var self = this;
            var def = $q.defer();
            var executor = new SP.RequestExecutor(self.web.url);


            // Set the headers for the REST API call.
            // ----------------------------------------------------------------------------
            var headers = {
                "Accept": "application/json; odata=verbose",
                "X-HTTP-Method": "DELETE",
                "IF-MATCH": "*"
            };

            var requestDigest = document.getElementById('__REQUESTDIGEST');

            if (requestDigest !== null) {
                headers['X-RequestDigest'] = requestDigest.value;
            }


            // Make the call.
            // ----------------------------------------------------------------------------
            executor.executeAsync({

                url: self.apiUrl + '/items(' + id + ')',
                method: 'POST',
                headers: headers,

                success: function(data) {

                    var d = utils.parseSPResponse(data);

                    def.resolve(d);
                },

                error: function(data, errorCode, errorMessage) {

                    var err = utils.parseError({
                        data: data,
                        errorCode: errorCode,
                        errorMessage: errorMessage
                    });

                    def.reject(err);
                }
            });


            return def.promise;

        }; // deleteItem



        // Returns the SPListObj class
        return SPListObj;

    }
]);
