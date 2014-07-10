/*
	SPFieldChoice - directive
	
	Pau Codina (pau.codina@kaldeera.com)
	Pedro Castro (pedro.castro@kaldeera.com, pedro.cm@gmail.com)

	Copyright (c) 2014
	Licensed under the MIT License
*/



///////////////////////////////////////
//	SPFieldChoice
///////////////////////////////////////

angular.module('ngSharePoint').directive('spfieldChoice', 

	['SPUtils', '$compile', '$templateCache', '$http',

	function(SPUtils, $compile, $templateCache, $http) {

		return {

			restrict: 'EA',
			require: ['^spform', 'ngModel'],
			replace: true,
			scope: {
				mode: '@',
				value: '=ngModel'
			},
			//templateUrl: 'templates/form-templates/spfield-text.html',
			template: '<div></div>',

			link: function($scope, $element, $attrs, controllers) {

				//console.log('SPFieldChoice.postLink (' + $attrs.name + ')');

				$scope.schema = controllers[0].getFieldSchema($attrs.name);

				// Watch for form mode changes
				$scope.$watch(function() {

					return $scope.mode || controllers[0].getFormMode();

				}, function(newValue) {

					$scope.currentMode = newValue;
					renderField(newValue);

				});



				function renderField(mode) {

					$http.get('templates/form-templates/spfield-choice-' + mode + '.html', { cache: $templateCache }).success(function(html) {
						var newElement = $compile(html)($scope);
						$element.replaceWith(newElement);
						$element = newElement;
					});

				}

			}

		};

	}

]);