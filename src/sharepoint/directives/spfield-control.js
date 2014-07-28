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
				
				spformController.initField($attrs.name);

				var fieldType = $scope.fieldSchema.TypeAsString;
				if (fieldType === 'UserMulti') fieldType = 'User';
				var fieldName = $attrs.name + (fieldType == 'Lookup' || fieldType == 'LookupMulti' || fieldType == 'User' || fieldType == 'UserMulti' ? 'Id' : '');
				var mode = ($attrs.mode ? ' mode="' + $attrs.mode + '"' : '');
				var fieldControlHTML = '<spfield-' + fieldType + ' ng-model="item.' + fieldName + '" name="' + $attrs.name + '"' + mode + '></spfield-' + fieldType + '>';

				$element.append(fieldControlHTML);
				$compile($element)($scope);

			}

		};

	}

]);
