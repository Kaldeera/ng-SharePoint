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
                spAction: '@',
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


            function allowRedirect() {

                if (attrs.noredirect !== void 0) return false;
                return spformToolbarController.allowRedirect;
            }



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

                        if (element.html() === '') {
                            element.append(Strings.STS.L_SaveButtonCaption);
                        }

                        scope.action = save;
                        redirectUrl = redirectUrl || 'default';

                        SPRibbon.ready().then(function() {

                            SPRibbon.registerCommand('Ribbon.ListForm.Edit.Commit.Publish', makeAction, true);

                        });

                        break;
                    

                    // Default cancel action
                    case 'cancel':

                        if (element.html() === '') {
                            element.append(Strings.STS.L_CancelButtonCaption);
                        }

                        scope.action = cancel;
                        redirectUrl = redirectUrl || 'default';

                        SPRibbon.ready().then(function() {

                            SPRibbon.registerCommand('Ribbon.ListForm.Edit.Commit.Cancel', makeAction, true);

                        });

                        break;


                    // Default close action
                    case 'close':

                        if (element.html() === '') {
                            element.append(Strings.STS.L_CloseButtonCaption);
                        }

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

                return scope.formCtrl.save();

            }



            // Default CANCEL form action
            function cancel() {

                if (SP.UI.ModalDialog.get_childDialog()) {
                    scope.dialogResult = SP.UI.DialogResult.cancel;
                }

                return scope.formCtrl.cancel();

            }




            // ****************************************************************************
            // Public methods
            //
            function makeAction() {

                scope.formCtrl.setFormStatus(scope.status.PROCESSING);

                var promise;

                switch(scope.spAction.toLowerCase()) {

                    case 'save':
                    case 'cancel':
                    case 'close':
                        // default functions
                        var safeActionFn = function() {
                            try {
                                return scope.action();
                            } catch(e) {
                                console.error('>>>> ngSharePoint: sp-action "' + getLabel() + '" rejected automatically due to an unhandled exception.');
                                return $q.reject(e);
                            }
                        };

                        promise = SPUtils.callFunctionWithParams(scope.action, scope);
                        break;



                    default:
                        // custom function
                        promise = SPUtils.callFunctionWithParams(scope.$parent[scope.spAction], scope.$parent);
                        break;
                }


                $q.when(promise).then(function(result) {

                    if (result !== false) {

                        //var redirectUrl = scope.redirectUrl;

                        if (redirectUrl && allowRedirect()) {

                            var item = scope.formCtrl.getItem();
                            var list = item.list;

                            // Checks for pre-defined values in the redirect url.
                            switch(redirectUrl.toLowerCase()) {

                                case 'display':

                                    list.getDefaultDisplayFormUrl().then(function(url) {

                                        // Redirects to the correct url
                                        var params = window.location.search;
                                        var idParam = 'ID=' + item.Id;

                                        if (params.indexOf(idParam) == -1) {

                                            if (params === "") {
                                                params = "?" + idParam;
                                            } else {
                                                params = "?" + idParam + '&' + params.substr(1);
                                            }

                                        }
                                        window.location = url + params;
                                        
                                    });
                            
                                    break;


                                case 'edit':

                                    list.getDefaultEditFormUrl().then(function(url) {

                                        // Redirects to the correct url
                                        var params = window.location.search;
                                        var idParam = 'ID=' + item.Id;

                                        if (params.indexOf(idParam) == -1) {

                                            if (params === "") {
                                                params = "?" + idParam;
                                            } else {
                                                params = "?" + idParam + '&' + params.substr(1);
                                            }

                                        }
                                        window.location = url + params;
                                        
                                    });

                                    break;


                                case 'new':

                                    list.getDefaultNewFormUrl().then(function(url) {

                                        // Redirects to the correct url
                                        window.location = url;
                                        
                                    });

                                    break;


                                case 'default':
                                            
                                    var dialog = SP.UI.ModalDialog.get_childDialog();

                                    if (dialog) {

                                        $timeout(function() {

                                            try {

                                                scope.dialogReturnValue = item;

                                                // NOTE: The next call will throw an error if the dialog wasn't opened with the method
                                                //       SP.UI.ModalDialog.commonModalDialogOpen(url, options, callback, args)
                                                dialog.commonModalDialogClose(scope.dialogResult, scope.dialogReturnValue);

                                            } catch(e) {

                                                dialog.close(scope.dialogResult);

                                            }

                                        });

                                    } else {

                                        var redirectPromise = utils.getQueryStringParamByName('Source');
                                        if (redirectPromise === void 0) {
                                            redirectPromise = list.getDefaultViewUrl();
                                        }

                                        $q.when(redirectPromise).then(function(redirectUrl) {

                                            // Redirects to the correct url
                                            window.location = redirectUrl;
                                        });

                                    }

                                    break;

                                default:

                                    // Redirects to the correct url
                                    window.location = redirectUrl;

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
