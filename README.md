ng-SharePoint
=============

AngularJS ng-SharePoint wraps SharePoint REST API/JSOM into Angular world

A set of services, directives and utilities that allows you to access and interact with SharePoint sites, lists, items and forms.

I like to work with:
* Promises (no global callback functions)
* Directives (easy functional HTML)
* Templates (no javascript concatenation of strings and results)
* Services (encapsulate JSOM and REST calls)
* Other cool frameworks from the community (angular-ui, ionic, ...)

Current Status
--------------
Currently this is a beta version that has only been used in internal projects. We will continue posting improvements and more features in future releases.



Services
--------

	SharePoint provider
	-------------------


	SPWeb factory
	-------------


	SPList factory
	--------------


	SPListItem factory
	------------------
	Easy CRUD operations with SharePoint items.



	SPCache factory
	---------------


	SPUtils factory
	---------------



Directives
----------



Filters
-------



Forms
-----
Use the spform directive to renders SharePoint forms with the standar SharePoint layout and styles or create your own templates/styles for the form, fields, toolbars and more.

Bootstrap css styled forms templates comming soon.


ngSharePointFormPage
--------------------
Actually ngSharePoint includes the module 'ngSharePointFormPage' that contains the directive 'spformpage' that auto obtain the current web, list and item id from a SharePoint form page context (New form, Display form, Edit form).

Example Usage:

		<div data-spformpage="">

			<spform mode="display" item="item">
			</spform>

		</div>