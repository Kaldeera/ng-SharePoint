/**
 * @ngdoc object
 * @name ngSharePoint.SPGroup
 *
 * @description
 * SPGroup factory provides access to all SharePoint group properties and allows retrieval of users and 
 * owner (group or user).
 *
 * *At the moment, not all SharePoint API methods for group objects are implemented in ngSharePoint*
 *
 */


angular.module('ngSharePoint').factory('SPGroup', 

	['$q', 'SPHttp', 'SPCache', 'SPObjectProvider', 

	function SPGroup_Factory($q, SPHttp, SPCache, SPObjectProvider) {

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
         * @returns {promise} promise with an object with all group properties
         *
         */
		SPGroupObj.prototype.getProperties = function() {

			var self = this,
				url = self.apiUrl;
			
			return SPHttp.get(url).then(function(data) {

				utils.cleanDeferredProperties(data);
				angular.extend(self, data);

				return self;
			});


		}; // getProperties



		/**
	     * @ngdoc function
	     * @name ngSharePoint.SPGroup#getOwner
	     * @methodOf ngSharePoint.SPGroup
	     *
	     * @description
	     * Retrieves the sharepoint owner of the group.
	     *
	     * @returns {promise} promise with an {@link ngSharePoint.SPUser SPUser} object  
	     *
		 * @example
		 * <pre>
		 *
		 *   SharePoint.getCurrentWeb(function(webObject) {
		 *
		 *     var group = web.getGroup('Visitors');
		 *     group.getOwner().then(function(owner) {
		 *       
	     *         console.log(owner.Name);
		 *     });
		 *
		 *   });
		 * </pre>
		 */
		SPGroupObj.prototype.getOwner = function() {

			var self = this,
				url = self.apiUrl + '/Owner';
			
			return SPHttp.get(url).then(function(data) {

				utils.cleanDeferredProperties(data);

				var owner;

				if (data.PrincipalType === 8) {
					// group
					owner = SPObjectProvider.getSPGroup(self.web, data.Id, data);
				} else {
					// user
					owner = SPObjectProvider.getSPUser(self.web, data.Id, data);
				}
				self.Owner = owner;

				return self;
			});

		};	// getOwner




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

			var self = this,
				url = self.apiUrl + '/Users',
				users = self.Users;


			if (users === void 0) {

				users = SPHttp.get(url).then(function(data) {

					var users = [];
					angular.forEach(data, function(user) {
						users.push(SPObjectProvider.getSPUser(self.web, user.Id, user));
					});

					self.Users = users;
					return users;
				});
			}

            return $q.when(users);

		}; // getUsers



 		// Returns the SPGroupObj class
		return SPGroupObj;

	}
]);
