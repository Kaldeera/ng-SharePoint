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

	function spformToolbar_DirectiveFactory($compile, $templateCache, $http, SPUtils) {

		var spformToolbarDirectiveDefinitionObject = {

			restrict: 'EA',
			require: '^spform',
			replace: true,
			templateUrl: 'templates/form-templates/spform-toolbar.html',


			link: function($scope, $element, $attrs, spformController) {


				$scope.isInDesignMode = SPUtils.inDesignMode();
				$scope.status = spformController.status;

				SPUtils.SharePointReady().then(function() {
					$scope.CloseButtonCaption = STSHtmlEncode(Strings.STS.L_CloseButtonCaption);
					$scope.SaveButtonCaption = STSHtmlEncode(Strings.STS.L_SaveButtonCaption);
					$scope.CancelButtonCaption = STSHtmlEncode(Strings.STS.L_CancelButtonCaption);
				});



				// ****************************************************************************
				// Watch for form mode changes.
				//
				$scope.$watch(spformController.getFormMode, function(newValue) {
					$scope.mode = newValue;
				});



				// ****************************************************************************
				// Watch for form status changes.
				//
				$scope.$watch(spformController.getFormStatus, function(newValue) {
					$scope.formStatus = newValue;
				});



				// ****************************************************************************
				// Public methods
				//

				$scope.saveForm = function() {

					spformController.save();

				};


				$scope.cancelForm = function() {

					spformController.cancel();

				};

			} // link

		}; // Directive definition object


		return spformToolbarDirectiveDefinitionObject;

	} // Directive factory

]);
