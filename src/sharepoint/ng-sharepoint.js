
/**
 * @ngdoc overview
 * @name ngSharePoint
 *
 * @description 
 * ### ngSharePoint (core module)
 * The ngSharePoint module is an Angular wrapper for SharePoint 2013.
 * 
 * ## Usage
 * To use ngSharePoint you'll need to include this module as a dependency within your angular app.
 * <pre>
 *
 *     	// In your module application include 'ngSharePoint' as a dependency
 *     	var myApp = angular.module('myApp', ['ngSharePoint']);
 *
 * </pre>
 * 
 * @author Pau Codina [<pau.codina@kaldeera.com>]
 * @author Pedro Castro [<pedro.cm@gmail.com>]
 * @license Licensed under the MIT License
 * @copyright Copyright (c) 2014
 */

angular.module('ngSharePoint', ['CamlHelper']);




angular.module('ngSharePoint').config(['$compileProvider', function($compileProvider) {

	// Reconfigure the RegExp for aHrefSanitizationWhiteList to accept 'javascript'.
	$compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|file|javascript):/);
	/* NOTE: The previous statement is for angular versions 1.2.8 and above.
	 *		 For version 1.0.5 or 1.1.3 please use the next statement:
	 *
	 *				$compileProvider.urlSanitizationWhitelist(/^\s*(https?|ftp|mailto|file|javascript):/);
	 *
	 */

}]);




/** 
 * Module constants
 */
angular.module('ngSharePoint').value('Constants', {
	errorTemplate: 'templates/error.html',
	userProfileUrl: '_layouts/userdisp.aspx?ID='
});

