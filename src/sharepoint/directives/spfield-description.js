/*
	SPFieldDescription - directive
	
	Pau Codina (pau.codina@kaldeera.com)
	Pedro Castro (pedro.castro@kaldeera.com, pedro.cm@gmail.com)

	Copyright (c) 2014
	Licensed under the MIT License
*/



///////////////////////////////////////
//	SPFieldDescription
///////////////////////////////////////

angular.module('ngSharePoint')

.directive('spfieldDescription', function() {

	return {

		restrict: 'EA',
		require: '^spform',
		replace: true,
		templateUrl: 'templates/form-templates/spfield-description.html',
		scope: {
			mode: '@'
		},


		link: function($scope, $element, $attrs, spformController) {

			$scope.schema = spformController.getFieldSchema($attrs.name);



			// ****************************************************************************
			// Watch for form mode changes.
			//
			$scope.$watch(function() {

				return $scope.mode || spformController.getFormMode();

			}, function(newValue) {

				$scope.currentMode = newValue;

			});
		}
	};
	
});