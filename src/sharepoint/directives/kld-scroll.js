/*
	kld-scroll
	Pau Codina for Kaldeera
	Copyright (c) 2014 Pau Codina (pau.codina@kaldeera.com)
	Licensed under the MIT License

	Scroll of a SPList
*/


angular.module('kld.ngSharePoint')
.directive('kldScroll', ['SPUtils', '$compile', '$templateCache', '$http', function (SPUtils, $compile, $templateCache, $http) {

	'use strict';

	return {
		restrict: 'EA',
		replace: true,
		templateUrl: 'templates/scroll.html',
		scope: {
			pageSize: '@',
			list: '=',
			query: '=',
			results: '=',
			autoScroll: '=',
			forwardOnly: '='
		},
		compile: function(element, attrs) {

			return {
				pre: function preLink($scope, $element, $attrs) {
					if (attrs.templateUrl) {
						$http.get(attrs.templateUrl, { cache:  $templateCache }).success(function (html) {
							var newElement = $compile(html)($scope);
							$element.replaceWith(newElement);
						});

					}
				},
				post: function postLink($scope, $element, $attrs) {
					if ($scope.autoScroll) {
						// Detects end of scroll and launch the next page load request
						$(window).scroll(function() {
							if($(window).scrollTop() + $(window).height() >= $(document).height() - 150) {
								if (!$scope.lastPage && !$scope.onLoading) {
									$scope.loadNextPage();
								}
							}
						});
					};

					$scope.lastPage = false;
					$scope.firstPage = true;
					$scope.onLoading = false;
					$scope.noResults = false;
					$scope.currentPage = 0;

					SPUtils.SharePointReady().then(function () {
						$scope.list.initContext().then(function () {

							$scope.$watch(function () {
								return $scope.query.filter;
							}, function (newValue) {					
								$scope.onLoading = true;
								$scope.noResults = false;
								$scope.query.top = $attrs.pageSize;
								$scope.pageInfo = undefined;
								$scope.results = [];
								$scope.lastPage = false;
								$scope.firstPage = true;
								$scope.currentPage = 0;
								$scope.loadNextPage();
							}, true);

						});
					});

					$scope.loadNextPage = function () {
						$scope.onLoading = true;
						$scope.query.pagingInfo = ($scope.pageInfo ? $scope.pageInfo.get_pagingInfo() : '');
						$scope.list.getListItems($scope.query).then(function (results) {
							if ($scope.forwardOnly) {
								// If forwardOnly accumulates the result set
								angular.forEach(results, function (res) {
									$scope.results.push(res);
								});

								if ($scope.results.length == 0) {
									$scope.noResults = true;
								} else {
									$scope.noResults = false;
								}
							} else {
								// If not fordwarOnly replace the result set
								$scope.results = results;
							}
							$scope.currentPage++;
							$scope.pageInfo = $scope.list.Items.get_listItemCollectionPosition();
							if ($scope.pageInfo == null) $scope.lastPage = true;
							$scope.firstPage = ($scope.currentPage == 1);
							$scope.onLoading = false;
						});
					};

					$scope.loadPreviousPage = function () {
						$scope.onLoading = true;
						$scope.query.pagingInfo = 'Paged=TRUE&PagedPrev=TRUE&p_ID=' + $scope.list.Items.get_item(0).get_id();
						$scope.list.getListItems($scope.query).then(function (results) {
							$scope.results = results;
							$scope.pageInfo = $scope.list.Items.get_listItemCollectionPosition();
							$scope.lastPage = false;
							$scope.currentPage--;
							$scope.firstPage = ($scope.currentPage == 1);
							$scope.onLoading = false;
						});
					}
				}
			};
		}
	};
}]);
