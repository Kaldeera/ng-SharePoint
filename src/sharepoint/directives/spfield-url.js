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

	['$compile', '$templateCache', '$http',

	function($compile, $templateCache, $http) {

		return {

			restrict: 'EA',
			require: ['^spform', 'ngModel'],
			replace: true,
			scope: {
				mode: '@',
				value: '=ngModel'
			},
			template: '<div></div>',

			link: function($scope, $element, $attrs, controllers) {

				$scope.schema = controllers[0].getFieldSchema($attrs.name);
				$scope.UrlFieldTypeText = Strings.STS.L_UrlFieldTypeText;
				$scope.UrlFieldTypeDescription = Strings.STS.L_UrlFieldTypeDescription;
				$scope.UrlFieldClickText = Strings.STS.L_UrlFieldClickText;
				$scope.Description_Text = Strings.STS.L_Description_Text;
				$scope.SPClientRequiredValidatorError = Strings.STS.L_SPClientRequiredValidatorError;

				

				// ****************************************************************************
				// Watch for form mode changes.
				//
				$scope.$watch(function() {

					return $scope.mode || controllers[0].getFormMode();

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

			} // link

		};

	}

]);