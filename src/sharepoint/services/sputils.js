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

angular.module('ngSharePoint').factory('SPUtils', ['$q', 'ODataParserProvider', function ($q, ODataParserProvider) {

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

					$q.all(loadScriptPromises).then(function() {

						isSharePointReady = true;
						deferred.resolve();

					});


				}, 'sp.js');
			}

			return deferred.promise;
		},



		loadScript: function(scriptFilename, functionName) {

			var def = $q.defer();

			SP.SOD.registerSod(scriptFilename, SP.Utilities.Utility.getLayoutsPageUrl(scriptFilename));

			EnsureScriptFunc(scriptFilename, functionName, function() {
				def.resolve();
			});

			return def.promise;
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
		}

	};

}]);
