/*
	SPUtils - factory

	SharePoint utility functions.

	Pau Codina (pau.codina@kaldeera.com)
	Pedro Castro (pedro.castro@kaldeera.com, pedro.cm@gmail.com)

	Copyright (c) 2014
	Licensed under the MIT License
*/



///////////////////////////////////////
//	SPUtils
///////////////////////////////////////

angular.module('ngSharePoint').factory('SPUtils', ['$q', '$http', 'ODataParserProvider', function ($q, $http, ODataParserProvider) {

	'use strict';


	var isSharePointReady = false;

	return {



		inDesignMode: function () {
			var publishingEdit = window.g_disableCheckoutInEditMode;
			var form = document.forms[MSOWebPartPageFormName];
			var input = form.MSOLayout_InDesignMode || form._wikiPageMode;

			return !!(publishingEdit || (input && input.value));
		},



		SharePointReady: function () {

			var deferred = $q.defer();
			var self = this;

			if (isSharePointReady) {

				deferred.resolve();

			} else {

				// Load sp.js
				SP.SOD.executeOrDelayUntilScriptLoaded(function () {

					var loadScriptPromises = [];

					// Loads additional needed scripts
					loadScriptPromises.push(self.loadScript('SP.RequestExecutor.js', 'SP.RequestExecutor'));
					loadScriptPromises.push(self.loadScript('SP.UserProfiles.js', 'SP.UserProfiles'));
					loadScriptPromises.push(self.loadScript('datepicker.debug.js', 'clickDatePicker'));
					loadScriptPromises.push(self.loadScript('clienttemplates.js', ''));
					loadScriptPromises.push(self.loadScript('clientforms.js', ''));
					loadScriptPromises.push(self.loadScript('clientpeoplepicker.js', 'SPClientPeoplePicker'));
					loadScriptPromises.push(self.loadScript('autofill.js', ''));
					

					$q.all(loadScriptPromises).then(function() {

						isSharePointReady = true;
						deferred.resolve();

					});


				}, 'sp.js');
			}

			return deferred.promise;
		},



		loadScript: function(scriptFilename, functionName) {

			var deferred = $q.defer();

			SP.SOD.registerSod(scriptFilename, SP.Utilities.Utility.getLayoutsPageUrl(scriptFilename));

			EnsureScriptFunc(scriptFilename, functionName, function() {
				deferred.resolve();
			});

			return deferred.promise;
		},



		generateCamlQuery: function (queryInfo, listSchema) {
			/*
				Formato del objeto de filtro:
				{
					filter: 'Country eq ' + $routeParams.country + ' and Modified eq [Today]',
					orderBy: 'Title asc, Modified desc',
					select: 'Title, Country',
					top: 10,
					pagingInfo: 'Paged=TRUE&p_ID=nnn[&PagedPrev=TRUE]'
				}
			*/
			var camlQueryXml = "";
			var camlQuery;

			if (queryInfo === undefined) {
				camlQuery = SP.CamlQuery.createAllItemsQuery();
			} else {
				// El formato del parametro puede ser un objeto, que hay que procesar, o un string directo de CamlQuery
				if (typeof queryInfo === 'string') {
					camlQueryXml = queryInfo;
				} else if (typeof queryInfo === 'object') {
					var odata = ODataParserProvider.ODataParser(listSchema);
					odata.parseExpression(queryInfo);
					camlQueryXml = odata.getCAMLQuery();
				}

				if (camlQueryXml) {
					camlQuery = new SP.CamlQuery();
					camlQuery.set_viewXml(camlQueryXml);
				}

				if (queryInfo.pagingInfo) {
					var position = new SP.ListItemCollectionPosition(); 
	        		position.set_pagingInfo(queryInfo.pagingInfo);
					camlQuery.set_listItemCollectionPosition(position);
				}
			}
			return camlQuery;
		},



		parseQuery: function(query) {

			var strQuery = '';

			angular.forEach(query, function(value, key) {
				strQuery += (strQuery !== '' ? '&' : '?') + key + '=' + value;
			});

			return strQuery;
		},



		parseError: function(errorData) {

			var errorObject = {
				code: errorData.errorCode,
				message: errorData.errorMessage
			};

			try {

				var body = angular.fromJson(data.body);

				errorObject.code = body.error.code;
				errorObject.message = body.error.message.value;

			} catch(ex) {}

			console.error(errorObject.message);
			return errorObject;
		},



		getRegionalSettings: function() {

			var self = this;
			var deferred = $q.defer();

			this.SharePointReady().then(function() {
				var ctx = new SP.ClientContext.get_current();
				var web = ctx.get_web();
				var regionalSettings = web.get_regionalSettings();
				var timeZone = regionalSettings.get_timeZone();

				ctx.load(regionalSettings);
				ctx.load(timeZone);

				ctx.executeQueryAsync(function() {

					regionalSettings.TimeZone = timeZone;
					deferred.resolve(regionalSettings);

				}, function(sender, args) {

					deferred.reject({ sender: sender, args: args });
				});
			});

			return deferred.promise;
		},


		// TODA ESTA FUNCIONALIDAD DEBE ESTAR DENTRO DE UN SERVICIO SPUser (o algo asi)
		// O en todo caso, la llamada a getCurrentUser debe ser del SPWeb!!!
		getCurrentUser: function() {

			var self = this;
			var deferred = $q.defer();

			this.SharePointReady().then(function() {
				var ctx = new SP.ClientContext.get_current();
				var web = ctx.get_web();
				var user = web.get_currentUser();

				ctx.load(user);

				ctx.executeQueryAsync(function() {

					deferred.resolve(user);

				}, function(sender, args) {

					deferred.reject({ sender: sender, args: args });
				});
			});

			return deferred.promise;
		},


		getUserId: function(loginName) {

			var self = this;
			var deferred = $q.defer();

			var ctx = new SP.ClientContext.get_current();
			var user = ctx.get_web().ensureUser(loginName);
			ctx.load(user);
			ctx.executeQueryAsync(function() {

				deferred.resolve(user.get_id());

			}, function(sender, args) {

				deferred.reject({ sender: sender, args: args });
			});

			return deferred.promise;
		},


		getUserRegionalSettings: function(loginName) {

			var self = this;
			var deferred = $q.defer();

			this.SharePointReady().then(function() {
				var ctx = new SP.ClientContext.get_current();
				var peopleManager = new SP.UserProfiles.PeopleManager(ctx);
				//var userRegionalSettings = peopleManager.getUserProfilePropertyFor(loginName, 'RegionalSettings');
				//var userProperties = peopleManager.getPropertiesFor(loginName);
				var userProperties = peopleManager.getMyProperties();

				ctx.load(userProperties);

				ctx.executeQueryAsync(function() {

					deferred.resolve(userProperties);

				}, function(sender, args) {

					deferred.reject({ sender: sender, args: args });
				});
			});

			return deferred.promise;			
		},


		parseXmlString: function(xmlDocStr) {

	        var xmlDoc;

	        if (window.DOMParser) {

	            var parser = new window.DOMParser();          
	            xmlDoc = parser.parseFromString(xmlDocStr, "text/xml");

	        } else {
	        
	            // IE :(
	            if(xmlDocStr.indexOf("<?") === 0) {
	                xmlDocStr = xmlDocStr.substr(xmlDocStr.indexOf("?>") + 2);
	            }
	        
	            xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
	            xmlDoc.async = "false";
	            xmlDoc.loadXML(xmlDocStr);

	        }

	        return xmlDoc;
	    },


	    getCurrentUserLCID: function() {

	    	var self = this;
	    	var deferred = $q.defer();

			var url = _spPageContextInfo.webServerRelativeUrl.rtrim('/') + "/_layouts/15/regionalsetng.aspx?Type=User";

			$http.get(url).success(function(data) {

				var html = angular.element(data);
				var form, lcid;

				angular.forEach(html, function(element) {
					if (element.tagName && element.tagName.toLowerCase() === 'form') {
						form = element;
					}
				});

				if (form !== void 0) {
					var regionalSettingsSelect = form.querySelector('#ctl00_PlaceHolderMain_ctl02_ctl01_DdlwebLCID');
					var selectedOption = regionalSettingsSelect.querySelector('[selected]');
					lcid = selectedOption.value;
				}


				deferred.resolve(lcid);

			});

			return deferred.promise;
	    }

	};

}]);
