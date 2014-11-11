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

					parserFn: function(viewValue) {
						
						// Required validity
						directive.setValidity('required', !$scope.schema.Required || ($scope.value && $scope.value.Url));
						
						// Url validity
						var validUrlRegExp = new RegExp('^http://');
						directive.setValidity('url', ($scope.value && $scope.value.Url && validUrlRegExp.test($scope.value.Url)));
						
						// TODO: Update 'spfieldValidationMessages' directive to include the url validity error message.

						return viewValue;
					}
				};


				SPFieldDirective.baseLinkFn.apply(directive, arguments);

			} // link

		}; // Directive definition object


		return spfieldUrl_DirectiveDefinitionObject;

	} // Directive factory

]);