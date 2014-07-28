/*
	SPFieldUser - directive
	
	Pau Codina (pau.codina@kaldeera.com)
	Pedro Castro (pedro.castro@kaldeera.com, pedro.cm@gmail.com)

	Copyright (c) 2014
	Licensed under the MIT License
*/



///////////////////////////////////////
//	SPFieldUser
///////////////////////////////////////

angular.module('ngSharePoint').directive('spfieldUser', 

	['$compile', '$templateCache', '$http', '$q', '$timeout', '$filter', 'SharePoint', 'SPUtils',

	function($compile, $templateCache, $http, $q, $timeout, $filter, SharePoint, SPUtils) {

		return {

			restrict: 'EA',
			require: ['^spform', 'ngModel'],
			replace: true,
			scope: {
				mode: '@',
				value: '=ngModel'
			},
			template: '<div><img src="/_layouts/15/images/loadingcirclests16.gif" alt="" /></div>',

			link: function($scope, $element, $attrs, controllers) {

				$scope.schema = controllers[0].getFieldSchema($attrs.name);
				$scope.noUserPresenceAlt = STSHtmlEncode(Strings.STS.L_UserFieldNoUserPresenceAlt);
				$scope.idPrefix = $scope.schema.InternalName + '_'+ $scope.schema.Id;


				// $scope.schema.SelectionGroup (0 | [GroupId])	-> UserSelectionScope (XML) (0 (All Users) | [GroupId])
				// $scope.schema.SelectionMode  (0 | 1)			-> UserSelectionMode (XML) ("PeopleOnly" | "PeopleAndGroups")


				// ****************************************************************************
				// Watch for form mode changes.
				//
				$scope.$watch(function() {

					// Adjust the model if no value is provided
					if ($scope.value === null && $scope.schema.AllowMultipleValues) {
						$scope.value = { results: [] };
					}

					return { mode: $scope.mode || controllers[0].getFormMode(), value: ($scope.schema.AllowMultipleValues ? $scope.value.results : $scope.value) };

				}, function(newValue, oldValue) {

					$scope.currentMode = newValue.mode;

					// Show loading animation.
					setElementHTML('<div><img src="/_layouts/15/images/loadingcirclests16.gif" alt="" /></div>');

					if ($scope.schema.AllowMultipleValues) {
						if (newValue.value.join(',') !== oldValue.value.join(',')) {
							$scope.selectedUserItems = void 0;
						}
					} else {
						if (newValue.value !== oldValue.value) {
							$scope.selectedUserItems = void 0;
						}
					}

					// Gets the data for the user (lookup) and then render the field.
					getUserData().then(function() {
						renderField($scope.currentMode);
					}, function() {
						setElementHTML('<div style="color: red;">Error al recuperar el usuario {{value}}.</div>');
					});

				}, true);



				// ****************************************************************************
				// Replaces the directive element HTML.
				//
				function setElementHTML(html) {

					var newElement = $compile(html)($scope);
					$element.replaceWith(newElement);
					$element = newElement;
					
				}



				// ****************************************************************************
				// Renders the field with the correct layout based on the form mode.
				//
				function renderField(mode) {

					$http.get('templates/form-templates/spfield-user-' + mode + '.html', { cache: $templateCache }).success(function(html) {

						setElementHTML(html);

						if (mode === 'edit') {
							var peoplePickerElementId = $scope.idPrefix + '_$ClientPeoplePicker';

							$timeout(function() {
								initializePeoplePicker(peoplePickerElementId);
							});
						}
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
						getUserItems().then(function(items) {

							if ($scope.schema.AllowMultipleValues) {

								angular.forEach($scope.value.results, function(selectedItem) {

									var selectedUserItem = $filter('filter')(items, { Id: selectedItem }, true)[0];

									if (selectedUserItem !== void 0) {

										var userItem = {
											Title: selectedUserItem[$scope.schema.LookupField] || selectedUserItem.Title,
											url: selectedUserItem.list.web.url.rtrim('/') + '/_layouts/15/userdisp.aspx' + '?ID=' + $scope.value + '&Source=' + encodeURIComponent(window.location),
											data: selectedUserItem
										};

										$scope.selectedUserItems.push(userItem);
									}

								});

							} else {

								// If no value returns an empty object for corrent binding
								var userItem = {
									Title: '',
									url: ''
								};

								if ($scope.value === null || $scope.value === 0) {

									$scope.selectedUserItems.push(userItem);

								} else {

									var selectedUserItem = $filter('filter')(items, { Id: $scope.value }, true)[0];

									if (selectedUserItem !== void 0) {

										userItem = {
											Title: selectedUserItem[$scope.schema.LookupField] || selectedUserItem.Title,
											url: selectedUserItem.list.web.url.rtrim('/') + '/_layouts/15/userdisp.aspx' + '?ID=' + $scope.value + '&Source=' + encodeURIComponent(window.location),
											data: selectedUserItem
										};

										$scope.selectedUserItems.push(userItem);
									}
								}
							}

							def.resolve($scope.selectedUserItems);

						}, function() {
							def.reject();
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
				    	UserInfoListId: '{' + $scope.lookupList.Id + '}',
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

				    	var displayName = user.data.Title; //user.data[$scope.schema.LookupField];
				    	var userName = user.data.Name;

				    	// MSDN .NET PickerEntity members
				    	/*
						Claim					Gets or sets an object that represents whether an entity has the right to claim the specified values.
						Description				Gets or sets text in a text box in the browser.
						DisplayText				Gets or sets text in the editing control.
						EntityData				Gets or sets a data-mapping structure that is defined by the consumer of the PickerEntity class.
						EntityDataElements	
						EntityGroupName			Group under which this entity is filed in the picker.
						EntityType				Gets or sets the name of the entity data type.
						HierarchyIdentifier		Gets or sets the identifier of the current picker entity within the hierarchy provider.
						IsResolved				Gets or sets a value that indicates whether the entity has been validated.
						Key						Gets or sets the identifier of a database record.
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

				    });


				    // Render and initialize the picker.
				    // Pass the ID of the DOM element that contains the picker, an array of initial
				    // PickerEntity objects to set the picker value, and a schema that defines
				    // picker properties.
				    this.SPClientPeoplePicker_InitStandaloneControlWrapper(peoplePickerElementId, pickerEntities, schema);


				    // Maps the needed callback functions
				    var peoplePicker = this.SPClientPeoplePicker.SPClientPeoplePickerDict[peoplePickerElementId + '_TopSpan'];

				    if (peoplePicker !== void 0 && peoplePicker !== null) {
				    	//peoplePicker.OnControlValidateClientScript = function(peoplePickerId, entitiesArray) {};
				    	//peoplePicker.OnValueChangedClientScript = function(peoplePickerId, entitiesArray) {};
				    	peoplePicker.OnUserResolvedClientScript = function(peoplePickerId, entitiesArray) {

				    		console.log('OnUserResolvedClientScript', peoplePickerId, entitiesArray);

				    		if ($scope.schema.AllowMultipleValues === true) {

				    			$scope.value.results = [];
				    		}


				    		angular.forEach(entitiesArray, function(entity) {

				    			if (entity.IsResolved) {

				    				SPUtils.getUserId(entity.Key).then(function(userId) {

						    			if ($scope.schema.AllowMultipleValues === true) {

					    					$scope.value.results.push(userId);

						    			} else {

						    				$scope.value = userId;
						    				
						    			}

				    				});

				    			}

				    		});
				    	};
				    }
				}
				


				// ****************************************************************************
				// Query the picker for user information.
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

			}

		};

	}

]);
