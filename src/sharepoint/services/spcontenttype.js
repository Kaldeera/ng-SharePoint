/*
    SPContentType - factory
    
    Pau Codina (pau.codina@kaldeera.com)
    Pedro Castro (pedro.castro@kaldeera.com, pedro.cm@gmail.com)

    Copyright (c) 2014
    Licensed under the MIT License
*/



///////////////////////////////////////
//  SPList
///////////////////////////////////////

angular.module('ngSharePoint').factory('SPContentType', 

    ['$q', 'SPCache', 'SPFolder', 'SPListItem', 

    function SPContentType_Factory($q, SPCache, SPFolder, SPListItem) {

        'use strict';


        // ****************************************************************************
        // SPContentType constructor
        //
        // @parentObject: The object instance of the content type parent.
        // @id: Name or Guid of the content type you want to instantiate.
        // @data: Properties 
        //
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




        // ****************************************************************************
        // getFields
        //
        // Gets content type fields
        //
        // @returns: Promise with the result of the REST query.
        //
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
