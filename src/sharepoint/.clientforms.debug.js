function $_global_clientforms() {
    SPClientForms = {};
    SPClientForms.ClientFormManager = function() {
        var _allFormManagers = {};

        this.RegisterClientForm = function(qualifier) {
            if (!_allFormManagers[qualifier])
                _allFormManagers[qualifier] = new SPClientForms.ClientForm(qualifier);
        };
        this.GetClientForm = function(qualifier) {
            return _allFormManagers[qualifier];
        };
    };
    SPClientForms.ClientFormManager.GetClientForm = function(qualifier) {
        if (typeof g_SPClientFormManagerInstance != 'undefined')
            return g_SPClientFormManagerInstance.GetClientForm(qualifier);
        return null;
    };
    SPClientForms.ClientFormManager.RegisterClientForm = function(qualifier) {
        if (typeof g_SPClientFormManagerInstance != 'undefined')
            g_SPClientFormManagerInstance.RegisterClientForm(qualifier);
    };
    SPClientForms.ClientFormManager.SubmitClientForm = function(qualifier) {
        var form = SPClientForms.ClientFormManager.GetClientForm(qualifier);

        return form != null && form.SubmitClientForm();
    };
    SPClientForms.ClientForm = function(qualifier) {
        var _that = this;
        var _invalidForm = false;
        var _qualifier = qualifier;
        var _ctx = window[qualifier + "FormCtx"];
        var _mode = _ctx != null ? _ctx.FormControlMode : SPClientTemplates.ClientControlMode.Invalid;
        var _placeHolderId = _qualifier + 'ClientFormPlaceholder';
        var _placeHolder = document.getElementById(_placeHolderId);
        var _formContainerId = _qualifier + 'ClientFormTopContainer';
        var _formContainer = document.getElementById(_formContainerId);

        if (_placeHolder == null || !SPClientTemplates.Utility.IsValidControlMode(_mode)) {
            _invalidForm = true;
            this.SubmitClientForm = function() {
            };
            this.RenderClientForm = function() {
            };
            this.NotifyControlEvent = function() {
            };
            return;
        }
        var submitBtn = null;

        if (_ctx.SubmitButtonID != null && _ctx.SubmitButtonID != '')
            submitBtn = document.getElementById(_ctx.SubmitButtonID);
        var _attachmentFieldName = '';
        var _validationErrorCount = 0;
        var _formEltPrefix = 'ClientFormPostBackValue_' + _ctx.ListAttributes.Id + '_';
        var _editFields = {
            'CurrentValue': {},
            'Validators': {},
            'ValidationErrors': {},
            'ValidationErrorDisplayed': {}
        };
        var _registeredCallbacks = {
            'Init': {},
            'Error': {},
            'Focus': {},
            'GetValue': {},
            'HasValueChanged': {}
        };

        this.RenderClientForm = function() {
            if (_invalidForm)
                return;
            var allListData = _ctx.ListData;
            var allFieldsSchema = _ctx.ListSchema;
            var _renderCtx = {};

            _renderCtx.ControlMode = _mode;
            _renderCtx.FormUniqueId = _qualifier;
            _renderCtx.FieldControlModes = _ctx.FieldControlModes;
            _renderCtx.BaseViewID = SPClientTemplates.Utility.ControlModeToString(_mode);
            _renderCtx.ListTemplateType = _ctx.ListAttributes.ListTemplateType.toString();
            _renderCtx.ListData = {
                'Items': [allListData]
            };
            _renderCtx.ListSchema = {
                'Field': []
            };
            for (var fNameIdx in allFieldsSchema)
                _renderCtx.ListSchema.Field.push(allFieldsSchema[fNameIdx]);
            _renderCtx.Templates = SPClientTemplates.TemplateManager.GetTemplates(_renderCtx);
            InitializeSPClientFormContext(_renderCtx);
            SPClientTemplates.Utility.GetPropertiesFromPageContextInfo(_renderCtx);
            if (_ctx.CSRCustomLayout) {
                SPClientRenderer.Render(_formContainer, _renderCtx);
            }
            else {
                _renderCtx.Templates.View = RenderViewTemplate;
                _renderCtx.Templates.Body = RenderGroupTemplateDefault;
                _renderCtx.Templates.Group = RenderItemTemplateDefault;
                _renderCtx.Templates.Item = RenderFieldTemplateDefault;
                _renderCtx.Templates.Header = (_renderCtx.Templates.Footer = '');
                for (var fldName in allFieldsSchema) {
                    _renderCtx.ListSchema = {
                        'Field': [allFieldsSchema[fldName]]
                    };
                    var pHolderId = _qualifier + _ctx.ListAttributes.Id + fldName;

                    SPClientRenderer.RenderReplace(document.getElementById(pHolderId), _renderCtx);
                }
            }
            var _initialFocusFieldName = '';

            for (var fName in allFieldsSchema) {
                var fSchema = allFieldsSchema[fName];

                if (fSchema.FieldType == 'Attachments')
                    _attachmentFieldName = fName;
                if (HasCallbackRegistered('Init', fName))
                    _registeredCallbacks.Init[fName]();
                if (_ctx.FieldControlModes[fName] == SPClientTemplates.ClientControlMode.EditForm || _ctx.FieldControlModes[fName] == SPClientTemplates.ClientControlMode.NewForm) {
                    if (typeof _editFields.ValidationErrors[fName] == 'undefined')
                        _editFields.ValidationErrors[fName] = false;
                    if (typeof _editFields.ValidationErrorDisplayed[fName] == 'undefined')
                        _editFields.ValidationErrorDisplayed[fName] = false;
                    if (_ctx.ValidationErrors != null && _ctx.ValidationErrors[fName] != null) {
                        if (_initialFocusFieldName == '' && HasCallbackRegistered('Focus', fName))
                            _initialFocusFieldName = fName;
                        DisplayControlErrorMessage(fName, new SPClientForms.ClientValidation.ValidationResult(true, _ctx.ValidationErrors[fName]));
                    }
                }
            }
            if (_initialFocusFieldName == '' && typeof _ctx.InitialFocus != "undefined")
                _initialFocusFieldName = _ctx.InitialFocus;
            SPClientForms_ClientFormInitFocusCallback = function() {
                EnsureScriptFunc('SP.js', 'SP.ClientContext', function() {
                    if (HasCallbackRegistered('Focus', _initialFocusFieldName))
                        _registeredCallbacks.Focus[_initialFocusFieldName]();
                });
            };
            _spBodyOnLoadFunctionNames.push('SPClientForms_ClientFormInitFocusCallback');
            if (_mode == SPClientTemplates.ClientControlMode.EditForm) {
                var itemVersion = _ctx.ListData["owshiddenversion"];

                if (!isNaN(Number(itemVersion)))
                    UpdateControlValue('owshiddenversion', String(itemVersion));
            }
        };
        function InitializeSPClientFormContext(rCtx) {
            rCtx.FormContext = new ClientFormContext();
            rCtx.FormContext.webAttributes = _ctx.WebAttributes;
            rCtx.FormContext.itemAttributes = _ctx.ItemAttributes;
            rCtx.FormContext.listAttributes = _ctx.ListAttributes;
            rCtx.FormContext.registerInitCallback = function(fldName, iCallback) {
                _that.NotifyControlEvent(SPClientForms.FormManagerEvents.Event_OnControlInitializedCallback, fldName, iCallback);
            };
            rCtx.FormContext.registerFocusCallback = function(fldName, fCallback) {
                _that.NotifyControlEvent(SPClientForms.FormManagerEvents.Event_OnControlFocusSetCallback, fldName, fCallback);
            };
            rCtx.FormContext.registerValidationErrorCallback = function(fldName, eCallback) {
                _that.NotifyControlEvent(SPClientForms.FormManagerEvents.Event_OnControlValidationError, fldName, eCallback);
            };
            rCtx.FormContext.registerGetValueCallback = function(fldName, vCallback) {
                _that.NotifyControlEvent(SPClientForms.FormManagerEvents.Event_GetControlValueCallback, fldName, vCallback);
            };
            rCtx.FormContext.updateControlValue = function(fldName, strValue) {
                _that.NotifyControlEvent(SPClientForms.FormManagerEvents.Event_OnControlValueChanged, fldName, strValue);
            };
            rCtx.FormContext.registerClientValidator = function(fldName, dValidator) {
                _that.NotifyControlEvent(SPClientForms.FormManagerEvents.Event_RegisterControlValidator, fldName, dValidator);
            };
            rCtx.FormContext.registerHasValueChangedCallback = function(fldName, eventArg) {
                _that.NotifyControlEvent(SPClientForms.FormManagerEvents.Event_GetHasValueChangedCallback, fldName, eventArg);
            };
        }
        function UpdateAndValidateControlValue(fName, fVal, bDisplayError) {
            UpdateControlValue(fName, fVal);
            ValidateControlValue(fName, fVal, bDisplayError);
        }
        function UpdateControlValue(fName, fVal) {
            SetFieldValueInForm(fName, fVal);
            _editFields.CurrentValue[fName] = fVal;
        }
        function ValidateControlValue(fName, fVal, bDisplayError) {
            var prevErrorState = typeof _editFields.ValidationErrors[fName] != 'undefined' ? _editFields.ValidationErrors[fName] : false;
            var validationResult = null;
            var newErrorState = prevErrorState;

            if (_editFields.Validators[fName] != null) {
                validationResult = _editFields.Validators[fName].ValidateField(fVal);
                newErrorState = validationResult.validationError;
            }
            else {
                newErrorState = false;
            }
            if (newErrorState != prevErrorState)
                _validationErrorCount = prevErrorState ? _validationErrorCount - 1 : _validationErrorCount + 1;
            _editFields.ValidationErrors[fName] = newErrorState;
            if (bDisplayError && (newErrorState || _editFields.ValidationErrorDisplayed[fName]))
                DisplayControlErrorMessage(fName, validationResult);
        }
        function ClearFieldValidationErrors() {
            var successResult = new SPClientForms.ClientValidation.ValidationResult();

            for (var fieldName in _editFields.ValidationErrors) {
                _editFields.ValidationErrors[fieldName] = false;
                _editFields.ValidationErrorDisplayed[fieldName] = false;
                DisplayControlErrorMessage(fieldName, successResult);
            }
        }
        function SetFieldValueInForm(fName, fValue) {
            var inputId = _formEltPrefix + fName;
            var curInputElt = document.getElementById(inputId);

            if (curInputElt != null) {
                curInputElt.value = fValue;
            }
            else {
                var input = document.createElement("INPUT");

                input.id = inputId;
                input.name = inputId;
                input.value = fValue;
                input.type = 'hidden';
                _placeHolder.appendChild(input);
            }
        }
        function DisplayControlErrorMessage(fldName, errorResult) {
            if (errorResult == null)
                return;
            if (HasCallbackRegistered('Error', fldName)) {
                _registeredCallbacks.Error[fldName](errorResult);
                _editFields.ValidationErrorDisplayed[fldName] = errorResult.validationError;
            }
        }
        function HasCallbackRegistered(callbackType, fldName) {
            if (callbackType == null || callbackType == '' || fldName == null || fldName == '')
                return false;
            return _registeredCallbacks[callbackType] != null && _registeredCallbacks[callbackType][fldName] != null && typeof _registeredCallbacks[callbackType][fldName] == "function";
        }
        this.NotifyControlEvent = function(eventName, fldName, eventArg) {
            if (_invalidForm || eventName == null || fldName == null || eventArg == null)
                return;
            switch (eventName) {
            case SPClientForms.FormManagerEvents.Event_OnControlInitializedCallback:
                if (typeof eventArg == "function")
                    _registeredCallbacks.Init[fldName] = eventArg;
                return;
            case SPClientForms.FormManagerEvents.Event_OnControlValidationError:
                if (typeof eventArg == "function")
                    _registeredCallbacks.Error[fldName] = eventArg;
                return;
            case SPClientForms.FormManagerEvents.Event_OnControlFocusSetCallback:
                if (typeof eventArg == "function")
                    _registeredCallbacks.Focus[fldName] = eventArg;
                return;
            case SPClientForms.FormManagerEvents.Event_GetControlValueCallback:
                if (typeof eventArg == "function")
                    _registeredCallbacks.GetValue[fldName] = eventArg;
                return;
            case SPClientForms.FormManagerEvents.Event_OnControlValueChanged:
                UpdateAndValidateControlValue(fldName, eventArg, false);
                return;
            case SPClientForms.FormManagerEvents.Event_RegisterControlValidator:
                if (_editFields.Validators[fldName] == null)
                    _editFields.Validators[fldName] = eventArg;
                else
                    _editFields.Validators[fldName].MergeValidators(eventArg);
                return;
            case SPClientForms.FormManagerEvents.Event_GetHasValueChangedCallback:
                if (typeof eventArg == "function")
                    _registeredCallbacks.HasValueChanged[fldName] = eventArg;
                return;
            }
        };
        this.SubmitClientForm = function() {
            if (_invalidForm || _mode == SPClientTemplates.ClientControlMode.DisplayForm)
                return false;
            var _fieldFocusValidationError = '';

            for (var getFld in _registeredCallbacks.GetValue) {
                UpdateAndValidateControlValue(getFld, _registeredCallbacks.GetValue[getFld](), true);
                if (_fieldFocusValidationError == '' && _editFields.ValidationErrors[getFld] && HasCallbackRegistered('Focus', getFld))
                    _fieldFocusValidationError = getFld;
            }
            if (_validationErrorCount > 0) {
                if (window.frameElement != null && typeof window.frameElement.autoSize == "function")
                    window.frameElement.autoSize();
                if (_fieldFocusValidationError != '')
                    _registeredCallbacks.Focus[_fieldFocusValidationError]();
                return true;
            }
            if (!_ctx.PostBackRequired && _attachmentFieldName != '') {
                if (HasCallbackRegistered('HasValueChanged', _attachmentFieldName) && _registeredCallbacks['HasValueChanged'][_attachmentFieldName]())
                    _ctx.PostBackRequired = true;
            }
            var context;

            if (!_ctx.PostBackRequired) {
                context = InitializeClientSubmitContext();
                for (var fldName in _editFields.CurrentValue) {
                    var formUpdateValue = new SP.ListItemFormUpdateValue();

                    formUpdateValue.set_fieldName(fldName);
                    formUpdateValue.set_fieldValue(_editFields.CurrentValue[fldName]);
                    context.allFormValues.push(formUpdateValue);
                }
                if (!_ctx.ItemAttributes.ExternalListItem) {
                    if (typeof _ctx.ItemContentTypeName != 'undefined' && _ctx.ItemContentTypeName != '') {
                        var cTypeValue = new SP.ListItemFormUpdateValue();

                        cTypeValue.set_fieldName('ContentType');
                        cTypeValue.set_fieldValue(_ctx.ItemContentTypeName);
                        context.allFormValues.push(cTypeValue);
                    }
                    if (typeof _ctx.ItemContentTypeId != 'undefined' && _ctx.ItemContentTypeId != '') {
                        var cTypeValueId = new SP.ListItemFormUpdateValue();

                        cTypeValueId.set_fieldName('ContentTypeId');
                        cTypeValueId.set_fieldValue(_ctx.ItemContentTypeId);
                        context.allFormValues.push(cTypeValueId);
                    }
                }
                context.updateScope = new SP.ExceptionHandlingScope(context.context);
                context.updateScopeDispose = context.updateScope.startScope();
                context.allFormValues = context.item.validateUpdateListItem(context.allFormValues, _ctx.UploadMode);
                context.updateScopeDispose.dispose();
                if (_ctx.ListAttributes.BaseType == 1) {
                    context.itemPropScope = new SP.ExceptionHandlingScope(context.context);
                    context.itemPropScopeDispose = context.itemPropScope.startScope();
                    var objType = _ctx.ItemAttributes.FsObjType;

                    if (objType == SPClientTemplates.FileSystemObjectType.File)
                        context.fileObj = context.item.get_file();
                    else if (objType == SPClientTemplates.FileSystemObjectType.Folder)
                        context.fileObj = context.item.get_folder();
                    if (context.fileObj != null)
                        context.fileObj.retrieve("ServerRelativeUrl");
                    context.itemPropScopeDispose.dispose();
                }
                context.context.executeQueryAsync();
            }
            else {
                SetFieldValueInForm('SubmitClientForm', 'true');
            }
            if (submitBtn != null)
                submitBtn.disabled = true;
            return !_ctx.PostBackRequired;
            function InitializeClientSubmitContext() {
                var result, item;
                var initContext = SPClientTemplates.Utility.InitContext(_ctx.WebAttributes.WebUrl);

                initContext.add_requestSucceeded(function(source, eventArgs) {
                    OnRequestSucceeded(source, eventArgs);
                });
                initContext.add_requestFailed(function(source, eventArgs) {
                    OnRequestFailed(source, eventArgs);
                });
                var formList = ((initContext.get_web()).get_lists()).getById(_ctx.ListAttributes.Id);

                if (_mode == SPClientTemplates.ClientControlMode.NewForm) {
                    var params = new SP.ListItemCreationInformation();

                    params.set_folderUrl(_ctx.NewItemRootFolder);
                    params.set_underlyingObjectType(_ctx.ItemAttributes.FsObjType);
                    item = formList.addItem(params);
                }
                else
                    item = formList.getItemById(_ctx.ItemAttributes.Id);
                return {
                    context: initContext,
                    list: formList,
                    item: item,
                    fileObj: null,
                    allFormValues: [],
                    itemPropScope: null,
                    itemPropScopeDispose: null,
                    updateScope: null,
                    updateScopeDispose: null
                };
            }
            function OnRequestSucceeded(source, eventArgs) {
                if (submitBtn != null)
                    submitBtn.disabled = false;
                var focusFieldName = '';
                var errorFound = false;

                for (var idx in context.allFormValues) {
                    var fieldUpdate = context.allFormValues[idx];
                    var fieldName = fieldUpdate.get_fieldName();

                    if (fieldUpdate.get_hasException()) {
                        errorFound = true;
                        var errorFldMsg = fieldUpdate.get_errorMessage();
                        var errorFldRes = new SPClientForms.ClientValidation.ValidationResult(true, errorFldMsg);

                        if (focusFieldName == '' && HasCallbackRegistered('Focus', fieldName))
                            focusFieldName = fieldName;
                        _validationErrorCount++;
                        _editFields.ValidationErrors[fieldName] = true;
                        _editFields.ValidationErrorDisplayed[fieldName] = true;
                        DisplayControlErrorMessage(fieldName, errorFldRes);
                    }
                    else {
                        _editFields.ValidationErrors[fieldName] = false;
                        _editFields.ValidationErrorDisplayed[fieldName] = false;
                        DisplayControlErrorMessage(fieldName, new SPClientForms.ClientValidation.ValidationResult());
                    }
                }
                if (context.updateScope != null && context.updateScope.get_hasException()) {
                    ClearFieldValidationErrors();
                    errorFound = true;
                    var errorCode = context.updateScope.get_serverErrorCode();

                    if (errorCode == -2130575257) {
                        ShowDuplicateFileDialog();
                    }
                    else {
                        var errorItemMsg = context.updateScope.get_errorMessage();
                        var errorItemRes = new SPClientForms.ClientValidation.ValidationResult(true, errorItemMsg);

                        SPFormControl_AppendValidationErrorMessage(_placeHolderId, errorItemRes);
                    }
                }
                if (!errorFound) {
                    setTimeout(CompleteClientRequest, 0);
                }
                else {
                    if (window.frameElement != null && typeof window.frameElement.autoSize == "function")
                        window.frameElement.autoSize();
                    if (focusFieldName != '' && HasCallbackRegistered('Focus', focusFieldName))
                        _registeredCallbacks.Focus[focusFieldName]();
                }
            }
            function OnRequestFailed(source, eventArgs) {
                if (submitBtn != null)
                    submitBtn.disabled = false;
                var failMsg = Strings.STS.L_SPClientFormSubmitGeneralError;
                var failRes = new SPClientForms.ClientValidation.ValidationResult(true, failMsg);

                SPFormControl_AppendValidationErrorMessage(_placeHolderId, failRes);
                if (window.frameElement != null && typeof window.frameElement.autoSize == "function")
                    window.frameElement.autoSize();
            }
            function CompleteClientRequest() {
                var redirectInfo = _ctx.RedirectInfo;
                var itemUrlFound = context.fileObj != null && context.itemPropScope != null && !context.itemPropScope.get_hasException();

                if (redirectInfo != null && redirectInfo.popUI) {
                    var retVal = {};

                    if (itemUrlFound) {
                        var isFolder = _ctx.ItemAttributes.FsObjType == SPClientTemplates.FileSystemObjectType.Folder ? 'true' : 'false';

                        retVal = {
                            'isFolder': isFolder,
                            'newFileUrl': context.fileObj.get_serverRelativeUrl()
                        };
                    }
                    if (window.frameElement != null && typeof window.frameElement.commitPopup == "function") {
                        window.frameElement.commitPopup(retVal);
                        return;
                    }
                }
                var url = redirectInfo != null ? redirectInfo.redirectUrl : '';

                if (_ctx.ListAttributes.BaseType == 1) {
                    if (itemUrlFound && context.fileObj.get_serverRelativeUrl() != '')
                        url = context.fileObj.get_serverRelativeUrl();
                    else if (redirectInfo != null && redirectInfo.listRootFolderUrl != '')
                        url = redirectInfo.listRootFolderUrl;
                }
                var source = GetUrlKeyValue("Source");

                source = source == null || source == '' ? GetUrlKeyValue("NextPage") : source;
                source = source == null || source == '' ? GetUrlKeyValue("NextUsing") : source;
                url = source != null && source != '' ? source : url;
                STSNavigate(url);
            }
            function ShowDuplicateFileDialog() {
                var rgErrHtml = [];

                rgErrHtml.push('<span class="ms-formvalidation ms-csrformvalidation">');
                rgErrHtml.push('<span role="alert">');
                rgErrHtml.push(STSHtmlEncode(Strings.STS.L_SPClientFormSubmitDuplicateFile));
                rgErrHtml.push('<br/></span>');
                rgErrHtml.push('</span>');
                rgErrHtml.push('<div class="ms-core-form-bottomButtonBox" id="dlgDivButton">');
                rgErrHtml.push('<button id="ms-OKBtnDismissDlg" class="ms-ButtonHeightWidth" onclick="DismissErrDlg(this)">');
                rgErrHtml.push(STSHtmlEncode(SP.Res.okButtonCaption));
                rgErrHtml.push('</button></div>');
                var errorHtml = rgErrHtml.join('');
                var divElem = document.createElement("DIV");

                divElem.className = "s4-dlg-err";
                divElem.innerHTML = errorHtml;
                var dopt = {
                    html: divElem,
                    title: Strings.STS.L_ErrorDialog_Title,
                    dialogReturnValueCallback: function() {
                        STSNavigate(window.location.href);
                    }
                };
                var dlg = new SP.UI.ModalDialog.showModalDialog(dopt);
                var okButton = document.getElementById('ms-OKBtnDismissDlg');

                if (okButton != null)
                    okButton.focus();
            }
        };
    };
    SPClientForms_ClientFormInitFocusCallback = null;
    (function() {
        function _registerFieldTemplates() {
            var spfieldCtx = {
                Templates: {
                    Fields: {
                        'Text': {
                            'View': RenderFieldValueDefault,
                            'DisplayForm': SPField_FormDisplay_Default,
                            'EditForm': SPFieldText_Edit,
                            'NewForm': SPFieldText_Edit
                        },
                        'Number': {
                            'View': RenderFieldValueDefault,
                            'DisplayForm': SPField_FormDisplay_Default,
                            'EditForm': SPFieldNumber_Edit,
                            'NewForm': SPFieldNumber_Edit
                        },
                        'Integer': {
                            'View': RenderFieldValueDefault,
                            'DisplayForm': SPField_FormDisplay_Default,
                            'EditForm': SPFieldNumber_Edit,
                            'NewForm': SPFieldNumber_Edit
                        },
                        'Boolean': {
                            'View': RenderFieldValueDefault,
                            'DisplayForm': SPField_FormDisplay_DefaultNoEncode,
                            'EditForm': SPFieldBoolean_Edit,
                            'NewForm': SPFieldBoolean_Edit
                        },
                        'Note': {
                            'View': RenderFieldValueDefault,
                            'DisplayForm': SPFieldNote_Display,
                            'EditForm': SPFieldNote_Edit,
                            'NewForm': SPFieldNote_Edit
                        },
                        'Currency': {
                            'View': RenderFieldValueDefault,
                            'DisplayForm': SPField_FormDisplay_Default,
                            'EditForm': SPFieldNumber_Edit,
                            'NewForm': SPFieldNumber_Edit
                        },
                        'File': {
                            'View': RenderFieldValueDefault,
                            'DisplayForm': SPFieldFile_Display,
                            'EditForm': SPFieldFile_Edit,
                            'NewForm': SPFieldFile_Edit
                        },
                        'Calculated': {
                            'View': RenderFieldValueDefault,
                            'DisplayForm': SPField_FormDisplay_Default,
                            'EditForm': SPField_FormDisplay_Empty,
                            'NewForm': SPField_FormDisplay_Empty
                        },
                        'Choice': {
                            'View': RenderFieldValueDefault,
                            'DisplayForm': SPField_FormDisplay_Default,
                            'EditForm': SPFieldChoice_Edit,
                            'NewForm': SPFieldChoice_Edit
                        },
                        'MultiChoice': {
                            'View': RenderFieldValueDefault,
                            'DisplayForm': SPField_FormDisplay_Default,
                            'EditForm': SPFieldMultiChoice_Edit,
                            'NewForm': SPFieldMultiChoice_Edit
                        },
                        'Lookup': {
                            'View': RenderFieldValueDefault,
                            'DisplayForm': SPFieldLookup_Display,
                            'EditForm': SPFieldLookup_Edit,
                            'NewForm': SPFieldLookup_Edit
                        },
                        'LookupMulti': {
                            'View': RenderFieldValueDefault,
                            'DisplayForm': SPFieldLookup_Display,
                            'EditForm': SPFieldLookup_Edit,
                            'NewForm': SPFieldLookup_Edit
                        },
                        'Computed': {
                            'View': RenderFieldValueDefault,
                            'DisplayForm': SPField_FormDisplay_Default,
                            'EditForm': SPField_FormDisplay_Default,
                            'NewForm': SPField_FormDisplay_Default
                        },
                        'URL': {
                            'View': RenderFieldValueDefault,
                            'DisplayForm': SPFieldUrl_Display,
                            'EditForm': SPFieldUrl_Edit,
                            'NewForm': SPFieldUrl_Edit
                        },
                        'User': {
                            'View': RenderFieldValueDefault,
                            'DisplayForm': SPFieldUser_Display,
                            'EditForm': SPClientPeoplePickerCSRTemplate,
                            'NewForm': SPClientPeoplePickerCSRTemplate
                        },
                        'UserMulti': {
                            'View': RenderFieldValueDefault,
                            'DisplayForm': SPFieldUserMulti_Display,
                            'EditForm': SPClientPeoplePickerCSRTemplate,
                            'NewForm': SPClientPeoplePickerCSRTemplate
                        },
                        'DateTime': {
                            'View': RenderFieldValueDefault,
                            'DisplayForm': SPFieldDateTime_Display,
                            'EditForm': SPFieldDateTime_Edit,
                            'NewForm': SPFieldDateTime_Edit
                        },
                        'Attachments': {
                            'View': RenderFieldValueDefault,
                            'DisplayForm': SPFieldAttachments_Default,
                            'EditForm': SPFieldAttachments_Default,
                            'NewForm': SPFieldAttachments_Default
                        }
                    }
                }
            };

            SPClientTemplates.TemplateManager._RegisterDefaultTemplates(spfieldCtx);
        }
        ExecuteOrDelayUntilScriptLoaded(_registerFieldTemplates, 'clienttemplates.js');
    })();
    SPClientForms.FormManagerEvents = {
        Event_OnControlValueChanged: 1,
        Event_OnControlInitializedCallback: 2,
        Event_OnControlFocusSetCallback: 3,
        Event_GetControlValueCallback: 4,
        Event_OnControlValidationError: 5,
        Event_RegisterControlValidator: 6,
        Event_GetHasValueChangedCallback: 7
    };
    g_SPFieldUser_ImnIdx = 0;
    ClientFormContext_InitializePrototype();
    SPClientForms.ClientValidation = function() {
    };
    SPClientForms.ClientValidation.ValidatorSet = function() {
        this._registeredValidators = [];
    };
    SPClientForms.ClientValidation.ValidatorSet.prototype.RegisterValidator = function(validator) {
        this._registeredValidators.push(validator);
    };
    SPClientForms.ClientValidation.ValidatorSet.prototype.ValidateField = function(fldValue) {
        for (var validatorIdx in this._registeredValidators) {
            var result = this._registeredValidators[validatorIdx].Validate(fldValue);

            if (result.validationError)
                return result;
        }
        return new SPClientForms.ClientValidation.ValidationResult();
    };
    SPClientForms.ClientValidation.ValidatorSet.prototype.MergeValidators = function(newValidators) {
        if (typeof newValidators._registeredValidators != "undefined")
            this._registeredValidators = this._registeredValidators.concat(newValidators._registeredValidators);
    };
    SPClientForms.ClientValidation.RequiredValidator = function() {
    };
    SPClientForms.ClientValidation.RequiredValidator.prototype.Validate = function(value) {
        value = SPClientTemplates.Utility.Trim(value);
        var hasError = value === '';
        var errorMsg = hasError ? Strings.STS.L_SPClientRequiredValidatorError : '';

        return new SPClientForms.ClientValidation.ValidationResult(hasError, errorMsg);
    };
    SPClientForms.ClientValidation.RequiredFileValidator = function() {
    };
    SPClientForms.ClientValidation.RequiredFileValidator.prototype.Validate = function(value) {
        value = SPClientTemplates.Utility.Trim(value);
        var hasError = value.length != 0 ? value.lastIndexOf('.') == 0 : true;
        var errorMsg = hasError ? Strings.STS.L_SPClientRequiredValidatorError : '';

        return new SPClientForms.ClientValidation.ValidationResult(hasError, errorMsg);
    };
    SPClientForms.ClientValidation.RequiredUrlValidator = function() {
    };
    SPClientForms.ClientValidation.RequiredUrlValidator.prototype.Validate = function(value) {
        var urlValue = '';
        var delimitStr = ", ";
        var delimitIdx = value.indexOf(delimitStr);

        if (delimitIdx != -1)
            urlValue = SPClientTemplates.Utility.Trim(value.substr(0, delimitIdx));
        var hasError = urlValue === '' || urlValue.toLowerCase() === 'http://';
        var errorMsg = hasError ? Strings.STS.L_SPClientRequiredValidatorError : '';

        return new SPClientForms.ClientValidation.ValidationResult(hasError, errorMsg);
    };
    SPClientForms.ClientValidation.RequiredRichTextValidator = function() {
    };
    SPClientForms.ClientValidation.RequiredRichTextValidator.prototype.Validate = function(value) {
        value = SPClientTemplates.Utility.Trim(value);
        var hasError = value === '';
        var rteLength = value.length;

        if (rteLength >= 11 && (value.substr(0, 5)).toLowerCase() == '<div>' && (value.substr(rteLength - 6, 6)).toLowerCase() == '</div>') {
            var inner = SPClientTemplates.Utility.Trim(value.substring(5, rteLength - 6));

            hasError = inner === '';
        }
        var errorMsg = hasError ? Strings.STS.L_SPClientRequiredValidatorError : '';

        return new SPClientForms.ClientValidation.ValidationResult(hasError, errorMsg);
    };
    SPClientForms.ClientValidation.MaxLengthUrlValidator = function(maxLength) {
        this._maxLength = maxLength;
    };
    SPClientForms.ClientValidation.MaxLengthUrlValidator.prototype.Validate = function(value) {
        var urlValue = '';
        var delimitStr = ", ";
        var delimitIdx = value.indexOf(delimitStr);

        if (delimitIdx != -1)
            urlValue = SPClientTemplates.Utility.Trim(value.substr(0, delimitIdx));
        var hasError = urlValue.length > this._maxLength;
        var errorMsg = hasError ? StBuildParam(Strings.STS.L_SPClientMaxLengthFieldError, this._maxLength) : '';

        return new SPClientForms.ClientValidation.ValidationResult(hasError, errorMsg);
    };
    SPClientForms.ClientValidation.ValidationResult = function(hasError, errorMsg) {
        if (typeof errorMsg != 'undefined')
            this.errorMessage = errorMsg;
        if (typeof hasError != 'undefined')
            this.validationError = hasError;
    };
    SPClientFormsClientValidationValidationResult_InitializePrototype();
    if (typeof g_SPClientFormManagerInstance == 'undefined')
        var g_SPClientFormManagerInstance = new SPClientForms.ClientFormManager();
    if (typeof Sys != 'undefined' && Sys != null && Sys.Application != null)
        Sys.Application.notifyScriptLoaded();
    if (typeof NotifyScriptLoadedAndExecuteWaitingJobs == 'function')
        NotifyScriptLoadedAndExecuteWaitingJobs("clientforms.js");
}
var SPClientForms;
var SPClientForms_ClientFormInitFocusCallback;

