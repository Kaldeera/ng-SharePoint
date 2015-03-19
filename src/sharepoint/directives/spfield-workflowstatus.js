/*
	SPFieldWorkflowStatus - directive
	
	Pau Codina (pau.codina@kaldeera.com)
	Pedro Castro (pedro.castro@kaldeera.com, pedro.cm@gmail.com)

	Copyright (c) 2014
	Licensed under the MIT License
*/



///////////////////////////////////////
//	SPFieldWorkflowStatus
///////////////////////////////////////

angular.module('ngSharePoint').directive('spfieldWorkflowstatus', 

	['SPFieldDirective', 'SPUtils',

	function spfieldWorkflowstatus_DirectiveFactory(SPFieldDirective, SPUtils) {

		var spfieldWorkflowstatus_DirectiveDefinitionObject = {

			restrict: 'EA',
			require: ['^spform', 'ngModel'],
			replace: true,
			scope: {
				mode: '@'
			},
			templateUrl: 'templates/form-templates/spfield-control.html',


			link: function($scope, $element, $attrs, controllers) {

				var directive = {
					
					fieldTypeName: 'workflowstatus',
					replaceAll: false,
					displayTemplateUrl: 'templates/form-templates/spfield-workflowstatus-display.html',
					editTemplateUrl: 'templates/form-templates/spfield-workflowstatus-display.html'

//						$scope.choices = $scope.schema.Choices.results;
				};
				
				SPFieldDirective.baseLinkFn.apply(directive, arguments);

				$scope.getWorkflowStatusDisplayValue = function() {

					if ($scope.value !== void 0 && $scope.value !== null) {
						return $scope.schema.Choices.results[$scope.value];
					} else {
						return '';
					}
				};
			}

		}; // Directive definition object


		return spfieldWorkflowstatus_DirectiveDefinitionObject;

	} // Directive factory

]);
