/*
	SPFieldCurrency - directive
	
	Pau Codina (pau.codina@kaldeera.com)
	Pedro Castro (pedro.castro@kaldeera.com, pedro.cm@gmail.com)

	Copyright (c) 2014
	Licensed under the MIT License
*/



///////////////////////////////////////
//	SPFieldCurrency
///////////////////////////////////////

angular.module('ngSharePoint').directive('spfieldCurrency', 

	['SPFieldDirective',

	function spfieldCurrency_DirectiveFactory(SPFieldDirective) {

		var spfieldCurrency_DirectiveDefinitionObject = {

			restrict: 'EA',
			require: ['^spform', 'ngModel'],
			replace: true,
			scope: {
				mode: '@',
				value: '=ngModel'
			},
			templateUrl: 'templates/form-templates/spfield-control.html',
			

			link: function($scope, $element, $attrs, controllers) {


				var directive = {
					fieldTypeName: 'currency',
					replaceAll: false,

					init: function() {

						$scope.currentyLocaleId = $scope.schema.CurrencyLocaleId;
						// TODO: Get the CultureInfo object based on the field schema 'CurrencyLocaleId' property.
						$scope.cultureInfo = (typeof __cultureInfo == 'undefined' ? Sys.CultureInfo.CurrentCulture : __cultureInfo);

					},

					parserFn: function(modelValue, viewValue) {
						
						// Number validity
						$scope.modelCtrl.$setValidity('number', $scope.value && !isNaN(+$scope.value) && isFinite($scope.value));

						// TODO: Update 'spfieldValidationMessages' directive to include the number validity error message.
						
						return $scope.value;
					}
				};
				

				SPFieldDirective.baseLinkFn.apply(directive, arguments);


/*
				var formCtrl = controllers[0], modelCtrl = controllers[1];
				$scope.modelCtrl = modelCtrl;

				$scope.schema = formCtrl.getFieldSchema($attrs.name);
				$scope.cultureInfo = (typeof __cultureInfo == 'undefined' ? Sys.CultureInfo.CurrentCulture : __cultureInfo);

				// NOTA: El valor de 'CultureInfo' debería de ser el que se indica en el 'schema' del campo en este caso.
				//		 Se debería crear un nuevo objeto 'CultureInfo' (no se cómo) con el valor (LCID) indicado en
				//		 la propiedad 'CurrencyLocaleId' del esquema.


				// ****************************************************************************
				// Watch for form mode changes.
				//
				$scope.$watch(function() {

					return $scope.mode || formCtrl.getFormMode();

				}, function(newValue) {

					$scope.currentMode = newValue;
					renderField(newValue);

				});



				// ****************************************************************************
				// Renders the field with the correct layout based on the form mode.
				//
				function renderField(mode) {

					$http.get('templates/form-templates/spfield-currency-' + mode + '.html', { cache: $templateCache }).success(function(html) {
						var newElement = $compile(html)($scope);
						$element.replaceWith(newElement);
						$element = newElement;
					});

				}
*/
			} // link

		}; // Directive definition object


		return spfieldCurrency_DirectiveDefinitionObject;

	} // Directive factory

]);