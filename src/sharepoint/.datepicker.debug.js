function $_global_datepicker() {
    ;
    UTF8_1ST_OF_2 = 0xc0;
    UTF8_1ST_OF_3 = 0xe0;
    UTF8_1ST_OF_4 = 0xf0;
    UTF8_TRAIL = 0x80;
    HIGH_SURROGATE_BITS = 0xD800;
    LOW_SURROGATE_BITS = 0xDC00;
    SURROGATE_6_BIT = 0xFC00;
    SURROGATE_ID_BITS = 0xF800;
    SURROGATE_OFFSET = 0x10000;
    if (typeof String.prototype.endsWith == "undefined") {
        String.prototype.endsWith = function(suffix) {
            return this.substr(this.length - suffix.length) === suffix;
        };
    }
    if (typeof String.prototype.startsWith == "undefined") {
        String.prototype.startsWith = function(prefix) {
            return this.substr(0, prefix.length) === prefix;
        };
    }
    ;
    XUIHtml = {};
    XUIHtml.SetOpacity = function(domNode, newVal) {
        if (document.body.style.opacity != null) {
            if (newVal == 1)
                XUIHtml.RemoveCSSProperty(domNode, "opacity");
            else
                domNode.style.opacity = newVal;
        }
        else {
            if (newVal == 1)
                XUIHtml.RemoveCSSProperty(domNode, "filter");
            else
                domNode.style.filter = 'alpha(opacity=' + String(newVal * 100) + ')';
        }
    };
    XUIHtml.RemoveCSSProperty = function(domNode, propName) {
        if (typeof domNode.style.removeProperty != "undefined")
            domNode.style.removeProperty(propName);
        else
            domNode.style.removeAttribute(propName);
    };
    XUIHtml.GetOpacity = function(domNode) {
        if (document.body.style.opacity != null) {
            var o = domNode.style.opacity;

            return o != null && o != '' ? parseFloat(o) : 1;
        }
        else {
            var f = domNode.style.filter;

            return f != null && f != '' ? parseInt((f.replace('alpha(opacity=', '')).replace(')', '')) / 100 : 1;
        }
    };
    Browseris.prototype = {
        firefox: undefined,
        firefox36up: undefined,
        firefox3up: undefined,
        firefox4up: undefined,
        ie: undefined,
        ie55up: undefined,
        ie5up: undefined,
        ie7down: undefined,
        ie8down: undefined,
        ie8standard: undefined,
        ie8standardUp: undefined,
        ie9standardUp: undefined,
        ipad: undefined,
        windowsphone7: undefined,
        chrome: undefined,
        chrome7up: undefined,
        chrome8up: undefined,
        chrome9up: undefined,
        iever: undefined,
        mac: undefined,
        major: undefined,
        nav: undefined,
        nav6: undefined,
        nav6up: undefined,
        nav7up: undefined,
        osver: undefined,
        safari: undefined,
        safari125up: undefined,
        safari3up: undefined,
        verIEFull: undefined,
        w3c: undefined,
        webKit: undefined,
        win: undefined,
        win32: undefined,
        win64bit: undefined,
        winnt: undefined
    };
    browseris = new Browseris();
    bis = browseris;
    if (typeof Sys != "undefined" && Boolean(Sys) && typeof Sys.Application != "undefined" && Boolean(Sys.Application) && typeof Sys.Application.notifyScriptLoaded == "function") {
        Sys.Application.notifyScriptLoaded();
    }
    if (typeof NotifyScriptLoadedAndExecuteWaitingJobs == "function") {
        NotifyScriptLoadedAndExecuteWaitingJobs("owsbrows.js");
    }
    g_insideCurrentMonth = false;
    g_focusOnFirstDayCurrentMonth = false;
    g_focusOnLastDayCurrentMonth = false;
    g_strDatePickerFrameID = "DatePickerFrame";
    g_strDatePickerImageID = "DatePickerImage";
    g_strDatePickerRangeValidatorID = "DatePickerRangeValidator";
    g_warnonce = 1;
    if (typeof Sys != "undefined" && Sys != null && Sys.Application != null) {
        Sys.Application.notifyScriptLoaded();
    }
    if (typeof NotifyScriptLoadedAndExecuteWaitingJobs == "function") {
        NotifyScriptLoadedAndExecuteWaitingJobs("datepicker.js");
    }
}
function ULSvmd() {
    var o = new Object;

    o.ULSTeamName = "Microsoft SharePoint Foundation";
    o.ULSFileName = "datepicker.commentedjs";
    return o;
}
function $dg(x) {
ULSvmd:
    ;
    if (!(x in window))
        window[x] = undefined;
}
var UTF8_1ST_OF_2;
var UTF8_1ST_OF_3;
var UTF8_1ST_OF_4;
var UTF8_TRAIL;
var HIGH_SURROGATE_BITS;
var LOW_SURROGATE_BITS;
var SURROGATE_6_BIT;
var SURROGATE_ID_BITS;
var SURROGATE_OFFSET;

