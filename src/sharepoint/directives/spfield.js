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

	function spfield_DirectiveFactory($compile, $templateCache, $http) {

		var spfield_DirectiveDefinitionObject = {

			restrict: 'EA',
			template: '<div></div>',

			link: function($scope, $element, $attrs) {

				$http.get('templates/form-templates/spfield.html', { cache: $templateCache }).success(function(html) {

					var originalAttrs = $element[0].attributes;
					var elementAttributes = '';

					for (var i = 0; i < originalAttrs.length; i++) {
                        
						var nameAttr = originalAttrs.item(i).nodeName;
						var valueAttr = originalAttrs.item(i).value;

						if (nameAttr == 'ng-repeat') continue;
						if (nameAttr == 'spfield') nameAttr = 'name';
						if (nameAttr == 'class') {
							// Removes AngularJS classes (ng-*)
							valueAttr = valueAttr.replace(/ng-[\w-]*/g, '').trim();

							// If there aren't classes after the removal, skips the 'class' attribute.
							if (valueAttr === '') continue;
						}

						elementAttributes += nameAttr + '="' + valueAttr + '" ';
					}


					html = html.replace(/\{\{attributes\}\}/g, elementAttributes.trim());
					
                    var newElement = $compile(html)($scope);
					$element.replaceWith(newElement);
					$element = newElement;

				});

			} // link

		}; // Directive definition object


        return spfield_DirectiveDefinitionObject;

	} // Directive factory

]);
