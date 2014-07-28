/*
	SPFieldMultiChoice - directive
	
	Pau Codina (pau.codina@kaldeera.com)
	Pedro Castro (pedro.castro@kaldeera.com, pedro.cm@gmail.com)

	Copyright (c) 2014
	Licensed under the MIT License
*/



///////////////////////////////////////
//	SPFieldMultiChoice
///////////////////////////////////////

angular.module('ngSharePoint').directive('spfieldMultichoice', 

	['$compile', '$templateCache', '$http',

	function($compile, $templateCache, $http) {

		return {

			restrict: 'EA',
			require: ['^spform', 'ngModel'],
			replace: true,
			scope: {
				mode: '@',
				value: '=ngModel'
			},
			template: '<div></div>',

			link: function($scope, $element, $attrs, controllers) {

				$scope.schema = controllers[0].getFieldSchema($attrs.name);

				// Adjust the model if no value is provided
				if ($scope.value === null) {
					$scope.value = { results: [] };
				}

				$scope.choices = $scope.value.results;
				sortChoices();



				// ****************************************************************************
				// Watch for form mode changes.
				//
				$scope.$watch(function() {

					return $scope.mode || controllers[0].getFormMode();

				}, function(newValue) {

					$scope.currentMode = newValue;
					renderField(newValue);

				});



				// ****************************************************************************
				// Renders the field with the correct layout based on the form mode.
				//
				function renderField(mode) {

					$http.get('templates/form-templates/spfield-multichoice-' + mode + '.html', { cache: $templateCache }).success(function(html) {
						var newElement = $compile(html)($scope);
						$element.replaceWith(newElement);
						$element = newElement;
					});

				}



				// ****************************************************************************
				// Updates the model (array of choices) when a checkbox is toggled.
				//
				$scope.toggleCheckbox = function(choice) {

					var idx = $scope.choices.indexOf(choice);

					if (idx != -1) {
						$scope.choices.splice(idx, 1);
					} else {
						$scope.choices.push(choice);
					}

					sortChoices();

				};



				// ****************************************************************************
				// Sort the choices according to the definition order.
				//
				function sortChoices() {

					var sortedChoices = [];

					angular.forEach($scope.schema.Choices.results, function(choice) {

						if($scope.choices.indexOf(choice) != -1) {
							sortedChoices.push(choice);
						}
					});

					$scope.choices = $scope.value.results = sortedChoices;
				}

			}

		};

	}

]);
