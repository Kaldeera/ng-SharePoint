/*
    SPFormToolbarButton - directive
    
    Pau Codina (pau.codina@kaldeera.com)
    Pedro Castro (pedro.castro@kaldeera.com, pedro.cm@gmail.com)

    Copyright (c) 2014
    Licensed under the MIT License
*/



///////////////////////////////////////
//  SPFormToolbarButton
///////////////////////////////////////

angular.module('ngSharePoint').directive('spformToolbarButton', 

    ['SPUtils', '$q', 'SPRibbon', '$compile',

    function spformToolbarButton_DirectiveFactory(SPUtils, $q, SPRibbon, $compile) {

        var spformToolbarButton_DirectiveDefinitionObject = {

            restrict: 'EA',
            require: '^spformToolbar',
            replace: true,
            templateUrl: 'templates/form-templates/spform-toolbar-button.html',
            scope: {
                action: '&',
                redirectUrl: '@',
                text: '@',
                enabled: '='
            },


            link: function($scope, $element, $attrs, spformToolbarController) {

                $scope.formCtrl = spformToolbarController.getFormCtrl();
                $scope.isInDesignMode = SPUtils.inDesignMode();
                $scope.status = $scope.formCtrl.status;


                var action = $attrs.action || $attrs.spformToolbarButton;


                $scope.$watch('enabled', function(newValue, oldValue) {

                    SPRibbon.refresh();

                });


                // Sets the button 'text' and 'action'.
                // Also checks for pre-defined buttons (i.e., save, cancel and close)
                SPUtils.SharePointReady().then(function() {

                    switch(action.toLowerCase()) {

                        case 'save':
                            $scope.text = $scope.text || STSHtmlEncode(Strings.STS.L_SaveButtonCaption);
                            $scope.action = save;
                            $scope.redirectUrl = $scope.redirectUrl || 'default';
                            SPRibbon.ready().then(function() {
                                SPRibbon.registerCommand('Ribbon.ListForm.Edit.Commit.Publish', $scope.makeAction, true);
                            });
                            break;
                        
                        case 'cancel':
                            $scope.text = $scope.text || STSHtmlEncode(Strings.STS.L_CancelButtonCaption);
                            $scope.action = cancel;
                            $scope.redirectUrl = $scope.redirectUrl || 'default';
                            SPRibbon.ready().then(function() {
                                SPRibbon.registerCommand('Ribbon.ListForm.Edit.Commit.Cancel', $scope.makeAction, true);
                            });
                            break;

                        case 'close':
                            $scope.text = $scope.text || STSHtmlEncode(Strings.STS.L_CloseButtonCaption);
                            $scope.action = cancel;
                            $scope.redirectUrl = $scope.redirectUrl || 'default';
                            break;

                        default:
                            $scope.text = $scope.text || '';

                            if ($attrs.showInRibbon === 'true' || (!angular.isDefined(attrs.showInRibbon) && spformToolbarController.showToolbarInRibbon())) {

                                SPRibbon.ready().then(function() {

                                    var toolbar = spformToolbarController.getRibbonToolbar();

                                    if (toolbar) {

                                        SPRibbon.addButtonToToolbar(toolbar, $scope.text, $scope.makeAction, $attrs.tooltip, $attrs.description, $attrs.ribbonButtonImage, canHandle);

                                    }

                                });

                            }
                    }

                });



                // ****************************************************************************
                // Private methods
                //

                // Gets if the action is enabled and can be handled.
                function canHandle() {

                    return $scope.enabled !== false;

                }



                // Default SAVE form action
                function save() {

                    return $scope.formCtrl.save($scope.redirectUrl);

                }



                // Default CANCEL form action
                function cancel() {

                    return $scope.formCtrl.cancel($scope.redirectUrl);

                }


                // ****************************************************************************
                // Public methods
                //
                $scope.makeAction = function() {

                    $scope.formCtrl.setFormStatus($scope.status.PROCESSING);

                    $q.when($scope.action()).then(function(result) {

                        if (result !== false) {

                            if ($scope.redirectUrl) {

                                var redirectUrl = $scope.redirectUrl;

                                // Checks for pre-defined values in the redirect url.
                                switch(redirectUrl.toLowerCase()) {

                                    case 'display':
                                        redirectUrl = window.location.href.toLowerCase().replace(/new|edit/, 'display');
                                        // NOTA: No sirve porque la url del formulario por defecto para 'Display' 
                                        //       puede ser '.../lo-que-sea.aspx'.
                                        // TODO: Get the right default 'DispForm' url.
                                        //       Use spList.getProperties({$expand: 'Forms'}) to get the list forms.
                                        //       Use CSOM to get the default 'display' form.
                                        break;


                                    case 'edit':
                                        redirectUrl = window.location.href.toLowerCase().replace(/disp|new/, 'edit');
                                        // TODO: Get the right default 'EditForm' url.
                                        //       Use spList.getProperties({$expand: 'Forms'}) to get the list forms.
                                        //       Use CSOM to get the default 'edit' form.
                                        break;


                                    case 'new':
                                        redirectUrl = window.location.href.toLowerCase().replace(/disp|edit/, 'new');
                                        // TODO: Get the right default 'NewForm' url.
                                        //       Use spList.getProperties({$expand: 'Forms'}) to get the list forms.
                                        //       Use CSOM to get the default 'new' form.
                                        break;


                                    case 'default':
                                        redirectUrl = utils.getQueryStringParamByName('Source') || _spPageContextInfo.webServerRelativeUrl;
                                        break;

                                }
                                
                                window.location = redirectUrl;
                            }

                        }

                        // Action resolved
                        $scope.formCtrl.setFormStatus($scope.status.IDLE);

                    }, function() {

                        // Action rejected
                        $scope.formCtrl.setFormStatus($scope.status.IDLE);

                    });

                };

            } // link

        }; // Directive definition object


        return spformToolbarButton_DirectiveDefinitionObject;

    } // Directive factory

]);
