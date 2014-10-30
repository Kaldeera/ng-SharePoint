/*
	SPList - factory
	
	Pau Codina (pau.codina@kaldeera.com)
	Pedro Castro (pedro.castro@kaldeera.com, pedro.cm@gmail.com)

	Copyright (c) 2014
	Licensed under the MIT License
*/



///////////////////////////////////////
//	SPList
///////////////////////////////////////

angular.module('ngSharePoint').factory('SPList', 

	['$q', 'SPCache', 'SPFolder', 'SPListItem', 

	function SPList_Factory($q, SPCache, SPFolder, SPListItem) {

		'use strict';


		// ****************************************************************************
		// SPList constructor
		//
		// @web: SPWeb instance that contains the list in SharePoint.
		// @listName: Name or Guid of the list you want to instantiate.
		//
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
			var executor = new SP.RequestExecutor(self.web.url);

			executor.executeAsync({

				url: self.apiUrl + utils.parseQuery(query),
				method: 'GET', 
				headers: { 
					"Accept": "application/json; odata=verbose"
				}, 

				success: function(data) {

					var d = utils.parseSPResponse(data);
					delete d.Fields;

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

		}; // getProperties



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

				if (this.RootFolder.__deferred !== void 0) {
					
					delete this.RootFolder;
				}
			}


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
		// getListItems
		//
		// Gets the list items
		//
		// @query: An object with REST query options.
		//		   References:
		//				http://msdn.microsoft.com/en-us/library/office/fp142385(v=office.15).aspx
		//				http://msdn.microsoft.com/en-us/library/office/dn292552(v=office.15).aspx
		//				http://msdn.microsoft.com/en-us/library/office/dn292553(v=office.15).aspx
		// @returns: Promise with the result of the REST query.
		//
		SPListObj.prototype.getListItems = function(query) {

			var self = this;
			var def = $q.defer();
			var executor = new SP.RequestExecutor(self.web.url);
			var defaultExpandProperties = 'ContentType, File, File/ParentFolder, Folder, Folder/ParentFolder';

			if (query) {
				query.$expand = defaultExpandProperties + (query.$expand ? ', ' + query.$expand : '');
			} else {
				query = { 
					$expand: defaultExpandProperties
				};
			}

			executor.executeAsync({

				url: self.apiUrl + '/Items' + utils.parseQuery(query),
				method: 'GET', 
				headers: { 
					"Accept": "application/json; odata=verbose"
				}, 

				success: function(data) {

					// El siguiente código retorna una colección de SPListItem
					// y recupera las propiedades File y/o Folder cuando la lista 
					// es una DocumentLibrary.
					//
					// Se ha comentado porque se ha implemtado la expansión
					// automática de ciertas propiedades necesarias (campos) cuando
					// la lista es una DocumentLibrary (File/Folder).
					//
					// Con el siguiente código, es más lento ya que realiza varias
					// llamadas REST para obtener los datos necesarios.
					/*
					var d = utils.parseSPResponse(data);
					var items = [];
					var itemsPromises = [];

					angular.forEach(d, function(item) {

						var spListItem = new SPListItem(self, item.ID);

						items.push(spListItem);

						// Checks if list is a DocumentLibrary
						if (self.BaseType === 1) {
							// Gets file or folder properties
							itemsPromises.push(spListItem.getProperties());
						} else {
							angular.extend(spListItem, item);
						}

					});

					$q.all(itemsPromises).then(function() {
						def.resolve(items);
					});
					*/



					// Código por defecto que retorna la colección de items que retorna la llamada REST.
					/*
					var d = utils.parseSPResponse(data);
					def.resolve(d);
					*/



					// Código que retorna una colección de objectos SPListItem ya inicializados.
					var d = utils.parseSPResponse(data);
					var items = [];

					angular.forEach(d, function(item) {
						var spListItem = new SPListItem(self, item);
						items.push(spListItem);
					});

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
		//					  expand in the REST query.
		// @returns: Promise with the result of the REST query.
		//
		SPListObj.prototype.getItemById = function(id, expandProperties) {

			var self = this;
			var def = $q.defer();
			var executor = new SP.RequestExecutor(self.web.url);
			var defaultExpandProperties = 'ContentType, File, File/ParentFolder, Folder, Folder/ParentFolder';
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
