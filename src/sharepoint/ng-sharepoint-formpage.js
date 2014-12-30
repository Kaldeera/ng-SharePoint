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


                $scope.mode = (ctx.ControlMode == SPClientTemplates.ClientControlMode.DisplayForm ? 'display' : 'edit');


                if (listId === void 0) {
                    throw 'Can\'t access to the page context list or the page context does not exists.';
                }


                SharePoint.getWeb().then(function(web) {

                    $scope.web = web;

                    web.getList(listId).then(function(list) {

                        $scope.list = list;

                        list.getProperties().then(function(props) {

                            getItem(itemId).then(function(item) {

                                // Load dependencies
                                loadDependencies(item).then(function(formDefinition) {

                                    // Try to get the template
                                    getTemplateUrl().then(function(templateUrl) {

                                        var formController = formDefinition.formController;
                                        var useControllerAsSyntax = formDefinition.useControllerAsSyntax;
                                        var spformHTML = '';

                                        $scope.extendedSchema = formDefinition.extendedSchema || {};

                                        if (!angular.isDefined(formController)) {

                                            spformHTML = '<div data-spform="true" mode="mode" item="item" extended-schema="extendedSchema" template-url="' + templateUrl + '"></div>';

                                        } else {

                                            spformHTML = '<div ng-controller="' + formController + (useControllerAsSyntax ? ' as appCtrl">' : '">') +
                                                         '    <div data-spform="true" mode="mode" item="item" extended-schema="$parent.extendedSchema" on-pre-save="appCtrl.onPreSave" on-post-save="appCtrl.onPostSave" on-cancel="appCtrl.onCancel" template-url="' + templateUrl + '"></div>' +
                                                         '</div>';
                                        }


                                        var newElement = $compile(spformHTML)($scope);
                                        $element.replaceWith(newElement);
                                        $element = newElement;


                                        preBind(item).finally(function() {

                                            // Sets the item
                                            $scope.item = item;

                                        });

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

                        $scope.list.getItemById(itemId).then(function(item) {

                            deferred.resolve(item);

                        }, function(err) {

                            console.log('Error item', err);

                        });
                        
                    }

                    return deferred.promise;

                } // getItem




                function getTemplateUrl() {

                    var deferred = $q.defer();
                    var templateUrl = $scope.web.url.rtrim('/') + '/ngSharePointFormTemplates/' + $scope.list.Title + '-' + ctx.ListData.Items[0].ContentType + '-' + SPClientTemplates.Utility.ControlModeToString(ctx.ControlMode) + '.html';

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

                            var formDefinitionScope = $scope.$new();
                            formDefinitionScope.item = item;

                            SPExpressionResolver.resolve(angular.toJson(formDefinition), formDefinitionScope).then(function(formDefinitionResolved) {

                                // Replaces the token ~site with the site relative url
                                formDefinitionResolved = formDefinitionResolved.replace(/~site/g, $scope.web.url.rtrim('/'));

                                // Converts back the JSON object resolved to a real object.
                                formDefinition = angular.fromJson(formDefinitionResolved);

                                // Process AngularJS modules dependencies.
                                angular.forEach(formDefinition.angularModules, function(module) {

                                    dependencies.push(module);

                                });

                                // Process JavaScript dependencies (Non AngularJS scripts).
                                angular.forEach(formDefinition.jsIncludes, function(js) {

                                    dependencies.push(js);

                                });


                                // Process CSS dependencies.
                                angular.forEach(formDefinition.cssIncludes, function(css) {

                                    dependencies.push(css);

                                });


                                // Process other.
                                // ...


                                $ocLazyLoad.load(dependencies).then(function() {

                                    deferred.resolve(formDefinition);

                                });

                            });

                        } else {

                            deferred.resolve({});
                            
                        }

                    });


                    return deferred.promise;

                } // loadDependencies



                function preBind(item) {

                    var elementScope = $element.scope();
                    var onPreBind;

                    if (angular.isDefined(elementScope.appCtrl)) {

                        onPreBind = elementScope.appCtrl.onPreBind;

                    }

                    return $q.when((onPreBind || angular.noop)(item));
                    
                } // preBind

            }

        };

    }

]);


/*
var element = document.querySelector('[data-spformpage]');

if (element) {
    angular.bootstrap(element, ['ngSharePointFormPage']);
}
*/
