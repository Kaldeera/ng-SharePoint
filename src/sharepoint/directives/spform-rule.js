/*
	SPFormRule - directive
	
	Pau Codina (pau.codina@kaldeera.com)
	Pedro Castro (pedro.castro@kaldeera.com, pedro.cm@gmail.com)

	Copyright (c) 2014
	Licensed under the MIT License
*/



///////////////////////////////////////
//	SPFormRule
///////////////////////////////////////

angular.module('ngSharePoint').directive('spformRule', 

	['$compile', '$templateCache', '$http', '$animate',

	function spformRule_DirectiveFactory($compile, $templateCache, $http, $animate) {

		var spformruleDirectiveDefinitionObject = {
			
			restrict: 'E',
			transclude: true,

			link: function ($scope, $element, $attrs, ctrl, transcludeFn) {

//				if ($element.parent().length > 0) {

					if ($attrs.templateUrl) {

						$http.get($attrs.templateUrl, { cache: $templateCache }).success(function (html) {

							var newElement = $compile(html)($scope);
							$element.replaceWith(newElement);
							$element = newElement;

						});

					} else {

						transcludeFn($scope, function (clone) {

							for(var i = clone.length - 1; i >= 0; i--) {
								var e = clone[i];
								//$animate.enter(element, parentElement, afterElement, [options]);
								$animate.enter(e, $element.parent(), $element);
							}
							
						});

						$element.remove();
						$element = null;
					}
//				}
				
			} // link

		}; // Directive definition object


		return spformruleDirectiveDefinitionObject;

	} // Directive factory

]);
