/*
 *  Module: ngSharePointFormPage
 *  Directive: spformpage
 *
 *  Adds 'spform' directive and bootstrap the angular application with the correct SharePoint List/Item page context.
 *
 */

angular.module('ngSharePointFormPage', ['ngSharePoint', 'oc.lazyLoad']);



angular.module('ngSharePointFormPage').config(

    ['SPConfigProvider', '$ocLazyLoadProvider', 

    function(SPConfigProvider, $ocLazyLoadProvider) {

        SPConfigProvider.options.loadMinimalSharePointInfraestructure = false;
        //SPConfigProvider.options.forceLoadResources = true;

        // Config ocLazyLoad...
        // If you use angular.bootstrap(...) to launch your application, you need to define the main app module as a loaded module.
        $ocLazyLoadProvider.config({

            loadedModules: ['ngSharePoint', 'ngSharePointFormPage']

        });

    }

]);



angular.module('ngSharePointFormPage').directive('spformpage', 

    ['SharePoint', 'SPUtils', 'SPListItem', '$q', '$http', '$templateCache', '$compile', 'ctx', '$ocLazyLoad', 'SPExpressionResolver', 

    function(SharePoint, SPUtils, SPListItem, $q, $http, $templateCache, $compile, ctx, $ocLazyLoad, SPExpressionResolver) {
        
        return {

            restrict: 'EA',

            link: function($scope, $element, $attrs) {

                var listId = _spPageContextInfo.pageListId;
                var itemId = utils.getQueryStringParamByName('ID');

                // Sets the form mode
                //$scope.mode = (ctx.ControlMode == SPClientTemplates.ClientControlMode.NewForm || ctx.ControlMode == SPClientTemplates.ClientControlMode.EditForm ? 'edit' : 'display');

                var controlMode = 'display';
                var currentMode = 'display';
                $scope.mode = 'display';
                /*
                 * SPClientTemplates.ClientControlMode:
                 *
                 * Invalid: 0
                 * DisplayForm: 1
                 * EditForm: 2
                 * NewForm: 3
                 * View: 4
                 *
                 */

                switch(ctx.ControlMode) {

                    case SPClientTemplates.ClientControlMode.Invalid:
                        controlMode = 'invalid';
                        currentMode = 'display';
                        $scope.mode = 'display';
                        break;

                    case SPClientTemplates.ClientControlMode.DisplayForm:
                        controlMode = 'display';
                        currentMode = 'display';
                        $scope.mode = 'display';
                        break;

                    case SPClientTemplates.ClientControlMode.EditForm:
                        controlMode = 'edit';
                        currentMode = 'edit';
                        $scope.mode = 'edit';
                        break;

                    case SPClientTemplates.ClientControlMode.NewForm:
                        controlMode = 'new';
                        currentMode = 'edit';
                        $scope.mode = 'edit';
                        break;

                    case SPClientTemplates.ClientControlMode.View:
                        controlMode = 'view';
                        currentMode = 'display';
                        $scope.mode = 'display';
                        break;

                }


                // Checks if the 'listId' exists.
                if (listId === void 0) {
                    throw 'Can\'t access to the page context list or the page context does not exists.';
                }



                SharePoint.getWeb().then(function(web) {

                    $scope.web = web;

                    web.getList(listId).then(function(list) {

                        $scope.list = list;

                        list.getProperties({

                            $expand: 'Fields,ContentTypes,ContentTypes/Fields'

                        }).then(function(props) {

                            getItem(itemId).then(function(item) {

                                // Load dependencies
                                loadDependencies(item).then(function(formDefinition) {

                                    var hideRibbon = formDefinition.hideRibbon;
                                    var dlg = SP.UI.ModalDialog.get_childDialog();
                                    if (dlg !== null) {
                                        var args = dlg.get_args();
                                        if (args !== null && args.hideRibbon !== undefined) {
                                            hideRibbon = args.hideRibbon;
                                        }
                                    }

                                    if (typeof hideRibbon === 'function') {

                                        hideRibbon = hideRibbon();
                                    }

                                    if (hideRibbon === true) {

                                        var ribbon = $('#s4-ribbonrow');
                                        ribbon.next().height(ribbon.next().height() + ribbon.height());
                                        ribbon.remove();
                                    }

                                    if (formDefinition.formModesOverride) {

                                        $scope.mode = formDefinition.formModesOverride[controlMode] || currentMode;

                                        // If no valid override mode specified, sets the mode back to its default value.
                                        if ($scope.mode !== 'display' && $scope.mode !== 'edit') {

                                            $scope.mode = currentMode;

                                        }

                                    }

                                    // Try to get the template
                                    getTemplateUrl().then(function(templateUrl) {

                                        var spformHTML = '';

                                        $scope.extendedSchema = formDefinition.extendedSchema || {};
                                        $scope.controller = formDefinition.controller || {};

                                        spformHTML = '<div data-spform="true" mode="mode" item="item" extended-schema="extendedSchema" extended-controller="controller" template-url="' + templateUrl + '"></div>';

                                        var newElement = $compile(spformHTML)($scope);
                                        $element.replaceWith(newElement);
                                        $element = newElement;

                                        // Sets the item
                                        $scope.item = item;

                                    });

                                }, function(err) {

                                    console.error(err);

                                });

                            });

                        });


                    }, function(error) {

                        console.log('Error list', error);

                    });

                }, function(error) {

                    console.log('Error web', error);

                });




                function getItem(itemId) {

                    var deferred = $q.defer();
                    var item = null;


                    if (ctx.ControlMode == SPClientTemplates.ClientControlMode.NewForm) {

                        var data = {
                            ContentTypeId: utils.getQueryStringParamByName('ContentTypeId')
                        };

                        var newItem = new SPListItem($scope.list, data);
                        deferred.resolve(newItem);

                    } else {

                        $scope.list.getItemById(itemId, 'FieldValuesAsHtml').then(function(item) {

                            deferred.resolve(item);

                        }, function(err) {

                            console.log('Error item', err);

                        });
                        
                    }

                    return deferred.promise;

                } // getItem




                function getTemplateUrl() {

                    var deferred = $q.defer();
                    //var mode = SPClientTemplates.Utility.ControlModeToString(ctx.ControlMode);
                    var mode = (controlMode == 'new' ? controlMode : $scope.mode);
                    var templateUrl = $scope.web.url.rtrim('/') + '/ngSharePointFormTemplates/' + $scope.list.Title + '-' + ctx.ListData.Items[0].ContentType + '-' + mode + 'Form.html';

                    // Check if the 'templateUrl' is valid, i.e. the template exists.
                    $http.get(templateUrl, { cache: $templateCache }).success(function(html) {

                        // Returns the 'templateUrl'
                        deferred.resolve(templateUrl);

                    }).error(function(data, status, headers, config, statusText) {

                        // No valid template url specified.
                        console.log(data);

                        // The 'SPForm' directive will be generated with the default form template, so
                        // returns an empty 'templateUrl'.
                        deferred.resolve('');

                    });

                    return deferred.promise;

                } // getTemplateUrl



                function loadDependencies(item) {

                    var deferred = $q.defer();

                    // TODO: Hacer un $http para comprobar que exista el script de definición.
                    //       Si no existe, generar error? utilizar uno vacío? ... ???


                    SP.SOD.registerSod('formDefinition', $scope.web.url.rtrim('/') + '/ngSharePointFormTemplates/' + $scope.list.Title + '-' + ctx.ListData.Items[0].ContentType + '-definition.js');

                    SP.SOD.executeFunc('formDefinition', null, function() {

                        // Process the form definition object and load dependencies.
                        // NOTE: Here should have the variable 'formDefinition'.
                        var dependencies = [];

                        if (formDefinition !== void 0) {

                            // Process AngularJS modules dependencies.
                            angular.forEach(formDefinition.angularModules, function(module) {

                                dependencies.push(replaceWebRelativeUrls(module));

                            });

                            // Process JavaScript dependencies (Non AngularJS scripts).
                            angular.forEach(formDefinition.jsIncludes, function(js) {

                                dependencies.push(replaceWebRelativeUrls(js));

                            });


                            // Process CSS dependencies.
                            angular.forEach(formDefinition.cssIncludes, function(css) {

                                dependencies.push(replaceWebRelativeUrls(css));

                            });


                            // Process other.
                            // ...


                            $ocLazyLoad.load(dependencies).then(function() {

                                deferred.resolve(formDefinition);

                            });

                        } else {

                            deferred.resolve({});
                            
                        }

                    });


                    return deferred.promise;

                } // loadDependencies


                function replaceWebRelativeUrls(module) {

                    if (module === void 0) return module;

                    if (module.files) {

                        if (angular.isArray(module.files)) {

                            for(var r=0; r < module.files.length; r++) {

                                module.files[r] = module.files[r].replace(/~site/g, $scope.web.url.rtrim('/'));
                            }

                        } else if (angular.isString(module.files)) {

                            module.files = module.files.replace(/~site/g, $scope.web.url.rtrim('/'));
                        }
                    }

                    return module;
                }

            }

        };

    }

]);


