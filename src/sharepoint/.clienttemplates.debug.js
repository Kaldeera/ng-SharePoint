function $_global_clienttemplates() {
    SPClientRenderer = {
        GlobalDebugMode: false,
        AddCallStackInfoToErrors: false,
        RenderErrors: true
    };
    SPClientRenderer.IsDebugMode = function(renderCtx) {
        if (typeof renderCtx != "undefined" && null != renderCtx && typeof renderCtx.DebugMode != "undefined") {
            return Boolean(renderCtx.DebugMode);
        }
        else {
            return Boolean(SPClientRenderer.GlobalDebugMode);
        }
    };
    SPClientRenderer.Render = function(node, renderCtx) {
        if (node == null || renderCtx == null)
            return;
        SPClientRenderer._ExecuteRenderCallbacks(renderCtx, 'OnPreRender');
        var result = SPClientRenderer.RenderCore(renderCtx);

        if (renderCtx.Errors != null && renderCtx.Errors.length > 0) {
            var retString = [];

            if (Boolean(SPClientRenderer.RenderErrors)) {
                for (var i = 0; i < renderCtx.Errors.length; i++) {
                    retString.push(renderCtx.Errors[i]);
                }
            }
            result = retString.join("") + " ";
        }
        if (result != null && result != '') {
            if (node.tagName == "DIV" || node.tagName == "TD") {
                if (renderCtx.fHidden)
                    node.style.display = "none";
                node.innerHTML = result;
            }
            else {
                var container = document.createElement("div");

                container.innerHTML = result;
                var fChild = container.firstChild;

                if (container.childNodes.length == 1 && fChild != null && fChild.nodeType == 3) {
                    var text = document.createTextNode(result);

                    InsertNodeAfter(node, text);
                }
                else {
                    var children = fChild.childNodes;
                    var pNode;

                    pNode = node.parentNode;
                    for (var idx = 0; idx < children.length; idx++) {
                        var childNode = children[idx];

                        if (childNode.nodeType == 1) {
                            if (pNode.nodeName == childNode.nodeName) {
                                var addNodes = childNode.childNodes;
                                var nc = addNodes.length;

                                for (var ix = 0; ix < nc; ix++)
                                    pNode.appendChild(addNodes[0]);
                            }
                            else {
                                if (renderCtx.fHidden)
                                    childNode.style.display = "none";
                                pNode.appendChild(children[idx]);
                                idx--;
                            }
                        }
                    }
                }
            }
        }
        SPClientRenderer._ExecuteRenderCallbacks(renderCtx, 'OnPostRender');
    };
    SPClientRenderer.RenderReplace = function(node, renderCtx) {
        if (node == null || renderCtx == null)
            return;
        SPClientRenderer._ExecuteRenderCallbacks(renderCtx, 'OnPreRender');
        var result = SPClientRenderer.RenderCore(renderCtx);
        var pNode = node.parentNode;

        if (pNode != null) {
            if (result != null && result != '') {
                var container = document.createElement("div");

                container.innerHTML = result;
                var cNodes = container.childNodes;

                while (cNodes.length > 0)
                    pNode.insertBefore(cNodes[0], node);
            }
            pNode.removeChild(node);
        }
        SPClientRenderer._ExecuteRenderCallbacks(renderCtx, 'OnPostRender');
    };
    SPClientRenderer._ExecuteRenderCallbacks = function(renderCtx, callbackType) {
        var templateExecContext = {
            Operation: callbackType
        };
        var fn = function() {
            return SPClientRenderer._ExecuteRenderCallbacksWorker(renderCtx, callbackType, templateExecContext);
        };

        return CallFunctionWithErrorHandling(fn, renderCtx, null, templateExecContext);
    };
    SPClientRenderer._ExecuteRenderCallbacksWorker = function(renderCtx, callbackType, templateExecContext) {
        if (!renderCtx || callbackType == null || callbackType == '')
            return;
        var renderCallbacks = renderCtx[callbackType];

        if (renderCallbacks == null)
            return;
        if (typeof renderCallbacks == "function") {
            templateExecContext.TemplateFunction = renderCallbacks;
            renderCallbacks(renderCtx);
        }
        else if (typeof renderCallbacks == "object") {
            var numCallbacks = renderCallbacks.length;

            if (numCallbacks && typeof numCallbacks == "number") {
                for (var n = 0; n < Number(numCallbacks); n++) {
                    if (typeof renderCallbacks[n] == "function") {
                        templateExecContext.TemplateFunction = renderCallbacks[n];
                        renderCallbacks[n](renderCtx);
                    }
                }
            }
        }
    };
    SPClientRenderer.RenderCore = function(renderCtx) {
        if (renderCtx == null)
            return '';
        renderCtx.RenderView = RenderView;
        renderCtx.RenderHeader = RenderHeader;
        renderCtx.RenderBody = RenderBody;
        renderCtx.RenderFooter = RenderFooter;
        renderCtx.RenderGroups = RenderGroups;
        renderCtx.RenderItems = RenderItems;
        renderCtx.RenderFields = RenderFields;
        renderCtx.RenderFieldByName = RenderFieldByName;
        return RenderView(renderCtx);
        function RenderView(rCtx) {
            return DoSingleTemplateRender(rCtx, 'View');
        }
        function RenderHeader(rCtx) {
            return DoSingleTemplateRender(rCtx, 'Header');
        }
        function RenderBody(rCtx) {
            return DoSingleTemplateRender(rCtx, 'Body');
        }
        function RenderFooter(rCtx) {
            return DoSingleTemplateRender(rCtx, 'Footer');
        }
        function ResolveTemplate(rCtx, component, level) {
            if (rCtx == null)
                return '';
            if (rCtx.ResolveTemplate != null && typeof rCtx.ResolveTemplate == "function")
                return rCtx.ResolveTemplate(rCtx, component, level);
            else
                return '';
        }
        function DoSingleTemplateRender(inCtx, tplTag) {
            if (inCtx == null)
                return '';
            var tpl = ResolveTemplate(inCtx, inCtx.ListData, tplTag);

            if (tpl == null || tpl == '') {
                var templates = inCtx.Templates;

                if (templates == null)
                    return '';
                tpl = templates[tplTag];
            }
            if (tpl == null || tpl == '')
                return '';
            return CoreRender(tpl, inCtx);
        }
        function RenderGroups(inCtx) {
            if (inCtx == null || inCtx.ListData == null)
                return '';
            var groupTpls = null;

            if (inCtx.Templates != null)
                groupTpls = inCtx.Templates['Group'];
            var listData = inCtx.ListData;
            var groupData = listData[GetGroupsKey(inCtx)];
            var gStr = '';

            if (groupData == null) {
                if (typeof groupTpls == "string" || typeof groupTpls == "function") {
                    inCtx['CurrentGroupIdx'] = 0;
                    inCtx['CurrentGroup'] = listData;
                    inCtx['CurrentItems'] = listData[GetItemsKey(inCtx)];
                    gStr += CoreRender(groupTpls, inCtx);
                    inCtx['CurrentItems'] = null;
                    inCtx['CurrentGroup'] = null;
                }
                return gStr;
            }
            for (var rg_g = 0; rg_g < groupData.length; rg_g++) {
                var groupInfo = groupData[rg_g];
                var tpl = ResolveTemplate(inCtx, groupInfo, 'Group');

                if (tpl == null || tpl == '') {
                    if (groupTpls == null || groupTpls == {})
                        return '';
                    if (typeof groupTpls == "string" || typeof groupTpls == "function")
                        tpl = groupTpls;
                    if (tpl == null || tpl == '') {
                        var groupType = groupInfo['GroupType'];

                        tpl = groupTpls[groupType];
                    }
                }
                if (tpl == null || tpl == '')
                    continue;
                inCtx['CurrentGroupIdx'] = rg_g;
                inCtx['CurrentGroup'] = groupInfo;
                inCtx['CurrentItems'] = groupInfo[GetItemsKey(inCtx)];
                gStr += CoreRender(tpl, inCtx);
                inCtx['CurrentGroup'] = null;
                inCtx['CurrentItems'] = null;
            }
            return gStr;
        }
        function RenderItems(inCtx) {
            if (inCtx == null || inCtx.ListData == null)
                return '';
            var itemTpls = null;

            if (inCtx.Templates != null)
                itemTpls = inCtx.Templates['Item'];
            var listData = inCtx.ListData;
            var itemData = inCtx['CurrentItems'];

            if (itemData == null)
                itemData = typeof inCtx['CurrentGroup'] != "undefined" ? inCtx['CurrentGroup'][GetItemsKey(inCtx)] : null;
            if (itemData == null) {
                var groups = listData[GetGroupsKey(inCtx)];

                itemData = typeof groups != "undefined" ? groups[GetItemsKey(inCtx)] : null;
            }
            if (itemData == null)
                return '';
            var iStr = '';

            for (var i = 0; i < itemData.length; i++) {
                var itemInfo = itemData[i];
                var tpl = ResolveTemplate(inCtx, itemInfo, 'Item');

                if (tpl == null || tpl == '') {
                    if (itemTpls == null || itemTpls == {})
                        return '';
                    if (typeof itemTpls == "string" || typeof itemTpls == "function")
                        tpl = itemTpls;
                    if (tpl == null || tpl == '') {
                        var itemType = itemInfo['ContentType'];

                        tpl = itemTpls[itemType];
                    }
                }
                if (tpl == null || tpl == '')
                    continue;
                inCtx['CurrentItemIdx'] = i;
                inCtx['CurrentItem'] = itemInfo;
                if (typeof inCtx['ItemRenderWrapper'] == "string") {
                    inCtx['ItemRenderWrapper'] == SPClientRenderer.ParseTemplateString(inCtx['ItemRenderWrapper'], inCtx);
                }
                if (typeof inCtx['ItemRenderWrapper'] == "function") {
                    var renderWrapper = inCtx['ItemRenderWrapper'];
                    var templateExecContext = {
                        TemplateFunction: renderWrapper,
                        Operation: "ItemRenderWrapper"
                    };
                    var renderWrapperFn = function() {
                        return renderWrapper(CoreRender(tpl, inCtx), inCtx, tpl);
                    };

                    iStr += CallFunctionWithErrorHandling(renderWrapperFn, inCtx, '', templateExecContext);
                }
                else {
                    iStr += CoreRender(tpl, inCtx);
                }
                inCtx['CurrentItem'] = null;
            }
            return iStr;
        }
        function RenderFields(inCtx) {
            if (inCtx == null || inCtx.Templates == null || inCtx.ListSchema == null || inCtx.ListData == null)
                return '';
            var item = inCtx['CurrentItem'];
            var fields = inCtx.ListSchema['Field'];
            var fieldTpls = inCtx.Templates['Fields'];

            if (item == null || fields == null || fieldTpls == null)
                return '';
            var fStr = '';

            for (var f in fields)
                fStr += ExecuteFieldRender(inCtx, fields[f]);
            return fStr;
        }
        function RenderFieldByName(inCtx, fName) {
            if (inCtx == null || inCtx.Templates == null || inCtx.ListSchema == null || inCtx.ListData == null || fName == null || fName == '')
                return '';
            var item = inCtx['CurrentItem'];
            var fields = inCtx.ListSchema['Field'];
            var fieldTpls = inCtx.Templates['Fields'];

            if (item == null || fields == null || fieldTpls == null)
                return '';
            if (typeof SPClientTemplates != 'undefined' && spMgr != null && inCtx.ControlMode == SPClientTemplates.ClientControlMode.View)
                return spMgr.RenderFieldByName(inCtx, fName, item, inCtx.ListSchema);
            for (var f in fields) {
                if (fields[f].Name == fName)
                    return ExecuteFieldRender(inCtx, fields[f]);
            }
            return '';
        }
        function ExecuteFieldRender(inCtx, fld) {
            var item = inCtx['CurrentItem'];
            var fieldTpls = inCtx.Templates['Fields'];
            var fldName = fld.Name;

            if (typeof item[fldName] == "undefined")
                return '';
            var tpl = '';

            if (fieldTpls[fldName] != null)
                tpl = fieldTpls[fldName];
            if (tpl == null || tpl == '')
                return '';
            inCtx['CurrentFieldValue'] = item[fldName];
            inCtx['CurrentFieldSchema'] = fld;
            var fStr = CoreRender(tpl, inCtx);

            inCtx['CurrentFieldValue'] = null;
            inCtx['CurrentFieldSchema'] = null;
            return fStr;
        }
        function GetGroupsKey(c) {
            var groupsKey = c.ListDataJSONGroupsKey;

            return typeof groupsKey != "string" || groupsKey == '' ? 'Groups' : groupsKey;
        }
        function GetItemsKey(c) {
            var itemsKey = c.ListDataJSONItemsKey;

            return typeof itemsKey != "string" || itemsKey == '' ? 'Items' : itemsKey;
        }
    };
    SPClientRenderer.ParseTemplateString = function(templateStr, c) {
        var templateExecContext = {
            TemplateFunction: templateStr,
            Operation: "ParseTemplateString"
        };
        var fn = function() {
            return SPClientRenderer.ParseTemplateStringWorker(templateStr, c);
        };

        return CallFunctionWithErrorHandling(fn, c, null, templateExecContext);
    };
    SPClientRenderer.ParseTemplateStringWorker = function(templateStr, c) {
        if (templateStr == null || templateStr.length == 0)
            return null;
        var strFunc = "var p=[]; p.push('" + ((((((((((templateStr.replace(/[\r\t\n]/g, " ")).replace(/'(?=[^#]*#>)/g, "\t")).split("'")).join("\\'")).split("\t")).join("'")).replace(/<#=(.+?)#>/g, "',$1,'")).split("<#")).join("');")).split("#>")).join("p.push('") + "'); return p.join('');";
        var func;

        func = new Function("ctx", strFunc);
        return func;
    };
    SPClientRenderer.ReplaceUrlTokens = function(tokenUrl) {
        var pageContextInfo = window['_spPageContextInfo'];

        if (tokenUrl == null || tokenUrl == '' || pageContextInfo == null)
            return '';
        var siteToken = '~site/';
        var siteCollectionToken = '~sitecollection/';
        var siteCollectionMPGalleryToken = '~sitecollectionmasterpagegallery/';
        var lowerCaseTokenUrl = tokenUrl.toLowerCase();

        if (lowerCaseTokenUrl.indexOf(siteToken) == 0) {
            var sPrefix = DeterminePrefix(pageContextInfo.webServerRelativeUrl);

            tokenUrl = sPrefix + tokenUrl.substr(siteToken.length);
            lowerCaseTokenUrl = sPrefix + lowerCaseTokenUrl.substr(siteToken.length);
        }
        else if (lowerCaseTokenUrl.indexOf(siteCollectionToken) == 0) {
            var scPrefix = DeterminePrefix(pageContextInfo.siteServerRelativeUrl);

            tokenUrl = scPrefix + tokenUrl.substr(siteCollectionToken.length);
            lowerCaseTokenUrl = scPrefix + lowerCaseTokenUrl.substr(siteCollectionToken.length);
        }
        else if (lowerCaseTokenUrl.indexOf(siteCollectionMPGalleryToken) == 0) {
            var smpPrefix = DeterminePrefix(pageContextInfo.siteServerRelativeUrl);

            tokenUrl = smpPrefix + '_catalogs/masterpage/' + tokenUrl.substr(siteCollectionMPGalleryToken.length);
            lowerCaseTokenUrl = smpPrefix + '_catalogs/masterpage/' + lowerCaseTokenUrl.substr(siteCollectionMPGalleryToken.length);
        }
        var lcidToken = '{lcid}';
        var localeToken = '{locale}';
        var siteClientTagToken = '{siteclienttag}';
        var tokenIdx = -1;

        while ((tokenIdx = lowerCaseTokenUrl.indexOf(lcidToken)) != -1) {
            tokenUrl = tokenUrl.substring(0, tokenIdx) + String(pageContextInfo.currentLanguage) + tokenUrl.substr(tokenIdx + lcidToken.length);
            lowerCaseTokenUrl = lowerCaseTokenUrl.replace(lcidToken, String(pageContextInfo.currentLanguage));
        }
        while ((tokenIdx = lowerCaseTokenUrl.indexOf(localeToken)) != -1) {
            tokenUrl = tokenUrl.substring(0, tokenIdx) + pageContextInfo.currentUICultureName + tokenUrl.substr(tokenIdx + localeToken.length);
            lowerCaseTokenUrl = lowerCaseTokenUrl.replace(localeToken, pageContextInfo.currentUICultureName);
        }
        while ((tokenIdx = lowerCaseTokenUrl.indexOf(siteClientTagToken)) != -1) {
            tokenUrl = tokenUrl.substring(0, tokenIdx) + pageContextInfo.siteClientTag + tokenUrl.substr(tokenIdx + siteClientTagToken.length);
            lowerCaseTokenUrl = lowerCaseTokenUrl.replace(siteClientTagToken, pageContextInfo.siteClientTag);
        }
        return tokenUrl;
        function DeterminePrefix(contextInfoValue) {
            if (contextInfoValue == null || contextInfoValue == '')
                return '';
            var valueLen = contextInfoValue.length;

            return contextInfoValue[valueLen - 1] == '/' ? contextInfoValue : contextInfoValue + '/';
        }
    };
    clientHierarchyManagers = [];
    ClientHierarchyManager = function(wpq) {
        clientHierarchyManagers.push(this);
        var _wpq = wpq;
        var _expandedState = {};
        var _itemIdToTrIdMap = {};
        var _imgToItemIdMap = {};
        var _childrenMap = {};
        var _itemIdToImgIdMap = {};
        var _expandImg = GetThemedImageUrl("commentexpand12.png");
        var _collapseImg = GetThemedImageUrl("commentcollapse12.png");

        this.Matches = function(wpqToMatch) {
            return wpqToMatch == _wpq;
        };
        this.RegisterHierarchyNode = function(itemId, parentId, trId, imgId) {
            _expandedState[itemId] = true;
            _itemIdToTrIdMap[itemId] = trId;
            _imgToItemIdMap[imgId] = itemId;
            _itemIdToImgIdMap[itemId] = imgId;
            _childrenMap[itemId] = [];
            if (parentId != null) {
                _childrenMap[parentId].push(itemId);
            }
        };
        this.IsParent = function(itemId) {
            return itemId in _childrenMap && _childrenMap[itemId].length > 0;
        };
        this.ToggleExpandByImg = function(img) {
            if (!(img.id in _imgToItemIdMap)) {
                return;
            }
            var itemId = _imgToItemIdMap[img.id];

            ToggleExpand(itemId, img);
        };
        this.ToggleExpandById = function(itemId) {
            if (itemId == null) {
                return;
            }
            if (!(itemId in _itemIdToImgIdMap)) {
                return;
            }
            var imgId = _itemIdToImgIdMap[itemId];
            var img = $get(imgId);

            if (img == null) {
                return;
            }
            ToggleExpand(itemId, img);
        };
        this.GetToggleStateById = function(itemId) {
            if (itemId == null) {
                return 0;
            }
            if (!(itemId in _expandedState)) {
                return 0;
            }
            if (_childrenMap[itemId].length == 0) {
                return 0;
            }
            return _expandedState[itemId] ? 1 : 2;
        };
        function ToggleExpand(itemId, img) {
            var bExpanding = !_expandedState[itemId];

            if (bExpanding) {
                img.src = _collapseImg;
                ExpandChildren(itemId);
            }
            else {
                img.src = _expandImg;
                CollapseChildren(itemId);
            }
            _expandedState[itemId] = bExpanding;
        }
        function ExpandChildren(id) {
            for (var i = 0; i < _childrenMap[id].length; i++) {
                (document.getElementById(_itemIdToTrIdMap[_childrenMap[id][i]])).style.display = '';
                if (_expandedState[_childrenMap[id][i]]) {
                    ExpandChildren(_childrenMap[id][i]);
                }
            }
        }
        function CollapseChildren(id) {
            for (var i = 0; i < _childrenMap[id].length; i++) {
                (document.getElementById(_itemIdToTrIdMap[_childrenMap[id][i]])).style.display = 'none';
                CollapseChildren(_childrenMap[id][i]);
            }
        }
    };
    if (typeof window.ClientPivotControl == "undefined") {
        window.ClientPivotControl = function(controlProps) {
            this.AllOptions = [];
            if (controlProps != null) {
                this.PivotParentId = controlProps.PivotParentId;
                this.PivotContainerId = controlProps.PivotContainerId;
                if (typeof controlProps.AllOptions != "undefined")
                    this.AllOptions = controlProps.AllOptions;
                if (typeof controlProps.SurfacedPivotCount == "number")
                    this.SurfacedPivotCount = Number(controlProps.SurfacedPivotCount);
                if (typeof controlProps.ShowMenuIcons != "undefined")
                    this.ShowMenuIcons = Boolean(controlProps.ShowMenuIcons);
                if (typeof controlProps.ShowMenuClose != "undefined")
                    this.ShowMenuClose = controlProps.ShowMenuClose;
                if (typeof controlProps.ShowMenuCheckboxes != "undefined")
                    this.ShowMenuCheckboxes = controlProps.ShowMenuCheckboxes;
                if (typeof controlProps.Width != "undefined")
                    this.Width = controlProps.Width;
            }
            else {
                this.PivotContainerId = 'clientPivotControl' + ClientPivotControl.PivotControlCount.toString();
            }
            this.OverflowDotId = this.PivotContainerId + '_overflow';
            this.OverflowMenuId = this.PivotContainerId + '_menu';
            ClientPivotControl.PivotControlCount++;
            ClientPivotControl.PivotControlDict[this.PivotContainerId] = this;
        };
        ClientPivotControl.PivotControlDict = [];
        ClientPivotControl.PivotControlCount = 0;
        ClientPivotControl.prototype = {
            PivotParentId: '',
            PivotContainerId: '',
            OverflowDotId: '',
            OverflowMenuId: '',
            AllOptions: [],
            SurfacedPivotCount: 3,
            ShowMenuIcons: false,
            ShowMenuClose: false,
            ShowMenuCheckboxes: false,
            OverflowMenuScript: '',
            Width: '',
            SurfacedOptions: [],
            OverflowOptions: [],
            SelectedOptionIdx: -1,
            SurfacedOptionSelected: false,
            OverflowOptionSelected: false,
            AddMenuOption: function(option) {
                if (ClientPivotControl.IsMenuOption(option) || ClientPivotControl.IsMenuCheckOption(option))
                    this.AllOptions.push(option);
            },
            AddMenuSeparator: function() {
                if (this.AllOptions.length == 0)
                    return;
                var lastItem = this.AllOptions[this.AllOptions.length - 1];

                if (ClientPivotControl.IsMenuSeparator(lastItem))
                    return;
                this.AllOptions.push(new ClientPivotControlMenuSeparator());
            },
            Render: function() {
                if (this.PivotParentId == null || this.PivotParentId == '')
                    return;
                var parentElt = document.getElementById(this.PivotParentId);

                if (parentElt == null)
                    return;
                parentElt.innerHTML = this.RenderAsString();
                if (this.Width != '')
                    parentElt.style.width = this.Width;
            },
            RenderAsString: function() {
                this.ProcessAllMenuItems();
                this.EnsureSelectedOption();
                var surfacedCount = this.SurfacedOptions.length;

                if (surfacedCount == 0)
                    return '';
                var result = [];

                result.push('<span class="ms-pivotControl-container" id="');
                result.push(STSHtmlEncode(this.PivotContainerId));
                result.push('">');
                for (var idx = 0; idx < surfacedCount; idx++)
                    result.push(this.RenderSurfacedOption(idx));
                if (this.ShouldShowOverflowMenuLink())
                    result.push(this.RenderOverflowMenuLink());
                result.push("</span>");
                return result.join('');
            },
            ShouldShowOverflowMenuLink: function() {
                return this.OverflowOptions.length > 0 || this.OverflowMenuScript != null && this.OverflowMenuScript != '';
            },
            ShowOverflowMenu: function() {
                var numOpts = this.OverflowOptions.length;
                var dotElt = document.getElementById(this.OverflowDotId);

                if (dotElt == null || numOpts == 0)
                    return;
                MenuHtc_hide();
                var menu = CMenu(this.OverflowMenuId);

                for (var idx = 0; idx < numOpts; idx++) {
                    var opt = this.OverflowOptions[idx];
                    var isCheckOption = ClientPivotControl.IsMenuCheckOption(opt);

                    if (ClientPivotControl.IsMenuOption(opt) || isCheckOption) {
                        var addedOption = CAMOpt(menu, opt.DisplayText, opt.OnClickAction, opt.ImageUrl, opt.ImageAltText, String(100 * idx), opt.Description);

                        addedOption.id = 'ID_OverflowOption_' + String(idx);
                        if (isCheckOption) {
                            addedOption.setAttribute('checked', opt.Checked);
                        }
                    }
                    else if (ClientPivotControl.IsMenuSeparator(opt)) {
                        CAMSep(menu);
                    }
                }
                if (!this.ShowMenuIcons)
                    menu.setAttribute("hideicons", "true");
                var oldFlipValue = Boolean(document.body['WZ_ATTRIB_FLIPPED']);

                document.body['WZ_ATTRIB_FLIPPED'] = false;
                OMenu(menu, dotElt, null, false, -2, this.ShowMenuClose, this.ShowMenuCheckboxes);
                document.body['WZ_ATTRIB_FLIPPED'] = oldFlipValue;
                if (this.OverflowOptionSelected) {
                    var optId = 'ID_OverflowOption_' + String(this.SelectedOptionIdx);
                    var menuOpt = document.getElementById(optId);

                    if (menuOpt != null)
                        SelectItemStatic(menuOpt.parentNode.parentNode);
                }
            },
            RenderSurfacedOption: function(optIdx) {
                if (optIdx < 0 || optIdx >= this.SurfacedOptions.length)
                    return '';
                var surfaceOpt = this.SurfacedOptions[optIdx];
                var className = 'ms-pivotControl-surfacedOpt';

                if (surfaceOpt.SelectedOption)
                    className += '-selected';
                var optRes = [];

                optRes.push('<a class="');
                optRes.push(className);
                optRes.push('" href="#" id="');
                optRes.push(STSHtmlEncode(this.PivotContainerId + '_surfaceopt' + optIdx.toString()));
                optRes.push('" onclick="');
                optRes.push(STSHtmlEncode(surfaceOpt.OnClickAction));
                optRes.push(' return false;" alt="');
                optRes.push(STSHtmlEncode(surfaceOpt.DisplayText));
                optRes.push('" >');
                optRes.push(STSHtmlEncode(surfaceOpt.DisplayText));
                optRes.push('</a>');
                return optRes.join('');
            },
            RenderOverflowMenuLink: function() {
                var onClickAction = this.OverflowMenuScript;

                if (onClickAction == null || onClickAction == '')
                    onClickAction = 'ClientPivotControlExpandOverflowMenu(event);';
                var menuRes = [];

                menuRes.push('<span class="ms-pivotControl-overflowSpan" data-containerId="');
                menuRes.push(STSHtmlEncode(this.PivotContainerId));
                menuRes.push('" id="');
                menuRes.push(STSHtmlEncode(this.OverflowDotId));
                menuRes.push('" title="');
                menuRes.push(STSHtmlEncode(Strings.STS.L_ClientPivotControlOverflowMenuAlt));
                menuRes.push('" ><a class="ms-pivotControl-overflowDot" href="#" onclick="');
                menuRes.push(STSHtmlEncode(onClickAction));
                menuRes.push('" alt="');
                menuRes.push(STSHtmlEncode(Strings.STS.L_ClientPivotControlOverflowMenuAlt));
                menuRes.push('" >');
                menuRes.push('<img class="ms-ellipsis-icon" src="');
                menuRes.push(GetThemedImageUrl('spcommon.png'));
                menuRes.push('" alt="');
                menuRes.push(STSHtmlEncode(Strings.STS.L_OpenMenu));
                menuRes.push('" /></a></span>');
                return menuRes.join('');
            },
            ProcessAllMenuItems: function() {
                if (this.SurfacedPivotCount < 0)
                    this.SurfacedPivotCount = 1;
                this.SurfacedOptions = [];
                this.OverflowOptions = [];
                var allOptionCount = this.AllOptions.length;

                if (allOptionCount == 0)
                    return;
                var optIdx = 0;
                var overflowSeparatorFound = false;

                while (optIdx < allOptionCount) {
                    var sOpt = this.AllOptions[optIdx];

                    if (ClientPivotControl.IsMenuSeparator(sOpt)) {
                        overflowSeparatorFound = this.SurfacedOptions.length == this.SurfacedPivotCount;
                        optIdx++;
                        continue;
                    }
                    if (this.SurfacedOptions.length == this.SurfacedPivotCount)
                        break;
                    optIdx++;
                    this.SurfacedOptions.push(sOpt);
                }
                if (optIdx == allOptionCount)
                    return;
                this.OverflowOptions.push(this.SurfacedOptions[this.SurfacedOptions.length - 1]);
                if (overflowSeparatorFound)
                    this.OverflowOptions.push(new ClientPivotControlMenuSeparator());
                for (; optIdx < allOptionCount; optIdx++) {
                    var oOpt = this.AllOptions[optIdx];

                    this.OverflowOptions.push(oOpt);
                }
                var lastMenuOpt = this.OverflowOptions[this.OverflowOptions.length - 1];

                if (ClientPivotControl.IsMenuSeparator(lastMenuOpt))
                    this.OverflowOptions.pop();
            },
            EnsureSelectedOption: function() {
                this.SelectedOptionIdx = -1;
                this.SurfacedOptionSelected = false;
                this.OverflowOptionSelected = false;
                var surfacedCount = this.SurfacedOptions.length;
                var overflowCount = this.OverflowOptions.length;

                if (surfacedCount == 0 && overflowCount == 0)
                    return;
                for (var surIdx = 0; surIdx < this.SurfacedOptions.length; surIdx++) {
                    if (surIdx == this.SurfacedPivotCount - 1 && this.OverflowOptions.length > 0)
                        break;
                    var surfacedOpt = this.SurfacedOptions[surIdx];

                    if (this.SelectedOptionIdx != -1) {
                        surfacedOpt.SelectedOption = false;
                    }
                    else {
                        if (Boolean(surfacedOpt.SelectedOption)) {
                            this.SelectedOptionIdx = surIdx;
                            this.SurfacedOptionSelected = true;
                        }
                    }
                }
                for (var overIdx = 0; overIdx < this.OverflowOptions.length; overIdx++) {
                    var overflowOpt = this.OverflowOptions[overIdx];

                    if (this.SelectedOptionIdx != -1) {
                        if (ClientPivotControl.IsMenuOption(overflowOpt))
                            overflowOpt.SelectedOption = false;
                    }
                    else {
                        if (Boolean(overflowOpt.SelectedOption)) {
                            this.SelectedOptionIdx = overIdx;
                            this.OverflowOptionSelected = true;
                            this.SurfacedOptions.pop();
                            this.SurfacedOptions.push(overflowOpt);
                        }
                    }
                }
                if (this.SelectedOptionIdx == -1) {
                    this.SurfacedOptions[0].SelectedOption = true;
                    if (this.SurfacedOptions.length == 1 && this.OverflowOptions.length != 0) {
                        this.OverflowOptionIdx = 0;
                        this.OverflowOptionSelected = true;
                        this.OverflowOptions[0].SelectedOption = true;
                    }
                    else {
                        this.SelectedOptionIdx = 0;
                        this.SurfacedOptionSelected = true;
                    }
                }
            }
        };
        window.ClientPivotControlExpandOverflowMenu = function(evt) {
            if (evt == null)
                evt = window.event;
            var elm = GetEventSrcElement(evt);

            while (elm != null && elm.getAttribute('data-containerId') == null)
                elm = elm.parentNode;
            if (elm == null)
                return;
            var menuContext;

            try {
                menuContext = typeof CMenu;
            }
            catch (e) {
                menuContext = "undefined";
            }
            EnsureScript("core.js", menuContext, function() {
                var pivotCtrl = ClientPivotControl.PivotControlDict[elm.getAttribute('data-containerId')];

                if (pivotCtrl != null)
                    pivotCtrl.ShowOverflowMenu();
            });
            if (evt != null)
                CancelEvent(evt);
        };
        window.ClientPivotControl_InitStandaloneControlWrapper = function(controlProps) {
            if (controlProps == null)
                return;
            var pivot = new ClientPivotControl(controlProps);

            pivot.Render();
        };
        ClientPivotControl.MenuOptionType = {
            MenuOption: 1,
            MenuSeparator: 2,
            MenuCheckOption: 3
        };
        ClientPivotControl.IsMenuOption = function(menuOpt) {
            return menuOpt != null && menuOpt.MenuOptionType == ClientPivotControl.MenuOptionType.MenuOption;
        };
        ClientPivotControl.IsMenuCheckOption = function(menuOpt) {
            return menuOpt != null && menuOpt.MenuOptionType == ClientPivotControl.MenuOptionType.MenuCheckOption;
        };
        ClientPivotControl.IsMenuSeparator = function(menuOpt) {
            return menuOpt != null && menuOpt.MenuOptionType == ClientPivotControl.MenuOptionType.MenuSeparator;
        };
        window.ClientPivotControlMenuItem = function() {
        };
        ClientPivotControlMenuItem.prototype = {
            MenuOptionType: 0
        };
        window.ClientPivotControlMenuOption = function() {
            this.MenuOptionType = ClientPivotControl.MenuOptionType.MenuOption;
        };
        ClientPivotControlMenuOption.prototype = new ClientPivotControlMenuItem();
        ClientPivotControlMenuOption.prototype.DisplayText = '';
        ClientPivotControlMenuOption.prototype.Description = '';
        ClientPivotControlMenuOption.prototype.OnClickAction = '';
        ClientPivotControlMenuOption.prototype.ImageUrl = '';
        ClientPivotControlMenuOption.prototype.ImageAltText = '';
        ClientPivotControlMenuOption.prototype.SelectedOption = false;
        window.ClientPivotControlMenuSeparator = function() {
            this.MenuOptionType = ClientPivotControl.MenuOptionType.MenuSeparator;
        };
        ClientPivotControlMenuSeparator.prototype = new ClientPivotControlMenuItem();
        window.ClientPivotControlMenuCheckOption = function() {
            this.MenuOptionType = ClientPivotControl.MenuOptionType.MenuCheckOption;
        };
        ClientPivotControlMenuCheckOption.prototype = new ClientPivotControlMenuItem();
        ClientPivotControlMenuCheckOption.prototype.Checked = false;
    }
    SPClientTemplates = {};
    SPClientTemplates.FileSystemObjectType = {
        Invalid: -1,
        File: 0,
        Folder: 1,
        Web: 2
    };
    SPClientTemplates.ChoiceFormatType = {
        Dropdown: 0,
        Radio: 1
    };
    SPClientTemplates.ClientControlMode = {
        Invalid: 0,
        DisplayForm: 1,
        EditForm: 2,
        NewForm: 3,
        View: 4
    };
    SPClientTemplates.RichTextMode = {
        Compatible: 0,
        FullHtml: 1,
        HtmlAsXml: 2,
        ThemeHtml: 3
    };
    SPClientTemplates.UrlFormatType = {
        Hyperlink: 0,
        Image: 1
    };
    SPClientTemplates.DateTimeDisplayFormat = {
        DateOnly: 0,
        DateTime: 1,
        TimeOnly: 2
    };
    SPClientTemplates.DateTimeCalendarType = {
        None: 0,
        Gregorian: 1,
        Japan: 3,
        Taiwan: 4,
        Korea: 5,
        Hijri: 6,
        Thai: 7,
        Hebrew: 8,
        GregorianMEFrench: 9,
        GregorianArabic: 10,
        GregorianXLITEnglish: 11,
        GregorianXLITFrench: 12,
        KoreaJapanLunar: 14,
        ChineseLunar: 15,
        SakaEra: 16,
        UmAlQura: 23
    };
    SPClientTemplates.UserSelectionMode = {
        PeopleOnly: 0,
        PeopleAndGroups: 1
    };
    SPClientTemplates.PresenceIndicatorSize = {
        Bar_5px: "5",
        Bar_8px: "8",
        Square_10px: "10",
        Square_12px: "12"
    };
    SPClientTemplates.TemplateManager = {};
    SPClientTemplates.TemplateManager._TemplateOverrides = {};
    SPClientTemplates.TemplateManager._TemplateOverrides.View = {};
    SPClientTemplates.TemplateManager._TemplateOverrides.Header = {};
    SPClientTemplates.TemplateManager._TemplateOverrides.Body = {};
    SPClientTemplates.TemplateManager._TemplateOverrides.Footer = {};
    SPClientTemplates.TemplateManager._TemplateOverrides.Group = {};
    SPClientTemplates.TemplateManager._TemplateOverrides.Item = {};
    SPClientTemplates.TemplateManager._TemplateOverrides.Fields = {};
    SPClientTemplates.TemplateManager._TemplateOverrides.OnPreRender = {};
    SPClientTemplates.TemplateManager._TemplateOverrides.OnPostRender = {};
    SPClientTemplates.TemplateManager._RegisterDefaultTemplates = function(renderCtx) {
        if (!renderCtx || !renderCtx.Templates && !renderCtx.OnPreRender && !renderCtx.OnPostRender)
            return;
        var tempStruct = SPClientTemplates._defaultTemplates;

        SPClientTemplates.TemplateManager._RegisterTemplatesInternal(renderCtx, tempStruct);
    };
    SPClientTemplates.TemplateManager.RegisterTemplateOverrides = function(renderCtx) {
        if (!renderCtx || !renderCtx.Templates && !renderCtx.OnPreRender && !renderCtx.OnPostRender)
            return;
        var tempStruct = SPClientTemplates.TemplateManager._TemplateOverrides;

        SPClientTemplates.TemplateManager._RegisterTemplatesInternal(renderCtx, tempStruct);
    };
    SPClientTemplates.TemplateManager._RegisterTemplatesInternal = function(renderCtx, registeredOverrides) {
        if (!renderCtx || !registeredOverrides || !renderCtx.Templates && !renderCtx.OnPreRender && !renderCtx.OnPostRender)
            return;
        var tmps = renderCtx.Templates != null ? renderCtx.Templates : {};
        var typeInfo = SPClientTemplates.Utility.ComputeRegisterTypeInfo(renderCtx);

        if (typeof renderCtx.OnPreRender != "undefined")
            tmps['OnPreRender'] = renderCtx.OnPreRender;
        if (typeof renderCtx.OnPostRender != "undefined")
            tmps['OnPostRender'] = renderCtx.OnPostRender;
        for (var tmplName in tmps) {
            switch (tmplName) {
            case 'Group':
            case 'Item':
                if (typeof tmps[tmplName] == "function" || typeof tmps[tmplName] == "string")
                    tmps[tmplName] = {
                        "__DefaultTemplate__": tmps[tmplName]
                    };
            case 'View':
            case 'Header':
            case 'Body':
            case 'Footer':
            case 'Fields':
            case 'OnPreRender':
            case 'OnPostRender':
                var bCallbackTag = tmplName == 'OnPreRender' || tmplName == 'OnPostRender';
                var bSingleTpl = tmplName == 'View' || tmplName == 'Header' || tmplName == 'Body' || tmplName == 'Footer';
                var bSetTpl = tmplName == 'Item' || tmplName == 'Group' || tmplName == 'Fields';
                var viewStyleTpls, listTpls;
                var tpls = registeredOverrides[tmplName];

                if (typeInfo.defaultViewStyle) {
                    if (!tpls['default'])
                        tpls['default'] = {};
                    viewStyleTpls = tpls['default'];
                    HandleListTemplates();
                }
                else {
                    for (var vsIdx = 0; vsIdx < typeInfo.viewStyle.length; vsIdx++) {
                        var viewStyleKey = typeInfo.viewStyle[vsIdx];

                        if (!tpls[viewStyleKey])
                            tpls[viewStyleKey] = {};
                        viewStyleTpls = tpls[viewStyleKey];
                        HandleListTemplates();
                    }
                }
            }
        }
        function HandleListTemplates() {
            if (typeInfo.allLists) {
                if (!viewStyleTpls['all'])
                    viewStyleTpls['all'] = {};
                listTpls = viewStyleTpls['all'];
                if (bSingleTpl || bSetTpl)
                    HandleTemplateRegistration();
                else
                    HandleCallbackRegistration();
            }
            else {
                for (var ltIdx = 0; ltIdx < typeInfo.ltype.length; ltIdx++) {
                    var ltypeKey = typeInfo.ltype[ltIdx];

                    if (!viewStyleTpls[ltypeKey])
                        viewStyleTpls[ltypeKey] = {};
                    listTpls = viewStyleTpls[ltypeKey];
                }
                if (bSingleTpl || bSetTpl)
                    HandleTemplateRegistration();
                else
                    HandleCallbackRegistration();
            }
        }
        function HandleTemplateRegistration() {
            var viewSet = typeInfo.allViews ? listTpls['all'] : listTpls[typeInfo.viewId];
            var newTpls = tmps[tmplName];

            if (bSingleTpl) {
                if (typeof newTpls == "function" || typeof newTpls == "string")
                    viewSet = newTpls;
            }
            else {
                if (!viewSet)
                    viewSet = {};
                for (var t in newTpls)
                    viewSet[t] = newTpls[t];
            }
            if (typeInfo.allViews)
                listTpls['all'] = viewSet;
            else
                listTpls[typeInfo.viewId] = viewSet;
        }
        function HandleCallbackRegistration() {
            var newCallbacks = tmps[tmplName];

            if (!newCallbacks)
                return;
            var viewCallbacks = typeInfo.allViews ? listTpls['all'] : listTpls[typeInfo.viewId];

            if (!viewCallbacks)
                viewCallbacks = [];
            if (typeof newCallbacks == "function")
                viewCallbacks.push(newCallbacks);
            else {
                var newLen = newCallbacks.length;

                if (typeof newLen == "number") {
                    for (var n = 0; n < Number(newLen); n++) {
                        if (typeof newCallbacks[n] == "function")
                            viewCallbacks.push(newCallbacks[n]);
                    }
                }
            }
            if (typeInfo.allViews)
                listTpls['all'] = viewCallbacks;
            else
                listTpls[typeInfo.viewId] = viewCallbacks;
        }
    };
    SPClientTemplates.TemplateManager.GetTemplates = function(renderCtx) {
        if (!renderCtx)
            renderCtx = {};
        if (!renderCtx.Templates)
            renderCtx.Templates = {};
        var registeredOverrides = SPClientTemplates.TemplateManager._TemplateOverrides;
        var typeInfo = SPClientTemplates.Utility.ComputeResolveTypeInfo(renderCtx);

        ResolveRenderCallbacks();
        var tmp = {};

        tmp.View = ResolveSingleTemplate('View');
        tmp.Header = ResolveSingleTemplate('Header');
        tmp.Body = ResolveSingleTemplate('Body');
        tmp.Footer = ResolveSingleTemplate('Footer');
        tmp.Group = ResolveGroupTemplates();
        tmp.Item = ResolveItemTemplates();
        tmp.Fields = ResolveFieldTemplates();
        return tmp;
        function ResolveSingleTemplate(tag) {
            var tplOverrides = registeredOverrides[tag];
            var tplDefaults = SPClientTemplates._defaultTemplates[tag];
            var result = null;

            if (!typeInfo.defaultViewStyle) {
                result = ResolveSingleTemplateByViewStyle(tplOverrides[typeInfo.viewStyle], tag);
                if (result == null)
                    result = ResolveSingleTemplateByViewStyle(tplDefaults[typeInfo.viewStyle], tag);
            }
            if (result == null)
                result = ResolveSingleTemplateByViewStyle(tplOverrides['default'], tag);
            if (result == null)
                result = ResolveSingleTemplateByViewStyle(tplDefaults['default'], tag);
            if (result == null)
                result = GetSimpleSPTemplateByTag(tag);
            return result;
        }
        function ResolveSingleTemplateByViewStyle(vsOverride, tag) {
            if (typeof vsOverride == "undefined")
                return null;
            var result = CheckView(vsOverride[typeInfo.ltype], typeInfo.viewId);

            if (result == null)
                result = CheckView(vsOverride['all'], typeInfo.viewId);
            return result;
        }
        function ResolveGroupTemplates() {
            var resultSet = {};
            var tTag = 'Group';
            var keyIdx = tTag + 'Keys';
            var templateKeys = renderCtx[keyIdx];

            if (templateKeys == null || templateKeys.length == 0)
                templateKeys = ["__DefaultTemplate__"];
            for (var i in templateKeys) {
                var iKey = templateKeys[i];

                if (!resultSet[iKey]) {
                    var result = ResolveTemplateByKey(tTag, iKey);

                    if (iKey == "__DefaultTemplate__")
                        return result;
                    resultSet[iKey] = result;
                }
            }
            return resultSet;
        }
        function ResolveItemTemplates() {
            var resultSet = {};
            var itemKey = GetItemsKey(renderCtx);

            if (renderCtx.ListData == null || renderCtx.ListData[itemKey] == null)
                return ResolveTemplateByKey("Item", "__DefaultTemplate__");
            var knownContentTypes = {};
            var knownContentTypeCount = 0;
            var allItems = renderCtx.ListData[itemKey];
            var numItems = allItems.length;

            for (var i = 0; i < numItems; i++) {
                var item = allItems[i];

                if (item != null) {
                    var contentType = item['ContentType'];

                    if (contentType != null && typeof knownContentTypes[contentType] == 'undefined') {
                        knownContentTypeCount++;
                        knownContentTypes[contentType] = true;
                    }
                }
            }
            if (knownContentTypeCount == 0)
                return ResolveTemplateByKey("Item", "__DefaultTemplate__");
            var knownItemTemplatesDict = {};
            var knownItemTemplatesArray = [];

            for (var cType in knownContentTypes) {
                var currentTemplate = ResolveTemplateByKey('Item', cType);

                resultSet[cType] = currentTemplate;
                if (typeof knownItemTemplatesDict[currentTemplate] == 'undefined') {
                    knownItemTemplatesArray.push(currentTemplate);
                    knownItemTemplatesDict[currentTemplate] = true;
                }
            }
            if (knownItemTemplatesArray.length == 1)
                return knownItemTemplatesArray[0];
            return resultSet;
        }
        function ResolveFieldTemplates() {
            var resultSet = {};
            var registeredFieldTypes = {};
            var knownFieldModes = renderCtx.FieldControlModes != null ? renderCtx.FieldControlModes : {};
            var defaultFieldMode = typeof renderCtx.ControlMode != "undefined" ? renderCtx.ControlMode : SPClientTemplates.ClientControlMode.View;

            if (renderCtx.ListSchema == null || renderCtx.ListSchema.Field == null)
                return resultSet;
            var allFields = renderCtx.ListSchema.Field;
            var numFields = allFields.length;

            for (var f = 0; f < numFields; f++) {
                var fld = allFields[f];

                if (fld != null) {
                    var fldName = fld['Name'];
                    var fldType = fld['FieldType'];
                    var fldKnownParentType = fld['Type'];
                    var fldMode = knownFieldModes[fldName] != null ? knownFieldModes[fldName] : defaultFieldMode;
                    var fldModeStr = SPClientTemplates.Utility.ControlModeToString(fldMode);
                    var regOverride = GetRegisteredOverride('Fields', fldName, fldModeStr);

                    if (regOverride != null) {
                        resultSet[fldName] = regOverride;
                    }
                    else {
                        if (typeof registeredFieldTypes[fldType] != "undefined" && typeof registeredFieldTypes[fldType][fldModeStr] != "undefined") {
                            resultSet[fldName] = registeredFieldTypes[fldType][fldModeStr];
                        }
                        else {
                            var fldTmpl = GetRegisteredOverrideOrDefault('Fields', fldType, fldModeStr);

                            if (fldTmpl == null)
                                fldTmpl = ResolveTemplateByKey('Fields', fldKnownParentType, fldModeStr);
                            resultSet[fldName] = fldTmpl;
                            if (!registeredFieldTypes[fldType])
                                registeredFieldTypes[fldType] = {};
                            registeredFieldTypes[fldType][fldModeStr] = fldTmpl;
                        }
                    }
                }
            }
            return resultSet;
        }
        function ResolveTemplateByKey(tagName, tempKey, fieldMode) {
            var result = GetRegisteredOverrideOrDefault(tagName, tempKey, fieldMode);

            if (result == null)
                result = GetSimpleSPTemplateByTag(tagName, fieldMode);
            return result;
        }
        function ResolveTemplateKeyByViewStyle(vsOverride, tempKey, fieldMode) {
            if (typeof vsOverride == "undefined")
                return null;
            var result = CheckType(vsOverride[typeInfo.ltype], typeInfo.viewId, tempKey, fieldMode);

            if (result == null)
                result = CheckType(vsOverride['all'], typeInfo.viewId, tempKey, fieldMode);
            return result;
        }
        function GetRegisteredOverride(tagName, tempKey, fieldMode) {
            var tplOverrides = registeredOverrides[tagName];
            var result = null;

            if (!typeInfo.defaultViewStyle)
                result = ResolveTemplateKeyByViewStyle(tplOverrides[typeInfo.viewStyle], tempKey, fieldMode);
            if (result == null)
                result = ResolveTemplateKeyByViewStyle(tplOverrides['default'], tempKey, fieldMode);
            return result;
        }
        function GetRegisteredOverrideOrDefault(tagName, tempKey, fieldMode) {
            var tplOverrides = registeredOverrides[tagName];
            var tplDefaults = SPClientTemplates._defaultTemplates[tagName];
            var result = null;

            if (!typeInfo.defaultViewStyle) {
                result = ResolveTemplateKeyByViewStyle(tplOverrides[typeInfo.viewStyle], tempKey, fieldMode);
                if (result == null)
                    result = ResolveTemplateKeyByViewStyle(tplDefaults[typeInfo.viewStyle], tempKey, fieldMode);
            }
            if (result == null)
                result = ResolveTemplateKeyByViewStyle(tplOverrides['default'], tempKey, fieldMode);
            if (result == null)
                result = ResolveTemplateKeyByViewStyle(tplDefaults['default'], tempKey, fieldMode);
            return result;
        }
        function CheckType(viewOverrides, viewId, key, fMode) {
            var result = null;
            var overrides = CheckView(viewOverrides, viewId);

            if (overrides != null) {
                if (typeof overrides[key] != "undefined")
                    result = overrides[key];
                if (result == null && typeof overrides["__DefaultTemplate__"] != "undefined")
                    result = overrides["__DefaultTemplate__"];
            }
            if (result != null && typeof fMode != "undefined")
                result = result[fMode];
            return result;
        }
        function CheckView(listOverrides, viewId) {
            if (typeof listOverrides != "undefined") {
                if (typeof listOverrides[viewId] != "undefined")
                    return listOverrides[viewId];
                if (typeof listOverrides['all'] != "undefined")
                    return listOverrides['all'];
            }
            return null;
        }
        function GetSimpleSPTemplateByTag(tplTag, fMode) {
            var result = null;

            switch (tplTag) {
            case 'View':
                result = RenderViewTemplate;
                break;
            case 'Header':
                result = '';
                break;
            case 'Body':
                result = RenderGroupTemplateDefault;
                break;
            case 'Footer':
                result = '';
                break;
            case 'Group':
                result = RenderItemTemplateDefault;
                break;
            case 'Item':
                result = RenderFieldTemplateDefault;
                break;
            case 'Fields':
                result = fMode == 'NewForm' || fMode == 'EditForm' ? SPFieldText_Edit : RenderFieldValueDefault;
                break;
            }
            return result;
        }
        function ResolveRenderCallbacks() {
            var preRender = [], postRender = [];
            var regPreRender = registeredOverrides['OnPreRender'];
            var regPostRender = registeredOverrides['OnPostRender'];

            if (!typeInfo.defaultViewStyle) {
                CheckViewStyleCallbacks(preRender, regPreRender[typeInfo.viewStyle]);
                CheckViewStyleCallbacks(postRender, regPostRender[typeInfo.viewStyle]);
            }
            CheckViewStyleCallbacks(preRender, regPreRender['default']);
            CheckViewStyleCallbacks(postRender, regPostRender['default']);
            renderCtx.OnPreRender = preRender;
            renderCtx.OnPostRender = postRender;
        }
        function CheckViewStyleCallbacks(set, viewStyleCallbacks) {
            if (typeof viewStyleCallbacks != "undefined") {
                CheckListCallbacks(set, viewStyleCallbacks['all'], typeInfo.viewId);
                CheckListCallbacks(set, viewStyleCallbacks[typeInfo.ltype], typeInfo.viewId);
            }
        }
        function CheckListCallbacks(resSet, listCallbacks, viewId) {
            if (typeof listCallbacks != "undefined") {
                if (typeof listCallbacks['all'] != "undefined")
                    GetViewCallbacks(resSet, listCallbacks['all']);
                if (typeof listCallbacks[viewId] != "undefined")
                    GetViewCallbacks(resSet, listCallbacks[viewId]);
            }
        }
        function GetViewCallbacks(rSet, viewCallbacks) {
            if (typeof viewCallbacks != "undefined") {
                if (typeof viewCallbacks == "function")
                    rSet.push(viewCallbacks);
                else {
                    var newLen = viewCallbacks.length;

                    if (typeof newLen == "number") {
                        for (var n = 0; n < Number(newLen); n++) {
                            if (typeof viewCallbacks[n] == "function")
                                rSet.push(viewCallbacks[n]);
                        }
                    }
                }
            }
        }
        function GetItemsKey(c) {
            var itemsKey = c.ListDataJSONItemsKey;

            return typeof itemsKey != "string" || itemsKey == '' ? 'Items' : itemsKey;
        }
    };
    SPClientTemplates.Utility = {};
    SPClientTemplates.Utility.ComputeResolveTypeInfo = function(rCtx) {
        return new SPTemplateManagerResolveTypeInfo(rCtx);
    };
    SPTemplateManagerResolveTypeInfo_InitializePrototype();
    SPClientTemplates.Utility.ComputeRegisterTypeInfo = function(rCtx) {
        return new SPTemplateManagerRegisterTypeInfo(rCtx);
    };
    SPTemplateManagerRegisterTypeInfo_InitializePrototype();
    SPClientTemplates.Utility.ControlModeToString = function(mode) {
        var modeObj = SPClientTemplates.ClientControlMode;

        if (mode == modeObj.DisplayForm)
            return 'DisplayForm';
        if (mode == modeObj.EditForm)
            return 'EditForm';
        if (mode == modeObj.NewForm)
            return 'NewForm';
        if (mode == modeObj.View)
            return 'View';
        return 'Invalid';
    };
    SPClientTemplates.Utility.FileSystemObjectTypeToString = function(type) {
        var typeObj = SPClientTemplates.FileSystemObjectType;

        if (type == typeObj.File)
            return 'File';
        if (type == typeObj.Folder)
            return 'Folder';
        if (type == typeObj.Web)
            return 'Web';
        return 'Invalid';
    };
    SPClientTemplates.Utility.ChoiceFormatTypeToString = function(formatParam) {
        var formatObj = SPClientTemplates.ChoiceFormatType;

        if (formatParam == formatObj.Radio)
            return 'Radio';
        if (formatParam == formatObj.Dropdown)
            return 'DropDown';
        return 'Invalid';
    };
    SPClientTemplates.Utility.RichTextModeToString = function(mode) {
        var modeObj = SPClientTemplates.RichTextMode;

        if (mode == modeObj.Compatible)
            return 'Compatible';
        if (mode == modeObj.FullHtml)
            return 'FullHtml';
        if (mode == modeObj.HtmlAsXml)
            return 'HtmlAsXml';
        if (mode == modeObj.ThemeHtml)
            return 'ThemeHtml';
        return 'Invalid';
    };
    SPClientTemplates.Utility.IsValidControlMode = function(mode) {
        var modeObj = SPClientTemplates.ClientControlMode;

        return mode == modeObj.NewForm || mode == modeObj.EditForm || mode == modeObj.DisplayForm || mode == modeObj.View;
    };
    SPClientTemplates.Utility.Trim = function(str) {
        if (str == null || typeof str != 'string' || str.length == 0)
            return '';
        if (str.length == 1 && str.charCodeAt(0) == 160)
            return '';
        return (str.replace(/^\s\s*/, '')).replace(/\s\s*$/, '');
    };
    SPClientTemplates.Utility.InitContext = function(webUrl) {
        if (typeof SP != "undefined" && typeof SP.ClientContext != "undefined")
            return new SP.ClientContext(webUrl);
        return null;
    };
    SPClientTemplates.Utility.GetControlOptions = function(ctrlNode) {
        if (ctrlNode == null)
            return null;
        var result;
        var options = ctrlNode.getAttribute("data-sp-options");

        try {
            var script = "(function () { return " + options + "; })();";

            result = eval(script);
        }
        catch (e) {
            result = null;
        }
        return result;
    };
    SPClientTemplates.Utility.UserLookupDelimitString = ';#';
    SPClientTemplates.Utility.UserMultiValueDelimitString = ',#';
    SPClientTemplates.Utility.TryParseInitialUserValue = function(userStr) {
        var uValRes;

        if (userStr == null || userStr == '') {
            uValRes = '';
            return uValRes;
        }
        var lookupIdx = userStr.indexOf(SPClientTemplates.Utility.UserLookupDelimitString);

        if (lookupIdx == -1) {
            uValRes = userStr;
            return uValRes;
        }
        var userValues = userStr.split(SPClientTemplates.Utility.UserLookupDelimitString);

        if (userValues.length % 2 != 0) {
            uValRes = '';
            return uValRes;
        }
        uValRes = [];
        var v = 0;

        while (v < userValues.length) {
            var r = new SPClientFormUserValue();
            var allUserData = userValues[v++];

            allUserData += SPClientTemplates.Utility.UserLookupDelimitString;
            allUserData += userValues[v++];
            r.initFromUserString(allUserData);
            uValRes.push(r);
        }
        return uValRes;
    };
    SPClientTemplates.Utility.TryParseUserControlValue = function(userStr, separator) {
        var userArray = [];

        if (userStr == null || userStr == '')
            return userArray;
        var delimit = separator + ' ';
        var multipleUsers = userStr.split(delimit);

        if (multipleUsers.length == 0)
            return userArray;
        for (var v = 0; v < multipleUsers.length; v++) {
            var uStr = SPClientTemplates.Utility.Trim(multipleUsers[v]);

            if (uStr == '')
                continue;
            if (uStr.indexOf(SPClientTemplates.Utility.UserLookupDelimitString) != -1) {
                var r = new SPClientFormUserValue();

                r.initFromUserString(uStr);
                userArray.push(r);
            }
            else
                userArray.push(uStr);
        }
        return userArray;
    };
    SPClientTemplates.Utility.GetPropertiesFromPageContextInfo = function(rCtx) {
        if (rCtx == null)
            return;
        var info = window['_spPageContextInfo'];

        if (typeof info != "undefined") {
            rCtx.SiteClientTag = info.siteClientTag;
            rCtx.CurrentLanguage = info.currentLanguage;
            rCtx.CurrentCultureName = info.currentCultureName;
            rCtx.CurrentUICultureName = info.currentUICultureName;
        }
    };
    SPClientTemplates.Utility.ReplaceUrlTokens = function(tokenUrl) {
        return SPClientRenderer.ReplaceUrlTokens(tokenUrl);
    };
    SPClientFormUserValue_InitializePrototype();
    SPClientTemplates.Utility.ParseLookupValue = function(valueStr) {
        var lValue = {
            'LookupId': '0',
            'LookupValue': ''
        };

        if (valueStr == null || valueStr == '')
            return lValue;
        var delimitIdx = valueStr.indexOf(';#');

        if (delimitIdx == -1) {
            lValue.LookupId = valueStr;
            return lValue;
        }
        lValue.LookupId = valueStr.substr(0, delimitIdx);
        lValue.LookupValue = (valueStr.substr(delimitIdx + 2)).replace(/;;/g, ';');
        return lValue;
    };
    SPClientTemplates.Utility.ParseMultiLookupValues = function(valueStr) {
        if (valueStr == null || valueStr == '')
            return [];
        var valueArray = [];
        var valueLength = valueStr.length;
        var beginning = 0, end = 0;
        var bEscapeCharactersFound = false;

        while (end < valueLength) {
            if (valueStr[end] == ';') {
                if (++end >= valueLength)
                    break;
                if (valueStr[end] == '#') {
                    if (end - 1 > beginning) {
                        var foundValue = valueStr.substr(beginning, end - beginning - 1);

                        if (bEscapeCharactersFound)
                            foundValue = foundValue.replace(/;;/g, ';');
                        valueArray.push(foundValue);
                        bEscapeCharactersFound = false;
                    }
                    beginning = ++end;
                    continue;
                }
                else if (valueStr[end] == ';') {
                    end++;
                    bEscapeCharactersFound = true;
                    continue;
                }
                else
                    return [];
            }
            end++;
        }
        if (end > beginning) {
            var lastValue = valueStr.substr(beginning, end - beginning);

            if (bEscapeCharactersFound)
                lastValue = lastValue.replace(/;;/g, ';');
            valueArray.push(lastValue);
        }
        var resultArray = [];
        var resultLength = valueArray.length;

        for (var resultCount = 0; resultCount < resultLength; resultCount++)
            resultArray.push({
                'LookupId': valueArray[resultCount++],
                'LookupValue': valueArray[resultCount]
            });
        return resultArray;
    };
    SPClientTemplates.Utility.BuildLookupValuesAsString = function(choicesArray, isMultiLookup, setGroupDesc) {
        if (choicesArray == null || choicesArray.length == 0)
            return '';
        var choicesStr = '';
        var firstOption = true;

        for (var choiceIdx = 0; choiceIdx < choicesArray.length; choiceIdx++) {
            var curChoice = choicesArray[choiceIdx];

            if (!isMultiLookup) {
                if (!firstOption)
                    choicesStr += "|";
                firstOption = false;
                choicesStr += curChoice.LookupValue.replace(/\x7C/g, "||");
                choicesStr += "|";
                choicesStr += curChoice.LookupId;
            }
            else {
                if (!firstOption)
                    choicesStr += "|t";
                firstOption = false;
                choicesStr += curChoice.LookupId;
                choicesStr += "|t";
                choicesStr += curChoice.LookupValue.replace(/\x7C/g, "||");
                if (setGroupDesc)
                    choicesStr += "|t |t ";
            }
        }
        return choicesStr;
    };
    SPClientTemplates.Utility.ParseURLValue = function(valueStr) {
        var urlValue = {
            'URL': 'http://',
            'Description': ''
        };

        if (valueStr == null || valueStr == '')
            return urlValue;
        var idx = 0;

        while (idx < valueStr.length) {
            if (valueStr[idx] == ',') {
                if (idx == valueStr.length - 1) {
                    valueStr = valueStr.substr(0, valueStr.length - 1);
                    break;
                }
                else if (idx + 1 < valueStr.length && valueStr[idx + 1] == ' ') {
                    break;
                }
                else {
                    idx++;
                }
            }
            idx++;
        }
        if (idx < valueStr.length) {
            urlValue.URL = (valueStr.substr(0, idx)).replace(/\,\,/g, ',');
            var remainderLen = valueStr.length - (idx + 2);

            if (remainderLen > 0)
                urlValue.Description = valueStr.substr(idx + 2, remainderLen);
        }
        else {
            urlValue.URL = valueStr.replace(/\,\,/g, ',');
            urlValue.Description = valueStr.replace(/\,\,/g, ',');
        }
        return urlValue;
    };
    SPClientTemplates.Utility.GetFormContextForCurrentField = function(renderContext) {
        if (renderContext == null || renderContext.FormContext == null)
            return null;
        var formCtx = new ClientFormContext(renderContext.FormContext);

        formCtx.fieldValue = renderContext.CurrentFieldValue;
        formCtx.fieldSchema = renderContext.CurrentFieldSchema;
        formCtx.fieldName = formCtx.fieldSchema != null ? formCtx.fieldSchema.Name : '';
        formCtx.controlMode = renderContext.ControlMode == null ? SPClientTemplates.ClientControlMode.Invalid : renderContext.ControlMode;
        return formCtx;
    };
    SPClientTemplates._defaultTemplates = {};
    SPClientTemplates._defaultTemplates['View'] = {
        'default': {
            'all': {
                'Callout': CalloutRenderViewTemplate
            }
        }
    };
    SPClientTemplates._defaultTemplates['Header'] = {
        'default': {
            'all': {
                'Callout': CalloutRenderHeaderTemplate
            }
        }
    };
    SPClientTemplates._defaultTemplates['Body'] = {
        'default': {
            'all': {
                'Callout': CalloutRenderBodyTemplate
            }
        }
    };
    SPClientTemplates._defaultTemplates['Footer'] = {
        'default': {
            'all': {
                'Callout': CalloutRenderFooterTemplate
            }
        }
    };
    SPClientTemplates._defaultTemplates['Group'] = {};
    SPClientTemplates._defaultTemplates['Item'] = {
        'default': {
            'all': {
                'Callout': {
                    '__DefaultTemplate__': CalloutRenderItemTemplate
                }
            }
        }
    };
    SPClientTemplates._defaultTemplates['Fields'] = {};
    RenderBodyTemplate = function(renderCtx) {
        var itemTpls = renderCtx.Templates['Item'];

        if (itemTpls == null || itemTpls == {})
            return '';
        var listData = renderCtx.ListData;
        var listSchema = renderCtx.ListSchema;
        var bHasHeader = renderCtx.Templates.Header != '';
        var iStr = '';

        if (bHasHeader) {
            if (renderCtx.Templates.Header == null)
                iStr += RenderTableHeader(renderCtx);
            var aggregate = listSchema.Aggregate;

            if (aggregate != null && listData.Row.length > 0 && !listSchema.groupRender)
                iStr += RenderAggregate(renderCtx, null, listData.Row[0], listSchema, null, true, aggregate);
            iStr += '<script id="scriptBody';
            iStr += renderCtx.wpq;
            iStr += '"></script>';
        }
        else {
            iStr = '<table onmousedown="return OnTableMouseDown(event);">';
        }
        if (renderCtx.inGridMode) {
            if (!renderCtx.bInitialRender) {
                iStr += RenderSPGridBody(renderCtx);
            }
            return iStr;
        }
        var group1 = listSchema.group1;
        var group2 = listSchema.group2;
        var expand = listSchema.Collapse == null || listSchema.Collapse != "TRUE";
        var renderGroup = Boolean(ctx.ExternalDataList);
        var ItemTpl = renderCtx.Templates['Item'];

        if (ItemTpl == null || ItemTpl == RenderFieldTemplateDefault || typeof ItemTpl != "function" && typeof ItemTpl != "string")
            ItemTpl = RenderItemTemplate;
        else if (typeof ItemTpl == "string")
            ItemTpl = SPClientRenderer.ParseTemplateString(ItemTpl, renderCtx);
        for (var idx = 0; idx < listData.Row.length; idx++) {
            var listItem = listData.Row[idx];

            if (idx == 0) {
                listItem.firstRow = true;
                if (group1 != null) {
                    iStr += '<input type="hidden" id="GroupByColFlag"/><input type="hidden" id="GroupByWebPartID';
                    iStr += renderCtx.ctxId;
                    iStr += '" webPartID="';
                    iStr += listSchema.View;
                    iStr += '"/><tbody id="GroupByCol';
                    iStr += listSchema.View;
                    iStr += '"><tr id="GroupByCol';
                    iStr += renderCtx.ctxId;
                    iStr += '" queryString ="';
                    iStr += listData.FilterLink;
                    iStr += '"/></tbody >';
                }
            }
            var itemType = listItem['ContentType'];
            var tpl = itemTpls[itemType];

            if (tpl == null || tpl == '') {
                tpl = ItemTpl;
            }
            else if (typeof tpl == 'string') {
                tpl = SPClientRenderer.ParseTemplateString(tpl, renderCtx);
                itemTpls[itemType] = tpl;
            }
            if (listSchema.group1 != null) {
                iStr += RenderGroup(renderCtx, listItem);
            }
            if (expand || renderGroup) {
                renderCtx.CurrentItem = listItem;
                renderCtx.CurrentItemIdx = idx;
                iStr += CoreRender(tpl, renderCtx);
                renderCtx.CurrentItem = null;
                renderCtx.CurrentItemIdx = -1;
            }
        }
        iStr += '</table>';
        AddPostRenderCallback(renderCtx, OnPostRenderTabularListView);
        return iStr;
    };
    RenderItemTemplate = function(renderCtx) {
        var listItem = renderCtx.CurrentItem;
        var listSchema = renderCtx.ListSchema;
        var idx = renderCtx.CurrentItemIdx;
        var cssClass = idx % 2 == 1 ? "ms-alternating " : "";

        if (FHasRowHoverBehavior(renderCtx)) {
            cssClass += " ms-itmHoverEnabled ";
        }
        var ret = [];

        ret.push('<tr class="');
        ret.push(cssClass);
        if (listSchema.TabularView != undefined && listSchema.TabularView == "1") {
            ret.push('ms-itmhover');
            ret.push('" oncontextmenu="');
            if (DoesListUseCallout(renderCtx)) {
                ret.push("return ShowCallOutOrECBWrapper(this, event, true)");
            }
            else {
                ret.push("return ShowCallOutOrECBWrapper(this, event, false)");
            }
        }
        ret.push('" iid="');
        var iid = GenerateIID(renderCtx);

        ret.push(iid);
        ret.push('" id="');
        ret.push(iid);
        ret.push('">');
        if (listSchema.TabularView != undefined && listSchema.TabularView == "1") {
            ret.push('<td class="ms-cellStyleNonEditable ms-vb-itmcbx ms-vb-imgFirstCell" tabindex=0 role="checkbox"><div class="s4-itm-cbx s4-itm-imgCbx" tabindex="-1"><span class="s4-itm-imgCbx-inner"><span class="ms-selectitem-span"><img class="ms-selectitem-icon" alt="" src="');
            ret.push(GetThemedImageUrl("spcommon.png"));
            ret.push('"/></span></span></div></td>');
        }
        var fields = listSchema ? listSchema.Field : null;

        for (var f in fields) {
            var field = fields[f];

            if (field.GroupField != null)
                break;
            ret.push('<td class="');
            if (field.css == null) {
                field.css = GetCSSClassForFieldTd(renderCtx, field);
                if (field.CalloutMenu == 'TRUE' || field.ClassInfo == 'Menu' || field.listItemMenu == 'TRUE') {
                    field.css += '" IsECB="TRUE';
                    if (field.CalloutMenu == 'TRUE') {
                        field.css += '" IsCallOut="TRUE';
                    }
                    if (field.ClassInfo == 'Menu' || field.listItemMenu == 'TRUE') {
                        field.css += '" height="100%';
                    }
                }
            }
            renderCtx.CurrentFieldSchema = field;
            ret.push(field.css);
            ret.push('">');
            ret.push(spMgr.RenderField(renderCtx, field, listItem, listSchema));
            ret.push('</td>');
            renderCtx.CurrentFieldSchema = null;
        }
        ret.push('</tr>');
        return ret.join('');
    };
    RenderHeaderTemplate = function(renderCtx, fRenderHeaderColumnNames) {
        var listSchema = renderCtx.ListSchema;
        var listData = renderCtx.ListData;
        var ret = [];

        if (fRenderHeaderColumnNames == null) {
            fRenderHeaderColumnNames = true;
        }
        ret.push(RenderTableHeader(renderCtx));
        ret.push('<thead id="');
        ret.push("js-listviewthead-" + renderCtx.wpq);
        ret.push('"><tr valign="top" class="ms-viewheadertr');
        if (listSchema.Direction == 'rtl')
            ret.push(' ms-vhrtl');
        else
            ret.push(' ms-vhltr');
        ret.push('">');
        if (listSchema.TabularView != undefined && listSchema.TabularView == "1") {
            ret.push('<th class="ms-headerCellStyleIcon ms-vh-icon ms-vh-selectAllIcon" scope="col">');
            RenderSelectAllCbx(renderCtx, ret);
            ret.push('</th>');
        }
        if (fRenderHeaderColumnNames) {
            var fields = listSchema ? listSchema.Field : null;
            var counter = 1;

            for (var f in fields) {
                var field = fields[f];

                if (field.DisplayName == null)
                    continue;
                if (field.GroupField != null)
                    break;
                field.counter = counter++;
                ret.push(spMgr.RenderHeader(renderCtx, field));
            }
        }
        if (listSchema.TabularView == "1" && renderCtx.BasePermissions.ManageLists && renderCtx.ListTemplateType != 160) {
            ret.push('<th class="ms-vh-icon" scope="col" title=""><span class="ms-addcolumn-span"> </span></th>');
        }
        ret.push("</tr>");
        ret.push("</thead>");
        return ret.join('');
    };
    RenderFooterTemplate = function(renderCtx) {
        var ret = [];

        RenderEmptyText(ret, renderCtx);
        RenderPaging(ret, renderCtx);
        return ret.join('');
    };
    RenderHeroParameters_InitializePrototype();
    DocumentType = {
        Invalid: 0,
        Word: 1,
        Excel: 2,
        PowerPoint: 3,
        OneNote: 4,
        Folder: 5,
        Max: 6
    };
    DocumentInformation.prototype = {
        type: undefined,
        idToken: undefined,
        imgSrc: undefined,
        imgAlt: undefined,
        textLabel: undefined
    };
    c_newdocWOPIID = 'js-newdocWOPI-';
    c_newDocDivHtml = ['<a id="{0}" class="ms-newdoc-callout-item ms-displayBlock" onclick="{5}" href="#">', '<img id="{1}" src="{2}" alt="{3}" class="ms-verticalAlignMiddle ms-newdoc-callout-img"/>', '<h3 id="{4}" class="ms-displayInline ms-newdoc-callout-text ms-verticalAlignMiddle ms-soften">{6}</h3></a>'].join('');
    c_onClickCreateDoc = 'CalloutManager.closeAll(); OpenPopUpPageWithTitle(&quot;{0}&TemplateType={1}&quot;, OnCloseDialogNavigate); return false;';
    c_newDocCalloutWidth = 280;
    NewDocumentInfo = InitializeNewDocumentInfo();
    ComputedFieldWorker = (function() {
        function NewGif(listItem, listSchema, ret) {
            if (listItem["Created_x0020_Date.ifnew"] == "1") {
                var spCommonSrc = GetThemedImageUrl("spcommon.png");

                ret.push("<span class=\"ms-newdocument-iconouter\"><img class=\"ms-newdocument-icon\" src=\"");
                ret.push(spCommonSrc);
                ret.push("\" alt=\"");
                ret.push(Strings.STS.L_SPClientNew);
                ret.push("\" title=\"");
                ret.push(Strings.STS.L_SPClientNew);
                ret.push("\" /></span>");
            }
        }
        function GenBlogLink(link, altText, position, titleText, descText, listSchema, listItem) {
            var ret = [];

            ret.push("<span style=\"vertical-align:middle\">");
            ret.push("<span style=\"height:16px;width:16px;position:relative;display:inline-block;overflow:hidden;\" class=\"s4-clust\"><a href=\"");
            ret.push(link);
            GenPostLink(ret, listSchema, listItem);
            ret.push("\" style=\"height:16px;width:16px;display:inline-block;\" ><img src=\"" + "/_layouts/15/images/fgimg.png" + "\" alt=\"");
            ret.push(altText);
            ret.push("\" style=\"left:-0px !important;top:");
            ret.push(position);
            ret.push("px !important;position:absolute;\" title=\"");
            ret.push(titleText);
            ret.push("\" class=\"imglink\" longDesc=\"");
            ret.push(descText);
            ret.push("\"></a>");
            ret.push("</span>");
            ret.push("</span>");
            return ret.join('');
        }
        function GenPostLink(ret, listSchema, listItem) {
            ret.push(listSchema.HttpVDir);
            ret.push("/Lists/Posts/Post.aspx?ID=");
            ret.push(listItem.ID);
        }
        function GetFolderIconSourcePath(listItem) {
            if (listItem["HTML_x0020_File_x0020_Type.File_x0020_Type.mapico"] == '')
                return "/_layouts/15/images/folder.gif";
            else
                return "/_layouts/15/images/" + listItem["HTML_x0020_File_x0020_Type.File_x0020_Type.mapico"];
        }
        function LinkFilenameNoMenu(listItem, listSchema) {
            var ret = [];
            var fileUrl = listItem.FileRef;

            if (fileUrl != null && typeof fileUrl != 'undefined' && TrimSpaces(fileUrl) != "") {
                if (listItem.FSObjType == '1') {
                    if (listSchema.IsDocLib == '1') {
                        RenderDocFolderLink(ret, listItem.FileLeafRef, listItem, listSchema);
                    }
                    else {
                        RenderListFolderLink(ret, listItem.FileLeafRef, listItem, listSchema);
                    }
                }
                else {
                    ret.push("<a class='ms-listlink' href=\"");
                    ret.push(listItem.FileRef);
                    ret.push("\" onmousedown=\"return VerifyHref(this,event,'");
                    ret.push(listSchema.DefaultItemOpen);
                    ret.push("','");
                    ret.push(listItem["HTML_x0020_File_x0020_Type.File_x0020_Type.mapcon"]);
                    ret.push("','");
                    ret.push(listItem["serverurl.progid"]);
                    ret.push("')\" onclick=\"");
                    ret.push("return DispEx(this,event,'TRUE','FALSE','");
                    ret.push(listItem["File_x0020_Type.url"]);
                    ret.push("','");
                    ret.push(listItem["File_x0020_Type.progid"]);
                    ret.push("','");
                    ret.push(listSchema.DefaultItemOpen);
                    ret.push("','");
                    ret.push(listItem["HTML_x0020_File_x0020_Type.File_x0020_Type.mapcon"]);
                    ret.push("','");
                    ret.push(listItem["HTML_x0020_File_x0020_Type"]);
                    ret.push("','");
                    ret.push(listItem["serverurl.progid"]);
                    ret.push("','");
                    ret.push(Boolean(listItem["CheckoutUser"]) ? listItem["CheckoutUser"][0].id : '');
                    ret.push("','");
                    ret.push(listSchema.Userid);
                    ret.push("','");
                    ret.push(listSchema.ForceCheckout);
                    ret.push("','");
                    ret.push(listItem.IsCheckedoutToLocal);
                    ret.push("','");
                    ret.push(listItem.PermMask);
                    ret.push("')\">");
                    var fileRef = listItem["FileLeafRef"];

                    if (fileRef != null) {
                        var index = fileRef.lastIndexOf('.');

                        fileRef = index >= 0 ? fileRef.substring(0, index) : fileRef;
                    }
                    ret.push(fileRef);
                    ret.push("</a>");
                    NewGif(listItem, listSchema, ret);
                }
            }
            else {
                ret.push("<nobr>");
                ret.push(listItem["FileLeafRef"]);
                ret.push("</nobr>");
            }
            return ret.join('');
        }
        function RenderType(renderCtx, field, listItem, listSchema) {
            var ret = [];

            if (listItem.FSObjType == '1') {
                ret.push("<a href=\"");
                ret.push(listSchema.PagePath);
                ret.push("?RootFolder=");
                ret.push(escapeProperly(listItem.FileRef));
                ret.push(listSchema.ShowWebPart);
                ret.push("&FolderCTID=");
                ret.push(listItem.ContentTypeId);
                ret.push("&View=");
                ret.push(escapeProperly(listSchema.View));
                ret.push("\" onmousedown=\"VerifyFolderHref(this, event, '");
                ret.push(listItem["File_x0020_Type.url"]);
                ret.push("','");
                ret.push(listItem["File_x0020_Type.progid"]);
                ret.push("','");
                ret.push(listSchema.DefaultItemOpen);
                ret.push("', '");
                ret.push(listItem["HTML_x0020_File_x0020_Type.File_x0020_Type.mapcon"]);
                ret.push("', '");
                ret.push(listItem["HTML_x0020_File_x0020_Type"]);
                ret.push("', '");
                ret.push(listItem["serverurl.progid"]);
                ret.push("')\" onclick=\"return HandleFolder(this,event,'");
                ret.push(listSchema.PagePath);
                ret.push("?RootFolder=");
                ret.push(escapeProperly(listItem.FileRef));
                ret.push(listSchema.ShowWebPart);
                ret.push("&FolderCTID=");
                ret.push(listItem.ContentTypeId);
                ret.push("&View=");
                ret.push(escapeProperly(listSchema.View));
                ret.push("','TRUE','FALSE','");
                ret.push(listItem["File_x0020_Type.url"]);
                ret.push("','");
                ret.push(listItem["File_x0020_Type.progid"]);
                ret.push("','");
                ret.push(listSchema.DefaultItemOpen);
                ret.push("','");
                ret.push(listItem["HTML_x0020_File_x0020_Type.File_x0020_Type.mapcon"]);
                ret.push("','");
                ret.push(listItem["HTML_x0020_File_x0020_Type"]);
                ret.push("','");
                ret.push(listItem["serverurl.progid"]);
                ret.push("','");
                ret.push(Boolean(listItem["CheckoutUser"]) ? listItem["CheckoutUser"][0].id : '');
                ret.push("','");
                ret.push(listSchema.Userid);
                ret.push("','");
                ret.push(listSchema.ForceCheckout);
                ret.push("','");
                ret.push(listItem.IsCheckedoutToLocal);
                ret.push("','");
                ret.push(listItem.PermMask);
                ret.push("');\"><img border=\"0\" alt=\"");
                ret.push(listItem.FileLeafRef);
                ret.push("\" title=\"");
                ret.push(listItem.FileLeafRef);
                ret.push("\" src=\"");
                ret.push(GetFolderIconSourcePath(listItem));
                ret.push("\" />");
                if (typeof listItem.IconOverlay != 'undefined' && listItem.IconOverlay != '') {
                    ret.push("<img width=\"16\" height=\"16\" src=\"" + "/_layouts/15/images/");
                    ret.push(listItem["IconOverlay.mapoly"]);
                    ret.push("\" class=\"ms-vb-icon-overlay\" alt=\"\" title=\"\" />");
                }
                ret.push("</a>");
            }
            else {
                if (listSchema.IsDocLib == '1') {
                    if (typeof listItem.IconOverlay == 'undefined' || listItem.IconOverlay == '') {
                        if (typeof listItem["CheckoutUser"] == 'undefined' || listItem["CheckoutUser"] == '') {
                            ret.push('<img width=\"16\" height=\"16\" border="0" alt="');
                            ret.push(listItem.FileLeafRef);
                            ;
                            ret.push('" title="');
                            ret.push(listItem.FileLeafRef);
                            ;
                            ret.push('" src="' + '/_layouts/15/images/');
                            ret.push(listItem["HTML_x0020_File_x0020_Type.File_x0020_Type.mapico"]);
                            ret.push('"');
                            if (Boolean(listItem["HTML_x0020_File_x0020_Type.File_x0020_Type.isIconDynamic"])) {
                                ret.push(' onclick="this.style.display=\'none\';"');
                            }
                            ret.push('/>');
                        }
                        else {
                            ret.push('<img width="16" height="16" border="0" alt="');
                            var alttext = listItem.FileLeafRef + "&#10;" + Strings.STS.L_SPCheckedoutto + ": " + (Boolean(listItem["CheckoutUser"]) ? STSHtmlEncode(listItem["CheckoutUser"][0].title) : '');

                            ret.push(alttext);
                            ret.push('" title="');
                            ret.push(alttext);
                            ret.push('" src="' + '/_layouts/15/images/');
                            ret.push(listItem["HTML_x0020_File_x0020_Type.File_x0020_Type.mapico"]);
                            ret.push('" /><img src="' + '/_layouts/15/images/checkoutoverlay.gif' + '" class="ms-vb-icon-overlay" alt="');
                            ret.push(alttext);
                            ret.push('" title="');
                            ret.push(alttext);
                            ret.push('" />');
                        }
                    }
                    else {
                        RegularDocImage();
                        ret.push('<img width="16" height="16" src="' + '/_layouts/15/images/');
                        ret.push(listItem["IconOverlay.mapoly"]);
                        ret.push('" class="ms-vb-icon-overlay" alt="" title="" />');
                    }
                }
                else {
                    RegularDocImage();
                }
            }
            function RegularDocImage() {
                ret.push("<img width=\"16\" height=\"16\" border=\"0\" alt=\"");
                ret.push(listItem.FileLeafRef);
                ret.push("\" title=\"");
                ret.push(listItem.FileLeafRef);
                ret.push("\" src=\"" + "/_layouts/15/images/");
                ret.push(listItem["HTML_x0020_File_x0020_Type.File_x0020_Type.mapico"]);
                ret.push("\"/>");
            }
            return ret.join('');
        }
        function RenderListTitle(renderCtx, field, listItem, listSchema) {
            return RenderLinkToItem(renderCtx, listItem, listSchema, listItem.Title);
        }
        function RenderLinkToItem(renderCtx, listItem, listSchema, linkText) {
            var ret = [];

            if (listItem.FSObjType == '1') {
                if (listSchema.IsDocLib == '1') {
                    RenderDocFolderLink(ret, LinkTitleValue(linkText), listItem, listSchema);
                }
                else {
                    RenderListFolderLink(ret, LinkTitleValue(linkText), listItem, listSchema);
                }
            }
            else {
                RenderTitle(ret, renderCtx, listItem, listSchema, LinkTitleValue(linkText));
            }
            NewGif(listItem, listSchema, ret);
            return ret.join('');
        }
        function RenderThumbnail(renderCtx, field, listItem, listSchema) {
            var ret = [];

            ret.push('<a href="' + EncodeUrl(listItem["FileRef"]) + '">');
            ret.push('<img galleryimg="false" border="0"');
            ret.push(' id="' + listItem.ID + 'webImgShrinked"');
            ret.push(' class="ms-displayBlock"');
            var maxSize = (field.Name == "PreviewOnForm" ? "256" : "128") + "px";

            ret.push(' style="max-width: ' + maxSize + '; max-height: ' + maxSize + '; margin:auto; visibility: hidden;"');
            ret.push(' onerror="displayGenericDocumentIcon(event.srcElement ? event.srcElement : event.target, ' + listItem.FSObjType + '); return false;"');
            ret.push(' onload="(event.srcElement ? event.srcElement : event.target).style.visibility = \'visible\';"');
            ret.push(' alt="');
            var comments = listItem["_Comments"];

            if (comments != null && comments != '') {
                ret.push(STSHtmlEncode(comments));
            }
            else {
                ret.push(Strings.STS.L_ImgAlt_Text);
            }
            ret.push('" src="' + EncodeUrl(getDocumentIconAbsoluteUrl(listItem, 256, renderCtx)) + '"/>');
            ret.push('</a>');
            return ret.join('');
        }
        return {
            URLwMenu: function(renderCtx, field, listItem, listSchema) {
                var retValue;

                if (listItem.FSObjType == '1') {
                    var ret = [];

                    ret.push("<a onfocus=\"OnLink(this)\" href=\"SubmitFormPost()\" onclick=\"ClearSearchTerm('");
                    ret.push(listSchema.View);
                    ret.push("');ClearSearchTerm('');SubmitFormPost('");
                    ret.push(listSchema.PagePath);
                    ret.push("?RootFolder=");
                    ret.push(escapeProperly(listItem.FileRef));
                    ret.push(listSchema.ShowWebPart);
                    ret.push("&FolderCTID=");
                    ret.push(listItem.ContentTypeId);
                    ret.push("');return false;\">");
                    ret.push(listItem.FileLeafRef);
                    ret.push("</a>");
                    retValue = ret.join('');
                }
                else {
                    retValue = RenderUrl(listItem, "URL", listSchema, field, true);
                }
                return retValue;
            },
            URLNoMenu: function(renderCtx, field, listItem, listSchema) {
                return RenderUrl(listItem, "URL", listSchema, field, true);
            },
            mswh_Title: function(renderCtx, field, listItem, listSchema) {
                var ret = [];

                ret.push('<a onfocus="OnLink(this)" href="');
                ret.push(listItem.FileRef);
                ret.push('" onclick="LaunchWebDesigner(');
                ret.push("'");
                ret.push(listItem.FileRef);
                ret.push("','design'); return false;");
                ret.push('">');
                ret.push(LinkTitleValue(listItem.Title));
                ret.push('</a>');
                return ret.join('');
            },
            LinkTitle: RenderListTitle,
            LinkTitleNoMenu: RenderListTitle,
            Edit: function(renderCtx, field, listItem, listSchema) {
                if (HasEditPermission(listItem)) {
                    var id = ResolveId(listItem, listSchema);
                    var ret = [];

                    ret.push("<a href=\"");
                    ret.push(renderCtx.editFormUrl);
                    ret.push("&ID=");
                    ret.push(id);
                    ret.push("\" onclick=\"EditItemWithCheckoutAlert(event, '");
                    ret.push(renderCtx.editFormUrl);
                    ret.push("&ID=");
                    ret.push(id);
                    ret.push("', '");
                    ret.push(EditRequiresCheckout(listItem, listSchema));
                    ret.push("', '");
                    ret.push(listItem.IsCheckedoutToLocal);
                    ret.push("', '");
                    ret.push(escape(listItem.FileRef));
                    ret.push("', '");
                    ret.push(listSchema.HttpVDir);
                    ret.push("', '");
                    ret.push(listItem.CheckedOutUserId);
                    ret.push("', '");
                    ret.push(listSchema.Userid);
                    ret.push("');return false;\" target=\"_self\">");
                    ret.push("<img border=\"0\" alt=\"");
                    ret.push(Strings.STS.L_SPClientEdit);
                    ret.push("\" src=\"" + "/_layouts/15/images/edititem.gif" + "\"/></a>");
                    return ret.join('');
                }
                else {
                    return "&nbsp;";
                }
            },
            DocIcon: RenderType,
            MasterPageIcon: RenderType,
            LinkFilename: function(renderCtx, field, listItem, listSchema) {
                return LinkFilenameNoMenu(listItem, listSchema);
            },
            LinkFilenameNoMenu: function(renderCtx, field, listItem, listSchema) {
                return LinkFilenameNoMenu(listItem, listSchema);
            },
            NumCommentsWithLink: function(renderCtx, field, listItem, listSchema) {
                var ret = [];

                ret.push(GenBlogLink("", Strings.STS.L_SPClientNumComments, "-396", Strings.STS.L_SPClientNumComments, Strings.STS.L_SPClientNumComments, listSchema, listItem));
                ret.push("<span><a href=\"");
                GenPostLink(ret, listSchema, listItem);
                ret.push("\">&nbsp;");
                ret.push(listItem.NumComments);
                ret.push("&nbsp;");
                ret.push("Comment(s)");
                ret.push("</a></span>");
                return ret.join('');
            },
            EmailPostLink: function(renderCtx, field, listItem, listSchema) {
                return GenBlogLink("javascript:navigateMailToLink('", Strings.STS.L_SPEmailPostLink, "-267", Strings.STS.L_SPEmailPostLink, Strings.STS.L_SPEmailPostLink, listSchema, listItem);
            },
            Permalink: function(renderCtx, field, listItem, listSchema) {
                return GenBlogLink("", "Permanent Link to Post", "-412", "Permanent Link to Post", "Permanent Link to Post", listSchema, listItem);
            },
            CategoryWithLink: function(renderCtx, field, listItem, listSchema) {
                var ret = [];

                ret.push("<a class=\"static menu-item\" href=\"");
                ret.push(listSchema.HttpVDir);
                ret.push("/");
                ret.push("lists/Categories/Category.aspx?CategoryId=");
                ret.push(listItem.ID);
                ret.push("&Name=");
                ret.push(listItem.Title);
                ret.push("\" id=\"blgcat");
                ret.push(listItem.ID);
                ret.push("\"><span class=\"additional-backgroud\"><span class=\"menu-item-text\">");
                ret.push(listItem.Title);
                ret.push("</span></span></a>");
                return ret.join('');
            },
            LinkIssueIDNoMenu: function(renderCtx, field, listItem, listSchema) {
                var ret = [];

                ret.push("<a href=\"");
                ret.push(renderCtx.displayFormUrl);
                ret.push("&ID=");
                ret.push(listItem.ID);
                ret.push("\" onclick=\"EditLink2(this,");
                ret.push(renderCtx.ctxId);
                ret.push(");return false;\" target=\"_self\">");
                ret.push(listItem.ID);
                ret.push("</a>");
                return ret.join('');
            },
            SelectTitle: function(renderCtx, field, listItem, listSchema) {
                if (listSchema.SelectedID == listItem.ID || listSchema.SelectedID == '-1' && listItem.firstRow == true)
                    return '<img border="0" align="absmiddle" style="cursor: hand" src="' + '/_layouts/15/images/rbsel.gif' + '" alt="' + Strings.STS.L_SPSelected + '" />';
                else {
                    var ret = [];

                    ret.push("<a href=\"javascript:SelectField('");
                    ret.push(listSchema.View);
                    ret.push("','");
                    ret.push(listItem.ID);
                    ret.push("');return false;\" onclick=\"SelectField('");
                    ret.push(listSchema.View);
                    ret.push("','");
                    ret.push(listItem.ID);
                    ret.push("');return false;\" target=\"_self\">");
                    ret.push('<img border="0" align="absmiddle" style="cursor: hand" src="' + '/_layouts/15/images/rbunsel.gif' + '"  alt="');
                    ret.push(Strings.STS.L_SPGroupBoardTimeCardSettingsNotFlex);
                    ret.push('" /></a>');
                    return ret.join('');
                }
            },
            DisplayResponse: function(renderCtx, field, listItem, listSchema) {
                var ret = [];

                ret.push('<a onfocus="OnLink(this)" href="');
                ret.push(renderCtx.displayFormUrl);
                ret.push('&ID=');
                ret.push(listItem.ID);
                ret.push('" onclick="GoToLinkOrDialogNewWindow(this);return false;" target="_self" id="onetidViewResponse">');
                ret.push(Strings.STS.L_SPView_Response);
                ret.push(' #');
                ret.push(listItem.ID);
                ret.push('</a>');
                return ret.join('');
            },
            Completed: function(renderCtx, field, listItem, listSchema) {
                if (listItem["_Level"] == '1')
                    return Strings.STS.L_SPYes;
                else
                    return Strings.STS.L_SPNo;
            },
            RepairDocument: function(renderCtx, field, listItem, listSchema) {
                return '<input id="chkRepair" type="checkbox" title="' + Strings.STS.L_SPRelink + '" docID="' + listItem.ID + '" />';
            },
            Combine: function(renderCtx, field, listItem, listSchema) {
                if (listItem.FSObjType == '0') {
                    var ret = '<input id="chkCombine" type="checkbox" title="';

                    ret += Strings.STS.L_SPMerge;
                    ret += '" href="';
                    var url;

                    if (listItem.FSObjType == '0')
                        url = String(listSchema.HttpVDir) + String(listItem.FileRef);
                    else
                        url = listItem.FileRef;
                    ret += url + '" />';
                    ret += '<input id="chkUrl" type="hidden" href="';
                    ret += listItem.TemplateUrl;
                    ret += '" />';
                    ret += '<input id="chkProgID" type="hidden" href="';
                    ret += listItem["HTML_x0020_File_x0020_Type.File_x0020_Type.mapcon"];
                    ret += '" />';
                    return ret;
                }
                return '';
            },
            HealthReportSeverityIcon: function(renderCtx, field, listItem, listSchema) {
                var healthSeverity = new String(listItem.HealthReportSeverity);
                var index = healthSeverity.indexOf(" - ");

                healthSeverity = healthSeverity.substring(0, index);
                var pngUrl;

                if (healthSeverity == '1')
                    pngUrl = 'hltherr';
                else if (healthSeverity == '2')
                    pngUrl = 'hlthwrn';
                else if (healthSeverity == '3')
                    pngUrl = 'hlthinfo';
                else if (healthSeverity == '4')
                    pngUrl = 'hlthsucc';
                else
                    pngUrl = 'hlthfail';
                return '<img src="' + '/_layouts/15/images/' + pngUrl + '.png" alt="' + healthSeverity + '" />';
            },
            FileSizeDisplay: function(renderCtx, field, listItem, listSchema) {
                var ret = [];

                if (listItem.FSObjType == '0')
                    return String(Math.ceil(listItem.File_x0020_Size / 1024)) + ' KB';
                else
                    return '';
            },
            NameOrTitle: function(renderCtx, field, listItem, listSchema) {
                return RenderLinkToItem(renderCtx, listItem, listSchema, listItem["FileLeafRef"]);
            },
            ImageSize: function(renderCtx, field, listItem, listSchema) {
                var ret = [];

                if (listItem.FSObjType == '0') {
                    if (listItem["ImageWidth"] != '' && listItem["ImageWidth"] != '0') {
                        ret.push('<span dir="ltr">');
                        ret.push(listItem["ImageWidth"] + ' x ' + listItem["ImageHeight"]);
                        ret.push('</span>');
                    }
                }
                return ret.join('');
            },
            ThumbnailOnForm: RenderThumbnail,
            PreviewOnForm: RenderThumbnail,
            FileType: function(renderCtx, field, listItem, listSchema) {
                return listItem["File_x0020_Type"];
            }
        };
    })();
    ComputedFieldRenderer_InitializePrototype();
    RenderCalloutAffordance = function(fSelectItem, strListItemID, strCalloutLaunchPointID, fIsForTileView) {
        var ret = [];
        var isForTileView = Boolean(fIsForTileView);
        var anchorClassName = "ms-lstItmLinkAnchor " + (isForTileView ? "ms-ellipsis-a-tile" : "ms-ellipsis-a");

        ret.push("<a ms-jsgrid-click-passthrough=\"true\" class=\"" + anchorClassName + "\" title=\"");
        ret.push(STSHtmlEncode(Strings.STS.L_OpenMenu));
        ret.push("\"");
        if (fSelectItem) {
            ret.push("onclick=\"OpenCalloutAndSelectItem(this, event, this, '" + strListItemID + "'); return false;\" href=\"#\" id=\"" + strCalloutLaunchPointID + "\" >");
        }
        else {
            ret.push("onclick=\"OpenCallout(this, event, this, '" + strListItemID + "'); return false;\" href=\"#\" id=\"" + strCalloutLaunchPointID + "\" >");
        }
        var imageClassName = isForTileView ? "ms-ellipsis-icon-tile" : "ms-ellipsis-icon";

        ret.push("<img class=\"" + imageClassName + "\" src=\"" + GetThemedImageUrl("spcommon.png") + "\" alt=\"" + STSHtmlEncode(Strings.STS.L_OpenMenu) + "\" /></a>");
        return ret.join('');
    };
    RenderECB = function(renderCtx, listItem, field, content) {
        var ret = [];
        var listSchema = renderCtx.ListSchema;
        var strECBUrl = "/_layouts/15/" + listSchema.LCID + "/images/ecbbutton.png";

        ret.push("<div class=\"ms-vb ms-tableCell ms-list-TitleLink ms-vb-menuPadding itx\" CTXName=\"ctx");
        ret.push(renderCtx.ctxId);
        ret.push("\" id=\"");
        ret.push(listItem.ID);
        ret.push("\" Field=\"");
        ret.push(field.Name);
        ret.push("\" Perm=\"");
        ret.push(listItem.PermMask);
        ret.push("\" EventType=\"");
        ret.push(listItem.EventType);
        ret.push("\">");
        ret.push(content);
        ret.push("</div>");
        ret.push("<div class=\"ms-list-itemLink ms-alignRight\"  >");
        ret.push("<a ms-jsgrid-click-passthrough=\"true\" class=\"ms-lstItmLinkAnchor ms-ellipsis-a\" title=\"");
        ret.push(STSHtmlEncode(Strings.STS.L_OpenMenu));
        ret.push("\"");
        ret.push("onclick=\"ShowECBMenuForTr(this.parentNode, event); return false; \" href=\"#\" >");
        ret.push("<img class=\"ms-ellipsis-icon\" src=\"" + GetThemedImageUrl("spcommon.png") + "\" alt=\"" + STSHtmlEncode(Strings.STS.L_OpenMenu) + "\" /></a>");
        ret.push("</div>");
        return ret.join('');
    };
    RenderECBinline = function(renderCtx, listItem, field) {
        var ret = [];

        ret.push("<span class=\"js-callout-ecbMenu\" CTXName=\"ctx");
        ret.push(renderCtx.ctxId);
        ret.push("\" id=\"");
        ret.push(listItem.ID);
        ret.push("\" Field=\"");
        ret.push(field.Name);
        ret.push("\" Perm=\"");
        ret.push(listItem.PermMask);
        ret.push("\" EventType=\"");
        ret.push(listItem.EventType);
        ret.push("\">");
        ret.push("<a class=\"js-callout-action ms-calloutLinkEnabled ms-calloutLink js-ellipsis25-a\" onclick=\"calloutCreateAjaxMenu(event); return false;\" href=\"#\" title=\"" + Strings.STS.L_OpenMenu_Text + "\">");
        ret.push("<img class=\"js-ellipsis25-icon\" src=\"" + GetThemedImageUrl("spcommon.png") + "\" alt=\"" + STSHtmlEncode(Strings.STS.L_OpenMenu) + "\" />");
        ret.push("</a>");
        ret.push("</span>");
        return ret.join('');
    };
    ;
    g_lastLaunchPointIIDClicked = null;
    RenderCalloutMenu = function(renderCtx, listItem, field, content) {
        var ret = [];
        var calloutLaunchPointID = "ctx" + renderCtx.ctxId + "_" + listItem.ID + "_calloutLaunchPoint";
        var listSchema = renderCtx.ListSchema;
        var strECBUrl = "/_layouts/15/" + listSchema.LCID + "/images/ecbbutton.png";

        ret.push("<div class=\"ms-vb ms-tableCell ms-list-TitleLink itx\" CTXName=\"ctx");
        ret.push(renderCtx.ctxId);
        ret.push("\" id=\"");
        ret.push(listItem.ID);
        ret.push("\" App=\"");
        ret.push(listItem["File_x0020_Type.mapapp"]);
        ret.push("\">");
        ret.push(content);
        ret.push("</div>");
        if (typeof listItem.RenderCalloutWithoutHover != 'undefined' && listItem.RenderCalloutWithoutHover) {
            ret.push(RenderCalloutAffordance(false, listItem.ID, calloutLaunchPointID, true));
        }
        else {
            ret.push("<div class=\"ms-list-itemLink ms-alignRight\" >");
            ret.push(RenderCalloutAffordance(true, listItem.ID, calloutLaunchPointID, false));
            ret.push("</div>");
        }
        return ret.join('');
    };
    usedCalloutIDs = {};
    generateUniqueCalloutIDFromBaseID = function(baseID) {
        if (typeof usedCalloutIDs[baseID] !== 'number') {
            usedCalloutIDs[baseID] = 0;
            return baseID;
        }
        else {
            ++usedCalloutIDs[baseID];
            return baseID + "_" + String(usedCalloutIDs[baseID]);
        }
    };
    CALLOUT_STR_ELLIPSIS = '...';
    CALLOUT_ELLIPSIS_LENGTH = CALLOUT_STR_ELLIPSIS.length;
    CALLOUT_CHARS_TO_TRUNCATE_PER_ITERATION = 2 + CALLOUT_ELLIPSIS_LENGTH;
    g_ClipboardControl = null;
    g_IsClipboardControlValid = false;
    ;
    getDocumentIconAbsoluteUrl = function(listItem, size, renderCtx) {
        var isFolder = listItem["HTML_x0020_File_x0020_Type.File_x0020_Type.mapico"] == '';
        var sizeStr;

        if (typeof size === "undefined" || size === 16)
            sizeStr = "";
        else if (isFolder)
            sizeStr = String(size);
        else if (size === 32)
            sizeStr = "lg_";
        else
            sizeStr = String(size) + "_";
        EnsureFileLeafRefName(listItem);
        EnsureFileLeafRefSuffix(listItem);
        var alternateThumbnailUrl = listItem["AlternateThumbnailUrl"];
        var hasAlternateThumbnailUrl = isDefinedAndNotNullOrEmpty(alternateThumbnailUrl);
        var fileExtension = listItem["FileLeafRef.Suffix"];
        var previewExists = listItem["PreviewExists.value"] == "1" && isDefinedAndNotNullOrEmpty(listItem["FileLeafRef.Name"]) && isDefinedAndNotNullOrEmpty(fileExtension) || listItem["PreviewExists.value"] == "" && renderCtx != null && renderCtx.ListTemplateType == 109;
        var isAudioFile = isDefinedAndNotNullOrEmpty(fileExtension) && (fileExtension == "mp3" || fileExtension == "wma" || fileExtension == "wav" || fileExtension == "oga");

        if (sizeStr != '' && (hasAlternateThumbnailUrl || previewExists)) {
            if (hasAlternateThumbnailUrl) {
                return String(alternateThumbnailUrl);
            }
            else {
                return listItem["FileDirRef"] + "/_w/" + listItem["FileLeafRef.Name"] + "_" + listItem["FileLeafRef.Suffix"] + ".jpg";
            }
        }
        else if (isAudioFile)
            return ctx.imagesPath + "audiopreview.png";
        else if (isFolder)
            return ctx.imagesPath + "folder" + sizeStr + ".gif";
        else
            return ctx.imagesPath + sizeStr + listItem["HTML_x0020_File_x0020_Type.File_x0020_Type.mapico"];
    };
    displayGenericDocumentIcon = function(imgElement, fsObjType) {
        var imageFileName = fsObjType === 1 ? "256_folder.png" : "256_icgen.png";
        var newSrc = ctx.imagesPath + imageFileName;

        if (imgElement.src !== newSrc)
            imgElement.src = newSrc;
    };
    Callout_OnOpeningCallback = function(callout, listItemID) {
        var launchPoint = callout.getLaunchPoint();
        var trElem = GetAncestorByTagNames(launchPoint, ["TR"]);
        var tdElem = GetEcbTdFromRow(trElem);
        var ctxElem = null;

        if (tdElem != null) {
            ctxElem = GetEcbDivFromEcbTd(tdElem);
        }
        else {
            tdElem = GetAncestorByTagNames(launchPoint, ["TD"]);
            ctxElem = ((m$(tdElem)).find("div.ms-vb.itx"))[0];
        }
        var ctxName = ctxElem.getAttribute('CTXName');
        var calloutCtx = GenerateCtx(g_ctxDict[ctxName], listItemID);

        calloutCtx.CurrentCallout = callout;
        SPClientRenderer.Render(callout.getContentElement(), calloutCtx);
    };
    GenerateCtx = function(inCtx, listItemID) {
        var calloutCtxName = 'ctx' + inCtx.ctxId + 'Callout';
        var calloutCtx = g_ctxDict[calloutCtxName];

        calloutCtx = {};
        for (var key in inCtx) {
            if (key !== "OnPostRender" && key !== "OnPreRender")
                calloutCtx[key] = inCtx[key];
        }
        calloutCtx.BaseViewID = 'Callout';
        calloutCtx.Templates = SPClientTemplates.TemplateManager.GetTemplates(calloutCtx);
        g_ctxDict[calloutCtxName] = calloutCtx;
        var idx = getItemIdxByID(calloutCtx.ListData.Row, listItemID);
        var fields = calloutCtx.ListSchema.Field;
        var calloutMenuField = null;

        for (var i = 0; i < fields.length && calloutMenuField === null; ++i) {
            if (fields[i].CalloutMenu === 'TRUE') {
                calloutMenuField = fields[i];
            }
        }
        calloutCtx.CurrentItemIdx = idx;
        calloutCtx.CurrentItem = calloutCtx.ListData.Row[idx];
        calloutCtx.CurrentFieldSchema = calloutMenuField;
        return calloutCtx;
    };
    FieldRenderer_InitializePrototype();
    RawFieldRenderer_InitializePrototype();
    AttachmentFieldRenderer_InitializePrototype();
    RecurrenceFieldRenderer_InitializePrototype();
    ProjectLinkFieldRenderer_InitializePrototype();
    AllDayEventFieldRenderer_InitializePrototype();
    NumberFieldRenderer_InitializePrototype();
    BusinessDataFieldRenderer_InitializePrototype();
    DateTimeFieldRenderer_InitializePrototype();
    TextFieldRenderer_InitializePrototype();
    LookupFieldRenderer_InitializePrototype();
    NoteFieldRenderer_InitializePrototype();
    UrlFieldRenderer_InitializePrototype();
    UserFieldRenderer_InitializePrototype();
    s_ImnId = 1;
    ;
    SPMgr.prototype = {
        NewGroup: undefined,
        RenderField: undefined,
        RenderFieldByName: undefined
    };
    spMgr = new SPMgr();
    if (typeof Sys != 'undefined' && Sys != null && Sys.Application != null)
        Sys.Application.notifyScriptLoaded();
    if (typeof NotifyScriptLoadedAndExecuteWaitingJobs == 'function')
        NotifyScriptLoadedAndExecuteWaitingJobs("clienttemplates.js");
    InitializeSingleItemPictureView();
}
var SPClientRenderer;

function CallFunctionWithErrorHandling(fn, c, erv, execCtx) {
    if (SPClientRenderer.IsDebugMode(c)) {
        return fn();
    }
    try {
        return fn();
    }
    catch (e) {
        if (c.Errors == null)
            c.Errors = [];
        try {
            e.ExecutionContext = execCtx;
            if (Boolean(SPClientRenderer.AddCallStackInfoToErrors) && typeof execCtx == "object" && null != execCtx) {
                execCtx.CallStack = ULSGetCallstack(CallFunctionWithErrorHandling.caller);
            }
        }
        catch (ignoreErr) { }
        c.Errors.push(e);
        return erv;
    }
}
function CoreRender(t, c) {
    var templateExecContext = {
        TemplateFunction: t,
        Operation: "CoreRender"
    };
    var fn = function() {
        return CoreRenderWorker(t, c);
    };

    return CallFunctionWithErrorHandling(fn, c, '', templateExecContext);
}
function CoreRenderWorker(t, c) {
    var tplFunc;

    if (typeof t == "string")
        tplFunc = SPClientRenderer.ParseTemplateString(t, c);
    else if (typeof t == "function")
        tplFunc = t;
    if (tplFunc == null)
        return '';
    return tplFunc(c);
}
function GetViewHash(renderCtx) {
    return ajaxNavigate.getParam("InplviewHash" + (renderCtx.view.toLowerCase()).substring(1, renderCtx.view.length - 1));
}
function RenderAsyncDataLoad(renderCtx) {
    return '<div style="padding-top:5px;"><center><img src="' + '/_layouts/15/images/gears_an.gif' + '" style="border-width:0px;" /></center></div>';
}
function RenderCallbackFailures(renderCtx, req) {
    if (!Boolean(renderCtx) || req == null || req.status != 601)
        return;
    if (renderCtx.Errors == null)
        renderCtx.Errors = [];
    renderCtx.Errors.push(req.responseText);
    SPClientRenderer.Render(document.getElementById('script' + renderCtx.wpq), renderCtx);
}
function AsyncDataLoadPostRender(renderCtx) {
    window.asyncCallback = function() {
        ExecuteOrDelayUntilScriptLoaded(function() {
            var pagingString = renderCtx.clvp.PagingString();

            renderCtx.queryString = '?' + (pagingString != null ? pagingString : '');
            renderCtx.onRefreshFailed = RenderCallbackFailures;
            renderCtx.loadingAsyncData = true;
            var evtAjax = {
                currentCtx: renderCtx,
                csrAjaxRefresh: true
            };

            AJAXRefreshView(evtAjax, 1);
        }, 'inplview.js');
    };
    if (typeof g_mdsReady != "undefined" && Boolean(g_mdsReady) && typeof g_MDSPageLoaded != "undefined" && !Boolean(g_MDSPageLoaded)) {
        _spBodyOnLoadFunctionNames.push('asyncCallback');
    }
    else {
        asyncCallback();
    }
}
function AddPostRenderCallback(renderCtx, newCallback) {
    AddRenderCallback(renderCtx, 'OnPostRender', newCallback, false);
}
function AddPostRenderCallbackUnique(renderCtx, newCallback) {
    AddRenderCallback(renderCtx, 'OnPostRender', newCallback, true);
}
function AddRenderCallback(renderCtx, callbackType, newCallback, enforceUnique) {
    if (Boolean(renderCtx) && typeof newCallback == 'function' && callbackType != '') {
        var renderCallbacks = renderCtx[callbackType];

        if (renderCallbacks == null)
            renderCtx[callbackType] = newCallback;
        else if (typeof renderCallbacks == "function") {
            if (!Boolean(enforceUnique) || String(renderCallbacks) != String(newCallback)) {
                var array = [];

                array.push(renderCallbacks);
                array.push(newCallback);
                renderCtx[callbackType] = array;
            }
        }
        else if (typeof renderCallbacks == "object") {
            var exists = false;

            if (Boolean(enforceUnique)) {
                for (var i = 0; i < renderCallbacks.length; i++) {
                    if (renderCallbacks[i] == newCallback) {
                        exists = true;
                        break;
                    }
                }
            }
            if (!exists)
                renderCtx[callbackType].push(newCallback);
        }
    }
}
var clientHierarchyManagers;

function OnExpandCollapseButtonClick(e) {
    for (var i = 0; i < clientHierarchyManagers.length; i++) {
        clientHierarchyManagers[i].ToggleExpandByImg(e.target);
    }
    e.stopPropagation();
}
function GetClientHierarchyManagerForWebpart(wpq) {
    for (var idx = 0; idx < clientHierarchyManagers.length; idx++) {
        if (clientHierarchyManagers[idx].Matches(wpq)) {
            return clientHierarchyManagers[idx];
        }
    }
    return new ClientHierarchyManager(wpq);
}
var ClientHierarchyManager;

function EnterIPEAndDoAction(ctxIn, fn) {
    if (ctxIn.AllowGridMode) {
        var spgantt = GetSPGanttFromCtx(ctxIn);

        if (spgantt != null) {
            fn(spgantt);
        }
        else {
            var gridInitInfo = g_SPGridInitInfo[ctxIn.view];

            gridInitInfo.fnCallback = function(newSPGantt) {
                fn(newSPGantt);
                gridInitInfo.fnCallback = null;
            };
            EnsureScriptParams("inplview.js", "InitGrid", gridInitInfo, ctxIn);
        }
    }
}
function IndentItems(ctxIn) {
    EnterIPEAndDoAction(ctxIn, function(spgantt) {
        spgantt.IndentItems(spgantt.get_SelectedItems());
    });
}
function OutdentItems(ctxIn) {
    EnterIPEAndDoAction(ctxIn, function(spgantt) {
        spgantt.OutdentItems(spgantt.get_SelectedItems());
    });
}
function InsertProvisionalItem(ctxIn) {
    EnterIPEAndDoAction(ctxIn, function(spgantt) {
        spgantt.InsertProvisionalItemBeforeFocusedItem();
    });
}
function MoveItemsUp(ctxIn) {
    EnterIPEAndDoAction(ctxIn, function(spgantt) {
        spgantt.MoveItemsUp(spgantt.get_ContiguousSelectedItemsWithoutEntryItems());
    });
}
function MoveItemsDown(ctxIn) {
    EnterIPEAndDoAction(ctxIn, function(spgantt) {
        spgantt.MoveItemsDown(spgantt.get_ContiguousSelectedItemsWithoutEntryItems());
    });
}
function CreateSubItem(ctxIn, itemId) {
    EnterIPEAndDoAction(ctxIn, function(spgantt) {
        spgantt.CreateSubItem(itemId);
    });
}
function RenderListView(renderCtx, wpq, templateBody, bAnimation, bRenderHiddenFooter) {
    if (Boolean(renderCtx)) {
        renderCtx.ListDataJSONItemsKey = 'Row';
        renderCtx.ControlMode = SPClientTemplates.ClientControlMode.View;
        SPClientTemplates.Utility.GetPropertiesFromPageContextInfo(renderCtx);
        if (!Boolean(renderCtx.bIncremental))
            renderCtx.Templates = SPClientTemplates.TemplateManager.GetTemplates(renderCtx);
        if (renderCtx.Templates.Body == RenderGroupTemplateDefault)
            renderCtx.Templates.Body = RenderBodyTemplate;
        if (renderCtx.Templates.Header == '')
            renderCtx.Templates.Header = RenderHeaderTemplate;
        var oldFooterTemplate = renderCtx.Templates.Footer;
        var oldBodyTemplate = renderCtx.Templates.Body;
        var oldHeaderTemplate = renderCtx.Templates.Header;
        var oldViewTemplate = renderCtx.Templates.View;
        var postRenderFunc = function() {
            EnsureScriptParams('DragDrop.js', 'SetDocItemDragDrop', renderCtx);
        };

        AddPostRenderCallbackUnique(renderCtx, postRenderFunc);
        var postRender = renderCtx.OnPostRender;
        var preRender = renderCtx.OnPreRender;

        renderCtx.OnPostRender = null;
        renderCtx.Templates.Footer = '';
        if (Boolean(renderCtx.bInitialRender) && Boolean(renderCtx.AsyncDataLoad)) {
            renderCtx.OnPreRender = null;
            renderCtx.Templates.View = RenderAsyncDataLoad;
            renderCtx.Templates.Header = '';
            renderCtx.Templates.Body = '';
            renderCtx.Templates.Footer = '';
            renderCtx.OnPostRender = null;
            if (!Boolean(ajaxNavigate.getParam("InplviewHash" + (renderCtx.view.toLowerCase()).substring(1, renderCtx.view.length - 1)))) {
                renderCtx.OnPostRender = AsyncDataLoadPostRender;
            }
        }
        else {
            if (Boolean(renderCtx.bInitialRender) && Boolean(ajaxNavigate.getParam("InplviewHash" + (renderCtx.view.toLowerCase()).substring(1, renderCtx.view.length - 1))))
                renderCtx.Templates.Body = '';
        }
        if (templateBody != null) {
            renderCtx.Templates.Header = '';
            if (bAnimation) {
                var firstTbody = templateBody.nextSibling;

                while (firstTbody != null && firstTbody.nextSibling != null)
                    templateBody.parentNode.removeChild(firstTbody.nextSibling);
                var oldHiddenValue = renderCtx.fHidden;

                renderCtx.fHidden = true;
                SPClientRenderer.Render(templateBody, renderCtx);
                renderCtx.fHidden = oldHiddenValue;
            }
            else {
                while (templateBody.nextSibling != null)
                    templateBody.parentNode.removeChild(templateBody.nextSibling);
                var childNode = templateBody.lastChild;

                while (childNode != null) {
                    templateBody.removeChild(childNode);
                    childNode = templateBody.lastChild;
                }
                SPClientRenderer.Render(templateBody, renderCtx);
            }
        }
        else {
            SPClientRenderer.Render(document.getElementById('script' + wpq), renderCtx);
        }
        if (!Boolean(renderCtx.bInitialRender) || !Boolean(renderCtx.AsyncDataLoad)) {
            renderCtx.Templates.Body = '';
            renderCtx.Templates.Header = '';
            if (oldFooterTemplate == '')
                renderCtx.Templates.Footer = RenderFooterTemplate;
            else
                renderCtx.Templates.Footer = oldFooterTemplate;
            renderCtx.OnPreRender = null;
            renderCtx.OnPostRender = postRender;
            var oldCtxHidden = renderCtx.fHidden;

            renderCtx.fHidden = Boolean(bRenderHiddenFooter);
            SPClientRenderer.Render(document.getElementById('scriptPaging' + wpq), renderCtx);
            renderCtx.fHidden = oldCtxHidden;
        }
        renderCtx.Templates.View = oldViewTemplate;
        renderCtx.Templates.Body = oldBodyTemplate;
        renderCtx.Templates.Header = oldHeaderTemplate;
        renderCtx.Templates.Footer = oldFooterTemplate;
        renderCtx.OnPreRender = preRender;
        renderCtx.OnPostRender = postRender;
    }
}
var SPClientTemplates;

function SPTemplateManagerResolveTypeInfo(rCtx) {
    if (rCtx != null) {
        this.defaultViewStyle = typeof rCtx.ViewStyle == "undefined";
        this.viewStyle = this.defaultViewStyle ? 'null' : rCtx.ViewStyle.toString();
        this.allLists = typeof rCtx.ListTemplateType == "undefined";
        this.ltype = this.allLists ? 'null' : rCtx.ListTemplateType.toString();
        this.allViews = typeof rCtx.BaseViewID == "undefined";
        this.viewId = this.allViews ? 'null' : rCtx.BaseViewID.toString();
    }
}
function SPTemplateManagerResolveTypeInfo_InitializePrototype() {
    SPTemplateManagerResolveTypeInfo.prototype = {
        defaultViewStyle: true,
        viewStyle: "",
        allLists: true,
        ltype: "",
        allViews: true,
        viewId: ""
    };
}
function SPTemplateManagerRegisterTypeInfo(rCtx) {
    if (rCtx != null) {
        this.defaultViewStyle = typeof rCtx.ViewStyle == "undefined";
        this.allLists = typeof rCtx.ListTemplateType == "undefined";
        this.allViews = typeof rCtx.BaseViewID == "undefined";
        if (!this.allLists) {
            if (typeof rCtx.ListTemplateType == "string" || typeof rCtx.ListTemplateType == "number")
                this.ltype = [rCtx.ListTemplateType.toString()];
            else
                this.ltype = rCtx.ListTemplateType;
        }
        if (!this.allViews) {
            if (typeof rCtx.BaseViewID == "string" || typeof rCtx.BaseViewID == "number")
                this.viewId = [rCtx.BaseViewID.toString()];
            else
                this.viewId = rCtx.BaseViewID;
        }
        if (!this.defaultViewStyle) {
            if (typeof rCtx.ViewStyle == "string" || typeof rCtx.ViewStyle == "number")
                this.viewStyle = [rCtx.ViewStyle.toString()];
            else
                this.viewStyle = rCtx.ViewStyle;
        }
    }
}
function SPTemplateManagerRegisterTypeInfo_InitializePrototype() {
    SPTemplateManagerRegisterTypeInfo.prototype = {
        defaultViewStyle: true,
        viewStyle: [],
        allLists: true,
        ltype: [],
        allViews: true,
        viewId: []
    };
}
function SPClientFormUserValue() {
}
function SPClientFormUserValue_InitializePrototype() {
    SPClientFormUserValue.prototype.lookupId = '-1';
    SPClientFormUserValue.prototype.lookupValue = '';
    SPClientFormUserValue.prototype.displayStr = '';
    SPClientFormUserValue.prototype.email = '';
    SPClientFormUserValue.prototype.sip = '';
    SPClientFormUserValue.prototype.title = '';
    SPClientFormUserValue.prototype.picture = '';
    SPClientFormUserValue.prototype.department = '';
    SPClientFormUserValue.prototype.jobTitle = '';
    SPClientFormUserValue.prototype.toEntityXml = function() {
        var entityTag = '<Entity IsResolved="True" Key="';

        entityTag += STSHtmlEncode(this.displayStr);
        entityTag += '" DisplayText="';
        entityTag += STSHtmlEncode(this.title);
        entityTag += '" Description="';
        entityTag += STSHtmlEncode(this.displayStr);
        entityTag += '">';
        entityTag += '<ExtraData>';
        entityTag += '<ArrayOfDictionaryEntry xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">';
        entityTag += '<DictionaryEntry><Key xsi:type="xsd:string">SPUserID</Key><Value xsi:type="xsd:string">';
        entityTag += STSHtmlEncode(this.lookupId);
        entityTag += '</Value></DictionaryEntry>';
        entityTag += '<DictionaryEntry><Key xsi:type="xsd:string">Title</Key><Value xsi:type="xsd:string">';
        entityTag += STSHtmlEncode(this.jobTitle);
        entityTag += '</Value></DictionaryEntry>';
        entityTag += '<DictionaryEntry><Key xsi:type="xsd:string">Email</Key><Value xsi:type="xsd:string">';
        entityTag += STSHtmlEncode(this.email);
        entityTag += '</Value></DictionaryEntry>';
        entityTag += '<DictionaryEntry><Key xsi:type="xsd:string">AccountName</Key><Value xsi:type="xsd:string">';
        entityTag += STSHtmlEncode(this.displayStr);
        entityTag += '</Value></DictionaryEntry>';
        entityTag += '<DictionaryEntry><Key xsi:type="xsd:string">SIPAddress</Key><Value xsi:type="xsd:string">';
        entityTag += STSHtmlEncode(this.sip);
        entityTag += '</Value></DictionaryEntry>';
        entityTag += '<DictionaryEntry><Key xsi:type="xsd:string">Department</Key><Value xsi:type="xsd:string">';
        entityTag += STSHtmlEncode(this.department);
        entityTag += '</Value></DictionaryEntry>';
        entityTag += '</ArrayOfDictionaryEntry></ExtraData></Entity>';
        return entityTag;
    };
    SPClientFormUserValue.prototype.initFromUserString = function(inStr) {
        if (inStr != null && inStr != '') {
            var userValues = inStr.split(SPClientTemplates.Utility.UserLookupDelimitString);

            if (userValues.length != 2)
                return;
            this.lookupId = userValues[0];
            var multiValStr = userValues[1];
            var splitStr = multiValStr.split(SPClientTemplates.Utility.UserMultiValueDelimitString);
            var numUserValues = splitStr.length;

            if (numUserValues == 1) {
                this.title = (this.displayStr = (this.lookupValue = splitStr[0]));
            }
            else if (numUserValues >= 5) {
                this.lookupValue = splitStr[0] == null ? '' : splitStr[0];
                this.displayStr = splitStr[1] == null ? '' : splitStr[1];
                this.email = splitStr[2] == null ? '' : splitStr[2];
                this.sip = splitStr[3] == null ? '' : splitStr[3];
                this.title = splitStr[4] == null ? '' : splitStr[4];
                if (numUserValues >= 6) {
                    this.picture = splitStr[5] == null ? '' : splitStr[5];
                    if (numUserValues >= 7) {
                        this.department = splitStr[6] == null ? '' : splitStr[6];
                        if (numUserValues >= 8)
                            this.jobTitle = splitStr[7] == null ? '' : splitStr[7];
                    }
                }
            }
        }
    };
    SPClientFormUserValue.prototype.initFromEntityXml = function(inStr) {
        if (inStr != null && inStr != '') {
            var entityData = GetEntities(inStr);

            if (entityData == null)
                return;
            var data = entityData.childNodes;

            for (var dataIdx = 0; dataIdx < data.length; dataIdx++) {
                var keyNode = data[dataIdx].childNodes[0];
                var valueNode = data[dataIdx].childNodes[1];
                var internalProp = MapEntityKeyToUserValueProperty(keyNode.text);

                if (internalProp != '')
                    this[internalProp] = valueNode.text;
            }
        }
    };
    function MapEntityKeyToUserValueProperty(entityKey) {
        switch (entityKey) {
        case 'SPUserID':
            return 'lookupId';
        case 'Title':
            return 'jobTitle';
        case 'Email':
            return 'email';
        case 'SIPAddress':
            return 'sip';
        case 'Department':
            return 'department';
        case 'AccountName':
            return 'displayText';
        }
        return '';
    }
    SPClientFormUserValue.prototype.toString = function() {
        var _lookupDelimitStr = SPClientTemplates.Utility.UserLookupDelimitString;
        var _multiValueDelimitStr = SPClientTemplates.Utility.UserMultiValueDelimitString;
        var uString = this.lookupId;

        uString += _lookupDelimitStr;
        uString += this.lookupValue;
        uString += _multiValueDelimitStr;
        uString += this.displayStr;
        uString += _multiValueDelimitStr;
        uString += this.email;
        uString += _multiValueDelimitStr;
        uString += this.sip;
        uString += _multiValueDelimitStr;
        uString += this.title;
        uString += _multiValueDelimitStr;
        uString += this.picture;
        uString += _multiValueDelimitStr;
        uString += this.department;
        uString += _multiValueDelimitStr;
        uString += this.jobTitle;
        return uString;
    };
}
function RenderViewTemplate(renderCtx) {
    var iStr = renderCtx.RenderHeader(renderCtx);

    iStr += renderCtx.RenderBody(renderCtx);
    iStr += renderCtx.RenderFooter(renderCtx);
    return iStr;
}
function RenderFieldValueDefault(renderCtx) {
    if (renderCtx != null && renderCtx.CurrentFieldValue != null)
        return renderCtx.CurrentFieldValue.toString();
    return '';
}
var RenderBodyTemplate;

function RenderGroupTemplateDefault(rCtx) {
    return rCtx != null && typeof rCtx.RenderGroups == "function" ? rCtx.RenderGroups(rCtx) : '';
}
function RenderItemTemplateDefault(rCtx) {
    return rCtx != null && typeof rCtx.RenderItems == "function" ? rCtx.RenderItems(rCtx) : '';
}
function RenderFieldTemplateDefault(rCtx) {
    return rCtx != null && typeof rCtx.RenderFields == "function" ? rCtx.RenderFields(rCtx) : '';
}
function RenderAggregate(renderCtx, groupId, listItem, listSchema, level, expand, aggregate) {
    var iStr = '';

    if (groupId == null) {
        iStr += '<tbody id="aggr';
        iStr += renderCtx.wpq;
        iStr += '">';
    }
    else {
        iStr = '<tbody id="aggr';
        iStr += groupId;
        iStr += '_"';
        if (!expand)
            iStr += ' style="display:none"';
        iStr += '>';
    }
    iStr += '<tr id="agg';
    iStr += renderCtx.wpq;
    iStr += '"><td/>';
    var aggLevel = '';

    if (level == 1)
        aggLevel = '.agg';
    else if (level == 2)
        aggLevel = '.agg2';
    var fields = listSchema.Field;

    for (var f in fields) {
        var field = fields[f];

        if (field.GroupField != null)
            break;
        iStr += '<td class="ms-vb2">';
        var type = aggregate[field.Name];

        if (type != null && type != '') {
            iStr += '<nobr><b>';
            var title;
            var aggName;

            if (type == 'COUNT') {
                title = Strings.STS.L_SPCount;
                aggName = field.Name + '.COUNT' + aggLevel;
            }
            if (type == 'SUM') {
                title = Strings.STS.L_SPSum;
                aggName = field.Name + '.SUM' + aggLevel;
            }
            else if (type == 'AVG') {
                title = Strings.STS.L_SPAvg;
                aggName = field.Name + '.AVG' + aggLevel;
            }
            else if (type == 'MAX') {
                title = Strings.STS.L_SPMax;
                aggName = field.Name + '.MAX' + aggLevel;
            }
            else if (type == 'MIN') {
                title = Strings.STS.L_SPMin;
                aggName = field.Name + '.MIN' + aggLevel;
            }
            else if (type == 'STDEV') {
                title = Strings.STS.L_SPStdev;
                aggName = field.Name + '.STDEV' + aggLevel;
            }
            else if (type == 'VAR') {
                title = Strings.STS.L_SPVar;
                aggName = field.Name + '.VAR' + aggLevel;
            }
            else {
                title = Strings.STS.L_SPCount;
                aggName = field.Name + '.COUNT' + aggLevel;
            }
            iStr += title;
            iStr += '=&nbsp;';
            iStr += listItem[aggName];
            iStr += '</b></nobr>';
        }
        iStr += '</td>';
    }
    iStr += '</tr></tbody>';
    return iStr;
}
function RenderGroupTemplate(renderCtx, group, groupId, listItem, listSchema, level, expand) {
    renderCtx.CurrentItem = listItem;
    var viewCount = renderCtx.ctxId;
    var iStr = '<tbody id="titl';

    iStr += groupId;
    iStr += '" groupString="';
    iStr += listItem[group + '.urlencoded'];
    iStr += '"';
    if (level == 2 && !expand)
        iStr += ' style="display:none"';
    iStr += '><tr><td colspan="100" nowrap="nowrap" class="ms-gb';
    if (level == 2)
        iStr += '2';
    iStr += '">';
    if (level == 2)
        iStr += '<img src=' + '"/_layouts/15/images/blank.gif"' + ' alt="" height="1" width="10">';
    iStr += '<a href="javascript:" onclick="javascript:ExpCollGroup(';
    iStr += "'";
    iStr += groupId;
    iStr += "', 'img_";
    iStr += groupId;
    iStr += "',event, false);return false;";
    iStr += '"><img src="';
    if (expand)
        iStr += GetThemedImageUrl("commentcollapse12.png");
    else
        iStr += GetThemedImageUrl("commentexpand12.png");
    iStr += '" border="0" alt="';
    if (expand)
        iStr += Strings.STS.L_SPCollapse;
    else
        iStr += Strings.STS.L_SPExpand;
    iStr += '" id="img_';
    iStr += groupId;
    iStr += '"> ';
    var displayName = group;
    var curField;

    for (var idx = 0; idx < listSchema.Field.length; idx++) {
        var field = listSchema.Field[idx];

        if (field.Name == group) {
            displayName = field.DisplayName;
            curField = field;
            break;
        }
    }
    iStr += STSHtmlEncode(displayName);
    iStr += '</a> : ';
    if (curField != null) {
        if (curField.Type == 'Number' || curField.Type == 'Currency')
            iStr += listItem[field.Name];
        else if (curField.Type == 'DateTime')
            iStr += listItem[field.Name + '.groupdisp'];
        else if (curField.Type == 'User' || curField.Type == 'UserMulti')
            iStr += listItem[field.Name + '.span'];
        else {
            renderCtx.CurrentItemIdx = idx;
            iStr += spMgr.RenderFieldByName(renderCtx, group, listItem, listSchema);
            renderCtx.CurrentItemIdx = -1;
        }
    }
    iStr += ' <span style="font-weight: lighter; display: inline-block;">(';
    iStr += level == 2 ? listItem[group + '.COUNT.group2'] : listItem[group + '.COUNT.group'];
    iStr += ')</span></td></tr></tbody>';
    var aggregate = listSchema.Aggregate;

    if (aggregate != null && !renderCtx.inGridMode)
        iStr += RenderAggregate(renderCtx, groupId, listItem, listSchema, level, expand, aggregate);
    renderCtx.CurrentItem = null;
    return iStr;
}
function RenderGroup(renderCtx, listItem) {
    return RenderGroupEx(renderCtx, listItem, false);
}
function RenderGroupEx(renderCtx, listItem, omitLevel2) {
    var listSchema = renderCtx.ListSchema;
    var group1 = listSchema.group1;
    var group2 = listSchema.group2;
    var expand = listSchema.Collapse == null || listSchema.Collapse != "TRUE";
    var groupId = renderCtx.ctxId;
    var renderGroup = Boolean(ctx.ExternalDataList);
    var iStr = "";
    var groupTpls = renderCtx.Templates['Group'];

    if (groupTpls == null || groupTpls == RenderItemTemplateDefault || typeof groupTpls != "function" && typeof groupTpls != "string")
        groupTpls = RenderGroupTemplate;
    else if (typeof groupTpls == "string")
        groupTpls = SPClientRenderer.ParseTemplateString(groupTpls, renderCtx);
    groupId += '-';
    groupId += listItem[group1 + '.groupindex'];
    if (listItem[group1 + '.newgroup'] == '1') {
        iStr += groupTpls(renderCtx, group1, groupId, listItem, listSchema, 1, expand);
    }
    if (listItem[group1 + '.newgroup'] == '1' || group2 != null && listItem[group2 + '.newgroup'] == '1') {
        if (group2 != null && !omitLevel2) {
            groupId += listItem[group2 + '.groupindex2'];
            iStr += groupTpls(renderCtx, group2, groupId, listItem, listSchema, 2, expand);
        }
        iStr += AddGroupBody(groupId, expand, renderGroup);
    }
    return iStr;
}
function AddGroupBody(groupId, expand, renderGroup) {
    var iStr = '<tbody id="tbod';

    iStr += groupId;
    iStr += '_"';
    if (!expand && renderGroup)
        iStr += ' style="display: none;"';
    iStr += ' isLoaded="';
    if (expand || renderGroup)
        iStr += 'true';
    else
        iStr += 'false';
    iStr += '"/>';
    return iStr;
}
function GenerateIID(renderCtx) {
    return GenerateIIDForListItem(renderCtx, renderCtx.CurrentItem);
}
function GenerateIIDForListItem(renderCtx, listItem) {
    return renderCtx.ctxId + ',' + listItem.ID + ',' + listItem.FSObjType;
}
function GetCSSClassForFieldTd(renderCtx, field) {
    var listSchema = renderCtx.ListSchema;

    if (field.CalloutMenu == 'TRUE' || renderCtx.inGridMode && (field.ClassInfo == 'Menu' || field.listItemMenu == 'TRUE'))
        return 'ms-cellstyle ms-vb-title';
    else if (field.ClassInfo == 'Menu' || field.listItemMenu == 'TRUE')
        return 'ms-cellstyle ms-vb-title ms-positionRelative';
    else if (field.ClassInfo == 'Icon')
        return 'ms-cellstyle ms-vb-icon';
    else if ((field.Type == 'User' || field.Type == 'UserMulti') && listSchema.EffectivePresenceEnabled)
        return 'ms-cellstyle ms-vb-user';
    else
        return 'ms-cellstyle ms-vb2';
}
function DoesListUseCallout(renderCtx) {
    for (var i = 0; i < renderCtx.ListSchema.Field.length; i++) {
        var field = renderCtx.ListSchema.Field[i];

        if (field.CalloutMenu != null && field.CalloutMenu.toLowerCase() == "true") {
            return true;
        }
    }
    return false;
}
function ShowCallOutOrECBWrapper(elm, evt, fShowCallout) {
    var fDoEventBubble = true;

    if (fShowCallout) {
        if (ShowCalloutMenuForTr != null) {
            fDoEventBubble = ShowCalloutMenuForTr(elm, evt, true);
        }
    }
    else {
        if (ShowECBMenuForTr != null) {
            fDoEventBubble = ShowECBMenuForTr(elm, evt);
        }
    }
    return fDoEventBubble;
}
var RenderItemTemplate;

function RenderTableHeader(renderCtx) {
    var listSchema = renderCtx.ListSchema;
    var listData = renderCtx.ListData;
    var ret = [];

    RenderHeroButton(ret, renderCtx);
    if (Boolean(listSchema.InplaceSearchEnabled)) {
        var controlDivId = 'CSRListViewControlDiv' + renderCtx.wpq;

        ret.push("<div class=\"ms-csrlistview-controldiv\" id=\"");
        ret.push(STSHtmlEncode(controlDivId));
        ret.push("\">");
    }
    else
        ret.push("<div>");
    if (listSchema.RenderViewSelectorPivotMenu == "True")
        ret.push(RenderViewSelectorPivotMenu(renderCtx));
    else if (listSchema.RenderViewSelectorPivotMenuAsync == "True")
        ret.push(RenderViewSelectorPivotMenuAsync(renderCtx));
    var ManageListsPermission = renderCtx.BasePermissions.ManageLists;
    var ManagePersonalViewsPermission = renderCtx.BasePermissions.ManagePersonalViews;

    if (listSchema.RenderSaveAsNewViewButton == "True" && (ManageListsPermission || ManagePersonalViewsPermission != null && ManagePersonalViewsPermission)) {
        ret.push('<div id="CSRSaveAsNewViewDiv');
        ret.push(renderCtx.wpq);
        ret.push('" class="ms-InlineSearch-DivBaseline" style="visibility:hidden;padding-bottom:3px;"');
        ret.push('><a class="ms-commandLink" href="#" id="CSRSaveAsNewViewAnchor');
        ret.push(renderCtx.wpq);
        ret.push('" saveViewButtonDisabled="false" onclick="EnsureScriptParams(\'inplview\', \'ShowSaveAsNewViewDialog\', \'');
        ret.push(renderCtx.listName + '\', \'');
        ret.push(renderCtx.view + '\', \'');
        ret.push(renderCtx.wpq + '\', \'');
        ret.push(ManageListsPermission + '\', \'');
        ret.push(ManagePersonalViewsPermission);
        ret.push('\'); return false;" >');
        ret.push(Strings.STS.L_SaveThisViewButton.toUpperCase());
        ret.push('</a></div>');
    }
    ret.push("</div>");
    ret.push('<iframe src="javascript:false;" id="FilterIframe');
    ret.push(renderCtx.ctxId);
    ret.push('" name="FilterIframe');
    ret.push(renderCtx.ctxId);
    ret.push('" style="display:none" height="0" width="0" FilterLink="');
    ret.push(listData.FilterLink);
    ret.push('"></iframe>');
    ret.push("<table onmousedown='return OnTableMouseDown(event);' summary=\"");
    ret.push(STSHtmlEncode(renderCtx.ListTitle));
    ret.push('" xmlns:o="urn:schemas-microsoft-com:office:office" o:WebQuerySourceHref="');
    ret.push(renderCtx.HttPath);
    ret.push('&XMLDATA=1&RowLimit=0&View=');
    ret.push(escapeProperly(listSchema.View));
    ret.push('" style="min-width:600px" border="0" cellspacing="0" dir="');
    ret.push(listSchema.Direction);
    ret.push('" onmouseover="EnsureSelectionHandler(event,this,');
    ret.push(renderCtx.ctxId);
    ret.push(')" cellpadding="1" id="');
    if (listSchema.IsDocLib || typeof listData.Row == 'undefined')
        ret.push("onetidDoclibViewTbl0");
    else {
        ret.push(renderCtx.listName);
        ret.push('-');
        ret.push(listSchema.View);
    }
    ret.push('" class="');
    if (typeof listData.Row == 'undefined')
        ret.push('ms-emptyView');
    else
        ret.push("ms-listviewtable");
    ret.push('">');
    return ret.join('');
}
function RenderSelectAllCbx(renderCtx, ret) {
    if (ret == null) {
        ret = [];
    }
    ret.push('<span class="ms-selectall-span" tabindex="0" onclick="this.checked = !this.checked;ToggleAllItems(event,this,');
    ret.push(renderCtx.ctxId);
    ret.push(');" onfocus="EnsureSelectionHandlerOnFocus(event,this,');
    ret.push(renderCtx.ctxId);
    ret.push(');" id="cbxSelectAllItems');
    ret.push(renderCtx.ctxId);
    ret.push('" title="');
    ret.push(Strings.STS.L_select_deselect_all);
    ret.push('"><span class="ms-selectall-iconouter"><img class="ms-selectall-icon" alt="" src="');
    ret.push(GetThemedImageUrl("spcommon.png"));
    ret.push('" /></span></span></span>');
    return ret;
}
var RenderHeaderTemplate;
var RenderFooterTemplate;

function RenderViewSelectorMenu(renderCtx) {
    var openMenuText = STSHtmlEncode(Strings.STS.L_OpenMenu_Text);
    var viewSelectorMenuId = STSHtmlEncode(renderCtx.wpq + '_LTViewSelectorMenu');
    var viewSelectorLinkId = STSHtmlEncode(renderCtx.wpq + '_ListTitleViewSelectorMenu');
    var viewSelectorTopSpanId = STSHtmlEncode(renderCtx.wpq + '_ListTitleViewSelectorMenu_t');
    var viewSelectorContainerId = STSHtmlEncode(renderCtx.wpq + '_ListTitleViewSelectorMenu_Container');
    var currentViewTitle = renderCtx.viewTitle;

    if (currentViewTitle == null || currentViewTitle == '')
        currentViewTitle = Strings.STS.L_ViewSelectorCurrentView;
    var showMergeView = renderCtx.ListSchema.ViewSelector_ShowMergeView ? 'true' : 'false';
    var showRepairView = renderCtx.ListSchema.ViewSelector_ShowRepairView ? 'true' : 'false';
    var showCreateView = renderCtx.ListSchema.ViewSelector_ShowCreateView ? 'true' : 'false';
    var showEditView = renderCtx.ListSchema.ViewSelector_ShowEditView ? 'true' : 'false';
    var showApproveView = renderCtx.ListSchema.ViewSelector_ShowApproveView ? 'true' : 'false';
    var viewParameters = renderCtx.ListSchema.ViewSelector_ViewParameters;

    if (viewParameters == null)
        viewParameters = '';
    var onClick = [];

    onClick.push('onclick="try { CoreInvoke(\'showViewSelector\', event, document.getElementById(\'');
    onClick.push(viewSelectorContainerId);
    onClick.push('\'), { showRepairView : ');
    onClick.push(showRepairView);
    onClick.push(', showMergeView : ');
    onClick.push(showMergeView);
    onClick.push(', showEditView : ');
    onClick.push(showEditView);
    onClick.push(', showCreateView : ');
    onClick.push(showCreateView);
    onClick.push(', showApproverView : ');
    onClick.push(showApproveView);
    onClick.push(', listId: \'');
    onClick.push(renderCtx.listName);
    onClick.push('\', viewId: \'');
    onClick.push(renderCtx.view);
    onClick.push('\', viewParameters: \'');
    onClick.push(viewParameters);
    onClick.push('\' }); } catch (ex) { }; return false;" ');
    var onClickHandler = onClick.join('');
    var ret = [];

    ret.push('<span data-sp-cancelWPSelect="true" id="');
    ret.push(viewSelectorContainerId);
    ret.push('" class="ms-csrlistview-viewselectormenu"><span id="');
    ret.push(viewSelectorTopSpanId);
    ret.push('" class="ms-menu-althov ms-viewselector" title="');
    ret.push(STSHtmlEncode(Strings.STS.L_ViewSelectorTitle));
    ret.push('" hoveractive="ms-menu-althov-active ms-viewselectorhover" hoverinactive="ms-menu-althov ms-viewselector" ');
    ret.push('foa="MMU_GetMenuFromClientId(\'');
    ret.push(viewSelectorLinkId);
    ret.push('\')" onmouseover="MMU_PopMenuIfShowing(this); MMU_EcbTableMouseOverOut(this, true)" ');
    ret.push('oncontextmenu="ClkElmt(this); return false;" ');
    ret.push(onClickHandler);
    ret.push('>');
    ret.push('<a class="ms-menu-a" id="');
    ret.push(viewSelectorLinkId);
    ret.push('" accesskey="');
    ret.push(STSHtmlEncode(Strings.STS.L_SelectBackColorKey_TEXT));
    ret.push('" href="#" ');
    ret.push(onClickHandler);
    ret.push('oncontextmenu="ClkElmt(this); return false;" onfocus="MMU_EcbLinkOnFocusBlur(byid(\'');
    ret.push(viewSelectorMenuId);
    ret.push('\'), this, true);" oncontextmenu="ClkElmt(this); return false;" ');
    ret.push('onkeydown="MMU_EcbLinkOnKeyDown(byid(\'');
    ret.push(viewSelectorMenuId);
    ret.push('\'), MMU_GetMenuFromClientId(\'');
    ret.push(viewSelectorLinkId);
    ret.push('\'), event);" menutokenvalues="MENUCLIENTID=');
    ret.push(viewSelectorLinkId);
    ret.push(',TEMPLATECLIENTID=');
    ret.push(viewSelectorMenuId);
    ret.push('" serverclientid="');
    ret.push(viewSelectorLinkId);
    ret.push('"><span class="ms-viewselector-currentView">');
    ret.push(STSHtmlEncode(currentViewTitle));
    ret.push('</span></a>');
    ret.push('<span style="height:');
    ret.push(4);
    ret.push('px;width:');
    ret.push(7);
    ret.push('px;position:relative;display:inline-block;overflow:hidden;" class="s4-clust ms-viewselector-arrow ms-menu-stdarw">');
    ret.push('<img src="');
    ret.push("/_layouts/15/images/fgimg.png");
    ret.push('" alt="');
    ret.push(openMenuText);
    ret.push('" style="border-width:0px;position:absolute;left:-');
    ret.push(0);
    ret.push('px !important;top:-');
    ret.push(358);
    ret.push('px !important;" /></span>');
    ret.push('<span style="height:');
    ret.push(4);
    ret.push('px;width:');
    ret.push(7);
    ret.push('px;position:relative;display:inline-block;overflow:hidden;" class="s4-clust ms-viewselector-arrow ms-menu-hovarw">');
    ret.push('<img src="');
    ret.push("/_layouts/15/images/fgimg.png");
    ret.push('" alt="');
    ret.push(openMenuText);
    ret.push('" style="border-width:0px;position:absolute;left:-');
    ret.push(0);
    ret.push('px !important;top:-');
    ret.push(362);
    ret.push('px !important;" /></span>');
    ret.push('</span></span>');
    return ret.join('');
}
function RenderViewSelectorPivotMenu(renderCtx) {
    var pivotOpts = {
        PivotContainerId: renderCtx.wpq + '_ListTitleViewSelectorMenu_Container'
    };
    var viewMenu = new ClientPivotControl(pivotOpts);
    var allOpts = renderCtx.ListSchema.ViewSelectorPivotMenuOptions;

    if (allOpts == null || allOpts == '')
        return '';
    var viewData = eval(renderCtx.ListSchema.ViewSelectorPivotMenuOptions);
    var idx;

    for (idx = 0; idx < viewData.length; idx++) {
        var viewOpt = viewData[idx];

        if (viewOpt.GroupId >= 500 || viewOpt.MenuOptionType != ClientPivotControl.MenuOptionType.MenuOption)
            break;
        viewOpt.SelectedOption = renderCtx.viewTitle == viewOpt.DisplayText;
        viewMenu.AddMenuOption(viewOpt);
    }
    if (idx > 0) {
        if (idx < 3)
            viewMenu.SurfacedPivotCount = idx;
        for (; idx < viewData.length; idx++) {
            var overflowItem = viewData[idx];

            if (overflowItem.MenuOptionType == ClientPivotControl.MenuOptionType.MenuOption) {
                overflowItem.SelectedOption = renderCtx.viewTitle == overflowItem.DisplayText;
                viewMenu.AddMenuOption(overflowItem);
            }
            else if (overflowItem.MenuOptionType == ClientPivotControl.MenuOptionType.MenuSeparator) {
                viewMenu.AddMenuSeparator();
            }
        }
    }
    return viewMenu.RenderAsString();
}
function RenderViewSelectorPivotMenuAsync(renderCtx) {
    var pivotOpts = {
        PivotContainerId: renderCtx.wpq + '_ListTitleViewSelectorMenu_Container'
    };
    var viewMenu = new ClientPivotControl(pivotOpts);

    viewMenu.SurfacedPivotCount = 1;
    var dispTitle = renderCtx.viewTitle;

    if (dispTitle == null || dispTitle == '')
        dispTitle = Strings.STS.L_ViewSelectorCurrentView;
    var curOpt = new ClientPivotControlMenuOption();

    curOpt.DisplayText = dispTitle;
    curOpt.OnClickAction = 'return false;';
    curOpt.SelectedOption = true;
    viewMenu.AddMenuOption(curOpt);
    viewMenu.OverflowMenuScript = "OpenViewSelectorPivotOptions(event, '" + renderCtx.ctxId + "'); return false;";
    return viewMenu.RenderAsString();
}
function OpenViewSelectorPivotOptions(evt, renderCtxId) {
    if (evt == null)
        evt = window.event;
    var renderCtx = g_ctxDict['ctx' + renderCtxId];

    if (renderCtx == null)
        return;
    var pivotId = renderCtx.wpq + '_ListTitleViewSelectorMenu_Container';
    var pivotElt = document.getElementById(pivotId);
    var viewMenu = ClientPivotControl.PivotControlDict[pivotId];

    if (pivotElt == null || viewMenu == null)
        return;
    if (pivotElt.getAttribute('data-viewsLoaded') == "true") {
        ClientPivotControlExpandOverflowMenu(evt);
        return;
    }
    var webUrl = _spPageContextInfo.webServerRelativeUrl;
    var menuPath = '_layouts/' + _spPageContextInfo.webUIVersion.toString() + '/vsmenu.aspx';
    var viewParameters = renderCtx.ListSchema.ViewSelector_ViewParameters;

    if (viewParameters == null)
        viewParameters = '';
    var vsMenuUrl = [];

    vsMenuUrl.push(GetUrlFromWebUrlAndWebRelativeUrl(webUrl, menuPath));
    vsMenuUrl.push('?List=');
    vsMenuUrl.push(renderCtx.listName);
    vsMenuUrl.push('&View=');
    vsMenuUrl.push(renderCtx.view);
    vsMenuUrl.push('&Source=');
    vsMenuUrl.push(window.location.href);
    if (viewParameters != '') {
        vsMenuUrl.push('&');
        vsMenuUrl.push(viewParameters);
    }
    var req = new XMLHttpRequest();

    req.open("POST", vsMenuUrl.join(''), true);
    req.setRequestHeader("Content-Type", "application/json");
    req.onreadystatechange = function() {
        if (req.readyState == 4 && req.status != 601) {
            var viewData = eval(req.responseText);

            for (var idx = 0; idx < viewData.length; idx++) {
                var overflowItem = viewData[idx];

                if (overflowItem.Text == renderCtx.viewTitle)
                    continue;
                if (overflowItem.ItemType == 'MenuItem') {
                    var overflowOpt = new ClientPivotControlMenuOption();

                    overflowOpt.DisplayText = overflowItem.Text;
                    overflowOpt.Description = overflowItem.Description;
                    overflowOpt.OnClickAction = overflowItem.ActionScriptText;
                    overflowOpt.ImageUrl = overflowItem.ImageSourceUrl;
                    overflowOpt.ImageAltText = overflowItem.Text;
                    overflowOpt.SelectedOption = renderCtx.viewTitle == overflowItem.Text;
                    viewMenu.AddMenuOption(overflowOpt);
                }
                else if (overflowItem.ItemType == 'MenuSeparator') {
                    viewMenu.AddMenuSeparator();
                }
            }
            viewMenu.ProcessAllMenuItems();
            viewMenu.EnsureSelectedOption();
            ClientPivotControlExpandOverflowMenu(evt);
            pivotElt.setAttribute('data-viewsLoaded', 'true');
        }
    };
    req.send("");
    if (evt != null)
        CancelEvent(evt);
}
function RenderEmptyText(ret, renderCtx) {
    if (renderCtx.inGridMode) {
        return;
    }
    var listData = renderCtx.ListData;

    if (listData.Row.length == 0) {
        var listSchema = renderCtx.ListSchema;
        var iStr = '<table class="';
        var hasSearchTerm = typeof renderCtx.completedSearchTerm != "undefined" && renderCtx.completedSearchTerm != null;

        if (hasSearchTerm) {
            iStr += 'ms-list-emptyText-compact';
        }
        else {
            iStr += 'ms-list-emptyText';
        }
        iStr += '" dir="';
        iStr += listSchema.Direction;
        iStr += '" border="0">';
        iStr += '<tr id="empty-';
        iStr += renderCtx.wpq;
        iStr += '"><td colspan="99">';
        var listTemplate = renderCtx.ListTemplateType;

        if (hasSearchTerm) {
            iStr += Strings.STS.L_NODOCSEARCH;
        }
        else if (listSchema.IsDocLib) {
            var viewTitle = renderCtx.viewTitle;

            if (Boolean(viewTitle))
                iStr += Strings.STS.L_NODOC.replace("%0", STSHtmlEncode(viewTitle));
            else
                iStr += Strings.STS.L_NODOCView;
        }
        else if (listTemplate == 160) {
            iStr += Strings.STS.L_AccRqEmptyView;
        }
        else {
            iStr += STSHtmlEncode(listSchema.NoListItem);
        }
        iStr += '</td></tr></table>';
        ret.push(iStr);
    }
}
function RenderSearchStatus(ret, renderCtx) {
    ret.push('<tr><td>' + RenderSearchStatusInner(ret, renderCtx) + '</td></tr>');
}
function RenderSearchStatusInner(ret, renderCtx) {
    return '<div id="inplaceSearchDiv_' + renderCtx.wpq + '_lsstatus"></div>';
}
function RenderPaging(ret, renderCtx) {
    var listData = renderCtx.ListData;

    if (listData != null && (listData.PrevHref != null || listData.NextHref != null)) {
        var wpq = renderCtx.wpq;
        var listSchema = renderCtx.ListSchema;

        ret.push('<table border="0" cellpadding="0" cellspacing="0" class="ms-bottompaging" id="bottomPaging');
        ret.push(wpq);
        ret.push('"><tr><td class="ms-vb ms-bottompagingline" id="bottomPagingCell');
        if (!listSchema.groupRender) {
            ret.push(wpq);
            ret.push('" align="center">');
        }
        else
            ret.push('">');
        var str = [];

        str.push("<table><tr>");
        if (listData.PrevHref != null) {
            str.push("<td><a");
            str.push(" onclick=\"RefreshPageTo(event, '");
            str.push(listData.PrevHref);
            str.push("');return false;\"");
            str.push(" href=\"javascript:\"><img src=\"");
            str.push("/_layouts/15/");
            str.push(listSchema.LCID);
            str.push("/images/prev.gif");
            str.push("\" border=\"0\" alt=\"");
            str.push(Strings.STS.L_SPClientPrevious);
            str.push("\"></a></td>");
        }
        str.push("<td class=\"ms-paging\">");
        str.push(listData.FirstRow);
        str.push(" - ");
        str.push(listData.LastRow);
        str.push("</td>");
        if (listData.NextHref != null) {
            str.push("<td><a");
            str.push(" onclick=\"RefreshPageTo(event, '");
            str.push(listData.NextHref);
            str.push("');return false;\"");
            str.push(" href=\"javascript:\"><img src=\"");
            str.push("/_layouts/15/");
            str.push(listSchema.LCID);
            str.push("/images/next.gif");
            str.push("\" border=\"0\" alt=\"");
            str.push(Strings.STS.L_SPClientNext);
            str.push("\"></a></td>");
        }
        str.push("</tr></table>");
        var pagingStr = str.join('');
        var topPagingCell = document.getElementById("topPagingCell" + wpq);

        if (topPagingCell != null) {
            topPagingCell.innerHTML = pagingStr;
        }
        ret.push(pagingStr);
        ret.push('</td></tr>');
        RenderSearchStatus(ret, renderCtx);
        ret.push('</table>');
    }
    else {
        ret.push('<table border="0" cellpadding="0" cellspacing="0" class="ms-bottompaging" id="bottomPaging">');
        RenderSearchStatus(ret, renderCtx);
        ret.push('</table>');
    }
}
function RenderPagingControlNew(ret, renderCtx, fRenderitemNumberRange, strClassName, strId) {
    var listData = renderCtx.ListData;
    var strTopDiv = "<div class=\"%CLASS_NAME%\" id=\"%ID_NAME%\" style=\"padding:2px;\" >";
    var strPrevNext = "<a onclick=\"RefreshPageTo(event, '%PREV_OR_NEXT_PAGE%');return false;\" href=\"javascript:\" ><img alt=\"%PREV_OR_NEXT_ALT%\" src=\"%PREV_OR_NEXT_IMG%\" alt=\"\" /></a>";
    var strPageNums = "<span class=\"ms-paging\">%FIRST_ROW% - %LAST_ROW% </span>";

    ret.push((strTopDiv.replace(/%CLASS_NAME%/, strClassName)).replace(/%ID_NAME%/, strId));
    if (listData != null && (listData.PrevHref != null || listData.NextHref != null)) {
        var wpq = renderCtx.wpq;
        var listSchema = renderCtx.ListSchema;
        var strUrlPathToImg = "/_layouts/15/" + listSchema.LCID + "/images/";

        if (listData.PrevHref != null) {
            var strPrev = strPrevNext.replace(/%PREV_OR_NEXT_PAGE%/, listData.PrevHref);

            strPrev = strPrev.replace(/%PREV_OR_NEXT_IMG%/, strUrlPathToImg + "prev.gif");
            strPrev = strPrev.replace(/%PREV_OR_NEXT_ALT%/, Strings.STS.L_SlideShowPrevButton_Text);
            ret.push(strPrev);
        }
        if (fRenderitemNumberRange) {
            ret.push((strPageNums.replace(/%FIRST_ROW%/, listData.FirstRow)).replace(/%LAST_ROW%/, listData.FirstRow));
        }
        if (listData.NextHref != null) {
            var strNext = strPrevNext.replace(/%PREV_OR_NEXT_PAGE%/, listData.NextHref);

            strNext = strNext.replace(/%PREV_OR_NEXT_IMG%/, strUrlPathToImg + "next.gif");
            strNext = strNext.replace(/%PREV_OR_NEXT_ALT%/, Strings.STS.L_SlideShowNextButton_Text);
            ret.push(strNext);
        }
    }
    ret.push(RenderSearchStatusInner(ret, renderCtx));
    ret.push("</div>");
}
function RenderHeroParameters(renderCtx, delay) {
    if (renderCtx == null) {
        throw "Error: Ctx can not be null in RenderHeroParameters";
    }
    var listSchema = renderCtx.ListSchema;
    var wpq = renderCtx.wpq;

    this.isDocLib = listSchema.IsDocLib;
    this.listTemplate = renderCtx.ListTemplateType;
    this.WOPIEnabled = Boolean(renderCtx.NewWOPIDocumentEnabled);
    this.canUpload = CanUploadFile(renderCtx);
    this.hasInlineEdit = renderCtx.AllowGridMode && !listSchema.IsDocLib && this.listTemplate != 123;
    var canDragUpload = true;

    if (Boolean(delay) || typeof g_uploadType != 'undefined' && (g_uploadType == UploadType.ACTIVEXNA || g_uploadType == UploadType.NOT_SUPPORTED)) {
        canDragUpload = false;
    }
    this.canDragUpload = canDragUpload && !(listTemplate == 119 || listTemplate == 123);
    var heroId = "idHomePageNewItem";
    var addNewText = Strings.STS.L_SPAddNewItem;
    var listTemplate = this.listTemplate;

    if (listTemplate == 104) {
        heroId = "idHomePageNewAnnouncement";
        addNewText = Strings.STS.L_SPAddNewAnnouncement;
    }
    else if (listTemplate == 101 || listTemplate == 700) {
        if (this.WOPIEnabled) {
            heroId = addWPQtoId(c_newdocWOPIID + 'Hero', wpq);
        }
        else {
            heroId = "idHomePageNewDocument-" + wpq;
        }
        addNewText = Strings.STS.L_SPAddNewDocument;
    }
    else if (listTemplate == 115) {
        heroId = "idHomePageNewItem-" + wpq;
        addNewText = Strings.STS.L_SPAddNewDocument;
    }
    else if (listTemplate == 123) {
        addNewText = Strings.STS.L_SPAddNewDocument;
    }
    else if (listTemplate == 103) {
        heroId = "idHomePageNewLink";
        addNewText = Strings.STS.L_SPAddNewLink;
    }
    else if (listTemplate == 106) {
        heroId = "idHomePageNewEvent";
        addNewText = Strings.STS.L_SPAddNewEvent;
    }
    else if (listTemplate == 107 || listTemplate == 150 || listTemplate == 151) {
        addNewText = Strings.STS.L_SPAddNewTask;
    }
    else if (listTemplate == 109) {
        heroId = "idHomePageNewPicture";
        addNewText = Strings.STS.L_SPAddNewPicture;
    }
    else if (listTemplate == 119) {
        heroId = "idHomePageNewWikiPage";
        addNewText = Strings.STS.L_SPAddNewWiki;
    }
    else if (listTemplate == 1230) {
        addNewText = Strings.STS.L_SPAddNewDevApp;
    }
    this.heroId = heroId;
    this.addNewText = addNewText;
    var url;

    if (listTemplate == 119) {
        url = renderCtx.HttpRoot + "/_layouts/15/CreateWebPage.aspx?List=" + renderCtx.listName + '&RootFolder=' + renderCtx.rootFolder;
    }
    else if (renderCtx.ListSchema.IsDocLib) {
        if (this.WOPIEnabled)
            url = "#";
        else
            url = renderCtx.HttpRoot + "/_layouts/15/Upload.aspx?List=" + renderCtx.listName + '&RootFolder=' + renderCtx.rootFolder;
    }
    else if (listTemplate == 1230) {
        url = renderCtx.HttpRoot + "/_layouts/15/DeployDeveloperApp.aspx";
    }
    else {
        url = renderCtx.newFormUrl;
    }
    this.addNewUrl = url;
    this.largeSize = Boolean(listSchema.InplaceSearchEnabled);
}
function RenderHeroParameters_InitializePrototype() {
    RenderHeroParameters.prototype = {
        isDocLib: false,
        listTemplate: -1,
        canDragUpload: true,
        WOPIEnabled: false,
        hasInlineEdit: false,
        heroId: '',
        addNewText: '',
        addNewUrl: '',
        largeSize: false
    };
}
function RenderHeroLink(renderCtx, delay) {
    if (renderCtx.inGridMode) {
        var slink = "<a class=\"ms-heroCommandLink\" href=\"javascript:;\" onclick=\"ExitGrid('";

        slink += renderCtx.view;
        slink += "'); return false;\">";
        return (Strings.STS.L_SPStopEditingList.replace(/{(1)}/, "</a>")).replace(/{(0)}/, slink);
    }
    var heroParam = new RenderHeroParameters(renderCtx, delay);

    if (!Boolean(heroParam))
        return "";
    renderCtx.heroId = heroParam.heroId;
    var retString;
    var newLink = RenderHeroAddNewLink(heroParam, renderCtx);

    if (heroParam.isDocLib && heroParam.listTemplate != 119 && heroParam.canDragUpload) {
        retString = Strings.STS.L_SPAddNewAndDrag;
        retString = retString.replace(/{(0)}/, newLink);
    }
    else if (!heroParam.isDocLib && heroParam.hasInlineEdit) {
        retString = Strings.STS.L_SPAddNewAndEdit;
        var aTag = "<a class=\"ms-heroCommandLink\" href=\"javascript:;\" onclick=\"EnsureScriptParams('inplview', 'InitGridFromView', '";

        aTag += renderCtx.view;
        aTag += "'); return false;\"";
        aTag += " title=\"";
        aTag += Strings.STS.L_SPEditListTitle;
        aTag += "\">";
        retString = ((retString.replace(/{(0)}/, newLink)).replace(/{(1)}/, aTag)).replace(/{(2)}/, '</a>');
    }
    else {
        retString = newLink;
    }
    return retString;
}
function RenderHeroAddNewLink(heroParam, renderCtx) {
    var ret = [];

    ret.push('<a id="');
    ret.push(heroParam.heroId);
    ret.push('" class="ms-heroCommandLink"');
    ret.push('" href="');
    ret.push(heroParam.addNewUrl);
    if (!heroParam.WOPIEnabled) {
        ret.push('" data-viewCtr="');
        ret.push(renderCtx.ctxId);
        ret.push("\" onclick=\"NewItem2(event, &quot;");
        ret.push(heroParam.addNewUrl);
        ret.push("&quot;); return false;\" target=\"_self\"");
    }
    ret.push(" title=\"");
    ret.push(Strings.STS.L_SPAddNewItemTitle);
    ret.push("\">");
    if (heroParam.largeSize) {
        ret.push("<span class=\"ms-list-addnew-imgSpan20\">");
    }
    else {
        ret.push("<span class=\"ms-list-addnew-imgSpan16\">");
    }
    ret.push('<img id="');
    ret.push(heroParam.heroId + '-img');
    ret.push('" src="');
    ret.push(GetThemedImageUrl("spcommon.png"));
    if (heroParam.largeSize) {
        ret.push('" class="ms-list-addnew-img20"/>');
    }
    else {
        ret.push('" class="ms-list-addnew-img16"/>');
    }
    ret.push("</span><span>");
    ret.push(heroParam.addNewText);
    ret.push("</span></a>");
    if (heroParam.WOPIEnabled) {
        AddPostRenderCallback(renderCtx, CreateNewDocumentCallout);
    }
    return ret.join('');
}
function ShouldRenderHeroButton(renderCtx) {
    var listSchema = renderCtx.ListSchema;

    return !Boolean(renderCtx.DisableHeroButton) && (!listSchema.IsDocLib || (CanUploadFile(renderCtx) || renderCtx.ListTemplateType == 119 || Boolean(renderCtx.NewWOPIDocumentEnabled))) && listSchema.ListRight_AddListItems != null && (listSchema.Toolbar == 'Freeform' || typeof window['heroButtonWebPart' + renderCtx.wpq] != 'undefined' && listSchema.Toolbar == 'Standard');
}
function CanUploadFile(renderCtx) {
    var listSchema = renderCtx.ListSchema;

    return Boolean(listSchema) && listSchema.IsDocLib && !browseris.ipad && !browseris.windowsphone7;
}
function RenderHeroButton(ret, renderCtx) {
    function NewButtonRedirection() {
        var WPQ = renderCtx.wpq;

        if (eval("typeof DefaultNewButtonWebPart" + WPQ + " != 'undefined'")) {
            if (Boolean(renderCtx.heroId)) {
                var eleLink = document.getElementById(renderCtx.heroId);

                if (eleLink != null)
                    eval("DefaultNewButtonWebPart" + WPQ + "(eleLink);");
            }
        }
    }
    var listSchema = renderCtx.ListSchema;
    var wpq = renderCtx.wpq;

    if (!ShouldRenderHeroButton(renderCtx)) {
        return;
    }
    ret.push('<table id="Hero-');
    ret.push(wpq);
    ret.push('" dir="');
    ret.push(listSchema.Direction);
    ret.push('" cellpadding="0" cellspacing="0" border="0">');
    ret.push('<tr><td class="ms-list-addnew ');
    if (listSchema.InplaceSearchEnabled) {
        ret.push('ms-textXLarge');
    }
    else {
        ret.push('ms-textLarge');
    }
    ret.push(' ms-soften">');
    ret.push(RenderHeroLink(renderCtx, false));
    ret.push('</td></tr>');
    ret.push('</table>');
    if (renderCtx.ListTemplateType == 115) {
        AddPostRenderCallback(renderCtx, function() {
            setTimeout(NewButtonRedirection, 0);
        });
    }
}
var DocumentType;

function DocumentInformation(typeIn, idTokenIn, imgSrcIn, imgAltIn, textLabelIn) {
    this.type = typeIn;
    this.idToken = idTokenIn;
    this.imgSrc = imgSrcIn;
    this.imgAlt = imgAltIn;
    this.textLabel = textLabelIn;
}
var c_newdocWOPIID;
var c_newDocDivHtml;
var c_onClickCreateDoc;
var c_newDocCalloutWidth;
var NewDocumentInfo;

function InitializeNewDocumentInfo() {
    var docInfo = {};

    docInfo[DocumentType.Word] = new DocumentInformation(DocumentType.Word, 'Word', "/_layouts/15/images/lg_icdocx.png", Strings.STS.L_NewDocumentWordImgAlt, Strings.STS.L_NewDocumentWord);
    docInfo[DocumentType.Excel] = new DocumentInformation(DocumentType.Excel, 'Excel', "/_layouts/15/images/lg_icxlsx.png", Strings.STS.L_NewDocumentExcelImgAlt, Strings.STS.L_NewDocumentExcel);
    docInfo[DocumentType.PowerPoint] = new DocumentInformation(DocumentType.PowerPoint, 'PowerPoint', "/_layouts/15/images/lg_icpptx.png", Strings.STS.L_NewDocumentPowerPointImgAlt, Strings.STS.L_NewDocumentPowerPoint);
    docInfo[DocumentType.OneNote] = new DocumentInformation(DocumentType.OneNote, 'OneNote', "/_layouts/15/images/lg_icont.png", Strings.STS.L_NewDocumentOneNoteImgAlt, Strings.STS.L_NewDocumentOneNote);
    docInfo[DocumentType.Folder] = new DocumentInformation(DocumentType.Folder, 'Folder', "/_layouts/15/images/mb_folder.png", Strings.STS.L_NewDocumentFolderImgAlt, Strings.STS.L_NewDocumentFolder);
    return docInfo;
}
function NewDocumentCallout_OnOpenedCallback(rCtx) {
    var calloutMainId = GetNewDocumentCalloutMainID(rCtx);
    var mainElm = document.getElementById(calloutMainId);

    if (Boolean(mainElm)) {
        var calloutBodyElm = mainElm.parentNode;

        if (Boolean(calloutBodyElm) && HasCssClass(calloutBodyElm, 'js-callout-body')) {
            calloutBodyElm.style.marginLeft = '0px';
            calloutBodyElm.style.marginRight = '0px';
            mainElm.style.marginLeft = '20px';
            mainElm.style.marginRight = '20px';
        }
    }
}
function CreateNewDocumentCallout(rCtx) {
    EnsureScript('callout.js', typeof CalloutManager, function() {
        var wpq = rCtx.wpq;
        var launchPoint = document.getElementById(addWPQtoId(c_newdocWOPIID + 'Hero', wpq));

        if (Boolean(launchPoint)) {
            var callout = CalloutManager.getFromLaunchPointIfExists(launchPoint);

            if (!Boolean(callout) && Boolean(rCtx.NewWOPIDocumentUrl)) {
                var createDocUrl = rCtx.NewWOPIDocumentUrl + '&Source=' + GetSource();
                var contDivHtml = RenderNewDocumentCallout(rCtx, createDocUrl);

                callout = CalloutManager.createNewIfNecessary({
                    launchPoint: launchPoint,
                    ID: addWPQtoId(c_newdocWOPIID, wpq),
                    title: Strings.STS.L_NewDocumentCalloutTitle,
                    content: contDivHtml,
                    onOpenedCallback: function(cl) {
                        NewDocumentCallout_OnOpenedCallback(rCtx);
                    },
                    beakOrientation: 'leftRight',
                    contentWidth: c_newDocCalloutWidth
                });
                if (Boolean(callout) && CanUploadFile(rCtx)) {
                    var uploadUrl = rCtx.HttpRoot + "/_layouts/15/Upload.aspx" + '?List=' + rCtx.listName + '&RootFolder=' + rCtx.rootFolder;

                    callout.addAction(new CalloutAction({
                        text: Strings.STS.L_NewDocumentUploadFile,
                        onClickCallback: function(calloutActionClickEvent, calloutAction) {
                            CalloutManager.closeAll();
                            NewItem2(calloutActionClickEvent, uploadUrl);
                            return false;
                        }
                    }));
                }
            }
        }
    });
}
function GetNewDocumentCalloutMainID(rCtx) {
    return addWPQtoId(c_newdocWOPIID + 'divMain-', rCtx.wpq);
}
function RenderNewDocumentCallout(renderCtx, createDocumentUrl) {
    var strCallout = [];
    var wpq = renderCtx.wpq;

    strCallout.push('<div id="');
    strCallout.push(GetNewDocumentCalloutMainID(renderCtx));
    strCallout.push('" class="ms-newdoc-callout-main">');
    for (var docType in NewDocumentInfo) {
        var docInfo = NewDocumentInfo[docType];

        if (typeof docInfo != 'undefined' && docInfo != null) {
            var onClick;

            if (Number(docType) != DocumentType.Folder) {
                onClick = String.format(c_onClickCreateDoc, createDocumentUrl, String(docInfo.type));
            }
            else if (Boolean(renderCtx.AllowCreateFolder)) {
                strCallout.push('<hr/>');
                onClick = RenderNewFolderUrl(renderCtx);
            }
            else {
                continue;
            }
            var docDivId = c_newdocWOPIID + 'div' + docInfo.idToken + '-';
            var docDiv = String.format(c_newDocDivHtml, addWPQtoId(docDivId, wpq), addWPQtoId(docDivId + 'img-', wpq), docInfo.imgSrc, docInfo.imgAlt, addWPQtoId(docDivId + 'txt-', wpq), onClick, docInfo.textLabel);

            strCallout.push(docDiv);
        }
    }
    strCallout.push('</div>');
    return strCallout.join('');
}
function RenderNewFolderUrl(renderCtx) {
    var ret = [];

    ret.push('CalloutManager.closeAll(); NewItem2(event, &quot;');
    ret.push(renderCtx.HttpRoot);
    ret.push("/_layouts/15/listform.aspx?ListId=");
    ret.push(unescapeProperly(renderCtx.listName));
    ret.push('&PageType=8');
    ret.push('&RootFolder=');
    if (Boolean(renderCtx.rootFolder) && renderCtx.rootFolder != "") {
        ret.push(escapeProperly(unescapeProperly(renderCtx.rootFolder)));
    }
    else {
        ret.push(escapeProperly(unescapeProperly(renderCtx.listUrlDir)));
    }
    ret.push('&Type=1&quot;);return false;');
    return ret.join('');
}
function addWPQtoId(id, wpq) {
    if (Boolean(id) && Boolean(wpq)) {
        if (id.lastIndexOf('-') == id.length - 1)
            return id + wpq;
        else
            return id + '-' + wpq;
    }
    else
        return id;
}
function RenderTitle(titleText, renderCtx, listItem, listSchema, title) {
    titleText.push("<a class=\"ms-listlink\" onfocus=\"OnLink(this)\" href=\"");
    titleText.push(CreateItemPropertiesTitleUrl(renderCtx, listItem, listSchema));
    titleText.push("\" onclick=\"EditLink2(this,");
    titleText.push(renderCtx.ctxId);
    titleText.push(");return false;\" target=\"_self\">");
    titleText.push(Boolean(listSchema.HasTitle) ? title : STSHtmlEncode(title));
    titleText.push("</a>");
}
function CreateItemPropertiesTitleUrl(renderCtx, listItem, listSchema) {
    var titleUrl = [];

    if (renderCtx.inGridMode)
        titleUrl.push(renderCtx.editFormUrl);
    else
        titleUrl.push(renderCtx.displayFormUrl);
    titleUrl.push("&ID=");
    titleUrl.push(listItem.ID);
    titleUrl.push("&ContentTypeID=");
    titleUrl.push(listItem.ContentTypeId);
    return titleUrl.join('');
}
function LinkTitleValue(titleValue) {
    if (titleValue == '')
        return Strings.STS.L_SPClientNoTitle;
    else
        return titleValue;
}
function HasEditPermission(listItem) {
    var permMask = listItem.PermMask;

    return (parseInt("0x" + permMask.substring(permMask.length - 1)) & 0x4) != 0;
}
var ComputedFieldWorker;

function ComputedFieldRenderer_InitializePrototype() {
    ComputedFieldRenderer.prototype = {
        RenderField: ComputedFieldRenderField
    };
}
function ComputedFieldRenderer(fieldName) {
    this.fldName = fieldName;
    this.fieldRenderer = null;
}
function ComputedFieldRenderField(renderCtx, field, listItem, listSchema) {
    if (this.fieldRenderer == null)
        this.fieldRenderer = ComputedFieldWorker[this.fldName];
    if (this.fieldRenderer != null)
        return this.fieldRenderer(renderCtx, field, listItem, listSchema);
    else
        return STSHtmlEncode(listItem[this.fldName]);
}
var RenderCalloutAffordance;
var RenderECB;
var RenderECBinline;

function calloutCreateAjaxMenu(e) {
    var anchorElement = GetParentLinkFromEvent(e);

    if (anchorElement === null)
        return;
    itemTable = anchorElement.parentNode;
    currentItemID = GetAttributeFromItemTable(itemTable, "ItemId", "Id");
    setupMenuContextName(itemTable.getAttribute("CTXName"));
    CreateAjaxMenu(e);
}
var g_lastLaunchPointIIDClicked;

function OpenCallout(launchPoint, curEvent, node, listItemID) {
    EnsureScriptFunc("callout.js", "Callout", function() {
        if (node.tagName == "TD") {
            if (calloutManager.containsOneCalloutOpen(node))
                return undefined;
            var srcElement = GetParentLinkFromEvent(curEvent);

            if (isInvalidAjaxMenuElement(srcElement)) {
                srcElement = Boolean(curEvent.srcElement) ? curEvent.srcElement : curEvent.target;
                if (isInvalidAjaxMenuElement(srcElement)) {
                    return undefined;
                }
            }
            node = ((m$(node)).find("div.s4-ctx"))[0];
            if (node == null)
                return undefined;
            launchPoint = node;
        }
        CalloutManager.closeAll();
        var iid = findIIDInAncestorNode(node);

        if (iid === null)
            return false;
        g_lastLaunchPointIIDClicked = iid;
        function onDependenciesLoaded() {
            if (iid !== g_lastLaunchPointIIDClicked)
                return;
            var listCallout = CalloutManager.getFromLaunchPointIfExists(launchPoint);

            if (listCallout === null) {
                var calloutID = generateUniqueCalloutIDFromBaseID(iid);

                listCallout = CalloutManager.createNew({
                    launchPoint: launchPoint,
                    ID: calloutID,
                    openOptions: {
                        event: "none",
                        showCloseButton: true,
                        closeCalloutOnBlur: true
                    },
                    onOpeningCallback: function(callout) {
                        Callout_OnOpeningCallback(callout, listItemID);
                    },
                    beakOrientation: "leftRight",
                    onClosedCallback: ecbManager.DismissECB,
                    contentWidth: 300,
                    boundingBox: document.getElementById('s4-workspace')
                });
            }
            listCallout.toggle();
        }
        var ctxRgiid = GetCtxRgiidFromIid(iid);
        var viewCtx = ctxRgiid.ctx;

        if (viewCtx.ListSchema.IsDocLib)
            EnsureScriptFunc("filePreview.js", "filePreviewManager", onDependenciesLoaded);
        else
            onDependenciesLoaded();
        return false;
    });
}
var RenderCalloutMenu;

function findIIDInAncestorNode(node) {
    while (node !== null && node.tagName !== "TABLE") {
        var nodeiid = node.getAttribute('iid');

        if (nodeiid !== null && nodeiid !== "")
            return nodeiid;
        else
            node = node.parentNode;
    }
    return null;
}
var usedCalloutIDs;
var generateUniqueCalloutIDFromBaseID;

function GetCalloutElementIDFromCallout(callout) {
    return 'co' + callout.getID() + '_callout';
}
function GetCalloutElementIDFromRenderCtx(renderCtx) {
    return 'co' + (GetCalloutFromRenderCtx(renderCtx)).getID() + '_callout';
}
function GetCalloutFromRenderCtx(renderCtx) {
    return renderCtx.CurrentCallout;
}
var CALLOUT_STR_ELLIPSIS;
var CALLOUT_ELLIPSIS_LENGTH;
var CALLOUT_CHARS_TO_TRUNCATE_PER_ITERATION;

function displayTruncatedString(element, string, maxWidth) {
    var lastWidth = element.offsetWidth;

    while (element.offsetWidth > maxWidth) {
        var newLengthToTry = element.innerHTML.length - CALLOUT_CHARS_TO_TRUNCATE_PER_ITERATION;

        element.innerHTML = safeTruncateString(element.innerHTML, newLengthToTry) + CALLOUT_STR_ELLIPSIS;
        if (element.offsetWidth === lastWidth) {
            Sys.Debug.assert(false, "String truncation is not affecting element width. Element must not be setup correctly.");
            return element.innerHTML;
        }
        lastWidth = element.offsetWidth;
    }
    if (element.innerHTML.length < string.length) {
        element.title = string;
    }
    return element.innerHTML;
}
function displayTruncatedLocation(element, maxHeight) {
    var charsToTruncate = 1 + CALLOUT_ELLIPSIS_LENGTH;

    while (element.offsetHeight > maxHeight) {
        var newLengthToTry = element.innerHTML.length - charsToTruncate;

        element.innerHTML = CALLOUT_STR_ELLIPSIS + safeTruncateStringFromStart(element.innerHTML, newLengthToTry);
    }
    return element.innerHTML;
}
function displayTruncatedUrl(element, fullUrl, maxWidth, allowTruncateQuery) {
    var MIN_AUTHORITY_LENGTH_IN_CHARS = 4;
    var urlToDisplay = new URI(fullUrl.getString());

    element.innerHTML = STSHtmlEncode(urlToDisplay.getDecodedStringForDisplay());
    var lastWidth = element.offsetWidth;

    while (element.offsetWidth > maxWidth) {
        var path = urlToDisplay.getPath();
        var authority = urlToDisplay.getAuthority();
        var query = urlToDisplay.getQuery();
        var indexOfNextSlash = path.indexOf('/', CALLOUT_ELLIPSIS_LENGTH + 2);

        if (indexOfNextSlash >= 0) {
            path = '/' + CALLOUT_STR_ELLIPSIS + path.substr(indexOfNextSlash);
            urlToDisplay.setPath(path);
        }
        else if (allowTruncateQuery && query.length > CALLOUT_CHARS_TO_TRUNCATE_PER_ITERATION) {
            query = safeTruncateString(query, query.length - CALLOUT_CHARS_TO_TRUNCATE_PER_ITERATION) + CALLOUT_STR_ELLIPSIS;
            urlToDisplay.setQuery(query);
        }
        else if (authority.length > MIN_AUTHORITY_LENGTH_IN_CHARS + CALLOUT_ELLIPSIS_LENGTH) {
            authority = safeTruncateString(authority, MIN_AUTHORITY_LENGTH_IN_CHARS) + CALLOUT_STR_ELLIPSIS;
            urlToDisplay.setAuthority(authority);
        }
        else if (path.length > CALLOUT_CHARS_TO_TRUNCATE_PER_ITERATION) {
            path = safeTruncateString(path, path.length - CALLOUT_CHARS_TO_TRUNCATE_PER_ITERATION) + CALLOUT_STR_ELLIPSIS;
            urlToDisplay.setPath(path);
        }
        else if (query.length > CALLOUT_CHARS_TO_TRUNCATE_PER_ITERATION) {
            query = safeTruncateString(query, query.length - CALLOUT_CHARS_TO_TRUNCATE_PER_ITERATION) + CALLOUT_STR_ELLIPSIS;
            urlToDisplay.setQuery(query);
        }
        element.innerHTML = STSHtmlEncode(urlToDisplay.getDecodedStringForDisplay());
        if (element.offsetWidth === lastWidth) {
            Sys.Debug.assert(false, "Url truncation is not affecting element width. Element must not be setup correctly.");
            return element.innerHTML;
        }
        lastWidth = element.offsetWidth;
    }
    return element.innerHTML;
}
function CalloutRenderViewTemplate(renderCtx) {
    var iStr = '';

    iStr += renderCtx.RenderHeader(renderCtx);
    iStr += renderCtx.RenderBody(renderCtx);
    iStr += renderCtx.RenderFooter(renderCtx);
    return iStr;
}
var g_ClipboardControl;
var g_IsClipboardControlValid;

function EnsureClipboardControl() {
    if (m$.isUndefinedOrNull(g_ClipboardControl)) {
        try {
            if (m$.isDefinedAndNotNull(window.ActiveXObject)) {
                g_ClipboardControl = new window.ActiveXObject('SharePoint.ClipboardCtl.1');
                g_IsClipboardControlValid = true;
            }
            else if (IsSupportedMacBrowser()) {
                g_ClipboardControl = CreateMacPlugin();
                g_IsClipboardControlValid = m$.isDefinedAndNotNull(g_ClipboardControl.CopyToClipboard);
            }
            else if (IsSupportedNPApiBrowserOnWin()) {
                g_ClipboardControl = CreateNPApiOnWindowsPlugin('application/x-sharepoint');
                g_IsClipboardControlValid = m$.isDefinedAndNotNull(g_ClipboardControl.CopyToClipboard);
            }
        }
        catch (e) {
            g_ClipboardControl = null;
            g_IsClipboardControlValid = false;
        }
    }
    return g_IsClipboardControlValid;
}
function GetClientAppNameFromMapApp(mapApp) {
    var appNames = {
        'excel': "Microsoft Excel",
        'onenote': "Microsoft OneNote",
        'powerpoint': "Microsoft PowerPoint",
        'project': "Microsoft Project",
        'publisher': "Microsoft Publisher",
        'visio': "Microsoft Visio",
        'word': "Microsoft Word",
        'infopath': "Microsoft InfoPath"
    };

    return mapApp in appNames ? appNames[mapApp] : null;
}
function CopyToClipboard(textToCopy, htmlToCopy) {
    if (EnsureClipboardControl()) {
        g_ClipboardControl.CopyToClipboard(textToCopy, htmlToCopy);
    }
}
function CalloutRenderHeaderTemplate(renderCtx) {
    var calloutID = GetCalloutElementIDFromRenderCtx(renderCtx);
    var title = '';

    if (renderCtx.ListSchema.IsDocLib == '1') {
        title = renderCtx.CurrentItem.FileLeafRef;
    }
    else {
        title = renderCtx.CurrentItem.Title;
    }
    return Callout.GenerateDefaultHeader(calloutID, STSHtmlEncode(title), null, true);
}
function CalloutRenderFooterTemplate(renderCtx, calloutActionMenuPopulator, renderECB) {
    if (typeof calloutActionMenuPopulator === 'undefined' || calloutActionMenuPopulator === null) {
        calloutActionMenuPopulator = CalloutOnPostRenderTemplate;
    }
    if (typeof renderECB === 'undefined' || renderECB === null) {
        renderECB = true;
    }
    var calloutID = GetCalloutElementIDFromRenderCtx(renderCtx);

    AddPostRenderCallback(renderCtx, function() {
        var calloutActionMenu = new CalloutActionMenu(calloutID + '-actions');

        calloutActionMenuPopulator(renderCtx, calloutActionMenu);
        calloutActionMenu.render();
    });
    var ecbMarkup = [];

    if (renderECB) {
        ecbMarkup.push('<span id=' + StAttrQuote(calloutID + '-ecbMenu') + ' class="js-callout-actions js-callout-ecbActionDownArrow">');
        ecbMarkup.push(RenderECBinline(renderCtx, renderCtx.CurrentItem, renderCtx.CurrentFieldSchema));
        ecbMarkup.push('</span>');
    }
    return Callout.GenerateDefaultFooter(calloutID, ecbMarkup.join(''));
}
function CalloutRenderFooterArea(calloutID, renderECB, renderCtx) {
    return Callout.GenerateDefaultFooter(calloutID, null);
}
function GetCallOutOpenText(listItem) {
    if (listItem != null && HasEditPermission(listItem) && (IsClientAppInstalled(listItem["File_x0020_Type.progid"], listItem["File_x0020_Type.mapapp"], null) || isDefinedAndNotNullOrEmpty(listItem["serverurl.progid"]) && isDefinedAndNotNullOrEmpty(listItem["HTML_x0020_File_x0020_Type.File_x0020_Type.mapcon"])))
        return Strings.STS.L_CalloutEditAction;
    else
        return Strings.STS.L_CalloutOpenAction;
}
function CalloutOnPostRenderTemplate(renderCtx, calloutActionMenu) {
    var listItem = renderCtx.CurrentItem;
    var openText = GetCallOutOpenText(listItem);

    calloutActionMenu.addAction(new CalloutAction({
        text: openText,
        onClickCallback: function(calloutActionClickEvent, calloutAction) {
            CalloutAction_Open_OnClick(calloutActionClickEvent, calloutAction, renderCtx);
        }
    }));
    calloutActionMenu.addAction(new CalloutAction({
        text: Strings.STS.L_CalloutShareAction,
        onClickCallback: function(calloutActionClickEvent, calloutAction) {
            CalloutAction_Share_OnClick(calloutActionClickEvent, calloutAction, renderCtx);
        },
        isVisibleCallback: function(calloutAction) {
            return CalloutAction_Share_IsVisible(calloutAction, renderCtx);
        },
        isEnabledCallback: function(calloutAction) {
            return CalloutAction_Share_IsEnabled(calloutAction, renderCtx);
        }
    }));
}
function CalloutRenderBodyTemplate(renderCtx) {
    var itemTpls = renderCtx.Templates['Item'];

    if (itemTpls == null || itemTpls == {})
        return '';
    var listData = renderCtx.ListData;
    var listSchema = renderCtx.ListSchema;
    var bHasHeader = renderCtx.Templates.Header != '';
    var groupTpls = renderCtx.Templates['Group'];

    if (groupTpls == null || groupTpls == RenderItemTemplateDefault || typeof groupTpls != "function" && typeof groupTpls != "string")
        groupTpls = RenderGroupTemplate;
    else if (typeof groupTpls == "string")
        groupTpls = SPClientRenderer.ParseTemplateString(groupTpls, renderCtx);
    var ItemTpl = renderCtx.Templates['Item'];

    if (ItemTpl == null || ItemTpl == RenderFieldTemplateDefault || typeof ItemTpl != "function" && typeof ItemTpl != "string")
        ItemTpl = RenderItemTemplate;
    else if (typeof ItemTpl == "string")
        ItemTpl = SPClientRenderer.ParseTemplateString(ItemTpl, renderCtx);
    var listItem = renderCtx.CurrentItem;
    var itemType = listItem['ItemType'];
    var tpl = itemTpls[itemType];

    if (tpl == null || tpl == '') {
        tpl = ItemTpl;
    }
    else if (typeof tpl == 'string') {
        tpl = SPClientRenderer.ParseTemplateString(tpl, renderCtx);
        itemTpls[itemType] = tpl;
    }
    return Callout.GenerateDefaultBody(GetCalloutElementIDFromRenderCtx(renderCtx), CoreRender(tpl, renderCtx));
}
function CalloutRenderFilePreview(renderCtx) {
    var listItem = renderCtx.CurrentItem;
    var callout = GetCalloutFromRenderCtx(renderCtx);

    if (m$.isUndefined(callout.listItemPreviewer)) {
        callout.listItemPreviewer = filePreviewManager.createPreviewFromListItem(renderCtx, listItem);
        AddPostRenderCallback(renderCtx, function() {
            callout.listItemPreviewer.onPostRender();
            if (callout.isOpen()) {
                callout.listItemPreviewer.onVisible();
            }
            callout.addEventCallback("opened", function() {
                callout.listItemPreviewer.onVisible();
            });
            callout.addEventCallback("closing", function() {
                callout.listItemPreviewer.onHidden();
            });
        });
    }
    if (m$.isDefinedAndNotNull(callout.listItemPreviewer)) {
        var calloutContentWidth = callout.getContentWidth();
        var previewerWidth = callout.listItemPreviewer.getWidth() + 40;

        if (previewerWidth !== null && previewerWidth > calloutContentWidth) {
            callout.set({
                contentWidth: previewerWidth
            });
        }
    }
    var previewMarkup = callout.listItemPreviewer.getHtml();

    return Callout.GenerateDefaultSection(null, previewMarkup);
}
function GetCalloutSharingStatusDivId(renderCtx) {
    return GetCalloutElementIDFromRenderCtx(renderCtx) + 'SharedWithInfo';
}
function CalloutRenderSharingStatus(renderCtx) {
    AddPostRenderCallback(renderCtx, CalloutPostRenderSharingStatus);
    return CalloutRenderSharingStatusDiv(renderCtx);
}
function CalloutPostRenderSharingStatus(renderCtx) {
    var ctxListItem = renderCtx.CurrentItem;

    if (permMaskContains(ctxListItem.PermMask, 0x0, 0x20000)) {
        var callout = GetCalloutFromRenderCtx(renderCtx);
        var viewCtx = getViewCtxFromCalloutCtx(renderCtx);
        var sharedWithInfoID = GetCalloutSharingStatusDivId(renderCtx);
        var renderSharingStatus = function(objectSharingInformation, sharedWithUsers) {
            var isSharedWithMany = objectSharingInformation.get_isSharedWithMany();
            var isSharedWithSecurityGroup = objectSharingInformation.get_isSharedWithSecurityGroup();
            var isSharedWithGuest = objectSharingInformation.get_isSharedWithGuest() && (isDefinedAndNotNullOrEmpty(objectSharingInformation.get_anonymousEditLink()) || isDefinedAndNotNullOrEmpty(objectSharingInformation.get_anonymousViewLink()));
            var itemTitle = null;

            if (isDefinedAndNotNullOrEmpty(ctxListItem.FileLeafRef)) {
                itemTitle = ctxListItem.FileLeafRef;
            }
            else if (isDefinedAndNotNullOrEmpty(ctxListItem.Title)) {
                itemTitle = ctxListItem.Title;
            }
            var sharedWithUsersArray = [];
            var sharedWithUsersEnum = sharedWithUsers.getEnumerator();

            while (sharedWithUsersEnum.moveNext()) {
                var currentSharedWithUser = sharedWithUsersEnum.get_current();
                var sharedWithUser = {
                    id: currentSharedWithUser.get_id(),
                    title: currentSharedWithUser.get_name(),
                    email: currentSharedWithUser.get_email(),
                    sip: currentSharedWithUser.get_email()
                };

                sharedWithUsersArray.push(sharedWithUser);
            }
            EnsureScriptFunc("sharing.js", "GetSharingStatusHtml", function() {
                var sharingListElement = document.getElementById(sharedWithInfoID);
                var sharingStatusHtml = GetSharingStatusHtml(sharedWithUsersArray, isSharedWithMany, isSharedWithSecurityGroup, isSharedWithGuest, false, viewCtx.ListSchema.UserDispUrl, itemTitle, viewCtx, callout, true);

                if (sharingStatusHtml.length > 0) {
                    sharingListElement.innerHTML = Callout.GenerateDefaultSection(null, sharingStatusHtml);
                    sharingListElement.calloutRenderCtx = renderCtx;
                    sharingListElement.objectSharingInformation = objectSharingInformation;
                }
                window.setTimeout(function() {
                    ApplySharingListStyles(sharingListElement);
                    ((m$(sharingListElement)).find(".js-callout-sharedWithLink")).click(function(evt) {
                        var currentCallout = GetCalloutFromRenderCtx(renderCtx);

                        if (m$.isDefinedAndNotNull(currentCallout))
                            currentCallout.close();
                        DisplaySharedWithDialog(viewCtx.HttpRoot, viewCtx.listName, ctxListItem.ID);
                        return false;
                    });
                }, 0);
            });
        };
        var cctx = SP.ClientContext.get_current();
        var listItemSharingInformation = SP.ObjectSharingInformation.getListItemSharingInformation(cctx, viewCtx.listName, ctxListItem.ID, true, false, true, true, false, false);
        var listItemSharedWithUsers = listItemSharingInformation.getSharedWithUsers(cctx);

        cctx.load(listItemSharingInformation, 'IsSharedWithMany', 'IsSharedWithSecurityGroup', 'IsSharedWithGuest', 'CanManagePermissions', 'AnonymousEditLink', 'AnonymousViewLink');
        cctx.load(listItemSharedWithUsers);
        var onSharingInformationQuerySucceeded = function(sender, args) {
            renderSharingStatus(listItemSharingInformation, listItemSharedWithUsers);
        };
        var onSharingInformationQueryFailed = function(sender, args) {
        };

        cctx.executeQueryAsync(onSharingInformationQuerySucceeded, onSharingInformationQueryFailed);
    }
}
function CalloutRenderSection(sectionHeaderText, sectionMarkup) {
    Callout.GenerateDefaultSection(sectionHeaderText, sectionMarkup);
}
function CalloutRenderSharingStatusDiv(renderCtx) {
    var sharedWithInfoID = GetCalloutSharingStatusDivId(renderCtx);
    var sharingStatusDivMarkup = '<div class="js-callout-sharedWithInfo" id=' + StAttrQuote(sharedWithInfoID) + '></div>';

    return sharingStatusDivMarkup;
}
function CalloutRenderLastModifiedInfo(renderCtx) {
    var ret = [];
    var ctxListItem = renderCtx.CurrentItem;
    var calloutID = GetCalloutElementIDFromRenderCtx(renderCtx);
    var lastModifiedID = calloutID + 'Modified';

    ret.push('<span id=', StAttrQuote(lastModifiedID), '>');
    var renderLastModifiedInfo = function(editorId, editorDisplayName, editorEmail, editorSip, lastModified) {
        var editorToDisplay = '';

        if (editorId == renderCtx.CurrentUserId) {
            editorToDisplay = Strings.STS.L_CalloutLastEditedYou;
        }
        else if (m$.isUndefinedOrNull(editorSip) || m$.isUndefinedOrNull(editorEmail)) {
            editorToDisplay = STSHtmlEncode(editorDisplayName);
        }
        else {
            var lastModifiedCtxData = {
                'ID': '0',
                'Editor': [{
                    "id": editorId,
                    "title": editorDisplayName,
                    "email": editorEmail,
                    "sip": editorSip
                }]
            };
            var lastModifiedCtxSchema = {
                "Field": [{
                    "Name": "Editor",
                    "FieldType": "User",
                    "DefaultRender": "1",
                    "HasUserLink": "1",
                    "Type": "User"
                }],
                "EffectivePresenceEnabled": "1",
                "PresenceAlt": "No presence information",
                "UserDispUrl": "/_layouts/15/userdisp.aspx"
            };
            var lastModifiedCtx = new ContextInfo();

            lastModifiedCtx.Templates = {};
            lastModifiedCtx.Templates['Fields'] = {};
            editorToDisplay = spMgr.RenderFieldByName(lastModifiedCtx, 'Editor', lastModifiedCtxData, lastModifiedCtxSchema);
        }
        return StBuildParam(Strings.STS.L_CalloutLastEditedNameAndDate, editorToDisplay, lastModified);
    };

    if (m$.isDefinedAndNotNull(ctxListItem.Editor) && m$.isDefinedAndNotNull(ctxListItem.Editor[0]) && m$.isDefinedAndNotNull(ctxListItem.Modified)) {
        ret.push(renderLastModifiedInfo(ctxListItem.Editor[0].id, ctxListItem.Editor[0].title, ctxListItem.Editor[0].email, ctxListItem.Editor[0].sip, ctxListItem.Modified));
    }
    else {
        AddPostRenderCallback(renderCtx, function() {
            var cctx = SP.ClientContext.get_current();
            var list = ((cctx.get_web()).get_lists()).getById(renderCtx.listName);
            var listItem = list.getItemById(ctxListItem.ID);
            var onLastModifiedQuerySucceeded = function(sender, args) {
                var fieldValues = listItem.get_fieldValues();

                if (m$.isDefinedAndNotNull(fieldValues.Editor) && m$.isDefinedAndNotNull(fieldValues.Modified)) {
                    var modifiedFormattedForDisplay = SP.Utilities.Utility.formatDateTime(cctx, cctx.get_web(), fieldValues.Modified, SP.Utilities.DateTimeFormat.dateTime);
                    var onDateFormatQuerySucceeded = function(snd, arg) {
                        var lastModifiedElement = document.getElementById(lastModifiedID);

                        lastModifiedElement.innerHTML = renderLastModifiedInfo(fieldValues.Editor.get_lookupId(), fieldValues.Editor.get_lookupValue(), null, null, modifiedFormattedForDisplay.get_value());
                    };

                    cctx.executeQueryAsync(onDateFormatQuerySucceeded, onLastModifiedQueryFailed);
                }
            };
            var onLastModifiedQueryFailed = function(sender, args) {
                Sys.Debug.assert(false, 'CSOM query to get last modified info failed');
            };

            cctx.load(listItem);
            cctx.executeQueryAsync(onLastModifiedQuerySucceeded, onLastModifiedQueryFailed);
        });
    }
    ret.push('&nbsp;</span>');
    var lastModifiedInfoMarkup = ret.join('');

    return Callout.GenerateDefaultSection(null, lastModifiedInfoMarkup);
}
function CalloutRenderSourceUrl(renderCtx) {
    var ret = [];
    var listItem = renderCtx.CurrentItem;
    var calloutID = GetCalloutElementIDFromRenderCtx(renderCtx);
    var sourceUrlID = calloutID + 'SourceUrl';
    var isDocLib = renderCtx.ListSchema.IsDocLib === '1';
    var fullUrl = null;

    if (isDocLib) {
        var hostUrl = getHostUrl(renderCtx.HttpRoot);
        var fileRef = listItem.FileRef;

        fullUrl = new URI(renderCtx.HttpRoot);
        fullUrl.setPath(fileRef);
    }
    else {
        fullUrl = new URI(CreateItemPropertiesTitleUrl(renderCtx, listItem, renderCtx.ListSchema));
    }
    var decodedFullUrl = fullUrl.getDecodedStringForDisplay();
    var encodedFullUrl = fullUrl.getString();
    var fullUrlForLinking = new URI(GetRedirectedHref(encodedFullUrl, renderCtx.ListSchema.DefaultItemOpen, listItem["HTML_x0020_File_x0020_Type.File_x0020_Type.mapcon"], listItem["HTML_x0020_File_x0020_Type"], listItem["serverurl.progid"], listItem["FSObjType"] == "1", true, null));

    ret.push("<input id='");
    ret.push(sourceUrlID);
    ret.push("' value='");
    ret.push(fullUrlForLinking.getDecodedStringForDisplay());
    ret.push("' class='js-callout-location' readonly='readonly' ");
    ret.push("onclick='setFocusAndSelectAll(");
    ret.push(StAttrQuote(sourceUrlID));
    ret.push(");' ");
    ret.push("oncontextmenu='setFocusAndSelectAll(");
    ret.push(StAttrQuote(sourceUrlID));
    ret.push(");' ");
    ret.push("onselect='setFocusAndSelectAll(");
    ret.push(StAttrQuote(sourceUrlID));
    ret.push(");' ");
    ret.push("/>");
    var sourceUrlInfoMarkup = ret.join('');

    return Callout.GenerateDefaultSection(null, sourceUrlInfoMarkup);
}
function setFocusAndSelectAll(elementName) {
    var elm = document.getElementById(elementName);

    if (elm != null) {
        elm.focus();
        elm.select();
    }
}
function CalloutRenderItemTemplate(renderCtx) {
    var ret = [];

    if (renderCtx.ListSchema.IsDocLib)
        ret.push(CalloutRenderFilePreview(renderCtx));
    ret.push(CalloutRenderLastModifiedInfo(renderCtx));
    ret.push(CalloutRenderSharingStatus(renderCtx));
    ret.push(CalloutRenderSourceUrl(renderCtx));
    return ret.join('');
}
function getItemIDFromIID(iid) {
    var rgiid = iid.split(",");

    return rgiid[1];
}
function getItemIdxByID(items, id) {
    for (var idx = 0; idx < items.length; idx++) {
        if (items[idx].ID == id)
            return idx;
    }
    return -1;
}
function permMaskContains(permMaskString, requiredH, requiredL) {
    var permMaskH = GetPermMaskH(permMaskString);
    var permMaskL = GetPermMaskL(permMaskString);

    return CheckIfHasRights(requiredH, requiredL, permMaskH, permMaskL);
}
function getCtxFromCtxNum(ctxNum) {
    return window["ctx" + ctxNum];
}
function getViewCtxFromCalloutCtx(calloutCtx) {
    return getCtxFromCtxNum(calloutCtx.ctxId);
}
function smartOpenFileOrFolderFromHref(sourceEvent, anchor, listItem, listSchema) {
    if (listItem.FSObjType === '1') {
        VerifyFolderHref(anchor, sourceEvent, listItem["File_x0020_Type.url"], ["File_x0020_Type.progid"], listSchema.DefaultItemOpen, listItem["HTML_x0020_File_x0020_Type.File_x0020_Type.mapcon"], listItem["HTML_x0020_File_x0020_Type"], listItem["serverurl.progid"]);
        HandleFolder(anchor, sourceEvent, listSchema.PagePath + "?RootFolder=" + escapeProperly(listItem.FileRef) + listSchema.ShowWebPart + "&FolderCTID=" + listItem.ContentTypeId + "&View=" + escapeProperly(listSchema.View), 'TRUE', 'FALSE', listItem["File_x0020_Type.url"], listItem["File_x0020_Type.progid"], listSchema.DefaultItemOpen, listItem["HTML_x0020_File_x0020_Type.File_x0020_Type.mapcon"], listItem["HTML_x0020_File_x0020_Type"], listItem["serverurl.progid"], Boolean(listItem["CheckoutUser"]) ? listItem["CheckoutUser"][0].id : '', listSchema.Userid, listSchema.ForceCheckout, listItem.IsCheckedoutToLocal, listItem.PermMask);
    }
    else {
        VerifyHref(anchor, sourceEvent, listSchema.DefaultItemOpen, listItem["HTML_x0020_File_x0020_Type.File_x0020_Type.mapcon"], listItem["serverurl.progid"]);
        DispEx(anchor, sourceEvent, 'TRUE', 'FALSE', listItem["File_x0020_Type.url"], listItem["File_x0020_Type.progid"], listSchema.DefaultItemOpen, listItem["HTML_x0020_File_x0020_Type.File_x0020_Type.mapcon"], listItem["HTML_x0020_File_x0020_Type"], listItem["serverurl.progid"], listItem["CheckoutUser"], listSchema.Userid, listSchema.ForceCheckout, listItem.IsCheckedoutToLocal, listItem.PermMask);
    }
}
function CalloutAction_Open_OnClick(calloutActionClickEvent, calloutAction, renderCtx) {
    var anchor = calloutActionClickEvent.target;
    var listSchema = renderCtx.ListSchema;
    var listItem = renderCtx.CurrentItem;

    if (m$.isUndefinedOrNull(listItem) || m$.isUndefinedOrNull(listItem.ID)) {
        throw "Error: listItem is missing properties";
    }
    if (listSchema.IsDocLib == '1' || listItem.FSObjType == '1') {
        anchor.setAttribute("href", getHostUrl(renderCtx.HttpRoot) + listItem.FileRef);
        anchor.setAttribute("isEdit", "1");
        anchor.setAttribute("App", listItem["File_x0020_Type.mapapp"]);
    }
    else {
        anchor.setAttribute("href", CreateItemPropertiesTitleUrl(renderCtx, listItem, listSchema));
    }
    smartOpenFileOrFolderFromHref(calloutActionClickEvent.originalEvent, anchor, listItem, listSchema);
    anchor.removeAttribute("isEdit");
    anchor.removeAttribute("App");
}
function CalloutAction_Share_OnClick(calloutActionClickEvent, calloutAction, renderCtx) {
    var callout = GetCalloutFromRenderCtx(renderCtx);

    if (m$.isDefinedAndNotNull(callout)) {
        callout.close();
    }
    DisplaySharingDialogForListItem(renderCtx);
}
function DisplaySharingDialogForListItem(renderCtx, listItemID) {
    EnsureScriptFunc("sharing.js", "DisplaySharingDialog", function() {
        if (typeof listItemID === "undefined") {
            var listItem = renderCtx.CurrentItem;

            listItemID = listItem.ID;
        }
        DisplaySharingDialog(renderCtx.HttpRoot, renderCtx.listName, listItemID);
    });
}
function CalloutAction_Share_IsVisible(calloutAction, renderCtx) {
    if (!Boolean(_spPageContextInfo.userId)) {
        return false;
    }
    var listItem = renderCtx.CurrentItem;

    if (m$.isUndefinedOrNull(listItem)) {
        return false;
    }
    return true;
}
function CalloutAction_Share_IsEnabled(calloutAction, renderCtx) {
    var listSchema = renderCtx.ListSchema;

    return !Boolean(listSchema) || listSchema.ForceCheckout === "0";
}
function safeTruncateString(str, numChars) {
    if (numChars < 0) {
        throw "Error: Negative number of characters is invalid parameter";
    }
    var lastChar = str.charCodeAt(numChars - 1);

    if ((lastChar & SURROGATE_6_BIT) === HIGH_SURROGATE_BITS) {
        numChars = numChars - 1;
    }
    return str.substr(0, numChars);
}
function safeTruncateStringFromStart(str, numChars) {
    if (numChars < 0) {
        throw "Error: Negative number of characters is invalid parameter";
    }
    var firstChar = str.charCodeAt(str.length - numChars);

    if ((firstChar & SURROGATE_6_BIT) === HIGH_SURROGATE_BITS) {
        numChars = numChars - 1;
    }
    return str.substr(str.length - numChars, str.length - 1);
}
function getHostUrl(httpRoot) {
    var hostUrl = httpRoot;

    if (hostUrl.lastIndexOf('/') > hostUrl.indexOf('//') + 1) {
        hostUrl = hostUrl.substring(0, hostUrl.indexOf('/', hostUrl.indexOf('//') + 2));
    }
    return hostUrl;
}
function isDefinedAndNotNullOrEmpty(obj) {
    return typeof obj !== 'undefined' && obj !== null && obj !== '';
}
function EnsureFileLeafRefName(listItem) {
    if (typeof listItem["FileLeafRef.Name"] == 'undefined') {
        var fileLeafRef = listItem["FileLeafRef"];
        var suffixIndex = fileLeafRef.lastIndexOf('.');

        if (suffixIndex >= 0)
            listItem["FileLeafRef.Name"] = fileLeafRef.substring(0, suffixIndex);
        else
            listItem["FileLeafRef.Name"] = fileLeafRef;
    }
}
function EnsureFileLeafRefSuffix(listItem) {
    if (typeof listItem["FileLeafRef.Suffix"] == 'undefined') {
        var fileLeafRef = listItem["FileLeafRef"];
        var suffixIndex = fileLeafRef.lastIndexOf('.');

        if (suffixIndex >= 0)
            listItem["FileLeafRef.Suffix"] = fileLeafRef.substring(suffixIndex + 1);
        else
            listItem["FileLeafRef.Suffix"] = '';
    }
}
var getDocumentIconAbsoluteUrl;
var displayGenericDocumentIcon;
var Callout_OnOpeningCallback;
var GenerateCtx;

function EncodeUrl(str) {
    if (typeof str != 'undefined' && str != null)
        return str.replace(/"/g, '%22');
    else
        return "";
}
function RenderUrl(listItem, fldName, listSchema, field, onfocusParam) {
    var ret = [];
    var url = listItem[fldName];
    var dest = listItem[fldName + ".desc"];

    if (field.Format == 'Image') {
        if (isDefinedAndNotNullOrEmpty(url)) {
            ret.push("<img ");
            if (onfocusParam)
                ret.push("onfocus=\"OnLink(this)\" ");
            ret.push("src=\"");
            ret.push(EncodeUrl(url));
            ret.push("\" alt=\"");
            ret.push(dest);
            ret.push("\"/>");
        }
    }
    else if (field.Format == 'Hyperlink') {
        if (!isDefinedAndNotNullOrEmpty(url)) {
            if (dest != null)
                ret.push(dest);
        }
        else {
            ret.push("<a ");
            if (onfocusParam)
                ret.push("onfocus=\"OnLink(this)\" ");
            ret.push("href=\"");
            ret.push(EncodeUrl(url));
            if (Boolean((ajaxNavigate.get_search()).match(RegExp("[?&]IsDlg=1")))) {
                ret.push("\" target=\"_blank");
            }
            ret.push("\">");
            if (dest == '')
                ret.push(STSHtmlEncode(url));
            else
                ret.push(STSHtmlEncode(dest));
            ret.push("</a>");
        }
    }
    return ret.join('');
}
function ResolveId(listItem, listSchema) {
    if (listItem.EventType == '4')
        return listItem.ID + ".1." + listItem.MasterSeriesItemID;
    else
        return listItem.ID;
}
function EditRequiresCheckout(listItem, listSchema) {
    if (listSchema.ForceCheckout == '1' && listItem.FSObjType != '1' && !(typeof listItem["CheckoutUser"] == 'undefined' || listItem["CheckoutUser"] == ''))
        return '1';
    else
        return '';
}
function AppendAdditionalQueryStringToFolderUrl(listItem, ret) {
    var additionalQueryString = listItem["AdditionalQueryString"];

    if (typeof additionalQueryString == 'undefined' || additionalQueryString == '')
        return;
    ret.push(additionalQueryString);
}
function FolderUrl(listItem, listSchema, ret) {
    ret.push(listSchema.PagePath);
    ret.push("?RootFolder=");
    ret.push(escapeProperly(listItem.FileRef));
    ret.push(listSchema.ShowWebPart);
    ret.push("&FolderCTID=");
    ret.push(listItem.ContentTypeId);
    ret.push("&View=");
    ret.push(escapeProperly(listSchema.View));
    AppendAdditionalQueryStringToFolderUrl(listItem, ret);
}
function RenderListFolderLink(ret, content, listItem, listSchema) {
    ret.push("<a onfocus=\"OnLink(this)\" href=\"");
    FolderUrl(listItem, listSchema, ret);
    ret.push("\" onclick=\"");
    ret.push("javascript:EnterFolder('");
    ret.push(listSchema.PagePath);
    ret.push("?RootFolder=");
    ret.push(escapeProperly(listItem.FileRef));
    ret.push(listSchema.ShowWebPart);
    ret.push("&FolderCTID=");
    ret.push(listItem.ContentTypeId);
    ret.push("&View=");
    ret.push(escapeProperly(listSchema.View));
    AppendAdditionalQueryStringToFolderUrl(listItem, ret);
    ret.push("');return false;\">");
    ret.push(content);
    ret.push("</a>");
}
function RenderDocFolderLink(ret, content, listItem, listSchema) {
    ret.push("<a onfocus=\"OnLink(this)\" class=\"ms-listlink\" href=\"");
    FolderUrl(listItem, listSchema, ret);
    ret.push("\" onmousedown=\"");
    ret.push("javascript:VerifyFolderHref(this,event,'");
    ret.push(listItem["File_x0020_Type.url"]);
    ret.push("','");
    ret.push(listItem["File_x0020_Type.progid"]);
    ret.push("','");
    ret.push(listSchema.DefaultItemOpen);
    ret.push("','");
    ret.push(listItem["HTML_x0020_File_x0020_Type.File_x0020_Type.mapcon"]);
    ret.push("','");
    ret.push(listItem["HTML_x0020_File_x0020_Type"]);
    ret.push("','");
    ret.push(listItem["serverurl.progid"]);
    ret.push("');return false;\" onclick=\"");
    ret.push("return HandleFolder(this,event,'");
    ret.push(listSchema.PagePath);
    ret.push("?RootFolder=");
    ret.push(escapeProperly(listItem.FileRef));
    ret.push(listSchema.ShowWebPart);
    ret.push("&FolderCTID=");
    ret.push(listItem.ContentTypeId);
    ret.push("&View=");
    ret.push(escapeProperly(listSchema.View));
    AppendAdditionalQueryStringToFolderUrl(listItem, ret);
    ret.push("','TRUE','FALSE','");
    ret.push(listItem["File_x0020_Type.url"]);
    ret.push("','");
    ret.push(listItem["File_x0020_Type.progid"]);
    ret.push("','");
    ret.push(listSchema.DefaultItemOpen);
    ret.push("','");
    ret.push(listItem["HTML_x0020_File_x0020_Type.File_x0020_Type.mapcon"]);
    ret.push("','");
    ret.push(listItem["HTML_x0020_File_x0020_Type"]);
    ret.push("','");
    ret.push(listItem["serverurl.progid"]);
    ret.push("','");
    ret.push(Boolean(listItem["CheckoutUser"]) ? listItem["CheckoutUser"][0].id : '');
    ret.push("','");
    ret.push(listSchema.Userid);
    ret.push("','");
    ret.push(listSchema.ForceCheckout);
    ret.push("','");
    ret.push(listItem.IsCheckedoutToLocal);
    ret.push("','");
    ret.push(listItem.PermMask);
    ret.push("');\">");
    ret.push(content);
    ret.push("</a>");
}
function FieldRenderer_InitializePrototype() {
    FieldRenderer.prototype = {
        RenderField: FieldRendererRenderField
    };
}
function FieldRenderer(fieldName) {
    this.fldName = fieldName;
}
function FieldRendererRenderField(renderCtx, field, listItem, listSchema) {
    return STSHtmlEncode(listItem[this.fldName]);
}
function RawFieldRenderer_InitializePrototype() {
    RawFieldRenderer.prototype = {
        RenderField: RawFieldRendererRenderField
    };
}
function RawFieldRenderer(fieldName) {
    this.fldName = fieldName;
}
function RawFieldRendererRenderField(renderCtx, field, listItem, listSchema) {
    return listItem[this.fldName];
}
function AttachmentFieldRenderer_InitializePrototype() {
    AttachmentFieldRenderer.prototype = {
        RenderField: AttachmentFieldRendererRenderField
    };
}
function AttachmentFieldRenderer(fieldName) {
    this.fldName = fieldName;
}
function AttachmentFieldRendererRenderField(renderCtx, field, listItem, listSchema) {
    var value = listItem[this.fldName];

    if (value != '0')
        return "<img border=\"0\" width=\"16\" height=\"16\" src=\"" + GetThemedImageUrl("attach16.png") + "\"/>";
    else
        return "";
}
function RecurrenceFieldRenderer_InitializePrototype() {
    RecurrenceFieldRenderer.prototype = {
        RenderField: RecurrenceFieldRendererRenderField
    };
}
function RecurrenceFieldRenderer(fieldName) {
    this.fldName = fieldName;
}
function RecurrenceFieldRendererRenderField(renderCtx, field, listItem, listSchema) {
    var value = listItem[this.fldName];
    var ret = '<img border="0" width="16" height="16" src="';

    ret += "/_layouts/15/images/";
    if (value == '1') {
        var eventType = listItem.EventType;

        if (eventType == '3' || eventType == '4')
            ret += 'recurEx.gif';
        else
            ret += 'recur.gif';
    }
    else
        ret += 'blank.gif';
    ret += '" alt="';
    ret += Strings.STS.L_SPMeetingWorkSpace;
    ret += '" title="';
    ret += Strings.STS.L_SPMeetingWorkSpace;
    ret += '"/>';
    return ret;
}
function ProjectLinkFieldRenderer_InitializePrototype() {
    ProjectLinkFieldRenderer.prototype = {
        RenderField: ProjectLinkFieldRendererRenderField
    };
}
function ProjectLinkFieldRenderer(fieldName) {
    this.fldName = fieldName;
}
function ProjectLinkFieldRendererRenderField(renderCtx, field, listItem, listSchema) {
    if (!(listItem.WorkspaceLink == '1' || listItem.WorkspaceLink == '-1')) {
        return '<img border="0" width="16" height="16" src="' + '/_layouts/15/images/blank.gif' + '" />';
    }
    else {
        var ret = '<a href="';

        ret += listItem.Workspace;
        ret += '" target="_self" title="';
        ret += Strings.STS.L_SPMeetingWorkSpace;
        ret += '"><img border="" src="' + GetThemedImageUrl("mtgicon.gif") + '" alt="';
        ret += Strings.STS.L_SPMeetingWorkSpace;
        ret += '"/></a>';
        return ret;
    }
}
function AllDayEventFieldRenderer_InitializePrototype() {
    AllDayEventFieldRenderer.prototype = {
        RenderField: AllDayEventFieldRendererRenderField
    };
}
function AllDayEventFieldRenderer(fieldName) {
    this.fldName = fieldName;
}
function AllDayEventFieldRendererRenderField(renderCtx, field, listItem, listSchema) {
    if (listItem[this.fldName] == Strings.STS.L_SPYes)
        return Strings.STS.L_SPYes;
    else
        return '';
}
function NumberFieldRenderer_InitializePrototype() {
    NumberFieldRenderer.prototype = {
        RenderField: NumberFieldRendererRenderField
    };
}
function NumberFieldRenderer(fieldName) {
    this.fldName = fieldName;
}
function NumberFieldRendererRenderField(renderCtx, field, listItem, listSchema) {
    return '<div align="right" class="ms-number">' + listItem[this.fldName] + '</div>';
}
function BusinessDataFieldRenderer_InitializePrototype() {
    BusinessDataFieldRenderer.prototype = {
        RenderField: BusinessDataFieldRendererRenderField
    };
}
function BusinessDataFieldRenderer(fieldName) {
    this.fldName = fieldName;
}
function BusinessDataFieldRendererRenderField(renderCtx, field, listItem, listSchema) {
    var fieldDefinition = renderCtx['CurrentFieldSchema'];
    var fieldValue = listItem[this.fldName];

    if (fieldValue == '') {
        fieldValue = Strings.STS.L_BusinessDataField_Blank;
    }
    var ret = '<table cellpadding="0" cellspacing="0" style="display=inline">';

    ret += '<tr>';
    if (Boolean(fieldDefinition.HasActions)) {
        ret += '<td><input type="hidden" name="BusinessDataField_ActionsMenuProxyPageWebUrl" id="BusinessDataField_ActionsMenuProxyPageWebUrl" value="' + renderCtx.HttpRoot + '" />';
        ret += '<div style="display=inline">';
        ret += '<table cellspacing="0">';
        ret += '<tr>';
        ret += '<td class="ms-vb" valign="top" nowrap="nowrap">';
        ret += '<span class="ms-SPLink ms-hovercellinactive" onmouseover="this.className=\'ms-SPLink ms-HoverCellActive\';" onmouseout="this.className=\'ms-SPLink ms-HoverCellInactive\';">';
        var onclickMethod = '';
        var onKeyDownMethod = '';
        var methodParameters = '';

        if (Boolean(renderCtx.ExternalDataList)) {
            methodParameters = '\'' + Strings.STS.L_BusinessDataField_ActionMenuLoadingMessage + '\',null,true,\'' + renderCtx.LobSystemInstanceName + '\',\'' + renderCtx.EntityNamespace + '\',\'' + renderCtx.EntityName + '\',\'' + renderCtx.SpecificFinderName + '\',\'' + fieldDefinition.AssociationName + '\',\'' + fieldDefinition.SystemInstanceName + '\',\'' + fieldDefinition.EntityNamespace + '\',\'' + fieldDefinition.EntityName + '\',\'' + listItem.ID + '\', event';
            onclickMethod = 'showActionMenuInExternalList(' + methodParameters + ')';
            onKeyDownMethod = 'actionMenuOnKeyDownInExternalList(' + methodParameters + ')';
        }
        else {
            methodParameters = '\'' + Strings.STS.L_BusinessDataField_ActionMenuLoadingMessage + '\',null,true,\'' + fieldDefinition.SystemInstanceName + '\',\'' + fieldDefinition.EntityNamespace + '\',\'' + fieldDefinition.EntityName + '\',\'' + listItem.ID + '\', event';
            onclickMethod = 'showActionMenu(' + methodParameters + ')';
            onKeyDownMethod = 'actionMenuOnKeyDown(' + methodParameters + ')';
        }
        ret += '<a style="cursor:hand;white-space:nowrap;">';
        ret += '<img border="0" align="absmiddle" src=' + "/_layouts/15/images/bizdataactionicon.gif" + ' tabindex="0" alt="' + Strings.STS.L_BusinessDataField_ActionMenuAltText + '" title="' + Strings.STS.L_BusinessDataField_ActionMenuAltText + '"';
        ret += ' onclick="' + onclickMethod + '"';
        ret += ' onkeydown="' + onKeyDownMethod + '" />';
        ret += '</a>';
        ret += '<a>';
        ret += '<img align="absmiddle" src=' + "/_layouts/15/images/menudark.gif" + ' tabindex="0" alt="' + Strings.STS.L_BusinessDataField_ActionMenuAltText + '"';
        ret += ' onclick="' + onclickMethod + '"';
        ret += ' onkeydown="' + onKeyDownMethod + '" />';
        ret += '</a>';
        ret += '</span>';
        ret += '</td>';
        ret += '</tr>';
        ret += '</table>';
        ret += '</div>';
        ret += '<div STYLE="display=inline" />';
        ret += '</td>';
    }
    ret += '<td class="ms-vb">';
    if (fieldDefinition.Profile != '' && fieldDefinition.ContainsDefaultAction == 'True') {
        ret += '<a href="' + renderCtx.HttpRoot + fieldDefinition.Profile + listItem.ID + '" >' + fieldValue + '</a>';
    }
    else {
        ret += fieldValue;
    }
    ret += '</td>';
    ret += '</tr>';
    ret += '</table>';
    return ret;
}
function DateTimeFieldRenderer_InitializePrototype() {
    DateTimeFieldRenderer.prototype = {
        RenderField: DateTimeFieldRendererRenderField
    };
}
function DateTimeFieldRenderer(fieldName) {
    this.fldName = fieldName;
}
function DateTimeFieldRendererRenderField(renderCtx, field, listItem, listSchema) {
    var absoluteDateTimeString = listItem[this.fldName];

    if (absoluteDateTimeString == null) {
        return "";
    }
    var friendlyDisplayText = listItem[this.fldName + ".FriendlyDisplay"];
    var relativeDateTimeString = null;

    if (friendlyDisplayText != null && friendlyDisplayText != "") {
        relativeDateTimeString = GetRelativeDateTimeString(friendlyDisplayText);
    }
    var ret = '<span class="ms-noWrap" title="' + absoluteDateTimeString + '">';

    ret += relativeDateTimeString != null && relativeDateTimeString != "" ? relativeDateTimeString : absoluteDateTimeString;
    ret += '</span>';
    return ret;
}
function GetRelativeDateTimeString(relativeDateTimeJSString) {
    var ret = null;
    var retTemplate = null;
    var codes = relativeDateTimeJSString.split('|');

    if (codes[0] == "0") {
        return relativeDateTimeJSString.substring(2);
    }
    var bFuture = codes[1] == "1";
    var timeBucket = codes[2];
    var timeValue = codes.length >= 4 ? codes[3] : null;
    var timeValue2 = codes.length >= 5 ? codes[4] : null;

    switch (timeBucket) {
    case "1":
        ret = bFuture ? Strings.STS.L_RelativeDateTime_AFewSecondsFuture : Strings.STS.L_RelativeDateTime_AFewSeconds;
        break;
    case "2":
        ret = bFuture ? Strings.STS.L_RelativeDateTime_AboutAMinuteFuture : Strings.STS.L_RelativeDateTime_AboutAMinute;
        break;
    case "3":
        retTemplate = GetLocalizedCountValue(bFuture ? Strings.STS.L_RelativeDateTime_XMinutesFuture : Strings.STS.L_RelativeDateTime_XMinutes, bFuture ? Strings.STS.L_RelativeDateTime_XMinutesFutureIntervals : Strings.STS.L_RelativeDateTime_XMinutesIntervals, Number(timeValue));
        break;
    case "4":
        ret = bFuture ? Strings.STS.L_RelativeDateTime_AboutAnHourFuture : Strings.STS.L_RelativeDateTime_AboutAnHour;
        break;
    case "5":
        if (timeValue == null) {
            ret = bFuture ? Strings.STS.L_RelativeDateTime_Tomorrow : Strings.STS.L_RelativeDateTime_Yesterday;
        }
        else {
            retTemplate = bFuture ? Strings.STS.L_RelativeDateTime_TomorrowAndTime : Strings.STS.L_RelativeDateTime_YesterdayAndTime;
        }
        break;
    case "6":
        retTemplate = GetLocalizedCountValue(bFuture ? Strings.STS.L_RelativeDateTime_XHoursFuture : Strings.STS.L_RelativeDateTime_XHours, bFuture ? Strings.STS.L_RelativeDateTime_XHoursFutureIntervals : Strings.STS.L_RelativeDateTime_XHoursIntervals, Number(timeValue));
        break;
    case "7":
        if (timeValue2 == null) {
            ret = timeValue;
        }
        else {
            retTemplate = Strings.STS.L_RelativeDateTime_DayAndTime;
        }
        break;
    case "8":
        retTemplate = GetLocalizedCountValue(bFuture ? Strings.STS.L_RelativeDateTime_XDaysFuture : Strings.STS.L_RelativeDateTime_XDays, bFuture ? Strings.STS.L_RelativeDateTime_XDaysFutureIntervals : Strings.STS.L_RelativeDateTime_XDaysIntervals, Number(timeValue));
        break;
    case "9":
        ret = Strings.STS.L_RelativeDateTime_Today;
        break;
    }
    if (retTemplate != null) {
        ret = retTemplate.replace("{0}", timeValue);
        if (timeValue2 != null) {
            ret = ret.replace("{1}", timeValue2);
        }
    }
    return ret;
}
function GetLocalizedCountValue(locText, intervals, count) {
    if (locText == undefined || intervals == undefined || count == undefined) {
        return null;
    }
    var ret = '';
    var locIndex = -1;
    var intervalsArray = [];

    Array.addRange(intervalsArray, intervals.split('||'));
    for (var i = 0, lenght = intervalsArray.length; i < lenght; i++) {
        var interval = intervalsArray[i];

        if (interval == null || interval == "") {
            Sys.Debug.assert(false, 'Invalid interval definition: ' + String(interval));
            continue;
        }
        if (isNaN(Number.parseInvariant(interval))) {
            var range = interval.split('-');

            if (range == null || range.length !== 2) {
                Sys.Debug.assert(false, 'Invalid range definition: ' + String(range));
                continue;
            }
            var min;
            var max;

            if (range[0] === '') {
                min = 0;
            }
            else {
                if (isNaN(Number.parseInvariant(range[0]))) {
                    Sys.Debug.assert(false, 'Invalid min value for the range: ' + String(range[0]));
                    continue;
                }
                else {
                    min = parseInt(range[0]);
                }
            }
            if (count >= min) {
                if (range[1] === '') {
                    locIndex = i;
                    break;
                }
                else {
                    if (isNaN(Number.parseInvariant(range[1]))) {
                        Sys.Debug.assert(false, 'Invalid max value for the range: ' + String(range[1]));
                        continue;
                    }
                    else {
                        max = parseInt(range[1]);
                    }
                }
                if (count <= max) {
                    locIndex = i;
                    break;
                }
            }
        }
        else {
            var exactNumber = parseInt(interval);

            if (count === exactNumber) {
                locIndex = i;
                break;
            }
        }
    }
    if (locIndex !== -1) {
        var locValues = locText.split('||');

        if (locValues != null && locValues[locIndex] != null && locValues[locIndex] != "") {
            ret = locValues[locIndex];
        }
    }
    return ret;
}
function GetDaysAfterToday(targetDate) {
    var now = Date.parseLocale(_spRegionalSettings.currentDateInLocalCalendar, null);

    if (now == null) {
        return 0;
    }
    var currentDateWithoutTime = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    var date1 = targetDate.getTime();
    var date2 = currentDateWithoutTime.getTime();
    var difference = date1 - date2;

    return Math.floor(difference / 86400000);
}
function TextFieldRenderer_InitializePrototype() {
    TextFieldRenderer.prototype = {
        RenderField: TextFieldRendererRenderField
    };
}
function TextFieldRenderer(fieldName) {
    this.fldName = fieldName;
}
function TextFieldRendererRenderField(renderCtx, field, listItem, listSchema) {
    if (field.AutoHyperLink != null)
        return listItem[this.fldName];
    else
        return STSHtmlEncode(listItem[this.fldName]);
}
function LookupFieldRenderer_InitializePrototype() {
    LookupFieldRenderer.prototype = {
        RenderField: LookupFieldRendererRenderField
    };
}
function LookupFieldRenderer(fieldName) {
    this.fldName = fieldName;
}
function LookupFieldRendererRenderField(renderCtx, field, listItem, listSchema) {
    function GetFieldValueAsText(value) {
        if (!Boolean(value))
            return '';
        ret = [];
        for (i = 0; i < value.length; i++) {
            if (i > 0)
                ret.push("; ");
            ret.push(STSHtmlEncode(value[i].lookupValue));
        }
        return ret.join('');
    }
    var fieldValue = listItem[this.fldName];

    if (!Boolean(fieldValue))
        return '';
    if (typeof fieldValue == "string")
        return STSHtmlEncode(fieldValue);
    if (field.RenderAsText != null)
        return GetFieldValueAsText(fieldValue);
    if (!Boolean(field.DispFormUrl))
        return '';
    var ret = [];

    for (var i = 0; i < fieldValue.length; i++) {
        if (i > 0)
            ret.push("; ");
        var sbUrl = [];

        sbUrl.push(field.DispFormUrl);
        sbUrl.push("&ID=");
        sbUrl.push(fieldValue[i].lookupId.toString());
        sbUrl.push("&RootFolder=*");
        var url = sbUrl.join('');

        ret.push("<a ");
        ret.push("onclick=\"OpenPopUpPage('");
        ret.push(url);
        ret.push("', RefreshPage); return false;\" ");
        ret.push("href=\"");
        ret.push(url);
        ret.push("\">");
        ret.push(STSHtmlEncode(fieldValue[i].lookupValue));
        ret.push("</a>");
    }
    return ret.join('');
}
function NoteFieldRenderer_InitializePrototype() {
    NoteFieldRenderer.prototype = {
        RenderField: NoteFieldRendererRenderField
    };
}
function NoteFieldRenderer(fieldName) {
    this.fldName = fieldName;
}
function NoteFieldRendererRenderField(renderCtx, field, listItem, listSchema) {
    var ret = [];

    ret.push("<div dir=\"");
    ret.push(field.Direction);
    ret.push("\" class=\"ms-rtestate-field\">");
    ret.push(listItem[this.fldName]);
    ret.push("</div>");
    return ret.join('');
}
function UrlFieldRenderer_InitializePrototype() {
    UrlFieldRenderer.prototype = {
        fldName: null,
        RenderField: UrlFieldRendererRenderField
    };
}
function UrlFieldRenderer(fieldName) {
    this.fldName = fieldName;
}
function UrlFieldRendererRenderField(renderCtx, field, listItem, listSchema) {
    return RenderUrl(listItem, this.fldName, listSchema, field, false);
}
function UserFieldRenderer_InitializePrototype() {
    UserFieldRenderer.prototype = {
        fldName: null,
        RenderField: UserFieldRendererRenderField
    };
}
function UserFieldRenderer(fieldName) {
    this.fldName = fieldName;
}
var s_ImnId;

function UserFieldRendererRenderField(renderCtx, field, listItem, listSchema) {
    var userField = listItem[this.fldName];

    if (typeof userField == "string" && (userField == '' || userField == "***")) {
        return userField;
    }
    var ret = [];
    var defaultMultiUserRender = field.DefaultRender && field.AllowMultipleValues;
    var inlineMultiUserRender = defaultMultiUserRender && field.InlineRender;

    if (inlineMultiUserRender) {
        var renderedUsersHtml = [];

        for (var userIndex = 0; userIndex < userField.length; userIndex++) {
            renderedUsersHtml.push(RenderUserFieldWorker(renderCtx, field, userField[userIndex], listSchema));
        }
        if (renderedUsersHtml.length === 1)
            ret.push(renderedUsersHtml[0]);
        else if (renderedUsersHtml.length === 2)
            ret.push(StBuildParam(STSHtmlEncode(Strings.STS.L_UserFieldInlineTwo), renderedUsersHtml[0], renderedUsersHtml[1]));
        else if (renderedUsersHtml.length === 3)
            ret.push(StBuildParam(STSHtmlEncode(Strings.STS.L_UserFieldInlineThree), renderedUsersHtml[0], renderedUsersHtml[1], renderedUsersHtml[2]));
        else {
            var moreLinkOpenTagHtml = '';
            var moreLinkCloseTagHtml = '';

            if (Boolean(field.InlineRenderMoreAsLink)) {
                moreLinkOpenTagHtml = '<a href="#" onclick="return false;" class="ms-imnMoreLink ms-link">';
                moreLinkCloseTagHtml = '</a>';
            }
            var numMore = renderedUsersHtml.length - 3;

            Sys.Debug.assert(numMore > 0, 'Error rendering user list');
            ret.push(StBuildParam(STSHtmlEncode(Strings.STS.L_UserFieldInlineMore), renderedUsersHtml[0], renderedUsersHtml[1], renderedUsersHtml[2], moreLinkOpenTagHtml, String(numMore), moreLinkCloseTagHtml));
        }
    }
    else {
        if (defaultMultiUserRender)
            ret.push("<table style='padding:0px; border-spacing:0px; border:none'><tr><td class='ms-vb'>");
        var bFirst = true;

        for (var idx in userField) {
            if (bFirst)
                bFirst = false;
            else if (field.AllowMultipleValues) {
                if (defaultMultiUserRender)
                    ret.push("</td></tr><tr><td class='ms-vb'>");
                else if (!field.WithPicture && !field.WithPictureDetail && !field.PictureOnly)
                    ret.push("; ");
            }
            var userItem = userField[idx];

            ret.push(RenderUserFieldWorker(renderCtx, field, userItem, listSchema));
        }
        if (defaultMultiUserRender)
            ret.push("</td></tr></table>");
    }
    return ret.join('');
}
function RenderUserFieldWorker(renderCtx, field, listItem, listSchema) {
    var g_EmptyImnPawnHtml = "<span class='ms-spimn-presenceLink'><span class='{0}'><img class='{1}' name='imnempty' src='" + "/_layouts/15/images/spimn.png" + "' alt='' /></span></span>";
    var g_ImnPawnHtml = "{0}<a href='#' onclick='IMNImageOnClick(event);return false;' class='{1}' {2}>{3}<img name='imnmark' title='' ShowOfflinePawn='1' class='{4}' src='" + "/_layouts/15/images/spimn.png" + "' alt='";
    var ret = [];

    function GetImnPawnHtml(userSip, userEmail, alt, pictureSize, fNoImg) {
        var imnImgClass = "ms-spimn-img";
        var imnSpanClass = "ms-spimn-presenceWrapper";
        var imnLinkClass = "ms-imnlink";
        var additionalMarkup = "";
        var wrapperSpanMarkup = "";
        var imnSpanMarkup = "";

        if (fNoImg) {
            imnSpanClass = (imnImgClass = " ms-hide");
            additionalMarkup = "tabIndex='-1'";
        }
        else {
            var height = SPClientTemplates.PresenceIndicatorSize.Square_10px;
            var width = SPClientTemplates.PresenceIndicatorSize.Square_10px;

            if (pictureSize != null && typeof pictureSize != 'undefined' && pictureSize != "None") {
                height = String(parseInt(pictureSize.substring(5)));
                if (pictureSize == "Size_72px") {
                    width = SPClientTemplates.PresenceIndicatorSize.Bar_8px;
                }
                else {
                    width = SPClientTemplates.PresenceIndicatorSize.Bar_5px;
                }
            }
            else {
                imnSpanClass += " ms-imnImg";
            }
            if (field.InlineRender) {
                imnSpanClass += " ms-imnImgInline";
            }
            var sizeClass = String.format(" ms-spimn-imgSize-{0}x{1}", width, height);

            imnImgClass += String.format(" ms-spimn-presence-disconnected-{0}x{1}x32", width, height);
            imnSpanClass += sizeClass;
            imnLinkClass += " ms-spimn-presenceLink";
            wrapperSpanMarkup = String.format("<span class='{0}'>", imnSpanClass);
            imnSpanMarkup = "<span class='ms-imnSpan'>";
        }
        if (userSip == null || userSip == '') {
            if (userEmail == null || userEmail == '') {
                ret.push(String.format(g_EmptyImnPawnHtml, imnSpanClass, imnImgClass));
            }
            else {
                ret.push(String.format(g_ImnPawnHtml, imnSpanMarkup, imnLinkClass, additionalMarkup, wrapperSpanMarkup, imnImgClass));
                ret.push(STSHtmlEncode(alt));
                ret.push("' sip='");
                ret.push(STSHtmlEncode(userEmail));
                ret.push("' id='imn_");
                ret.push(s_ImnId);
                ret.push(",type=smtp' />" + (wrapperSpanMarkup.length > 0 ? "</span>" : "") + "</a>" + (imnSpanMarkup.length > 0 ? "</span>" : ""));
            }
        }
        else {
            ret.push(String.format(g_ImnPawnHtml, imnSpanMarkup, imnLinkClass, additionalMarkup, wrapperSpanMarkup, imnImgClass));
            ret.push(STSHtmlEncode(alt));
            ret.push("' sip='");
            ret.push(STSHtmlEncode(userSip));
            ret.push("' id='imn_");
            ret.push(s_ImnId);
            ret.push(",type=sip' />" + (wrapperSpanMarkup.length > 0 ? "</span>" : "") + "</a>" + (imnSpanMarkup.length > 0 ? "</span>" : ""));
        }
        s_ImnId++;
    }
    function GetPresence(userSip, userEmail) {
        if (listSchema.EffectivePresenceEnabled && (field.DefaultRender || field.WithPicture || field.WithPictureDetail || field.PictureOnly || field.PresenceOnly)) {
            GetImnPawnHtml(userSip, userEmail, listSchema.PresenceAlt, field.PictureSize, false);
        }
    }
    function GetPresenceNoImg(userSip, userEmail) {
        if (listSchema.EffectivePresenceEnabled) {
            GetImnPawnHtml(userSip, userEmail, listSchema.PresenceAlt, null, true);
        }
    }
    function UserLinkWithSize(pictureSize) {
        var userDispParam = listSchema.UserDispParam;

        if (field.HasUserLink && (Boolean(userDispParam) || lookupId != null && lookupId != '' && parseInt(lookupId) > -1)) {
            var userDispUrlString = '';

            if (Boolean(listSchema.UserDispUrl)) {
                var userDispUrl = new URI(listSchema.UserDispUrl);

                if (Boolean(userDispParam)) {
                    userDispUrl.setQueryParameter(userDispParam, listItem[userDispParam]);
                }
                else {
                    userDispUrl.setQueryParameter("ID", String(lookupId));
                }
                userDispUrlString = userDispUrl.getString();
            }
            var linkClass = field.InlineRender ? "ms-link" : "ms-listlink";

            linkClass += pictureSize != null && pictureSize.length > 0 ? " ms-peopleux-imgUserLink" : "";
            ret.push("<a class=\"ms-subtleLink " + linkClass + "\" onclick=\"GoToLinkOrDialogNewWindow(this);return false;\" href=");
            ret.push(StAttrQuote(userDispUrlString));
            ret.push(">");
        }
    }
    function UserLink() {
        UserLinkWithSize(null);
    }
    function RenderUserTitle(title) {
        ret.push("<span class=\"ms-noWrap ms-imnSpan\">");
        GetPresenceNoImg(sip, email);
        UserLink();
        ret.push(STSHtmlEncode(title));
        if (field.HasUserLink)
            ret.push("</a>");
        ret.push("</span>");
    }
    var lookupId = listItem.id;
    var lookupValue = listItem.title;

    if (lookupValue == null || lookupValue == '') {
        ret.push("<span class=\"ms-floatLeft ms-peopleux-vanillaUser\" />");
        return ret.join('');
    }
    var sip = listItem.sip;
    var email = listItem.email;

    function RenderVanillaUser() {
        if (!listSchema.UserVanilla) {
            ret.push("<span class=\"ms-verticalAlignTop ms-noWrap ms-displayInlineBlock\">");
            GetPresence(sip, email);
            RenderUserTitle(lookupValue);
            ret.push("</span>");
        }
        else {
            RenderUserTitle(lookupValue);
        }
    }
    var ProfilePicture_Suffix_Small = "_SThumb";
    var ProfilePicture_Suffix_Medium = "_MThumb";
    var ProfilePicture_Suffix_Large = "_LThumb";
    var SmallThumbnailThreshold = 48;

    function GetPictureThumbnailUrl(pictureUrl, suffixToReplace) {
        var fileNameWithoutExt = pictureUrl.substr(0, pictureUrl.lastIndexOf("."));

        if (fileNameWithoutExt.endsWith(ProfilePicture_Suffix_Medium)) {
            if (suffixToReplace == ProfilePicture_Suffix_Medium)
                return pictureUrl;
            return pictureUrl.replace(ProfilePicture_Suffix_Medium, suffixToReplace);
        }
        return pictureUrl;
    }
    function AppendUserPhotoUrl(arrayToAppend, sizeToRequest) {
        arrayToAppend.push("/_layouts/15/userphoto.aspx");
        arrayToAppend.push('?accountname=');
        arrayToAppend.push(encodeURIComponent(Boolean(listItem.accountname) ? listItem.accountname : listItem.email));
        arrayToAppend.push('&size=');
        arrayToAppend.push(encodeURIComponent(sizeToRequest));
    }
    function RenderPicture(fieldToRender) {
        var picture = listItem.picture;
        var pictureSize = fieldToRender.PictureSize != null ? STSHtmlEncode(fieldToRender.PictureSize.substring(5)) : null;

        ret.push("<span class=\"ms-imnSpan\">");
        GetPresenceNoImg(sip, email);
        if (field.HasUserLink)
            UserLinkWithSize(pictureSize);
        else
            ret.push("<span class=\"ms-peopleux-imgUserLink\">");
        if (pictureSize != null) {
            ret.push("<span class=\"ms-peopleux-userImgWrapper\" style=\"width:" + pictureSize + "; height:" + pictureSize + "\">");
            ret.push("<img class=\"ms-peopleux-userImg\" style=\"min-width:" + pictureSize + "; min-height:" + pictureSize + "; ");
            ret.push("clip:rect(0px, " + pictureSize + ", " + pictureSize + ", 0px); max-width:" + pictureSize + "\" src=\"");
        }
        else {
            pictureSize = "62px";
            ret.push("<img style=\"width:62px; height:62px; border:none\" src=\"");
        }
        var sizeToRequest = pxToNum(pictureSize) < SmallThumbnailThreshold ? 'S' : 'M';

        if (picture == null || picture == '') {
            if (_spPageContextInfo.crossDomainPhotosEnabled) {
                AppendUserPhotoUrl(ret, sizeToRequest);
            }
            else {
                ret.push("/_layouts/15/images/person.gif");
            }
            ret.push("\" alt=\"");
            ret.push(STSHtmlEncode(listSchema.picturealt1));
            ret.push(" ");
            ret.push(STSHtmlEncode(lookupValue));
            ret.push("\" />");
        }
        else {
            if (parseInt(pictureSize) <= SmallThumbnailThreshold) {
                picture = GetPictureThumbnailUrl(picture, ProfilePicture_Suffix_Small);
            }
            if (!_spPageContextInfo.crossDomainPhotosEnabled || picture.startsWith('/') || (picture.toLowerCase()).startsWith((getHostUrl(window.location.href)).toLowerCase())) {
                ret.push(picture);
            }
            else {
                AppendUserPhotoUrl(ret, sizeToRequest);
            }
            ret.push("\" alt=\"");
            ret.push(STSHtmlEncode(listSchema.picturealt2));
            ret.push(" ");
            ret.push(STSHtmlEncode(lookupValue));
            ret.push("\" />");
        }
        if (pictureSize != null)
            ret.push("</span>");
        if (field.HasUserLink)
            ret.push("</a>");
        else
            ret.push("</span>");
        ret.push("</span>");
    }
    var picSize = "0px";

    if (field.PictureSize != null && typeof field.PictureSize != 'undefined')
        picSize = STSHtmlEncode(field.PictureSize.substring(5));
    if (field.WithPictureDetail) {
        var jobTitle = listItem.jobTitle;
        var department = listItem.department;

        if (picSize == null || typeof picSize == 'undefined') {
            picSize = "36px";
        }
        var detailsMaxWidth = 150;

        if (field.MaxWidth != null && typeof field.MaxWidth != 'undefined') {
            detailsMaxWidth = field.MaxWidth - 10 - parseInt(picSize) - 11;
            if (detailsMaxWidth < 0) {
                detailsMaxWidth = 0;
            }
        }
        ret.push("<div class=\"ms-table ms-core-tableNoSpace\">");
        ret.push("<div class=\"ms-tableRow\">");
        ret.push("<div class=\"ms-tableCell\">");
        GetPresence(sip, email);
        ret.push("</span></div><div class=\"ms-tableCell ms-verticalAlignTop\"><div class=\"ms-peopleux-userImgDiv\">");
        RenderPicture(field);
        ret.push("</div></div><div class=\"ms-tableCell ms-peopleux-userdetails ms-noList\"><ul style=\"max-width:" + String(detailsMaxWidth) + "px\"><li>");
        ret.push("<div class=\"ms-noWrap\">");
        RenderUserTitle(lookupValue);
        ret.push("</div>");
        ret.push("</li>");
        var customDetail = listItem.CustomDetail;
        var renderCallback = field.RenderCallback;

        if (renderCallback != null || typeof renderCallback != 'undefined') {
            var result = eval(renderCallback + "(renderCtx);");

            ret.push("<li>");
            ret.push(result);
            ret.push("</li>");
        }
        else if (customDetail != null || typeof customDetail != 'undefined') {
            ret.push("<li><div class=\"ms-metadata ms-textSmall ms-peopleux-detailuserline ms-noWrap\" title=\"" + STSHtmlEncode(customDetail) + "\">");
            ret.push(STSHtmlEncode(customDetail));
            ret.push("</div></li>");
        }
        else if (jobTitle != null && jobTitle != '') {
            var detailLine = jobTitle;

            if (department != null && department != '')
                detailLine += ", " + department;
            ret.push("<li><div class=\"ms-metadata ms-textSmall ms-peopleux-detailuserline ms-noWrap\" title=\"" + STSHtmlEncode(detailLine) + "\">");
            ret.push(STSHtmlEncode(detailLine));
            ret.push("</div></li>");
        }
        ret.push("</ul></div></div></div>");
    }
    else if (field.PictureOnly) {
        ret.push("<div class=\"ms-table ms-core-tableNoSpace\"><div class=\"ms-tableRow\"><div class=\"ms-tableCell\">");
        GetPresence(sip, email);
        ret.push("</span></div><div class=\"ms-tableCell ms-verticalAlignTop\"><div class=\"ms-peopleux-userImgDiv\">");
        RenderPicture(field);
        ret.push("</div></div></div></div>");
    }
    else if (field.WithPicture) {
        ret.push("<div><div>");
        RenderPicture(field);
        ret.push("</div><div class=\"ms-floatLeft ms-descriptiontext\">");
        RenderVanillaUser();
        ret.push("</div></div>");
    }
    else if (field.NameWithContactCard) {
        RenderUserTitle(lookupValue);
    }
    else if (field.PresenceOnly) {
        GetPresence(sip, email);
    }
    else
        RenderVanillaUser();
    return ret.join('');
}
function RenderAndRegisterHierarchyItem(renderCtx, field, listItem, listSchema, content) {
    if (renderCtx.inGridMode) {
        return content;
    }
    var indentSize = renderCtx.ListData.HierarchyHasIndention ? 22 : 0;
    var imgOffsetSize = renderCtx.ListData.HierarchyHasIndention ? 13 : 0;
    var ret = [];
    var trId = renderCtx.ctxId + ',' + listItem.ID + ',' + listItem.FSObjType;
    var imgId = 'idExpandCollapse' + trId;

    ret.push('<span style="');
    if (listItem.isParent) {
        ret.push('font-weight: bold;');
    }
    ret.push('float: ');
    ret.push(fRightToLeft ? 'right' : 'left');
    ret.push('; margin-');
    ret.push(fRightToLeft ? 'right' : 'left');
    ret.push(':');
    var outlineLevel = parseInt(listItem.outlineLevel);

    if (outlineLevel <= 1) {
        indentLevel = listItem.isParent ? 0 : imgOffsetSize;
    }
    else {
        var indentLevel = (outlineLevel - 1) * indentSize;

        if (!listItem.isParent) {
            indentLevel += imgOffsetSize;
        }
    }
    ret.push(indentLevel);
    ret.push('px">');
    ret.push('<table><tr>');
    if (listItem.isParent) {
        ret.push('<td style="vertical-align: top;"><img id="');
        ret.push(imgId);
        ret.push('" width="9" height="9" src="');
        ret.push(GetThemedImageUrl("commentcollapse12.png"));
        ret.push('" style="margin-top:4px; margin-');
        ret.push(fRightToLeft ? 'left' : 'right');
        ret.push(':4px; cursor: pointer;"/></td>');
    }
    ret.push('<td>');
    ret.push(content);
    ret.push('</td></tr></table></span>');
    function PostRenderRegisterHierarchyItem() {
        var hierarchyMgr = renderCtx.hierarchyMgr;

        if (hierarchyMgr == null) {
            hierarchyMgr = (renderCtx.hierarchyMgr = GetClientHierarchyManagerForWebpart(renderCtx.wpq));
        }
        if (listItem.isParent) {
            var img = document.getElementById(imgId);

            if (img != null) {
                $addHandler(img, 'click', OnExpandCollapseButtonClick);
            }
            var trElem = GetAncestorByTagNames(img, ["TR"]);

            if (trElem != null) {
                trElem.style.fontWeight = 'bold';
            }
        }
        hierarchyMgr.RegisterHierarchyNode(parseInt(listItem.ID), listItem.parentID == null ? null : parseInt(listItem.parentID), trId, imgId);
    }
    AddPostRenderCallback(renderCtx, function() {
        setTimeout(PostRenderRegisterHierarchyItem, 0);
    });
    return ret.join('');
}
function OnPostRenderTabularListView(renderCtx) {
    setTimeout(function() {
        OnPostRenderTabularListViewDelayed(renderCtx);
    }, 100);
}
function OnPostRenderTabularListViewDelayed(renderCtx) {
    if (renderCtx != null && renderCtx.clvp != null) {
        var listTable = renderCtx.clvp.tab;
    }
    if (listTable != null) {
        if (IsTouchSupported()) {
            var rows = listTable.rows;

            if (rows != null && rows.length > 0) {
                var headerRow = rows[0];
                var headerCells = headerRow.cells;

                for (var i = 0; i < headerCells.length; i++) {
                    var curCell = headerCells[i];

                    CoreInvoke("RegisterTouchOverride", curCell, ListHeaderTouchHandler);
                    var titleDiv = (curCell.getElementsByClassName("ms-vh-div"))[0];

                    if (titleDiv != null) {
                        var sortLink = (titleDiv.getElementsByClassName("ms-headerSortTitleLink"))[0];

                        if (sortLink != null) {
                            CoreInvoke("RegisterTouchOverride", sortLink, ListHeaderTouchHandler);
                        }
                    }
                }
            }
        }
    }
    else {
        setTimeout(function() {
            OnPostRenderTabularListViewDelayed(renderCtx);
        }, 100);
    }
}
function ListHeaderTouchHandler(evt) {
    var srcElem = GetEventSrcElement(evt);
    var headerCell;
    var headerDiv;

    if (srcElem == null) {
        return false;
    }
    headerCell = srcElem.tagName == "TH" ? srcElem : GetSelectedElement(srcElem, "TH");
    var divs = headerCell.getElementsByTagName("DIV");

    for (var i = 0; i < divs.length; i++) {
        if (divs[i].hasAttribute("CTXNum")) {
            headerDiv = divs[i];
            break;
        }
    }
    if (headerCell != null && headerDiv != null) {
        if (bMenuLoadInProgress) {
            return true;
        }
        var bTouchedOpenHeader = false;

        if (IsFilterMenuOn()) {
            if (IsContained(srcElem, currentFilterMenu)) {
                return false;
            }
            if (filterTable == headerDiv) {
                bTouchedOpenHeader = true;
            }
            MenuHtc_hide();
        }
        if (!bTouchedOpenHeader && OnMouseOverFilterDeferCall(headerDiv)) {
            CreateFilterMenu(evt);
        }
    }
    return true;
}
function SPMgr() {
    this.NewGroup = function(listItem, fieldName) {
        if (listItem[fieldName] == '1')
            return true;
        else
            return false;
    };
    function DefaultRenderField(renderCtx, field, listItem, listSchema) {
        if (typeof field.FieldRenderer == 'undefined') {
            var fieldRenderMap = {
                Computed: new ComputedFieldRenderer(field.Name),
                Attachments: new AttachmentFieldRenderer(field.Name),
                User: new UserFieldRenderer(field.Name),
                UserMulti: new UserFieldRenderer(field.Name),
                URL: new UrlFieldRenderer(field.Name),
                Note: new NoteFieldRenderer(field.Name),
                Recurrence: new RecurrenceFieldRenderer(field.Name),
                CrossProjectLink: new ProjectLinkFieldRenderer(field.Name),
                AllDayEvent: new AllDayEventFieldRenderer(field.Name),
                Number: new NumberFieldRenderer(field.Name),
                BusinessData: new BusinessDataFieldRenderer(field.Name),
                Currency: new NumberFieldRenderer(field.Name),
                DateTime: new DateTimeFieldRenderer(field.Name),
                Text: new TextFieldRenderer(field.Name),
                Lookup: new LookupFieldRenderer(field.Name),
                LookupMulti: new LookupFieldRenderer(field.Name),
                WorkflowStatus: new RawFieldRenderer(field.Name)
            };

            if (field.XSLRender == '1') {
                field.FieldRenderer = new RawFieldRenderer(field.Name);
            }
            else {
                field.FieldRenderer = fieldRenderMap[field.FieldType];
                if (field.FieldRenderer == null)
                    field.FieldRenderer = fieldRenderMap[field.Type];
            }
            if (field.FieldRenderer == null)
                field.FieldRenderer = new FieldRenderer(field.Name);
        }
        return field.FieldRenderer.RenderField(renderCtx, field, listItem, listSchema);
    }
    function RenderFieldHeaderCore(renderCtx, listSchema, field) {
        var iStr;

        if (field.Sortable != 'FALSE') {
            var listData = renderCtx.ListData;

            iStr = '<a class="ms-headerSortTitleLink" id="diidSort';
            iStr += renderCtx.ctxId;
            iStr += field.Name;
            iStr += '" onfocus="OnFocusFilter(this)" onclick="javascript:return OnClickFilter(this,event);" href="javascript: " SortingFields="';
            iStr += SortFields(field, listData, listSchema);
            iStr += ' Title="';
            iStr += Strings.STS.L_OpenMenuKeyAccessible;
            iStr += '">';
            iStr += field.FieldTitle;
            iStr += '</a>';
            if (field.Name == listData.Sortfield) {
                if (listData.SortDir == 'ascending') {
                    iStr += '<img border="0" alt="';
                    iStr += Strings.STS.L_viewedit_onetidSortAsc;
                    iStr += '" src="';
                    iStr += '/_layouts/15/images/sort.gif';
                    iStr += '" width="7" height="10" />';
                }
                else {
                    iStr += '<img border="0" alt="';
                    iStr += Strings.STS.L_viewedit_onetidSortDesc;
                    iStr += '" src="';
                    iStr += '/_layouts/15/images/rsort.gif';
                    iStr += '" width="7" height="10" />';
                }
            }
            iStr += '<img src="' + '/_layouts/15/images/blank.gif' + '" alt="" border="0"/>';
            var bShowFilterIcon = listData.FilterFields != null && listData.FilterFields.indexOf(';' + field.Name + ';') >= 0;

            iStr += '<span class="ms-filter-iconouter"';
            if (!bShowFilterIcon) {
                iStr += ' style="display: none;"';
            }
            iStr += '><img class="ms-filter-icon" src="' + GetThemedImageUrl("spcommon.png") + '" alt="" /></span>';
        }
        else if (field.Filterable != 'FALSE' && field.Sortable == 'FALSE') {
            iStr = '<span id="diidSort';
            iStr += renderCtx.ctxId;
            iStr += field.Name;
            iStr += '">';
            iStr += field.FieldTitle;
            iStr += '</span>';
            listData = renderCtx.ListData;
            if (listData.FilterFields != null && listData.FilterFields.indexOf(';' + field.Name + ';') >= 0)
                iStr += '<span class="ms-filter-iconouter" ><img class="ms-filter-icon" src="' + GetThemedImageUrl("spcommon.png") + '" border="0" alt="" /></span>';
        }
        else {
            iStr = "<span title=\"" + Strings.STS.L_CSR_NoSortFilter + "\">" + field.FieldTitle + "</span>";
        }
        return iStr;
    }
    function RenderHeaderField(renderCtx, field) {
        var listSchema = renderCtx.ListSchema;
        var listData = renderCtx.ListData;

        if (listSchema.Filter == '1')
            return field.Filter;
        var iStr;

        if (field.Type == "Number" || field.Type == "Currency") {
            iStr = '<div align="right" class="ms-numHeader">';
            iStr += RenderFieldHeaderCore(renderCtx, listSchema, field);
            iStr += '</div>';
        }
        else {
            iStr = RenderFieldHeaderCore(renderCtx, listSchema, field);
        }
        if (field.FieldType == 'BusinessData') {
            iStr += '<a style="padding-left:2px;padding-right:12px" onmouseover="" onclick="GoToLinkOrDialogNewWindow(this);return false;" href="';
            iStr += listSchema.HttpVDir;
            iStr += '/_layouts/15/BusinessDataSynchronizer.aspx?ListId=';
            iStr += renderCtx.listName;
            iStr += '&ColumnName=';
            iStr += field.Name;
            iStr += '"><img border="0" src="' + '/_layouts/15/images/bdupdate.gif' + '" alt="';
            iStr += Strings.STS.L_BusinessDataField_UpdateImageAlt;
            iStr += '" title="';
            iStr += Strings.STS.L_BusinessDataField_UpdateImageAlt;
            iStr += '"/></a>';
        }
        return iStr;
    }
    function SortFields(field, listData, listSchema) {
        var iStr = listSchema.RootFolderParam;

        iStr += listSchema.FieldSortParam;
        iStr += 'SortField=';
        iStr += field.Name;
        iStr += '&SortDir=';
        if (listData.SortField == field.Name && (listData.SortDir == "ascending" || listData.SortDir == "ASC"))
            iStr += "Desc";
        else
            iStr += "Asc";
        return iStr;
    }
    function RenderDVTHeaderField(renderCtx, field) {
        var listSchema = renderCtx.ListSchema;
        var listData = renderCtx.ListData;
        var iStr = "";

        iStr += '<div Sortable="';
        iStr += field.Sortable == null ? '' : field.Sortable;
        iStr += '" SortDisable="" FilterDisable="" Filterable="';
        iStr += field.Filterable == null ? '' : field.Filterable;
        iStr += '" FilterDisableMessage="';
        iStr += field.FilterDisableMessage == null ? '' : field.FilterDisableMessage;
        iStr += '" name="';
        iStr += field.Name;
        iStr += '" CTXNum="';
        iStr += renderCtx.ctxId;
        iStr += '" DisplayName="';
        iStr += STSHtmlEncode(field.DisplayName);
        iStr += '" FieldType="';
        iStr += field.FieldType;
        iStr += '" ResultType="';
        iStr += field.ResultType == null ? '' : field.ResultType;
        iStr += '" SortFields="';
        iStr += SortFields(field, listData, listSchema);
        iStr += '" class="ms-vh-div">';
        iStr += RenderHeaderField(renderCtx, field);
        iStr += '</div>';
        if (field.Sortable != 'FALSE' && field.Type != 'MultiChoice' || field.Filterable != 'FALSE' && field.Type != 'Note' && field.Type != 'URL') {
            iStr += '<div class="ms-positionRelative">';
            iStr += '<div class="s4-ctx"><span> </span><a onfocus="OnChildColumn(this.parentNode.parentNode.parentNode); return false;" ';
            iStr += 'class="ms-headerSortArrowLink" onclick="PopMenuFromChevron(event); return false;" href="javascript:;" title="';
            iStr += Strings.STS.L_OpenMenu;
            iStr += '"><img style="visibility: hidden;" src="' + GetThemedImageUrl("ecbarw.png") + '" alt=\"" + STSHtmlEncode(Strings.STS.L_OpenMenu) + "\" ms-jsgrid-click-passthrough=\"true\"></a><span> </span></div>';
            iStr += '</div>';
        }
        return iStr;
    }
    function RenderIconHeader(renderCtx, field, imageUrl) {
        var iStr = '<th class="ms-vh-icon ms-minWidthHeader" scope="col" onmouseover="OnChildColumn(this)">';

        field.FieldTitle = '<img border="0" width="16" height="16" src="' + imageUrl + '"/>';
        iStr += RenderDVTHeaderField(renderCtx, field);
        iStr += '</th>';
        return iStr;
    }
    function RenderAttachmentsHeader(renderCtx, field) {
        return RenderIconHeader(renderCtx, field, GetThemedImageUrl("attach16.png"));
    }
    function RenderComputedHeader(renderCtx, field) {
        if (field.Name == "DocIcon" && field.RealFieldName == "DocIcon")
            return RenderIconHeader(renderCtx, field, '/_layouts/15/images/icgen.gif');
        else
            return RenderDefaultHeader(renderCtx, field);
    }
    function RenderSelectedFlagHeader(renderCtx, field) {
        var iStr = '<th scope="col" class="ms-vh3-nograd">';

        iStr += '<img id="diidHeaderImageSelectedFlag" alt="';
        iStr += Strings.STS.L_SPSelection_Checkbox;
        iStr += '" src="' + '/_layouts/15/images/blank.gif' + '" width="16" height="16" border="0"/>';
        iStr += '</th>';
        return iStr;
    }
    function RenderCheckmarkHeader(renderCtx, field) {
        var ret = [];

        ret.push('<th scope="col" class="ms-vh3-nograd ms-vh-hoverable" style="padding-left: 5px;" scope="col" onmouseover="OnChildColumn(this)" onmousedown="ListHeaderMenu_OnMouseDown(this);">');
        ret.push('<div class="ms-chkmark-container" style="cursor: default;">');
        ret.push('<div class="ms-chkmark-container-centerer">');
        ret.push('<span class="ms-cui-img-16by16 ms-cui-img-cont-float" unselectable="on">');
        ret.push('<img class="ms-chkmark-notcomplete" src="');
        ret.push(renderCtx.imagesPath);
        ret.push('spcommon.png" title="');
        ret.push(Strings.STS.L_complete_all);
        ret.push('"/></span></div></div></th>');
        return ret.join('');
    }
    function RenderDateTimeHeader(renderCtx, field) {
        var iStr = '<th class="ms-vh2" scope="col" onmouseover="OnChildColumn(this)" onmousedown="ListHeaderMenu_OnMouseDown(this);">';

        field.FieldTitle = STSHtmlEncode(field.DisplayName);
        iStr += RenderDVTHeaderField(renderCtx, field);
        iStr += '</th>';
        return iStr;
    }
    function RenderRecurrenceHeader(renderCtx, field) {
        var iStr = '<th class="ms-vh-icon" scope="col" onmouseover="OnChildColumn(this)" onmousedown="ListHeaderMenu_OnMouseDown(this);">';

        field.FieldTitle = '<IMG id="diidHeaderImagefRecurrence" src="' + '/_layouts/15/images/recurrence.gif' + '" width="16" height="16" border="0" >';
        iStr += RenderDVTHeaderField(renderCtx, field);
        iStr += '</th>';
        return iStr;
    }
    function RenderDefaultHeader(renderCtx, field) {
        var iStr = '<th scope="col" onmouseover="OnChildColumn(this)" style="max-width: 500px;" class="';

        if ((field.Type == 'User' || field.Type == 'UserMulti') && renderCtx.ListSchema.EffectivePresenceEnabled) {
            iStr += 'ms-vh';
        }
        else {
            iStr += field.Filterable != 'FALSE' || field.Sortable == 'FALSE' ? 'ms-vh2' : 'ms-vh2-nofilter';
        }
        if (field.Name == "DocIcon") {
            iStr += ' ms-minWidthHeader';
        }
        iStr += '" onmousedown="ListHeaderMenu_OnMouseDown(this);">';
        field.FieldTitle = STSHtmlEncode(field.DisplayName);
        iStr += RenderDVTHeaderField(renderCtx, field);
        iStr += '</th>';
        return iStr;
    }
    function RenderCrossProjectLinkHeader(renderCtx, field) {
        var iStr = '<th class="ms-vh-icon" scope="col" onmouseover="OnChildColumn(this)">';
        var themedImgUrl = GetThemedImageUrl("mtgicnhd.gif");

        field.FieldTitle = '<IMG id="diidHeaderImageWorkspaceLink" src="' + themedImgUrl + '" width="16" height="16" border="0" >';
        iStr += RenderDVTHeaderField(renderCtx, field);
        iStr += '</th>';
        return iStr;
    }
    this.RenderHeader = function(renderCtx, field) {
        if (field.Name == 'SelectedFlag')
            return RenderSelectedFlagHeader(renderCtx, field);
        else if (field.Name == 'Checkmark')
            return RenderCheckmarkHeader(renderCtx, field);
        var fieldHeaderRenderMap = {
            Attachments: RenderAttachmentsHeader,
            Computed: RenderComputedHeader,
            CrossProjectLink: RenderCrossProjectLinkHeader,
            Recurrence: RenderRecurrenceHeader,
            DateTime: RenderDateTimeHeader
        };
        var headerRenderer = fieldHeaderRenderMap[field.Type];

        if (headerRenderer != null)
            return headerRenderer(renderCtx, field);
        return RenderDefaultHeader(renderCtx, field);
    };
    this.RenderField = function(renderCtx, field, listItem, listSchema) {
        if (typeof field.fieldRenderer == 'undefined') {
            var fieldTpls = renderCtx.Templates['Fields'];
            var tpl;
            var fldName = field.Name;

            if (fieldTpls[fldName] != null)
                tpl = fieldTpls[fldName];
            var tplFunc;

            if (tpl != null && tpl != '' && tpl != RenderFieldValueDefault) {
                if (typeof tpl == "string")
                    tplFunc = SPClientRenderer.ParseTemplateString(tpl, renderCtx);
                else if (typeof tpl == "function")
                    tplFunc = tpl;
            }
            else
                tplFunc = DefaultRenderField;
            field.fieldRenderer = tplFunc;
        }
        renderCtx['CurrentFieldSchema'] = field;
        var retStr = field.fieldRenderer(renderCtx, field, listItem, listSchema);

        renderCtx['CurrentFieldSchema'] = null;
        if (field.Direction != null) {
            var ret = [];

            ret.push("<span dir=\"");
            ret.push(field.Direction);
            ret.push("\">");
            ret.push(retStr);
            ret.push("</span>");
            retStr = ret.join('');
        }
        if (field.linkToItem != null) {
            ret = [];
            if (listItem.FSObjType == '1') {
                if (listSchema.IsDocLib == '1') {
                    RenderDocFolderLink(ret, retStr, listItem, listSchema);
                }
                else {
                    RenderListFolderLink(ret, retStr, listItem, listSchema);
                }
            }
            else {
                RenderTitle(ret, renderCtx, listItem, listSchema, LinkTitleValue(listItem[field.Name]));
            }
            retStr = ret.join('');
        }
        if (listSchema.UseParentHierarchy && listSchema.ParentHierarchyDisplayField == field.Name) {
            retStr = RenderAndRegisterHierarchyItem(renderCtx, field, listItem, listSchema, retStr);
        }
        var isCustomData = listItem["CustomData."];

        if (isCustomData == null || typeof isCustomData == 'undefined' || Boolean(isCustomData) == false) {
            if (field.CalloutMenu != null) {
                retStr = RenderCalloutMenu(renderCtx, listItem, field, retStr);
            }
            else if (field.listItemMenu != null) {
                retStr = RenderECB(renderCtx, listItem, field, retStr);
            }
        }
        return retStr;
    };
    this.RenderFieldByName = function(renderCtx, fieldName, listItem, listSchema) {
        var ret = '';
        var rendered = false;

        for (var idx in listSchema.Field) {
            var field = listSchema.Field[idx];

            if (field.Name == fieldName) {
                var oldField = renderCtx.CurrentFieldSchema;

                renderCtx.CurrentFieldSchema = field;
                ret = this.RenderField(renderCtx, field, listItem, listSchema);
                renderCtx.CurrentFieldSchema = oldField;
                rendered = true;
                break;
            }
        }
        if (!rendered)
            ret = STSHtmlEncode(listItem[fieldName]);
        return ret;
    };
}
var spMgr;

function OnTableMouseDown(evt) {
    if (evt == null) {
        evt = window.event;
    }
    if (evt.ctrlKey || evt.shiftKey) {
        if (browseris.ie8standard) {
            document.onselectstart = function() {
                return false;
            };
            window.setTimeout(function() {
                document.onselectstart = null;
            }, 0);
        }
        return CancelEvent(evt);
    }
    return true;
}
function FHasRowHoverBehavior(ctxCur) {
    return !browseris.ie8down && !browseris.ipad && ctxCur != null && ctxCur.ListData != null && ctxCur.ListData.Row != null && ctxCur.ListData.Row.length < 50;
}
function InitializeSingleItemPictureView() {
    var SingleItemOverride = {};

    SingleItemOverride.Templates = {};
    SingleItemOverride.BaseViewID = 2;
    SingleItemOverride.ListTemplateType = 109;
    SingleItemOverride.Templates.Item = SingleItem_RenderItemTemplate;
    SingleItemOverride.Templates.Footer = SingleItem_RenderFooterTemplate;
    SingleItemOverride.Templates.Header = SingleItem_RenderHeaderTemplate;
    SPClientTemplates.TemplateManager.RegisterTemplateOverrides(SingleItemOverride);
}
function SingleItem_RenderHeaderTemplate(renderCtx) {
    var listSchema = renderCtx.ListSchema;
    var ret = [];

    ret.push("<div>");
    if (listSchema.RenderViewSelectorPivotMenu == "True")
        ret.push(RenderViewSelectorPivotMenu(renderCtx));
    else if (listSchema.RenderViewSelectorPivotMenuAsync == "True")
        ret.push(RenderViewSelectorPivotMenuAsync(renderCtx));
    ret.push("</div>");
    return ret.join("");
}
function SingleItem_RenderFooterTemplate(renderCtx) {
    return "";
}
function RenderSingleItemTopPagingControl(renderCtx) {
    var ret = [];
    var strRet = "<div class='sp-pictLibHeader'>";

    RenderPagingControlNew(ret, renderCtx, false, "", "topPaging");
    strRet += ret.join('');
    strRet += "</div>";
    return strRet;
}
function SingleItem_RenderItemTemplate(renderCtx) {
    var strTrTdBegin = "<tr><td colspan='100'>";
    var strTrTdEnd = "</td></tr>";
    var strRet = strTrTdBegin;

    strRet += RenderSingleItemTopPagingControl(renderCtx);
    strRet += strTrTdEnd;
    strRet += strTrTdBegin;
    strRet += SingleItem_RenderItem(renderCtx.CurrentItem);
    strRet += strTrTdEnd;
    return strRet;
}
function SingleItem_RenderItem(curItem) {
    var strImgUrl = GetPictureUrl(curItem);

    if (curItem == null)
        return null;
    var strContentType = curItem.ContentType;
    var strRet = null;

    if (!IsStrNullOrEmpty(strContentType) && strContentType == "Folder") {
        strRet = "<div class=\"ms-attractMode\"><a href=\"javascript:\" onclick=ajaxNavigate.update(\"";
        strRet += GetRelativeUrlToSlideShowView(curItem);
        strRet += "\") >";
        strRet += "<div>" + curItem.FileLeafRef + "</div>";
        strRet += "<img src=\"" + "/_layouts/15/" + "images/256_folder.png\" />";
        strRet += "</a></div>";
    }
    else {
        EnsureFileLeafRefSuffix(curItem);
        if (!IsPictureFile(curItem["FileLeafRef.Suffix"])) {
            strRet = "<div class=\"ms-attractMode\">" + String.format(Strings.STS.L_NotAnImageFile, curItem.FileLeafRef) + "</div>";
        }
        else {
            strRet = "<a href=\"javascript:\" onclick='ToggleMaxWidth(this.childNodes[0])' ><img style='max-width:800px' title=\"" + Strings.STS.L_ClickToZoom + "\" src='" + strImgUrl + "' /></a>";
        }
    }
    return strRet;
}
function GetRelativeUrlToSlideShowView(listItem) {
    if (listItem == null)
        return null;
    var strUrl = escape(listItem.FileDirRef);

    strUrl += "/Forms/SinglePict.aspx?RootFolder=";
    strUrl += escapeProperly(listItem.FileRef);
    return strUrl;
}
function IsPictureFile(strFileExtension) {
    if (strFileExtension == null)
        return false;
    var rgstrPictureExtensions = ["jpg", "jpeg", "bmp", "png", "gif"];

    for (var i = 0; i < rgstrPictureExtensions.length; i++) {
        if (strFileExtension.toLowerCase() == rgstrPictureExtensions[i]) {
            return true;
        }
    }
    return false;
}
function GetPictureUrl(listItem) {
    var strUrl = listItem["FileDirRef"] + "/" + listItem["FileLeafRef"];

    return escape(strUrl);
}
function ToggleMaxWidth(elm) {
    var maxWidth = elm.style.maxWidth;

    if (maxWidth == null || maxWidth == "") {
        elm.style.maxWidth = "800px";
    }
    else {
        elm.style.maxWidth = "";
    }
}
$_global_clienttemplates();