function SPField_FormDisplay_Default(rCtx) {
    return SPField_FormDisplay_Core(rCtx, true);
}
function SPField_FormDisplay_DefaultNoEncode(rCtx) {
    return SPField_FormDisplay_Core(rCtx, false);
}
function SPField_FormDisplay_Core(rCtx, bEncode) {
    if (rCtx == null)
        return '';
    var _myData = SPClientTemplates.Utility.GetFormContextForCurrentField(rCtx);

    if (_myData == null || _myData.fieldSchema == null || _myData.fieldValue == null)
        return '';
    var displayValue = _myData.fieldValue;

    if (bEncode)
        displayValue = STSHtmlEncode(displayValue);
    var fieldDirection = _myData.fieldSchema.Direction;

    if (fieldDirection != null && fieldDirection.toLowerCase() != 'none')
        return '<span dir="' + STSHtmlEncode(fieldDirection) + '">' + displayValue + '</span>';
    else
        return displayValue;
}
function SPField_FormDisplay_Empty(rCtx) {
    return '';
}
function SPFieldText_Edit(rCtx) {
    if (rCtx == null)
        return '';
    var _myData = SPClientTemplates.Utility.GetFormContextForCurrentField(rCtx);

    if (_myData == null || _myData.fieldSchema == null)
        return '';
    var _inputElt;
    var _value = _myData.fieldValue != null ? _myData.fieldValue : '';
    var _inputId = _myData.fieldName + '_' + _myData.fieldSchema.Id + '_$TextField';

    if (_myData.fieldSchema.Required) {
        var validators = new SPClientForms.ClientValidation.ValidatorSet();

        validators.RegisterValidator(new SPClientForms.ClientValidation.RequiredValidator());
        _myData.registerClientValidator(_myData.fieldName, validators);
    }
    _myData.registerInitCallback(_myData.fieldName, InitControl);
    _myData.registerFocusCallback(_myData.fieldName, function() {
        if (_inputElt != null) {
            _inputElt.focus();
            if (browseris.ie8standard) {
                var range = _inputElt.createTextRange();

                range.collapse(true);
                range.moveStart('character', 0);
                range.moveEnd('character', 0);
                range.select();
            }
        }
    });
    _myData.registerValidationErrorCallback(_myData.fieldName, function(errorResult) {
        SPFormControl_AppendValidationErrorMessage(_inputId, errorResult);
    });
    _myData.registerGetValueCallback(_myData.fieldName, function() {
        return _inputElt == null ? '' : _inputElt.value;
    });
    _myData.updateControlValue(_myData.fieldName, _value);
    var result = '<span dir="' + STSHtmlEncode(_myData.fieldSchema.Direction) + '">';

    result += '<input type="text" value="' + STSHtmlEncode(_value) + '" maxlength="' + STSHtmlEncode(_myData.fieldSchema.MaxLength) + '" ';
    result += 'id="' + STSHtmlEncode(_inputId) + '" title="' + STSHtmlEncode(_myData.fieldSchema.Title);
    result += '" class="ms-long ms-spellcheck-true" />';
    result += '<br /></span>';
    return result;
    function InitControl() {
        _inputElt = document.getElementById(_inputId);
        if (_inputElt != null)
            AddEvtHandler(_inputElt, "onchange", OnValueChanged);
    }
    function OnValueChanged() {
        if (_inputElt != null)
            _myData.updateControlValue(_myData.fieldName, _inputElt.value);
    }
}
function SPFieldNumber_Edit(rCtx) {
    if (rCtx == null)
        return '';
    var _myData = SPClientTemplates.Utility.GetFormContextForCurrentField(rCtx);

    if (_myData == null || _myData.fieldSchema == null)
        return '';
    var _inputElt;
    var fldTypeStr = '_$' + _myData.fieldSchema.FieldType + 'Field';
    var _inputId = _myData.fieldName + '_' + _myData.fieldSchema.Id + fldTypeStr;
    var _value = _myData.fieldValue != null ? _myData.fieldValue : '';
    var _displayPercentSign = _myData.fieldSchema.ShowAsPercentage ? '%' : '';
    var _styleStr = _myData.fieldSchema.IMEMode == '' ? '' : 'style="ime-mode : ' + STSHtmlEncode(_myData.fieldSchema.IMEMode) + '" ';
    var validators = new SPClientForms.ClientValidation.ValidatorSet();

    if (_myData.fieldSchema.Required)
        validators.RegisterValidator(new SPClientForms.ClientValidation.RequiredValidator());
    _myData.registerClientValidator(_myData.fieldName, validators);
    _myData.registerInitCallback(_myData.fieldName, InitControl);
    _myData.registerFocusCallback(_myData.fieldName, function() {
        if (_inputElt != null)
            _inputElt.focus();
    });
    _myData.registerValidationErrorCallback(_myData.fieldName, function(errorResult) {
        SPFormControl_AppendValidationErrorMessage(_inputId, errorResult);
    });
    _myData.registerGetValueCallback(_myData.fieldName, function() {
        return _inputElt == null ? '' : _inputElt.value;
    });
    _myData.updateControlValue(_myData.fieldName, _value);
    var result = '<span dir="' + STSHtmlEncode(_myData.fieldSchema.Direction) + '">';

    result += '<input type="text" value="' + STSHtmlEncode(_value) + '" id="' + STSHtmlEncode(_inputId);
    result += '" title="' + STSHtmlEncode(_myData.fieldSchema.Title) + '" ';
    result += 'size="11" class="ms-input" ' + _styleStr + '/>' + STSHtmlEncode(_displayPercentSign);
    result += '<br /></span>';
    return result;
    function InitControl() {
        _inputElt = document.getElementById(_inputId);
        if (_inputElt != null)
            AddEvtHandler(_inputElt, "onchange", OnValueChanged);
    }
    function OnValueChanged() {
        if (_inputElt != null)
            _myData.updateControlValue(_myData.fieldName, _inputElt.value);
    }
}
function SPFieldBoolean_Edit(rCtx) {
    if (rCtx == null)
        return '';
    var _myData = SPClientTemplates.Utility.GetFormContextForCurrentField(rCtx);

    if (_myData == null || _myData.fieldSchema == null)
        return '';
    var _inputElt;
    var _inputId = _myData.fieldName + '_' + _myData.fieldSchema.Id + '_$BooleanField';
    var _value = _myData.fieldValue != null ? _myData.fieldValue : '0';
    var _checked = Boolean(Number(_value)) ? 'checked="checked"' : '';

    _myData.registerInitCallback(_myData.fieldName, InitControl);
    _myData.registerGetValueCallback(_myData.fieldName, GetCheckBoxValue);
    _myData.registerFocusCallback(_myData.fieldName, function() {
        if (_inputElt != null)
            _inputElt.focus();
    });
    _myData.registerValidationErrorCallback(_myData.fieldName, function(errorResult) {
        SPFormControl_AppendValidationErrorMessage(_inputId, errorResult);
    });
    _myData.updateControlValue(_myData.fieldName, Boolean(_checked) ? "1" : "0");
    var result = '<span dir="' + STSHtmlEncode(_myData.fieldSchema.Direction) + '">';

    result += '<input type="checkbox" id="' + STSHtmlEncode(_inputId);
    result += '" title="' + STSHtmlEncode(_myData.fieldSchema.Title) + '" ' + _checked + '/>';
    result += '<br /></span>';
    return result;
    function InitControl() {
        _inputElt = document.getElementById(_inputId);
        if (_inputElt != null)
            AddEvtHandler(_inputElt, "onchange", GetCheckBoxValue);
    }
    function OnValueChanged() {
        if (_inputElt != null)
            _myData.updateControlValue(_myData.fieldName, GetCheckBoxValue());
    }
    function GetCheckBoxValue() {
        return _inputElt != null && Boolean(_inputElt.checked) ? "1" : "0";
    }
}
function SPFieldNote_Display(rCtx) {
    return rCtx.CurrentFieldValue == null ? '' : rCtx.CurrentFieldValue;
}
function SPFieldNote_Edit(rCtx) {
    if (rCtx == null)
        return '';
    var _myData = SPClientTemplates.Utility.GetFormContextForCurrentField(rCtx);

    if (_myData == null || _myData.fieldSchema == null)
        return '';
    var _textAreaElt, _textAreaHiddenSave;
    var _textAreaId = _myData.fieldName + '_' + _myData.fieldSchema.Id + '_$TextField';
    var _value = '';

    if (!_myData.fieldSchema.AppendOnly)
        _value = rCtx.CurrentFieldValue == null ? '' : rCtx.CurrentFieldValue;
    var _textAreaTopDivId = _textAreaId + '_topDiv';
    var _rteHeight = _myData.fieldSchema.NumberOfLines * 14;
    var _rteFlags = _myData.fieldSchema.InitialFocus ? 2 : 0;
    var _textAreaRte, _textAreaHiddenInput;
    var _textAreaRteId = _textAreaId + '_inplacerte';
    var _textAreaRteLabelId = _textAreaRteId + '_label';
    var _textAreaHiddenInputId = _textAreaId + '_spSave';
    var _fldDirection = _myData.fieldSchema.Direction;
    var _listDirection = _myData.listAttributes.Direction;
    var _direction = _fldDirection != "none" && _fldDirection != '' ? _fldDirection : _listDirection != "none" && _listDirection != '' ? _listDirection : "";
    var _validBrowser = browseris.ie5up && (browseris.win32 || browseris.win64bit);
    var _useUpLevelRte = _validBrowser && !IsAccessibilityFeatureEnabled();
    var _encodedDir = STSHtmlEncode(_myData.fieldSchema.Direction);
    var _textDir = _direction == '' ? '' : ' dir="' + STSHtmlEncode(_direction) + '"';
    var _richFull = _myData.fieldSchema.RichTextMode == SPClientTemplates.RichTextMode.FullHtml;
    var _richCompatible = _myData.fieldSchema.RichTextMode == SPClientTemplates.RichTextMode.Compatible;

    if (_myData.fieldSchema.Required) {
        var validators = new SPClientForms.ClientValidation.ValidatorSet();

        validators.RegisterValidator(new SPClientForms.ClientValidation.RequiredRichTextValidator());
        _myData.registerClientValidator(_myData.fieldName, validators);
    }
    if (!_myData.fieldSchema.RichText) {
        CreateSPFieldNote_Plain();
        return BuildPlainHtml();
    }
    else if (_richCompatible) {
        CreateSPFieldNote_RichText();
        return BuildRichTextHtml();
    }
    else if (_richFull) {
        CreateSPFieldNote_EnhancedRichText();
        return BuildEnhancedRichTextHtml();
    }
    else
        return '';
    function CreateSPFieldNote_Plain() {
        _myData.registerInitCallback(_myData.fieldName, InitTextAreaControl);
        _myData.registerFocusCallback(_myData.fieldName, function() {
            if (_textAreaElt != null)
                _textAreaElt.focus();
        });
        _myData.registerValidationErrorCallback(_myData.fieldName, function(errorResult) {
            SPFormControl_AppendValidationErrorMessage(_textAreaId, errorResult);
        });
        _myData.registerGetValueCallback(_myData.fieldName, GetTextAreaValue);
        _myData.updateControlValue(_myData.fieldName, _value);
    }
    function InitTextAreaControl() {
        _textAreaElt = document.getElementById(_textAreaId);
        if (_textAreaElt != null)
            AddEvtHandler(_textAreaElt, "onchange", OnTextAreaValueChanged);
    }
    function GetTextAreaValue() {
        return _textAreaElt == null ? '' : _textAreaElt.value;
    }
    function OnTextAreaValueChanged() {
        if (_textAreaElt != null)
            _myData.updateControlValue(_myData.fieldName, _textAreaElt.value);
    }
    function BuildPlainHtml() {
        var result = '<span dir="' + _encodedDir + '">';

        result += '<textarea rows="' + STSHtmlEncode(_myData.fieldSchema.NumberOfLines) + '" cols="20" id="';
        result += STSHtmlEncode(_textAreaId) + '" title="' + STSHtmlEncode(_myData.fieldSchema.Title);
        result += '" class="ms-long"' + _textDir + '>' + STSHtmlEncode(_value) + '</textarea>';
        result += '<br /></span>';
        return result;
    }
    function CreateSPFieldNote_RichText() {
        _myData.registerInitCallback(_myData.fieldName, InitRichTextControl);
        _myData.registerFocusCallback(_myData.fieldName, OnRichTextFocusSet);
        _myData.registerValidationErrorCallback(_myData.fieldName, function(errorResult) {
            SPFormControl_AppendValidationErrorMessage(_textAreaId, errorResult);
        });
        _myData.registerGetValueCallback(_myData.fieldName, GetRichTextControlValue);
        _myData.updateControlValue(_myData.fieldName, _value);
    }
    function InitRichTextControl() {
        _textAreaElt = document.getElementById(_textAreaId);
        _textAreaHiddenSave = document.getElementById(_textAreaId + '_spSave');
        if (_useUpLevelRte) {
            RTE_ConvertTextAreaToRichEdit(_textAreaId, _myData.fieldSchema.RestrictedMode, _myData.fieldSchema.AllowHyperlink, _direction, _myData.webAttributes.LCID, null, true, null, null, null, SPClientTemplates.Utility.RichTextModeToString(_myData.fieldSchema.RichTextMode), _myData.webAttributes.WebUrl, null, null, null, null, undefined, undefined, undefined, undefined, undefined, undefined, undefined);
            if (_value == '')
                _value = '<DIV></DIV>';
            if (g_oExtendedRichTextSupport != null && g_oExtendedRichTextSupport.editors != null && g_oExtendedRichTextSupport.editors[_textAreaId] != null) {
                var editor = g_oExtendedRichTextSupport.editors[_textAreaId];

                if (editor != null && editor.overrides != null)
                    editor.overrides.SaveSelection = OnIFrameValueChanged;
            }
        }
        else {
            var helpKey = _richCompatible ? 'nsrichtext' : 'nsfullrichtext';
            var helpMsg = _richCompatible ? STSHtmlEncode(Strings.STS.L_RichTextHelpLink) : STSHtmlEncode(Strings.STS.L_FullRichTextHelpLink);
            var firstBr = document.createElement("BR");
            var secondBr = document.createElement("BR");
            var helpSpan = document.createElement("SPAN");

            helpSpan.className = "ms-formdescription";
            if (_textAreaElt != null) {
                var parSpan = _textAreaElt.parentNode;

                parSpan = parSpan != null ? parSpan.parentNode : null;
                if (parSpan != null) {
                    parSpan.appendChild(firstBr);
                    parSpan.appendChild(helpSpan);
                    helpSpan.innerHTML = "<a href=\"javascript:HelpWindowKey('" + helpKey + "')\">" + helpMsg + "</a>";
                    parSpan.appendChild(secondBr);
                }
                AddEvtHandler(_textAreaElt, "onchange", OnTextAreaValueChanged);
            }
        }
    }
    function OnRichTextFocusSet() {
        if (_useUpLevelRte)
            RTE_GiveEditorFirstFocus(_textAreaId);
        else if (_textAreaElt != null)
            _textAreaElt.focus();
    }
    function GetRichTextControlValue() {
        if (_useUpLevelRte) {
            RTE_TransferIFrameContentsToTextArea(_textAreaId);
            if (_textAreaElt != null)
                _textAreaElt.value = _value;
            if (_textAreaHiddenSave != null)
                return _textAreaHiddenSave.value;
        }
        return GetTextAreaValue();
    }
    function OnIFrameValueChanged(eltId) {
        RTE_TransferIFrameContentsToTextArea(_textAreaId);
        if (_textAreaHiddenSave != null) {
            if (_textAreaHiddenSave.value != _value)
                _value = _textAreaHiddenSave.value;
            _myData.updateControlValue(_myData.fieldName, _value);
        }
        if (_textAreaElt != null)
            _textAreaElt.value = _value;
        var docEditor = RTE_GetEditorDocument(eltId);

        if (docEditor != null) {
            if (g_rgrngRTETextEditorSelection != null)
                g_rgrngRTETextEditorSelection[eltId] = docEditor.selection.createRange();
            if (g_rgstRTETextEditorSelectionType != null)
                g_rgstRTETextEditorSelectionType[eltId] = docEditor.selection.type;
        }
    }
    function BuildRichTextHtml() {
        var result = '<span dir="' + _encodedDir + '">';

        result += '<span dir="' + STSHtmlEncode(Strings.STS.L_RichTextDir) + '">';
        result += '<textarea rows="' + STSHtmlEncode(_myData.fieldSchema.NumberOfLines) + '" cols="20" id="' + STSHtmlEncode(_textAreaId) + '" ';
        result += 'title="' + STSHtmlEncode(_myData.fieldSchema.Title) + '" class="ms-long"' + _textDir + '>';
        result += STSHtmlEncode(_value) + '</textarea>';
        result += '<input type="hidden" id="' + STSHtmlEncode(_textAreaId + '_spSave') + '" /></span></span>';
        return result;
    }
    function CreateSPFieldNote_EnhancedRichText() {
        _myData.registerInitCallback(_myData.fieldName, InitEnhancedRichTextControl);
        _myData.registerValidationErrorCallback(_myData.fieldName, function(errorResult) {
            SPFormControl_AppendValidationErrorMessage(_textAreaTopDivId, errorResult);
        });
        _myData.registerGetValueCallback(_myData.fieldName, GetEnhancedRichTextControlValue);
        _myData.updateControlValue(_myData.fieldName, _value);
    }
    function InitEnhancedRichTextControl() {
        _textAreaRte = document.getElementById(_textAreaRteId);
        if (_textAreaRte != null) {
            _textAreaRte.AllowEmbedding = 'True';
            _textAreaRte.InputFieldId = _textAreaHiddenInputId;
            if (_myData.webAttributes.AllowScriptableWebParts && _myData.webAttributes.PermissionCustomizePages) {
                _textAreaRte.AllowScriptWebParts = 'True';
                _textAreaRte.EmbeddingWPId = _myData.fieldSchema.ScriptEditorAdderId;
            }
            var listTemplate = _myData.listAttributes.ListTemplateType;

            if (_myData.fieldSchema.RichTextMode != SPClientTemplates.RichTextMode.ThemeHtml && listTemplate != 119 && listTemplate != 301 && listTemplate != 108)
                _textAreaRte.UseInlineStyle = 'True';
        }
        if (typeof _spRteScriptLoaded != 'undefined' && _spRteScriptLoaded) {
            RTE.Canvas.fixRegion(_textAreaRteId, false);
        }
        else {
            if (typeof _spRteFieldEditableRegionIds == 'undefined' || _spRteFieldEditableRegionIds == null)
                _spRteFieldEditableRegionIds = [];
            _spRteFieldEditableRegionIds.push(_textAreaRteId);
        }
        _textAreaHiddenInput = document.getElementById(_textAreaHiddenInputId);
        if (_textAreaHiddenInput != null && _textAreaHiddenInput.value == '')
            _textAreaHiddenInput.value = _textAreaRte.innerHTML;
    }
    function GetEnhancedRichTextControlValue() {
        CopyEnhancedRteValueToInput();
        if (_textAreaHiddenInput != null)
            return _textAreaHiddenInput.value;
        return '';
    }
    function CopyEnhancedRteValueToInput() {
        RTE.RichTextEditor.transferContentsToInputField(_textAreaRteId, false);
    }
    function BuildEnhancedRichTextHtml() {
        var encodedLabelId = STSHtmlEncode(_textAreaRteLabelId);
        var saveInput = '<input type="hidden" id="' + STSHtmlEncode(_textAreaHiddenInputId) + '" />';
        var focusInput = '<input type="hidden" name="ms-rtefocuselementid" id="ms-rtefocuselementid" value="" />';
        var result = '<span dir="' + _encodedDir + '">';

        result += '<div class="ms-rtestate-field ms-rtefield" id="' + STSHtmlEncode(_textAreaTopDivId) + '">';
        result += '<div id="' + encodedLabelId + '" style="display:none">';
        result += STSHtmlEncode(Strings.STS.L_RichTextHiddenLabelText);
        result += '</div><div class="ms-rtestate-write ms-rteflags-' + String(_rteFlags) + '" id="' + STSHtmlEncode(_textAreaRteId) + '" ';
        result += 'style="min-height:' + String(_rteHeight) + 'px" aria-labelledby="' + encodedLabelId + '" contentEditable="true">';
        result += _value + '</div><div style="clear : both;"></div></div>';
        result += '<span dir="ltr">' + saveInput + focusInput + '</span></span>';
        return result;
    }
}
function SPFieldFile_Display(rCtx) {
    if (rCtx == null)
        return '';
    var _myData = SPClientTemplates.Utility.GetFormContextForCurrentField(rCtx);

    if (_myData == null || _myData.fieldSchema == null || _myData.fieldValue == null || _myData.itemAttributes == null)
        return '';
    var valueObj = _myData.fieldValue;
    var fsObjType = _myData.itemAttributes.FsObjType;

    if (fsObjType == SPClientTemplates.FileSystemObjectType.File) {
        var serverUrl = valueObj['FileUrl'];
        var baseName = valueObj['BaseName'];
        var strProgId = valueObj['File_x0020_Type_progid'];
        var strServerFileRedirect = valueObj['serverurl_progid'];
        var defaultItemOpen = _myData.listAttributes['DefaultItemOpen'];

        baseName = baseName == null ? '' : STSHtmlEncode(baseName);
        serverUrl = serverUrl == null ? '' : STSHtmlEncode(serverUrl);
        strProgId = strProgId == null ? '' : STSHtmlEncode(strProgId);
        defaultItemOpen = defaultItemOpen == null ? '' : STSHtmlEncode(defaultItemOpen);
        strServerFileRedirect = strServerFileRedirect == null ? '' : STSHtmlEncode(strServerFileRedirect);
        var fileResult = '';

        fileResult += "<a rel=\"sp_DialogLinkNavigate\" href=\"" + serverUrl + "\" ";
        fileResult += "onmousedown=\"return VerifyHref(this, event, '" + defaultItemOpen;
        fileResult += "', '" + strProgId + "', '" + strServerFileRedirect;
        fileResult += "')\" onclick=\"DispDocItemExWithServerRedirect(this, event, 'FALSE', 'FALSE', 'FALSE', '";
        fileResult += strProgId + "', '" + defaultItemOpen + "', '" + strServerFileRedirect;
        fileResult += "'); return false;\">" + baseName + "</a>";
        return fileResult;
    }
    else if (fsObjType == SPClientTemplates.FileSystemObjectType.Folder) {
        if (valueObj == null)
            return '';
        var result = "<a rel=\"sp_DialogLinkNavigate\" href=\"" + STSHtmlEncode(valueObj['FolderUrl']) + "\">";

        result += STSHtmlEncode(valueObj['FolderName']) + "</a>";
        return result;
    }
    return '';
}
function SPFieldFile_Edit(rCtx) {
    if (rCtx == null)
        return '';
    var _myData = SPClientTemplates.Utility.GetFormContextForCurrentField(rCtx);

    if (_myData == null || _myData.fieldSchema == null)
        return '';
    var _inputElt;
    var _initialValue = _myData.fieldValue != null ? _myData.fieldValue : '';
    var _inputId = _myData.fieldName + '_' + _myData.fieldSchema.Id + '_$onetidIOFile';
    var _fileExtension = '';
    var _isFile = _myData.itemAttributes.FsObjType == SPClientTemplates.FileSystemObjectType.File;
    var _isFolder = _myData.itemAttributes.FsObjType == SPClientTemplates.FileSystemObjectType.Folder;

    if (_myData.fieldSchema.Required) {
        var validators = new SPClientForms.ClientValidation.ValidatorSet();

        validators.RegisterValidator(new SPClientForms.ClientValidation.RequiredFileValidator());
        _myData.registerClientValidator(_myData.fieldName, validators);
    }
    _myData.registerInitCallback(_myData.fieldName, InitControl);
    _myData.registerFocusCallback(_myData.fieldName, function() {
        if (_inputElt != null)
            _inputElt.focus();
    });
    _myData.registerValidationErrorCallback(_myData.fieldName, ShowErrorMessage);
    _myData.registerGetValueCallback(_myData.fieldName, function() {
        return _inputElt == null ? '' : SPClientTemplates.Utility.Trim(_inputElt.value) + _fileExtension;
    });
    _myData.updateControlValue(_myData.fieldName, _initialValue);
    var result = '';

    if (_isFile) {
        var idx = _initialValue.lastIndexOf('.');

        _fileExtension = idx != -1 ? _initialValue.substring(idx) : '';
        var fileName = idx != -1 ? _initialValue.substring(0, idx) : _initialValue;

        result = '<span dir="' + STSHtmlEncode(_myData.fieldSchema.Direction) + '"><span dir="ltr">';
        result += '<input type="text" value="' + STSHtmlEncode(fileName) + '" maxlength="123" id="' + STSHtmlEncode(_inputId) + '" ';
        result += 'title="' + STSHtmlEncode(_myData.fieldSchema.Title) + '" class="ms-input" size="35" />';
        result += '<span class="ms-fileField-fileExt">' + _fileExtension + '</span></span><br /></span>';
        return result;
    }
    else if (_isFolder) {
        result = '<span dir="' + STSHtmlEncode(_myData.fieldSchema.Direction) + '">';
        result += '<input type="text" value="' + STSHtmlEncode(_initialValue) + '" maxlength="123" id="' + STSHtmlEncode(_inputId) + '" ';
        result += 'title="' + STSHtmlEncode(_myData.fieldSchema.Title) + '" class="ms-long" size="35" />';
        result += '<br /></span>';
        return result;
    }
    return '';
    function InitControl() {
        _inputElt = document.getElementById(_inputId);
        if (_inputElt != null)
            AddEvtHandler(_inputElt, "onchange", OnValueChanged);
    }
    function OnValueChanged() {
        if (_inputElt != null)
            _myData.updateControlValue(_myData.fieldName, SPClientTemplates.Utility.Trim(_inputElt.value) + _fileExtension);
    }
    function ShowErrorMessage(errorResult) {
        if (_isFile || _isFolder) {
            if (_inputElt == null)
                _inputElt = document.getElementById(_inputId);
            if (_inputElt != null) {
                var parentSpan = _inputElt.parentNode;

                if (parentSpan != null) {
                    var parentId = _inputId + '_parentSpan';

                    parentSpan.id = parentId;
                    SPFormControl_AppendValidationErrorMessage(parentId, errorResult);
                }
            }
        }
    }
}
function SPFieldChoice_Edit(rCtx) {
    if (rCtx == null)
        return '';
    var _myData = SPClientTemplates.Utility.GetFormContextForCurrentField(rCtx);

    if (_myData == null || _myData.fieldSchema == null)
        return '';
    if (_myData.fieldSchema.Required) {
        var validators = new SPClientForms.ClientValidation.ValidatorSet();

        validators.RegisterValidator(new SPClientForms.ClientValidation.RequiredValidator());
        _myData.registerClientValidator(_myData.fieldName, validators);
    }
    var _formatType = _myData.fieldSchema.FormatType;

    if (_formatType == SPClientTemplates.ChoiceFormatType.Radio)
        return SPFieldChoice_Radio_Edit(rCtx);
    if (_formatType == SPClientTemplates.ChoiceFormatType.Dropdown)
        return SPFieldChoice_Dropdown_Edit(rCtx);
    return '';
}
function SPFieldChoice_Dropdown_Edit(rCtx) {
    if (rCtx == null)
        return '';
    var _myData = SPClientTemplates.Utility.GetFormContextForCurrentField(rCtx);

    if (_myData == null || _myData.fieldSchema == null)
        return '';
    var _idPrefix = _myData.fieldName + '_' + _myData.fieldSchema.Id;
    var _dropDownId = _idPrefix + '_$DropDownChoice';
    var _isFillInChoice = _myData.fieldSchema.FillInChoice;
    var _radioName = '', _fillInRadioId = '';
    var _dropDownRadioId = '', _fillInTextId = '', _fillInTableId = '';
    var _fillInRadio, _dropDownRadio;
    var _fillInTextElt, _dropDownElt;
    var _initialValue = '';
    var _choices = _myData.fieldSchema.Choices;

    _initialValue = _myData.fieldValue != null ? _myData.fieldValue : '';
    var _doesChoiceExist = CurrentChoiceValueExists(_initialValue);
    var _isChoiceEmpty = _initialValue == '' || !_doesChoiceExist && !_isFillInChoice;
    var _isChoiceSelected = !_isFillInChoice || _isChoiceEmpty || _doesChoiceExist;

    _myData.registerInitCallback(_myData.fieldName, InitDropDown);
    _myData.registerFocusCallback(_myData.fieldName, FocusDropDown);
    _myData.registerValidationErrorCallback(_myData.fieldName, OnValidationError);
    _myData.registerGetValueCallback(_myData.fieldName, GetDropDownValue);
    _myData.updateControlValue(_myData.fieldName, _initialValue);
    if (_isFillInChoice)
        return '<span dir="' + STSHtmlEncode(_myData.fieldSchema.Direction) + '">' + BuildFillInChoiceHtml() + '</span>';
    else
        return '<span dir="' + STSHtmlEncode(_myData.fieldSchema.Direction) + '">' + BuildSelectHtml() + '<br /></span>';
    function BuildFillInChoiceHtml() {
        _fillInTableId = _idPrefix + '_FillInTable';
        _fillInTextId = _idPrefix + '_$FillInChoice';
        _fillInRadioId = _idPrefix + '_FillInButton';
        _dropDownRadioId = _idPrefix + '_DropDownButton';
        _radioName = STSHtmlEncode(_idPrefix + '_Radio');
        var fTitle = _myData.fieldSchema.Title;
        var fillInValue = !_isChoiceSelected ? STSHtmlEncode(_initialValue) : '';
        var fillInCheckedStr = !_isChoiceSelected ? 'checked="checked" ' : '';
        var dropDownCheckedStr = _isChoiceSelected ? 'checked="checked" ' : '';
        var fillInTitle = STSHtmlEncode(StBuildParam(Strings.STS.L_FillInChoiceFillInLabel, fTitle));
        var dropdownTitleStr = STSHtmlEncode(StBuildParam(Strings.STS.L_FillInChoiceDropdownTitle, fTitle));
        var encodedDropDownRadioId = STSHtmlEncode(_dropDownRadioId);
        var dropDownRow = '<tr><td><span title="' + dropdownTitleStr + '">';

        dropDownRow += '<input id="' + encodedDropDownRadioId + '" type="radio" name="' + _radioName + '" value="DropDownButton" ' + dropDownCheckedStr + '/>';
        dropDownRow += '</span><label class="ms-hidden" for="' + encodedDropDownRadioId + '">' + dropdownTitleStr + '</label>';
        dropDownRow += BuildSelectHtml() + '</td></tr>';
        var encodedRadioId = STSHtmlEncode(_fillInRadioId);
        var fillInRow = '<tr><td><span class="ms-RadioText" title="' + fillInTitle + '">';

        fillInRow += '<input id="' + encodedRadioId + '" type="radio" name="' + _radioName + '" value="FillInButton" ' + fillInCheckedStr + '/>';
        fillInRow += '<label for="' + encodedRadioId + '">' + STSHtmlEncode(Strings.STS.L_ChoiceFillInDisplayText) + '</label></span></td></tr>';
        var fillInBox = '<tr><td>&#160;&#160;&#160;';

        fillInBox += '<input type="text" maxlength="';
        fillInBox += String(255);
        fillInBox += '" id="' + STSHtmlEncode(_fillInTextId);
        fillInBox += '" tabindex="-1" value="' + fillInValue + '" title="' + fillInTitle + '" /></td></tr>';
        return '<table id="' + STSHtmlEncode(_fillInTableId) + '" cellpadding="0" cellspacing="1">' + dropDownRow + fillInRow + fillInBox + '</table>';
    }
    function BuildSelectHtml() {
        var valueSet = false;
        var select = '<select id="' + STSHtmlEncode(_dropDownId) + '" title="' + STSHtmlEncode(_myData.fieldSchema.Title) + '" class="ms-RadioText">';

        if (_isChoiceEmpty)
            select += '<option value="" selected="selected" ></option>';
        for (var idx = 0; idx < _choices.length; idx++) {
            var val = _choices[idx];
            var encodedVal = STSHtmlEncode(val);
            var selectedStr = !valueSet && _initialValue == val ? 'selected="selected" ' : '';

            valueSet = valueSet ? true : selectedStr != '';
            select += '<option value="' + encodedVal + '" ' + selectedStr + '>' + encodedVal + '</option>';
        }
        select += '</select>';
        return select;
    }
    function InitDropDown() {
        _dropDownElt = document.getElementById(_dropDownId);
        if (_dropDownElt != null)
            AddEvtHandler(_dropDownElt, "onchange", UpdateDropDownValue);
        if (_isFillInChoice) {
            _fillInRadio = document.getElementById(_fillInRadioId);
            _dropDownRadio = document.getElementById(_dropDownRadioId);
            _fillInTextElt = document.getElementById(_fillInTextId);
            if (_dropDownElt != null)
                AddEvtHandler(_dropDownElt, "onclick", function() {
                    SetChoiceOption(_dropDownRadioId);
                });
            if (_fillInRadio != null) {
                AddEvtHandler(_fillInRadio, "onclick", UpdateDropDownValue);
                if (_fillInRadio.parentNode != null)
                    AddEvtHandler(_fillInRadio.parentNode, "onclick", function() {
                        SetFocusOnControl(_fillInTextId);
                    });
            }
            if (_dropDownRadio != null)
                AddEvtHandler(_dropDownRadio, "onclick", UpdateDropDownValue);
            if (_fillInTextElt != null) {
                AddEvtHandler(_fillInTextElt, "onchange", UpdateDropDownValue);
                AddEvtHandler(_fillInTextElt, "onclick", function() {
                    SetChoiceOption(_fillInRadioId);
                });
                AddEvtHandler(_fillInTextElt, "onfocus", function() {
                    SetChoiceOption(_fillInRadioId);
                });
            }
        }
    }
    function FocusDropDown() {
        if (_isFillInChoice && !_isChoiceSelected && _fillInTextElt != null)
            _fillInTextElt.focus();
        else if (_dropDownElt != null)
            _dropDownElt.focus();
    }
    function OnValidationError(errorResult) {
        if (_isFillInChoice)
            SPFormControl_AppendValidationErrorMessage(_fillInTableId, errorResult);
        else
            SPFormControl_AppendValidationErrorMessage(_dropDownId, errorResult);
    }
    function UpdateDropDownValue() {
        _myData.updateControlValue(_myData.fieldName, GetDropDownValue());
    }
    function GetDropDownValue() {
        if (!_isFillInChoice)
            return _dropDownElt != null ? _dropDownElt.value : '';
        else {
            if (_fillInRadio.checked && _fillInTextElt != null)
                return SPClientTemplates.Utility.Trim(_fillInTextElt.value);
            if (_dropDownRadio.checked && _dropDownElt != null)
                return _dropDownElt.value;
            return '';
        }
    }
    function CurrentChoiceValueExists(v) {
        for (var i in _choices) {
            if (v == _choices[i])
                return true;
        }
        return false;
    }
}
function SPFieldChoice_Radio_Edit(rCtx) {
    if (rCtx == null)
        return '';
    var _myData = SPClientTemplates.Utility.GetFormContextForCurrentField(rCtx);

    if (_myData == null || _myData.fieldSchema == null)
        return '';
    var _choices = _myData.fieldSchema.Choices;
    var _isFillInChoice = _myData.fieldSchema.FillInChoice;
    var _radioOptions = [], _radioIds = [];
    var _idPrefix = _myData.fieldName + '_' + _myData.fieldSchema.Id;
    var _fillInTableId = _idPrefix + '_ChoiceRadioTable';
    var _radioName = _idPrefix + '_$RadioButtonChoiceField';
    var _encodeRadioName = STSHtmlEncode(_radioName);
    var _fillInRadioId = '', _fillInTextId = '';
    var _fillInRadio, _fillInTextElt;
    var _initialValue = _myData.fieldValue != null ? _myData.fieldValue : '';

    _myData.registerInitCallback(_myData.fieldName, InitRadio);
    _myData.registerFocusCallback(_myData.fieldName, FocusRadio);
    _myData.registerValidationErrorCallback(_myData.fieldName, function(errorResult) {
        SPFormControl_AppendValidationErrorMessage(_fillInTableId, errorResult);
    });
    _myData.registerGetValueCallback(_myData.fieldName, GetRadioValue);
    _myData.updateControlValue(_myData.fieldName, _initialValue);
    return '<span dir="' + STSHtmlEncode(_myData.fieldSchema.Direction) + '">' + BuildRadioChoiceHtml() + '</span>';
    function BuildRadioChoiceHtml() {
        var fillInRow = '', fillInBox = '';

        if (_isFillInChoice) {
            _fillInTextId = _radioName + 'FillInText';
            _fillInRadioId = _radioName + 'FillInRadio';
            var fTitle = _myData.fieldSchema.Title;
            var fillInDisplayText = STSHtmlEncode(Strings.STS.L_ChoiceFillInDisplayText);
            var fillInTitle = STSHtmlEncode(StBuildParam(Strings.STS.L_FillInChoiceFillInLabel, fTitle));
            var _isChoiceSelected = CurrentChoiceValueExists(_initialValue);
            var fillInValue = !_isChoiceSelected ? STSHtmlEncode(_initialValue) : '';
            var fillInCheckedStr = !_isChoiceSelected ? 'checked="checked" ' : '';
            var encodedFillInRadioId = STSHtmlEncode(_fillInRadioId);

            fillInRow = '<tr><td><span class="ms-RadioText" title="' + fillInDisplayText + '">';
            fillInRow += '<input id="' + encodedFillInRadioId + '" type="radio" name="' + _encodeRadioName + '" value="FillInButton" ' + fillInCheckedStr + '/>';
            fillInRow += '<label for="' + encodedFillInRadioId + '">' + fillInDisplayText + '</label></span></td></tr>';
            fillInBox = '<tr><td>&#160;&#160;&#160;<input type="text" maxlength="';
            fillInBox += String(255);
            fillInBox += '" id="' + STSHtmlEncode(_fillInTextId) + '" ';
            fillInBox += 'tabindex="-1" value="' + fillInValue + '" title="' + fillInTitle + '" /></td></tr>';
        }
        return '<table id="' + STSHtmlEncode(_fillInTableId) + '" cellpadding="0" cellspacing="1">' + BuildChoiceRows() + fillInRow + fillInBox + '</table>';
    }
    function BuildChoiceRows() {
        var choiceHtml = '';
        var valueSet = false;

        for (var idx = 0; idx < _choices.length; idx++) {
            var val = _choices[idx];
            var encodedVal = STSHtmlEncode(val);
            var radioId = STSHtmlEncode(_radioName + String(idx));

            _radioIds.push(radioId);
            var checkedStr = !valueSet && _initialValue == val ? 'checked="checked" ' : '';

            valueSet = valueSet ? true : checkedStr != '';
            choiceHtml += '<tr><td><span class="ms-RadioText" title="' + encodedVal + '">';
            choiceHtml += '<input id="' + radioId + '" type="radio" name="' + _encodeRadioName + '" value="' + encodedVal + '" ' + checkedStr + '/>';
            choiceHtml += '<label for="' + radioId + '">' + encodedVal + '</label></span></td></tr>';
        }
        return choiceHtml;
    }
    function InitRadio() {
        for (var i = 0; i < _radioIds.length; i++) {
            var rId = _radioIds[i];
            var elt = document.getElementById(rId);

            if (elt != null) {
                _radioOptions.push(elt);
                AddEvtHandler(elt, "onclick", UpdateRadioValue);
            }
        }
        if (_isFillInChoice) {
            _fillInRadio = document.getElementById(_fillInRadioId);
            if (_fillInRadio != null) {
                AddEvtHandler(_fillInRadio, "onclick", UpdateRadioValue);
                if (_fillInRadio.parentNode != null)
                    AddEvtHandler(_fillInRadio.parentNode, "onclick", function() {
                        SetFocusOnControl(_fillInTextId);
                    });
            }
            _fillInTextElt = document.getElementById(_fillInTextId);
            if (_fillInTextElt != null) {
                AddEvtHandler(_fillInTextElt, "onchange", UpdateRadioValue);
                AddEvtHandler(_fillInTextElt, "onclick", function() {
                    SetChoiceOption(_fillInRadioId);
                });
                AddEvtHandler(_fillInTextElt, "onpaste", function() {
                    SetChoiceOption(_fillInRadioId);
                });
                AddEvtHandler(_fillInTextElt, "onkeypress", function() {
                    SetChoiceOption(_fillInRadioId);
                });
            }
        }
    }
    function FocusRadio() {
        if (_fillInRadio != null && _fillInRadio.checked && _fillInTextElt != null)
            _fillInTextElt.focus();
        else {
            for (var i = 0; i < _radioOptions.length; i++) {
                var elt = _radioOptions[i];

                if (elt != null && elt.checked) {
                    elt.focus();
                    return;
                }
            }
        }
    }
    function UpdateRadioValue() {
        _myData.updateControlValue(_myData.fieldName, GetRadioValue());
    }
    function GetRadioValue() {
        if (_fillInRadio != null && _fillInRadio.checked && _fillInTextElt != null)
            return SPClientTemplates.Utility.Trim(_fillInTextElt.value);
        else {
            for (var i = 0; i < _radioOptions.length; i++) {
                var elt = _radioOptions[i];

                if (elt != null && elt.checked)
                    return elt.value;
            }
        }
        return '';
    }
    function CurrentChoiceValueExists(v) {
        for (var i in _choices) {
            if (v == _choices[i])
                return true;
        }
        return false;
    }
}
function SPFieldMultiChoice_Edit(rCtx) {
    if (rCtx == null)
        return '';
    var _myData = SPClientTemplates.Utility.GetFormContextForCurrentField(rCtx);

    if (_myData == null || _myData.fieldSchema == null)
        return '';
    var _constFillIn = '__Fill_;_In__';
    var _isFillInChoice = _myData.fieldSchema.FillInChoice;
    var _checkboxIds = [], _checkboxOptions = [];
    var _idPrefix = _myData.fieldName + '_' + _myData.fieldSchema.Id;
    var _topTableId = _idPrefix + '_MultiChoiceTable';
    var _fillInCheckboxId = '', _fillInTextId = '';
    var _fillInCheckbox, _fillInTextElt;
    var _allChoicesDict = {};
    var _initialValue = '';
    var _choices = _myData.fieldSchema.MultiChoices;

    _initialValue = _myData.fieldValue ? _myData.fieldValue : '';
    var _selectedChoices = _initialValue == '' ? [] : _initialValue.split(";#");

    _allChoicesDict[_constFillIn] = _constFillIn;
    for (var i = 0; i < _choices.length; i++)
        _allChoicesDict[_choices[i]] = 0;
    for (var j = 0; j < _selectedChoices.length; j++) {
        if (_selectedChoices[j] == '')
            continue;
        if (typeof _allChoicesDict[_selectedChoices[j]] == "undefined") {
            if (_isFillInChoice && _allChoicesDict[_constFillIn] == _constFillIn)
                _allChoicesDict[_constFillIn] = _selectedChoices[j];
        }
        else {
            _allChoicesDict[_selectedChoices[j]]++;
        }
    }
    if (_myData.fieldSchema.Required) {
        var validators = new SPClientForms.ClientValidation.ValidatorSet();

        validators.RegisterValidator(new SPClientForms.ClientValidation.RequiredFileValidator());
        _myData.registerClientValidator(_myData.fieldName, validators);
    }
    _myData.registerInitCallback(_myData.fieldName, InitMultiChoice);
    _myData.registerFocusCallback(_myData.fieldName, FocusMultiChoice);
    _myData.registerValidationErrorCallback(_myData.fieldName, function(errorResult) {
        SPFormControl_AppendValidationErrorMessage(_topTableId, errorResult);
    });
    _myData.registerGetValueCallback(_myData.fieldName, GetMultiChoiceValue);
    _myData.updateControlValue(_myData.fieldName, _initialValue);
    return '<span dir="' + STSHtmlEncode(_myData.fieldSchema.Direction) + '">' + BuildMultiChoiceHtml() + '</span>';
    function BuildMultiChoiceHtml() {
        var fillInRow = '', fillInBox = '';

        if (_isFillInChoice) {
            _fillInTextId = _idPrefix + 'FillInText';
            _fillInCheckboxId = _idPrefix + 'FillInRadio';
            var fTitle = _myData.fieldSchema.Title;
            var fillInDisplayText = STSHtmlEncode(Strings.STS.L_ChoiceFillInDisplayText);
            var fillInTitle = STSHtmlEncode(StBuildParam(Strings.STS.L_FillInChoiceFillInLabel, fTitle));
            var fillInValue = _allChoicesDict[_constFillIn] == _constFillIn ? '' : STSHtmlEncode(_allChoicesDict[_constFillIn]);
            var fillInCheckedStr = _allChoicesDict[_constFillIn] == _constFillIn ? '' : 'checked="checked" ';
            var encodedFillInCheckboxId = STSHtmlEncode(_fillInCheckboxId);

            fillInRow = '<tr><td><span class="ms-RadioText" title="' + fillInDisplayText + '">';
            fillInRow += '<input id="' + encodedFillInCheckboxId + '" type="checkbox" ' + fillInCheckedStr + '/>';
            fillInRow += '<label for="' + encodedFillInCheckboxId + '">' + fillInDisplayText + '</label></span></td></tr>';
            fillInBox = '<tr><td>&#160;&#160;&#160;<input type="text" maxlength="';
            fillInBox += String(255);
            fillInBox += '" id="' + STSHtmlEncode(_fillInTextId);
            fillInBox += '" tabindex="-1" value="' + fillInValue + '" title="' + fillInTitle + '" /></td></tr>';
        }
        return '<table id="' + STSHtmlEncode(_topTableId) + '" cellpadding="0" cellspacing="1">' + BuildChoiceRows() + fillInRow + fillInBox + '</table>';
    }
    function BuildChoiceRows() {
        var choiceHtml = '';

        for (var idx = 0; idx < _choices.length; idx++) {
            var val = _choices[idx];
            var encodedVal = STSHtmlEncode(val);
            var cbxId = _idPrefix + '_MultiChoiceOption_' + String(idx);
            var encodedCbxId = STSHtmlEncode(cbxId);
            var checkedStr = '';

            if (_allChoicesDict[val] > 0) {
                _allChoicesDict[val]--;
                checkedStr = 'checked="checked" ';
            }
            _checkboxIds.push(cbxId);
            choiceHtml += '<tr><td><span class="ms-RadioText" title="' + encodedVal + '">';
            choiceHtml += '<input id="' + encodedCbxId + '" type="checkbox" ' + checkedStr + '/>';
            choiceHtml += '<label for="' + encodedCbxId + '">' + encodedVal + '</label></span></td></tr>';
        }
        return choiceHtml;
    }
    function InitMultiChoice() {
        for (var k = 0; k < _checkboxIds.length; k++) {
            var cbxId = _checkboxIds[k];
            var elt = document.getElementById(cbxId);

            if (elt != null) {
                _checkboxOptions.push(elt);
                AddEvtHandler(elt, "onclick", UpdateCheckboxValues);
            }
        }
        if (_isFillInChoice) {
            _fillInCheckbox = document.getElementById(_fillInCheckboxId);
            if (_fillInCheckbox != null) {
                AddEvtHandler(_fillInCheckbox, "onclick", UpdateCheckboxValues);
                if (_fillInCheckbox.parentNode != null)
                    AddEvtHandler(_fillInCheckbox.parentNode, "onclick", function() {
                        ChangeFillinTextTabindex(_fillInTextId, _fillInCheckboxId);
                    });
            }
            _fillInTextElt = document.getElementById(_fillInTextId);
            if (_fillInTextElt != null) {
                AddEvtHandler(_fillInTextElt, "onchange", UpdateCheckboxValues);
                AddEvtHandler(_fillInTextElt, "onclick", function() {
                    SetChoiceOption(_fillInCheckboxId);
                });
                AddEvtHandler(_fillInTextElt, "onfocus", function() {
                    SetChoiceOption(_fillInCheckboxId);
                });
            }
        }
    }
    function FocusMultiChoice() {
        if (_checkboxOptions.length > 1) {
            var elt = _checkboxOptions[0];

            if (elt != null)
                elt.focus();
        }
    }
    function UpdateCheckboxValues() {
        _myData.updateControlValue(_myData.fieldName, GetMultiChoiceValue());
    }
    function GetMultiChoiceValue() {
        var resultStr = '';
        var selectedElts = false;

        for (var m = 0; m < _checkboxOptions.length; m++) {
            var elt = _checkboxOptions[m];

            if (elt != null && elt.checked) {
                selectedElts = true;
                resultStr += ";#";
                resultStr += _choices[m];
            }
        }
        if (_fillInCheckbox != null && _fillInCheckbox.checked && _fillInTextElt != null && _fillInTextElt.value != '') {
            if (selectedElts)
                resultStr += ";#";
            selectedElts = true;
            resultStr += SPClientTemplates.Utility.Trim(_fillInTextElt.value);
        }
        resultStr += selectedElts ? ";#" : '';
        return resultStr;
    }
}
function SPFieldDateTime_Display(rCtx) {
    var dispValue = SPField_FormDisplay_Default(rCtx);

    return dispValue == '' ? '' : dispValue + '&#160;';
}
function SPFieldDateTime_Edit(rCtx) {
    if (rCtx == null)
        return '';
    var _myData = SPClientTemplates.Utility.GetFormContextForCurrentField(rCtx);

    if (_myData == null || _myData.fieldSchema == null)
        return '';
    var _schema = _myData.fieldSchema;
    var _calendarType = _schema.CalendarType;
    var _encodedDir = STSHtmlEncode(_schema.Direction);
    var _isDateTime = _schema.DisplayFormat == SPClientTemplates.DateTimeDisplayFormat.DateTime;
    var _isDateOnly = _schema.DisplayFormat == SPClientTemplates.DateTimeDisplayFormat.DateOnly;
    var _isTimeOnly = _schema.DisplayFormat == SPClientTemplates.DateTimeDisplayFormat.TimeOnly;
    var _buildDateInput = _isDateTime || _isDateOnly;
    var _buildTimeDropDown = _isDateTime || _isTimeOnly;
    var _dateInput;
    var _hourDropDown, _minuteDropDown;
    var _idPrefix = _myData.fieldName + '_' + _schema.Id + '_$DateTimeField';
    var _dateTimeTopTableId = STSHtmlEncode(_idPrefix + 'TopTable');
    var _dateInputId = STSHtmlEncode(_idPrefix + 'Date');
    var _datePickerImgId = STSHtmlEncode(_idPrefix + 'DateDatePickerImage');
    var _datePickerIframeId = STSHtmlEncode(_idPrefix + 'DateDatePickerFrame');
    var _hourDropDownId = STSHtmlEncode(_idPrefix + 'DateHours');
    var _minuteDropDownId = STSHtmlEncode(_idPrefix + 'DateMinutes');
    var _initialDateValueComplete = _myData.fieldValue == null ? '' : _myData.fieldValue;
    var _dateParseResult = ParseDateInternal(_initialDateValueComplete);
    var _initialDateValue = _dateParseResult.Date;
    var _initialHourValue = _dateParseResult.Hour;
    var _initialMinuteValue = _dateParseResult.Minute;

    if (_myData.fieldSchema.Required) {
        var validators = new SPClientForms.ClientValidation.ValidatorSet();

        validators.RegisterValidator(new SPClientForms.ClientValidation.RequiredValidator());
        _myData.registerClientValidator(_myData.fieldName, validators);
    }
    _myData.registerInitCallback(_myData.fieldName, InitDateTime);
    _myData.registerFocusCallback(_myData.fieldName, function() {
        if (_dateInput != null)
            _dateInput.focus();
    });
    _myData.registerValidationErrorCallback(_myData.fieldName, function(errorResult) {
        SPFormControl_AppendValidationErrorMessage(_dateTimeTopTableId, errorResult);
    });
    _myData.registerGetValueCallback(_myData.fieldName, GetDateTimeValue);
    _myData.updateControlValue(_myData.fieldName, _initialDateValueComplete);
    var result = "<span dir=\"" + _encodedDir + "\">";

    result += "<table id=\"" + _dateTimeTopTableId + "\" border=\"0\" cellpadding=\"0\" cellspacing=\"0\"><tr>";
    if (_buildDateInput)
        result += BuildDateInput();
    if (_buildTimeDropDown)
        result += BuildTimeDropDown();
    result += "</tr></table></span>";
    return result;
    function ParseDateInternal(initialDate) {
        var parseDate = {
            'Hour': '0',
            'Minute': '0',
            'Date': SPClientTemplates.Utility.Trim(initialDate)
        };

        if (initialDate == null || initialDate == '')
            return parseDate;
        var timeSepIdx = initialDate.lastIndexOf(_schema.TimeSeparator);

        if (timeSepIdx == -1 || timeSepIdx == initialDate.length - 1)
            return parseDate;
        var minuteVal = initialDate.substring(timeSepIdx + 1);

        if (isNaN(Number(minuteVal)))
            return parseDate;
        parseDate.Minute = minuteVal;
        var dateSubstr = initialDate.substring(0, timeSepIdx);
        var spaceIdx = dateSubstr.lastIndexOf(" ");

        if (spaceIdx == -1 || spaceIdx == dateSubstr.length - 1)
            return parseDate;
        var hourVal = dateSubstr.substring(spaceIdx + 1);

        if (isNaN(Number(hourVal)))
            return parseDate;
        parseDate.Hour = hourVal;
        parseDate.Date = dateSubstr.substring(0, spaceIdx);
        return parseDate;
    }
    function BuildDateInput() {
        var datePickerPath = _spPageContextInfo.webServerRelativeUrl;

        if (datePickerPath == null)
            datePickerPath = '';
        if (datePickerPath.endsWith('/'))
            datePickerPath = datePickerPath.substring(0, datePickerPath.length - 1);
        datePickerPath += "/_layouts/15/";
        var dateResult = "<td class=\"ms-dtinput\"><label for=\"" + _dateInputId + "\" style=\"display:none\">";

        dateResult += STSHtmlEncode(StBuildParam(Strings.STS.L_DateTimeFieldDateLabel, _myData.fieldName)) + "</label>";
        dateResult += "<input type=\"text\" value=\"" + STSHtmlEncode(_initialDateValue) + "\" maxlength=\"45\" id=\"" + _dateInputId + "\" ";
        dateResult += "title=\"" + STSHtmlEncode(_myData.fieldSchema.Title) + "\" class=\"ms-input\" AutoPostBack=\"0\" /></td>";
        dateResult += "<td class=\"ms-dtinput\" ><a href=\"#\" onclick=\"clickDatePicker('" + _dateInputId + "', '";
        dateResult += STSHtmlEncode(datePickerPath) + "iframe.aspx?cal=" + STSHtmlEncode(String(_calendarType));
        dateResult += "&lcid=" + STSHtmlEncode(_schema.LocaleId) + "&langid=" + STSHtmlEncode(_schema.LanguageId);
        dateResult += "&tz=" + STSHtmlEncode(_schema.TimeZoneDifference) + "&ww=" + STSHtmlEncode(_schema.WorkWeek);
        dateResult += "&fdow=" + STSHtmlEncode(_schema.FirstDayOfWeek) + "&fwoy=" + STSHtmlEncode(_schema.FirstWeekOfYear);
        dateResult += "&hj=" + STSHtmlEncode(_schema.HijriAdjustment) + "&swn=" + STSHtmlEncode(_schema.ShowWeekNumber);
        dateResult += "&minjday=" + STSHtmlEncode(_schema.MinJDay) + "&maxjday=" + STSHtmlEncode(_schema.MaxJDay);
        dateResult += "&date=', '" + STSHtmlEncode(_initialDateValue) + "', event); return false;\" >";
        dateResult += "<img id=\"" + _datePickerImgId + "\" src=\"" + "/_layouts/15/images/calendar.gif" + "\" border=\"0\" ";
        dateResult += "alt=\"" + STSHtmlEncode(Strings.STS.L_DateTimeFieldSelectTitle) + "\"></img></a></td>";
        dateResult += "<td><iframe id=\"" + _datePickerIframeId + "\" src=\"" + "/_layouts/15/images/blank.gif" + "\" frameborder=\"0\" ";
        dateResult += "scrolling=\"no\" style=\"display:none; position:absolute; width:200px; z-index:101;\" ";
        dateResult += "title=\"" + STSHtmlEncode(Strings.STS.L_DateTimeFieldSelectTitle) + "\"></iframe></td>";
        return dateResult;
    }
    function BuildTimeDropDown() {
        var dirStr = '';

        if (!_myData.fieldSchema.HoursMode24)
            dirStr = 'dir="' + (fRightToLeft ? 'rtl' : 'ltr') + '"';
        var hourStr = "<label for=\"" + _hourDropDownId + "\" style=\"display:none\">";

        hourStr += STSHtmlEncode(StBuildParam(Strings.STS.L_DateTimeFieldDateHoursLabel, _myData.fieldName)) + "</label>";
        hourStr += "<select id=\"" + _hourDropDownId + "\" " + dirStr + ">";
        var hourOpts = _schema.HoursOptions;

        for (var hourIdx = 0; hourIdx < hourOpts.length; hourIdx++)
            hourStr += BuildOption(String(hourIdx), hourOpts[hourIdx], hourIdx == Number(_initialHourValue));
        hourStr += "</select>";
        var _minutes = ["00", "05", "10", "15", "20", "25", "30", "35", "40", "45", "50", "55"];
        var minStr = "<label for=\"" + _minuteDropDownId + "\" style=\"display:none\">";

        minStr += STSHtmlEncode(StBuildParam(Strings.STS.L_DateTimeFieldDateMinutesLabel, _myData.fieldName)) + "</label>";
        minStr += "<select id=\"" + _minuteDropDownId + "\" " + dirStr + ">";
        var minValue = Number(_initialMinuteValue);
        var uniqueValue = minValue % 5 != 0;

        for (var minIdx = 0; minIdx < 12; minIdx++) {
            var currentMinValue = _minutes[minIdx];

            minStr += BuildOption(currentMinValue, currentMinValue, minValue == Number(currentMinValue));
            if (uniqueValue && minValue > minIdx * 5 && minValue < minIdx * 5 + 5) {
                var uniqueDispValue = String(minValue);

                if (minValue < 10)
                    uniqueDispValue = "0" + uniqueDispValue;
                minStr += BuildOption(String(minValue), uniqueDispValue, true);
            }
        }
        minStr += "</select>";
        return "<td class=\"ms-dttimeinput\" nowrap=\"nowrap\">" + hourStr + "&nbsp;" + minStr + "</td>";
    }
    function BuildOption(optValue, dispValue, isSelected) {
        var optStr = '<option value="' + String(optValue) + '"';

        if (isSelected)
            optStr += ' selected="selected"';
        optStr += '>';
        optStr += String(dispValue);
        optStr += '</option>';
        return optStr;
    }
    function InitDateTime() {
        if (typeof window['g_strDateTimeControlIDs'] == "undefined")
            window['g_strDateTimeControlIDs'] = [];
        window['g_strDateTimeControlIDs']['SP' + _myData.fieldName] = _dateInputId;
        _dateInput = document.getElementById(_dateInputId);
        if (_dateInput != null) {
            AddEvtHandler(_dateInput, "onchange", OnDateTimeValueChanged);
            _dateInput.clientcontrolonvaluesetfrompicker = OnDateTimeValueChanged;
        }
        _hourDropDown = document.getElementById(_hourDropDownId);
        if (_hourDropDown != null)
            AddEvtHandler(_hourDropDown, "onchange", OnDateTimeValueChanged);
        _minuteDropDown = document.getElementById(_minuteDropDownId);
        if (_minuteDropDown != null)
            AddEvtHandler(_minuteDropDown, "onchange", OnDateTimeValueChanged);
    }
    function OnDateTimeValueChanged() {
        _myData.updateControlValue(_myData.fieldName, GetDateTimeValue());
    }
    function GetDateTimeValue() {
        var currentDate = _dateInput != null ? SPClientTemplates.Utility.Trim(_dateInput.value) : '';
        var currentTime = _hourDropDown != null && _minuteDropDown != null ? _hourDropDown.value + _schema.TimeSeparator + _minuteDropDown.value : '';

        return _isDateTime && currentDate == '' ? '' : SPClientTemplates.Utility.Trim(currentDate + " " + currentTime);
    }
}
function SPFieldUrl_Display(rCtx) {
    if (rCtx == null)
        return '';
    var _myData = SPClientTemplates.Utility.GetFormContextForCurrentField(rCtx);

    if (_myData == null || _myData.fieldSchema == null)
        return '';
    var fieldDirection = _myData.fieldSchema.Direction;
    var dirSpan = fieldDirection != null && fieldDirection.toLowerCase() != 'none';
    var dirStart = dirSpan ? '<span dir="' + STSHtmlEncode(fieldDirection) + '">' : '';
    var dirEnd = dirSpan ? '</span>' : '';
    var _value = _myData.fieldValue != null ? _myData.fieldValue : '';
    var urlValue = SPClientTemplates.Utility.ParseURLValue(_value);

    if (_myData.fieldSchema.DisplayFormat == SPClientTemplates.UrlFormatType.Hyperlink) {
        if (urlValue.URL != '' && urlValue.URL != 'http://')
            return dirStart + '<a href="' + STSHtmlEncode(urlValue.URL) + '" target="_blank">' + STSHtmlEncode(urlValue.Description) + '</a>' + dirEnd;
    }
    else if (_myData.fieldSchema.DisplayFormat == SPClientTemplates.UrlFormatType.Image) {
        if (urlValue.URL != '' && urlValue.URL != 'http://')
            return dirStart + '<img src="' + STSHtmlEncode(urlValue.URL) + '" alt="' + STSHtmlEncode(urlValue.Description) + '"/>' + dirEnd;
    }
    return '';
}
function SPFieldUrl_Edit(rCtx) {
    if (rCtx == null)
        return '';
    var _myData = SPClientTemplates.Utility.GetFormContextForCurrentField(rCtx);

    if (_myData == null || _myData.fieldSchema == null)
        return '';
    var _value = _myData.fieldValue != null ? _myData.fieldValue : '';
    var urlValue = SPClientTemplates.Utility.ParseURLValue(_value);
    var _urlValue = urlValue.URL;
    var _descValue = urlValue.Description;
    var _urlInput, _descInput;
    var _idPrefix = _myData.fieldName + '_' + _myData.fieldSchema.Id;
    var _urlInputId = _idPrefix + '_$UrlFieldUrl';
    var _testUrlLinkId = STSHtmlEncode(_idPrefix + '_$UrlControlId');
    var _urlDescriptionInputId = _idPrefix + '_$UrlFieldDescription';
    var _styleStr = _myData.fieldSchema.IMEMode == '' ? '' : 'style="ime-mode : ' + STSHtmlEncode(_myData.fieldSchema.IMEMode) + '" ';
    var validators = new SPClientForms.ClientValidation.ValidatorSet();

    if (_myData.fieldSchema.Required)
        validators.RegisterValidator(new SPClientForms.ClientValidation.RequiredUrlValidator());
    validators.RegisterValidator(new SPClientForms.ClientValidation.MaxLengthUrlValidator(255));
    _myData.registerClientValidator(_myData.fieldName, validators);
    _myData.registerInitCallback(_myData.fieldName, InitControl);
    _myData.registerFocusCallback(_myData.fieldName, function() {
        if (_urlInput != null)
            _urlInput.focus();
    });
    _myData.registerValidationErrorCallback(_myData.fieldName, function(errorResult) {
        SPFormControl_AppendValidationErrorMessage(_urlInputId, errorResult);
    });
    _myData.registerGetValueCallback(_myData.fieldName, GetCurrentValue);
    _myData.updateControlValue(_myData.fieldName, _value);
    var encodedUrlInputId = STSHtmlEncode(_urlInputId);
    var result = "<span dir=\"" + STSHtmlEncode(_myData.fieldSchema.Direction) + "\"><span class=\"ms-formdescription\">";

    result += STSHtmlEncode(Strings.STS.L_UrlFieldTypeText) + "&#160;(<a id=\"" + _testUrlLinkId + "\" ";
    result += "href=\"javascript:TestURL('" + encodedUrlInputId + "')\" target=\"_self\">";
    result += STSHtmlEncode(Strings.STS.L_UrlFieldClickText) + "</a>)<br /></span>";
    result += "<input dir=\"ltr\" type=\"text\" value=\"" + STSHtmlEncode(_urlValue) + "\" id=\"" + encodedUrlInputId + "\" title=\"";
    result += STSHtmlEncode(_myData.fieldSchema.Title) + "\" class=\"ms-long\" " + _styleStr + "/><br />";
    result += "<span class=\"ms-formdescription\">" + STSHtmlEncode(Strings.STS.L_UrlFieldTypeDescription) + "&#160;<br /></span>";
    result += "<input type=\"text\" maxlength=\"";
    result += String(255);
    result += "\" id=\"" + STSHtmlEncode(_urlDescriptionInputId) + "\" title=\"";
    result += STSHtmlEncode(Strings.STS.L_UrlFieldDescriptionTitle) + "\" value=\"" + STSHtmlEncode(_descValue) + "\" class=\"ms-long\" /><br /></span>";
    return result;
    function InitControl() {
        _urlInput = document.getElementById(_urlInputId);
        _descInput = document.getElementById(_urlDescriptionInputId);
        if (_urlInput != null) {
            AddEvtHandler(_urlInput, "onchange", OnValueChanged);
            AddEvtHandler(_urlInput, "onfocus", function() {
                _urlInput.select();
            });
        }
        if (_descInput != null)
            AddEvtHandler(_descInput, "onchange", OnValueChanged);
    }
    function OnValueChanged() {
        _myData.updateControlValue(_myData.fieldName, GetCurrentValue());
    }
    function GetCurrentValue() {
        var currentUrl = _urlInput != null ? SPClientTemplates.Utility.Trim(_urlInput.value) : '';

        if (currentUrl == '' || currentUrl == 'http://')
            return '';
        var currentValue = currentUrl.replace(/\,/g, ',,');

        currentValue += ', ';
        if (_descInput != null)
            currentValue += _descInput.value;
        return currentValue;
    }
}
var g_SPFieldUser_ImnIdx;

