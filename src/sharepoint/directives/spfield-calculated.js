/*
	SPFieldCalculated - directive
	
	Pau Codina (pau.codina@kaldeera.com)
	Pedro Castro (pedro.castro@kaldeera.com, pedro.cm@gmail.com)

	Copyright (c) 2014
	Licensed under the MIT License
*/



///////////////////////////////////////
//	SPFieldCalculated
///////////////////////////////////////

angular.module('ngSharePoint').directive('spfieldCalculated', 

	[

	function spfieldCalculated_DirectiveFactory() {

		var spfieldCalculated_DirectiveDefinitionObject = {

			restrict: 'EA',
			require: ['^spform', 'ngModel'],
			replace: true,
			scope: {
				value: '=ngModel'
			},
			templateUrl: 'templates/form-templates/spfield-text-display.html'

		}; // Directive definition object


		return spfieldCalculated_DirectiveDefinitionObject;

	} // Directive factory

]);
