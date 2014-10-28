/*
	SPUser - factory
	
	Pau Codina (pau.codina@kaldeera.com)
	Pedro Castro (pedro.castro@kaldeera.com, pedro.cm@gmail.com)

	Copyright (c) 2014
	Licensed under the MIT License
*/



///////////////////////////////////////
//	SPUser
///////////////////////////////////////

angular.module('ngSharePoint').factory('SPUser', 

	['$q', 

	function SPUser_Factory($q) {


		// ****************************************************************************
		// SPUser constructor
		//
		// @web: SPWeb instance that contains the user in SharePoint.
		// @userData: User information. Could be:
		//				number: user id
		//				string: login name
		//				object: user object
		//
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

			// Initializes the SharePoint API REST url for the group.
			this.apiUrl = web.apiUrl + this.apiUrl;

			// Init userProperties (if exists)
			if (userData !== void 0) {
				angular.extend(this, userData);
			}
		};


		// ****************************************************************************
		// getProperties
		//
		// Gets user properties and attach it to 'this' object.
		//
		// @returns: Promise with the result of the REST query.
		//
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
//					delete d.Fields;
					
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
