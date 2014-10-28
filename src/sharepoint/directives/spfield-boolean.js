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

			} // link

		}; // Directive definition object


		return spfieldBoolean_DirectiveDefinitionObject;

	} // Directive factory

]);