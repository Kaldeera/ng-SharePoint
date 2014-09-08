/*
	SharePoint - provider

	Main SharePoint provider.
	
	Pau Codina (pau.codina@kaldeera.com)
	Pedro Castro (pedro.castro@kaldeera.com, pedro.cm@gmail.com)

	Copyright (c) 2014
	Licensed under the MIT License
*/



///////////////////////////////////////
//	SharePoint
///////////////////////////////////////

angular.module('ngSharePoint')
.provider('SharePoint', function() {

	'use strict';

	var SharePoint = function($cacheFactory, $q, SPUtils, SPWeb) {


		// ****************************************************************************		
		// getCurrentWeb
		//
		// Gets the current web.
		//
		// @returns: Promise with a new SPWeb (factory) object that allow access to 
		//			 web methods and properties.
		//
		this.getCurrentWeb = function() {
			return this.getWeb();
		};



		// ****************************************************************************		
		// getWeb
		//
		// Gets the current web.
		//
		// @url: The url of the web you want to retrieve.
		// @returns: Promise with a new SPWeb (factory) object that allow access to 
		//			 web methods and properties.
		//
		this.getWeb = function(url) {
			var def = $q.defer();

			SPUtils.SharePointReady().then(function() {

				new SPWeb(url).then(function(web) {
					def.resolve(web);
				});

			});

			return def.promise;
		};

	};


	
	this.$get = function($cacheFactory, $q, SPUtils, SPWeb) {
		return new SharePoint($cacheFactory, $q, SPUtils, SPWeb);
	};

});
