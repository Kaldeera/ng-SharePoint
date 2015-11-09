
/**
 * @ngdoc object
 * @name ngSharePoint.SharePoint
 *
 * @description
 * Provides top level access to SharePoint web sites api. Through this provider it is possible to access to any SharePoint web.
 *
 * @requires ngSharePoint.SPUtils
 * @requires ngSharePoint.SPWeb
 */


angular.module('ngSharePoint').provider('SharePoint', 

	[

	function SharePoint_Provider() {

		'use strict';

		var SharePoint = function($cacheFactory, $q, SPUtils, SPWeb) {


			/**
			 * @ngdoc function
			 * @name ngSharePoint.SharePoint#getCurrentWeb
			 * @methodOf ngSharePoint.SharePoint
			 * 
			 * @description
			 * Returns an {@link ngSharePoint.SPWeb SPWeb} object initialized with the 
			 * current SharePoint web. That means, the web context where 
			 * this sentence is executed
			 * 
			 * @returns {promise} Promise with a new {@link ngSharePoint.SPWeb SPWeb} object that allows access to
			 * web methods and properties
			 * 
			 * @example
			 * <pre>
			 *	SharePoint.getCurrentWeb().then(function(web) {
			 *	  // ... do something with the web object
			 *	});
			 * </pre>
			 */
			this.getCurrentWeb = function() {
				return this.getWeb();
			};


			/**
			 * @ngdoc function
			 * @name ngSharePoint.SharePoint#getWeb
			 * @methodOf ngSharePoint.SharePoint
			 * 
			 * @description
			 * Returns the {@link ngSharePoint.SPWeb SPWeb} specified by the required url
			 * 
			 * @param {string} url The url of the web that you want to retrieve
			 * @returns {promise} Promise with a new {@link ngSharePoint.SPWeb SPWeb} object that allows access to
			 * web methods and properties
			 * 
			 * @example
			 * <pre>
			 *	SharePoint.getWeb('/sites/rrhh').then(function(web) {
			 *	  // ... do something with the 'rrhh' web object
			 *	});
			 * </pre>
			 */
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

	}
]);