function SPFieldUserMulti_Display(rCtx) {
    if (rCtx == null)
        return '';
    var _myData = SPClientTemplates.Utility.GetFormContextForCurrentField(rCtx);

    if (_myData == null || _myData.fieldSchema == null)
        return '';
    var withPicture = _myData.fieldSchema.WithPicture;
    var defaultRender = _myData.fieldSchema.DefaultRender;
    var _entitySeparatorChar = _myData.fieldSchema.EntitySeparator;
    var _value = _myData.fieldValue != null ? _myData.fieldValue : '';
    var _userValues = SPClientTemplates.Utility.TryParseInitialUserValue(_value);

    if (!defaultRender && !withPicture) {
        var userDispUrl = _myData.fieldSchema.UserDisplayUrl;

        if (userDispUrl == null || userDispUrl == '')
            return '';
        var fieldDirection = _myData.fieldSchema.Direction;
        var dirSpan = fieldDirection != null && fieldDirection.toLowerCase() != 'none';
        var dirStart = dirSpan ? '<span dir="' + STSHtmlEncode(fieldDirection) + '">' : '';
        var dirEnd = dirSpan ? '</span>' : '';
        var res = dirStart;
        var bFirst = true;

        for (var p = 0; p < _userValues.length; p++) {
            if (!bFirst)
                res += ';&#160;';
            var uVal = _userValues[p];

            if (uVal.lookupValue != null && uVal.lookupValue != '' && uVal.lookupId != null && uVal.lookupId != '' && parseInt(uVal.lookupId) > -1) {
                res += '<a href="';
                res += STSHtmlEncode(userDispUrl);
                res += '?ID=';
                res += STSHtmlEncode(uVal.lookupId);
                res += '&RootFolder=*">';
                res += STSHtmlEncode(uVal.lookupValue);
                res += '</a>';
                bFirst = false;
            }
        }
        return res + dirEnd;
    }
    return SPFieldUser_Display(rCtx);
}
function SPFieldUser_Display(rCtx) {
    if (rCtx == null)
        return '';
    var _myData = SPClientTemplates.Utility.GetFormContextForCurrentField(rCtx);

    if (_myData == null || _myData.fieldSchema == null)
        return '';
    var withPicture = _myData.fieldSchema.WithPicture;
    var defaultRender = _myData.fieldSchema.DefaultRender;
    var withPictureDetail = _myData.fieldSchema.WithPictureDetail;
    var pictureOnly = _myData.fieldSchema.PictureOnly;
    var _entitySeparatorChar = _myData.fieldSchema.EntitySeparator;
    var renderCallbackFunc = _myData.fieldSchema.RenderCallback;
    var controlMaxWidth = _myData.fieldSchema.MaxWidth;
    var _userSecretValue = '***';
    var _value = _myData.fieldValue != null ? _myData.fieldValue : '';
    var _userValues = SPClientTemplates.Utility.TryParseInitialUserValue(_value);
    var fieldDirection = _myData.fieldSchema.Direction;
    var dirSpan = fieldDirection != null && fieldDirection.toLowerCase() != 'none';
    var dirStart = dirSpan ? '<span dir="' + STSHtmlEncode(fieldDirection) + '">' : '';
    var dirEnd = dirSpan ? '</span>' : '';
    var res = dirStart;
    var bFirst = true;
    var ProfilePicture_Suffix_Small = "_SThumb";
    var ProfilePicture_Suffix_Medium = "_MThumb";
    var ProfilePicture_Suffix_Large = "_LThumb";
    var strPicSize = _myData.fieldSchema.PictureSize;
    var pictureSize = strPicSize != null && strPicSize != 'None' ? strPicSize.substring(5) : null;
    var DefaultPictureSize = "36px";
    var SmallThumbnailThreshold = 48;

    if (!defaultRender && !withPicture) {
        for (var p = 0; p < _userValues.length; p++) {
            if (!bFirst)
                res += ';&#160;';
            bFirst = false;
            res += _userValues[p].lookupValue;
        }
        return res + dirEnd;
    }
    if (defaultRender && !withPicture) {
        var uLength = _userValues.length;

        if (uLength > 1)
            res += '<div>';
        for (var q = 0; q < _userValues.length; q++) {
            if (uLength > 1)
                res += '<div class="ms-vb">';
            var uValue = _userValues[q];

            if (uValue.lookupId == _userSecretValue)
                res += uValue.lookupId;
            else
                res += BuildUserDisplayLink(uValue, _myData.fieldSchema);
        }
        if (uLength > 1)
            res += '</div>';
        return res + dirEnd;
    }
    if (!defaultRender && withPicture) {
        res += '<div>';
        for (var m = 0; m < _userValues.length; m++) {
            var userValue = _userValues[m];

            if (userValue.lookupId == _userSecretValue)
                continue;
            res += '<div class="ms-table ms-core-tableNoSpace"><div class="ms-tableRow">';
            if (pictureSize == null)
                pictureSize = DefaultPictureSize;
            res += '<div class="ms-tableCell ms-verticalAlignTop">';
            res += GetPresence(userValue, _myData.fieldSchema, false);
            res += '</div>';
            res += '<div class="ms-tableCell ms-verticalAlignTop"><div class="ms-peopleux-userImgDiv">';
            res += GetPicture(userValue, _myData.fieldSchema);
            res += '</div></div>';
            if (withPictureDetail) {
                var detailsMaxWidth = 150;

                if (controlMaxWidth != null && typeof controlMaxWidth != 'undefined') {
                    detailsMaxWidth = controlMaxWidth - 10 - parseInt(pictureSize) - 11;
                    if (detailsMaxWidth < 0) {
                        detailsMaxWidth = 0;
                    }
                }
                res += '<div class="ms-tableCell ms-vb-user ms-peopleux-userdetails ms-noList ms-verticalAlignTop"><ul style="max-width:' + String(detailsMaxWidth) + 'px">';
                res += '<li><div class="ms-noWrap">';
                res += BuildUserTitle(userValue, _myData.fieldSchema);
                res += '</div></li>';
                if (renderCallbackFunc != null || typeof renderCallbackFunc != 'undefined') {
                    var result = eval(renderCallbackFunc + '(rCtx);');

                    res += '<li>';
                    res += STSHtmlEncode(result);
                    res += '</li>';
                }
                else if (userValue.jobTitle != null && userValue.jobTitle != '') {
                    var detailLine = userValue.jobTitle;

                    if (userValue.department != null || userValue.department != '')
                        detailLine += ', ' + STSHtmlEncode(userValue.department);
                    res += '<li><div class="ms-metadata ms-textSmall ms-peopleux-detailuserline ms-noWrap" title="' + STSHtmlEncode(detailLine) + '">';
                    res += STSHtmlEncode(detailLine);
                    res += '</div></li>';
                }
                res += '</ul></div>';
            }
            res += '</div></div>';
        }
        res += '</div>';
        return res + dirEnd;
    }
    return res + dirEnd;
    function GetPictureThumbnailUrl(pictureUrl, suffixToReplace) {
        var fileNameWithoutExt = pictureUrl.substr(0, pictureUrl.lastIndexOf("."));

        if (fileNameWithoutExt.endsWith(ProfilePicture_Suffix_Medium)) {
            if (suffixToReplace == ProfilePicture_Suffix_Medium)
                return pictureUrl;
            return pictureUrl.replace(ProfilePicture_Suffix_Medium, suffixToReplace);
        }
        return pictureUrl;
    }
    function GetUserPhotoUrl(value, sizeToRequest) {
        var ret = [];

        ret.push("/_layouts/15/userphoto.aspx");
        ret.push('?accountname=');
        ret.push(encodeURIComponent(value.email));
        ret.push('&size=');
        ret.push(encodeURIComponent(sizeToRequest));
        return ret.join('');
    }
    function GetPicture(value, userSchema) {
        var r = '';
        var userLinkHtml = UserLink(value);

        r += GetPresence(value, userSchema, true);
        r += userLinkHtml.length > 0 ? userLinkHtml : '<span class="ms-peopleux-imgUserLink">';
        r += '<span class="ms-peopleux-userImgWrapper" style="width:' + pictureSize + '; height:' + pictureSize + '">';
        r += '<img class="ms-peopleux-userImg ms-verticalAlignTop" style="min-width:' + pictureSize + '; min-height:' + pictureSize + '; ';
        r += 'clip:rect(0px, ' + pictureSize + ', ' + pictureSize + ', 0px); max-width:' + pictureSize + '" src="';
        var sizeToRequest = pxToNum(pictureSize) < SmallThumbnailThreshold ? 'S' : 'M';

        if (value.picture == null || value.picture == '') {
            if (_spPageContextInfo.crossDomainPhotosEnabled) {
                r += GetUserPhotoUrl(value, sizeToRequest);
            }
            else {
                r += "/_layouts/15/images/person.gif";
            }
            r += '" alt="';
            r += STSHtmlEncode(StBuildParam(Strings.STS.L_UserFieldPictureAlt1, value.title));
            r += '" />';
        }
        else {
            var userPicture = value.picture;

            if (parseInt(pictureSize) <= SmallThumbnailThreshold) {
                userPicture = GetPictureThumbnailUrl(value.picture, ProfilePicture_Suffix_Small);
            }
            if (!_spPageContextInfo.crossDomainPhotosEnabled || userPicture.startsWith('/') || (userPicture.toLowerCase()).startsWith(getHostUrl(window.location.href))) {
                r += userPicture;
            }
            else {
                r += GetUserPhotoUrl(value, sizeToRequest);
            }
            r += '" alt="';
            r += STSHtmlEncode(StBuildParam(Strings.STS.L_UserFieldPictureAlt2, value.title));
            r += '" />';
        }
        r += userLinkHtml.length > 0 ? '</a>' : '</span>';
        return r;
    }
    function UserLink(value) {
        var r = '';

        if (value.lookupValue != null && value.lookupValue != '' && value.lookupId != null && value.lookupId != '' && parseInt(value.lookupId) > -1) {
            var linkClass = 'ms-peopleux-userdisplink ms-subtleLink' + (pxToNum(pictureSize) > 0 ? ' ms-peopleux-imgUserLink' : '');

            r += '<a onclick="GoToLinkOrDialogNewWindow(this); return false;" class="';
            r += linkClass;
            r += '" href="';
            r += STSHtmlEncode(_myData.fieldSchema.ListFormUrl);
            r += '?PageType=4&ListId=';
            r += STSHtmlEncode(_myData.fieldSchema.UserInfoListId);
            r += '&ID=';
            r += STSHtmlEncode(value.lookupId);
            r += '">';
        }
        return r;
    }
    function GetPresence(value, userSchema, fHideImage) {
        var squareJewelSize = SPClientTemplates.PresenceIndicatorSize.Square_10px;
        var imgClassName = "ms-spimn-img";
        var spanClassName = "ms-spimn-presenceWrapper";
        var imnLinkClass = "ms-imnlink";
        var picSize = pictureSize != null ? parseInt(pictureSize) : 0;
        var additionalMarkup = "";
        var wrapperSpanMarkup = "";
        var imnSpanMarkup = "";
        var r = '';

        if (userSchema.Presence) {
            if (fHideImage) {
                spanClassName = (imgClassName = 'ms-hide');
                additionalMarkup = 'tabIndex="-1"';
            }
            else {
                var width = squareJewelSize;
                var height = squareJewelSize;

                if (picSize > 0) {
                    if (picSize == 72) {
                        width = SPClientTemplates.PresenceIndicatorSize.Bar_8px;
                    }
                    else {
                        width = SPClientTemplates.PresenceIndicatorSize.Bar_5px;
                    }
                    height = String(picSize);
                }
                else {
                    spanClassName += " ms-imnImg";
                }
                imgClassName += String.format(' ms-spimn-presence-disconnected-{0}x{1}x32', width, height);
                spanClassName += String.format(' ms-spimn-imgSize-{0}x{1}', width, height);
                wrapperSpanMarkup = String.format('<span class="{0}">', spanClassName);
                imnSpanMarkup = '<span class="ms-imnSpan">';
                imnLinkClass += ' ms-spimn-presenceLink';
            }
            r += imnSpanMarkup + '<a href="#" onclick="IMNImageOnClick(event); return false;" class="' + imnLinkClass + '" ' + additionalMarkup + '>' + wrapperSpanMarkup;
            r += '<img title="" alt="';
            r += STSHtmlEncode(Strings.STS.L_UserFieldNoUserPresenceAlt);
            r += '" name="imnmark" class="' + imgClassName + '" ShowOfflinePawn="1" src=' + '/_layouts/15/images/spimn.png' + ' sip="';
            r += STSHtmlEncode(value.sip);
            r += '" id="imn';
            r += STSHtmlEncode(String(g_SPFieldUser_ImnIdx));
            r += ',type=sip" />' + (wrapperSpanMarkup.length > 0 ? '</span>' : '') + '</a>' + (imnSpanMarkup.length > 0 ? '</span>' : '');
            g_SPFieldUser_ImnIdx++;
        }
        return r;
    }
    function BuildUserTitle(value, userSchema) {
        var r = '';

        r += '<span class="ms-noWrap ms-imnSpan">';
        r += GetPresence(value, userSchema, true);
        r += UserLink(value);
        r += STSHtmlEncode(value.title);
        r += '</a></span>';
        return r;
    }
    function BuildUserDisplayLink(value, userSchema) {
        var r = '';

        r += '<nobr>';
        r += GetPresence(value, userSchema, false);
        r += BuildUserTitle(value, userSchema);
        r += '</nobr>';
        return r;
    }
}
function SPClientPeoplePickerCSRTemplate(rCtx) {
    if (rCtx == null)
        return '';
    var _myData = SPClientTemplates.Utility.GetFormContextForCurrentField(rCtx);

    if (_myData == null || _myData.fieldSchema == null)
        return '';
    var _picker;
    var peoplePickerErrorMsgDefer = null;
    var _editorElt, _topSpanElt, _hiddenInput;
    var _topSpanId = _myData.fieldSchema.ServerContainerId != null ? _myData.fieldSchema.ServerContainerId : _myData.fieldName + '_' + _myData.fieldSchema.Id + '_$ClientPeoplePicker';
    var _editorId = _topSpanId + '_EditorInput';
    var _autoFillDivId = _topSpanId + '_AutoFillDiv';
    var _resolveListId = _topSpanId + '_ResolvedList';
    var _waitImageId = _topSpanId + '_WaitImage';
    var _initialHelpTextId = _topSpanId + '_InitialHelpText';
    var _hiddenInputId = _topSpanId + '_HiddenInput';
    var _hiddenInputName = _myData.fieldSchema.ServerInputName != null ? STSHtmlEncode(_myData.fieldSchema.ServerInputName) : _hiddenInputId;
    var _titleAttr = STSHtmlEncode(_myData.fieldSchema.Title);

    _myData.fieldSchema.TopLevelElementId = _topSpanId;
    _myData.fieldSchema.EditorElementId = _editorId;
    _myData.fieldSchema.AutoFillElementId = _autoFillDivId;
    _myData.fieldSchema.ResolvedListElementId = _resolveListId;
    _myData.fieldSchema.InitialHelpTextElementId = _initialHelpTextId;
    _myData.fieldSchema.WaitImageId = _waitImageId;
    _myData.fieldSchema.HiddenInputId = _hiddenInputId;
    var initialHelpText = Strings.STS.L_SPClientPeoplePickerDefaultHelpText;

    if (_myData.fieldSchema.AllowMultipleValues)
        initialHelpText = Strings.STS.L_SPClientPeoplePickerMultiUserDefaultHelpText;
    var serverHelpText = _myData.fieldSchema.InitialHelpText;

    if (serverHelpText != null && serverHelpText != '')
        initialHelpText = serverHelpText;
    _myData.registerInitCallback(_myData.fieldName, function() {
        EnsurePeoplePickerScript(InitControl);
    });
    _myData.registerFocusCallback(_myData.fieldName, function() {
        if (_editorElt != null)
            _editorElt.focus();
    });
    _myData.registerValidationErrorCallback(_myData.fieldName, function(errorResult) {
        if (_picker != null)
            _picker.ShowErrorMessage(errorResult.errorMessage);
        else
            peoplePickerErrorMsgDefer = errorResult.errorMessage;
    });
    _myData.registerGetValueCallback(_myData.fieldName, function() {
        return _hiddenInput != null ? _hiddenInput.value : '';
    });
    if (_myData.fieldSchema.Required && typeof _myData.registerClientValidator == "function") {
        var validators = new SPClientForms.ClientValidation.ValidatorSet();

        validators.RegisterValidator(new SPClientForms.ClientValidation.RequiredValidator());
        _myData.registerClientValidator(_myData.fieldName, validators);
    }
    var result = '<div dir="' + STSHtmlEncode(_myData.fieldSchema.Direction) + '">';

    result += '<div class="sp-peoplepicker-topLevel" id="' + STSHtmlEncode(_topSpanId) + '" title="' + _titleAttr + '">';
    result += '<input id="' + STSHtmlEncode(_hiddenInputId) + '" name="' + STSHtmlEncode(_hiddenInputName) + '" type="hidden" />';
    result += '<div id="' + STSHtmlEncode(_autoFillDivId) + '" class="sp-peoplepicker-autoFillContainer"></div>';
    result += '<span id="' + STSHtmlEncode(_initialHelpTextId) + '" class="sp-peoplepicker-initialHelpText ';
    result += 'ms-helperText">' + STSHtmlEncode(initialHelpText) + '</span>';
    result += '<img class="sp-peoplepicker-waitImg" id="' + STSHtmlEncode(_waitImageId) + '" alt="';
    result += STSHtmlEncode(Strings.STS.L_SPClientPeoplePickerWaitImgAlt) + '" src=';
    result += '"/_layouts/15/images/gears_anv4.gif"' + '/>';
    result += '<span id="' + STSHtmlEncode(_resolveListId) + '" class="sp-peoplepicker-resolveList"></span>';
    result += '<input type="text" class="sp-peoplepicker-editorInput" size="1" autocomplete="off" value="" ';
    result += 'id="' + STSHtmlEncode(_editorId) + '" title="' + _titleAttr + '" autocorrect="off" autocapitalize="off" /></div>';
    result += '</div></div>';
    if (_myData.fieldSchema.Description != null && _myData.fieldSchema.Description != '')
        result += '<span class="ms-metadata">' + STSHtmlEncode(_myData.fieldSchema.Description) + '</span>';
    return result;
    function InitControl() {
        _topSpanElt = document.getElementById(_topSpanId);
        if (_topSpanElt != null)
            AddEvtHandler(_topSpanElt, "onclick", SPClientPeoplePicker_OnClick);
        _editorElt = document.getElementById(_editorId);
        if (_editorElt != null) {
            AddEvtHandler(_editorElt, "onblur", SPClientPeoplePicker_OnEditorBlur);
            AddEvtHandler(_editorElt, "oncopy", SPClientPeoplePicker_OnEditorCopy);
            AddEvtHandler(_editorElt, "onpaste", SPClientPeoplePicker_OnEditorPaste);
            AddEvtHandler(_editorElt, "onfocus", SPClientPeoplePicker_OnEditorFocus);
            AddEvtHandler(_editorElt, "onkeyup", SPClientPeoplePicker_OnEditorKeyUp);
            AddEvtHandler(_editorElt, "onkeydown", SPClientPeoplePicker_OnEditorKeyDown);
        }
        _hiddenInput = document.getElementById(_hiddenInputId);
        _picker = new SPClientPeoplePicker(_myData.fieldSchema);
        _picker.SetInitialValue(_myData.fieldValue, peoplePickerErrorMsgDefer);
    }
    function EnsurePeoplePickerScript(ensureFn) {
        var ensureContext;

        try {
            ensureContext = typeof SPClientPeoplePicker;
        }
        catch (e) {
            ensureContext = "undefined";
        }
        EnsureScript("clientpeoplepicker.js", ensureContext, ensureFn);
    }
}
function SPClientPeoplePicker_InitStandaloneControlWrapper(clientId, value, schema) {
    var ensureContext;

    try {
        ensureContext = typeof SPClientPeoplePicker;
    }
    catch (e) {
        ensureContext = "undefined";
    }
    EnsureScript("clientpeoplepicker.js", ensureContext, function() {
        SPClientPeoplePicker.InitializeStandalonePeoplePicker(clientId, value, schema);
    });
}
function SPFieldUser_Edit(rCtx) {
    if (rCtx == null)
        return '';
    var _myData = SPClientTemplates.Utility.GetFormContextForCurrentField(rCtx);

    if (_myData == null || _myData.fieldSchema == null)
        return '';
    var _idPrefix = _myData.fieldName + '_' + _myData.fieldSchema.Id + '_$UserField';
    var _userFieldId = _idPrefix;
    var encodedUserFieldId = STSHtmlEncode(_userFieldId);
    var _browseId = _idPrefix + '_browse';
    var _checkNamesId = _idPrefix + '_checkNames';
    var _upLevelDivId = _idPrefix + '_upLevelDiv';
    var _downLevelTextBoxId = _idPrefix + '_downlevelTextBox';
    var _errorLabelId = STSHtmlEncode(_idPrefix + '_errorLabel');
    var _outerTableId = STSHtmlEncode(_idPrefix + '_OuterTable');
    var _containerCellId = STSHtmlEncode(_idPrefix + '_containerCellId');
    var _hiddenSpanDataId = STSHtmlEncode(_idPrefix + '_hiddenSpanData');
    var _hiddenEntityKeyId = STSHtmlEncode(_idPrefix + '_HiddenEntityKey');
    var _originalEntitiesId = STSHtmlEncode(_idPrefix + '_originalEntities');
    var _hiddenUserFieldInputId = STSHtmlEncode(_idPrefix + '_HiddenUserFieldValue');
    var _hiddenEntityDisplayTextId = STSHtmlEncode(_idPrefix + '_HiddenEntityDisplayText');
    var _allowEmpty = _myData.fieldSchema.Required ? '' : '1';
    var _entitySeparatorChar = _myData.fieldSchema.EntitySeparator;
    var _peoplePickerDialogUrl = _myData.fieldSchema.PeoplePickerUrl;
    var _upLevelDiv, _downLevelTextBox;
    var _browseButton, _checkNamesButton;
    var _initialValue = _myData.fieldValue != null ? _myData.fieldValue : '';
    var _hasInitialValue = _initialValue == '' ? '' : 'true';
    var _valueObj = SPClientTemplates.Utility.TryParseInitialUserValue(_initialValue);
    var _builtEntityXml = typeof _valueObj != "string";
    var _originalEntitiesValue = _builtEntityXml ? BuildInitialEntityXml(_valueObj) : '';
    var _displayText = _builtEntityXml ? BuildInitialEditValue(_valueObj) : STSHtmlEncode(_valueObj);
    var _hiddenEntityKeyValue = _displayText;
    var _hiddenEntityDisplayTextValue = _displayText;
    var _hiddenUserFieldInputValue = STSHtmlEncode(_initialValue);
    var _fieldDescription = '';

    if (_myData.fieldSchema.Description != null && _myData.fieldSchema.Description != '')
        _fieldDescription = STSHtmlEncode(_myData.fieldSchema.Description);
    else if (_myData.fieldSchema.AllowMultipleValues)
        _fieldDescription = STSHtmlEncode(Strings.STS.L_UserFieldMultiDescription);
    if (_myData.fieldSchema.Required) {
        var validators = new SPClientForms.ClientValidation.ValidatorSet();

        validators.RegisterValidator(new SPClientForms.ClientValidation.RequiredValidator());
        _myData.registerClientValidator(_myData.fieldName, validators);
    }
    _myData.registerInitCallback(_myData.fieldName, InitPeoplePicker);
    _myData.registerFocusCallback(_myData.fieldName, function() {
        onClickRw(true, true, event, _userFieldId);
    });
    _myData.registerValidationErrorCallback(_myData.fieldName, HandleErrorCallback);
    _myData.registerGetValueCallback(_myData.fieldName, GetPeoplePickerValue);
    _myData.updateControlValue(_myData.fieldName, _initialValue);
    window['L_PleaseWait_TEXT'] = Strings.STS.L_UserFieldPickerDlgShowWait;
    window['EntityEditor_ItemTooLong'] = Strings.STS.L_UserFieldItemNameTooLong;
    window['EntityEditor_UseContentEditableControl'] = browseris.ie55up && !IsAccessibilityFeatureEnabled();
    var downLevelTextAreaStyle = 'width:100%;display: none;position: absolute; ';
    var upLevelDivStyle = 'word-wrap: break-word;overflow-x: hidden; background-color: window; color: windowtext;';

    if (_myData.fieldSchema.AllowMultipleValues)
        upLevelDivStyle += ' overflow-y: auto;';
    var result = "<span dir=\"" + STSHtmlEncode(_myData.fieldSchema.Direction) + "\">";

    result += '<input type="hidden" id="' + _hiddenUserFieldInputId + '" value="' + _hiddenUserFieldInputValue + '" />';
    result += '<span id="' + encodedUserFieldId + '" class="ms-usereditor" editorOldValue="" RemoveText="' + STSHtmlEncode(Strings.STS.L_UserFieldRemoveText) + '" ';
    result += 'value="' + _hasInitialValue + '" NoMatchesText="&lt;' + STSHtmlEncode(Strings.STS.L_UserFieldNoMatchingNames) + '&gt;" allowEmpty="' + _allowEmpty + '" ';
    result += 'MoreItemsText="' + STSHtmlEncode(Strings.STS.L_UserFieldMoreItemsText) + '" preferContentEditableDiv="true" showDataValidationErrorBorder="false" ';
    result += 'EEAfterCallbackClientScript="" inValidate="false" allowTypeIn="true" ShowEntityDisplayTextInTextBox="0">';
    result += '<input type="hidden" id="' + _hiddenSpanDataId + '" /><input type="hidden" id="' + _originalEntitiesId + '" value="" />';
    result += '<input type="hidden" id="' + _hiddenEntityKeyId + '" value="' + _hiddenEntityKeyValue + '"/>';
    result += '<input type="hidden" id="' + _hiddenEntityDisplayTextId + '" value="' + _hiddenEntityDisplayTextValue + '" />';
    result += '<table id="' + _outerTableId + '" class="ms-usereditor" cellspacing="0" cellpadding="0" style="border-collapse:collapse;"><tr valign="bottom">';
    result += '<td valign="top" style="width:88%;"><table cellpadding="0" cellspacing="0" style="width:100%;table-layout:fixed;"><tr>';
    result += '<td id="' + _containerCellId + '"><div id="' + STSHtmlEncode(_upLevelDivId) + '" tabindex="0" AutoPostBack="0" rows="1" title="';
    result += STSHtmlEncode(Strings.STS.L_UserFieldPeoplePickerTitle) + '" onclick="onClickRw(true, true, event, \'' + encodedUserFieldId + '\');" ';
    result += 'onPaste="dopaste(\'' + encodedUserFieldId + '\', event);" onDragStart="canEvt(event);" onCopy="docopy(\'' + encodedUserFieldId + '\', event);" ';
    result += 'onkeydown="return onKeyDownRw(\'' + encodedUserFieldId + '\', 3, true, event);" style="' + upLevelDivStyle + '" ';
    result += 'aria-multiline="true" contentEditable="true" aria-haspopup="true" class="ms-inputuserfield" ';
    result += 'preferContentEditableDiv="true" name="upLevelDiv" role="textbox">' + _displayText + '</div>';
    result += '<textarea rows="1" cols="20" id="' + STSHtmlEncode(_downLevelTextBoxId) + '" class="ms-inputuserfield" AutoPostBack="0" ';
    result += 'onkeydown="return onKeyDownRw(\'' + encodedUserFieldId + '\', 3, true, event);" style="' + downLevelTextAreaStyle + '" ';
    result += 'title="' + STSHtmlEncode(Strings.STS.L_UserFieldPeoplePickerTitle) + '" renderAsContentEditableDiv="true"></textarea></td></tr></table></td>';
    result += '<td align="center" valign="top" nowrap="true" style="padding-left:5px;padding-right:5px;"><a id="' + STSHtmlEncode(_checkNamesId) + '" ';
    result += 'title="' + STSHtmlEncode(Strings.STS.L_UserFieldCheckNamesTitleText) + '" href="javascript:">';
    result += '<img title="' + STSHtmlEncode(Strings.STS.L_UserFieldCheckNamesTitleText) + '"' + 'src="/_layouts/15/images/checknames.png"';
    result += 'alt="' + STSHtmlEncode(Strings.STS.L_UserFieldCheckNamesTitleText) + '" /></a>&#160;<a id="' + STSHtmlEncode(_browseId) + '" ';
    result += 'title="' + STSHtmlEncode(Strings.STS.L_UserFieldBrowseTitleText) + '" href="javascript:">';
    result += '<img title="' + STSHtmlEncode(Strings.STS.L_UserFieldBrowseTitleText) + '"' + 'src="/_layouts/15/images/addressbook.gif"';
    result += 'alt="' + STSHtmlEncode(Strings.STS.L_UserFieldBrowseTitleText) + '" /></a></td></tr>';
    result += '<tr><td colspan="3"><span id="' + _errorLabelId + '" class="ms-formvalidation"></span></td></tr>';
    result += '<tr><td colspan="3"><span style="font-size: 8pt;">' + _fieldDescription + '</span>';
    result += '</td></tr></table></span></span>';
    return result;
    function InitPeoplePicker() {
        _browseButton = document.getElementById(_browseId);
        _checkNamesButton = document.getElementById(_checkNamesId);
        _upLevelDiv = document.getElementById(_upLevelDivId);
        _downLevelTextBox = document.getElementById(_downLevelTextBoxId);
        if (_browseButton != null)
            AttachEvent("click", OnClickBrowse, _browseButton);
        if (_checkNamesButton != null)
            AttachEvent("click", function() {
                OnClickCheckNames();
                return false;
            }, _checkNamesButton);
        if (_upLevelDiv != null) {
            AttachEvent("focusout", PeoplePickerOnFocusOut, _upLevelDiv);
            AttachEvent("keyup", function() {
                return onKeyUpRw(_userFieldId);
            }, _upLevelDiv);
            AttachEvent("change", function() {
                updateControlValue(_userFieldId);
            }, _upLevelDiv);
            AttachEvent("focusin", function() {
                StoreOldValue(_userFieldId);
                saveOldEntities(_userFieldId);
            }, _upLevelDiv);
        }
        if (_downLevelTextBox != null) {
            AttachEvent("blur", PeoplePickerOnFocusOut, _downLevelTextBox);
            AttachEvent("keyup", function() {
                return onKeyUpRw(_userFieldId);
            }, _downLevelTextBox);
            AttachEvent("focus", function() {
                StoreOldValue(_userFieldId);
                saveOldEntities(_userFieldId);
            }, _downLevelTextBox);
            AttachEvent("change", function() {
                updateControlValue(_userFieldId);
            }, _downLevelTextBox);
        }
        if (_builtEntityXml)
            EntityEditorCallback(_originalEntitiesValue, _idPrefix, true);
        PickerAdjustHeight(_idPrefix, 3);
        window['__Dialog__' + _idPrefix] = OnClickBrowse;
    }
    function GetPeoplePickerValue() {
        var pickerControl = GetPickerControl(_idPrefix);

        if (pickerControl == null)
            return "";
        if (!PreferContentEditableDiv(_idPrefix) && !EntityEditor_UseContentEditableControl)
            return _downLevelTextBox == null ? '' : SPClientTemplates.Utility.Trim(_downLevelTextBox.value);
        var value = '';
        var delimiter = _entitySeparatorChar + ' ';
        var displayValue = GetPickerControlValue(_idPrefix, true, true);
        var displayKeys = displayValue.split(_entitySeparatorChar);
        var resolvedKeys = GetPickerControlValueResolvedKeyPairs(_idPrefix);
        var dIdx, rIdx;
        var resLen = resolvedKeys.length;
        var dispLen = displayKeys.length;

        for (dIdx = 0, rIdx = 0; dIdx < dispLen && rIdx < resLen; dIdx++) {
            var trimDispKey = SPClientTemplates.Utility.Trim(displayKeys[dIdx]);

            if (trimDispKey == '')
                continue;
            var trimResKey = SPClientTemplates.Utility.Trim(resolvedKeys[rIdx].title);

            if (trimResKey == trimDispKey)
                value += resolvedKeys[rIdx++].toString();
            else
                value += trimDispKey;
            value += delimiter;
        }
        for (; dIdx < dispLen; dIdx++) {
            var trimmedStr = SPClientTemplates.Utility.Trim(displayKeys[dIdx]);

            if (trimmedStr != '')
                value += trimmedStr + delimiter;
        }
        return value != null ? value : '';
    }
    function GetPickerControlValueResolvedKeyPairs(ctxParam) {
        var resultUsers = [];
        var pickerControl = GetPickerControl(ctxParam);

        if (pickerControl == null)
            return resultUsers;
        var children = pickerControl.childNodes;
        var childrenLength = children.length;

        for (var idx = 0; idx < childrenLength; idx++) {
            var entityNode = children[idx];

            if (entityNode.nodeType != 3 && entityNode.getAttribute('isContentType') != null) {
                var entityChildren = entityNode.childNodes;
                var entityChildrenLength = entityChildren.length;

                for (var chIdx = 0; chIdx < entityChildrenLength; chIdx++) {
                    var entityDiv = entityChildren[chIdx];

                    if (entityDiv.tagName.toLowerCase() == 'div' && entityDiv.id == 'divEntityData') {
                        if (entityDiv.getAttribute('key') != null && entityDiv.getAttribute('isresolved') == "True") {
                            var childDiv = entityDiv.firstChild;

                            if (childDiv != null) {
                                var user = new SPClientFormUserValue();

                                user.initFromEntityXml(childDiv.getAttribute('data'));
                                user.lookupValue = entityDiv.getAttribute('key');
                                user.title = entityDiv.getAttribute('displaytext');
                                if (user != null)
                                    resultUsers.push(user);
                            }
                        }
                    }
                }
            }
        }
        return resultUsers;
    }
    function PeoplePickerOnFocusOut() {
        _myData.updateControlValue(_myData.fieldName, GetPeoplePickerValue());
        if (typeof ExternalCustomControlCallback == "function") {
            if (ShouldCallCustomCallBack(_userFieldId, event)) {
                if (!ValidatePickerControl(_userFieldId)) {
                    ShowValidationError();
                    return false;
                }
                else {
                    ExternalCustomControlCallback(_userFieldId);
                }
            }
        }
        return true;
    }
    function OnClickBrowse(defaultSearch) {
        if (defaultSearch == null)
            defaultSearch = '';
        var dialogUrl = _peoplePickerDialogUrl + '&DefaultSearch=' + escapeProperly(defaultSearch);
        var options = {
            width: 575,
            height: 500,
            resizeable: true,
            url: dialogUrl,
            dialogReturnValueCallback: BrowseCallback
        };
        var rv = EnsureScriptParams("SP.UI.Dialog.js", "SP.UI.ModalDialog.showModalDialog", options);

        function BrowseCallback(dialogResult, xml) {
            if (xml == null)
                return;
            EntityEditorCallback(xml, _idPrefix);
            RunCustomScriptSetForPickerControl(_idPrefix);
        }
    }
    function OnClickCheckNames() {
        if (!ValidatePickerControl(_idPrefix)) {
            ShowValidationError();
            return;
        }
        var userValue = GetPeoplePickerValue();

        EntityEditorSetWaitCursor(_idPrefix);
        var ctxs = InitContext(OnSucceededCheckNames, OnFailedCheckNames);
        var scope = new SP.ExceptionHandlingScope(ctxs.context);
        var scopeDispose = scope.startScope();
        var xml = SP.Utilities.Utility.resolvePrincipalToEntityXml(ctxs.context, ctxs.web, ctxs.field, userValue, _entitySeparatorChar);

        scopeDispose.dispose();
        ctxs.context.executeQueryAsync();
        function OnFailedCheckNames() {
            var resolveFailure = {
                validationError: true,
                errorMessage: Strings.STS.L_UserFieldFailCheckNames
            };

            HandleErrorCallback(resolveFailure);
        }
        function OnSucceededCheckNames() {
            if (xml == null || !xml.m_value || xml.m_value == '')
                return;
            EntityEditorHandleCheckNameResult(xml.m_value, _idPrefix);
            RunCustomScriptSetForPickerControl(_idPrefix);
            _myData.updateControlValue(_myData.fieldName, GetPeoplePickerValue());
        }
        function InitContext(fnOnSucceded, fnOnFailed) {
            var context = SPClientTemplates.Utility.InitContext(_myData.webAttributes.WebUrl);

            context.add_requestSucceeded(function(source, eventArgs) {
                setTimeout(function() {
                    fnOnSucceded(source, eventArgs);
                }, 0);
            });
            context.add_requestFailed(function(source, eventArgs) {
                setTimeout(function() {
                    fnOnFailed(source, eventArgs);
                }, 0);
            });
            var web = context.get_web();

            if (_myData.fieldSchema.ResolveSPField) {
                var list = (web.get_lists()).getById(_myData.listAttributes.Id);
                var field = (list.get_fields()).getById(_myData.fieldSchema.Id);
            }
            return {
                context: context,
                web: web,
                list: list,
                field: field
            };
        }
    }
    function HandleErrorCallback(errorResult) {
        var errorStr = '';

        if (typeof errorResult == "string")
            errorStr = errorResult;
        else if (errorResult != null && typeof errorResult.errorMessage == "string")
            errorStr = errorResult.errorMessage;
        if (errorStr.indexOf('<Entities') != -1) {
            EntityEditorHandleCheckNameResult(errorStr, _idPrefix);
            RunCustomScriptSetForPickerControl(_idPrefix);
        }
        else
            EntityEditorHandleCheckNameError(errorStr, _idPrefix);
    }
    function BuildInitialEditValue(editValueObj) {
        var uValueStr = '';

        for (var n = 0; n < editValueObj.length; n++) {
            var uEditValue = editValueObj[n];
            var curUserValue = uEditValue.title == '' ? uEditValue.displayStr : uEditValue.title;
            var curUserValueNonEmpty = curUserValue != '';

            uValueStr += curUserValue;
            if (curUserValueNonEmpty)
                uValueStr += _entitySeparatorChar + ' ';
        }
        return STSHtmlEncode(uValueStr);
    }
    function BuildInitialEntityXml(eValueObj) {
        var uValueStr = '<Entities Append="False" Error="" DoEncodeErrorMessage="True" MaxHeight="3" Separator="';

        uValueStr += _entitySeparatorChar;
        uValueStr += '" >';
        for (var n = 0; n < eValueObj.length; n++) {
            var uEditValue = eValueObj[n];

            uValueStr += uEditValue.toEntityXml();
        }
        uValueStr += '</Entities>';
        return uValueStr;
    }
}
function SPFieldLookup_Display(rCtx) {
    if (rCtx == null)
        return '';
    var _myData = SPClientTemplates.Utility.GetFormContextForCurrentField(rCtx);

    if (_myData == null || _myData.fieldSchema == null)
        return '';
    var value = _myData.fieldValue;

    if (value == null || value == '')
        return '';
    var bFirst = true;
    var dependentLookup = _myData.fieldSchema.DependentLookup;
    var lookupDelimit = '; ';
    var dispFormUrl = _myData.fieldSchema.BaseDisplayFormUrl;
    var encodedLookupListId = STSHtmlEncode(_myData.fieldSchema.LookupListId);
    var fieldDirection = _myData.fieldSchema.Direction;
    var dirSpan = fieldDirection != null && fieldDirection.toLowerCase() != 'none';
    var dirStart = dirSpan ? '<span dir="' + STSHtmlEncode(fieldDirection) + '">' : '';
    var dirEnd = dirSpan ? '</span>' : '';
    var result = dirStart;
    var _selectedValues = [];

    if (_myData.fieldSchema.AllowMultipleValues)
        _selectedValues = SPClientTemplates.Utility.ParseMultiLookupValues(value);
    else
        _selectedValues.push(SPClientTemplates.Utility.ParseLookupValue(value));
    for (var lookupIdx = 0; lookupIdx < _selectedValues.length; lookupIdx++) {
        var lValue = _selectedValues[lookupIdx];

        if (lValue.LookupId == '0')
            continue;
        if (!bFirst)
            result += lookupDelimit;
        bFirst = false;
        if (!dependentLookup) {
            result += '<a href="';
            result += dispFormUrl;
            result += '&ListId=';
            result += encodedLookupListId;
            result += '&ID=';
            result += STSHtmlEncode(lValue.LookupId);
            result += '&RootFolder=*">';
        }
        result += STSHtmlEncode(lValue.LookupValue);
        if (!dependentLookup) {
            result += '</a>';
        }
    }
    return result + dirEnd;
}
function SPFieldLookup_Edit(rCtx) {
    if (rCtx == null)
        return '';
    var _myData = SPClientTemplates.Utility.GetFormContextForCurrentField(rCtx);

    if (_myData == null || _myData.fieldSchema == null)
        return '';
    if (_myData.fieldSchema.Throttled) {
        var maxThrottleResult = String(_myData.fieldSchema.MaxQueryResult);
        var throttleErrorMessage = _myData.fieldSchema.Required ? STSHtmlEncode(StBuildParam(Strings.STS.L_LookupFieldRequiredLookupThrottleMessage, maxThrottleResult)) : STSHtmlEncode(StBuildParam(Strings.STS.L_LookupFieldLookupThrottleMessage, maxThrottleResult));
        var result = '<span style="vertical-align:middle">';

        result += throttleErrorMessage;
        result += '</span>';
        return result;
    }
    if (_myData.fieldSchema.Required) {
        var validators = new SPClientForms.ClientValidation.ValidatorSet();

        validators.RegisterValidator(new SPClientForms.ClientValidation.RequiredValidator());
        _myData.registerClientValidator(_myData.fieldName, validators);
    }
    if (_myData.fieldSchema.AllowMultipleValues)
        return SPFieldLookupMulti_Edit(rCtx);
    return SPFieldLookup_DropDown_Edit(rCtx);
}
function SPFieldLookup_DropDown_Edit(rCtx) {
    if (rCtx == null)
        return '';
    var _myData = SPClientTemplates.Utility.GetFormContextForCurrentField(rCtx);

    if (_myData == null || _myData.fieldSchema == null)
        return '';
    var _dropdownElt;
    var _dropdownId = _myData.fieldName + '_' + _myData.fieldSchema.Id + '_$LookupField';
    var _valueStr = _myData.fieldValue != null ? _myData.fieldValue : '';
    var _selectedValue = SPClientTemplates.Utility.ParseLookupValue(_valueStr);
    var _noValueSelected = _selectedValue.LookupId == '0';

    if (_noValueSelected)
        _valueStr = '';
    var _optionsDictionary = {};
    var _optionsArray = _myData.fieldSchema.Choices;

    _myData.registerInitCallback(_myData.fieldName, InitLookupControl);
    _myData.registerFocusCallback(_myData.fieldName, function() {
        if (_dropdownElt != null)
            _dropdownElt.focus();
    });
    _myData.registerValidationErrorCallback(_myData.fieldName, function(errorResult) {
        SPFormControl_AppendValidationErrorMessage(_dropdownId, errorResult);
    });
    _myData.registerGetValueCallback(_myData.fieldName, GetCurrentLookupValue);
    _myData.updateControlValue(_myData.fieldName, _valueStr);
    return BuildLookupDropdownControl();
    function InitLookupControl() {
        _dropdownElt = document.getElementById(_dropdownId);
        if (_dropdownElt != null)
            AddEvtHandler(_dropdownElt, "onchange", OnLookupValueChanged);
    }
    function OnLookupValueChanged() {
        if (_dropdownElt != null)
            _myData.updateControlValue(_myData.fieldName, GetCurrentLookupValue());
    }
    function GetCurrentLookupValue() {
        if (_dropdownElt == null)
            return '';
        return _dropdownElt.value == '0' || _dropdownElt.value == '' ? '' : _dropdownElt.value + ';#' + _optionsDictionary[_dropdownElt.value];
    }
    function BuildLookupDropdownControl() {
        var result = '<span dir="' + STSHtmlEncode(_myData.fieldSchema.Direction) + '">';

        result += '<select id="' + STSHtmlEncode(_dropdownId) + '" title="' + STSHtmlEncode(_myData.fieldSchema.Title) + '">';
        if (!_myData.fieldSchema.Required && _optionsArray.length > 0) {
            var noneOptSelectedStr = _noValueSelected ? 'selected="selected" ' : '';

            result += '<option ' + noneOptSelectedStr + 'value="0">' + STSHtmlEncode(Strings.STS.L_LookupFieldNoneOption) + '</option>';
        }
        for (var choiceIdx = 0; choiceIdx < _optionsArray.length; choiceIdx++) {
            _optionsDictionary[_optionsArray[choiceIdx].LookupId] = _optionsArray[choiceIdx].LookupValue;
            var curValueSelected = !_noValueSelected && _selectedValue.LookupId == _optionsArray[choiceIdx].LookupId;
            var curValueSelectedStr = curValueSelected ? 'selected="selected" ' : '';

            result += '<option ' + curValueSelectedStr + 'value="' + STSHtmlEncode(_optionsArray[choiceIdx].LookupId) + '">';
            result += STSHtmlEncode(_optionsArray[choiceIdx].LookupValue) + '</option>';
        }
        result += '</select><br/></span>';
        return result;
    }
}
function SPFieldLookupMulti_Edit(rCtx) {
    if (rCtx == null)
        return '';
    var _myData = SPClientTemplates.Utility.GetFormContextForCurrentField(rCtx);

    if (_myData == null || _myData.fieldSchema == null)
        return '';
    var _prefixId = _myData.fieldName + '_' + _myData.fieldSchema.Id;
    var _pickerPrefixId = _prefixId + '_MultiLookup';
    var _topTableId = _pickerPrefixId + '_topTable';
    var _hiddenDataId = _pickerPrefixId + '_data';
    var _hiddenInitialId = _pickerPrefixId + '_initial';
    var _optionsDictionary = {};
    var _optionsArray = _myData.fieldSchema.Choices;
    var _optionsStr = SPClientTemplates.Utility.BuildLookupValuesAsString(_optionsArray, true, true);
    var optsLength = _optionsArray.length;

    for (var multiPickerIdx = 0; multiPickerIdx < optsLength; multiPickerIdx++)
        _optionsDictionary[_optionsArray[multiPickerIdx].LookupId] = _optionsArray[multiPickerIdx].LookupValue;
    var _globalMasterGroup;
    var _globalVariableId = _pickerPrefixId + '_m';
    var _addButtonId = _prefixId + '_AddButton';
    var _removeButtonId = _prefixId + '_RemoveButton';
    var _selectResultId = _prefixId + '_SelectResult';
    var _selectCandidateId = _prefixId + '_SelectCandidate';
    var _addButtonElt, _removeButtonElt;
    var _selectResultElt, _selectCandidateElt;
    var _pickerInputElt, _hiddenDataElt, _hiddenInitialElt;
    var _valueStr = _myData.fieldValue != null ? _myData.fieldValue : '';
    var _currentValues = SPClientTemplates.Utility.ParseMultiLookupValues(_valueStr);
    var _initialValue = SPClientTemplates.Utility.BuildLookupValuesAsString(_currentValues, true, false);

    _myData.registerInitCallback(_myData.fieldName, InitMultiLookupControl);
    _myData.registerFocusCallback(_myData.fieldName, function() {
        if (_selectCandidateElt != null)
            _selectCandidateElt.focus();
    });
    _myData.registerValidationErrorCallback(_myData.fieldName, function(errorResult) {
        SPFormControl_AppendValidationErrorMessage(_topTableId, errorResult);
    });
    _myData.registerGetValueCallback(_myData.fieldName, GetMultiPickerInputValue);
    _myData.updateControlValue(_myData.fieldName, _initialValue);
    return BuildMultiLookupControl();
    function InitMultiLookupControl() {
        function _InitControl() {
            if (typeof window[_globalVariableId] == "undefined")
                window[_globalVariableId] = new MasterGroup();
            _globalMasterGroup = window[_globalVariableId];
            _pickerInputElt = document.getElementById(_pickerPrefixId);
            _hiddenDataElt = document.getElementById(_hiddenDataId);
            _hiddenInitialElt = document.getElementById(_hiddenInitialId);
            _addButtonElt = document.getElementById(_addButtonId);
            if (_addButtonElt != null)
                AddEvtHandler(_addButtonElt, "onclick", function() {
                    return ClientAddSelectedItems();
                });
            _removeButtonElt = document.getElementById(_removeButtonId);
            if (_removeButtonElt != null)
                AddEvtHandler(_removeButtonElt, "onclick", function() {
                    return ClientRemoveSelectedItems();
                });
            _selectResultElt = document.getElementById(_selectResultId);
            if (_selectResultElt != null) {
                AddEvtHandler(_selectResultElt, "ondblclick", function() {
                    return ClientRemoveSelectedItems();
                });
                AddEvtHandler(_selectResultElt, "onchange", function() {
                    GipSelectResultItems(_globalMasterGroup);
                });
            }
            _selectCandidateElt = document.getElementById(_selectCandidateId);
            if (_selectCandidateElt != null) {
                AddEvtHandler(_selectCandidateElt, "ondblclick", function() {
                    return ClientAddSelectedItems();
                });
                AddEvtHandler(_selectCandidateElt, "onchange", function() {
                    GipSelectCandidateItems(_globalMasterGroup);
                });
            }
            GipInitializeGroup(_globalMasterGroup, '', _selectCandidateId, _selectResultId, '', _addButtonId, _removeButtonId, _hiddenDataId, _hiddenInitialId, _pickerPrefixId, 0, true, true);
        }
        ExecuteOrDelayUntilScriptLoaded(_InitControl, 'groupeditempicker.js');
    }
    function OnMultiLookupValueChanged() {
        if (_pickerInputElt != null)
            _myData.updateControlValue(_myData.fieldName, GetMultiPickerInputValue());
    }
    function GetMultiPickerInputValue() {
        if (_pickerInputElt == null || typeof GipSplit == "undefined")
            return '';
        var selValueStr = '';
        var selValues = GipSplit(_pickerInputElt.value);

        for (var selValueIdx = 0; selValueIdx + 1 < selValues.length; selValueIdx++) {
            if (selValueStr != '')
                selValueStr += ';#';
            selValueStr += selValues[selValueIdx++];
            selValueStr += ';#';
            selValueStr += selValues[selValueIdx].replace(/;/g, ";;");
        }
        return selValueStr;
    }
    function ClientAddSelectedItems() {
        GipAddSelectedItems(_globalMasterGroup);
        OnMultiLookupValueChanged();
        return false;
    }
    function ClientRemoveSelectedItems() {
        GipRemoveSelectedItems(_globalMasterGroup);
        OnMultiLookupValueChanged();
        return false;
    }
    function BuildMultiLookupControl() {
        var mlTitle = _myData.fieldSchema.Title;
        var result = '<span dir="' + STSHtmlEncode(_myData.fieldSchema.Direction) + '">';

        result += '<input id="' + STSHtmlEncode(_pickerPrefixId) + '" type="hidden" />';
        result += '<input id="' + STSHtmlEncode(_hiddenDataId) + '" type="hidden" value="' + STSHtmlEncode(_optionsStr) + '" />';
        result += '<input id="' + STSHtmlEncode(_hiddenInitialId) + '" type="hidden" value="' + STSHtmlEncode(_initialValue) + '" />';
        result += '<table id="' + STSHtmlEncode(_topTableId) + '" class="ms-long" cellpadding="0" cellspacing="0" border="0"><tr>';
        result += '<td class="ms-input"><select id="' + STSHtmlEncode(_selectCandidateId) + '" multiple="multiple" ';
        result += 'title="' + STSHtmlEncode(StBuildParam(Strings.STS.L_LookupMultiFieldCandidateAltText, mlTitle)) + '" ';
        var widthUsed = Boolean(_myData.fieldSchema.UseMinWidth) ? "min-width" : "width";

        result += 'style="' + widthUsed + ':143px; height:125px; overflow:scroll;"></select></td>';
        result += '<td style="padding-left:10px">';
        result += '<td align="center" valign="middle" class="ms-input ms-noWrap">';
        result += '<input type="button" id="' + STSHtmlEncode(_addButtonId) + '" class="ms-ButtonHeightWidth" value="';
        result += STSHtmlEncode(Strings.STS.L_LookupMultiFieldAddButtonText) + ' &gt;" /><br /><br />';
        result += '<input type="button" id="' + STSHtmlEncode(_removeButtonId) + '" class="ms-ButtonHeightWidth" value="&lt; ';
        result += STSHtmlEncode(Strings.STS.L_LookupMultiFieldRemoveButtonText) + '" /></td>';
        result += '<td style="padding-left:10px"><td class="ms-input">';
        result += '<select id="' + STSHtmlEncode(_selectResultId) + '" multiple="multiple" ';
        result += 'title="' + STSHtmlEncode(StBuildParam(Strings.STS.L_LookupMultiFieldResultAltText, mlTitle)) + '" ';
        result += 'style="' + widthUsed + ':143px;height:125px;overflow:scroll;"></select>';
        result += '</td></tr></table></span>';
        return result;
    }
}
function SPFieldAttachments_Default(rCtx) {
    if (rCtx == null)
        return '';
    var _myData = SPClientTemplates.Utility.GetFormContextForCurrentField(rCtx);

    if (_myData == null || _myData.fieldSchema == null || _myData.fieldValue == null)
        return '';
    var _attachmentsRemove;
    var attachmentsRemoveId = 'attachmentsToBeRemovedFromServer';

    _myData.registerInitCallback(_myData.fieldName, function() {
        if (typeof ShowAttachmentRows == "function")
            ShowAttachmentRows();
    });
    _myData.registerHasValueChangedCallback(_myData.fieldName, HasAttachmentsValueChanged);
    var result = '';

    result += '<table border="0" cellpadding="0" cellspacing="0" id="idAttachmentsTable">';
    if (_myData.fieldValue != '') {
        var allAttachments = _myData.fieldValue.Attachments;
        var encodedUrlPrefix = STSHtmlEncode(_myData.fieldValue.UrlPrefix);
        var encodedDeleteText = STSHtmlEncode(Strings.STS.L_DeleteVersion_Text);

        for (var i = 0; i < allAttachments.length; i++) {
            var attachmentInfo = allAttachments[i];
            var encodedFileName = STSHtmlEncode(attachmentInfo.FileName);
            var encodedRedirectUrl = STSHtmlEncode(attachmentInfo.RedirectUrl);
            var encodedAttachmentId = STSHtmlEncode(attachmentInfo.AttachmentId);
            var encodedFileTypeProgId = STSHtmlEncode(attachmentInfo.FileTypeProgId);

            if (encodedFileTypeProgId == '')
                encodedFileTypeProgId = 'null';
            var defaultItemOpen = _myData.listAttributes.DefaultItemOpen ? '1' : '0';

            result += '<tr id="';
            result += encodedAttachmentId;
            result += '"><td class="ms-vb"><span dir="ltr">';
            result += '<a tabindex="1" onmousedown="return VerifyHref(this, event, \'';
            result += defaultItemOpen;
            result += '\', \'';
            result += encodedFileTypeProgId;
            result += '\', \'';
            result += encodedRedirectUrl;
            result += '\'); return false;" onclick="DispDocItemExWithServerRedirect(this, event, \'FALSE\', \'FALSE\', \'FALSE\', \'';
            result += encodedFileTypeProgId;
            result += '\', \'';
            result += defaultItemOpen;
            result += '\', \'';
            result += encodedRedirectUrl;
            result += '\'); return false;" href="';
            result += encodedUrlPrefix;
            result += encodedFileName;
            result += '">';
            result += encodedFileName;
            result += '</a></span></td>';
            if (_myData.controlMode == SPClientTemplates.ClientControlMode.EditForm) {
                result += '<td class="ms-propertysheet"><img alt="';
                result += encodedDeleteText;
                result += '" src="';
                result += "/_layouts/15/images/rect.gif";
                result += '">&nbsp;<a tabindex="1" href="javascript:void(0)" ';
                result += 'onclick="RemoveAttachmentFromServer(\'';
                result += encodedAttachmentId;
                result += '\', 1); return false;">&nbsp;';
                result += encodedDeleteText;
                result += '</a></td>';
            }
            result += '</tr>';
        }
    }
    result += '</table>';
    var uploadControlPlaceholder = document.getElementById('csrAttachmentUploadDiv');

    if (uploadControlPlaceholder != null && (_myData.controlMode == SPClientTemplates.ClientControlMode.NewForm || _myData.controlMode == SPClientTemplates.ClientControlMode.EditForm))
        uploadControlPlaceholder.innerHTML = BuildAttachmentsUploadControl();
    return result;
    function BuildAttachmentsUploadControl() {
        var encodedName = STSHtmlEncode(Strings.STS.L_FileUploadToolTip_text);
        var upload = '';

        upload += '<input type="hidden" name="';
        upload += attachmentsRemoveId;
        upload += '"/><input type="hidden" name="RectGifUrl" value="';
        upload += "/_layouts/15/images/rect.gif";
        upload += '"/>';
        upload += '<span id="partAttachment" style="display:none">';
        upload += '<table cellspacing="0" cellpadding="0" border="0" width="100%">';
        upload += '<tbody><tr><td class="ms-descriptiontext" style="padding-bottom: 8px;" colspan="4" valign="top">';
        upload += STSHtmlEncode(Strings.STS.L_AttachmentsUploadDescription);
        upload += '</td></tr><tr><td width="190px" class="ms-formlabel" valign="top" height="50px">';
        upload += encodedName;
        upload += '</td><td class="ms-formbody" valign="bottom" height="15" id="attachmentsOnClient">';
        upload += '<span dir="ltr"><input type="file" name="fileupload0" id="onetidIOFile" class="ms-fileinput" size="56" title="';
        upload += encodedName;
        upload += '" /></span></td></tr><tr><td class="ms-formline" colspan="4" height="1"></td>';
        upload += '</tr><tr><td colspan="4" height="10"></td></tr><tr>';
        upload += '<td class="ms-attachUploadButtons" colspan="4">';
        upload += '<input class="ms-ButtonHeightWidth" id="attachOKbutton" type="button" onclick="OkAttach()" value="';
        upload += STSHtmlEncode(Strings.STS.L_OkButtonCaption);
        upload += '"/>';
        upload += '<span id="idSpace" class="ms-SpaceBetButtons"></span>';
        upload += '<input class="ms-ButtonHeightWidth" id="attachCancelButton" type="button" onclick="CancelAttach()" value="';
        upload += STSHtmlEncode(Strings.STS.L_CancelButtonCaption);
        upload += '" accesskey="';
        upload += STSHtmlEncode(Strings.STS.L_SelectForeColorKey_TEXT);
        upload += '" /></td></tr></tbody></table></span>';
        return upload;
    }
    function HasAttachmentsValueChanged() {
        if (typeof FileUploadLocalFileCount != "undefined" && FileUploadLocalFileCount > 0)
            return true;
        if (_attachmentsRemove == null)
            _attachmentsRemove = (document.getElementsByName(attachmentsRemoveId))[0];
        if (_attachmentsRemove != null && _attachmentsRemove.value != '')
            return true;
        return false;
    }
}
function SPFormControl_AppendValidationErrorMessage(nodeId, errorResult) {
    var errorSpanId = 'Error_' + nodeId;
    var span = document.getElementById(errorSpanId);

    if (span != null && span.parentNode != null)
        span.parentNode.removeChild(span);
    if (!errorResult.validationError)
        return;
    var inputElt = document.getElementById(nodeId);

    if (inputElt == null || inputElt.parentNode == null)
        return;
    var errorSpan = document.createElement("SPAN");

    errorSpan.id = errorSpanId;
    errorSpan.className = 'ms-formvalidation ms-csrformvalidation';
    errorSpan.innerHTML = '<span role="alert">' + STSHtmlEncode(errorResult.errorMessage) + '<br/></span>';
    inputElt.parentNode.appendChild(errorSpan);
}
function ClientFormContext(formCtx) {
    if (formCtx != null) {
        this.fieldValue = formCtx.fieldValue;
        this.fieldSchema = formCtx.fieldSchema;
        this.fieldName = formCtx.fieldName;
        this.controlMode = formCtx.controlMode;
        this.webAttributes = formCtx.webAttributes;
        this.itemAttributes = formCtx.itemAttributes;
        this.listAttributes = formCtx.listAttributes;
        this.registerInitCallback = formCtx.registerInitCallback;
        this.registerFocusCallback = formCtx.registerFocusCallback;
        this.registerValidationErrorCallback = formCtx.registerValidationErrorCallback;
        this.registerGetValueCallback = formCtx.registerGetValueCallback;
        this.updateControlValue = formCtx.updateControlValue;
        this.registerClientValidator = formCtx.registerClientValidator;
        this.registerHasValueChangedCallback = formCtx.registerHasValueChangedCallback;
    }
    else {
        this.registerInitCallback = function(fldName, iCallback) {
        };
        this.registerFocusCallback = function(fldName, fCallback) {
        };
        this.registerValidationErrorCallback = function(fldName, eCallback) {
        };
        this.registerGetValueCallback = function(fldName, vCallback) {
        };
        this.updateControlValue = function(fldName, strValue) {
        };
        this.registerClientValidator = function(fldName, dValidator) {
        };
        this.registerHasValueChangedCallback = function(fldName, vcCallback) {
        };
    }
}
function ClientFormContext_InitializePrototype() {
    ClientFormContext.prototype = {
        fieldValue: null,
        fieldSchema: null,
        fieldName: "",
        controlMode: 0,
        webAttributes: null,
        itemAttributes: null,
        listAttributes: null,
        registerInitCallback: null,
        registerFocusCallback: null,
        registerValidationErrorCallback: null,
        registerGetValueCallback: null,
        updateControlValue: null,
        registerClientValidator: null,
        registerHasValueChangedCallback: null
    };
}
function SPClientFormsClientValidationValidationResult_InitializePrototype() {
    SPClientForms.ClientValidation.ValidationResult.prototype.errorMessage = '';
    SPClientForms.ClientValidation.ValidationResult.prototype.validationError = false;
}
$_global_clientforms();
