/*
	SPWeb - factory
	
	Pau Codina (pau.codina@kaldeera.com)
	Pedro Castro (pedro.castro@kaldeera.com, pedro.cm@gmail.com)

	Copyright (c) 2014
	Licensed under the MIT License
*/



///////////////////////////////////////
//	SPWeb
///////////////////////////////////////

angular.module('ngSharePoint').factory('SPWeb', 

	['$q', 'SPUtils', 'SPList',

	function($q, SPUtils, SPList) {

		'use strict';


		// ****************************************************************************
		// SPWeb constructor
		//
		// @url: Url del web que se quiere instanciar.
		//
		var SPWebObj = function(url) {

			this.url = url;

			return this.getApiUrl();

		};



		// ****************************************************************************
		// getApiUrl
		//
		// @returns: Promise that will be resolved after the initialization of the 
		//			 SharePoint web API REST url.
		//
		SPWebObj.prototype.getApiUrl = function() {

			var self = this;
			var def = $q.defer();


			if (this.apiUrl !== void 0) {

				def.resolve(this);

			} else {

				// Si no se ha especificado url, obtiene la url del web actual 
				if (this.url === void 0) {

					this.url = _spPageContextInfo.webServerRelativeUrl;
					this.apiUrl = this.url.rtrim('/') + '/_api/web';
					def.resolve(this);

				} else {

					// Cleans the 'url' parameter.
					this.url = this.url.trim().ltrim('{').rtrim('}');

					if (utils.isGuid(this.url)) {

						SPUtils.getWebById(this.url).then(function(jsomWeb) {

							self.url = jsomWeb.get_serverRelativeUrl();
							self.apiUrl = self.url.rtrim('/') + '/_api/web';
							def.resolve(self);

						});

					} else {

						this.apiUrl = this.url.rtrim('/') + '/_api/web';
						def.resolve(this);
					}

				}
			}

			return def.promise;

		};




		// ****************************************************************************		
		// getProperties
		//
		// Gets web properties and attach it to 'this' object.
		//
		// http://msdn.microsoft.com/es-es/library/office/jj164022(v=office.15).aspx
		// @returns: Promise with the result of the REST query.
		//
		SPWebObj.prototype.getProperties = function() {

			var self = this;
			var def = $q.defer();

			SPUtils.SharePointReady().then(function() {

				var executor = new SP.RequestExecutor(self.url);

				var query = {
					$expand: 'RegionalSettings/TimeZone'
				};

				executor.executeAsync({

					url: self.apiUrl + utils.parseQuery(query),
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
			});

			return def.promise;

		}; // getProperties



		// ****************************************************************************		
		// getLists
		//
		// Gets a SPList collection (SPList factory)
		//
		// @listName: String or Guid with the name or GUID of the list.
		// @returns: array of SPList objects.
		//
		SPWebObj.prototype.getLists = function() {

			var self = this;
			var def = $q.defer();


			SPUtils.SharePointReady().then(function() {

				var executor = new SP.RequestExecutor(self.url);

				executor.executeAsync({

					url: self.apiUrl + '/Lists',
					method: 'GET', 
					headers: { 
						"Accept": "application/json; odata=verbose"
					}, 

					success: function(data) {

						var d = utils.parseSPResponse(data);
						var lists = [];

						angular.forEach(d, function(listProperties) {
							var spList = new SPList(self, listProperties.Id, listProperties);
							lists.push(spList);
						});

						def.resolve(lists);
						// def.resolve(utils.parseSPResponse(data));
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

		};



		// ****************************************************************************		
		// getList
		//
		// Gets a SPList object (SPList factory)
		//
		// @listName: String or Guid with the name or GUID of the list.
		// @returns: SPList instance.
		//
		SPWebObj.prototype.getList = function(listName) {

			var def = $q.defer();
			def.resolve(new SPList(this, listName));
			return def.promise;

		};



		// ****************************************************************************		
		// getCurrentUser
		//
		// Gets a SPUser object (SPUser factory)
		//
		// @returns: SPUser instance.
		//
		SPWebObj.prototype.getCurrentUser = function() {

			var def = $q.defer();

			if (this.currentUser !== void 0) {

				def.resolve(this.currentUser);

			} else {
				this.getUserById(_spPageContextInfo.userId).then(function(user) {
					this.currentUser = user;
					def.resolve(user);
				});
			}

			return def.promise;
		};



		// ****************************************************************************		
		// getUserById
		//
		// Gets a SPUser object (SPUser factory)
		//
		// @userId: Id of the user to search
		// @returns: SPUser instance.
		//
		SPWebObj.prototype.getUserById = function(userId) {

			var def = $q.defer();

			new SPUser(this, userId).then(function(user) {
				def.resolve(user);
			});

			return def.promise;
		};






		// ****************************************************************************		
		// staticMethod
		//
		// Example of static method
		//
		SPWebObj.staticMethod = function() {

			// You can access this method directly from the class without the need of create an instance.
			// Example: SPWeb.staticMethod();
			//
			// Inside this method you don't have access to the 'this' object (instance).

		};



		// Returns the SPWebObj class
		return SPWebObj;

	}
]);
