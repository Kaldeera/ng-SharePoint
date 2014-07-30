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

	['$compile', '$templateCache', '$http', 'SPUtils',

	function($compile, $templateCache, $http, SPUtils) {

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

				var schema = controllers[0].getFieldSchema($attrs.name);
				var xml = SPUtils.parseXmlString(schema.SchemaXml);
				var percentage = xml.documentElement.getAttribute('Percentage') || 'false';
				var decimals = xml.documentElement.getAttribute('Decimals') || '0';
				schema.Percentage = percentage.toLowerCase() === 'true';
				schema.Decimals = parseInt(decimals);


				$scope.schema = schema;
				$scope.cultureInfo = (typeof __cultureInfo == 'undefined' ? Sys.CultureInfo.CurrentCulture : __cultureInfo);



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

					$http.get('templates/form-templates/spfield-number-' + mode + '.html', { cache: $templateCache }).success(function(html) {
						var newElement = $compile(html)($scope);
						$element.replaceWith(newElement);
						$element = newElement;
					});

				}

			}

		};

	}

]);





///////////////////////////////////////
//	SPNumber
///////////////////////////////////////

angular.module('ngSharePoint').directive('spNumber', function() {

	return {

		restrict: 'A',
		require: 'ngModel',

		link: function($scope, $element, $attrs, ngModel) {

			ngModel.$formatters.push(function(value) {
				if ($scope.schema.Percentage && value !== void 0) {
					return (value * 100).toFixed($scope.schema.Decimals);
				} else {
					return value;
				}
			});


			ngModel.$parsers.push(function(value) {
				if ($scope.schema.Percentage && value !== void 0) {
					return (value / 100).toFixed($scope.schema.Decimals);
				} else {
					return value;
				}
			});
		}

	};

});