/**
 * @ngdoc object
 * @name ngSharePoint.SPGroup
 *
 * @description
 * SPGroup factory provides access to any SharePoint group properties and allows to retrieve their users.
 *
 * *At the moment, not all SharePoint API methods for group objects are implemented in ngSharePoint*
 *
 */

 /*
	SPGroup - factory
	
	Pau Codina (pau.codina@kaldeera.com)
	Pedro Castro (pedro.castro@kaldeera.com, pedro.cm@gmail.com)

	Copyright (c) 2014
	Licensed under the MIT License
*/



///////////////////////////////////////
//	SPGroup
///////////////////////////////////////

angular.module('ngSharePoint').factory('SPGroup', 

	['$q', 'SPCache', 'SPUser', 

	function SPGroup_Factory($q, SPCache, SPUser) {

		'use strict';


		// ****************************************************************************
		// SPGroup constructor
		//
		// @web: SPWeb instance that contains the group in SharePoint.
		// @groupName: Name or id of the group you want to instantiate.
		//
		var SPGroupObj = function(web, groupName, groupProperties) {

			if (web === void 0) {
				throw '@web parameter not specified in SPGroup constructor.';
			}

			if (groupName === void 0) {
				throw '@groupName parameter not specified in SPGroup constructor.';
			}


			this.web = web;

			if (typeof groupName === 'number') {

				this.apiUrl = '/sitegroups/GetById(\'' + groupName + '\')';

			} else {

				this.apiUrl = '/sitegroups/GetByName(\'' + groupName + '\')';

			}


			// Initializes the SharePoint API REST url for the group.
			this.apiUrl = web.apiUrl + this.apiUrl;

			// Init groupProperties (if exists)
			if (groupProperties !== void 0) {
				utils.cleanDeferredProperties(groupProperties);
				angular.extend(this, groupProperties);
			}
		};



		// ****************************************************************************
		// getProperties
		//
		// Gets group properties and attach it to 'this' object.
		//
		// @returns: Promise with the result of the REST query.
		//
		SPGroupObj.prototype.getProperties = function(query) {

			var self = this;
			var def = $q.defer();
			var executor = new SP.RequestExecutor(self.web.url);
			var defaultExpandProperties = 'Owner';

			if (query) {
				query.$expand = defaultExpandProperties + (query.$expand ? ', ' + query.$expand : '');
			} else {
				query = { 
					$expand: defaultExpandProperties
				};
			}

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

					def.resolve(self);
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
		// getUsers
		//
		// Gets group users
		//
		// @returns: Promise with the result of the REST query.
		//
		SPGroupObj.prototype.getUsers = function() {

			var self = this;
			var def = $q.defer();

			if (this.Users !== void 0) {

				def.resolve(this.Users);

			} else {

				var executor = new SP.RequestExecutor(self.web.url);

				executor.executeAsync({

					url: self.apiUrl + '/Users',
					method: 'GET', 
					headers: { 
						"Accept": "application/json; odata=verbose"
					}, 

					success: function(data) {

						var d = utils.parseSPResponse(data);
						var users = [];

						angular.forEach(d, function(user) {

							users.push(new SPUser(self.web, user.Id, user));

						});

						self.Users = users;

						def.resolve(users);
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

		}; // getUsers



 		// Returns the SPGroupObj class
		return SPGroupObj;

	}
]);
