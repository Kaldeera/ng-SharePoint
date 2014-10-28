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

	['SPFieldDirective',

	function spfieldChoice_DirectiveFactory(SPFieldDirective) {

		var spfieldChoice_DirectiveDefinitionObject = {

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
					fieldTypeName: 'choice',
					replaceAll: false,

					init: function() {

						$scope.choices = $scope.schema.Choices.results;
					}
				};
				

				SPFieldDirective.baseLinkFn.apply(directive, arguments);

			} // link

		}; // Directive definition object


		return spfieldChoice_DirectiveDefinitionObject;

	} // Directive factory

]);