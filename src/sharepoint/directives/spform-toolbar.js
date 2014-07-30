/*
	SPFormToolbar - directive
	
	Pau Codina (pau.codina@kaldeera.com)
	Pedro Castro (pedro.castro@kaldeera.com, pedro.cm@gmail.com)

	Copyright (c) 2014
	Licensed under the MIT License
*/



///////////////////////////////////////
//	SPFormToolbar
///////////////////////////////////////

angular.module('ngSharePoint').directive('spformToolbar', 

	['$compile', '$templateCache', '$http', 'SPUtils',

	function($compile, $templateCache, $http, SPUtils) {

		return {

			restrict: 'EA',
			require: '^spform',
			replace: true,
			templateUrl: 'templates/form-templates/spform-toolbar.html',


			link: function($scope, $element, $attrs, spformController) {


				$scope.isInDesignMode = SPUtils.inDesignMode();



				// ****************************************************************************
				// Watch for form mode changes.
				//
				$scope.$watch(spformController.getFormMode, function(newValue) {
					$scope.mode = newValue;
				});



				$scope.saveForm = function() {

					spformController.save();

				};



				$scope.cancelForm = function() {

					spformController.cancel();

				};

			}

		};

	}

]);
