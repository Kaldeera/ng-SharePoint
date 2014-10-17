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

	['$q', 'SPUtils', 'SharePoint',

	function($q, SPUtils, SharePoint) {

		var currentUser;
		var currentWeb;

		function getCurrentWeb() {

			var self = this;
			var def = $q.defer();

			if (currentWeb !== void 0) {
				def.resolve(currentWeb);
			} else {
				SharePoint.getCurrentWeb().then(function(web) {
					currentWeb = web;
					def.resolve(currentWeb);
				});
			}
			return def.promise;
		}

		// ****************************************************************************
		// SPUser constructor
		//
		// @url: Url del web que se quiere instanciar.
		//
		var SPUserObj = {

			getCurrentUser: function() {

				var self = this;
				var def = $q.defer();

				if (currentUser !== void 0) {

					def.resolve(currentUser);

				} else {
					self.getUserById(_spPageContextInfo.userId).then(function(user) {
						currentUser = user;
						def.resolve(user);
					});
				}

				return def.promise;
			},

			getUserById: function(userId) {

				if (userId === void 0) {
					throw 'Invalid arguments in getUserById, @userId can not be null';
				}

				var self = this;
				var def = $q.defer();

				getCurrentWeb().then(function(web) {

					var apiUrl = web.apiUrl + '/GetUserById(' + userId + ')';

					var executor = new SP.RequestExecutor(apiUrl);
					executor.executeAsync({
						url: apiUrl,
						method: 'GET',
						headers: {
							"Accept": "application/json; odata=verbose"
						},

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
			}
		};

// Web/SiteUserInfoList
// Web/SiteGroups
// Web/GetUserById(184)
// Web/GetUserById(nn)/Groups



		// Returns the SPUserObj class
		return SPUserObj;

	}
]);
