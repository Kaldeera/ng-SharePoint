/*
	SPFieldUrl - directive
	
	Pau Codina (pau.codina@kaldeera.com)
	Pedro Castro (pedro.castro@kaldeera.com, pedro.cm@gmail.com)

	Copyright (c) 2014
	Licensed under the MIT License
*/



///////////////////////////////////////
//	SPFieldUrl
///////////////////////////////////////

angular.module('ngSharePoint').directive('spfieldUrl', 

	['SPFieldDirective',

	function spfieldUrl_DirectiveFactory(SPFieldDirective) {

		var spfieldUrl_DirectiveDefinitionObject = {

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
					fieldTypeName: 'url',
					replaceAll: false,

					init: function() {
						$scope.UrlFieldTypeText = Strings.STS.L_UrlFieldTypeText;
						$scope.UrlFieldTypeDescription = Strings.STS.L_UrlFieldTypeDescription;
						$scope.UrlFieldClickText = Strings.STS.L_UrlFieldClickText;
						$scope.Description_Text = Strings.STS.L_Description_Text;
					},

					parserFn: function(modelValue, viewValue) {
						
						// Required validity
						$scope.modelCtrl.$setValidity('required', !$scope.schema.Required || ($scope.value && $scope.value.Url));
						
						// Url validity
						var validUrlRegExp = new RegExp('^http://');
						$scope.modelCtrl.$setValidity('url', ($scope.value && $scope.value.Url && validUrlRegExp.test($scope.value.Url)));
						
						// TODO: Update 'spfieldValidationMessages' directive to include the url validity error message.

						return $scope.value;
					}
				};


				SPFieldDirective.baseLinkFn.apply(directive, arguments);

/*
				var formCtrl = controllers[0], modelCtrl = controllers[1];
				$scope.modelCtrl = modelCtrl;

				$scope.schema = formCtrl.getFieldSchema($attrs.name);
				$scope.UrlFieldTypeText = Strings.STS.L_UrlFieldTypeText;
				$scope.UrlFieldTypeDescription = Strings.STS.L_UrlFieldTypeDescription;
				$scope.UrlFieldClickText = Strings.STS.L_UrlFieldClickText;
				$scope.Description_Text = Strings.STS.L_Description_Text;
				$scope.SPClientRequiredValidatorError = Strings.STS.L_SPClientRequiredValidatorError;

				

				// ****************************************************************************
				// Watch for form mode changes.
				//
				$scope.$watch(function() {

					return $scope.mode || formCtrl.getFormMode();

				}, function(newValue) {

					$scope.currentMode = newValue;
					renderField(newValue);

				});



				// ****************************************************************************
				// Renders the field with the correct layout based on the form mode.
				//
				function renderField(mode) {

					$http.get('templates/form-templates/spfield-url-' + mode + '.html', { cache: $templateCache }).success(function(html) {
						var newElement = $compile(html)($scope);
						$element.replaceWith(newElement);
						$element = newElement;
					});

				}
*/
			} // link

		}; // Directive definition object


		return spfieldUrl_DirectiveDefinitionObject;

	} // Directive factory

]);