function $_global_clientpeoplepicker() {
    SPClientPeoplePicker.UserQueryId = 0;
    SPClientPeoplePicker.UniqueUserIdx = 0;
    SPClientPeoplePicker.ShowUserPresence = true;
    SPClientPeoplePicker.SPClientPeoplePickerDict = {};
    SPClientPeoplePicker.UserQueryMaxTimeout = 25000;
    SPClientPeoplePicker.MaximumLocalSuggestions = 5;
    SPClientPeoplePicker.ValueName = 'Key';
    SPClientPeoplePicker.DisplayTextName = 'DisplayText';
    SPClientPeoplePicker.SubDisplayTextName = 'Title';
    SPClientPeoplePicker.SIPAddressName = 'SIPAddress';
    SPClientPeoplePicker.SuggestionsName = 'MultipleMatches';
    SPClientPeoplePicker.UnvalidatedEmailAddressKey = "UNVALIDATED_EMAIL_ADDRESS";
    SPClientPeoplePicker.KeyProperty = 'AutoFillKey';
    SPClientPeoplePicker.DisplayTextProperty = 'AutoFillDisplayText';
    SPClientPeoplePicker.SubDisplayTextProperty = 'AutoFillSubDisplayText';
    SPClientPeoplePicker.prototype = {
        TopLevelElementId: '',
        EditorElementId: '',
        AutoFillElementId: '',
        ResolvedListElementId: '',
        InitialHelpTextElementId: '',
        WaitImageId: '',
        HiddenInputId: '',
        AllowEmpty: true,
        ForceClaims: false,
        AutoFillEnabled: true,
        AllowMultipleUsers: false,
        OnValueChangedClientScript: null,
        OnUserResolvedClientScript: null,
        OnControlValidateClientScript: null,
        UrlZone: null,
        AllUrlZones: false,
        SharePointGroupID: 0,
        AllowEmailAddresses: false,
        PPMRU: null,
        UseLocalSuggestionCache: true,
        CurrentQueryStr: '',
        LatestSearchQueryStr: '',
        InitialSuggestions: [],
        CurrentLocalSuggestions: [],
        CurrentLocalSuggestionsDict: {},
        VisibleSuggestions: 5,
        PrincipalAccountType: '',
        PrincipalAccountTypeEnum: 0,
        EnabledClaimProviders: '',
        SearchPrincipalSource: null,
        ResolvePrincipalSource: null,
        MaximumEntitySuggestions: 30,
        CurrentWeb: null,
        AutoFillControl: null,
        TotalUserCount: 0,
        UnresolvedUserCount: 0,
        UserQueryDict: {},
        ProcessedUserList: {},
        HasInputError: false,
        HasServerError: false,
        ShowUserPresence: true,
        TerminatingCharacter: ';',
        UnresolvedUserElmIdToReplace: '',
        WebApplicationID: '{00000000-0000-0000-0000-000000000000}',
        SetInitialValue: function(entities, initialErrorMsg) {
            if (entities == null || entities.length == 0)
                return;
            var pickerObj = this;
            var autoFillContext;

            try {
                autoFillContext = typeof SPClientAutoFill;
            }
            catch (e) {
                autoFillContext = "undefined";
            }
            EnsureScript("autofill.js", autoFillContext, function() {
            ULSa9l:
                ;
                for (var idx in entities) {
                    var entity = entities[idx];

                    if (entity.IsResolved) {
                        pickerObj.AddProcessedUser(entity, true);
                    }
                    else {
                        entity[SPClientPeoplePicker.DisplayTextName] = entity[SPClientPeoplePicker.ValueName];
                        var suggestions = entity[SPClientPeoplePicker.SuggestionsName];

                        entity[SPClientPeoplePicker.SuggestionsName] = SPClientPeoplePicker.BuildAutoFillMenuItems(pickerObj, suggestions);
                        pickerObj.AddUnresolvedUser(entity, false);
                    }
                }
                if (initialErrorMsg != null)
                    pickerObj.ShowErrorMessage(initialErrorMsg);
                pickerObj.EnsureAutoFillControl();
            });
        },
        AddUserKeys: function(userKeys, bSearch) {
            if (typeof bSearch == "undefined")
                bSearch = false;
            var pickerObj = this;
            var ensureContext;

            try {
                ensureContext = typeof SP.ClientContext;
            }
            catch (e) {
                ensureContext = "undefined";
            }
            EnsureScript("SP.js", ensureContext, function() {
            ULSa9l:
                ;
                if (userKeys == null || userKeys == '')
                    return;
                var allKeys = userKeys.split(';');
                var keyCount = allKeys.length;

                if (bSearch) {
                    if (keyCount > 1)
                        return;
                    var searchText = SPClientPeoplePicker.ParseUserKeyPaste(allKeys[0]);

                    if (searchText == '')
                        return;
                    var searchContext;

                    try {
                        searchContext = typeof SPClientAutoFill;
                    }
                    catch (e) {
                        searchContext = "undefined";
                    }
                    EnsureScript("autofill.js", searchContext, function() {
                    ULSa9l:
                        ;
                        pickerObj.EnsureAutoFillControl();
                        var editorElt = document.getElementById(pickerObj.EditorElementId);

                        editorElt.value = searchText;
                        var queryId = pickerObj.AddPickerSearchQuery(searchText);

                        pickerObj.ExecutePickerQuery([queryId], function(qId, results) {
                            if (results == null || queryId != qId)
                                return;
                            var resultArray = JSON.parse(results.m_value);

                            pickerObj.ShowAutoFill(SPClientPeoplePicker.BuildAutoFillMenuItems(pickerObj, resultArray));
                        }, function() {
                        ULSa9l:
                            ;
                            pickerObj.SetServerError();
                        }, null);
                    });
                }
                else {
                    pickerObj.BatchAddUserKeysOperation(allKeys, 0);
                }
            });
        },
        BatchAddUserKeysOperation: function(allKeys, numProcessed) {
            var numKeys = allKeys.length;
            var _picker = this;

            for (var idx = 0; idx < 10; idx++) {
                if (numProcessed == numKeys) {
                    setTimeout(function() {
                    ULSa9l:
                        ;
                        _picker.ResolveAllUsers(null);
                    }, 0);
                    return;
                }
                var strText = SPClientPeoplePicker.ParseUserKeyPaste(allKeys[numProcessed]);

                if (strText != '') {
                    var unresolvedUserInfo = SPClientPeoplePicker.BuildUnresolvedEntity(strText, strText);

                    this.AddUnresolvedUser(unresolvedUserInfo, false);
                }
                numProcessed++;
            }
            setTimeout(function() {
            ULSa9l:
                ;
                _picker.BatchAddUserKeysOperation(allKeys, numProcessed);
            }, 100);
        },
        ResolveAllUsers: function(fnContinuation) {
            var _picker = this;
            var elmInput = document.getElementById(this.EditorElementId);
            var resolvedContainer = document.getElementById(this.ResolvedListElementId);

            if (elmInput == null || resolvedContainer == null)
                return;
            var allQueries = [];
            var allQueriesDict = {};
            var processedUsers = resolvedContainer.childNodes;
            var numUsers = processedUsers.length;

            for (var idx = 0; idx < numUsers; idx++) {
                var userNode = processedUsers[idx];
                var userNodeId = userNode.id;
                var user = this.ProcessedUserList[userNodeId];

                if (user != null && !user.ResolvedUser && user.Suggestions == null) {
                    var queryId = this.AddPickerResolveQuery(user.SID);

                    allQueries.push(queryId);
                    allQueriesDict[queryId] = userNodeId;
                }
            }
            this.ExecutePickerQuery(allQueries, function(qId, results) {
                if (results == null)
                    return;
                _picker.ClearServerError();
                var callbackUserNodeId = allQueriesDict[qId];
                var callbackUser = _picker.ProcessedUserList[callbackUserNodeId];

                _picker.UpdateUnresolvedUser(results, callbackUser);
            }, function() {
            ULSa9l:
                ;
                _picker.SetServerError();
            }, fnContinuation);
        },
        AddUnresolvedUserFromEditor: function(bRunQuery) {
            var elmInput = document.getElementById(this.EditorElementId);

            if (elmInput == null)
                return;
            var strText = elmInput.value;

            if (strText.length == 0)
                return;
            elmInput.value = '';
            var unresolvedUserInfo = SPClientPeoplePicker.BuildUnresolvedEntity(strText, strText);

            this.AddUnresolvedUser(unresolvedUserInfo, bRunQuery);
            elmInput.size = 1;
            elmInput.focus();
        },
        AddUnresolvedUser: function(unresolvedUserObj, bRunQuery) {
            var newUnresolvedUserElementId = this.AddProcessedUser(unresolvedUserObj, false);
            var _picker = this;

            if (bRunQuery) {
                var strText = unresolvedUserObj[SPClientPeoplePicker.ValueName];
                var queryId = this.AddPickerResolveQuery(strText);

                this.ExecutePickerQuery([queryId], function(qId, results) {
                    if (results == null || queryId != qId)
                        return;
                    _picker.ClearServerError();
                    var callbackUser = _picker.ProcessedUserList[newUnresolvedUserElementId];

                    _picker.UpdateUnresolvedUser(results, callbackUser);
                }, function() {
                ULSa9l:
                    ;
                    _picker.SetServerError();
                }, null);
            }
        },
        UpdateUnresolvedUser: function(results, user) {
            if (results == null || user == null)
                return;
            var entity = JSON.parse(results.m_value);

            if (Boolean(entity.IsResolved)) {
                this.UnresolvedUserElmIdToReplace = user.UserContainerElementId;
                this.AddProcessedUser(entity, true);
            }
            else {
                user.UpdateSuggestions(entity);
                this.OnControlResolvedUserChanged();
                this.OnControlValueChanged();
            }
        },
        AddPickerSearchQuery: function(queryStr) {
            var clientContext = SP.ClientContext.get_current();
            var queryId = String(SPClientPeoplePicker.UserQueryId++);
            var qParams = this.GetPeoplePickerQueryParameters();

            qParams.set_queryString(queryStr);
            qParams.set_principalSource(this.SearchPrincipalSource);
            var webService = SP.UI.ApplicationPages.ClientPeoplePickerWebServiceInterface;

            this.UserQueryDict[queryId] = webService.clientPeoplePickerSearchUser(clientContext, qParams);
            return queryId;
        },
        AddPickerResolveQuery: function(queryStr) {
            var clientContext = SP.ClientContext.get_current();
            var queryId = String(SPClientPeoplePicker.UserQueryId++);
            var qParams = this.GetPeoplePickerQueryParameters();

            qParams.set_queryString(queryStr);
            qParams.set_principalSource(this.ResolvePrincipalSource);
            var webService = SP.UI.ApplicationPages.ClientPeoplePickerWebServiceInterface;

            this.UserQueryDict[queryId] = webService.clientPeoplePickerResolveUser(clientContext, qParams);
            return queryId;
        },
        GetPeoplePickerQueryParameters: function() {
        ULSa9l:
            ;
            var qParams = new SP.UI.ApplicationPages.ClientPeoplePickerQueryParameters();

            qParams.set_web(this.CurrentWeb);
            qParams.set_required(!this.AllowEmpty);
            qParams.set_forceClaims(this.ForceClaims);
            qParams.set_allowMultipleEntities(this.AllowMultipleUsers);
            qParams.set_allowEmailAddresses(this.AllowEmailAddresses);
            qParams.set_allUrlZones(this.AllUrlZones);
            qParams.set_enabledClaimProviders(this.EnabledClaimProviders);
            qParams.set_maximumEntitySuggestions(this.MaximumEntitySuggestions);
            qParams.set_sharePointGroupID(this.SharePointGroupID);
            qParams.set_webApplicationID(this.WebApplicationID);
            qParams.set_principalType(SPClientPeoplePicker.CreateSPPrincipalType(this.PrincipalAccountType));
            qParams.set_urlZoneSpecified(this.UrlZone != null);
            qParams.set_urlZone(this.UrlZone != null ? this.UrlZone : 0);
            return qParams;
        },
        ExecutePickerQuery: function(queryIds, onSuccess, onFailure, fnContinuation) {
            if (queryIds == null || queryIds.length == 0 || onSuccess == null || onFailure == null)
                return;
            this.ToggleWaitImageDisplay(true);
            this.AddLoadingSuggestionMenuOption();
            var _picker = this;
            var clientContext = SP.ClientContext.get_current();

            clientContext.executeQueryAsync(function() {
            ULSa9l:
                ;
                _ProcessQueryResults(onSuccess);
            }, function() {
            ULSa9l:
                ;
                _ProcessQueryResults(onFailure);
            });
            var timedOut = false;
            var queryTimeout = setTimeout(function() {
            ULSa9l:
                ;
                timedOut = true;
                _picker.SetServerError();
                _picker.ToggleWaitImageDisplay(false);
                for (var idx in _picker.UserQueryDict)
                    delete _picker.UserQueryDict[idx];
                if (fnContinuation != null) {
                    fnContinuation();
                }
            }, SPClientPeoplePicker.UserQueryMaxTimeout);

            function _ProcessQueryResults(fnCallback) {
                clearTimeout(queryTimeout);
                if (timedOut) {
                    return;
                }
                _picker.ToggleWaitImageDisplay(false);
                var queryCount = queryIds.length;

                for (var idx = 0; idx < queryCount; idx++) {
                    var queryId = queryIds[idx];

                    fnCallback(queryId, _picker.UserQueryDict[queryId]);
                    delete _picker.UserQueryDict[queryId];
                }
                if (fnContinuation != null) {
                    fnContinuation();
                }
            }
        },
        AddProcessedUser: function(userObject, fResolved) {
            if (userObject == null)
                return '';
            var value = userObject[SPClientPeoplePicker.ValueName];
            var newUniqueUserIdx = String(SPClientPeoplePicker.UniqueUserIdx++);
            var processedUserId = this.TopLevelElementId + '_' + value + '_ProcessedUser' + newUniqueUserIdx;
            var elmResolvedList = document.getElementById(this.ResolvedListElementId);

            if (this.UnresolvedUserElmIdToReplace == '') {
                this.TotalUserCount++;
                if (!fResolved)
                    this.UnresolvedUserCount++;
                var newUser = new SPClientPeoplePickerProcessedUser(userObject, processedUserId, fResolved);

                this.ProcessedUserList[processedUserId] = newUser;
                elmResolvedList.innerHTML += newUser.BuildUserHTML();
                newUser.UpdateUserMaxWidth();
            }
            else {
                var user = this.ProcessedUserList[this.UnresolvedUserElmIdToReplace];

                if (user != null)
                    user.UpdateResolvedUser(userObject, processedUserId);
                delete this.ProcessedUserList[this.UnresolvedUserElmIdToReplace];
                this.ProcessedUserList[processedUserId] = user;
                this.UnresolvedUserCount--;
                this.UnresolvedUserElmIdToReplace = '';
            }
            if (SPClientPeoplePicker.ShowUserPresence && fResolved && typeof ProcessImn != "undefined")
                ProcessImn();
            this.OnControlResolvedUserChanged();
            this.OnControlValueChanged();
            return processedUserId;
        },
        DeleteProcessedUser: function(elmToRemove) {
            var processedUser = null;

            if (elmToRemove == null) {
                var userListElm = document.getElementById(this.ResolvedListElementId);

                if (userListElm != null)
                    elmToRemove = userListElm.lastChild;
            }
            if (elmToRemove != null) {
                var elmToRemoveId = elmToRemove.id;

                elmToRemove.parentNode.removeChild(elmToRemove);
                var user = this.ProcessedUserList[elmToRemoveId];

                if (user != null && !user.ResolvedUser)
                    this.UnresolvedUserCount--;
                this.TotalUserCount--;
                delete this.ProcessedUserList[elmToRemoveId];
                this.OnControlResolvedUserChanged();
                this.OnControlValueChanged();
            }
        },
        OnControlValueChanged: function() {
        ULSa9l:
            ;
            this.SaveAllUserKeysToHiddenInput();
            var helpElement = document.getElementById(this.InitialHelpTextElementId);

            if (helpElement != null)
                helpElement.style.display = 'none';
            if (this.OnValueChangedClientScript != null)
                this.OnValueChangedClientScript(this.TopLevelElementId, this.GetAllUserInfo());
        },
        OnControlResolvedUserChanged: function() {
        ULSa9l:
            ;
            this.SaveAllUserKeysToHiddenInput();
            this.ValidateCurrentState();
            if (this.OnUserResolvedClientScript != null)
                this.OnUserResolvedClientScript(this.TopLevelElementId, this.GetAllUserInfo());
        },
        EnsureAutoFillControl: function() {
        ULSa9l:
            ;
            if (this.AutoFillEnabled && this.AutoFillControl == null) {
                this.AutoFillControl = new SPClientAutoFill(this.EditorElementId, this.AutoFillElementId, SPClientPeoplePicker_CallbackPopulateAutoFillFromEditor);
                this.AutoFillControl.AutoFillMinTextLength = 3;
                this.AutoFillControl.VisibleItemCount = this.VisibleSuggestions;
            }
        },
        ShowAutoFill: function(resultsTable) {
            if (resultsTable != null) {
                var fnOnClose = SPClientPeoplePicker_CallbackOnAutoFillClose;

                this.AutoFillControl.PopulateAutoFill(resultsTable, fnOnClose);
                AddEvtHandler(document.body.parentNode, "onclick", SPClientPeoplePicker_BodyOnClickCloseAutoFill);
            }
            else {
                this.CloseAutoFill();
            }
        },
        FocusAutoFill: function() {
        ULSa9l:
            ;
            if (this.AutoFillControl != null)
                this.AutoFillControl.FocusAutoFill();
        },
        CloseAutoFill: function() {
        ULSa9l:
            ;
            if (this.AutoFillControl != null)
                this.AutoFillControl.CloseAutoFill(null);
            RemoveEvtHandler(document.body.parentNode, "onclick", SPClientPeoplePicker_BodyOnClickCloseAutoFill);
        },
        IsAutoFillOpen: function() {
        ULSa9l:
            ;
            return this.AutoFillControl != null && this.AutoFillControl.IsAutoFillOpen();
        },
        SetFocusOnEditorEnd: function() {
        ULSa9l:
            ;
            var editorElm = document.getElementById(this.EditorElementId);

            if (editorElm != null) {
                var inputLen = editorElm.value.length;

                if (editorElm.createTextRange) {
                    var newRange = editorElm.createTextRange();

                    newRange.collapse(true);
                    newRange.moveStart('character', inputLen);
                    newRange.moveEnd('character', inputLen);
                    newRange.select();
                }
                else if (editorElm.setSelectionRange) {
                    editorElm.focus();
                    editorElm.setSelectionRange(inputLen, inputLen);
                }
            }
        },
        ToggleWaitImageDisplay: function(bShowImage) {
            var waitImageElm = document.getElementById(this.WaitImageId);

            if (waitImageElm != null)
                waitImageElm.style.display = bShowImage ? "inline" : "none";
        },
        SaveAllUserKeysToHiddenInput: function() {
        ULSa9l:
            ;
            var hiddenInputElm = document.getElementById(this.HiddenInputId);

            if (hiddenInputElm != null)
                hiddenInputElm.value = this.GetControlValueAsText();
        },
        GetCurrentEditorValue: function() {
        ULSa9l:
            ;
            var editorElm = document.getElementById(this.EditorElementId);

            return editorElm != null ? editorElm.value : '';
        },
        GetAllUserInfo: function() {
        ULSa9l:
            ;
            var allUserInfo = [];

            this.IterateEachProcessedUser(function(idx, user) {
                if (user != null) {
                    allUserInfo.push(user.UserInfo);
                    allUserInfo[allUserInfo.length - 1].Resolved = user.ResolvedUser;
                }
            });
            return allUserInfo;
        },
        HasResolvedUnverifiedEmail: function() {
        ULSa9l:
            ;
            var bUserFound = false;
            var allUsers = this.GetAllUserInfo();

            this.IterateEachProcessedUser(function(idx, user) {
                if (user != null && user.ResolvedAsUnverifiedEmail()) {
                    bUserFound = true;
                    return;
                }
            });
            return bUserFound;
        },
        GetControlValueAsJSObject: function() {
        ULSa9l:
            ;
            var userInfo = this.GetAllUserInfo();
            var editorText = this.GetCurrentEditorValue();

            if (editorText == '')
                return userInfo;
            var editInfo = SPClientPeoplePicker.BuildUnresolvedEntity(editorText, editorText);

            userInfo.push(editInfo);
            return userInfo;
        },
        GetAllUserKeys: function() {
        ULSa9l:
            ;
            var allUserKeys = '';
            var _picker = this;

            this.IterateEachProcessedUser(function(idx, user) {
                if (user != null) {
                    if (idx != 0)
                        allUserKeys += ';';
                    allUserKeys += user.SID;
                }
            });
            return allUserKeys;
        },
        GetControlValueAsText: function() {
        ULSa9l:
            ;
            var allUsers = this.GetControlValueAsJSObject();

            for (var user in allUsers) {
                if (typeof allUsers[user].Claim != "undefined")
                    delete allUsers[user].Claim;
                if (typeof allUsers[user].EntityDataElements != "undefined")
                    delete allUsers[user].EntityDataElements;
            }
            return JSON.stringify(allUsers);
        },
        IsEmpty: function() {
        ULSa9l:
            ;
            var editorText = this.GetCurrentEditorValue();

            return this.TotalUserCount == 0 && editorText == '';
        },
        IterateEachProcessedUser: function(fnCallback) {
            var resolvedContainer = document.getElementById(this.ResolvedListElementId);

            if (resolvedContainer == null || fnCallback == null)
                return;
            var processedUsers = resolvedContainer.childNodes;
            var numUsers = processedUsers.length;

            for (var idx = 0; idx < numUsers; idx++) {
                var userNode = processedUsers[idx];
                var user = this.ProcessedUserList[userNode.id];

                fnCallback(idx, user);
            }
        },
        HasResolvedUsers: function() {
        ULSa9l:
            ;
            return this.TotalUserCount - this.UnresolvedUserCount > 0;
        },
        Validate: function() {
        ULSa9l:
            ;
            if (!this.AllowEmpty && this.IsEmpty()) {
                this.HasInputError = true;
                this.ShowErrorMessage(Strings.STS.L_SPClientRequiredValidatorError);
            }
            else
                this.ValidateCurrentState();
        },
        ValidateCurrentState: function() {
        ULSa9l:
            ;
            if (!this.AllowMultipleUsers && this.TotalUserCount > 1) {
                this.HasInputError = true;
                this.ShowErrorMessage(Strings.STS.L_SPClientPeoplePickerMultipleUserError);
            }
            else {
                var errorMsg = this.GetUnresolvedEntityErrorMessage();

                if (errorMsg != '') {
                    this.HasInputError = true;
                    this.ShowErrorMessage(errorMsg);
                }
                else {
                    this.HasInputError = false;
                    this.HasServerError = false;
                    this.ShowErrorMessage();
                }
            }
            this.OnControlValidate();
        },
        GetUnresolvedEntityErrorMessage: function() {
        ULSa9l:
            ;
            var firstErrorMsg = '';

            this.IterateEachProcessedUser(function(idx, user) {
                if (user != null && !user.ResolvedUser && user.ErrorDescription != '') {
                    if (firstErrorMsg == '')
                        firstErrorMsg = user.ErrorDescription;
                }
            });
            return firstErrorMsg;
        },
        ShowErrorMessage: function(msg) {
            var topContainer = document.getElementById(this.TopLevelElementId);

            if (topContainer != null && topContainer.nextSibling != null)
                topContainer.parentNode.removeChild(topContainer.nextSibling);
            if (msg != null && msg != '') {
                var errorSpan = document.createElement("SPAN");

                errorSpan.className = 'ms-formvalidation sp-peoplepicker-errorMsg';
                errorSpan.innerHTML = '<span role="alert">' + STSHtmlEncode(msg) + '<br/></span>';
                topContainer.parentNode.appendChild(errorSpan);
            }
        },
        ClearServerError: function() {
        ULSa9l:
            ;
            this.HasServerError = false;
            this.ValidateCurrentState();
        },
        SetServerError: function() {
        ULSa9l:
            ;
            this.HasServerError = true;
            this.ShowErrorMessage(Strings.STS.L_SPClientPeoplePickerServerTimeOutError);
            this.OnControlValidate();
        },
        OnControlValidate: function() {
        ULSa9l:
            ;
            if (this.OnControlValidateClientScript != null)
                this.OnControlValidateClientScript(this.TopLevelElementId, this.GetAllUserInfo());
        },
        SetEnabledState: function(bEnabled) {
            var editorElement = document.getElementById(this.EditorElementId);
            var topContainer = document.getElementById(this.TopLevelElementId);

            if (editorElement == null || topContainer == null)
                return;
            if (bEnabled) {
                editorElement.disabled = false;
                RemoveCssClassFromElement(topContainer, "sp-peoplepicker-topLevelDisabled");
            }
            else {
                editorElement.value = '';
                editorElement.disabled = true;
                AddCssClassToElement(topContainer, "sp-peoplepicker-topLevelDisabled");
            }
            this.SaveAllUserKeysToHiddenInput();
        },
        DisplayLocalSuggestions: function() {
        ULSa9l:
            ;
            var editorElement = document.getElementById(this.EditorElementId);

            if (editorElement == null)
                return;
            this.ClearServerError();
            var inputVal = editorElement.value;

            this.CompileLocalSuggestions(inputVal);
            var numLocalOpts = this.CurrentLocalSuggestions.length;

            if (numLocalOpts > 0) {
                var localOpts = this.CurrentLocalSuggestions.concat([]);

                this.ShowAutoFill(SPClientPeoplePicker.AddAutoFillMetaData(this, localOpts, numLocalOpts));
            }
            else if (!this.PlanningGlobalSearch()) {
                this.CloseAutoFill();
            }
        },
        CompileLocalSuggestions: function(input) {
            if (input == this.CurrentQueryStr)
                return;
            this.CurrentLocalSuggestions = [];
            this.CurrentLocalSuggestionsDict = {};
            if (input == null || input == '')
                return;
            if (!this.ShouldUsePPMRU() && (this.InitialSuggestions == null || this.InitialSuggestions.length == 0))
                return;
            this.CurrentQueryStr = input;
            this.LatestSearchQueryStr = '';
            var lowInput = input.toLowerCase();

            if (this.ShouldUsePPMRU()) {
                var localObjs = this.PPMRU.GetItems(input);
                var localCount = localObjs.length;

                for (var lIdx = 0; lIdx < localCount; lIdx++) {
                    var localOpt = localObjs[lIdx];
                    var localKey = localOpt.Key.toLowerCase();

                    if (this.CurrentLocalSuggestionsDict[localKey] == null) {
                        this.CurrentLocalSuggestions.push(localOpt);
                        this.CurrentLocalSuggestionsDict[localKey] = localOpt;
                        if (this.CurrentLocalSuggestions.length == SPClientPeoplePicker.MaximumLocalSuggestions)
                            return;
                    }
                }
            }
            var initialCount = this.InitialSuggestions.length;

            for (var idx = 0; idx < initialCount; idx++) {
                var option = this.InitialSuggestions[idx];

                if (SPClientPeoplePicker.TestLocalMatch(lowInput, option)) {
                    this.CurrentLocalSuggestions.push(option);
                    this.CurrentLocalSuggestionsDict[option.Key.toLowerCase()] = option;
                    if (this.CurrentLocalSuggestions.length == SPClientPeoplePicker.MaximumLocalSuggestions)
                        return;
                }
            }
        },
        PlanningGlobalSearch: function() {
        ULSa9l:
            ;
            var editorElement = document.getElementById(this.EditorElementId);

            return editorElement != null && this.AutoFillControl != null && editorElement.value.length >= this.AutoFillControl.AutoFillMinTextLength;
        },
        AddLoadingSuggestionMenuOption: function() {
        ULSa9l:
            ;
            if (!this.ShowingLocalSuggestions() && !this.IsAutoFillOpen())
                return;
            var loadingOpts = [];

            loadingOpts.push(SPClientAutoFill.BuildAutoFillSeparatorMenuItem());
            loadingOpts.push(SPClientAutoFill.BuildAutoFillLoadingSuggestionsMenuItem());
            this.ShowAutoFill(this.CurrentLocalSuggestions.concat(loadingOpts));
        },
        ShowingLocalSuggestions: function() {
        ULSa9l:
            ;
            return this.IsAutoFillOpen() && this.CurrentLocalSuggestions.length > 0;
        },
        ShouldUsePPMRU: function() {
        ULSa9l:
            ;
            return this.UseLocalSuggestionCache && this.UrlZone == null && this.SharePointGroupID <= 0 && this.WebApplicationID == '{00000000-0000-0000-0000-000000000000}' && (this.EnabledClaimProviders == '' || this.EnabledClaimProviders == null) && this.PrincipalAccountTypeEnum % 2 == 1 && this.ResolvePrincipalSource == 15;
        }
    };
    SPClientPeoplePicker.TestLocalMatch = function(strSearchLower, dataEntity) {
        if (strSearchLower == null || strSearchLower == '' || dataEntity == null)
            return false;
        if (typeof dataEntity.LocalSearchTerm != 'undefined') {
            var strDataItemTerm = dataEntity.LocalSearchTerm;

            if (strDataItemTerm != null && strDataItemTerm.indexOf(strSearchLower) != -1)
                return true;
        }
        var hasEmail = dataEntity.EntityData != null && dataEntity.EntityData.Email != null;
        var emailKey = hasEmail ? dataEntity.EntityData.Email : '';

        if (emailKey.indexOf('@') != -1)
            emailKey = emailKey.substr(0, emailKey.indexOf('@'));
        if ((dataEntity.Key.toLowerCase()).indexOf(strSearchLower) != -1 || (dataEntity.DisplayText.toLowerCase()).indexOf(strSearchLower) != -1 || (emailKey.toLowerCase()).indexOf(strSearchLower) != -1)
            return true;
        return false;
    };
    SPClientPeoplePicker.PickerObjectFromSubElement = function(elmSubElement) {
        var elmPicker = SPClientPeoplePicker.GetTopLevelControl(elmSubElement);

        if (elmPicker == null)
            return null;
        var topLevelId = elmPicker.id;

        if (typeof SPClientPeoplePicker.SPClientPeoplePickerDict[topLevelId] != "undefined")
            return SPClientPeoplePicker.SPClientPeoplePickerDict[topLevelId];
        return null;
    };
    SPClientPeoplePicker.GetTopLevelControl = function(elmChild) {
        var elm = elmChild;

        while (elm != null && elm.nodeName.toLowerCase() != "body") {
            if (Boolean(elm.getAttribute('SPClientPeoplePicker')))
                return elm;
            elm = elm.parentNode;
        }
        return null;
    };
    SPClientPeoplePicker.AugmentEntitySuggestions = function(pickerObj, allEntities, mergeLocal) {
        if (pickerObj == null || allEntities == null || typeof allEntities.length == "undefined")
            return [];
        var resArray = [];
        var entityCount = allEntities.length;

        for (var entityIdx = 0; entityIdx < entityCount; entityIdx++) {
            var entity = allEntities[entityIdx];
            var key = '';
            var displayText = '';
            var subDisplayText = '';

            if (entity[SPClientPeoplePicker.ValueName] != null)
                key = entity[SPClientPeoplePicker.ValueName];
            if (mergeLocal && pickerObj.CurrentLocalSuggestionsDict[key.toLowerCase()] != null)
                continue;
            if (entity[SPClientPeoplePicker.DisplayTextName] != null)
                displayText = entity[SPClientPeoplePicker.DisplayTextName];
            if (entity.EntityData != null && entity.EntityData[SPClientPeoplePicker.SubDisplayTextName] != null)
                subDisplayText = entity.EntityData[SPClientPeoplePicker.SubDisplayTextName];
            entity[SPClientPeoplePicker.KeyProperty] = key;
            entity[SPClientPeoplePicker.DisplayTextProperty] = displayText;
            entity[SPClientPeoplePicker.SubDisplayTextProperty] = subDisplayText;
            resArray.push(entity);
        }
        return resArray;
    };
    SPClientPeoplePicker.ParseUserKeyPaste = function(userKey) {
        if (userKey == null || userKey == '')
            return '';
        var openBracket = userKey.indexOf('<');
        var emailSep = userKey.indexOf('@', openBracket);
        var closeBracket = userKey.indexOf('>', emailSep);

        if (openBracket != -1 && emailSep != -1 && closeBracket != -1)
            return userKey.substring(openBracket + 1, closeBracket);
        return userKey;
    };
    SPClientPeoplePicker.CreateSPPrincipalType = function(acctStr) {
        if (acctStr == null || acctStr == '')
            return 0;
        var result = 0;
        var types = acctStr.split(',');

        for (var idx in types) {
            if (types[idx] == 'User')
                result |= 1;
            if (types[idx] == 'DL')
                result |= 2;
            if (types[idx] == 'SecGroup')
                result |= 4;
            if (types[idx] == 'SPGroup')
                result |= 8;
        }
        return result;
    };
    SPClientPeoplePicker.IsUserEntity = function(entity) {
        if (entity == null)
            return false;
        return entity.EntityType == 'User' || entity.EntityData != null && entity.EntityData.PrincipalType == 'User';
    };
    SPClientPeoplePicker.BuildAutoFillMenuItems = function(pickerObj, options) {
        options = SPClientPeoplePicker.AugmentEntitySuggestions(pickerObj, options, false);
        return SPClientPeoplePicker.AddAutoFillMetaData(pickerObj, options, options.length);
    };
    SPClientPeoplePicker.AddAutoFillMetaData = function(pickerObj, options, numOpts) {
        if (numOpts == 0) {
            options.push(SPClientAutoFill.BuildAutoFillSeparatorMenuItem());
            options.push(SPClientAutoFill.BuildAutoFillFooterMenuItem(Strings.STS.L_SPClientPeoplePickerNoResults));
        }
        else {
            options.push(SPClientAutoFill.BuildAutoFillSeparatorMenuItem());
            var footerText = GetLocalizedCountValue(Strings.STS.L_SPClientPeoplePicker_AutoFillFooter, Strings.STS.L_SPClientPeoplePicker_AutoFillFooterIntervals, numOpts);

            options.push(SPClientAutoFill.BuildAutoFillFooterMenuItem(StBuildParam(footerText, numOpts)));
        }
        return options;
    };
    SPClientPeoplePicker.BuildUnresolvedEntity = function(key, dispText) {
        var result = {};

        result.IsResolved = false;
        result[SPClientPeoplePicker.ValueName] = (result[SPClientPeoplePicker.KeyProperty] = key);
        result[SPClientPeoplePicker.DisplayTextName] = (result[SPClientPeoplePicker.DisplayTextProperty] = dispText);
        return result;
    };
    SPClientPeoplePicker.InitializeStandalonePeoplePicker = function(clientId, value, schema) {
        var placeHolder = document.getElementById(clientId);

        if (placeHolder == null)
            return;
        schema['ServerContainerId'] = clientId + '_TopSpan';
        var initCallbackFn, focusCallbackFn, errorCallbackFn;
        var renderCtx = {};

        renderCtx['CurrentFieldValue'] = value;
        renderCtx['CurrentFieldSchema'] = schema;
        renderCtx['FormContext'] = {
            updateControlValue: function() {
            },
            registerClientValidator: function() {
            },
            registerGetValueCallback: function() {
            },
            registerHasErrorCallback: function() {
            },
            registerValidationErrorCallback: function(fldName, errorCallback) {
                if (typeof errorCallback == "function")
                    errorCallbackFn = errorCallback;
            },
            registerFocusCallback: function(fldName, focusCallback) {
                if (typeof focusCallback == "function")
                    focusCallbackFn = focusCallback;
            },
            registerInitCallback: function(fldName, initCallback) {
                if (typeof initCallback == "function")
                    initCallbackFn = initCallback;
            }
        };
        placeHolder.innerHTML = SPClientPeoplePickerCSRTemplate(renderCtx);
        if (initCallbackFn != null)
            initCallbackFn();
        if (schema.SetFocus && focusCallbackFn != null)
            focusCallbackFn();
        if (schema.ErrorMessage != null && schema.ErrorMessage != '' && errorCallbackFn != null)
            errorCallbackFn({
                'errorMessage': schema.ErrorMessage
            });
    };
    SPClientPeoplePickerProcessedUser.prototype = {
        UserContainerElementId: '',
        DisplayElementId: '',
        PresenceElementId: '',
        SID: '',
        DisplayName: '',
        SIPAddress: '',
        UserInfo: null,
        ResolvedUser: true,
        Suggestions: null,
        ErrorDescription: '',
        UpdateResolvedUser: function(newUserInfo, strNewElementId) {
            var userContainerElement = document.getElementById(this.UserContainerElementId);
            var userDisplayElement = document.getElementById(this.DisplayElementId);
            var presenceElement = document.getElementById(this.PresenceElementId);
            var strSID = newUserInfo[SPClientPeoplePicker.ValueName];
            var strDisplayName = newUserInfo[SPClientPeoplePicker.DisplayTextName];
            var strSIPAddress = newUserInfo.EntityData != null ? newUserInfo.EntityData[SPClientPeoplePicker.SIPAddressName] : null;

            this.ResolvedUser = true;
            this.UserInfo = newUserInfo;
            userContainerElement.setAttribute('ResolvedUser', 'true');
            this.Suggestions = null;
            this.ErrorDescription = '';
            this.SID = strSID != null ? strSID : '';
            userContainerElement.setAttribute('SID', this.SID);
            this.DisplayName = strDisplayName != null ? strDisplayName : '';
            userDisplayElement.title = (userDisplayElement.innerHTML = this.DisplayName);
            userDisplayElement.className = "ms-entity-resolved";
            this.UserContainerElementId = (userContainerElement.id = strNewElementId);
            this.DisplayElementId = (userDisplayElement.id = strNewElementId + '_UserDisplay');
            this.PresenceElementId = (presenceElement.id = strNewElementId + '_PresenceContainer');
            this.SIPAddress = strSIPAddress != null ? strSIPAddress : '';
            presenceElement.innerHTML = SPClientPeoplePickerProcessedUser.BuildUserPresenceHtml(this.PresenceElementId, this.SIPAddress, this.ResolvedUser);
        },
        UpdateSuggestions: function(entity) {
            var resultArray = entity.MultipleMatches;

            if (resultArray == null)
                resultArray = [];
            var userElm = document.getElementById(this.UserContainerElementId);
            var pickerObj = SPClientPeoplePicker.PickerObjectFromSubElement(userElm);

            this.Suggestions = SPClientPeoplePicker.BuildAutoFillMenuItems(pickerObj, resultArray);
            if (entity.Description != null)
                this.ErrorDescription = entity.Description;
        },
        BuildUserHTML: function() {
        ULSa9l:
            ;
            var personSpan = [];
            var imgHtml = SPClientPeoplePickerProcessedUser.BuildUserPresenceHtml(this.PresenceElementId, this.SIPAddress, this.ResolvedUser);

            personSpan.push('<span data-sp-peoplePickerProcessedUser="true" id="');
            personSpan.push(STSHtmlEncode(this.UserContainerElementId));
            personSpan.push('" ResolvedUser="');
            personSpan.push(this.ResolvedUser ? 'true' : 'false');
            personSpan.push('" SID="');
            personSpan.push(STSHtmlEncode(this.SID));
            personSpan.push('" class="sp-peoplepicker-userSpan">');
            personSpan.push('<span class="sp-peoplepicker-userPresence" id="');
            personSpan.push(STSHtmlEncode(this.PresenceElementId));
            personSpan.push('">');
            personSpan.push(imgHtml);
            personSpan.push('</span>');
            personSpan.push('<span class="');
            personSpan.push(this.ResolvedUser ? "ms-entity-resolved" : "ms-entity-unresolved");
            personSpan.push('" id="');
            personSpan.push(STSHtmlEncode(this.DisplayElementId));
            personSpan.push('" title="');
            personSpan.push(STSHtmlEncode(this.DisplayName));
            personSpan.push('">');
            if (!this.ResolvedUser) {
                personSpan.push('<a href="#" data-sp-peoplePickerProcessedUserDisplay="true" class="sp-peoplepicker-userDisplayLink" ');
                personSpan.push('onkeydown="return SPClientPeoplePickerProcessedUser.HandleResolveProcessedUserKey(event);">');
            }
            personSpan.push(STSHtmlEncode(this.DisplayName));
            if (!this.ResolvedUser)
                personSpan.push('</a>');
            personSpan.push('</span>');
            personSpan.push('<a class="sp-peoplepicker-delImage"');
            personSpan.push(' onkeydown="SPClientPeoplePickerProcessedUser.HandleDeleteProcessedUserKey(event); return true;"');
            personSpan.push(' href="#" onclick="SPClientPeoplePickerProcessedUser.DeleteProcessedUser(this.parentNode); return false;" >');
            personSpan.push('x</a>');
            personSpan.push('</span>');
            return personSpan.join('');
        },
        UpdateUserMaxWidth: function() {
        ULSa9l:
            ;
            var userTextElm = document.getElementById(this.DisplayElementId);

            if (userTextElm != null) {
                var pickerObj = SPClientPeoplePicker.PickerObjectFromSubElement(userTextElm);
                var ppElm = document.getElementById(pickerObj.TopLevelElementId);

                userTextElm.style.maxWidth = (ppElm.clientWidth - 65).toString() + "px";
            }
        },
        ResolvedAsUnverifiedEmail: function() {
        ULSa9l:
            ;
            if (!this.ResolvedUser || this.UserInfo == null)
                return false;
            var uInfo = this.UserInfo;

            return uInfo.EntityData != null && uInfo.EntityData.PrincipalType == SPClientPeoplePicker.UnvalidatedEmailAddressKey;
        }
    };
    SPClientPeoplePickerProcessedUser.BuildUserPresenceHtml = function(elmId, strSip, bResolved) {
        if (!SPClientPeoplePicker.ShowUserPresence)
            return '';
        if (!bResolved || strSip == null || strSip == '')
            return '';
        var userData = {
            "ID": "0",
            "Entity": [{
                "id": "0",
                "title": elmId,
                "sip": strSip
            }]
        };
        var fieldSchemaData = {
            "Field": [{
                "Name": "Entity",
                "FieldType": "User",
                "PresenceOnly": "1",
                "InlineRender": "1",
                "Type": "User"
            }],
            "EffectivePresenceEnabled": "1",
            "PresenceAlt": Strings.STS.L_UserFieldNoUserPresenceAlt
        };
        var renderCtx = new ContextInfo();

        renderCtx.Templates = {};
        renderCtx.Templates['Fields'] = {};
        return spMgr.RenderFieldByName(renderCtx, "Entity", userData, fieldSchemaData);
    };
    SPClientPeoplePickerProcessedUser.GetUserContainerElement = function(elmChild) {
        var elm = elmChild;

        while (elm != null && elm.nodeName.toLowerCase() != "body") {
            if (elm.getAttribute('data-sp-peoplePickerProcessedUser') == 'true')
                return elm;
            elm = elm.parentNode;
        }
        return null;
    };
    SPClientPeoplePickerProcessedUser.HandleProcessedUserClick = function(ndClicked) {
        var containerElm = SPClientPeoplePickerProcessedUser.GetUserContainerElement(ndClicked);
        var pickerObj = SPClientPeoplePicker.PickerObjectFromSubElement(containerElm);

        if (containerElm != null && pickerObj != null) {
            var userElmId = containerElm.id;
            var user = pickerObj.ProcessedUserList[userElmId];

            if (user != null) {
                pickerObj.UnresolvedUserElmIdToReplace = userElmId;
                pickerObj.ShowAutoFill(user.Suggestions);
                pickerObj.FocusAutoFill();
            }
        }
    };
    SPClientPeoplePickerProcessedUser.DeleteProcessedUser = function(elmToRemove) {
        var pickerObj = SPClientPeoplePicker.PickerObjectFromSubElement(elmToRemove);

        pickerObj.CloseAutoFill();
        pickerObj.DeleteProcessedUser(elmToRemove);
        pickerObj.SetFocusOnEditorEnd();
    };
    SPClientPeoplePickerProcessedUser.HandleDeleteProcessedUserKey = function(e) {
        if (e == null)
            e = window.event;
        var keynum = GetEventKeyCode(e);
        var elmInput = GetEventSrcElement(e);

        if (keynum == 8 || keynum == 46)
            SPClientPeoplePickerProcessedUser.DeleteProcessedUser(elmInput.parentNode);
    };
    SPClientPeoplePickerProcessedUser.HandleResolveProcessedUserKey = function(e) {
        if (e == null)
            e = window.event;
        var keynum = GetEventKeyCode(e);
        var elmUser = GetEventSrcElement(e);

        if (keynum == 13 && elmUser != null) {
            SPClientPeoplePickerProcessedUser.HandleProcessedUserClick(elmUser.parentNode);
            CancelEvent(e);
            return false;
        }
        return true;
    };
    SPClientPeoplePickerMRU.PPMRUVersion = 0;
    SPClientPeoplePickerMRU.MaxPPMRUItems = 200;
    SPClientPeoplePickerMRU.PPMRUDomLocalStoreKey = "ClientPeoplePickerMRU";
    SPClientPeoplePickerMRU.GetSPClientPeoplePickerMRU = function() {
    ULSa9l:
        ;
        if (g_SPClientPeoplePickerInstance == null)
            g_SPClientPeoplePickerInstance = new SPClientPeoplePickerMRU();
        return g_SPClientPeoplePickerInstance;
    };
    SPClientPeoplePickerMRU.prototype = {
        isCacheAvailable: false,
        MRUDataDict: {},
        MRUData: null,
        GetItems: function(strKey) {
            if (strKey == null || strKey == '' || !this.isCacheAvailable)
                return [];
            var resultDict = {};
            var resultArr = [];
            var strKeyLower = strKey.toLowerCase();
            var cacheData = this.MRUData.dataArray;
            var cacheItemCount = cacheData.length;

            for (var i = 0; i < cacheItemCount; i++) {
                var cacheEntity = cacheData[i];

                if (SPClientPeoplePicker.TestLocalMatch(strKeyLower, cacheEntity)) {
                    var matchKeyLower = cacheEntity.Key.toLowerCase();

                    if (!resultDict[matchKeyLower]) {
                        resultArr.push(cacheEntity);
                        resultDict[matchKeyLower] = true;
                    }
                }
            }
            return resultArr;
        },
        SetItem: function(strSearchTerm, objEntity) {
            if (strSearchTerm == null || strSearchTerm == '' || objEntity == null || !this.isCacheAvailable)
                return;
            var searchTermLower = strSearchTerm.toLowerCase();
            var entityKeyLower = objEntity.Key.toLowerCase();

            if (this.MRUDataDict[entityKeyLower] != null)
                return;
            objEntity.LocalSearchTerm = searchTermLower;
            this.InsertCacheItem(objEntity);
            var strSerializedObj = JSON.stringify(this.MRUData);
            var ls = window.localStorage;

            ls.setItem(SPClientPeoplePickerMRU.PPMRUDomLocalStoreKey, strSerializedObj);
        },
        InsertCacheItem: function(item) {
            var numEntries = this.MRUData.dataArray.length;
            var insertionPoint = this.MRUData.insertionIndex;

            if (numEntries == SPClientPeoplePickerMRU.MaxPPMRUItems) {
                var oldEntity = this.MRUData.dataArray[insertionPoint];

                delete this.MRUDataDict[oldEntity.Key.toLowerCase()];
                this.MRUData.dataArray[insertionPoint] = item;
                this.MRUData.insertionIndex++;
                if (this.MRUData.insertionIndex >= SPClientPeoplePickerMRU.MaxPPMRUItems)
                    this.MRUData.insertionIndex = 0;
            }
            else if (numEntries < SPClientPeoplePickerMRU.MaxPPMRUItems) {
                this.MRUData.dataArray.push(item);
            }
            this.MRUDataDict[item.Key.toLowerCase()] = item;
        },
        ResetCache: function() {
        ULSa9l:
            ;
            if (!this.isCacheAvailable)
                return;
            var ls = window.localStorage;

            ls.removeItem(SPClientPeoplePickerMRU.PPMRUDomLocalStoreKey);
            this.MRUDataDict = {};
            this.MRUData = new SPClientPeoplePickerMRUData();
        },
        EnsurePPMRUData: function() {
        ULSa9l:
            ;
            if (!window.localStorage)
                return false;
            if (this.MRUData != null)
                return true;
            var ls = window.localStorage;
            var strMRUData = ls.getItem(SPClientPeoplePickerMRU.PPMRUDomLocalStoreKey);

            if (strMRUData == null || strMRUData == '') {
                this.MRUData = new SPClientPeoplePickerMRUData();
            }
            else {
                var objMRUData = JSON.parse(strMRUData);

                if (objMRUData.cacheVersion != SPClientPeoplePickerMRU.PPMRUVersion) {
                    this.MRUData = new SPClientPeoplePickerMRUData();
                    ls.removeItem(SPClientPeoplePickerMRU.PPMRUDomLocalStoreKey);
                }
                else {
                    this.MRUData = objMRUData;
                }
            }
            return true;
        },
        InitMRUDictionary: function() {
        ULSa9l:
            ;
            var resultDict = {};

            if (!this.isCacheAvailable)
                return resultDict;
            var cacheData = this.MRUData.dataArray;
            var cacheItemCount = cacheData.length;

            for (var i = 0; i < cacheItemCount; i++) {
                var cacheEntity = cacheData[i];

                resultDict[cacheEntity.Key.toLowerCase()] = cacheEntity;
            }
            return resultDict;
        }
    };
    SPClientPeoplePickerMRUData.prototype = {
        dataArray: [],
        insertionIndex: 0,
        cacheVersion: 0
    };
    if (typeof Sys != "undefined" && Sys != null && Sys.Application != null) {
        Sys.Application.notifyScriptLoaded();
    }
    if (typeof NotifyScriptLoadedAndExecuteWaitingJobs == "function") {
        NotifyScriptLoadedAndExecuteWaitingJobs("clientpeoplepicker.js");
    }
}
function ULSa9l() {
    var o = new Object;

    o.ULSTeamName = "Microsoft SharePoint Foundation";
    o.ULSFileName = "clientpeoplepicker.commentedjs";
    return o;
}
function SPClientPeoplePicker(controlProps) {
    this.TopLevelElementId = controlProps.TopLevelElementId;
    this.EditorElementId = controlProps.EditorElementId;
    this.AutoFillElementId = controlProps.AutoFillElementId;
    this.ResolvedListElementId = controlProps.ResolvedListElementId;
    this.InitialHelpTextElementId = controlProps.InitialHelpTextElementId;
    this.WaitImageId = controlProps.WaitImageId;
    this.HiddenInputId = controlProps.HiddenInputId;
    if (typeof controlProps.Required != "undefined")
        this.AllowEmpty = !Boolean(controlProps.Required);
    if (typeof controlProps.ForceClaims != "undefined")
        this.ForceClaims = Boolean(controlProps.ForceClaims);
    if (typeof controlProps.AutoFillEnabled != "undefined")
        this.AutoFillEnabled = Boolean(controlProps.AutoFillEnabled);
    if (typeof controlProps.AllowMultipleValues != "undefined")
        this.AllowMultipleUsers = Boolean(controlProps.AllowMultipleValues);
    if (typeof controlProps.AllowEmailAddresses != "undefined")
        this.AllowEmailAddresses = Boolean(controlProps.AllowEmailAddresses);
    if (typeof controlProps.AllUrlZones != "undefined")
        this.AllUrlZones = Boolean(controlProps.AllUrlZones);
    if (typeof controlProps.VisibleSuggestions != "undefined")
        this.VisibleSuggestions = Number(controlProps.VisibleSuggestions);
    if (typeof controlProps.UseLocalSuggestionCache != "undefined")
        this.UseLocalSuggestionCache = Boolean(controlProps.UseLocalSuggestionCache);
    if (typeof controlProps.InitialSuggestions != "undefined" && controlProps.InitialSuggestions != null) {
        this.InitialSuggestions = controlProps.InitialSuggestions;
        SPClientPeoplePicker.AugmentEntitySuggestions(this, this.InitialSuggestions, false);
    }
    if (typeof controlProps.UrlZone != "undefined")
        this.UrlZone = controlProps.UrlZone;
    if (typeof controlProps.WebApplicationID != "undefined")
        this.WebApplicationID = controlProps.WebApplicationID;
    if (typeof controlProps.SharePointGroupID != "undefined")
        this.SharePointGroupID = Number(controlProps.SharePointGroupID);
    if (typeof controlProps.PrincipalAccountType != "undefined")
        this.PrincipalAccountType = controlProps.PrincipalAccountType;
    if (typeof controlProps.EnabledClaimProviders != "undefined")
        this.EnabledClaimProviders = controlProps.EnabledClaimProviders;
    if (typeof controlProps.ResolvePrincipalSource != "undefined")
        this.ResolvePrincipalSource = controlProps.ResolvePrincipalSource;
    if (typeof controlProps.SearchPrincipalSource != "undefined")
        this.SearchPrincipalSource = controlProps.SearchPrincipalSource;
    if (typeof controlProps.MaximumEntitySuggestions != "undefined")
        this.MaximumEntitySuggestions = Number(controlProps.MaximumEntitySuggestions);
    this.PrincipalAccountTypeEnum = SPClientPeoplePicker.CreateSPPrincipalType(this.PrincipalAccountType);
    var fnUserCallback = controlProps.OnValueChangedClientScript;

    this.OnValueChangedClientScript = fnUserCallback != null ? eval(fnUserCallback) : null;
    var fnResolvedCallback = controlProps.OnUserResolvedClientScript;

    this.OnUserResolvedClientScript = fnResolvedCallback != null ? eval(fnResolvedCallback) : null;
    var fnControlValidateCallback = controlProps.OnControlValidateClientScript;

    this.OnControlValidateClientScript = fnControlValidateCallback != null ? eval(fnControlValidateCallback) : null;
    this.AutoFillControl = null;
    this.TotalUserCount = 0;
    this.UnresolvedUserCount = 0;
    this.UserQueryDict = {};
    this.ProcessedUserList = {};
    this.UnresolvedUserElmIdToReplace = '';
    if (typeof ClientCanHandleImn == "undefined" || !ClientCanHandleImn())
        SPClientPeoplePicker.ShowUserPresence = false;
    var topLevelElement = document.getElementById(this.TopLevelElementId);

    if (topLevelElement != null) {
        topLevelElement.setAttribute("SPClientPeoplePicker", "true");
        if (Boolean(controlProps.Width)) {
            topLevelElement.style.width = controlProps.Width;
        }
        if (controlProps.Width == '100%') {
            topLevelElement.className += " ms-fullWidth";
        }
        if (Boolean(controlProps.Rows) && Number(controlProps.Rows) != 0)
            topLevelElement.style.minHeight = String(Number(controlProps.Rows) * 16) + 'px';
    }
    var editorElement = document.getElementById(this.EditorElementId);

    if (editorElement != null) {
        editorElement.setAttribute("data-sp-peoplePickerEditor", "true");
        var availableSpace = editorElement.parentNode.clientWidth - 30;

        if (availableSpace <= 0)
            availableSpace = 20;
        editorElement.style.maxWidth = String(availableSpace) + 'px';
    }
    if (this.ShouldUsePPMRU())
        this.PPMRU = SPClientPeoplePickerMRU.GetSPClientPeoplePickerMRU();
    SPClientPeoplePicker.SPClientPeoplePickerDict[this.TopLevelElementId] = this;
}
function SPClientPeoplePicker_CallbackPopulateAutoFillFromEditor(elmInput) {
    if (elmInput == null)
        return;
    var strValue = elmInput.value;
    var pickerObj = SPClientPeoplePicker.PickerObjectFromSubElement(elmInput);

    if (pickerObj == null || pickerObj.LatestSearchQueryStr == strValue)
        return;
    pickerObj.LatestSearchQueryStr = strValue;
    var queryId = pickerObj.AddPickerSearchQuery(strValue);

    pickerObj.ExecutePickerQuery([queryId], function(qId, results) {
        if (results == null || strValue != elmInput.value || queryId != qId)
            return;
        var resultArray = JSON.parse(results.m_value);

        if (pickerObj.ShowingLocalSuggestions()) {
            var uniqueResultOpts = SPClientPeoplePicker.AugmentEntitySuggestions(pickerObj, resultArray, true);
            var totalOptCount = pickerObj.CurrentLocalSuggestions.length + uniqueResultOpts.length;
            var displayOpts = [];

            if (uniqueResultOpts.length != 0) {
                displayOpts.push(SPClientAutoFill.BuildAutoFillSeparatorMenuItem());
                displayOpts = displayOpts.concat(uniqueResultOpts);
            }
            displayOpts = pickerObj.CurrentLocalSuggestions.concat(displayOpts);
            displayOpts = SPClientPeoplePicker.AddAutoFillMetaData(pickerObj, displayOpts, totalOptCount);
            pickerObj.ShowAutoFill(displayOpts);
        }
        else {
            pickerObj.ShowAutoFill(SPClientPeoplePicker.BuildAutoFillMenuItems(pickerObj, resultArray));
        }
    }, function() {
    ULSa9l:
        ;
        pickerObj.SetServerError();
    }, null);
}
function SPClientPeoplePicker_CallbackOnAutoFillClose(elmInputId, userObject) {
    var elmInput = document.getElementById(elmInputId);
    var pickerObj = SPClientPeoplePicker.PickerObjectFromSubElement(elmInput);

    if (pickerObj == null)
        return;
    if (userObject != null) {
        var strCacheKey = elmInput.value;

        if (pickerObj.UnresolvedUserElmIdToReplace != '')
            strCacheKey = pickerObj.ProcessedUserList[pickerObj.UnresolvedUserElmIdToReplace].DisplayName;
        if (pickerObj.UnresolvedUserElmIdToReplace == '')
            elmInput.value = '';
        userObject.IsResolved = true;
        pickerObj.AddProcessedUser(userObject, true);
        if (pickerObj.ShouldUsePPMRU() && SPClientPeoplePicker.IsUserEntity(userObject)) {
            pickerObj.PPMRU.SetItem(strCacheKey, userObject);
        }
    }
    pickerObj.UnresolvedUserElmIdToReplace = '';
    pickerObj.SetFocusOnEditorEnd();
    pickerObj.CurrentQueryStr = '';
    pickerObj.LatestSearchQueryStr = '';
    pickerObj.CurrentLocalSuggestions = [];
    pickerObj.CurrentLocalSuggestionsDict = {};
}
function SPClientPeoplePicker_OnClick(e) {
    if (e == null)
        e = window.event;
    var targetElm = GetEventSrcElement(e);

    if (targetElm == null)
        return false;
    if (targetElm.getAttribute('data-sp-peoplePickerProcessedUserDisplay') != null) {
        SPClientPeoplePickerProcessedUser.HandleProcessedUserClick(targetElm);
        CancelEvent(e);
    }
    else if (targetElm.getAttribute('data-sp-peoplePickerEditor') == null) {
        var objPicker = SPClientPeoplePicker.PickerObjectFromSubElement(targetElm);

        if (objPicker != null)
            objPicker.SetFocusOnEditorEnd();
    }
    return true;
}
function SPClientPeoplePicker_OnEditorBlur(e) {
    if (e == null)
        e = window.event;
    var elmInput = GetEventSrcElement(e);
    var objPicker = SPClientPeoplePicker.PickerObjectFromSubElement(elmInput);

    if (objPicker == null)
        return false;
    var topLevelElm = document.getElementById(objPicker.TopLevelElementId);

    if (topLevelElm == null)
        return false;
    RemoveCssClassFromElement(topLevelElm, "sp-peoplepicker-topLevelFocus");
    var helpElement = document.getElementById(objPicker.InitialHelpTextElementId);

    if (helpElement != null && objPicker.IsEmpty())
        helpElement.style.display = 'inline';
    return true;
}
function SPClientPeoplePicker_OnEditorFocus(e) {
    if (e == null)
        e = window.event;
    var elmInput = GetEventSrcElement(e);
    var objPicker = SPClientPeoplePicker.PickerObjectFromSubElement(elmInput);

    if (objPicker == null)
        return false;
    if (objPicker.AutoFillEnabled && objPicker.AutoFillControl == null) {
        var autoFillContext;

        try {
            autoFillContext = typeof SPClientAutoFill;
        }
        catch (e) {
            autoFillContext = "undefined";
        }
        EnsureScript("autofill.js", autoFillContext, function() {
        ULSa9l:
            ;
            objPicker.EnsureAutoFillControl();
        });
    }
    if (objPicker.CurrentWeb == null) {
        var ensureContext;

        try {
            ensureContext = typeof SP.ClientContext;
        }
        catch (e) {
            ensureContext = "undefined";
        }
        EnsureScript("SP.js", ensureContext, function() {
        ULSa9l:
            ;
            var clientContext = SP.ClientContext.get_current();

            objPicker.CurrentWeb = clientContext.get_web();
            clientContext.executeQueryAsync(function() {
            }, function() {
            });
        });
    }
    var topLevelElm = document.getElementById(objPicker.TopLevelElementId);

    if (topLevelElm != null)
        topLevelElm.className += " sp-peoplepicker-topLevelFocus";
    var waitImageElm = document.getElementById(objPicker.WaitImageId);

    if (topLevelElm != null && waitImageElm != null) {
        waitImageElm.style.top = "4px";
        if (fRightToLeft)
            waitImageElm.style.right = (topLevelElm.offsetWidth - 22).toString() + "px";
        else
            waitImageElm.style.left = (topLevelElm.offsetWidth - 22).toString() + "px";
    }
    var helpElement = document.getElementById(objPicker.InitialHelpTextElementId);

    if (helpElement != null)
        helpElement.style.display = 'none';
    return true;
}
function SPClientPeoplePicker_OnEditorKeyDown(e) {
    if (e == null)
        e = window.event;
    var keynum = GetEventKeyCode(e);
    var elmInput = GetEventSrcElement(e);
    var cancelKeyPress = false;
    var pickerObj = SPClientPeoplePicker.PickerObjectFromSubElement(elmInput);

    if (pickerObj == null)
        return !cancelKeyPress;
    var delimiterKey = keynum == 59 || keynum == 186;

    if (e.ctrlKey && keynum == 75) {
        cancelKeyPress = true;
        pickerObj.CloseAutoFill();
        pickerObj.AddUnresolvedUserFromEditor(false);
        pickerObj.ResolveAllUsers(null);
    }
    else if (keynum == 9 || delimiterKey && !e.shiftKey) {
        cancelKeyPress = keynum != 9;
        var backTab = keynum == 9 && e.shiftKey;

        if (cancelKeyPress || backTab || !pickerObj.IsAutoFillOpen()) {
            pickerObj.CloseAutoFill();
            pickerObj.AddUnresolvedUserFromEditor(true);
        }
    }
    else if (keynum == 27) {
        pickerObj.CloseAutoFill();
    }
    else if (keynum == 8) {
        var fIsCaretPositionSetToDeletePrevious = false;

        if (elmInput.createTextRange != null) {
            var range = (document.selection.createRange()).duplicate();

            if (range != null && range.text.length == 0) {
                var startIndex = -1;

                range.moveEnd('character', elmInput.value.length);
                if (range.text == '')
                    startIndex = elmInput.value.length;
                else
                    startIndex = elmInput.value.lastIndexOf(range.text);
                fIsCaretPositionSetToDeletePrevious = startIndex == 0 ? true : false;
            }
        }
        else {
            if (elmInput.selectionStart == 0 && elmInput.selectionEnd == elmInput.selectionStart)
                fIsCaretPositionSetToDeletePrevious = true;
        }
        if (fIsCaretPositionSetToDeletePrevious)
            pickerObj.DeleteProcessedUser(null);
    }
    else if (keynum == 13) {
        cancelKeyPress = true;
    }
    if (cancelKeyPress)
        CancelEvent(e);
    return !cancelKeyPress;
}
function SPClientPeoplePicker_OnEditorKeyUp(e) {
    if (e == null)
        e = window.event;
    var keynum = GetEventKeyCode(e);
    var elmInput = GetEventSrcElement(e);

    if (elmInput != null)
        elmInput.size = Math.max(elmInput.value.length, 1);
    var pickerObj = SPClientPeoplePicker.PickerObjectFromSubElement(elmInput);

    if (pickerObj != null) {
        pickerObj.OnControlValueChanged();
        pickerObj.DisplayLocalSuggestions();
    }
}
function SPClientPeoplePicker_OnEditorCopy(e) {
    if (e == null)
        e = window.event;
    var elmInput = GetEventSrcElement(e);
    var pickerObj = SPClientPeoplePicker.PickerObjectFromSubElement(elmInput);

    window.clipboardData.setData('Text', pickerObj.GetAllUserKeys());
}
function SPClientPeoplePicker_OnEditorPaste(e) {
    if (e == null)
        e = window.event;
    var elmInput = GetEventSrcElement(e);
    var pickerObj = SPClientPeoplePicker.PickerObjectFromSubElement(elmInput);

    if (pickerObj == null)
        return false;
    setTimeout(function() {
    ULSa9l:
        ;
        pickerObj.AddUserKeys(elmInput.value, false);
        elmInput.value = '';
    }, 0);
    return true;
}
function SPClientPeoplePicker_BodyOnClickCloseAutoFill(e) {
    if (e == null)
        e = window.event;
    var elmTarget = GetEventSrcElement(e);
    var inputElement = document.getElementById(SPClientAutoFill.CurrentOpenAutoFillMenuOwnerID);
    var curMenuPickerObj = SPClientPeoplePicker.PickerObjectFromSubElement(inputElement);

    if (elmTarget.className.indexOf('ms-imn') != -1)
        return;
    if (curMenuPickerObj != null) {
        var targetPickerObj = null;

        if (elmTarget.className.indexOf('sp-peoplepicker-') != -1)
            targetPickerObj = SPClientPeoplePicker.PickerObjectFromSubElement(elmTarget);
        var bClickedOpenPicker = targetPickerObj != null && curMenuPickerObj.TopLevelElementId == targetPickerObj.TopLevelElementId;
        var bMenuOpenFromEditor = curMenuPickerObj.UnresolvedUserElmIdToReplace == '';

        if (!bClickedOpenPicker || !bMenuOpenFromEditor)
            curMenuPickerObj.CloseAutoFill();
    }
}
function SPClientPeoplePickerProcessedUser(userInfo, elmProcessedUserId, fResolved) {
    this.UserContainerElementId = elmProcessedUserId;
    this.DisplayElementId = elmProcessedUserId + '_UserDisplay';
    this.PresenceElementId = elmProcessedUserId + '_PresenceContainer';
    this.UserInfo = userInfo;
    this.ResolvedUser = fResolved;
    if (userInfo.Description != null)
        this.ErrorDescription = userInfo.Description;
    if (userInfo[SPClientPeoplePicker.ValueName] != null)
        this.SID = userInfo[SPClientPeoplePicker.ValueName];
    if (userInfo[SPClientPeoplePicker.DisplayTextName] != null)
        this.DisplayName = userInfo[SPClientPeoplePicker.DisplayTextName];
    if (userInfo.EntityData != null && userInfo.EntityData[SPClientPeoplePicker.SIPAddressName] != null)
        this.SIPAddress = userInfo.EntityData[SPClientPeoplePicker.SIPAddressName];
    if (userInfo[SPClientPeoplePicker.SuggestionsName] != null && userInfo[SPClientPeoplePicker.SuggestionsName].length > 0)
        this.Suggestions = userInfo[SPClientPeoplePicker.SuggestionsName];
}
function SPClientPeoplePickerMRU() {
ULSa9l:
    ;
    this.isCacheAvailable = this.EnsurePPMRUData();
    this.MRUDataDict = this.InitMRUDictionary();
}
var g_SPClientPeoplePickerInstance;

function SPClientPeoplePickerMRUData() {
ULSa9l:
    ;
    this.dataArray = [];
    this.insertionIndex = 0;
    this.cacheVersion = SPClientPeoplePickerMRU.PPMRUVersion;
}
$_global_clientpeoplepicker();
