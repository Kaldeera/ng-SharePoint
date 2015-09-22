/*
	SPFieldContenttypeid - directive
	
	Pau Codina (pau.codina@kaldeera.com)
	Pedro Castro (pedro.castro@kaldeera.com, pedro.cm@gmail.com)

	Copyright (c) 2014
	Licensed under the MIT License
*/



///////////////////////////////////////
//	SPFieldContenttypeid
///////////////////////////////////////

angular.module('ngSharePoint').directive('spfieldContenttypeid', 

	['SPFieldDirective', '$q', '$http', '$templateCache', '$compile', '$filter', '$location', '$window',

	function spfieldFile_DirectiveFactory(SPFieldDirective, $q, $http, $templateCache, $compile, $filter, $location, $window) {

		var spfieldFile_DirectiveDefinitionObject = {

			restrict: 'EA',
			require: ['^spform', 'ngModel'],
			replace: true,
			scope: {
				mode: '@'
			},
			templateUrl: 'templates/form-templates/spfield-control.html',


			link: function($scope, $element, $attrs, controllers) {

				var directive = {
					
					fieldTypeName: 'contenttypeid',
					replaceAll: false,

                    init: function() {

                        $scope.ContentTypes = $filter('filter')($scope.item.list.ContentTypes, function(ct) {
                        	// Not hidden or folder based content types
                        	if (ct.Hidden) return false;
                        	if (ct.StringId.substr(0,6) === '0x0120') return false;
                        	return true;
                        });
                        $scope.selectedContentType = null;
                    },

                    renderFn: function() {

                    	$scope.value = $scope.modelCtrl.$viewValue;
                    	$scope.schema.Title = $scope.item.list.Fields.ContentType.Title;

                    	var cts = $filter('filter')($scope.ContentTypes, { StringId: $scope.modelCtrl.$viewValue});
                    	if (cts.length > 0) {
                    		$scope.selectedContentType = cts[0];
                    		$scope.schema.Description = $scope.selectedContentType.Description;
                    	}
                    },
				};


				SPFieldDirective.baseLinkFn.apply(directive, arguments);

				$scope.contentTypeChanged = function() {

					if ($scope.value !== $scope.modelCtrl.$viewValue) {

                        /**
                         * If user changes the ContentType the complete
                         * form must be refreshed
                         */
                        var currentContentType = utils.getQueryStringParameter('ContentTypeId');
                        if (currentContentType === $scope.value) return;

                        if (currentContentType === undefined) {
                            $window.location.href = $window.location.href + '&ContentTypeId=' + $scope.value;
                        } else {
                            $window.location.href = $window.location.href.replace(currentContentType, $scope.value);
                        }
                    }

//					$scope.modelCtrl.$setViewValue($scope.value);
				};

			} // link

		}; // Directive definition object


		return spfieldFile_DirectiveDefinitionObject;

	} // Directive factory

]);

