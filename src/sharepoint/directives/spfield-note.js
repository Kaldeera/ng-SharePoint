/*
	SPFieldNote - directive
	
	Pau Codina (pau.codina@kaldeera.com)
	Pedro Castro (pedro.castro@kaldeera.com, pedro.cm@gmail.com)

	Copyright (c) 2014
	Licensed under the MIT License
*/



///////////////////////////////////////
//	SPFieldNote
///////////////////////////////////////

angular.module('ngSharePoint').directive('spfieldNote', 

	['SPFieldDirective',

	function spfielNote_DirectiveFactory(SPFieldDirective) {

		var spfieldNote_DirectiveDefinitionObject = {

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
					fieldTypeName: 'note',
					replaceAll: false
				};


				SPFieldDirective.baseLinkFn.apply(directive, arguments);

			} // link

		}; // Directive definition object


		return spfieldNote_DirectiveDefinitionObject;

	} // Directive factory

]);