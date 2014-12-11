/*
    SPFormToolbar - directive
    
    Pau Codina (pau.codina@kaldeera.com)
    Pedro Castro (pedro.castro@kaldeera.com, pedro.cm@gmail.com)

    Copyright (c) 2014
    Licensed under the MIT License
*/



///////////////////////////////////////
//  SPFormToolbar
///////////////////////////////////////

angular.module('ngSharePoint').directive('spformToolbar', 

    ['$compile', 'SPUtils', 'SPRibbon',

    function spformToolbar_DirectiveFactory($compile, SPUtils, SPRibbon) {

        var spformToolbarDirectiveDefinitionObject = {

            restrict: 'EA',
            templateUrl: 'templates/form-templates/spform-toolbar.html',
            require: '^spform',
            replace: true,
            transclude: true,


            controller: function spformToolbarController($scope) {

                this.getFormCtrl = function() {

                    return $scope.formCtrl;

                };


                this.getRibbonToolbar = function() {

                    return $scope.ribbonToolbar;

                };


                this.showToolbarInRibbon = function() {

                    return $scope.showToolbarInRibbon;

                };

            },



            link: function($scope, $element, $attrs, spformController, transcludeFn) {

                $scope.formCtrl = spformController;
                $scope.ribbonToolbar = null;


                // ****************************************************************************
                // Watch for form mode changes.
                //
                $scope.$watch(spformController.getFormMode, function(newValue, oldValue) {

                    //if($scope.currentMode === newValue) return;

                    $scope.currentMode = newValue;
                    processToolbar();

                });



                function isRibbonNeeded(clone) {

                    var ribbonNeeded = false;
                    $scope.showToolbarInRibbon = ($attrs.showInRibbon === 'true');


                    // Iterate over 'clone' elements to check if there are 'action' elements and are not the default actions.
                    for (var i = 0; i < clone.length; i++) {

                        var elem = clone[i];

                        if (elem.tagName !== void 0) {

                            var showInRibbon = false;

                            if (elem.hasAttribute('show-in-ribbon')) {

                                showInRibbon = (elem.getAttribute('show-in-ribbon').toLowerCase() === 'true');

                            } else {

                                showInRibbon = $scope.showToolbarInRibbon;

                            }

                            if (showInRibbon) {

                                // Checks for '<spform-toolbar-button>' element
                                if (elem.tagName.toLowerCase() === 'spform-toolbar-button' && elem.hasAttribute('action')) {

                                    var actionAttr = elem.getAttribute('action').toLowerCase();

                                    // Checks if the action is a default action
                                    if (actionAttr !== 'save' && actionAttr !== 'cancel' && actionAttr !== 'close') {

                                        ribbonNeeded = true;
                                        break;

                                    }

                                }

                                // Checks for '<any sp-action="">' element
                                if (elem.hasAttribute('sp-action')) {

                                    var spActionAttr = elem.getAttribute('sp-action').toLowerCase();

                                    // Checks if the action is a default action
                                    if (spActionAttr !== 'save' && spActionAttr !== 'cancel' && spActionAttr !== 'close') {

                                        ribbonNeeded = true;
                                        break;

                                    }

                                }
                                
                            }

                        }

                    }


                    return ribbonNeeded;

                } // isRibbonNeeded


                function processToolbar() {

                    // Compila el contenido en el scope correcto.
                    var transcludeElement = $element.find('[sp-transclude]');


                    // Ensure 'transclusion' element.
                    if (transcludeElement === void 0 || transcludeElement.length === 0) {
                        transcludeElement = $element;
                    }


                    // Makes the transclusion
                    transcludeFn($scope, function(clone) {
                        
                        // Checks if there are elements to transclude before processing the ribbon.
                        if (isRibbonNeeded(clone)) {

                            SPRibbon.ready().then(function() {

                                $scope.ribbonToolbar = SPRibbon.createToolbar($attrs.name, $attrs.tabTitle);

                            });

                        } else {

                            $scope.ribbonToolbar = null;
                            
                        }

                        // Empty the contents
                        transcludeElement.empty();

                        // Iterate over clone elements and appends them to 'transcludeElement' unless the comments.
                        angular.forEach(clone, function(elem){

                            if (elem.nodeType !== elem.COMMENT_NODE) {

                                transcludeElement.append(elem);

                            }

                        });

                    });


                    // Checks if there are transcluded content
                    if (transcludeElement.contents().length === 0) {

                        // Append default toolbar buttons
                        switch($scope.currentMode) {

                            case 'display':
                                transcludeElement.append($compile('<spform-toolbar-button action="close"></spform-toolbar-button>')($scope));
                                break;

                            case 'edit':
                                transcludeElement.append($compile('<spform-toolbar-button action="save"></spform-toolbar-button>')($scope));
                                transcludeElement.append($compile('<spform-toolbar-button action="cancel"></spform-toolbar-button>')($scope));
                                break;
                        }

                    }

                } // processToolbar

            } // link

        }; // Directive definition object


        return spformToolbarDirectiveDefinitionObject;

    } // Directive factory

]);
