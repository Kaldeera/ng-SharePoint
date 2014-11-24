/*
	SPFieldLabel - directive
	
	Pau Codina (pau.codina@kaldeera.com)
	Pedro Castro (pedro.castro@kaldeera.com, pedro.cm@gmail.com)

	Copyright (c) 2014
	Licensed under the MIT License
*/



///////////////////////////////////////
//	SPFieldLabel
///////////////////////////////////////

angular.module('ngSharePoint').directive('spfieldLabel', 

	[

	function spfieldLabel_DirectiveFactory() {

		var spfieldLabel_DirectiveDefinitionObject = {

			restrict: 'EA',
			require: '^spform',
			replace: true,
			scope: {
				mode: '@'
			},
			templateUrl: 'templates/form-templates/spfield-label.html',


			link: function($scope, $element, $attrs, spformController) {

				$scope.schema = spformController.getFieldSchema($attrs.name);

				// Sets the field label
				if ($attrs.label !== void 0) {

					// Custom label
					$scope.label = $attrs.label;

				} else {

					// Default label
					// If no 'label' attribute specified assigns the 'Title' property from the field schema as label.
					// NOTE: If field don't exists, assigns an empty label or code will crash when try to access the schema.
					//	     As alternative could assign the 'name' attribute as label.
					$scope.label = ($scope.schema ? $scope.schema.Title : '');
				}


				// ****************************************************************************
				// Watch for form mode changes.
				//
				$scope.$watch(function() {

					return $scope.mode || spformController.getFormMode();

				}, function(newValue) {

					$scope.currentMode = newValue;

				});

			} // link

		}; // Directive definition object


		return spfieldLabel_DirectiveDefinitionObject;
	
	} // Directive factory

]);
