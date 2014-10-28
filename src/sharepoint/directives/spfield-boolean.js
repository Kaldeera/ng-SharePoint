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
				mode: '@',
				value: '=ngModel'
			},
			templateUrl: 'templates/form-templates/spfield-control.html',
			

			link: function($scope, $element, $attrs, controllers) {


				var directive = {
					fieldTypeName: 'boolean',
					replaceAll: false,
					watchValueFn: function(newValue) {
						$scope.displayValue = newValue ? STSHtmlEncode(Strings.STS.L_SPYes) : STSHtmlEncode(Strings.STS.L_SPNo);
					}
				};


				SPFieldDirective.baseLinkFn.apply(directive, arguments);

/*
				var formCtrl = controllers[0], modelCtrl = controllers[1];
				$scope.modelCtrl = modelCtrl;

				$scope.schema = formCtrl.getFieldSchema($attrs.name);



				// ****************************************************************************
				// Watch for model value changes to parse the display value.
				//
				$scope.$watch('value', function(newValue) {

					$scope.displayValue = newValue ? STSHtmlEncode(Strings.STS.L_SPYes) : STSHtmlEncode(Strings.STS.L_SPNo);
				});



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

					$http.get('templates/form-templates/spfield-boolean-' + mode + '.html', { cache: $templateCache }).success(function(html) {
						var newElement = $compile(html)($scope);
						$element.replaceWith(newElement);
						$element = newElement;
					});

				}
*/				
			} // link

		}; // Directive definition object


		return spfieldBoolean_DirectiveDefinitionObject;

	} // Directive factory

]);