/*
    SPFieldUser - directive
    
    Pau Codina (pau.codina@kaldeera.com)
    Pedro Castro (pedro.castro@kaldeera.com, pedro.cm@gmail.com)

    Copyright (c) 2014
    Licensed under the MIT License
*/



///////////////////////////////////////
//  SPFieldUser
///////////////////////////////////////

angular.module('ngSharePoint').directive('spfieldUser', 

    ['SPFieldDirective', '$q', '$timeout', '$filter', 'SharePoint', 'SPUtils', '$compile',

    function spfieldUser_DirectiveFactory(SPFieldDirective, $q, $timeout, $filter, SharePoint, SPUtils, $compile) {

        var spfieldUserDirectiveDefinitionObject = {

            restrict: 'EA',
            require: ['^spform', 'ngModel'],
            replace: true,
            scope: {
                mode: '@',
                value: '=ngModel'
            },
            templateUrl: 'templates/form-templates/spfield-control-loading.html',


            link: function($scope, $element, $attrs, controllers) {


                var directive = {
                    
                    fieldTypeName: 'user',
                    replaceAll: false,

                    init: function() {

                        $scope.noUserPresenceAlt = STSHtmlEncode(Strings.STS.L_UserFieldNoUserPresenceAlt);
                        $scope.idPrefix = $scope.schema.InternalName + '_'+ $scope.schema.Id;
                    },
                    
                    parserFn: function(viewValue) {

                        if ($scope.schema.AllowMultipleValues) {

                            var hasValue = $scope.value && $scope.value.results.length > 0;
                            directive.setValidity('required', !$scope.schema.Required || hasValue);

                        } else {

                            //directive.setValidity('required', !$scope.schema.Required || !!$scope.value);
                            // NOTE: Required validator is implicitly applied when no multiple values.

                            // Checks for 'peoplePicker' due to when in 'display' mode it's not created.
                            if ($scope.peoplePicker) {
                                
                                // Unique validity (Only one value is allowed)
                                directive.setValidity('unique', $scope.peoplePicker.TotalUserCount <= 1);
                            }
                        }

                        return viewValue;
                    },

                    watchModeFn: function(newValue) {

                        refreshData();
                    },

                    watchValueFn: function(newValue, oldValue) {

                        if (newValue === oldValue) return;

                        // Adjust the model if no value is provided
                        if (($scope.value === null || $scope.value === void 0) && $scope.schema.AllowMultipleValues) {
                            $scope.value = { results: [] };
                        }

                        $scope.selectedUserItems = void 0;
                        refreshData();
                    },

                    postRenderFn: function(html) {

                        if ($scope.currentMode === 'edit') {
                            var peoplePickerElementId = $scope.idPrefix + '_$ClientPeoplePicker';

                            $timeout(function() {
                                initializePeoplePicker(peoplePickerElementId);

                            });
                        }

                    }
                };


                SPFieldDirective.baseLinkFn.apply(directive, arguments);                



                // ****************************************************************************
                // Refresh the user data and render the field.
                //
                function refreshData() {

                    // If we are in display mode, there are not a extended template (that probably shows
                    // additional information), and there are the FieldValuesAsHtml ... we can show
                    // directly this value improving performance.
                    var extendedTemplateForDisplay = false;
                    if (angular.isDefined($scope.schema.extendedTemplate)) {
                        if (angular.isDefined($scope.schema.extendedTemplate.display)) {
                            extendedTemplateForDisplay = true;
                        } else {
                            if (!angular.isDefined($scope.schema.extendedTemplate.edit)) {
                                extendedTemplateForDisplay = true;
                            }
                        }
                    }

                    if ($scope.currentMode === 'display' && !extendedTemplateForDisplay) {

                        var fieldName = $scope.name.replace(/_/g, '_x005f_');
                        if ($scope.item.FieldValuesAsHtml !== void 0 && $scope.item.FieldValuesAsHtml[fieldName] !== void 0) {

                            directive.setElementHTML($scope.item.FieldValuesAsHtml[fieldName]);
                            return;
                        }
                    }

                    // Adjust the model if no value is provided
                    if (($scope.value === null || $scope.value === void 0) && $scope.schema.AllowMultipleValues) {
                        $scope.value = { results: [] };
                    }

                    // Show loading animation.
                    directive.setElementHTML('<div><img src="/_layouts/15/images/loadingcirclests16.gif" alt="" /></div>');

                    // Gets the data for the user (lookup) and then render the field.
                    getUserData().then(function() {

                        directive.renderField($scope.currentMode);

                    }, function() {

                        directive.setElementHTML('<div style="color: red;">Error al recuperar el usuario {{value}}.</div>');

                    });
                }



                // ****************************************************************************
                // Gets the lookup list.
                //
                function getLookupList() {

                    var def = $q.defer();

                    if ($scope.lookupList === void 0) {

                        // TODO: Get the web url from $scope.schema.LookupWebId with CSOM

                        SharePoint.getWeb().then(function(web) {

                            web.getList($scope.schema.LookupList).then(function(list) {

                                $scope.lookupList = list;
                                def.resolve($scope.lookupList);

                            }, function() {
                                def.reject();
                            });

                        }, function() {
                            def.reject();
                        });

                    } else {

                        def.resolve($scope.lookupList);
                    }


                    return def.promise;

                }



                // ****************************************************************************
                // Gets the items from the users list.
                //
                function getUserItems() {

                    var def = $q.defer();

                    if ($scope.userItems !== void 0) {

                        // Returns cached items
                        def.resolve($scope.userItems);

                    } else {
                        
                        getLookupList().then(function(list) {

                            list.getListItems().then(function(items) {

                                $scope.userItems = items;
                                def.resolve($scope.userItems);

                            });

                        });
                    }

                    return def.promise;
                }


                // ****************************************************************************
                // Gets an user item by ID from the users list.
                //
                function getUserItem(itemId) {

                    return getLookupList().then(function(list) {

                        return list.getItemById(itemId);

                    });

                }



                // ****************************************************************************
                // Gets the user data for display mode.
                //
                function getUserData() {

                    var def = $q.defer();

                    if ($scope.selectedUserItems !== void 0) {

                        def.resolve($scope.selectedUserItems);

                    } else {

                        // Initialize the selected items array
                        $scope.selectedUserItems = [];

                        // Gets the user items and populate the selected items array
                        var getUserItemsPromises = [];

                        if ($scope.schema.AllowMultipleValues) {

                            angular.forEach($scope.value.results, function(selectedItem) {

                                //var selectedUserItem = $filter('filter')(items, { Id: selectedItem }, true)[0];
                                var userItemPromise = getUserItem(selectedItem).then(function(selectedUserItem) {

                                    if (selectedUserItem !== void 0) {

                                        var userItem = {
                                            Title: selectedUserItem[$scope.schema.LookupField] || selectedUserItem.Title,
                                            url: selectedUserItem.list.web.url.rtrim('/') + '/_layouts/15/userdisp.aspx' + '?ID=' + $scope.value + '&Source=' + encodeURIComponent(window.location),
                                            data: selectedUserItem
                                        };

                                        $scope.selectedUserItems.push(userItem);
                                    }

                                });

                                getUserItemsPromises.push(userItemPromise);

                            });

                        } else {

                            // If no value returns an empty object for corrent binding
                            var userItem = {
                                Title: '',
                                url: '',
                                data: null
                            };


                            if ($scope.value === null || $scope.value === void 0) {

                                $scope.selectedUserItems.push(userItem);

                            } else {

                                //var selectedUserItem = $filter('filter')(items, { Id: $scope.value }, true)[0];
                                var userItemPromise = getUserItem($scope.value).then(function(selectedUserItem) {

                                    if (selectedUserItem !== void 0) {

                                        userItem = {
                                            Title: selectedUserItem[$scope.schema.LookupField] || selectedUserItem.Title,
                                            url: selectedUserItem.list.web.url.rtrim('/') + '/_layouts/15/userdisp.aspx' + '?ID=' + $scope.value + '&Source=' + encodeURIComponent(window.location),
                                            data: selectedUserItem
                                        };

                                        $scope.selectedUserItems.push(userItem);
                                    }

                                });

                                getUserItemsPromises.push(userItemPromise);
                            }
                        }

                        // Resolves all 'getUserItem' promises
                        $q.all(getUserItemsPromises).then(function() {

                            def.resolve($scope.selectedUserItems);

                        });

                    }

                    return def.promise;

                }



                // ****************************************************************************
                // Shows the SharePoint OOB People Picker presence image pop-up.
                //
                $scope.IMNImageOnClick = function($event) {

                    IMNImageOnClick($event.originalEvent);
                    return false;

                };



                $scope.GoToLinkOrDialogNewWindow = function(elem) {

                    GoToLinkOrDialogNewWindow(elem);
                    return false;

                };



                // ****************************************************************************
                // Render and initialize the client-side People Picker.
                //
                function initializePeoplePicker(peoplePickerElementId) {
                 
                    // Create a schema to store picker properties, and set the properties.
                    var schema = {
                        Id: $scope.schema.Id,
                        Title: $scope.schema.Title,
                        Hidden: $scope.schema.Hidden,
                        IMEMode: null,
                        Name: $scope.schema.InternalName,
                        Required: $scope.schema.Required,
                        Direction: $scope.schema.Direction,
                        FieldType: $scope.schema.TypeAsString,
                        //Description: $scope.schema.Description, //-> Hace que renderice la descripción otra vez ya que nosotros ya la renderizamos.
                        ReadOnlyField: $scope.schema.ReadOnlyField,
                        Type: 'User',
                        DependentLookup: false,
                        AllowMultipleValues: $scope.schema.AllowMultipleValues,
                        Presence: $scope.schema.Presence,
                        WithPicture: false,
                        DefaultRender: true,
                        WithPictureDetail: false,
                        ListFormUrl: '/_layouts/15/listform.aspx',
                        UserDisplayUrl: '/_layouts/15/userdisp.aspx',
                        EntitySeparator: ';',
                        PictureOnly: false,
                        PictureSize: null,
                        UserInfoListId: $scope.schema.LookupList,
                        SharePointGroupID: $scope.schema.SelectionGroup,
                        PrincipalAccountType: 'User,DL,SecGroup,SPGroup',
                        SearchPrincipalSource: 15,
                        ResolvePrincipalSource: 15/*,
                        MaximumEntitySuggestions: 50,
                        Width: '280px'*/
                    };


                    // Generate the PickerEntities to fill the PeoplePicker
                    var pickerEntities = [];

                    angular.forEach($scope.selectedUserItems, function(user) {

                        if (user.data !== null) {

                            var displayName = user.data.Title; //user.data[$scope.schema.LookupField];
                            var userName = user.data.Name;

                            // MSDN .NET PickerEntity members
                            /*
                            Claim                   Gets or sets an object that represents whether an entity has the right to claim the specified values.
                            Description             Gets or sets text in a text box in the browser.
                            DisplayText             Gets or sets text in the editing control.
                            EntityData              Gets or sets a data-mapping structure that is defined by the consumer of the PickerEntity class.
                            EntityDataElements  
                            EntityGroupName         Group under which this entity is filed in the picker.
                            EntityType              Gets or sets the name of the entity data type.
                            HierarchyIdentifier     Gets or sets the identifier of the current picker entity within the hierarchy provider.
                            IsResolved              Gets or sets a value that indicates whether the entity has been validated.
                            Key                     Gets or sets the identifier of a database record.
                            MultipleMatches 
                            ProviderDisplayName 
                            ProviderName
                            */

                            var pickerEntity = {
                                AutoFillDisplayText: displayName,
                                AutoFillKey: userName,
                                AutoFillSubDisplayText: '',
                                Description: displayName,
                                DisplayText: displayName,
                                //EntityData: {},
                                EntityType: 'User', //-> Para el administrador es ''
                                IsResolved: true,
                                Key: userName,
                                //LocalSearchTerm: 'adminis', //-> Creo que guarda la última búsqueda realizada en el PeoplePicker.
                                ProviderDisplayName: '', //-> Ej.: 'Active Directory', 'Tenant', ...
                                ProviderName: '', //-> Ej.: 'AD', 'Tenant', ...
                                Resolved: true
                            };

                            pickerEntities.push(pickerEntity);

                        }

                    });


                    // Render and initialize the picker.
                    // Pass the ID of the DOM element that contains the picker, an array of initial
                    // PickerEntity objects to set the picker value, and a schema that defines
                    // picker properties.
                    this.SPClientPeoplePicker_InitStandaloneControlWrapper(peoplePickerElementId, pickerEntities, schema);


                    
                    // Get the people picker object from the page.
                    var peoplePicker = this.SPClientPeoplePicker.SPClientPeoplePickerDict[peoplePickerElementId + '_TopSpan'];

                    $scope.peoplePicker = peoplePicker;

                    if (peoplePicker !== void 0 && peoplePicker !== null) {

                        // Get information about all users.
                        //var users = peoplePicker.GetAllUserInfo();


                        // Maps the needed callback functions...

                        //peoplePicker.OnControlValidateClientScript = function(peoplePickerId, entitiesArray) {};

                        //peoplePicker.OnValueChangedClientScript = function(peoplePickerId, entitiesArray) {};

                        peoplePicker.OnUserResolvedClientScript = function(peoplePickerId, entitiesArray) {

                            //console.log('OnUserResolvedClientScript', peoplePickerId, entitiesArray);

                            var resolvedValues = [];
                            var promises = [];

                            angular.forEach(entitiesArray, function(entity) {

                                if (entity.IsResolved) {

                                    if ($scope.schema.AllowMultipleValues || promises.length === 0) {

                                        var entityPromise;

                                        if (entity.EntityType === 'User') {

                                            // Get the user ID
                                            entityPromise = SPUtils.getUserId(entity.Key).then(function(userId) {

                                                resolvedValues.push(userId);
                                                return resolvedValues;
                                            });

                                        } else {

                                            // Get the group ID
                                            entityPromise = $q.when(resolvedValues.push(entity.EntityData.SPGroupID));
                                        }

                                        promises.push(entityPromise);

                                    } else {

                                        // Force to commit the value through the model controller $parsers and $validators pipelines.
                                        // This way the validators will be launched and the view will be updated.
                                        $scope.modelCtrl.$setViewValue($scope.modelCtrl.$viewValue);
                                    }
                                }
                            });


                            if (promises.length > 0) {
                                
                                $q.all(promises).then(function() {

                                    updateModel(resolvedValues);

                                });

                            } else {

                                updateModel(resolvedValues);
                            }
                        };


                        // Set the focus element for the validate
                        var editorElement = document.getElementById($scope.peoplePicker.EditorElementId);

                        if (editorElement) {

                            editorElement.setAttribute('data-spfield-focus-element', 'true');
                            $compile(angular.element(editorElement))($scope);

                        }

                    }
                }



                function updateModel(resolvedValues) {

                    if ($scope.schema.AllowMultipleValues === true) {

                        $scope.value.results = resolvedValues;

                    } else {

                        $scope.value = resolvedValues[0] || null;
                    }

                    $scope.modelCtrl.$setViewValue($scope.value);
                }
                


                // ****************************************************************************
                // Query the picker for user information.
                // NOTE: This function is actually not used.
                //
                function getUserInfo(peoplePickerId) {
                 
                    // Get the people picker object from the page.
                    var peoplePicker = this.SPClientPeoplePicker.SPClientPeoplePickerDict[peoplePickerId];
                 
                    // Get information about all users.
                    var users = peoplePicker.GetAllUserInfo();
                    var userInfo = '';
                    for (var i = 0; i < users.length; i++) {
                        var user = users[i];
                        for (var userProperty in user) {
                            userInfo += userProperty + ':  ' + user[userProperty] + '<br>';
                        }
                    }

                    console.log(userInfo);
                    
                    // Get user keys.
                    var keys = peoplePicker.GetAllUserKeys();
                    console.log(keys);
                }

            } // link

        }; // Directive definition object


        return spfieldUserDirectiveDefinitionObject;

    } // Directive factory

]);
