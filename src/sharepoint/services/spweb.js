
/**
 * @ngdoc object
 * @name ngSharePoint.SPWeb
 *
 * @description
 * Represents an SPWeb object that is used to access to all SharePoint web site properties, lists and users.
 * 
 * When you instantiate an SPWeb object (with any SharePoint site url), the service is configured
 * with a pointer to a REST API of the site `http://<site url>/_api/web`.
 *
 * You musn't instantiate this object directly. You must use {@link ngSharePoint.SharePoint SharePoint} service
 * to get SPWeb instances.
 *
 * If you instantiate a new SPWeb object, you have an object that points to the SharePoint web api. Then, you can access to all
 * web properties or get lists, and users through its methods.
 *
 * *At the moment, not all SharePoint API methods for web objects are implemented in ngSharePoint*
 *
 * @requires ngSharePoint.SPUtils
 * @requires ngSharePoint.SPList
 * @requires ngSharePoint.SPUser
 * @requires ngSharePoint.SPFolder
 * 
 */


angular.module('ngSharePoint').factory('SPWeb', 

	['$q', 'SPHttp', 'SPUtils', 'SPList', 'SPUser', 'SPGroup', 'SPFolder',

	function SPWeb_Factory($q, SPHttp, SPUtils, SPList, SPUser, SPGroup, SPFolder) {

		'use strict';


		/**
		 * @ngdoc function
		 * @name ngSharePoint.SPWeb#constructor
		 * @constructor
		 * @methodOf ngSharePoint.SPWeb
		 * 
		 * @description
		 * Instantiates a new SPWeb object that points to a specific SharePoint site.
		 * 
		 * @param {sring=} url|webID url or web ID. If this parameter is not provided, the object is initialized with the current web
		 * @returns {promise} with the SPWeb object correctly instantiated
		 * 
		 * @example
		 * <pre>
		 * new SPWeb('/mySite').then(function(web) {
		 *   // ... do something with the web object
		 * })
		 * </pre>
		 *
		 * All method calls to this `SPWeb` object will refer to the content of this site (lists, users, ...)
		 */
		var SPWebObj = function(url) {

			this.url = url;

			return this.getApiUrl();

		};



		/**
		 * This method is called when a new SPWeb object is instantiated.
		 * The proupose of this method is to resolve the correct api url of the web, depending on `url` property
		 *
		 * @returns {promise} that will be resolved after the initialization of the SharePoint web API REST url endpoint
		 */
		SPWebObj.prototype.getApiUrl = function() {

			var self = this;
			var def = $q.defer();


			if (this.apiUrl !== void 0) {

				def.resolve(this);

			} else {

				// If not 'url' parameter provided in the constructor, gets the url of the current web.
				if (this.url === void 0) {

					if (window._spPageContextInfo !== undefined) {
						this.url = window._spPageContextInfo.webServerRelativeUrl;
					} else {
						this.url = '/';
					}
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



		/**
		 * @ngdoc function
		 * @name ngSharePoint.SPWeb#getProperties
		 * @methodOf ngSharePoint.SPWeb
		 * 
		 * @description
		 * Makes a call to the SharePoint server and retrieves all web properties.
		 * The current object is extended with all retrieved properties. This means that when you have executed this 
		 * method, you will have direct access to these values. ex: `web.Title`, `web.Language`, etc.
		 * 
		 * For a complete list of web properties go to Microsoft 
		 * SharePoint {@link https://msdn.microsoft.com/en-us/library/dn499819.aspx#bk_WebProperties api reference}
		 *
		 * SharePoint REST api only returns certain web properties that have primary values. Properties with complex structures
		 * like `SiteGroups`, `Lists` or `ContentTypes` are not returned directly by the api and you will need to extend the query
		 * to retrieve their values. You can accomplish this with the `query` param.
		 *
		 * @param {object} query With this parameter you can specify which web properties you want to extend and to retrieve from the server.
		 * By default `RegionalSettings/TimeZone` properties are extended.
		 *
		 * @returns {promise} promise with an object with all web properties
		 * 
		 * @example
		 * This example shows how to retrieve the web properties:
		 * <pre>
		 *
		 *   SharePoint.getCurrentWeb(function(webObject) {
		 *
		 *     var web = webObject;
		 *     web.getProperties().then(function(properties) {
		 *       
		 *        // at this point we have all web properties
		 *        alert(properties.Title);
		 *
		 *        // or you can do
		 *        alert(web.Title);
		 *     });
		 *
		 *   });
		 * </pre>
		 *
		 * This example shows how to retrieve site groups:
		 * <pre>
		 *
		 *   SharePoint.getCurrentWeb(function(webObject) {
		 *
		 *     var web = webObject;
		 *     web.getProperties({$expand: 'SiteGroups'}).then(function() {
		 *       
		 *        angular.forEach(web.SiteGroups.results, function(group) {
	     *           
	     *           console.log(group.Title + ' ' + group.Description);
		 *        });
		 *     });
		 *
		 *   });
		 * </pre>
		 */
		SPWebObj.prototype.getProperties = function(query) {

			var self = this;
			var def = $q.defer();
			var defaultExpandProperties = 'RegionalSettings/TimeZone';

			return SPUtils.SharePointReady().then(function() {

				if (query) {
					query.$expand = defaultExpandProperties + (query.$expand ? ', ' + query.$expand : '');
				} else {
					query = { 
						$expand: defaultExpandProperties
					};
				}

				var url = self.apiUrl + utils.parseQuery(query);

				return SPHttp.get(url).then(function(data) {

					utils.cleanDeferredProperties(data);
					
					angular.extend(self, data);
					def.resolve(data);
						
				});
			});

			// return def.promise;

		}; // getProperties



		/**
	     * @ngdoc function
	     * @name ngSharePoint.SPWeb#getLists
	     * @methodOf ngSharePoint.SPWeb
	     *
	     * @description
	     * Retrieves all SharePoint lists and document libraries from the server and returns an
	     * array of {@link ngSharePoint.SPList SPList} objects.
	     *
	     * @returns {promise} promise with an array of {@link ngSharePoint.SPList SPList} objects.
	     *
		 * @example
		 * <pre>
		 *
		 *   SharePoint.getCurrentWeb(function(webObject) {
		 *
		 *     var web = webObject;
		 *     web.getLists().then(function(lists) {
		 *       
		 *        angular.forEach(lists, function(list) {
	     *           
	     *           console.log(list.Title + ' ' + list.EnableAttachments);
		 *        });
		 *     });
		 *
		 *   });
		 * </pre>
		 */
		SPWebObj.prototype.getLists = function() {

			var self = this;

			return SPUtils.SharePointReady().then(function() {

				var url = self.apiUrl + '/Lists';
				return SPHttp.get(url).then(function(data) {

					var lists = [];

					angular.forEach(data, function(listProperties) {
						var spList = new SPList(self, listProperties.Id, listProperties);
						lists.push(spList);
					});

					return lists;

				});

			});

		};



		/**
	     * @ngdoc function
	     * @name ngSharePoint.SPWeb#getList
	     * @methodOf ngSharePoint.SPWeb
	     *
	     * @description
	     * Retrieves an instance of the specified SharePoint list or document library from the server
	     *
	     * @param {string|GUID} name The name or the GUID of the list
	     *
         * Also, you can specify "UserInfoList" to refer to the system list with all site users.
         * 
	     * @returns {promise} promise with an {@link ngSharePoint.SPList SPList} object
	     *
		 * @example
		 * <pre>
		 *
		 *   SharePoint.getCurrentWeb(function(webObject) {
		 *
		 *     var web = webObject;
		 *     web.getList('Tasks').then(function(taskList) {
		 *       
		 *        taskList.getListItems();
		 *     });
		 *
		 *   });
		 * </pre>
		 *
		 * You can access to any list with their GUID.
		 * <pre>
		 *   
		 *    web.getList('12fa20d2-1bb8-489c-bea3-b81797ddfeaf').then(function(list) {
	     *        list.getProperties().then(function() {
		 *		     alert(list.Title);
		 *		  });
		 *    });
		 * </pre>
		 *
		*/
		SPWebObj.prototype.getList = function(listName) {

			var def = $q.defer();
			def.resolve(new SPList(this, listName));
			return def.promise;

		};



		/**
		 * @ngdoc function
		 * @name ngSharePoint.SPWeb#getRootFolder
		 * @methodOf ngSharePoint.SPWeb
		 *
		 * @description
		 * Use this method to get a reference of the web root folder.
		 *
		 * @returns {promise} promise with a {@link ngSharePoint.SPFolder SPFolder} object
		 *
		*/
		SPWebObj.prototype.getRootFolder = function() {

            var self = this,
            	rootFolder = this.RootFolder;

            if (rootFolder === void 0) {

            	var url = self.apiUrl + '/RootFolder';

            	rootFolder = SPHttp.get(url).then(function(data) {

                    self.RootFolder = new SPFolder(self, data.ServerRelativeUrl, data);
                    self.RootFolder.web = self;

                    return self.RootFolder;

            	});
            }

            return $q.when(rootFolder);

		};



		/**
	     * @ngdoc function
	     * @name ngSharePoint.SPWeb#getCurrentUser
	     * @methodOf ngSharePoint.SPWeb
	     *
	     * @description
	     * Retrieves the current user from SharePoint
	     *
	     * @returns {promise} promise with an {@link ngSharePoint.SPUser SPUser} object
	     *
		 * @example
		 * <pre>
		 *
		 * // previously initiated web object ...
		 * web.getCurrentUser().then(function(user) {
		 *   
		 *    if (user.IsSiteAdmin) {
		 *      // some stuff ... 
		 *    }
		 * });
		 * </pre>
		*/
		SPWebObj.prototype.getCurrentUser = function() {

			var def = $q.defer();
			var self = this;

			if (this.currentUser !== void 0) {

				def.resolve(this.currentUser);

			} else {

				var solveUserId;

				if (window._spPageContextInfo !== undefined) {

					solveUserId = window._spPageContextInfo.userId;

				} else {

					var url = this.apiUrl + '/currentUser';

					solveUserId = SPHttp.get(url).then(function(data) {

						return data.Id;
					});
				}

				$q.when(solveUserId).then(function(userId) {

					self.getUserById(userId).then(function(user) {
						self.currentUser = user;
						def.resolve(user);
					}, function(err) {
						def.reject(err);
					});

				});
			}

			return def.promise;
		};



		/**
	     * @ngdoc function
	     * @name ngSharePoint.SPWeb#getUserById
	     * @methodOf ngSharePoint.SPWeb
	     *
	     * @description
	     * Retrieves a specified user from SharePoint
	     *
	     * @param {int} userID User ID of the desired user to retrieve
	     * @returns {promise} promise with a {@link ngSharePoint.SPUser SPUser} object
	     *
		 * @example
		 * <pre>
		 *
		 * // previously initiated web object ...
		 * web.getUser(12).then(function(user) {
		 *   
		 *    if (user.IsSiteAdmin) {
		 *      // some stuff ... 
		 *    }
		 * });
		 * </pre>
		*/
		SPWebObj.prototype.getUserById = function(userID) {

			return new SPUser(this, userID).getProperties();
		};



		/**
	     * @ngdoc function
	     * @name ngSharePoint.SPWeb#getSiteGroups
	     * @methodOf ngSharePoint.SPWeb
	     *
	     * @description
	     * Retrieves all SharePoint site groups for the current web and returns an
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
		 *     web.getSiteGroups().then(function(groups) {
		 *       
		 *        angular.forEach(groups, function(group) {
	     *           
	     *           console.log(group.Title + ' ' + group.Description);
		 *        });
		 *     });
		 *
		 *   });
		 * </pre>
		 */
		SPWebObj.prototype.getSiteGroups = function() {

			var self = this,
				siteGroups = self.Groups;

			if (siteGroups === void 0) {

				siteGroups = SPUtils.SharePointReady().then(function() {

					var url = self.apiUrl + '/SiteGroups';
					return SPHttp.get(url).then(function(data) {

						var groups = [];

						angular.forEach(data, function(groupProperties) {
							var spGroup = new SPGroup(self, groupProperties.Id, groupProperties);
							groups.push(spGroup);
						});

						self.Groups = groups;
						return groups;

					});
				});
			}

			return $q.when(siteGroups); 


		};



		// Returns the SPWebObj class
		return SPWebObj;

	}
]);
