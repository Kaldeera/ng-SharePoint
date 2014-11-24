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
				mode: '@',
				value: '=ngModel'
			},
			templateUrl: 'templates/form-templates/spfield-control.html',


			link: function($scope, $element, $attrs, controllers) {


				var directive = {
					
					fieldTypeName: 'number',
					replaceAll: false,

					init: function() {

						var xml = SPUtils.parseXmlString($scope.schema.SchemaXml);
						var percentage = xml.documentElement.getAttribute('Percentage') || 'false';
						var decimals = xml.documentElement.getAttribute('Decimals') || 'auto';
						$scope.schema.Percentage = percentage.toLowerCase() === 'true';
						$scope.schema.Decimals = parseInt(decimals);
						$scope.cultureInfo = (typeof __cultureInfo == 'undefined' ? Sys.CultureInfo.CurrentCulture : __cultureInfo);
					},

					parserFn: function(viewValue) {
						
						// Number validity
						directive.setValidity('number', !viewValue || (!isNaN(+viewValue) && isFinite(viewValue)));

						// TODO: Update 'spfieldValidationMessages' directive to include the number validity error message.

						// Adjust value to match field type 'Double' in SharePoint.
						if (viewValue === '' || viewValue === void 0) {
						
							$scope.value = null;
						}
						
						return $scope.value;
					}
				};


				SPFieldDirective.baseLinkFn.apply(directive, arguments);

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
						var decimals = isNaN($scope.schema.Decimals) ? 2 : $scope.schema.Decimals;
						return (value / 100).toFixed(decimals);
					} else {
						return value;
					}
				});

			} // link

		}; // Directive definition object


		return spPercentageDirectiveDefinitionObject;

	} // Directive factory

]);
