/**
 * @ngdoc object
 * @name ngSharePoint.SPUser
 *
 * @description
 * Represents a SPUser object that is used to access to all SharePoint user properties
 * 
 * When you instantiate an SPUser object (with any user Id), the service is configured
 * with a pointer to the next REST api: `http://<site-url>/_api/web/SiteUserInfoList/getItemById(userId)`.
 * If you instantiate a SPUser object with a login name, the api is configured with the
 * url: `http://<site-url>/_api/web/siteusers/getByLoginName(loginName)`.
 *
 * You should take care with this difference, because the properties returned by these 
 * two API's are different. View the SharePoint documentation to get more information or 
 * make some calls to the API in a browser in order to see whitch method you prefer.
 *
 * *At the moment, not all SharePoint API methods for user objects are implemented in ngSharePoint*
 *
 */



angular.module('ngSharePoint').factory('SPUser', 

	['$q', 

	function SPUser_Factory($q) {


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

				this.apiUrl = '/siteusers/getByLoginName(@v)?@v=\'' + userId + '\'';

			}

			// Initializes the SharePoint API REST url for the user.
			this.apiUrl = web.apiUrl + this.apiUrl;

			// Init userProperties (if exists)
			if (userData !== void 0) {
				utils.cleanDeferredProperties(userData);
				angular.extend(this, userData);
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
		 * The current object are extended with all recovered properties. This means that when you have executed this 
		 * method, you will have direct access to their values. ex: `user.IsSiteAdmin`, `user.LoginName`, `user.Title`, etc.
		 * 
		 * For a complete list of user properties go to Microsoft 
		 * SharePoint {@link https://msdn.microsoft.com/EN-US/library/dn531432.aspx#bk_UserProperties api reference}
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
		 * // this SharePoint evirontment variable to retrieve current user information
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


		// Returns the SPUserObj class
		return SPUserObj;

	}
]);
