/*
	SPListItem - factory
	
	Pau Codina (pau.codina@kaldeera.com)
	Pedro Castro (pedro.castro@kaldeera.com, pedro.cm@gmail.com)

	Copyright (c) 2014
	Licensed under the MIT License
*/



///////////////////////////////////////
//	SPList
///////////////////////////////////////

angular.module('ngSharePoint').factory('SPListItem', 

	['$q', 'SPUtils', 

	function($q, SPUtils) {

		'use strict';


		// ****************************************************************************
		// SPListItem constructor
		//
		// @list: SPList instance that contains the item in SharePoint.
		// @data: {Int32 | object} Must be an item identifier (ID) or item properties.
		//
		var SPListItemObj = function(list, data) {

			var self = this;

			if (list === void 0) {
				throw '@list parameter not specified in SPListItem constructor.';
			}


			this.list = list;


			if (data !== void 0) {

				if (typeof data === 'object' && data.concat === void 0) { //-> is object && not is array

					angular.extend(this, data);
					this.clean();

				} else {

					if (!isNaN(parseInt(data))) {

						this.Id = data;

					} else {

						throw 'Incorrect @data parameter in SPListItem constructor';
					}
				}

			}
		};



		// ****************************************************************************
		// isNew
		//
		// Returns a boolean value indicating if the item is anew item.
		//
		// @returns: {Boolean} True if the item is a new item. Otherwise false.
		//
		SPListItemObj.prototype.isNew = function() {
			return this.Id === void 0;
		};



		// ****************************************************************************
		// clean
		//
		// Cleans undesirable item properties obtained form SharePoint.
		//
		// @returns: {SPListItem} The item itself to allow chaining calls.
		//
		SPListItemObj.prototype.clean = function() {

			var self = this;

			angular.forEach(this, function(value, key) {

				if (typeof value === 'object' && value !== null) {
					if (value.__deferred) {
						delete self[key];
					}
				}

			});

			return this;
		};



		// ****************************************************************************		
		// getAPIUrl
		//
		// Gets the SharePoint 2013 REST API url for the item.
		//
		// @returns: {String} The item API url.
		//
		SPListItemObj.prototype.getAPIUrl = function() {

			var apiUrl = this.list.apiUrl + '/Items';

			if (this.Id !== void 0) {
				
				apiUrl += '(' + this.Id + ')';
			}

			return apiUrl;
		};



		// ****************************************************************************		
		// getProperties
		//
		// Gets properties of the item and attach it to 'this' object.
		// If the item is a DocumentLibrary item, also gets the File and/or Folder.
		//
		// @returns: Promise with the result of the REST query.
		//
		SPListItemObj.prototype.getProperties = function() {

			var self = this;
			var def = $q.defer();
			var executor = new SP.RequestExecutor(self.list.web.url);

			executor.executeAsync({

				url: self.getAPIUrl(),
				method: 'GET', 
				headers: { 
					"Accept": "application/json; odata=verbose"
				}, 

				success: function(data) {

					var d = utils.parseSPResponse(data);

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



		// ****************************************************************************		
		// getFile
		//
		// Gets file properties of the item and attach it to 'this' object.
		// If the item is not a DocumentLibrary item, the REST query returns no results.
		//
		// @returns: Promise with the result of the REST query.
		//
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



		// ****************************************************************************		
		// getFolder
		//
		// Gets floder properties of the item and attach it to 'this' object.
		// If the item is not a DocumentLibrary item, the REST query returns no results.
		//
		// @returns: Promise with the result of the REST query.
		//
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



		// ****************************************************************************		
		// save
		//
		// Creates this item in the list. 
		//
		// @returns: Promise with the result of the REST query.
		//
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
				delete saveObj.list;
				delete saveObj.apiUrl;

				angular.forEach(self.list.Fields, function(field) {
					
					if (field.TypeAsString === 'Computed' || field.ReadOnlyField) {
						delete saveObj[field.InternalName];
					}

				});

				angular.extend(body, saveObj);
				console.log(saveObj, angular.toJson(saveObj));



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

			});


            return def.promise;

		}; // save



		// ****************************************************************************		
		// remove
		//
		// Removes this item from the list. 
		//
		// @returns: Promise with the result of the REST query.
		//
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


		// Returns the SPListItemObj class
		return SPListItemObj;

	}
]);