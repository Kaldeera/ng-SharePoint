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

	['SPUtils', '$compile', '$templateCache', '$http',

	function(SPUtils, $compile, $templateCache, $http) {

		return {

			restrict: 'EA',
			require: '^spform',
			replace: true,
			templateUrl: 'templates/form-templates/spfield-label.html',
			scope: {
				mode: '@'
			},


			link: function($scope, $element, $attrs, spformController) {

				//console.log('SPFieldLabel.postLink (' + $attrs.name + ')');

				$scope.schema = spformController.getFieldSchema($attrs.name);
				//$scope.label = schema.Title;
				//$scope.required = schema.Required;


				$scope.$watch(function() {

					return $scope.mode || spformController.getFormMode();

				}, function(newValue) {

					$scope.currentMode = newValue;

				});
			}
		};
	}
]);