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
				mode: '@'
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

					renderFn: function() {

						var value = $scope.modelCtrl.$viewValue;

                        // Adjust the model if no value is provided
                        if (value === null || value === void 0) {
                            value = { Url: '', Description: '' };
                        }

                        $scope.Url = value.Url;
                        $scope.Description = value.Description;

                        // Replace standar required validator
                        $scope.modelCtrl.$validators.required = function(modelValue, viewValue) {

                            if ($scope.currentMode != 'edit') return true;
                            if (!$scope.schema.Required) return true;
                            if (viewValue) {

                            	if (viewValue.Url !== void 0 && viewValue.Url !== '') return true;
                            }

                            return false;
                        };
					}
				};

				SPFieldDirective.baseLinkFn.apply(directive, arguments);

				$scope.$watch('[Url,Description]', function(newValue, oldValue) {

					if (newValue === oldValue) return;
					
					$scope.modelCtrl.$setViewValue({
						Url: $scope.Url,
						Description: $scope.Description
					});
				});

	            $scope.modelCtrl.$validators.url = function(modelValue, viewValue) {

	            	if (viewValue === void 0) return true;
	            	if (viewValue === null) return true;
	            	if (viewValue.Url === void 0 || viewValue.Url === '') return true;

					var validUrlRegExp = new RegExp('^http://');
					return validUrlRegExp.test(viewValue.Url);
	            };

			} // link

		}; // Directive definition object


		return spfieldUrl_DirectiveDefinitionObject;

	} // Directive factory

]);
