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
			require: '^?spform',
			template: '<div></div>',

			link: function($scope, $element, $attrs, spformController) {

				var name = ($attrs.name || $attrs.spfield);
				var schema;

				if (spformController) schema = spformController.getFieldSchema(name);

				
				if (schema !== void 0) {

					// Checks if attachments are enabled in the list when process the 'Attachments' field.
					if (name === 'Attachments') {

						var item = spformController.getItem();

						if (item !== void 0 && item.list !== void 0 && item.list.EnableAttachments === false) {

							console.error('Can\'t add "Attachments" field because the attachments are disabled in the list.');
							setEmptyElement();
							return;

						}

					}


					$http.get('templates/form-templates/spfield.html', { cache: $templateCache }).success(function(html) {

						var originalAttrs = $element[0].attributes;
						var elementAttributes = '';
						var cssClasses = ['spfield-wrapper'];

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

								cssClasses.push(valueAttr);

								// Leave the 'class' attribute just in the main element (field wrapper) 
								// and do not propagate the attribute to child elements.
								continue;
							}

							elementAttributes += nameAttr + '="' + valueAttr + '" ';
						}


						html = html.replace(/\{\{attributes\}\}/g, elementAttributes.trim());
						html = html.replace(/\{\{classAttr\}\}/g, cssClasses.join(' '));
						
	                    var newElement = $compile(html)($scope);
						$element.replaceWith(newElement);
						$element = newElement;

					});

				} else {

					console.error('Unknown field "' + $attrs.name + '"');
					setEmptyElement();

				}


				function setEmptyElement() {

					var emptyElement = '';
					$element.replaceWith(emptyElement);
					$element = emptyElement;

				}


			} // link

		}; // Directive definition object


        return spfield_DirectiveDefinitionObject;

	} // Directive factory

]);
