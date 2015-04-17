/**
 * @ngdoc object
 * @name ngSharePoint.SPList
 *
 * @description
 * Represents a SPList object that you could use to access to all SharePoint list properties and data.
 *
 * You can create new SPList objects or use a {@link ngSharePoint.SPWeb SPWeb} object to get SPList object instances.
 *
 * *At this moment, not all SharePoint API methods for list objects are implementeds in ngSharePoint*
 *
 */


angular.module('ngSharePoint').factory('SPList', 

    ['$q', 'SPCache', 'SPFolder', 'SPListItem', 'SPContentType', 'SPObjectProvider', 

    function SPList_Factory($q, SPCache, SPFolder, SPListItem, SPContentType, SPObjectProvider) {

        'use strict';


        // ****************************************************************************
        // SPList constructor
        //
        // @web: SPWeb instance that contains the list in SharePoint.
        // @listName: Name or Guid of the list you want to instantiate.
        //
        /**
         * @ngdoc function
         * @name ngSharePoint.SPList#constructor
         * @constructor
         * @methodOf ngSharePoint.SPList
         * 
         * @description
         * Instantiates a new SPList object that points to a specific SharePoint list. With this
         * list instance you could access to their properties and get list items.
         * 
         * @param {SPWeb} web A valid {@link ngSharePoint.SPWeb SPWeb} object where the list is located
         * @param {string} listId|listName List id or list name.

         * You can specify "UserInfoList" to refer the system list with all site users.
         * @param {object} listProperties Properties to initialize the object
         * 
         * @example
         * <pre>
         * new SPList(web, 'Shared documents').then(function(docs) {
         *   // ... do something with the docs object
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



        // ****************************************************************************
        // getListItemEntityTypeFullName
        //
        // Gets the 'ListItemEntityTypeFullName' for the list and attach to 'this' object.
        // This property is needed for CRUD operations.
        //
        // @returns: Promise with the result of the REST query.
        //
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



        // ****************************************************************************
        // getProperties
        //
        // Gets list properties and attach it to 'this' object.
        //
        // http://msdn.microsoft.com/es-es/library/office/jj164022(v=office.15).aspx
        // @returns: Promise with the result of the REST query.
        //
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





        // ****************************************************************************
        // updateProperties
        //
        // Updates the list properties
        //
        // @properties: Object with the properties to update.
        // @returns: Promise with the result of the REST query.
        //
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




        // ****************************************************************************
        // getFields
        //
        // Gets list fields
        //
        // @returns: Promise with the result of the REST query.
        //
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




        // ****************************************************************************
        // getContentTypes
        //
        // Gets the list content types
        //
        // @returns: Promise with the result of the REST query.
        //
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




        // ****************************************************************************
        // getContentType
        //
        // Gets a list content type by its ID.
        //
        // @contentTypeId: The ID of the content type to retrieve if this parameter is
        // undefined, the function returns the default content type.
        // @returns: Promise with the result of the REST query.
        //
        SPListObj.prototype.getContentType = function(contentTypeId) {

            var self = this;
            var def = $q.defer();

            self.getContentTypes().then(function() {

                var contentType = self.ContentTypes[0]; //-> Default content type

                angular.forEach(self.ContentTypes, function(ct) {

                    if (ct.Id === contentTypeId) {

                        contentType = ct;

                    }

                });


                def.resolve(contentType);

            });


            return def.promise;

        }; // getContentType




        // ****************************************************************************
        // getSchema
        //
        // Gets list content type fields
        //
        // @returns: Promise with the result of the REST query.
        //
        SPListObj.prototype.getSchema = function(contentTypeId) {

            return this.getContentType().then(function(defaultContentType) {

                return defaultContentType.getFields();

            });

        }; // getSchema



        // ****************************************************************************
        // getRootFolder
        //
        // Gets root folder
        //
        // @returns: Promise with the result of the REST query.
        //
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



        // ****************************************************************************
        // getSchema
        //
        // Gets list content type fields
        //
        // @returns: Promise with the result of the REST query.
        //
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

        };  // getWorkflowAssociationByName


        // ****************************************************************************
        // getListItems
        //
        // Gets the list items
        //
        // @query: An object with REST query options.
        //         References:
        //              http://msdn.microsoft.com/en-us/library/office/fp142385(v=office.15).aspx
        //              http://msdn.microsoft.com/en-us/library/office/dn292552(v=office.15).aspx
        //              http://msdn.microsoft.com/en-us/library/office/dn292553(v=office.15).aspx
        // @returns: Promise with the result of the REST query.
        //
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



        // ****************************************************************************
        // getItemById
        //
        // Gets an item from the list by its ID. 
        //
        // @id: {Counter} The id of the item.
        // @expandProperties: {String} Comma separated values with the properties to 
        //                    expand in the REST query.
        // @returns: Promise with the result of the REST query.
        //
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



        // ****************************************************************************
        // getItemQueryById
        //
        // Gets an item property value from the list by item ID. 
        //
        // @id: {Counter} The id of the item.
        // @query: {String} The REST query after '.../getItemById(<id>)/'
        //         e.g. If query parameter equals to 'Author/Name'
        //              the final query will be '.../getItemById(<id>)/Author/Name'
        //              and will return the 'Name' of the 'Author' of the item.
        // @returns: Promise with the result of the REST query.
        //
        SPListObj.prototype.getItemQueryById = function(id, query) {

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

        }; // getItemById



        // ****************************************************************************
        // getDefaultViewUrl
        //
        // Gets the default edit form url
        // @returns: Promise with the result of the REST query.
        //
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


        // ****************************************************************************
        // getDefaultEditFormUrl
        //
        // Gets the default edit form url
        // @returns: Promise with the result of the REST query.
        //
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


        // ****************************************************************************
        // getDefaultDisplayFormUrl
        //
        // Gets the default edit form url
        // @returns: Promise with the result of the REST query.
        //
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



        // ****************************************************************************
        // getDefaultNewFormUrl
        //
        // Gets the default edit form url
        // @returns: Promise with the result of the REST query.
        //
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



        // ****************************************************************************
        // createItem
        //
        // Creates an item in the list. 
        //
        // @returns: Promise with the result of the REST query.
        //
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



        // ****************************************************************************
        // updateItem
        //
        // Creates an item in the list. 
        //
        // @id: {counter} The ID of the item to update.
        // @properties: {Object} The item properties to update.
        // @returns: Promise with the result of the REST query.
        //
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



        // ****************************************************************************
        // deleteItem
        //
        // Removes an item from the list.
        //
        // @id: {counter} The ID of the item to delete.
        // @returns: Promise with the result of the REST query.
        //
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
