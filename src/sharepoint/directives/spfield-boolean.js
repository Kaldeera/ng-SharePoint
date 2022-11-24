/*
	SPFieldBoolean - directive

	Pau Codina (pau.codina@kaldeera.com)
	Pedro Castro (pedro.castro@kaldeera.com, pedro.cm@gmail.com)

	Copyright (c) 2014
	Licensed under the MIT License
*/



///////////////////////////////////////
//	SPFieldBoolean
///////////////////////////////////////

angular.module('ngSharePoint').directive('spfieldBoolean',

	['SPFieldDirective',

	function spfieldBoolean_DirectiveFactory(SPFieldDirective) {

		var spfieldBoolean_DirectiveDefinitionObject = {

			restrict: 'EA',
			require: ['^spform', 'ngModel'],
			replace: true,
			scope: {
				mode: '@'
			},
			templateUrl: 'templates/form-templates/spfield-control.html',


			link: function($scope, $element, $attrs, controllers) {


				var directive = {

					fieldTypeName: 'boolean',
					replaceAll: false,

					renderFn: function() {

						$scope.value = $scope.modelCtrl.$viewValue;
						$scope.displayValue = $scope.modelCtrl.$viewValue === true ? STSHtmlEncode(Strings.STS.L_SPYes) : 
											  $scope.modelCtrl.$viewValue === false ? STSHtmlEncode(Strings.STS.L_SPNo) : "";
					},

					formatterFn: function(modelValue) {

						$scope.formCtrl.fieldValueChanged($scope.schema.InternalName, modelValue, $scope.lastValue);
						$scope.lastValue = modelValue;

                        return modelValue;
                    },

					parserFn: function(viewValue) {

						if ($scope.lastValue !== $scope.value) {
							// Calls the 'fieldValueChanged' method in the SPForm controller to broadcast to all child elements.
							$scope.formCtrl.fieldValueChanged($scope.schema.InternalName, viewValue, $scope.lastValue);
							$scope.lastValue = viewValue;
						}

						return viewValue;
					}
				};


				SPFieldDirective.baseLinkFn.apply(directive, arguments);

			} // link

		}; // Directive definition object


		return spfieldBoolean_DirectiveDefinitionObject;

	} // Directive factory

]);
