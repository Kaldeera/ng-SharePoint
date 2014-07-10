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

	['SPUtils', '$compile', '$templateCache', '$http',

	function(SPUtils, $compile, $templateCache, $http) {

		return {

			restrict: 'EA',
			replace: true,
			template: '<tr></tr>',
			//templateUrl: 'templates/form-templates/spfield.html',

			compile: function(element, attrs) {

				//console.log('SPField.compile (' + attrs.name + ')');

				return {
					pre: function($scope, $element, $attrs) {

						//console.log('SPField.preLink (' + $attrs.name + ')', $attrs);

						$http.get('templates/form-templates/spfield.html', { cache: $templateCache }).success(function(html) {

							var mode = ($attrs.mode ? 'mode="' + $attrs.mode + '"' : '');
							html = html.replace(/\{\{name\}\}/g, $attrs.name).replace(/\{\{mode\}\}/g, mode);
								
							var newElement = $compile(html)($scope);
							$element.replaceWith(newElement);
							$element = newElement;

						});

/*
						var fieldHTML = '<spfield-label name="' + $attrs.name + '"></spfield-label>'+
										'<spfield-control name="' + $attrs.name + '"></spfield-control>' +
										'<spfield-description name="' + $attrs.name + '"></spfield-description>';

						$element.html('').append(fieldHTML);
						$compile($element)($scope);
*/

					},

					post: function($scope, $element, $attrs) {
						//console.log('SPField.postLink (' + $attrs.name + ')');
					}
				};

			}

		};

	}

]);
