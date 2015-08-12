
/**
 * @ngdoc overview
 * @name ngSharePoint
 *
 * @description 
 * ### ngSharePoint (core module)
 * The ngSharePoint module is an Angular wrapper for SharePoint 2013.
 *
 * ## Introduction
 * Microsoft SharePoint 2013 provides a powerfull {@link https://msdn.microsoft.com/en-us/library/dn593591.aspx REST api}
 * that allows to access to all SharePoint elemements (webs, lists, document libraries, users, etc.)
 *
 * ngSharePoint aims to facilitate this REST access through a set of angular services and directives.
 * 
 * ## Usage
 * To use ngSharePoint you'll need to include this module as a dependency within your angular app.
 * <pre>
 *
 *   <script src="js/angular.js"></script>
 *   <!-- Include the ngSharePoint script -->
 *   <script src="js/ng-sharepoint.min.js"></script>
 *
 *   <!-- Include the ngSharePoint templates (if you need forms) -->
 *   <script src="js/ng-sharepoint.sharepoint.templates.js"></script>
 *
 *   <script>
 *     // ...and add 'ngSharePoint' as a dependency
 *     var myApp = angular.module('myApp', ['ngSharePoint']);
 *   </script>
 *
 * </pre>
 * 
 * @author Pau Codina [<pau.codina@kaldeera.com>]
 * @author Pedro Castro [<pedro.cm@gmail.com>]
 * @license Licensed under the MIT License
 * @copyright Copyright (c) 2014
 */

angular.module('ngSharePoint', ['ngSharePoint.templates', 'CamlHelper']);




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

