/*
	SPFieldControl - directive
	
	Pau Codina (pau.codina@kaldeera.com)
	Pedro Castro (pedro.castro@kaldeera.com, pedro.cm@gmail.com)

	Copyright (c) 2014
	Licensed under the MIT License
*/



///////////////////////////////////////
//	SPFieldControl
///////////////////////////////////////

angular.module('ngSharePoint').directive('spfieldControl', 

	['$compile', '$templateCache', '$http',

	function($compile, $templateCache, $http) {

		return {

			restrict: 'EA',
			require: '^spform',
			replace: true,
			templateUrl: 'templates/form-templates/spfield-control.html',


			link: function($scope, $element, $attrs, spformController) {

				$scope.fieldSchema = spformController.getFieldSchema($attrs.name);
				
				if ($scope.fieldSchema !== void 0) {

					// Sets the default value for the field
					spformController.initField($attrs.name);

					// NOTE: Include a <spfield-control name="<name_of_the_field>" mode="hidden" /> to initialize the field with it's default value.
					if ($attrs.mode == 'hidden') {
						$element.addClass('ng-hide');
 						return;
					}

					// Gets the field type
					var fieldType = $attrs.renderAs | $scope.fieldSchema.TypeAsString;
					if (fieldType === 'UserMulti') fieldType = 'User';

					// Gets the field name
					var fieldName = $attrs.name + (fieldType == 'Lookup' || fieldType == 'LookupMulti' || fieldType == 'User' || fieldType == 'UserMulti' ? 'Id' : '');
					if ((fieldType == 'Lookup' || fieldType == 'LookupMulti') && $scope.fieldSchema.PrimaryFieldId !== null) {
						var primaryFieldSchema = spformController.getFieldSchema($scope.fieldSchema.PrimaryFieldId);

						if (primaryFieldSchema !== void 0) {
							fieldName = primaryFieldSchema.InternalName + 'Id';
						}
					}

					// Gets the field mode
					var mode = ($attrs.mode ? ' mode="' + $attrs.mode + '"' : '');
					var dependsOn = ($attrs.dependsOn ? ' depends-on="' + $attrs.dependsOn + '"' : '');
					var hidden = ($attrs.mode == 'hidden' ? ' ng-hide="true"' : '');

					// Mount the field directive HTML
					var fieldControlHTML = '<spfield-' + fieldType + ' ng-model="item.' + fieldName + '" name="' + $attrs.name + '"' + mode + dependsOn + hidden + '></spfield-' + fieldType + '>';

					$element.append(fieldControlHTML);
					$compile($element)($scope);

				} else {

					console.error('Unknown field ' + $attrs.name);
				}
			}

		};

	}

]);
