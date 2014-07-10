/*
	ngSharePoint - module

	The ngSharePoint module is an Angular wrapper for SharePoint 2013.
	
	Pau Codina (pau.codina@kaldeera.com)
	Pedro Castro (pedro.castro@kaldeera.com, pedro.cm@gmail.com)
	
	Copyright (c) 2014
	Licensed under the MIT License
*/



// GitHub documentation style:

/**
 * @ngdoc module
 * @name ngSharePoint
 * @module ngSharePoint
 * @description
 *
 * # ngSharePoint (core module)
 * The ngSharePoint module is an Angular wrapper for SharePoint 2013.
 *
 * <div doc-module-components="ngSharePoint"></div>
 */



///////////////////////////////////////
//	ngSharePoint
///////////////////////////////////////

angular.module('ngSharePoint', ['ngSharePoint.templates', 'CamlHelper']);
angular.module('kld.ngSharePoint', []);





angular.module('ngSharePoint').constant('SPConfig', {

	CSOM: false

});





angular.module('ngSharePoint').config(['SPConfig', function(SPConfig) {

	SPConfig.CSOM = true;

}]);



/*
---------------------------------------------------------------------------------------
	Module constants
---------------------------------------------------------------------------------------
*/
angular.module('ngSharePoint').value('Constants', {
	errorTemplate: 'templates/error.html',
	userProfileUrl: '_layouts/userdisp.aspx?ID='
});
