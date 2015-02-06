/*
    SPAction - directive
    
    Pau Codina (pau.codina@kaldeera.com)
    Pedro Castro (pedro.castro@kaldeera.com, pedro.cm@gmail.com)

    Copyright (c) 2014
    Licensed under the MIT License
*/



///////////////////////////////////////
//  SPAction
///////////////////////////////////////

(function() {
    
    'use strict';

    angular
        .module('ngSharePoint')
        .directive('spAction', spAction);


    spAction.$inject = ['$compile', '$q', 'SPUtils', 'SPRibbon', '$timeout'];


    /* @ngInject */
    function spAction($compile, $q, SPUtils, SPRibbon, $timeout) {

        var directive = {

            restrict: 'A',
            require: '^spformToolbar',
            priority: 500,
            terminal: true,

            scope: {
                spAction: '&',
                redirectUrl: '@',
                enabled: '='
            },

            link: postLink

        };

        return directive;

        

        ///////////////////////////////////////////////////////////////////////////////



        function postLink(scope, element, attrs, spformToolbarController) {

            // Public properties
            scope.formCtrl = spformToolbarController.getFormCtrl();
            scope.isInDesignMode = SPUtils.inDesignMode();
            scope.status = scope.formCtrl.status;


            // Public methods
            scope.makeAction = makeAction;


            // Process attributes and compile
            var redirectUrl = attrs.redirectUrl;
            var ngClick = attrs.ngClick;
            var tooltip = attrs.tooltip;
            var description = attrs.description;
            var ribbonButtonImage = attrs.ribbonButtonImage;


            // Watch for 'enabled' attribute
            scope.$watch('enabled', SPRibbon.refresh);


            // Watch for 'formStatus'
            scope.$watch(function() {

                return scope.formCtrl.getFormStatus();

            }, SPRibbon.refresh);


            processAction();



            // ****************************************************************************
            // Private methods
            //


            function processAction() {


                // Removes 'sp-action' attribute to avoid infinite loop when compile
                element.removeAttr('sp-action');

                // Sets the action click event
                element.attr('ng-click', 'makeAction();' + (attrs.ngClick || ''));

                // Sets the logic for 'ng-disabled' attribute
                element.attr('ng-disabled', 'isInDesignMode || formCtrl.getFormStatus() != status.IDLE || enabled === false');

                // Sets css classes
                element.addClass('spform-toolbar-element spform-toolbar-action');


                // Checks for pre-defined buttons actions (i.e., save, cancel and close)
                switch(attrs.spAction.toLowerCase()) {

                    // Default save action
                    case 'save':

                        scope.action = save;
                        redirectUrl = redirectUrl || 'default';

                        SPRibbon.ready().then(function() {

                            SPRibbon.registerCommand('Ribbon.ListForm.Edit.Commit.Publish', makeAction, true);

                        });

                        break;
                    

                    // Default cancel action
                    case 'cancel':

                        scope.action = cancel;
                        redirectUrl = redirectUrl || 'default';

                        SPRibbon.ready().then(function() {

                            SPRibbon.registerCommand('Ribbon.ListForm.Edit.Commit.Cancel', makeAction, true);

                        });

                        break;


                    // Default close action
                    case 'close':

                        scope.action = cancel;
                        redirectUrl = redirectUrl || 'default';

                        break;


                    // Custom action
                    default:

                        scope.action = scope.spAction;

                        if (attrs.showInRibbon === 'true' || (!angular.isDefined(attrs.showInRibbon) && spformToolbarController.showToolbarInRibbon())) {

                            SPRibbon.ready().then(function() {

                                var toolbar = spformToolbarController.getRibbonToolbar();

                                if (toolbar) {

                                    SPRibbon.addButtonToToolbar(toolbar, getLabel(), makeAction, tooltip, description, ribbonButtonImage, canHandle);

                                }

                            });

                        }

                }


                // Compile the element with the new attributes and scope values
                $compile(element)(scope);

            }



            // Gets if the action is enabled and can be handled.
            function canHandle() {

                return scope.enabled !== false && scope.formCtrl.getFormStatus() == scope.status.IDLE;

            }



            // Gets the action text/label
            function getLabel() {

                var label = '';

                if (element.get(0).tagName.toLowerCase() == 'input') {

                    label = element.val();

                } else {

                    label = element.text();

                }


                return label;

            }



            // Default SAVE form action
            function save() {

                if (SP.UI.ModalDialog.get_childDialog()) {
                    scope.dialogResult = SP.UI.DialogResult.OK;
                }

                return scope.formCtrl.save(redirectUrl);

            }



            // Default CANCEL form action
            function cancel() {

                if (SP.UI.ModalDialog.get_childDialog()) {
                    scope.dialogResult = SP.UI.DialogResult.cancel;
                }

                return scope.formCtrl.cancel(redirectUrl);

            }




            // ****************************************************************************
            // Public methods
            //
            function makeAction() {

                scope.formCtrl.setFormStatus(scope.status.PROCESSING);

                var safeActionFn = function() {
                    try {
                        return scope.action();
                    } catch(e) {
                        console.error('>>>> ngSharePoint: sp-action "' + getLabel() + '" rejected automatically due to an unhandled exception.');
                        return $q.reject(e);
                    }
                };



                $q.when(safeActionFn())

                    .then(function(result) {

                        if (result !== false) {

                            //var redirectUrl = scope.redirectUrl;

                            if (redirectUrl) {

                                var item = scope.formCtrl.getItem();
                                var list = item.list;

                                // Checks for pre-defined values in the redirect url.
                                switch(redirectUrl.toLowerCase()) {

                                    case 'display':
                                        //redirectUrl = window.location.href.toLowerCase().replace(/new|edit/, 'display');
                                        // NOTA: No sirve porque la url del formulario por defecto para 'Display' 
                                        //       puede ser '.../lo-que-sea.aspx'.
                                        // TODO: Get the right default 'DispForm' url.
                                        //       Use spList.getProperties({$expand: 'Forms'}) to get the list forms.
                                        //       Use CSOM to get the default 'display' form.

                                        list.getDefaultDisplayFormUrl().then(function(url) {

                                            // Redirects to the correct url
                                            window.location = url + window.location.search;
                                            
                                        });
                                
                                        break;


                                    case 'edit':
                                        //redirectUrl = window.location.href.toLowerCase().replace(/disp|new/, 'edit');
                                        // TODO: Get the right default 'EditForm' url.
                                        //       Use spList.getProperties({$expand: 'Forms'}) to get the list forms.
                                        //       Use CSOM to get the default 'edit' form.

                                        list.getDefaultEditFormUrl().then(function(url) {

                                            // Redirects to the correct url
                                            window.location = url + window.location.search;
                                            
                                        });

                                        break;


                                    case 'new':
                                        //redirectUrl = window.location.href.toLowerCase().replace(/disp|edit/, 'new');
                                        // TODO: Get the right default 'NewForm' url.
                                        //       Use spList.getProperties({$expand: 'Forms'}) to get the list forms.
                                        //       Use CSOM to get the default 'new' form.

                                        list.getDefaultNewFormUrl().then(function(url) {

                                            // Redirects to the correct url
                                            window.location = url + window.location.search;
                                            
                                        });

                                        break;


                                    case 'default':
                                                
                                        var dialog = SP.UI.ModalDialog.get_childDialog();

                                        if (dialog) {

                                            $timeout(function() {

                                                try {

                                                    scope.dialogReturnValue = 'Valor devuelto desde un cuadro de diálogo al cerrar...';

                                                    // NOTE: The next call will throw an error if the dialog wasn't opened with the method
                                                    //       SP.UI.ModalDialog.commonModalDialogOpen(url, options, callback, args)
                                                    dialog.commonModalDialogClose(scope.dialogResult, scope.dialogReturnValue);

                                                } catch(e) {

                                                    dialog.close(scope.dialogResult);

                                                }

                                            });

                                        } else {

                                            redirectUrl = utils.getQueryStringParamByName('Source') || _spPageContextInfo.webServerRelativeUrl;
                                            // TODO: Redireccionar a la vista por defecto de la lista.

                                            // Redirects to the correct url
                                            window.location = redirectUrl;

                                        }

                                        break;

                                }

                            }

                        }

                    }, function(err) {

                        if (err) {

                            // Show error details in the console.
                            console.error(err);

                        }

                    })

                    .finally(function() {

                        // Sets the form in its IDLE state.
                        scope.formCtrl.setFormStatus(scope.status.IDLE);

                    });

            } // makeAction

        } // link

    } // Directive factory function


})();
