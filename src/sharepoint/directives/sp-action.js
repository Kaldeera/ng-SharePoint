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


    spAction.$inject = ['$compile', '$q', 'SPUtils', 'SPRibbon'];


    /* @ngInject */
    function spAction($compile, $q, SPUtils, SPRibbon) {

        var directive = {

            restrict: 'A',
            require: '^spformToolbar',
            priority: 1000,
            terminal: true,

            scope: {
                spAction: '&',
                redirectUrl: '@'
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

            processAction();



            // ****************************************************************************
            // Private methods
            //


            function processAction() {


                // Removes 'sp-action' attribute to avoid infinite loop when compile
                element.removeAttr('sp-action');

                // Sets the action click event
                element.attr('ng-click', 'makeAction();' + attrs.ngClick);

                // Sets the logic for 'ng-disabled' attribute
                element.attr('ng-disabled', 'isInDesignMode || formCtrl.getFormStatus() != status.IDLE');

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

                                    SPRibbon.addButtonToToolbar(toolbar, getLabel(), makeAction, tooltip, description);

                                }

                            });

                        }

                }


                // Compile the element with the new attributes and scope values
                $compile(element)(scope);

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

                return scope.formCtrl.save(redirectUrl);

            }



            // Default CANCEL form action
            function cancel() {

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
                                

                                // Redirects to the correct url
                                window.location = redirectUrl;

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
