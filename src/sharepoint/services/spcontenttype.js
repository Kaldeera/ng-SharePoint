/**
 * @ngdoc object
 * @name ngSharePoint.SPContentType
 *
 * @description
 * SPContentType factory provides access to all content types (web or list). This factory allows 
 * retrieval of associated fields. It also, allows to get and set `jsLink` properties.
 *
 * *At the moment, not all SharePoint API methods for content type objects are implemented in ngSharePoint*
 *
 */


angular.module('ngSharePoint').factory('SPContentType', 

    ['$q', 'SPCache', 'SPFolder', 'SPListItem', 

    function SPContentType_Factory($q, SPCache, SPFolder, SPListItem) {

        'use strict';


        /**
         * @ngdoc function
         * @name ngSharePoint.SPContentType#constructor
         * @constructor
         * @methodOf ngSharePoint.SPContentType
         *
         * @description
         * Instantiates a new `SPContentType` object for a specific web or list content type in the server.
         * It's possible to specify their properties.
         *
         * @param {object} parentObject A valid {@link ngSharePoint.SPWeb SPWeb} or {@link ngSharePoint.SPList SPList} object where the content type is associated.
         * @param {string} id Content type ID.
         * @param {object} contentTypeProperties Properties to initialize the object
         *
         * @example
         * Use {@link ngSharePoint.SPList#getContentType SPList.getContentType} and {@link ngSharePoint.SPList#getContentTypes SPList.getContentTypes} to 
         * retrieve instances of the associated content types.
         *
         * <pre>
         *   list.getContentType('Issue').then(function(issueCt) {
         *
         *     issueCt.getFields().then(function() {
         *
         *          angular.forEach(issueCt.Fields, function(field) {
         *              console.log(field.Title);
         *          });
         *
         *     });
         *   });
         * </pre>
         *
         */
        var SPContentTypeObj = function(parentObject, id, contentTypeProperties) {

            if (parentObject === void 0) {
                throw '@parentObject parameter not specified in SPContentType constructor.';
            }

            if (id === void 0) {
                throw '@id parameter not specified in SPContentType constructor.';
            }


            // Sets the content type 'id'.
            this.id = id;

            // Sets the content type parent object
            this.__parent = parentObject;

            // Initializes the SharePoint API REST url for the ContentType.
            this.apiUrl = this.__parent.apiUrl + '/ContentTypes(\'' + this.id + '\')';

            // Gets the content type fields (Schema) from the cache if exists.
            this.Fields = SPCache.getCacheValue('SPContentTypeFieldsCache', this.apiUrl);

            // Init the content type properties (if exists)
            if (contentTypeProperties !== void 0) {

                if (contentTypeProperties.Fields !== void 0 && contentTypeProperties.Fields.results !== void 0) {

                    // process fields --> $expand: 'Fields'

                    var fields = {};

                    angular.forEach(contentTypeProperties.Fields.results, function(field) {
                        fields[field.InternalName] = field;
                    });

                    contentTypeProperties.Fields = fields;
                }

                utils.cleanDeferredProperties(contentTypeProperties);
                angular.extend(this, contentTypeProperties);
            }
        };




        /**
         * @ngdoc function
         * @name ngSharePoint.SPContentType#getFields
         * @methodOf ngSharePoint.SPContentType
         *
         * @description
         * This method retrieves the Fields collection of the content type and creates a new object property
         * called "Fields" that contains a named property for every field.
         *
         * After a call to this method, the schema of every field is available in the content type and all
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
         * definitions of any SharePoint content type.
         *
         * *Note*: The list of fields of the list isn't necessaray equal to the item content type.
         *
         * @returns {promise} promise with an object that contains all of the fields schema
         *
         * @example
         * <pre>
         *   // a pre-initialized "ct" object ...
         *   ct.getFields().then(function() {
         *
         *       // at this point, you have access to the definition of any content type field
         *       console.log(ct.Fields.Title.DefaultValue);
         *       // this returns '' or any defined value
         *
         *       console.log(ct.Fields.DueDate.Required);                 
         *       // this returns true or false
         *
         *       console.log(ct.Fields.Editor.ReadOnlyField);
         *       // this returns true
         *
         *       console.log(ct.Fields.ProjectStatus.Choices.results);
         *       // this returns an array with available choices ['Open', 'Closed', 'Draft']
         *   });
         *
         * </pre>
         *
         */
        SPContentTypeObj.prototype.getFields = function() {

            var self = this;
            var def = $q.defer();

            if (this.Fields !== void 0) {

                def.resolve(this.Fields);

            } else {

                var executor = new SP.RequestExecutor('/');

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
                        SPCache.setCacheValue('SPContentTypeFieldsCache', self.apiUrl, fields);

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
        * Modify the ´jsLinkUrl` property of the content type.
        * *Internal use*
        */
        SPContentTypeObj.prototype.setJSLink = function(jsLinkUrl) {

            var self = this;
            var deferred = $q.defer();

            var url;

            if (self.__parent.url) {
                url = self.__parent.url;
            }

            if (url === void 0 && self.__parent.web) {

                url = self.__parent.web.url;
            }

            var ctx;

            if (url === void 0) {

                ctx = SP.ClientContext.get_current();
            } else {

                ctx = new SP.ClientContext(url);
            }
            
            var web = ctx.get_web();
            var list = web.get_lists().getByTitle(self.__parent.Title);
            var contentTypes = list.get_contentTypes();
            var ct = contentTypes.getById(self.id);

            ct.set_jsLink(jsLinkUrl);
            ct.update();

            ctx.executeQueryAsync(function() {

                deferred.resolve(ct);

            }, function(sender, args) {

                deferred.reject({ sender: sender, args: args });

            });


            return deferred.promise;

        }; // setJSLink



        /**
        * Retrieves the ´jsLinkUrl` property of the content type.
        * *Internal use*
        */
        SPContentTypeObj.prototype.getJSLink = function() {

            var self = this;
            var def = $q.defer();
            var executor = new SP.RequestExecutor('/');

            executor.executeAsync({

                url: self.apiUrl + "/jsLink",
                method: "GET",
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

        }; // getJSLink



        // Returns the SPContentTypeObj class
        return SPContentTypeObj;

    }
]);
