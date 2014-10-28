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
					}
				};


				SPFieldDirective.baseLinkFn.apply(directive, arguments);
/*				
				var formCtrl = controllers[0], modelCtrl = controllers[1];
				$scope.modelCtrl = modelCtrl;

				var schema = formCtrl.getFieldSchema($attrs.name);
				var xml = SPUtils.parseXmlString(schema.SchemaXml);
				var percentage = xml.documentElement.getAttribute('Percentage') || 'false';
				var decimals = xml.documentElement.getAttribute('Decimals') || 'auto';
				schema.Percentage = percentage.toLowerCase() === 'true';
				schema.Decimals = parseInt(decimals);

				$scope.SPClientRequiredValidatorError = Strings.STS.L_SPClientRequiredValidatorError;
				$scope.schema = schema;
				$scope.cultureInfo = (typeof __cultureInfo == 'undefined' ? Sys.CultureInfo.CurrentCulture : __cultureInfo);



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

					$http.get('templates/form-templates/spfield-number-' + mode + '.html', { cache: $templateCache }).success(function(html) {
						var newElement = $compile(html)($scope);
						$element.replaceWith(newElement);
						$element = newElement;
					});

				}
*/
			} // link

		}; // Directive definition object


		return spfieldNumber_DirectiveDefinitionObject;

	} // Directive factory

]);





///////////////////////////////////////
//	SPNumber
///////////////////////////////////////

angular.module('ngSharePoint').directive('spNumber', 

	[

	function spNumber_DirectiveFactory() {

		var spNumberDirectiveDefinitionObject = {

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


		return spNumberDirectiveDefinitionObject;

	} // Directive factory

]);