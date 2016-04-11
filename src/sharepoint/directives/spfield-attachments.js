/*
	SPFieldAttachments - directive

	Pau Codina (pau.codina@kaldeera.com)
	Pedro Castro (pedro.castro@kaldeera.com, pedro.cm@gmail.com)

	Copyright (c) 2014
	Licensed under the MIT License
*/



///////////////////////////////////////
//	SPFieldAttachments
///////////////////////////////////////

angular.module('ngSharePoint').directive('spfieldAttachments',

	['SPFieldDirective',

	function spfieldAttachments_DirectiveFactory(SPFieldDirective) {

		var spfieldAttachments_DirectiveDefinitionObject = {

			restrict: 'EA',
			require: ['^spform', 'ngModel'],
			replace: true,
			scope: {
				mode: '@'
			},
			templateUrl: 'templates/form-templates/spfield-control-loading.html',


			link: function($scope, $element, $attrs, controllers) {


				var directive = {

					fieldTypeName: 'attachments',
					replaceAll: false,

					init: function() {

						$scope.DeleteAttachmentText = STSHtmlEncode(Strings.STS.L_DeleteDocItem_Text);
						$scope.AttachFileText = Resources.core.cui_ButAttachFile;
						$scope.LanguageID = _spPageContextInfo.currentLanguage.toString();

					},

					renderFn: function(newValue, oldValue) {

						// Check if the old and new values really differ.
						if (newValue === null && oldValue === undefined) return;



						// Show loading animation.
						directive.setElementHTML('<div><img src="/_layouts/15/images/loadingcirclests16.gif" alt="" /></div>');

						// Gets the files attached to the item
						$scope.$parent.item.getAttachments().then(function(attachmentFiles){

							$scope.attachmentFiles = attachmentFiles;
							directive.renderField();

						}, function(err) {

							$scope.errorMsg = err.message;
							directive.setElementHTML('<span style="color: brown">{{errorMsg}}</span>');
						});
					}
				};


				SPFieldDirective.baseLinkFn.apply(directive, arguments);


				// ****************************************************************************
				// Add new attachment to the item locally.
				// NOTE: Attachments will be effective when save the item.
				//
				$scope.onFileSelect = function($files, $event) {

					angular.forEach($files, function(file) {

						// Checks if filename has already been selected
						var itemIndex = -1;

						for (var i = 0; i < $scope.attachmentFiles.length; i++) {
							if ($scope.attachmentFiles[i].FileName == file.name) {
								itemIndex = i;
								break;
							}
						}


						if (itemIndex >= 0) {

							alert(Strings.STS.L_ConflictReplaceTitle + ' \'' + file.name + '\'.');

						} else {

							$scope.$parent.item.attachments.add.push(file);
							$scope.attachmentFiles.push({ FileName: file.name, local: true });

						}

					});

					// Initialize the 'files' property in the <input type="file" /> object.
					$event.target.value = '';

				};



				// ****************************************************************************
				// Removes existing attachment, local or server side.
				// NOTE: Attachments will be effective when save the item.
				//
				$scope.removeAttachment = function($event, index, local) {

					$event.preventDefault();

					if (local) {

						for (var i = 0; i < $scope.$parent.item.attachments.add.length; i++) {
							if ($scope.$parent.item.attachments.add[i].name == $scope.attachmentFiles[index].FileName) {
								$scope.$parent.item.attachments.add.splice(i, 1);
								break;
							}
						}

						$scope.attachmentFiles.splice(index, 1);

					} else {

						var confirmMessage = Strings.STS.L_ConfirmDelete_TXT;

						if (!!recycleBinEnabled) {
							confirmMessage = Strings.STS.L_ConfirmRecycle_TXT;
						}

						if (confirm(confirmMessage)) {

							$scope.$parent.item.attachments.remove.push($scope.attachmentFiles[index].FileName);
							$scope.attachmentFiles.splice(index, 1);
						}
					}


					return false;

				};



			} // link

		}; // Directive definition object


		return spfieldAttachments_DirectiveDefinitionObject;

	} // Directive factory

]);




angular.module('ngSharePoint').directive('fileSelect',

	['$parse', '$timeout', 'SPRibbon',

	function fileSelect_DirectiveFactory($parse, $timeout, SPRibbon) {

		var fileSelect_DirectiveDefinitionObject = function($scope, $element, $attrs) {

			var fn = $parse($attrs.fileSelect);
			$element.removeAttr('file-select');


			if ($element[0].tagName.toLowerCase() !== 'input' || ($element.attr('type') && $element.attr('type').toLowerCase() !== 'file')) {

				var fileElem = angular.element('<input type="file">');

				for (var i = 0; i < $element[0].attributes.length; i++) {
					fileElem.attr($element[0].attributes[i].name, $element[0].attributes[i].value);
				}

				if ($element.attr("data-multiple")) fileElem.attr("multiple", "true");

				fileElem.css({
					position: 'absolute',
					top: '0px',
					bottom: '0px',
					//left: '0px',
					right: '0px',
					width: '200%',
					margin: '0px',
					padding: '0px',
					opacity: '0',
					filter: 'alpha(opacity=0)',
					'z-index': '1000',
					cursor: 'pointer'

				});

				$element.append(fileElem);

				if (fileElem.parent()[0] != $element[0]) {
					//fix #298
					$element.wrap('<span>');
					$element.css("z-index", "-1000");
					$element.parent().append(fileElem);
					$element = $element.parent();
				}

				if ($element.css("position") === '' || $element.css("position") === 'static') {
					$element.css("position", "relative");
				}

				$element.css({
					display: 'inline-block',
					overflow: 'hidden',
					cursor: 'pointer'
				});

				$element = fileElem;
			}


			$element.bind('change', function(evt) {

				var files = [];
				var fileList = evt.__files_ || evt.target.files;

				if (fileList !== null) {
					for (var i = 0; i < fileList.length; i++) {
						files.push(fileList.item(i));
					}
				}

				$timeout(function() {
					fn($scope, {
						$files : files,
						$event : evt
					});
				});

			});



            SPRibbon.ready().then(function() {

            	SPRibbon.attachFileElement = $element;
                SPRibbon.registerCommand(
                	'Ribbon.ListForm.Edit.Actions.AttachFile',
                	function() {
                		SPRibbon.attachFileElement.click();
                	}, true);

            });


		}; // Directive definition object/function


		return fileSelect_DirectiveDefinitionObject;

	} // Directive factory

]);
