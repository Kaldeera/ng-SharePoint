/*
	SPFieldText - directive
	
	Pau Codina (pau.codina@kaldeera.com)
	Pedro Castro (pedro.castro@kaldeera.com, pedro.cm@gmail.com)

	Copyright (c) 2014
	Licensed under the MIT License
*/



///////////////////////////////////////
//	SPFieldText
///////////////////////////////////////

angular.module('ngSharePoint').directive('spfieldText', 

	['SPFieldDirective',

	function spfieldText_DirectiveFactory(SPFieldDirective) {

		var spfieldText_DirectiveDefinitionObject = {

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
					
					fieldTypeName: 'text',
					replaceAll: false
				};


				SPFieldDirective.baseLinkFn.apply(directive, arguments);

			} // link

		}; // Directive definition object


		return spfieldText_DirectiveDefinitionObject;

	} // Directive factory

]);
