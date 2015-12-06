/**
 * @ngdoc object
 * @name ngSharePoint.SPUser
 *
 * @description
 * Represents an SPUser object that is used to access all SharePoint user properties.
 * 
 * When you instantiate an SPUser object (with any user ID), the service is configured
 * with a pointer to the next REST api: `http://<site-url>/_api/web/SiteUserInfoList/getItemById(userID)`.
 * If you instantiate an SPUser object with a login name, the api is configured with the
 * url: `http://<site-url>/_api/web/siteusers/getByLoginName(loginName)`.
 *
 * You should take care with this difference, because the properties returned by these 
 * two API's are different. View the SharePoint documentation to get more information or 
 * make some calls to the API in a browser in order to see which method you prefer.
 *
 * *At the moment, not all SharePoint API methods for user objects are implemented in ngSharePoint*
 *
 */



angular.module('ngSharePoint').factory('SPUser', 

	['$q', 'SPObjectProvider', 'SPHttp', 

	function SPUser_Factory($q, SPObjectProvider, SPHttp) {


		/**
		 * @ngdoc function
		 * @name ngSharePoint.SPUser#constructor
		 * @constructor
		 * @methodOf ngSharePoint.SPUser
		 * 
		 * @description
		 * Instantiates a new SPUser object that points to a specific SharePoint user and allows
		 * retrieval of their properties
		 * 
		 * @param {SPWeb} web A valid {@link ngSharePoint.SPWeb SPWeb} object
		 * @param {int|string} userId|loginName User id or login name of the user that will retrieve properties
		 * @param {object} data Properties to initialize the object (optional)
		 * 
		 * @example
		 * <pre>
		 * var user = new SPUser(web, 'mydomain\user1');
		 * // ... do something with the user object
		 * user.getProperties().then(...);
		 * </pre>
		 *
		 */
		var SPUserObj = function(web, userId, userData) {

			if (web === void 0) {
				throw '@web parameter not specified in SPUser constructor.';
			}

			if (userId === void 0) {
				throw '@userId parameter not specified in SPUser constructor.';
			}


			this.web = web;

			if (typeof userId === 'number') {

				// Instead of attack directly to the WEB api, we can retrieve the user list 
				// item into the SiteUserInfoList.
				// With this, we can retrieve all the user information.

				this.apiUrl = '/SiteUserInfoList/getItemById(\'' + userId + '\')';
				// this.apiUrl = '/GetUserById(\'' + userId + '\')';

			} else if (typeof userId === 'string') {

				this.apiUrl = '/siteusers/getByLoginName(@v)?@v=\'' + encodeURIComponent(userId) + '\'';

			}

			// Initializes the SharePoint API REST url for the user.
			this.apiUrl = web.apiUrl + this.apiUrl;

			// Init userProperties (if exists)
			if (userData !== void 0) {
				utils.cleanDeferredProperties(userData);
				angular.extend(this, userData);
				if (this.LoginName === void 0 && this.Name !== void 0) {
					this.LoginName = this.Name;
				}
			}
		};



		/**
		 * @ngdoc function
		 * @name ngSharePoint.SPUser#getProperties
		 * @constructor
		 * @methodOf ngSharePoint.SPUser
		 * 
		 * @description
		 * Makes a call to the SharePoint server and gets all their properties.
		 * The current object is extended with all recovered properties. This means that when you have executed this 
		 * method, you will have direct access to their values. ex: `user.IsSiteAdmin`, `user.LoginName`, `user.Title`, etc.
		 * 
		 * For a complete list of user properties go to Microsoft 
		 * SharePoint {@link https://msdn.microsoft.com/EN-US/library/dn531432.aspx#bk_UserProperties api reference}.
		 *
		 * SharePoint REST api only returns certain user properties that have primary values. Properties with complex structures
		 * like user `Groups` are not returned directly by the api and you need to extend the query
		 * to retrieve their values. You can accomplish this with the `query` param.
		 *
		 * @param {object} query With this parameter you can specify which web properties you want to extend and to retrieve from the server.
		 * @returns {promise} promise with an object with all user properties
		 * 
		 * @example
		 * <pre>
		 * // _spContextInfo.userId contains the ID of the current loged user. We can use
		 * // this SharePoint environtment variable to retrieve current user information
		 * var currentUser = new SPUser(currentWeb, _spPageContextInfo.userId);
		 * currentUser.getProperties().then(function() {
	     * 
	     *   if (currentUser.IsSiteAdmin) {
		 *      // ...
		 *   }
		 * });
		 * </pre>
		 */
		SPUserObj.prototype.getProperties = function(query) {

			var self = this,
				url = self.apiUrl + utils.parseQuery(query);

			return SPHttp.get(url).then(function(data) {

				utils.cleanDeferredProperties(data);
				
				angular.extend(self, data);
				self.LoginName = self.Name;

				return self;

			});

		}; // getProperties


		/**
	     * @ngdoc function
	     * @name ngSharePoint.SPUser#getGroups
	     * @methodOf ngSharePoint.SPUser
	     *
	     * @description
	     * Retrieves the asociated user groups and returns an
	     * array of {@link ngSharePoint.SPGroup SPGroup} objects.
	     *
	     * @returns {promise} promise with an array of {@link ngSharePoint.SPGroup SPGroup} objects.
	     *
		 * @example
		 * <pre>
		 *
		 *   SharePoint.getCurrentWeb(function(webObject) {
		 *
		 *     var web = webObject;
		 *     web.getCurrentUser().then(function(user) {
		 *
		 *		  user.getGropus().then(function(groups) {
		 *       
		 *        	angular.forEach(groups, function(group) {
	     *           
	     *           	console.log(group.Title + ' ' + group.Description);
		 *        	});
		 *		  });
		 *     });
		 *
		 *   });
		 * </pre>
		 */
		SPUserObj.prototype.getGroups = function() {

			var self = this;

			var url = self.web.apiUrl + '/getUserById(' + self.Id + ')/Groups';
			return SPHttp.get(url).then(function(data) {

				var groups = [];

				angular.forEach(data, function(groupProperties) {
					var spGroup = SPObjectProvider.getSPGroup(self.web, groupProperties.Id, groupProperties);
					groups.push(spGroup);
				});

				self.Groups = groups;
				return groups;

			});

		};


				// Returns the SPUserObj class
		return SPUserObj;

	}
]);