function escapeProperlyCoreCore(str, bAsUrl, bForFilterQuery, bForCallback) {
    var strOut = "";
    var strByte;
    var ix = 0;
    var strEscaped = " \"%<>\'&";

    if (typeof str == "undefined")
        return "";
    for (ix = 0; ix < str.length; ix++) {
        var charCode = str.charCodeAt(ix);
        var curChar = str.charAt(ix);

        if (bAsUrl && (curChar == '#' || curChar == '?')) {
            strOut += str.substr(ix);
            break;
        }
        if (bForFilterQuery && curChar == '&') {
            strOut += curChar;
            continue;
        }
        if (charCode <= 0x7f) {
            if (bForCallback) {
                strOut += curChar;
            }
            else {
                if (charCode >= 97 && charCode <= 122 || charCode >= 65 && charCode <= 90 || charCode >= 48 && charCode <= 57 || bAsUrl && (charCode >= 32 && charCode <= 95) && strEscaped.indexOf(curChar) < 0) {
                    strOut += curChar;
                }
                else if (charCode <= 0x0f) {
                    strOut += "%0" + (charCode.toString(16)).toUpperCase();
                }
                else if (charCode <= 0x7f) {
                    strOut += "%" + (charCode.toString(16)).toUpperCase();
                }
            }
        }
        else if (charCode <= 0x07ff) {
            strByte = UTF8_1ST_OF_2 | charCode >> 6;
            strOut += "%" + (strByte.toString(16)).toUpperCase();
            strByte = UTF8_TRAIL | charCode & 0x003f;
            strOut += "%" + (strByte.toString(16)).toUpperCase();
        }
        else if ((charCode & SURROGATE_6_BIT) != HIGH_SURROGATE_BITS) {
            strByte = UTF8_1ST_OF_3 | charCode >> 12;
            strOut += "%" + (strByte.toString(16)).toUpperCase();
            strByte = UTF8_TRAIL | (charCode & 0x0fc0) >> 6;
            strOut += "%" + (strByte.toString(16)).toUpperCase();
            strByte = UTF8_TRAIL | charCode & 0x003f;
            strOut += "%" + (strByte.toString(16)).toUpperCase();
        }
        else if (ix < str.length - 1) {
            charCode = (charCode & 0x03FF) << 10;
            ix++;
            var nextCharCode = str.charCodeAt(ix);

            charCode |= nextCharCode & 0x03FF;
            charCode += SURROGATE_OFFSET;
            strByte = UTF8_1ST_OF_4 | charCode >> 18;
            strOut += "%" + (strByte.toString(16)).toUpperCase();
            strByte = UTF8_TRAIL | (charCode & 0x3f000) >> 12;
            strOut += "%" + (strByte.toString(16)).toUpperCase();
            strByte = UTF8_TRAIL | (charCode & 0x0fc0) >> 6;
            strOut += "%" + (strByte.toString(16)).toUpperCase();
            strByte = UTF8_TRAIL | charCode & 0x003f;
            strOut += "%" + (strByte.toString(16)).toUpperCase();
        }
    }
    return strOut;
}
function escapeProperly(str) {
ULSvmd:
    ;
    return escapeProperlyCoreCore(str, false, false, false);
}
function escapeProperlyCore(str, bAsUrl) {
ULSvmd:
    ;
    return escapeProperlyCoreCore(str, bAsUrl, false, false);
}
function escapeUrlForCallback(str) {
    var iPound = str.indexOf("#");
    var iQues = str.indexOf("?");

    if (iPound > 0 && (iQues == -1 || iPound < iQues)) {
        var strNew = str.substr(0, iPound);

        if (iQues > 0) {
            strNew += str.substr(iQues);
        }
        str = strNew;
    }
    return escapeProperlyCoreCore(str, true, false, true);
}
function PageUrlValidation(url) {
    if (url.substr(0, 4) == "http" || url.substr(0, 1) == "/" || url.indexOf(":") == -1) {
        return url;
    }
    else {
        alert(Strings.STS.L_InvalidPageUrl_Text);
        return "";
    }
}
function SelectRibbonTab(tabId, force) {
ULSvmd:
    ;
    var rib;

    try {
        rib = (SP.Ribbon.PageManager.get_instance()).get_ribbon();
    }
    catch (e) { }
    if (!Boolean(rib)) {
        if (typeof _ribbonStartInit != "undefined")
            _ribbonStartInit(tabId, false, null);
    }
    else if (force || rib.get_selectedTabId() == "Ribbon.Read") {
        rib.selectTabById(tabId);
    }
}
function FV4UI() {
ULSvmd:
    ;
    return typeof _fV4UI != "undefined" && _fV4UI;
}
function GoToHistoryLink(elm, strVersion) {
    if (elm.href == null)
        return;
    var targetUrl = elm.href;
    var ch = elm.href.indexOf("?") >= 0 ? "&" : "?";
    var srcUrl = ch + "VersionNo=" + strVersion;
    var srcSourceUrl = GetSource();

    if (srcSourceUrl != null && srcSourceUrl != "")
        srcSourceUrl = "&" + "Source=" + srcSourceUrl;
    targetUrl = elm.href + srcUrl + srcSourceUrl;
    if (isPortalTemplatePage(targetUrl))
        window.top.location.href = STSPageUrlValidation(targetUrl);
    else
        window.location.href = STSPageUrlValidation(targetUrl);
}
function GetGotoLinkUrl(elm) {
    if (elm.href == null)
        return null;
    var ch = elm.href.indexOf("?") >= 0 ? "&" : "?";
    var srcUrl = GetSource();

    if (srcUrl != null && srcUrl != "")
        srcUrl = ch + "Source=" + srcUrl;
    var targetUrl = elm.href + srcUrl;

    return targetUrl;
}
function GoToLink(elm) {
ULSvmd:
    ;
    var targetUrl = GetGotoLinkUrl(elm);

    if (targetUrl == null)
        return;
    var fNavigate = true;

    if (typeof window.top.SPUpdatePage !== 'undefined') {
        fNavigate = window.top.SPUpdatePage(targetUrl);
    }
    if (fNavigate) {
        if (isPortalTemplatePage(targetUrl))
            window.top.location.href = STSPageUrlValidation(targetUrl);
        else
            window.location.href = STSPageUrlValidation(targetUrl);
    }
}
function GoToLinkOrDialogNewWindow(elm) {
    if (elm.href == null)
        return;
    if (Boolean((ajaxNavigate.get_search()).match(RegExp("[?&]IsDlg=1"))))
        window.open(elm.href);
    else
        GoToLink(elm);
}
function GoToDiscussion(url) {
    var ch = url.indexOf("?") >= 0 ? "&" : "?";
    var srcUrl = GetSource();

    if (srcUrl != null && srcUrl != "")
        url += ch + "TopicsView=" + srcUrl;
    STSNavigate(url);
}
function GetCurrentEltStyle(element, cssStyle) {
    if (Boolean(element.currentStyle))
        return element.currentStyle[cssStyle];
    else {
        if (Boolean(window) && Boolean(window.getComputedStyle)) {
            var compStyle = window.getComputedStyle(element, null);

            if (Boolean(compStyle) && Boolean(compStyle.getPropertyValue)) {
                return compStyle.getPropertyValue(cssStyle);
            }
        }
    }
    return null;
}
function InsertNodeAfter(refNode, nodeToInsert) {
    if (refNode == null || refNode.parentNode == null || nodeToInsert == null)
        return;
    var pNode = refNode.parentNode;
    var nextSib = refNode.nextSibling;

    if (nextSib == null)
        pNode.appendChild(nodeToInsert);
    else
        pNode.insertBefore(nodeToInsert, nextSib);
}
function EEDecodeSpecialChars(str) {
    var decodedStr = str.replace(/&quot;/g, "\"");

    decodedStr = decodedStr.replace(/&gt;/g, ">");
    decodedStr = decodedStr.replace(/&lt;/g, "<");
    decodedStr = decodedStr.replace(/&#39;/g, "'");
    decodedStr = decodedStr.replace(/&amp;/g, "&");
    return decodedStr;
}
function ShowAttachmentRows() {
ULSvmd:
    ;
    var elm = document.getElementById('idAttachmentsTable');
    var elmAttachmentRow = document.getElementById('idAttachmentsRow');

    if (elmAttachmentRow != null) {
        if (elm == null || elm.rows.length == 0)
            elmAttachmentRow.style.display = 'none';
        else
            elmAttachmentRow.style.display = 'table-row';
    }
}
function PreventDefaultNavigation() {
ULSvmd:
    ;
    var evt = window.event;

    if (evt != null) {
        if (evt.preventDefault == null)
            evt.returnValue = false;
        else
            evt.preventDefault();
    }
}
function cancelDefault(evt) {
    if (typeof evt == "undefined" || evt == null) {
        evt = window.event;
    }
    if (!(typeof evt == "undefined" || evt == null)) {
        if (typeof evt.stopPropagation == "function")
            evt.stopPropagation();
        else
            evt.cancelBubble = true;
        if (typeof evt.preventDefault == "function")
            evt.preventDefault();
        else
            evt.returnValue = false;
    }
    return false;
}
function IsArray(input) {
    return typeof input == 'object' && input instanceof Array;
}
function IsNullOrUndefined(value) {
    return value == null || value == undefined;
}
function SetOpacity(element, value) {
    XUIHtml.SetOpacity(element, value);
}
function GetOpacity(element) {
    return XUIHtml.GetOpacity(element);
}
var XUIHtml;

function Browseris() {
ULSvmd:
    ;
    var agt = navigator.userAgent.toLowerCase();
    var navIdx;

    this.osver = 1.0;
    if (Boolean(agt)) {
        var stOSVer = agt.substring(agt.indexOf("windows ") + 11);

        this.osver = parseFloat(stOSVer);
    }
    this.major = parseInt(navigator.appVersion);
    this.nav = agt.indexOf('mozilla') != -1 && (agt.indexOf('spoofer') == -1 && agt.indexOf('compatible') == -1);
    this.nav6 = this.nav && this.major == 5;
    this.nav6up = this.nav && this.major >= 5;
    this.nav7up = false;
    if (this.nav6up) {
        navIdx = agt.indexOf("netscape/");
        if (navIdx >= 0)
            this.nav7up = parseInt(agt.substring(navIdx + 9)) >= 7;
    }
    this.ie = agt.indexOf("msie") != -1;
    this.ipad = agt.indexOf("ipad") != -1;
    this.windowsphone7 = agt.indexOf("windows phone os 7.5") != -1;
    this.aol = this.ie && agt.indexOf(" aol ") != -1;
    if (this.ie) {
        var stIEVer = agt.substring(agt.indexOf("msie ") + 5);

        this.iever = parseInt(stIEVer);
        this.verIEFull = parseFloat(stIEVer);
    }
    else
        this.iever = 0;
    this.ie4up = this.ie && this.major >= 4;
    this.ie5up = this.ie && this.iever >= 5;
    this.ie55up = this.ie && this.verIEFull >= 5.5;
    this.ie6up = this.ie && this.iever >= 6;
    this.ie7down = this.ie && this.iever <= 7;
    this.ie8down = this.ie && this.iever <= 8;
    this.ie7up = this.ie && this.iever >= 7;
    this.ie8standard = this.ie && Boolean(document.documentMode) && document.documentMode == 8;
    this.ie8standardUp = this.ie && Boolean(document.documentMode) && document.documentMode >= 8;
    this.ie9standardUp = this.ie && Boolean(document.documentMode) && document.documentMode >= 9;
    this.winnt = agt.indexOf("winnt") != -1 || agt.indexOf("windows nt") != -1;
    this.win32 = this.major >= 4 && navigator.platform == "Win32" || agt.indexOf("win32") != -1 || agt.indexOf("32bit") != -1;
    this.win64bit = agt.indexOf("win64") != -1;
    this.win = this.winnt || this.win32 || this.win64bit;
    this.mac = agt.indexOf("mac") != -1;
    this.w3c = this.nav6up;
    this.webKit = agt.indexOf("webkit") != -1;
    this.safari = agt.indexOf("webkit") != -1;
    this.safari125up = false;
    this.safari3up = false;
    if (this.safari && this.major >= 5) {
        navIdx = agt.indexOf("webkit/");
        if (navIdx >= 0)
            this.safari125up = parseInt(agt.substring(navIdx + 7)) >= 125;
        var verIdx = agt.indexOf("version/");

        if (verIdx >= 0)
            this.safari3up = parseInt(agt.substring(verIdx + 8)) >= 3;
    }
    this.firefox = this.nav && agt.indexOf("firefox") != -1;
    this.firefox3up = false;
    this.firefox36up = false;
    this.firefox4up = false;
    if (this.firefox && this.major >= 5) {
        var ffVerIdx = agt.indexOf("firefox/");

        if (ffVerIdx >= 0) {
            var firefoxVStr = agt.substring(ffVerIdx + 8);

            this.firefox3up = parseInt(firefoxVStr) >= 3;
            this.firefox36up = parseFloat(firefoxVStr) >= 3.6;
            this.firefox4up = parseInt(firefoxVStr) >= 4;
        }
    }
    this.chrome = this.nav && agt.indexOf("chrome") != -1;
    this.chrome7up = false;
    this.chrome8up = false;
    this.chrome9up = false;
    if (this.chrome && this.major >= 5) {
        var chmVerIdx = agt.indexOf("chrome/");

        if (chmVerIdx >= 0) {
            var chmVerStr = agt.substring(chmVerIdx + 7);
            var chmVerInt = parseInt(chmVerStr);

            this.chrome7up = chmVerInt >= 7;
            this.chrome8up = chmVerInt >= 8;
            this.chrome9up = chmVerInt >= 9;
        }
    }
}
var browseris;
var bis;

function byid(id) {
ULSvmd:
    ;
    return document.getElementById(id);
}
function newE(tag) {
ULSvmd:
    ;
    return document.createElement(tag);
}
function wpf() {
ULSvmd:
    ;
    if (typeof window.MSOWebPartPageFormName != "undefined")
        return document.forms[window.MSOWebPartPageFormName];
    return null;
}
function startReplacement() {
}
function SetEvent(eventName, eventFunc, el) {
    if (!el)
        el = window;
    if (typeof eventFunc == 'string')
        eventFunc = new Function(eventFunc);
    el['on' + eventName] = eventFunc;
}
function AttachEvent(eventName, eventFunc, el) {
    if (!el)
        el = window;
    if (eventName == 'domLoad') {
        eventName = typeof el.addEventListener != 'undefined' && el.addEventListener && browseris.nav ? 'DOMContentLoaded' : 'load';
    }
    if (typeof eventFunc == 'string')
        eventFunc = new Function(eventFunc);
    if (typeof el.addEventListener != 'undefined' && el.addEventListener)
        el.addEventListener(eventName, eventFunc, false);
    else if (typeof el.attachEvent != 'undefined')
        el.attachEvent('on' + eventName, eventFunc);
}
function DetachEvent(eventName, eventFunc, el) {
    if (!el)
        el = window;
    if (eventName == 'domLoad') {
        eventName = typeof el.removeEventListener != 'undefined' && el.removeEventListener && browseris.nav ? 'DOMContentLoaded' : 'load';
    }
    if (typeof eventFunc == 'string')
        eventFunc = new Function(eventFunc);
    if (typeof el.removeEventListener != 'undefined' && el.removeEventListener)
        el.removeEventListener(eventName, eventFunc, false);
    else if (typeof el.detachEvent != 'undefined')
        el.detachEvent('on' + eventName, eventFunc);
}
function CancelEvent(e) {
    e.cancelBubble = true;
    if (Boolean(e.preventDefault))
        e.preventDefault();
    e.returnValue = false;
    return false;
}
function GetEventSrcElement(e) {
    if (e.target != null)
        return e.target;
    else
        return e.srcElement;
}
function GetEventKeyCode(e) {
    if (browseris.nav)
        return e.which;
    else
        return e.keyCode;
}
function GetInnerText(e) {
    if (browseris.safari && browseris.major < 5)
        return e.innerHTML;
    else if (browseris.nav || browseris.safari)
        return e.textContent;
    else
        return e.innerText;
}
function St2Digits(w) {
ULSvmd:
    ;
    var st = "";

    if (w < 0)
        return st;
    if (w < 10)
        st += "0";
    st += String(w);
    return st;
}
var g_currentID;
var g_insideCurrentMonth;
var g_focusOnFirstDayCurrentMonth;
var g_focusOnLastDayCurrentMonth;
var g_firstDayID;
var g_lastDayID;
var g_strDatePickerFrameID;
var g_strDatePickerImageID;
var g_strDatePickerRangeValidatorID;
var g_warnonce;
var g_scrollLeft;
var g_scrollTop;
var g_selectedDate;

function WindowPosition(elt) {
    var pos = new Position;

    pos.x = 0;
    pos.y = 0;
    while (elt.offsetParent != null && !(elt.tagName == "DIV" && (elt.style.overflow == "auto" || elt.style.overflowX == "auto" || elt.style.overflowY == "auto"))) {
        pos.x += elt.offsetLeft - elt.scrollLeft;
        pos.y += elt.offsetTop - elt.scrollTop;
        elt = elt.offsetParent;
    }
    return pos;
}
function getOffsetTop(elem, value) {
    if (elem == null)
        return value;
    if (elem.tagName.toUpperCase() == "TD" && elem.style.borderTopStyle != "none") {
        var shift = parseInt(elem.style.borderTopWidth);

        if (!isNaN(shift)) {
            value += shift;
        }
    }
    return getOffsetTop(elem.tagName.toUpperCase() == "BODY" ? elem.parentNode : elem.offsetParent, elem.offsetTop - elem.scrollTop + value);
}
function getOffsetLeft(elem, value) {
    if (elem == null)
        return value;
    if (elem.tagName.toUpperCase() == "TD" && elem.style.borderLeftStyle != "none") {
        var shift = parseInt(elem.style.borderLeftWidth);

        if (!isNaN(shift)) {
            value += shift;
        }
    }
    return getOffsetLeft(elem.tagName.toUpperCase() == "BODY" ? elem.parentNode : elem.offsetParent, elem.offsetLeft - elem.scrollLeft + value);
}
function getDate(field, serverDate, targetAttribute) {
    if (targetAttribute != null) {
        var value = field[targetAttribute];

        return value != null ? value : "";
    }
    else if (field.value != null)
        return field.value;
    else
        return serverDate;
}
function HLD(elt) {
ULSvmd:
    ;
    HL(elt, "ms-dphighlightedday");
}
function HLM(elt) {
ULSvmd:
    ;
    HL(elt, "ms-dphighlightedmonth");
}
function HL(elt, classname) {
    if (typeof elt.classSave != 'undefined' && elt.classSave != null) {
        elt.className = elt.classSave;
        elt.classSave = null;
    }
    else {
        elt.classSave = elt.className;
        elt.className = classname;
    }
}
function GetIframe() {
ULSvmd:
    ;
    if (typeof GetParentWindow == 'function' && Boolean(GetParentWindow())) {
        var parentWindow = GetParentWindow();

        return parentWindow.frameElement;
    }
    return null;
}
function GetParentWindow(doc) {
    if (doc == null) {
        doc = document;
    }
    if (typeof doc.parentWindow != 'undefined' && doc.parentWindow != null) {
        return doc.parentWindow;
    }
    else if (typeof doc.defaultView != 'undefined' && doc.defaultView != null) {
        return doc.defaultView;
    }
    return null;
}
function GetCurrentStyleDatepicker(node) {
    var element = node;

    if (element.currentStyle != null) {
        return element.currentStyle;
    }
    var doc = Boolean(element.ownerDocument) ? element.ownerDocument : node;
    var w = doc.defaultView;

    return w != null && node !== w && w.getComputedStyle != null ? w.getComputedStyle(element, null) : element.style;
}
function PositionFrame(thediv) {
ULSvmd:
    ;
    var elt = document.getElementById(thediv);
    var ifrm = GetIframe();

    if (ifrm == null || elt == null)
        return;
    if (ifrm.style.display == "none") {
        ifrm.style.display = "block";
    }
    if (typeof window.bDidAlign == 'undefined' || !window.bDidAlign) {
        window.bDidAlign = true;
    }
    ifrm.style.width = String(elt.offsetWidth) + "px";
    ifrm.style.height = String(elt.offsetHeight + 1) + "px";
    if ((GetCurrentStyleDatepicker(ifrm)).direction != "rtl" && typeof ifrm.leftBeforeFlip != 'undefined')
        ifrm.style.left = String(parseInt(ifrm.leftBeforeFlip, 10) - parseInt(ifrm.style.width, 10)) + "px";
    if (parseInt(ifrm.style.left, 10) < 0) {
        ifrm.style.left = "1px";
    }
    var parentDocument = (GetParentWindow()).parent.document;
    var body = parentDocument.body;
    var bodyScrollWidth = body.scrollWidth;

    if (typeof ifrm.v4WorkSpaceDivScrollWidth != 'undefined')
        var divScrollWidth = ifrm.v4WorkSpaceDivScrollWidth;
    var div = parentDocument.getElementById("s4-workspace");
    var scrollBarWidth = Boolean(div) ? div.offsetWidth - div.clientWidth : body.offsetWidth - body.clientWidth;

    if (scrollBarWidth != 0) {
        bodyScrollWidth -= scrollBarWidth;
        divScrollWidth -= scrollBarWidth;
    }
    var widthLimit = bodyScrollWidth > divScrollWidth ? bodyScrollWidth : divScrollWidth;

    if (parseInt(ifrm.style.left, 10) + parseInt(ifrm.style.width, 10) > widthLimit) {
        ifrm.style.left = String(widthLimit - parseInt(ifrm.style.width, 10) - 1) + "px";
    }
    var elm = document.getElementById(g_currentID);

    if (elm == null)
        return;
    g_firstDayID = g_currentID.substr(0, 6) + "01";
    var firstDay = document.getElementById(g_firstDayID);

    if (firstDay != null) {
        firstDay.onfocus = function() {
        ULSvmd:
            ;
            FocusOnFirstDay(true, g_firstDayID);
            return false;
        };
        firstDay.onblur = function() {
        ULSvmd:
            ;
            FocusOnFirstDay(false, g_firstDayID);
            return false;
        };
    }
    var currentDay = Number(g_currentID.substr(6, 2));
    var nextDayID = g_currentID.substr(0, 6) + St2Digits(currentDay + 1);

    while (document.getElementById(nextDayID) != null) {
        currentDay += 1;
        nextDayID = g_currentID.substr(0, 6) + St2Digits(currentDay + 1);
    }
    g_lastDayID = g_currentID.substr(0, 6) + St2Digits(currentDay);
    var lastDay = document.getElementById(g_lastDayID);

    if (lastDay != null) {
        lastDay.onfocus = function() {
        ULSvmd:
            ;
            FocusOnLastDay(true, g_lastDayID);
            return false;
        };
        lastDay.onblur = function() {
        ULSvmd:
            ;
            FocusOnLastDay(false, g_lastDayID);
            return false;
        };
    }
    if (typeof ifrm.firstUp != 'undefined' && ifrm.firstUp == true) {
        window.setTimeout(function() {
        ULSvmd:
            ;
            setFocusDatepicker(elm);
        }, 0);
        ifrm.firstUp = false;
        g_insideCurrentMonth = true;
    }
    else {
        window.setTimeout(function() {
        ULSvmd:
            ;
            setFirstFocus(elt);
        }, 0);
        g_insideCurrentMonth = false;
    }
    return;
}
function setFirstFocus(elt) {
    var switchMonthAchor = (elt.getElementsByTagName("A"))[0];

    if (switchMonthAchor != null)
        try {
            switchMonthAchor.focus();
        }
        catch (exception) { }
}
function FocusOnFirstDay(flag, firstDayID) {
ULSvmd:
    ;
    g_focusOnFirstDayCurrentMonth = flag;
    if (flag == true)
        g_currentID = firstDayID;
    var date = document.getElementById(firstDayID);

    if (date != null)
        DateStyle(flag, date);
}
function FocusOnLastDay(flag, lastDayID) {
ULSvmd:
    ;
    g_focusOnLastDayCurrentMonth = flag;
    if (flag == true)
        g_currentID = lastDayID;
    var date = document.getElementById(lastDayID);

    if (date != null)
        DateStyle(flag, date);
}
function FocusOnDay(flag, evt) {
ULSvmd:
    ;
    var date = null;

    if (evt != null) {
        if (evt.target != null) {
            date = evt.target;
        }
        else if (evt.srcElement != null) {
            date = evt.srcElement;
        }
    }
    if (date != null)
        DateStyle(flag, date);
}
function DateStyle(flag, date) {
ULSvmd:
    ;
    if (date != null && date.parentNode != null) {
        if (flag == true)
            date.parentNode.className = "ms-picker-dayselected";
        else
            date.parentNode.className = "ms-picker-daycenter";
    }
}
function setFocusDatepicker(elm) {
    if (elm.onfocus == null) {
        if (browseris.ie)
            elm.onfocus = function() {
            ULSvmd:
                ;
                FocusOnDay(true, event);
                return false;
            };
        else
            elm.onfocus = function(evt) {
            ULSvmd:
                ;
                FocusOnDay(true, evt);
                return false;
            };
    }
    if (elm.onblur == null) {
        if (browseris.ie)
            elm.onblur = function() {
            ULSvmd:
                ;
                FocusOnDay(false, event);
                return false;
            };
        else
            elm.onblur = function(evt) {
            ULSvmd:
                ;
                FocusOnDay(false, evt);
                return false;
            };
    }
    try {
        elm.focus();
    }
    catch (exception) { }
}
function HideUnhide(nhide, nunhide, id) {
ULSvmd:
    ;
    var eltHide = document.getElementById(nhide);

    if (eltHide != null)
        eltHide.style.display = "none";
    var eltUnhide = document.getElementById(nunhide);

    if (eltUnhide != null)
        eltUnhide.style.display = "block";
    g_currentID = id;
    PositionFrame(nunhide);
    return;
}
function datereplace(ourl, pattern, newstr) {
    var str = String(ourl);
    var res = str.indexOf(pattern);

    if (res != -1) {
        var resString = str.substring(0, res);

        resString += newstr;
        var resapp = str.indexOf("&", res);

        if (resapp != -1) {
            resString += str.substr(resapp + 1);
        }
        return resString;
    }
    else {
        var q = str.indexOf("?");

        if (q == -1)
            str += "?";
        if (str.charAt(str.length - 1) != '&')
            str += "&";
        str += newstr;
        return str;
    }
}
function DP_MoveToDate(dt) {
    var ourl = document.location.href;
    var pattern = "date=";

    ourl = datereplace(ourl, pattern, "date=" + escapeProperly(dt) + "&");
    document.location.href = ourl;
    if (!browseris.firefox36up)
        return true;
    return false;
}
function OnKeyDown(evtSource) {
    if (evtSource.target != null && (evtSource.target.id == 'DateMinutes0' || evtSource.target.id == 'DateHours0'))
        return;
    var nKeyCode;

    if (Boolean(evtSource.keyCode))
        nKeyCode = evtSource.keyCode;
    else if (Boolean(evtSource.which))
        nKeyCode = evtSource.which;
    if (nKeyCode == Sys.UI.Key.enter && evtSource.target != null) {
        var hourEle = document.getElementById('DateHours0');

        if (hourEle != null) {
            if (typeof evtSource.target.onblur == "function") {
                try {
                    hourEle.focus();
                }
                catch (exception) { }
                return;
            }
        }
    }
    if (nKeyCode == 27) {
        if (Boolean(evtSource.preventDefault))
            evtSource.preventDefault();
        else
            evtSource.returnValue = false;
        ClosePicker();
        return;
    }
    var shiftKeyLocal = evtSource.shiftKey;

    if (g_focusOnFirstDayCurrentMonth == true && (nKeyCode == 39 || nKeyCode == 40 || nKeyCode == 9 && !shiftKeyLocal))
        g_insideCurrentMonth = true;
    if (g_focusOnFirstDayCurrentMonth == true && nKeyCode == 9 && shiftKeyLocal)
        g_insideCurrentMonth = false;
    if (g_focusOnLastDayCurrentMonth == true && nKeyCode == 9 && !shiftKeyLocal)
        g_insideCurrentMonth = false;
    if (g_focusOnLastDayCurrentMonth == true && (nKeyCode == 37 || nKeyCode == 38 || nKeyCode == 9 && shiftKeyLocal))
        g_insideCurrentMonth = true;
    if (nKeyCode == 9 && g_insideCurrentMonth == true)
        nKeyCode = !shiftKeyLocal ? 39 : 37;
    if (g_insideCurrentMonth == true) {
        switch (nKeyCode) {
        case 38:
            if (Boolean(evtSource.preventDefault))
                evtSource.preventDefault();
            else
                evtSource.returnValue = false;
            MoveDays(-7);
            break;
        case 40:
            if (Boolean(evtSource.preventDefault))
                evtSource.preventDefault();
            else
                evtSource.returnValue = false;
            MoveDays(7);
            break;
        case 37:
            if (Boolean(evtSource.preventDefault))
                evtSource.preventDefault();
            else
                evtSource.returnValue = false;
            MoveDays(-1);
            break;
        case 39:
            if (Boolean(evtSource.preventDefault))
                evtSource.preventDefault();
            else
                evtSource.returnValue = false;
            MoveDays(1);
            break;
        }
    }
}
function ClosePicker() {
ULSvmd:
    ;
    var ifrm = GetIframe();

    if (ifrm == null) {
        return;
    }
    if (typeof ifrm.resultfunc == 'function')
        ifrm.resultfunc(ifrm.resultfield);
    ifrm.style.display = "none";
    ifrm = null;
}
function MoveDays(iday) {
ULSvmd:
    ;
    var stNextID;

    if (g_currentID == null || g_currentID.length < 6)
        return;
    var yr = Number(g_currentID.substr(0, 4));
    var mon = Number(g_currentID.substr(4, 2));
    var day = Number(g_currentID.substr(6, 2));

    if (day + iday < 1) {
        return;
    }
    else {
        stNextID = g_currentID.substr(0, 6) + St2Digits(day + iday);
        var elm = document.getElementById(stNextID);

        if (elm == null)
            return;
        g_currentID = stNextID;
        setFocusDatepicker(elm);
    }
}
function clickDatePicker(field, src, datestr, evt) {
ULSvmd:
    ;
    clickDatePickerWorker(field, src, datestr, evt, null, null, null);
}
function clickDatePickerExtended(field, src, datestr, evt, targetAttribute, offsetTopExtended, offsetLeftExtended) {
ULSvmd:
    ;
    clickDatePickerWorker(field, src, datestr, evt, targetAttribute, offsetTopExtended, offsetLeftExtended);
}
function clickDatePickerWorker(field, src, datestr, evt, targetAttribute, offsetTopExtended, offsetLeftExtended) {
ULSvmd:
    ;
    var date;
    var objField = document.getElementById(field);
    var fieldid;

    if (evt == null)
        evt = window.event;
    if (evt != null)
        evt.cancelBubble = true;
    if (field == null && typeof this.Picker != 'undefined' && this.Picker != null) {
        var picker = this.Picker;

        if (typeof picker.resultfield != 'undefined' && picker.resultfield != null)
            try {
                var resultfield = picker.resultfield;

                resultfield.focus();
            }
            catch (exception) { }
        picker.style.display = "none";
        this.Picker = null;
        document.body.onclick = null;
    }
    else if (objField != null) {
        var fieldelm = document.getElementById(field);

        if (fieldelm != null && typeof fieldelm.isDisabled != 'undefined' && fieldelm.isDisabled)
            return;
        date = getDate(objField, datestr, targetAttribute);
        fieldid = objField.id;
        var objDatePickerImage = document.getElementById(fieldid + g_strDatePickerImageID);

        clickDatePickerHelper(fieldid, fieldid + g_strDatePickerFrameID, objDatePickerImage, date, src, OnSelectDate, OnPickerFinish, targetAttribute, offsetTopExtended, offsetLeftExtended);
        document.body["onclick"] = function() {
        ULSvmd:
            ;
            OnPickerFinish(fieldelm);
        };
    }
}
function clickDatePickerHelper(textboxid, iframeid, objImage, datestr, iframesrc, OnSelectDateCallback, onpickerfinishcallback, targetAttribute, offsetTopExtended, offsetLeftExtended) {
ULSvmd:
    ;
    var strCurrentResultFieldId = "";

    if (typeof this.Picker != 'undefined' && this.Picker != null) {
        var picker = this.Picker;

        picker.style.display = "none";
        if (typeof picker.resultfield != 'undefined') {
            var resultfield = picker.resultfield;

            strCurrentResultFieldId = resultfield.id;
        }
        if (typeof picker.resultfunc != 'undefined' && picker.resultfunc != null) {
            picker.resultfunc();
        }
        this.Picker = null;
    }
    if (strCurrentResultFieldId == textboxid) {
        return;
    }
    if (textboxid != null) {
        this.Picker = document.getElementById(iframeid);
        if (this.Picker == null)
            return;
        g_scrollLeft = document.body.scrollLeft;
        g_scrollTop = document.body.scrollTop;
        var div = document.getElementById("s4-workspace");

        this.Picker.v4WorkSpaceDivScrollWidth = Boolean(div) ? div.scrollWidth : 0;
        if (Boolean(this.Picker.attachEvent)) {
            this.Picker.attachEvent("onreadystatechange", OnIframeLoadFinish);
        }
        else if (Boolean(this.Picker.addEventListener)) {
            this.Picker.Picker = this.Picker;
            this.Picker["readyState"] = "complete";
            this.Picker.addEventListener("load", OnIframeLoadFinish, false);
        }
        this.Picker.resultfield = document.getElementById(textboxid);
        this.Picker.OnSelectDateCallback = OnSelectDateCallback;
        this.Picker.resultfunc = onpickerfinishcallback;
        this.Picker.firstUp = true;
        var strNewPickerSrc = PageUrlValidation(iframesrc) + escapeProperly(datestr);

        this.Picker.src = strNewPickerSrc;
        this.Picker.style.display = "block";
        var offsetParent = this.Picker.offsetParent;

        this.Picker.style.display = "none";
        var iframeTop = getOffsetTop(objImage, 1);
        var iframeLeft = getOffsetLeft(objImage, 1);
        var containerTop = getOffsetTop(offsetParent, 1);
        var containerLeft = getOffsetLeft(offsetParent, 1);
        var nOffsetTopExtended = 0;
        var nOffsetLeftExtended = 0;

        if (targetAttribute != null) {
            this.Picker.targetAttribute = targetAttribute;
            if (!isNaN(offsetTopExtended))
                nOffsetTopExtended = Number(offsetTopExtended);
            if (!isNaN(offsetLeftExtended))
                nOffsetLeftExtended = Number(offsetLeftExtended);
        }
        this.Picker.style.top = String(iframeTop - containerTop + objImage.offsetHeight + nOffsetTopExtended + 1) + "px";
        if ((GetCurrentStyleDatepicker(this.Picker)).direction == "rtl")
            this.Picker.style.left = String(iframeLeft - containerLeft - nOffsetLeftExtended + 1) + "px";
        else
            this.Picker.leftBeforeFlip = String(iframeLeft - containerLeft + objImage.offsetWidth + nOffsetLeftExtended + 1) + "px";
    }
}
function ClickDay(date) {
ULSvmd:
    ;
    var ifrm = GetIframe();

    if (ifrm == null) {
        DP_MoveToDate(date);
    }
    else {
        var resultfield = ifrm['resultfield'];
        var eltValidator = (GetParentWindow()).parent.document.getElementById(resultfield.id + g_strDatePickerRangeValidatorID);

        if (eltValidator != null) {
            eltValidator.style.display = "none";
        }
        var OnSelectDateCallback = ifrm['OnSelectDateCallback'];

        OnSelectDateCallback(ifrm['resultfield'], date, ifrm['targetAttribute']);
        var resultfunc = ifrm['resultfunc'];

        resultfunc(ifrm['resultfield']);
        if (window.event != null) {
            window.event.returnValue = false;
        }
    }
}
function SetSelectedDate(date, td) {
    g_selectedDate = date;
    g_currentID = td.firstChild.id;
    td.className = "ms-picker-dayselected";
    setTimeout(function() {
    ULSvmd:
        ;
        setFocusDatepicker(td.firstChild);
    }, 0);
}
function DatePickerMouse(td, className) {
    if (td.firstChild.id != g_currentID)
        td.className = className;
}
function ClickDayTime(originalSelectedDate, offset) {
ULSvmd:
    ;
    if (originalSelectedDate == null && g_selectedDate == null) {
        alert(Strings.STS.L_DatePickerDateTimePleaseSelect);
    }
    else if (g_selectedDate == null) {
        g_selectedDate = originalSelectedDate;
    }
    var hoursDropDown = document.getElementById("DateHours" + offset);
    var minutesDropDown = document.getElementById("DateMinutes" + offset);
    var hours = String(hoursDropDown.selectedIndex);
    var minutes = String(minutesDropDown.selectedIndex * 5);

    if (hours.length == 1) {
        hours = "0" + hours;
    }
    if (minutes.length == 1) {
        minutes = "0" + minutes;
    }
    var selectedDateTime = g_selectedDate + " " + hours + ":" + minutes;

    ClickDay(selectedDateTime.toString());
}
function OnPickerFinish(resultfield) {
ULSvmd:
    ;
    if (resultfield != null) {
        if (typeof resultfield.ondatepickerclose != 'undefined' && Boolean(resultfield.ondatepickerclose)) {
            if (typeof resultfield.ondatepickerclose == 'function')
                resultfield.ondatepickerclose();
            else
                eval(resultfield.ondatepickerclose);
        }
    }
    clickDatePicker(null, "", "", null);
}
function OnSelectDate(resultfield, date, targetAttribute) {
    if (targetAttribute == null) {
        var autoPostBack = resultfield.attributes["AutoPostBack"];
        var shouldPostBack = autoPostBack != null && typeof autoPostBack.value != 'undefined' && autoPostBack.value == "1" && resultfield.value != date;
        var shouldNotifyChange = resultfield.value != date;

        resultfield.value = date;
        if (shouldNotifyChange && typeof resultfield.clientcontrolonvaluesetfrompicker == 'function')
            resultfield.clientcontrolonvaluesetfrompicker();
        if (shouldNotifyChange && typeof resultfield.onvaluesetfrompicker != 'undefined' && Boolean(resultfield.onvaluesetfrompicker) && !shouldPostBack) {
            if (typeof resultfield.onvaluesetfrompicker == 'function') {
                resultfield.onvaluesetfrompicker();
            }
            else {
                eval(resultfield.onvaluesetfrompicker);
            }
        }
        if (shouldPostBack)
            window.setTimeout(new Function("__doPostBack('" + resultfield.id + "','')"), 0);
    }
    else {
        resultfield[targetAttribute] = date;
        try {
            resultfield.fireEvent("onchange");
        }
        catch (exception) { }
    }
}
function ChangeDateTimeControlState(id, disable) {
ULSvmd:
    ;
    if (typeof g_strDateTimeControlIDs != 'undefined') {
        var elmDate = document.getElementById(g_strDateTimeControlIDs[id]);

        if (elmDate != null)
            elmDate.disabled = disable;
        var elmHours = document.getElementById(g_strDateTimeControlIDs[id] + "Hours");

        if (elmHours != null)
            elmHours.disabled = disable;
        var elmMinutes = document.getElementById(g_strDateTimeControlIDs[id] + "Minutes");

        if (elmMinutes != null)
            elmMinutes.disabled = disable;
        var elmImage = document.getElementById(g_strDateTimeControlIDs[id] + "DatePickerImage");

        if (elmImage != null) {
            if (disable)
                elmImage.src = "/_layouts/15/images/calendar_grey.gif";
            else
                elmImage.src = "/_layouts/15/images/calendar.gif";
        }
    }
}
function EnableDateTimeControl(id) {
ULSvmd:
    ;
    ChangeDateTimeControlState(id, false);
}
function DisableDateTimeControl(id) {
ULSvmd:
    ;
    ChangeDateTimeControlState(id, true);
}
function OnIframeLoadFinish() {
ULSvmd:
    ;
    var picker;

    if (typeof this.Picker != 'undefined')
        picker = this.Picker;
    if (picker != null && typeof picker.readyState != 'undefined' && picker.readyState != null && picker.readyState == "complete") {
        document.body.scrollLeft = g_scrollLeft;
        document.body.scrollTop = g_scrollTop;
        picker.style.display = "block";
        if (typeof document.frames != 'undefined' && Boolean(document.frames)) {
            var frame = document.frames[picker.id];

            if (frame != null && typeof frame.focus == 'function')
                frame.focus();
        }
        else {
            picker.focus();
        }
    }
}
function RecurPatternType_ShowDiv(bShow) {
ULSvmd:
    ;
    var item = document.getElementById("recurCustomDiv");

    if (item != null) {
        item.style.display = bShow ? 'block' : 'none';
    }
}
function RecurPatternType_ShowRecurType(id) {
ULSvmd:
    ;
    var key;
    var item;
    var a = ['recurDailyDiv', 'recurWeeklyDiv', 'recurMonthlyDiv', 'recurYearlyDiv'];

    for (key in a) {
        item = document.getElementById(a[key]);
        if (item != null) {
            item.style.display = 'none';
        }
    }
    var itemID = document.getElementById(id);

    item = document.getElementById(a[Number(itemID.value) - 2]);
    if (item != null) {
        item.style.display = 'block';
    }
    RecurPatternType_ShowDiv(Number(itemID.value) == 6 ? false : true);
    if (Number(itemID.value) != 6 && g_warnonce == 0) {
        alert(Strings.STS.L_WarnkOnce_text);
        g_warnonce++;
    }
}
function RecurType_SetRadioButton1(id) {
ULSvmd:
    ;
    var itemID = document.getElementById(id);

    if (itemID != null) {
        itemID.checked = true;
    }
}
function RecurType_SetRadioButton(trobj, idValue) {
    if (trobj == null)
        return;
    var trChildren = trobj.childNodes;
    var trChildrenLength = trChildren.length;

    for (var childIdx = 0; childIdx < trChildrenLength; childIdx++) {
        var childtd1 = trChildren[childIdx];

        if (childtd1.nodeType == 1) {
            var str = childtd1.innerHTML;

            str = str.substr(str.indexOf("id=") + 3);
            str = str.substr(0, str.indexOf(" "));
            if (str.indexOf(idValue) > 0) {
                if (str.length > 2 && str.charAt(0) == '"') {
                    str = str.substr(1);
                    str = str.substr(0, str.length - 1);
                }
                var itemID = document.getElementById(str);

                if (itemID != null) {
                    itemID.checked = true;
                }
            }
            return;
        }
    }
}
$_global_datepicker();
