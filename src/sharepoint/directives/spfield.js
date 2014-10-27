/*
	SPField - directive
	
	Pau Codina (pau.codina@kaldeera.com)
	Pedro Castro (pedro.castro@kaldeera.com, pedro.cm@gmail.com)

	Copyright (c) 2014
	Licensed under the MIT License
*/



///////////////////////////////////////
//	SPField
///////////////////////////////////////

angular.module('ngSharePoint').directive('spfield', 

	['$compile', '$templateCache', '$http',

	function($compile, $templateCache, $http) {

		return {

			restrict: 'EA',
			//replace: true,
			template: '<tr></tr>',

			compile: function(element, attrs) {

				return {
					
					pre: function($scope, $element, $attrs) {

						$http.get('templates/form-templates/spfield.html', { cache: $templateCache }).success(function(html) {

							var mode = ($attrs.mode ? 'mode="' + $attrs.mode + '"' : '');
							var dependsOn = ($attrs.dependsOn ? 'depends-on="' + $attrs.dependsOn + '"' : '');
							var renderAs = ($attrs.renderAs ? 'render-as="' + $attrs.renderAs + '"' : '');

							html = html.replace(/\{\{name\}\}/g, $attrs.spfield || $attrs.name)
									   .replace(/\{\{mode\}\}/g, mode)
									   .replace(/\{\{renderAs\}\}/g, renderAs)
									   .replace(/\{\{dependsOn\}\}/g, dependsOn);

							
							var newElement = $compile(html)($scope);
							$element.replaceWith(newElement);
							$element = newElement;

						});

					}
					
				};

			}

		};

	}

]);
