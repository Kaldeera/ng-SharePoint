/*
	kld-splist
	Pau Codina for Kaldeera
	Copyright (c) 2014 Pau Codina (pau.codina@kaldeera.com)
	Licensed under the MIT License


	kld-Splist make a query to a specified list and place the result set into a new
	scope array (ListItems).

	Example:

	<div kld-Splist="Announcements">
		<ul ng-repeat="item in ListItems">
			<li>{{item.title}}</li>
		</ul>
	</div>

	Other params:

	template-url: you can specify a new template to be loaded and replace the contents of the directive when records are loaded

		<div kld-Splist="Tasks" template-url="templates/mytasks.html">
			<img src="loading.gif" title="Loading" />
		</div>

	query: you can pass a string with a valid CAML query or a object with specific query parameters (OData format)
			supported values:
				filter: a valid odata filter sentence
				orderBy: list of field names on which the results are sorted
				select: list of field names to be retrieved
				top: 10

 			More info at http://docs.oasis-open.org/odata/odata/v4.0/os/part1-protocol/odata-v4.0-os-part1-protocol.html#_Toc372793681

			example:
			{
				filter: 'Country eq USA and Modified eq [Today]',
				orderBy: 'Title asc, Modified desc',
				select: 'Title, Country',
				top: 10
			}

			NOTE: not all OData sentences and functions are implemented
*/


angular.module('kld.ngSharePoint')
.directive('kldSplist', ['SPUtils', 'SharePoint', '$compile', '$templateCache', '$http', function (SPUtils, SharePoint, $compile, $templateCache, $http) {
	return {
		restrict: 'A',
		replace: true,
		transclude: true,
		scope: {
			list: '@kldSplist',
			web: '@spweb',
			query: '@'
		},
		compile: function (element, attrs, transclude) {
			return function ($scope, $element, $attrs) {
				if (SPUtils.inDesignMode()) return ;

				transclude($scope, function (clone) {
					angular.forEach(clone, function (e) {
						$element.append(e);
					});
				});

				$scope.ListItems = [];

				$scope.SPList = SharePoint.SPList($attrs.kldSplist, $attrs.spweb);
				if (typeof $scope.query == 'string') {
					$scope.query = $scope.$eval($scope.query);
				}

				function retrieveData() {
					$scope.SPList.getListItems($scope.query).then(function(data) {
						$scope.ListItems = data;

						if ($attrs.templateUrl && !$scope.templateLoaded) {
							$http.get($attrs.templateUrl, { cache:  $templateCache }).success(function (html) {
								var newElement = $compile(html)($scope);
								$element.html('').append(newElement);
								$scope.templateLoaded = true;
							});
						}
					}, function (error) {
						console.error(angular.toJson(error));
					});
				}

				$scope.$watch('query', function(newValue) {
					retrieveData();
				}, true);
			};
		}
	};
}]);
