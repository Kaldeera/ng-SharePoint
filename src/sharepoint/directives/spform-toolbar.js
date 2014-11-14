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

    ['$compile', 'SPUtils',

    function spformToolbar_DirectiveFactory($compile, SPUtils) {

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

            },



            link: function($scope, $element, $attrs, spformController, transcludeFn) {

                $scope.formCtrl = spformController;



                // ****************************************************************************
                // Watch for form mode changes.
                //
                $scope.$watch(spformController.getFormMode, function(newValue, oldValue) {

                    $scope.currentMode = newValue;
                    processToolbar();

                });



                function processToolbar() {

                    // Compila el contenido en el scope correcto.
                    var transcludeElement = $element.find('[sp-transclude]');


                    // Ensure 'transclusion' element.
                    if (transcludeElement === void 0 || transcludeElement.length === 0) {
                        transcludeElement = $element;
                    }


                    transcludeFn($scope, function(clone) {
                        
                        // Empty the contents
                        transcludeElement.empty();

                        // Iterate over clone elements to remove comments
                        angular.forEach(clone, function(elem){

                            if (elem.nodeType !== elem.COMMENT_NODE) {

                                transcludeElement.append(elem);

                            }

                        });

                    });


                    // Checks if there are content to transclude
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

                }

            } // link

        }; // Directive definition object


        return spformToolbarDirectiveDefinitionObject;

    } // Directive factory

]);
