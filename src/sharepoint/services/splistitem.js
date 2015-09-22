/**
 * @ngdoc object
 * @name ngSharePoint.SPListItem
 *
 * @description
 * Represents a SPListItem object that you could use to insert, modify and remove items on 
 * SharePoint lists.
 *
 * Is possible create new SPListItem objects or use a {@link ngSharePoint.SPList SPList} object to 
 * get the SPListItems storeds in the list.
 *
 * *At the moment, not all SharePoint API methods for list items are implemented in ngSharePoint*
 *
 * @requires ngSharePoint.SPList
 *
 */



angular.module('ngSharePoint').factory('SPListItem', 

    ['$q', 'SPUtils', 

    function SPListItem_Factory($q, SPUtils) {

        'use strict';


        /**
         * @ngdoc function
         * @name ngSharePoint.SPListItem#constructor
         * @constructor
         * @methodOf ngSharePoint.SPListItem
         *
         * @description
         * Instantiates a new `SPListItem` object for a specific list. It's possible
         * to specify their new properties (data).
         *
         * When you call some of methods {@link ngSharePoint.SPList#getListItems getListItems} or 
         * {@link ngSharePoint.SPList#getItemById getItemById}, SPListItem objects are returned.
         *
         * @param {SPList} list A valid {@link ngSharePoint.SPList SPList} object where the item is stored
         * @param {object|Int32} data|itemId Can be an object with item properties or an item identifier.
         *
         */
        var SPListItemObj = function(list, data) {

            var self = this;

            if (list === void 0) {
                throw 'Required @list parameter not specified in SPListItem constructor.';
            }


            this.list = list;


            if (data !== void 0) {

                if (typeof data === 'object' && data.concat === void 0) { //-> is object && not is array

                    if (data.list !== void 0) {
                        delete data.list;
                    }
                    
                    utils.cleanDeferredProperties(data);
                    angular.extend(this, data);

                } else {

                    if (!isNaN(parseInt(data))) {

                        this.Id = data;

                    } else {

                        throw 'Incorrect @data parameter in SPListItem constructor.';
                    }
                }

            }

        };



        /**
         * @ngdoc function
         * @name ngSharePoint.SPListItem#isNew
         * @methodOf ngSharePoint.SPListItem
         *
         * @description
         * List items can be retrieved from the server or created on the client side before to 
         * be saved on the server.
         *
         * This method indicates if the item is new and will create an item on the server
         * or will update an existing element.
         *
         * Any item that doesn't have Id property is considered new.
         *
         * @returns {Boolean} indicating if the item is new or not.
         *
         */
        SPListItemObj.prototype.isNew = function() {
            return this.Id === void 0;
        };



        /**
         * This method is called internally to get the correct API url depending if the
         * item is new or not.
         * This can be <site>/_api/web/<list>/Items for new elements or 
         * <site>/_api/web/<list>/Items(<itemId>) for existing items
         *
         * @returns {string} with the correct API REST url endpoint for the item.
         */
        SPListItemObj.prototype.getAPIUrl = function() {

            var apiUrl = this.list.apiUrl + '/Items';

            if (this.Id !== void 0) {
                
                apiUrl += '(' + this.Id + ')';
            }

            return apiUrl;
        };



        /**
         * @ngdoc function
         * @name ngSharePoint.SPListItem#getProperties
         * @methodOf ngSharePoint.SPListItem
         *
         * @description
         * Retrieve a item from the server and attach it to 'this' object. To retrieve
         * a specific item, you must specify the item Id.
         *
         * <pre>
         *    var item = new SPListItem(anyList, anyId);
         *    // or
         *    var otherItem = new SPListItem(anyList);
         *    otherItem.Id = anyId;
         *
         *    // Later ...
         *    item.getProperties().then(function() {
         *
         *      console.log('This will return false: ' + item.isNew());
         *      console.log(item.Title);
         *
         *    });
         *
         * </pre>
         *
         * Instead of create a new SPListItem, specifiy the Id and `getProperties` is recomendable
         * to use {@link ngSharePoint.SPList#getItemById getItemById} of the SPList object.
         *
         * 
         * If the item is a DocumentLibrary item, also gets the {@link ngSharePoint.SPFile File} 
         * and/or {@link ngSharePoint.SPFolder Folder} properties.
         *
         * @param {string} expandProperties Comma separed values with the properties to expand
         * in the item.
         *
         * @returns {promise} promise with all the item properties (fields) retrieved from the server
         *
        */        
        SPListItemObj.prototype.getProperties = function(expandProperties) {

            var self = this;
            var def = $q.defer();
            var query = {};

            if (expandProperties !== void 0) {
                query.$expand = expandProperties;
            }

            var executor = new SP.RequestExecutor(self.list.web.url);

            executor.executeAsync({

                url: self.getAPIUrl() + utils.parseQuery(query),
                method: 'GET', 
                headers: { 
                    "Accept": "application/json; odata=verbose"
                }, 

                success: function(data) {

                    var d = utils.parseSPResponse(data);

                    utils.cleanDeferredProperties(d);
                    angular.extend(self, d);

                    if (self.list.BaseType === 0) {

                        // DocumentLibrary properties
                        switch (d.FileSystemObjectType) {

                            case 0:
                                // get the File
                                self.getFile().then(function() {
                                    def.resolve(d);
                                });
                                break;

                            case 1: 
                                // get the Folder
                                self.getFolder().then(function() {
                                    def.resolve(d);
                                });
                                break;

                            default:
                                def.resolve(d);
                                break;

                        }

                    } else {

                        def.resolve(d);
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

        }; // getProperties



        /**
         * @ngdoc function
         * @name ngSharePoint.SPListItem#getFieldValuesAsHtml
         * @methodOf ngSharePoint.SPListItem
         *
         * @description
         * This method performs a REST call to _api/web/list/item/FieldValuesAsHtml.
         * Thats different to expand the property when executes getProperties.
         * That method makes a call like _api/web/list/item?$expand=FieldValuesAsHtml.
         *
         * Expanding this property does not retrieve detailed information lookup 
         * values neither user fields, then it's necessary to call this method.
         *
         * @returns {promise} promise with the result of the REST query
         *
         */
        SPListItemObj.prototype.getFieldValuesAsHtml = function() {

            var self = this;
            var def = $q.defer();
            var executor = new SP.RequestExecutor(self.list.web.url);

            executor.executeAsync({

                url: self.getAPIUrl() + '/FieldValuesAsHtml',
                method: 'GET', 
                headers: { 
                    "Accept": "application/json; odata=verbose"
                }, 

                success: function(data) {

                    var d = utils.parseSPResponse(data);

                    utils.cleanDeferredProperties(d);
                    self.FieldValuesAsHtml = d;
                    def.resolve(this);
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

        };  // getFieldValuesAsHtml




        /**
         * @ngdoc function
         * @name ngSharePoint.SPListItem#getFile
         * @methodOf ngSharePoint.SPListItem
         *
         * @description
         * Gets file properties of the item and attach it to 'this' objtect.
         * If the item is not a DocumentLibrary document element, the REST query returns no results.
         *
         * @returns {promise} promise with the result of the REST query
         *
         */
        SPListItemObj.prototype.getFile = function() {

            var self = this;
            var def = $q.defer();
            var executor = new SP.RequestExecutor(self.list.web.url);

            executor.executeAsync({

                url: self.getAPIUrl() + '/File?$expand=ParentFolder',
                method: 'GET', 
                headers: { 
                    "Accept": "application/json; odata=verbose"
                }, 

                success: function(data) {

                    var d = utils.parseSPResponse(data);
                    utils.cleanDeferredProperties(d);
                    angular.extend(self, d);

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

        };



        /**
         * @ngdoc function
         * @name ngSharePoint.SPListItem#getFolder
         * @methodOf ngSharePoint.SPListItem
         *
         * @description
         * Gets folder properties of the item and attach it to 'this' objtect.
         * If the item is not a DocumentLibrary folder element, the REST query returns no results.
         *
         * @returns {promise} promise with the result of the REST query
         *
         */
        SPListItemObj.prototype.getFolder = function() {

            var self = this;
            var def = $q.defer();
            var executor = new SP.RequestExecutor(self.list.web.url);

            executor.executeAsync({

                url: self.getAPIUrl() + '/Folder?$expand=ParentFolder',
                method: 'GET', 
                headers: { 
                    "Accept": "application/json; odata=verbose"
                }, 

                success: function(data) {

                    var d = utils.parseSPResponse(data);
                    utils.cleanDeferredProperties(d);
                    angular.extend(self, d);

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

        };



        /**
         * @ngdoc function
         * @name ngSharePoint.SPListItem#getAttachments
         * @methodOf ngSharePoint.SPListItem
         *
         * @description
         * Gets all attachments of the item. This method inititalizes a new item property
         * called AttachmentFiles with an array of all attached elements.
         *
         * @returns {promise} promise with the array of attachments.
         *
         */
        SPListItemObj.prototype.getAttachments = function() {

            var self = this;
            var def = $q.defer();
            var executor = new SP.RequestExecutor(self.list.web.url);

            if (this.isNew()) {

                // Initialize the attachments arrays (See processAttachments method).
                self.AttachmentFiles = [];
                self.attachments = { add: [], remove: [] };
                def.resolve(self.AttachmentFiles);

            } else {

                executor.executeAsync({

                    url: self.getAPIUrl() + '/AttachmentFiles',
                    method: 'GET', 
                    headers: { 
                        "Accept": "application/json; odata=verbose"
                    }, 

                    success: function(data) {

                        var d = utils.parseSPResponse(data);
                        self.AttachmentFiles = d;

                        // Initialize the attachments arrays (See processAttachments method).
                        self.attachments = {
                            add: [],
                            remove: []
                        };

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
            }

            return def.promise;

        }; // getAttachments



        /**
         * @ngdoc function
         * @name ngSharePoint.SPListItem#addAttachment
         * @methodOf ngSharePoint.SPListItem
         *
         * @description
         * Attach a new file to the item.
         *
         * **Note** This method is called internaly by the method processAttachments 
         * when the item is saved to the server
         * and their property item.attachments.add is an array with files to attach.
         *
         * @param {object} file DOM object to be attached to the item
         * @returns {promise} promise with the result of the REST call.
         *
         */
        SPListItemObj.prototype.addAttachment = function(file) {

            var self = this;
            var def = $q.defer();
            var executor = new SP.RequestExecutor(self.list.web.url);

            SPUtils.getFileBinary(file).then(function(binaryData) {

                // Set the headers for the REST API call.
                // ----------------------------------------------------------------------------
                var headers = {
                    "Accept": "application/json; odata=verbose"
                };



                var requestDigest = document.getElementById('__REQUESTDIGEST');
                // Remote apps that use OAuth can get the form digest value from the http://<site url>/_api/contextinfo endpoint.
                // SharePoint-hosted apps can get the value from the #__REQUESTDIGEST page control if it's available on the SharePoint page.

                if (requestDigest !== null) {
                    headers['X-RequestDigest'] = requestDigest.value;
                }



                executor.executeAsync({

                    url: self.getAPIUrl() + "/AttachmentFiles/add(FileName='" + file.name + "')",
                    method: "POST",
                    binaryStringRequestBody: true,
                    body: binaryData,
                    state: "Update",
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

        }; // addAttachment



        /**
         * @ngdoc function
         * @name ngSharePoint.SPListItem#removeAttachment
         * @methodOf ngSharePoint.SPListItem
         *
         * @description
         * Romove an item attached file
         *
         * **Note** This method is called internaly by the method processAttachments
         * when the item is saved to the server
         * and their property item.attachments.remove is an array with files to remove.
         *
         * @param {string} fileName The name of the file to remove.
         * @returns {promise} promise with the result of the REST call.
         *
         */
        SPListItemObj.prototype.removeAttachment = function(fileName) {

            var self = this;
            var def = $q.defer();
            var executor = new SP.RequestExecutor(self.list.web.url);


            // Set the headers for the REST API call.
            // ----------------------------------------------------------------------------
            var headers = {
                "Accept": "application/json; odata=verbose",
                "X-HTTP-Method": "DELETE"
            };



            var requestDigest = document.getElementById('__REQUESTDIGEST');
            // Remote apps that use OAuth can get the form digest value from the http://<site url>/_api/contextinfo endpoint.
            // SharePoint-hosted apps can get the value from the #__REQUESTDIGEST page control if it's available on the SharePoint page.

            if (requestDigest !== null) {
                headers['X-RequestDigest'] = requestDigest.value;
            }



            executor.executeAsync({

                url: self.getAPIUrl() + "/AttachmentFiles('" + fileName + "')",
                method: "POST",
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

        }; // removeAttachment




        /**
         * @ngdoc function
         * @name ngSharePoint.SPListItem#processAttachment
         * @methodOf ngSharePoint.SPListItem
         *
         * @description
         * Process the attachments arrays (item.attachments.add and item.attachments.remove)
         * when the item is saved to the server.
         *
         * The attachments arrays contains the collection of files to attach to the item
         * and the attachments to remove.
         *
         * After the process, the attachments array will be initialized.
         *
         * **Note** This method is called internaly by the method save.
         *
         * @returns {promise} promise with the result of the process.
         *
         */
        SPListItemObj.prototype.processAttachments = function() {

            var self = this;
            var def = $q.defer();



            function processAttachmentsInternal(attachmentsOperations, index, deferred) {

                index = index || 0;
                deferred = deferred || $q.defer();

                var attachmentOperation = attachmentsOperations[index++];

                if (attachmentOperation === void 0) {

                    deferred.resolve();
                    return deferred.promise;

                }

                switch(attachmentOperation.operation.toLowerCase()) {

                    case 'add':
                        self.addAttachment(attachmentOperation.file).finally(function() {

                            processAttachmentsInternal(attachmentsOperations, index, deferred);

                        }).catch(function(err) {

                            try {

                                var errorStatus = err.data.statusCode + ' (' + err.data.statusText + ')';
                                alert(attachmentOperation.file.name + '\n\n' + err.code + '\n' + errorStatus + '\n\n' + err.message);

                            } catch(e) {

                                console.log(err);
                                alert('Error attaching the file ' + attachmentOperation.file.name);

                            }

                        });
                        break;

                    case 'remove':
                        self.removeAttachment(attachmentOperation.fileName).finally(function() {

                            processAttachmentsInternal(attachmentsOperations, index, deferred);

                        });
                        break;

                }

                return deferred.promise;

            } // processAttachmentsInternal



            // Check if the attachments property has been initialized
            if (this.attachments !== void 0) {

                var attachmentsOperations = [];

                if (this.attachments.remove !== void 0 && this.attachments.remove.length > 0) {
                    angular.forEach(this.attachments.remove, function(fileName) {
                        attachmentsOperations.push({
                            operation: 'remove',
                            fileName: fileName
                        });
                    });
                }

                if (this.attachments.add !== void 0 && this.attachments.add.length > 0) {
                    angular.forEach(this.attachments.add, function(file) {
                        attachmentsOperations.push({
                            operation: 'add',
                            file: file
                        });
                    });
                }


                // Process the attachments operations sequentially with promises.
                processAttachmentsInternal(attachmentsOperations).then(function() {

                    // Clean up the attachments arrays
                    self.attachments.add = [];
                    self.attachments.remove = [];

                    def.resolve();

                });

            } else {

                // Nothing to do
                def.resolve();

            }


            return def.promise;

        }; // processAttachments




        /**
         * @ngdoc function
         * @name ngSharePoint.SPListItem#save
         * @methodOf ngSharePoint.SPListItem
         *
         * @description
         * This method saves the item to the server.
         * 
         * If the item is new because doesn't have any Id, a new item is created.
         * If the item is an existing element retrieved previously, the 
         * element is updated with the new set of properties (fields).
         *
         * This method saves the item and process the attachments arrays.
         *
         * After the process, the attachments array will be initialized.
         *
         * @returns {promise} promise with and object with the item properties
         * 
         * @example
         * This example restrieves a task item from the server and 
         * changes his state to 'Closed'
         * <pre>
         *
         *    taskList.getItemById(taskId).then(function(task) {
         *
         *        task.Status = 'Closed';
         *        task.save().then(function() {
         *          
         *            SP.UI.Notify.addNotification("Task closed!", false);
         *
         *        });
         *
         *    });
         *
         * </pre>
         *
         */
        SPListItemObj.prototype.save = function() {

            var self = this;
            var def = $q.defer();


            self.list.getListItemEntityTypeFullName().then(function(listItemEntityTypeFullName) {

                var executor = new SP.RequestExecutor(self.list.web.url);


                // Set the contents for the REST API call.
                // ----------------------------------------------------------------------------
                var body = {
                    __metadata: {
                        type: listItemEntityTypeFullName
                    }
                };

                var saveObj = angular.extend({}, self);

                // Remove not valid properties
                delete saveObj.list;
                delete saveObj.apiUrl;

                // Remove functions
                for (var p in saveObj) {
                    if (typeof saveObj[p] == 'function') {
                        delete saveObj[p];
                    }
                }

                // Remove all Computed and ReadOnlyFields
                angular.forEach(self.list.Fields, function(field) {
                    
                    if (field.TypeAsString === 'Computed' || field.ReadOnlyField) {
                        // delete saveObj[field.InternalName];
                        if (field.EntityPropertyName !== 'ContentTypeId') delete saveObj[field.EntityPropertyName];
                    }

                    // NOTA DE MEJORA!
                    // Se pueden controlar los campos de tipo Lookup y User para que convierta los valores
                    // al nombre de campo correcto (si es que están mal)
                    // 
                    // Ej. un campo que se llama Sala y el objeto tiene
                    // obj.Sala = 12
                    // 
                    // Para que no se produzca un error, se deberia convertir a:
                    //
                    // obj.SalaId = 12
                    //

                    var fieldType = field.originalTypeAsString || field.TypeAsString;
                    // var fieldName = field.InternalName;
                    var fieldName = field.EntityPropertyName;
                    if (fieldType == 'Lookup' || fieldType == 'LookupMulti' || fieldType == 'User' || fieldType == 'UserMulti') {
                        fieldName = fieldName + 'Id';
                    }

                    if (fieldType == 'LookupMulti' || fieldType == 'MultiChoice' || fieldType == 'UserMulti') {

                        // To prevent Collection(Edm.String)[Nullable=False] error.
                        // This error will be thrown even if this is not a required field
                        if (saveObj[fieldName] === null) {
                            delete saveObj[fieldName];
                        }
                    }

                    // Required fields with null values don't allow to save the item
                    // Deleting this properties the item will be saved correctly
                    if (field.Required === true) {
                        if (saveObj[fieldName] === null) {

                            delete saveObj[fieldName];
                        }
                    }

                });

                // Remove attachments
                delete saveObj.attachments;
                delete saveObj.AttachmentFiles;
                delete saveObj.ContentType;
                delete saveObj.FieldValuesAsHtml;
                delete saveObj.Folder;
                delete saveObj.File;

                angular.extend(body, saveObj);


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

                // If the item has 'Id', means that is not a new item, so set the call headers for make an update.
                if (!self.isNew()) {

                    // UPDATE
                    angular.extend(headers, {
                        "X-HTTP-Method": "MERGE",
                        "IF-MATCH": "*" // Overwrite any changes in the item. 
                                        // Use 'item.__metadata.etag' to provide a way to verify that the object being changed has not been changed since it was last retrieved.
                    });
                }


                // Make the call.
                // ----------------------------------------------------------------------------
                executor.executeAsync({

                    url: self.getAPIUrl(),
                    method: 'POST',
                    body: angular.toJson(body),
                    headers: headers,

                    success: function(data) {

                        var d = utils.parseSPResponse(data);
                        utils.cleanDeferredProperties(d);
                        angular.extend(self, d);

                        /**
                         * On a document library, if user changes the name of the 
                         * file (by the FileLeafRef field), the .File property that
                         * points to the File object on the server, will have a bad 
                         * api url
                         * This problem can solfe with a call to updateAPIUrlById method
                         * that modifies the apiURL property correctly

                        if (self.File !== undefined) {
                            self.File.updateAPIUrlById(self.list, self.Id);
                        }
                        
                        */

                        // After save, process the attachments.
                        self.processAttachments().then(function() {
                            def.resolve(d);
                        }, function() {
                            def.resolve(d);
                        });
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

        }; // save




        /**
         * @ngdoc function
         * @name ngSharePoint.SPListItem#remove
         * @methodOf ngSharePoint.SPListItem
         *
         * @description
         * This method removes the item from the server.
         * 
         * @returns {promise} promise with the result of the REST query.
         *
         */
        SPListItemObj.prototype.remove = function() {

            var self = this;
            var def = $q.defer();
            var executor = new SP.RequestExecutor(self.list.web.url);


            // Set the headers for the REST API call.
            // ----------------------------------------------------------------------------
            var headers = {
                "Accept": "application/json; odata=verbose",
                "X-HTTP-Method": "DELETE",
                "IF-MATCH": "*"
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

                url: self.getAPIUrl(),
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

        }; // remove




        /**
         * @ngdoc function
         * @name ngSharePoint.SPListItem#runWorkflow
         * @methodOf ngSharePoint.SPListItem
         *
         * @description
         * This method starts a new instance of a specified workflow for current item.
         * 
         * The workflow must be enabled and no other instances of the same workflow version
         * can be running.
         *
         * The method allows to specify the initiation form data.
         *
         * **NOTE**:
         * Due to limititaions of the SharePoint REST api, there isn't any method
         * to run a workflow. Because that, this method uses the SharePoint `workflow.asmx` web service.
         * 
         * **Limitations**:
         * This method uses JSOM to retrieve `FileRef` property of the item. This means
         * that this method can't be executed outside of the SharePoint page context.
         *
         *
         * @param {string} workflowName The name or the Id of the workflow that you want to run.
         * @param {object} params Initiation workflow data. A object with all properties and 
         * values that will be passed to the workflow.
         * @returns {promise} promise with the result of the operation.
         *
         */
        SPListItemObj.prototype.runWorkflow = function(workflowName, params) {

            var self = this;
            var def = $q.defer();
            var executor = new SP.RequestExecutor(self.list.web.url);

            if (workflowName === void 0) {
                throw 'Required @workflowName parameter not specified in SPListItem.runWorkflow method.';
            }

            if (!utils.isGuid(workflowName)) {

                this.list.getWorkflowAssociationByName(workflowName).then(function(workflowAssociations) {

                    if (workflowAssociations.length > 0) {

                        return self.runWorkflow(workflowAssociations[0].Id, params);

                    } else {

                        console.error('There is no associated workflow with name ' + workflowName);
                        def.reject('There is no associated workflow with name ' + workflowName);
                    }
                });

            } else {

                var context = new SP.ClientContext(self.list.web.url);
                var web = context.get_web();
                var list = web.get_lists().getById(self.list.Id);
                self._item = list.getItemById(self.Id);
                context.load(self._item);

                context.executeQueryAsync(function() {

                    // Set the headers for the REST API call.
                    // ----------------------------------------------------------------------------
                    var headers = {
                        "content-type": "text/xml;charset='utf-8'"
                    };

                    var requestDigest = document.getElementById('__REQUESTDIGEST');
                    // Remote apps that use OAuth can get the form digest value from the http://<site url>/_api/contextinfo endpoint.
                    // SharePoint-hosted apps can get the value from the #__REQUESTDIGEST page control if it's available on the SharePoint page.

                    if (requestDigest !== null) {
                        headers['X-RequestDigest'] = requestDigest.value;
                    }

                    var data = '<soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap12="http://www.w3.org/2003/05/soap-envelope"><soap12:Body><StartWorkflow xmlns="http://schemas.microsoft.com/sharepoint/soap/workflow/"><item>';
                    data += _spPageContextInfo.webAbsoluteUrl + self._item.get_item('FileRef');
                    data += '</item><templateId>';
                    data += workflowName;
                    data += '</templateId><workflowParameters><root /></workflowParameters></StartWorkflow></soap12:Body></soap12:Envelope>';

                    // Make the call.
                    // ----------------------------------------------------------------------------
                    executor.executeAsync({

                        url: self.list.web.url.rtrim('/') + '/_vti_bin/workflow.asmx',
                        method: "POST",
                        dataType: "xml",
                        async: true,
                        headers: headers,
                        body: data,

                        success: function(data) {

                            self.getProperties().then(function() {
                                def.resolve();
                            });
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

                }); // get _item

            }

            return def.promise;

        }; // runWorkflow



        // Returns the SPListItemObj class
        return SPListItemObj;

    }
]);
