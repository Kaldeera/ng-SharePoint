/**
 * @ngdoc object
 * @name ngSharePoint.SPGroup
 *
 * @description
 * SPGroup factory provides access to all SharePoint group properties and allows retrieval of users.
 *
 * *At the moment, not all SharePoint API methods for group objects are implemented in ngSharePoint*
 *
 */


angular.module('ngSharePoint').factory('SPGroup', 

	['$q', 'SPCache', 'SPUser', 

	function SPGroup_Factory($q, SPCache, SPUser) {

		'use strict';


		/**
		 * @ngdoc function
		 * @name ngSharePoint.SPGroup#constructor
		 * @constructor
		 * @methodOf ngSharePoint.SPGroup
		 * 
		 * @description
		 * Initializes a new SPGroup object that points to a specific SharePoint group and allows
		 * retrieval of their properties and users
		 * 
		 * @param {SPWeb} web A valid {@link ngSharePoint.SPWeb SPWeb} object
		 * @param {int|string} groupId|groupName Group id or name
		 * @param {object} data Properties to initialize the object (optional)
		 * 
		 * @example
		 * <pre>
         *  // Previously initiated web service and injected SPGroup service ...
		 *  var group = new SPGroup(web, 'Visitors');
		 *
		 *  // ... do something with the group object
		 *  group.getUsers().then(function(users) {
		 *    // ...
		 *  });
		 * </pre>
		 *
		 */
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



        /**
         * @ngdoc function
         * @name ngSharePoint.SPGroup#getProperties
         * @methodOf ngSharePoint.SPGroup
         *
         * @description
         * Makes a call to the SharePoint server and collects all the group properties.
         * The current object is extended with the recovered properties. This means that when this method is executed,
         * any group property is accessible directly. ex: `group.Title`, `group.Description`, `group.CanCurrentUserEditMembership`, etc.
         *
         * For a complete list of group properties go to Microsoft
         * SharePoint {@link https://msdn.microsoft.com/en-us/library/office/dn531432.aspx#bk_GroupProperties group api reference}
         *
         * SharePoint REST api only returns certain group properties that have primary values. Properties with complex structures
         * like `Owner` are not returned directly by the api and is necessary to extend the query
         * to retrieve their values. Is possible to accomplish this with the `query` param.
         *
         * @param {object} query This parameter specify which group properties will be extended and retrieved from the server.
         * By default `Owner` property is extended.
         *
         * @returns {promise} promise with an object with all group properties
         *
         */
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



		/**
	     * @ngdoc function
	     * @name ngSharePoint.SPGroup#getUsers
	     * @methodOf ngSharePoint.SPGroup
	     *
	     * @description
	     * Gets a collection of {@link ngSharePoint.SPUser SPUser} objects that represents all of the users in the group.
	     *
	     * @returns {promise} promise with an array of {@link ngSharePoint.SPUser SPUser} objects  
	     *
		 * @example
		 * <pre>
		 *
		 *   SharePoint.getCurrentWeb(function(webObject) {
		 *
		 *     var group = web.getGroup('Visitors');
		 *     group.getUsers().then(function(users) {
		 *       
		 *        angular.forEach(users, function(user) {
	     *           console.log(user.Name);
		 *        });
		 *     });
		 *
		 *   });
		 * </pre>
		 */
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
