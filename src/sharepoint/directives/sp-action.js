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
/*
angular.module('ngSharePoint').directive('spAction', 

    ['$compile', '$q', 'SPUtils',

    function spAction_DirectiveFactory($compile, $q, SPUtils) {

        var spAction_DirectiveDefinitionObject = {

            restrict: 'A',
            require: '^spformToolbar',
            replace: false,
            priority: 1000,
            terminal: true,
            scope: {
                spAction: '&',
                redirectUrl: '@'
            },

            link: function($scope, $element, $attrs, spformToolbarController) {

                $scope.formCtrl = spformToolbarController.getFormCtrl();
                $scope.isInDesignMode = SPUtils.inDesignMode();
                $scope.status = $scope.formCtrl.status;

                //var spAction = $attrs.spAction;
                var ngClick = $attrs.ngClick;
                var redirectUrl = $attrs.redirectUrl;

                $element.removeAttr('sp-action');
                $element.attr('ng-click', 'makeAction();' + ngClick);
                $element.attr('ng-disabled', 'isInDesignMode || formCtrl.getFormStatus() != status.IDLE');


                // Checks for pre-defined buttons actions (i.e., save, cancel and close)
                switch($attrs.spAction.toLowerCase()) {

                    case 'save':
                        $scope.action = save;
                        redirectUrl = redirectUrl || 'default';
                        break;
                    
                    case 'cancel':
                        $scope.action = cancel;
                        redirectUrl = redirectUrl || 'default';
                        break;

                    case 'close':
                        $scope.action = cancel;
                        redirectUrl = redirectUrl || 'default';
                        break;

                    default:
                        $scope.action = $scope.spAction;
                }



                // ****************************************************************************
                // Private methods
                //

                // Default SAVE form action
                function save() {

                    return $scope.formCtrl.save(redirectUrl);

                }



                // Default CANCEL form action
                function cancel() {

                    return $scope.formCtrl.cancel(redirectUrl);

                }


                // ****************************************************************************
                // Public methods
                //
                $scope.makeAction = function() {

                    $scope.formCtrl.setFormStatus($scope.status.PROCESSING);

                    $q.when($scope.action()).then(function(result) {

                        if (result !== false) {

                            if (redirectUrl) {

                                //var redirectUrl = $scope.redirectUrl;

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

                }; // makeAction


                $compile($element)($scope);

            } // link

        }; // Directive definition object


        return spAction_DirectiveDefinitionObject;
    }

]);
*/


(function() {
    'use strict';

    angular
        .module('ngSharePoint')
        .directive('spAction', spAction);

    /* @ngInject */
    function spAction($compile, $q, SPUtils) {

        var directive = {

            restrict: 'A',
            require: '^spformToolbar',
            replace: false,
            priority: 1000,
            terminal: true,
            scope: {
                spAction: '&',
                redirectUrl: '@'
            },            
            link: link,
        };
        return directive;

        function link(scope, element, attrs, spformToolbarController) {

            // Public properties
            scope.formCtrl = spformToolbarController.getFormCtrl();
            scope.isInDesignMode = SPUtils.inDesignMode();
            scope.status = scope.formCtrl.status;

            // Public methods
            scope.makeAction = makeAction;


            ///////////////////////////////////////


            //var spAction = attrs.spAction;
            var ngClick = attrs.ngClick;
            var redirectUrl = attrs.redirectUrl;

            element.removeAttr('sp-action');
            element.attr('ng-click', 'makeAction();' + ngClick);
            element.attr('ng-disabled', 'isInDesignMode || formCtrl.getFormStatus() != status.IDLE');


            // Checks for pre-defined buttons actions (i.e., save, cancel and close)
            switch(attrs.spAction.toLowerCase()) {

                case 'save':
                    scope.action = save;
                    redirectUrl = redirectUrl || 'default';
                    break;
                
                case 'cancel':
                    scope.action = cancel;
                    redirectUrl = redirectUrl || 'default';
                    break;

                case 'close':
                    scope.action = cancel;
                    redirectUrl = redirectUrl || 'default';
                    break;

                default:
                    scope.action = scope.spAction;
            }



            // ****************************************************************************
            // Private methods
            //

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

                $q.when(scope.action()).then(function(result) {

                    if (result !== false) {

                        if (redirectUrl) {

                            //var redirectUrl = scope.redirectUrl;

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
                    scope.formCtrl.setFormStatus(scope.status.IDLE);

                }, function() {

                    // Action rejected
                    scope.formCtrl.setFormStatus(scope.status.IDLE);

                });

            } // makeAction


            $compile(element)(scope);

        } // link

    } // Directive factory function

})();
