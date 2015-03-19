/*
	SPFieldFile - directive
	
	Pau Codina (pau.codina@kaldeera.com)
	Pedro Castro (pedro.castro@kaldeera.com, pedro.cm@gmail.com)

	Copyright (c) 2014
	Licensed under the MIT License
*/



///////////////////////////////////////
//	SPFieldFile
///////////////////////////////////////

angular.module('ngSharePoint').directive('spfieldFile', 

	['SPFieldDirective', '$q', '$http', '$templateCache', '$compile',

	function spfieldFile_DirectiveFactory(SPFieldDirective, $q, $http, $templateCache, $compile) {

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
					
					fieldTypeName: 'file',
					replaceAll: false,

					watchModeFn: function(newValue) {

						if ($scope.name === 'FileLeafRef') {

							$scope.fileName = $scope.item.File.Name;
							var idx = $scope.fileName.lastIndexOf('.');
							if (idx === -1) {
								$scope.value = $scope.fileName;
								$scope.extension = '';
							} else {
								$scope.value = $scope.fileName.substr(0, $scope.fileName.lastIndexOf('.'));
								$scope.extension = $scope.fileName.substr($scope.fileName.lastIndexOf('.'));
							}

							$scope.url = $scope.item.File.ServerRelativeUrl;

							$scope.modelCtrl.$setViewValue($scope.value);

						} else {
							console.error('Unknown SPFile field');
							return;
						}

						directive.renderField();
					}
				};


				SPFieldDirective.baseLinkFn.apply(directive, arguments);

	            $scope.modelCtrl.$validators.pattern = function(modelValue, viewValue) {
	            	// ~ " # % & * : < > ? / \ { | }.
					var rg1=/^[^\\\/:\*\?"<>\|\~#&{}%]+$/; 				// forbidden characters \ / : * ? " < > |
					var rg2=/^\./; 										// cannot start with dot (.)
//					var rg3=/^(nul|prn|con|lpt[0-9]|com[0-9])(\.|$)/i; 	// forbidden file names
					var fname = modelValue || viewValue;

					return rg1.test(fname) && !rg2.test(fname); // && !rg3.test(fname);
	            };



				$scope.EditOrDownload = function($event) {

		            $event.preventDefault();

		            switch($scope.extension.ltrim('.')) {
						case 'doc':
						case 'docx':
						case 'xsl':
						case 'xslx':
						case 'ppt':
						case 'pptx':
				            editDocumentWithProgID2($scope.url, '', 'SharePoint.OpenDocuments', '0', _spPageContextInfo.siteAbsoluteUrl, '0');
				            break;

				        default:
				        	document.location = $scope.url;
		            }

		            return false;
				};

			} // link

		}; // Directive definition object


		return spfieldFile_DirectiveDefinitionObject;

	} // Directive factory

]);
