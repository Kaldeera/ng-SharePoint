/*
	SPFieldNumber - directive
	SPNumber - directive

	Pau Codina (pau.codina@kaldeera.com)
	Pedro Castro (pedro.castro@kaldeera.com, pedro.cm@gmail.com)

	Copyright (c) 2014
	Licensed under the MIT License
*/



///////////////////////////////////////
//	SPFieldNumber
///////////////////////////////////////

angular.module('ngSharePoint').directive('spfieldNumber',

	['SPFieldDirective', 'SPUtils',

	function spfieldNumber_DirectiveFactory(SPFieldDirective, SPUtils) {

		var spfieldNumber_DirectiveDefinitionObject = {

			restrict: 'EA',
			require: ['^spform', 'ngModel'],
			replace: true,
			scope: {
				mode: '@'
			},
			templateUrl: 'templates/form-templates/spfield-control.html',


			link: function($scope, $element, $attrs, controllers) {


				var directive = {

					fieldTypeName: 'number',
					replaceAll: false,

					init: function() {

						var xml = SPUtils.parseXmlString($scope.schema.SchemaXml);
						var percentage = xml.documentElement.getAttribute('Percentage') || $scope.schema.Percentage || 'false';
						var decimals = xml.documentElement.getAttribute('Decimals') || $scope.schema.Decimals || 'auto';
						$scope.schema.Percentage = percentage.toLowerCase() === 'true';
						$scope.schema.Decimals = parseInt(decimals);
						$scope.cultureInfo = (typeof __cultureInfo == 'undefined' ? Sys.CultureInfo.CurrentCulture : __cultureInfo);
					},

					formatterFn: function(modelValue) {

                        if (typeof modelValue === 'string') {
                            modelValue = parseFloat(modelValue);
							if (isNaN(modelValue)) modelValue = undefined;
                        }

						$scope.formCtrl.fieldValueChanged($scope.schema.InternalName, modelValue, $scope.lastValue);
						$scope.lastValue = modelValue;

                        return modelValue;
                    },

					parserFn: function(viewValue) {

						if ($scope.lastValue !== parseFloat(viewValue)) {
							// Calls the 'fieldValueChanged' method in the SPForm controller to broadcast to all child elements.
							$scope.formCtrl.fieldValueChanged($scope.schema.InternalName, parseFloat(viewValue), $scope.lastValue);
							$scope.lastValue = parseFloat(viewValue);
						}

						return parseFloat(viewValue);
                    }
				};


				SPFieldDirective.baseLinkFn.apply(directive, arguments);

	            $scope.modelCtrl.$validators.number = function(modelValue, viewValue) {

	            	return (viewValue === undefined) || (!isNaN(viewValue) && isFinite(viewValue));
	            };

			} // link

		}; // Directive definition object


		return spfieldNumber_DirectiveDefinitionObject;

	} // Directive factory

]);





///////////////////////////////////////
//	SPNumber
///////////////////////////////////////

angular.module('ngSharePoint').directive('spPercentage',

	[

	function spPercentage_DirectiveFactory() {

		var spPercentageDirectiveDefinitionObject = {

			restrict: 'A',
			require: 'ngModel',

			link: function($scope, $element, $attrs, ngModel) {

				ngModel.$formatters.push(function(value) {
					if ($scope.schema.Percentage && value !== void 0) {
						// If decimals is set to 'Auto', use 2 decimals for percentage values.
						var decimals = isNaN($scope.schema.Decimals) ? 2 : $scope.schema.Decimals;
						return (value * 100).toFixed(decimals);
					} else {
						return value;
					}
				});


				ngModel.$parsers.push(function(value) {
					if ($scope.schema.Percentage && value !== void 0) {
						// If decimals is set to 'Auto', use 2 decimals for percentage values.
						// var decimals = isNaN($scope.schema.Decimals) ? 2 : $scope.schema.Decimals;
						var percentageNumber = parseFloat(value / 100);
						return (isNaN(value)) ? value : percentageNumber;
					} else {
						return value;
					}
				});

			} // link

		}; // Directive definition object


		return spPercentageDirectiveDefinitionObject;

	} // Directive factory

]);
