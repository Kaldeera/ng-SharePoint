angular.module('ngSharePoint.templates', ['templates/error.html', 'templates/form-templates/spfield-attachments-display.html', 'templates/form-templates/spfield-attachments-edit.html', 'templates/form-templates/spfield-boolean-display.html', 'templates/form-templates/spfield-boolean-edit.html', 'templates/form-templates/spfield-choice-display.html', 'templates/form-templates/spfield-choice-edit.html', 'templates/form-templates/spfield-control-loading.html', 'templates/form-templates/spfield-control.html', 'templates/form-templates/spfield-currency-display.html', 'templates/form-templates/spfield-currency-edit.html', 'templates/form-templates/spfield-datetime-display.html', 'templates/form-templates/spfield-datetime-edit.html', 'templates/form-templates/spfield-description.html', 'templates/form-templates/spfield-label.html', 'templates/form-templates/spfield-lookup-display.html', 'templates/form-templates/spfield-lookup-edit.html', 'templates/form-templates/spfield-lookupmulti-display.html', 'templates/form-templates/spfield-lookupmulti-edit.html', 'templates/form-templates/spfield-multichoice-display.html', 'templates/form-templates/spfield-multichoice-edit.html', 'templates/form-templates/spfield-note-display.html', 'templates/form-templates/spfield-note-edit.html', 'templates/form-templates/spfield-number-display.html', 'templates/form-templates/spfield-number-edit.html', 'templates/form-templates/spfield-text-display.html', 'templates/form-templates/spfield-text-edit.html', 'templates/form-templates/spfield-url-display.html', 'templates/form-templates/spfield-url-edit.html', 'templates/form-templates/spfield-user-display.html', 'templates/form-templates/spfield-user-edit.html', 'templates/form-templates/spfield-validation-messages.html', 'templates/form-templates/spfield.html', 'templates/form-templates/spform-default.html', 'templates/form-templates/spform-toolbar.html', 'templates/form-templates/spform.html', 'templates/scroll.html', 'templates/spworking-on-it.html']);

angular.module("templates/error.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("templates/error.html",
    "<h3>Error!!</h3>\n" +
    "");
}]);

angular.module("templates/form-templates/spfield-attachments-display.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("templates/form-templates/spfield-attachments-display.html",
    "<div ng-repeat=\"file in attachmentFiles\">\n" +
    "	<a ng-href=\"{{file.ServerRelativeUrl}}\" ng-bind=\"file.FileName\"></a>\n" +
    "</div>");
}]);

angular.module("templates/form-templates/spfield-attachments-edit.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("templates/form-templates/spfield-attachments-edit.html",
    "<div>\n" +
    "	<table border=\"0\" cellpadding=\"0\" cellspacing=\"0\" ng-style=\"{ true: { 'margin-bottom': '10px' } }[attachmentFiles.length > 0]\">\n" +
    "		<tbody>\n" +
    "			<tr ng-repeat=\"file in attachmentFiles\">\n" +
    "				<td class=\"ms-vb\" style=\"white-space: nowrap;\">\n" +
    "					<span ng-if=\"file.ServerRelativeUrl\"><a ng-href=\"{{file.ServerRelativeUrl}}\" ng-bind=\"file.FileName\"></a></span>\n" +
    "					<span ng-if=\"!file.ServerRelativeUrl\" ng-bind=\"file.FileName\"></span>\n" +
    "				</td>\n" +
    "				<td class=\"ms-propertysheet\" style=\"white-space: nowrap; padding-left: 20px;\">\n" +
    "					<img alt=\"Eliminar\" src=\"/_layouts/15/images/rect.gif?rev=23\">&nbsp;<a href=\"#\" ng-click=\"removeAttachment($index, file.local)\">&nbsp;{{DeleteAttachmentText}}</a>\n" +
    "				</td>\n" +
    "			</tr>\n" +
    "		</tbody>\n" +
    "	</table>\n" +
    "\n" +
    "	<a href=\"#\" file-select=\"onFileSelect($files, $event)\" data-multiple=\"true\">\n" +
    "		<span style=\"width: 16px; height: 16px; overflow: hidden; display: inline-block; position: relative; top: 3px;\">\n" +
    "			<img alt=\"\" ng-src=\"/_layouts/15/{{L_Menu_LCID}}/images/formatmap16x16.png?rev=23\" style=\"position: absolute; top: -235px; left: -235px;\" />\n" +
    "		</span>\n" +
    "		<span ng-bind=\"AttachFileText\"></span>\n" +
    "	</a>\n" +
    "</div>\n" +
    "<spfield-validation-messages></spfield-validation-messages>");
}]);

angular.module("templates/form-templates/spfield-boolean-display.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("templates/form-templates/spfield-boolean-display.html",
    "<div ng-bind=\"displayValue\" class=\"field-display-value\"></div>");
}]);

angular.module("templates/form-templates/spfield-boolean-edit.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("templates/form-templates/spfield-boolean-edit.html",
    "<input type=\"checkbox\" ng-model=\"value\" />\n" +
    "<spfield-validation-messages></spfield-validation-messages>\n" +
    "");
}]);

angular.module("templates/form-templates/spfield-choice-display.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("templates/form-templates/spfield-choice-display.html",
    "<div ng-bind=\"value\" class=\"field-display-value\"></div>");
}]);

angular.module("templates/form-templates/spfield-choice-edit.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("templates/form-templates/spfield-choice-edit.html",
    "<div ng-switch=\"schema.EditFormat\">\n" +
    "\n" +
    "	<select ng-switch-when=\"0\" ng-model=\"$parent.value\" data-spfield-focus-element=\"true\" ng-options=\"option for option in choices\" ng-required=\"{{schema.Required}}\" title=\"{{schema.Title}}\" class=\"ms-RadioText\" ></select>\n" +
    "\n" +
    "	<table ng-switch-when=\"1\" cellpadding=\"0\" cellspacing=\"1\">\n" +
    "		<tbody>\n" +
    "			<tr ng-repeat=\"option in choices\">\n" +
    "				<td>\n" +
    "					<span>\n" +
    "						<input type=\"radio\" ng-model=\"$parent.$parent.value\" ng-value=\"option\" id=\"{{schema.InternalName}}_{{$index}}\" />\n" +
    "						<label for=\"{{schema.InternalName}}_{{$index}}\" ng-bind=\"option\"></label>\n" +
    "					</span>\n" +
    "				</td>\n" +
    "			</tr>\n" +
    "		</tbody>\n" +
    "	</table>\n" +
    "\n" +
    "</div>\n" +
    "<spfield-validation-messages></spfield-validation-messages>");
}]);

angular.module("templates/form-templates/spfield-control-loading.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("templates/form-templates/spfield-control-loading.html",
    "<div><img src=\"/_layouts/15/images/loadingcirclests16.gif\" alt=\"\" /></div>");
}]);

angular.module("templates/form-templates/spfield-control.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("templates/form-templates/spfield-control.html",
    "<div dir=\"{{schema.Direction}}\"></div>");
}]);

angular.module("templates/form-templates/spfield-currency-display.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("templates/form-templates/spfield-currency-display.html",
    "<div ng-bind=\"value.toFixed(cultureInfo.numberFormat.CurrencyDecimalDigits) + ' ' + cultureInfo.numberFormat.CurrencySymbol\" class=\"field-display-value\"></div>");
}]);

angular.module("templates/form-templates/spfield-currency-edit.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("templates/form-templates/spfield-currency-edit.html",
    "<input type=\"text\" ng-model=\"value\" data-spfield-focus-element=\"true\" maxlength=\"{{schema.MaxLength}}\" ng-required=\"{{schema.Required}}\" size=\"11\" title=\"{{schema.Title}}\" class=\"ms-input\" style=\"ime-mode: inactive\" />\n" +
    "<span>&nbsp;{{cultureInfo.numberFormat.CurrencySymbol}}</span>\n" +
    "<br/>\n" +
    "<spfield-validation-messages></spfield-validation-messages>");
}]);

angular.module("templates/form-templates/spfield-datetime-display.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("templates/form-templates/spfield-datetime-display.html",
    "<div ng-bind=\"dateModel | date:cultureInfo.dateTimeFormat.ShortDatePattern + (schema.DisplayFormat == 0 ? '' :  ' ' + cultureInfo.dateTimeFormat.ShortTimePattern)\" class=\"field-display-value\"></div>");
}]);

angular.module("templates/form-templates/spfield-datetime-edit.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("templates/form-templates/spfield-datetime-edit.html",
    "<table id=\"{{idPrefix}}_$DateTimeFieldTopTable\" border=\"0\" cellpadding=\"0\" cellspacing=\"0\">\n" +
    "	<tbody>\n" +
    "		<tr>\n" +
    "			<td class=\"ms-dtinput\">\n" +
    "				<label for=\"{{idPrefix}}_$DateTimeFieldDate\" style=\"display:none\">{{STSHtmlEncode(StBuildParam(Strings.STS.L_DateTimeFieldDateLabel, schema.InternalName))}}</label>\n" +
    "				<input type=\"text\" ng-model=\"dateOnlyModel\" maxlength=\"45\" id=\"{{idPrefix}}_$DateTimeFieldDate\" title=\"{{schema.Title}}\" class=\"ms-input\" autopostback=\"0\" />\n" +
    "			</td>\n" +
    "			<td class=\"ms-dtinput\">\n" +
    "				<a href=\"\" ng-click=\"showDatePicker($event)\">\n" +
    "					<img id=\"{{idPrefix}}_$DateTimeFieldDate{{DatePickerImageID}}\" src=\"/_layouts/15/images/calendar.gif\" border=\"0\" alt=\"{{STSHtmlEncode(Strings.STS.L_DateTimeFieldSelectTitle)}}\"/>\n" +
    "				</a>\n" +
    "			</td>\n" +
    "			<td>\n" +
    "				<iframe id=\"{{idPrefix}}_$DateTimeFieldDate{{DatePickerFrameID}}\" src=\"/_layouts/15/images/blank.gif\" frameborder=\"0\" scrolling=\"no\" style=\"display:none; position:absolute; width:200px; z-index:101;\" title=\"{{STSHtmlEncode(Strings.STS.L_DateTimeFieldSelectTitle)}}\"></iframe>\n" +
    "			</td>\n" +
    "			<td class=\"ms-dttimeinput\" nowrap=\"nowrap\" ng-if=\"schema.DisplayFormat == 1\">\n" +
    "				<label for=\"{{idPrefix}}_$DateTimeFieldDateHours\" style=\"display:none\">{{STSHtmlEncode(StBuildParam(Strings.STS.L_DateTimeFieldDateHoursLabel, _myData.fieldName))}}</label>\n" +
    "				<select id=\"{{idPrefix}}_$DateTimeFieldDateHours\" ng-model=\"$parent.hoursModel\" ng-options=\"hour for hour in hours\" dir=\"{{direction}}\"></select>\n" +
    "				<label for=\"{{idPrefix}}_$DateTimeFieldDateMinutes\" style=\"display:none\">{{STSHtmlEncode(StBuildParam(Strings.STS.L_DateTimeFieldDateMinutesLabel, _myData.fieldName))}}</label>\n" +
    "				<select id=\"{{idPrefix}}_$DateTimeFieldDateMinutes\" ng-model=\"$parent.minutesModel\" ng-options=\"minute for minute in minutes\" dir=\"{{direction}}\"></select>\n" +
    "			</td>\n" +
    "		</tr>\n" +
    "	</tbody>\n" +
    "</table>\n" +
    "<spfield-validation-messages></spfield-validation-messages>");
}]);

angular.module("templates/form-templates/spfield-description.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("templates/form-templates/spfield-description.html",
    "<span class=\"ms-metadata\" ng-bind-html=\"schema.Description | newlines\" ng-if=\"currentMode == 'edit'\"></span>");
}]);

angular.module("templates/form-templates/spfield-label.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("templates/form-templates/spfield-label.html",
    "<h3 class=\"ms-standardheader\"><nobr>{{label}}<span class=\"ms-accentText\" title=\"This is a required field.\" ng-show=\"schema.Required && currentMode == 'edit'\"> *</span></nobr></h3>");
}]);

angular.module("templates/form-templates/spfield-lookup-display.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("templates/form-templates/spfield-lookup-display.html",
    "<a ng-href=\"{{lookupItem.url}}\" ng-bind=\"lookupItem.Title\"></a>");
}]);

angular.module("templates/form-templates/spfield-lookup-edit.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("templates/form-templates/spfield-lookup-edit.html",
    "<div><select title=\"{{schema.Title}}\" ng-model=\"value\" ng-options=\"item.Id as item[schema.LookupField] for item in lookupItems\" ng-change=\"valueChanged()\"></select></div>\n" +
    "<spfield-validation-messages></spfield-validation-messages>");
}]);

angular.module("templates/form-templates/spfield-lookupmulti-display.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("templates/form-templates/spfield-lookupmulti-display.html",
    "<div><span ng-repeat=\"item in selectedLookupItems\"><a ng-href=\"{{item.url}}\" ng-bind=\"item.Title\"></a>{{!$last ? '; ' : ''}}</span></div>");
}]);

angular.module("templates/form-templates/spfield-lookupmulti-edit.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("templates/form-templates/spfield-lookupmulti-edit.html",
    "<table id=\"{{idPrefix}}_MultiLookup_topTable\" class=\"ms-long\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\">\n" +
    "	<tbody>\n" +
    "		<tr>\n" +
    "			<td class=\"ms-input\">\n" +
    "				<select id=\"{{idPrefix}}_SelectCandidate\" ng-model=\"selectedCandidateItems\" ng-options=\"item as item.name for item in candidateItems | orderBy:'name'\" multiple=\"multiple\" title=\"{{candidateAltText}}\" style=\"width:143px; height:125px; overflow:scroll;\" ng-focus=\"selectedResultItems = []\" ng-dblclick=\"addItems()\"></select>\n" +
    "			</td>\n" +
    "			<td style=\"padding-left:10px\"></td>\n" +
    "			<td align=\"center\" valign=\"middle\" class=\"ms-input ms-noWrap\">\n" +
    "				<input type=\"button\" id=\"{{idPrefix}}_AddButton\" class=\"ms-ButtonHeightWidth\" value=\"{{addButtonText}}\" ng-disabled=\"selectedCandidateItems.length == 0\" ng-click=\"addItems()\" />\n" +
    "				<br/>\n" +
    "				<br/>\n" +
    "				<input type=\"button\" id=\"{{idPrefix}}_RemoveButton\" class=\"ms-ButtonHeightWidth\" value=\"{{removeButtonText}}\" ng-disabled=\"selectedResultItems.length == 0\" ng-click=\"removeItems()\" />\n" +
    "			</td>\n" +
    "			<td style=\"padding-left:10px\"></td>\n" +
    "			<td class=\"ms-input\">\n" +
    "				<select id=\"{{idPrefix}}_SelectResult\" ng-model=\"selectedResultItems\" ng-options=\"item as item.name for item in resultItems | orderBy: 'name'\" multiple=\"multiple\" title=\"{{resultAltText}}\" style=\"width:143px;height:125px;overflow:scroll;\" ng-focus=\"selectedCandidateItems = []\" ng-dblclick=\"removeItems()\"></select>\n" +
    "			</td>\n" +
    "		</tr>\n" +
    "	</tbody>\n" +
    "</table>\n" +
    "<spfield-validation-messages></spfield-validation-messages>");
}]);

angular.module("templates/form-templates/spfield-multichoice-display.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("templates/form-templates/spfield-multichoice-display.html",
    "<div ng-bind=\"value.results.join('; ')\" class=\"field-display-value\"></div>");
}]);

angular.module("templates/form-templates/spfield-multichoice-edit.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("templates/form-templates/spfield-multichoice-edit.html",
    "<table cellpadding=\"0\" cellspacing=\"1\">\n" +
    "	<tbody>\n" +
    "		<tr ng-repeat=\"choice in schema.Choices.results\">\n" +
    "			<td>\n" +
    "				<span class=\"ms-RadioText\" title=\"{{choice}}\">\n" +
    "					<input type=\"checkbox\" id=\"{{schema.Title}}_{{$index}}\" ng-click=\"toggleCheckbox(choice)\" ng-checked=\"choices.indexOf(choice) != -1\" />\n" +
    "					<label for=\"{{schema.Title}}_{{$index}}\">{{choice}}</label>\n" +
    "				</span>\n" +
    "			</td>\n" +
    "		</tr>\n" +
    "	</tbody>\n" +
    "</table>\n" +
    "<spfield-validation-messages></spfield-validation-messages>");
}]);

angular.module("templates/form-templates/spfield-note-display.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("templates/form-templates/spfield-note-display.html",
    "<div ng-bind-html=\"value | unsafe\" class=\"field-display-value\"></div>");
}]);

angular.module("templates/form-templates/spfield-note-edit.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("templates/form-templates/spfield-note-edit.html",
    "<span dir=\"ltr\">\n" +
    "	<textarea ng-model=\"value\" data-spfield-focus-element=\"true\" ng-required=\"{{schema.Required}}\" rows=\"{{schema.NumberOfLines}}\" cols=\"20\" title=\"{{schema.Title}}\" class=\"ms-long\" style=\"width: 100%\"></textarea>\n" +
    "</span>\n" +
    "<br/>\n" +
    "<spfield-validation-messages></spfield-validation-messages>\n" +
    "<div class=\"ms-formdescription\" ng-if=\"schema.RichText && currentMode == 'edit'\">\n" +
    "    <a href=\"javascript:HelpWindowKey('nsrichtext')\">Click for help about adding basic HTML formatting.</a>\n" +
    "</div>\n" +
    "");
}]);

angular.module("templates/form-templates/spfield-number-display.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("templates/form-templates/spfield-number-display.html",
    "<div ng-bind=\"(schema.Percentage ? (value * 100).toFixed(schema.Decimals) + ' ' + cultureInfo.numberFormat.PercentSymbol : value.toFixed(schema.Decimals))\" class=\"field-display-value\"></div>");
}]);

angular.module("templates/form-templates/spfield-number-edit.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("templates/form-templates/spfield-number-edit.html",
    "<input type=\"text\" ng-model=\"value\" data-spfield-focus-element=\"true\" sp-percentage=\"{{schema.Percentage}}\" ng-required=\"{{schema.Required}}\" min=\"{{schema.MinimumValue}}\" max=\"{{schema.MaximumValue}}\" size=\"11\" title=\"{{schema.Title}}\" class=\"ms-input\" style=\"ime-mode: inactive\" />\n" +
    "<span ng-if=\"schema.Percentage\">&nbsp;{{cultureInfo.numberFormat.PercentSymbol}}</span>\n" +
    "<br/>\n" +
    "<spfield-validation-messages></spfield-validation-messages>");
}]);

angular.module("templates/form-templates/spfield-text-display.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("templates/form-templates/spfield-text-display.html",
    "<div ng-bind=\"value\" class=\"field-display-value\"></div>");
}]);

angular.module("templates/form-templates/spfield-text-edit.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("templates/form-templates/spfield-text-edit.html",
    "<input type=\"text\" ng-model=\"value\" data-spfield-focus-element=\"true\" maxlength=\"{{schema.MaxLength}}\" ng-maxlength=\"{{schema.MaxLength}}\" ng-required=\"{{schema.Required}}\" title=\"{{schema.Title}}\" class=\"ms-long ms-spellcheck-true\" style=\"width: 100%\" />\n" +
    "<br/>\n" +
    "<spfield-validation-messages></spfield-validation-messages>\n" +
    "");
}]);

angular.module("templates/form-templates/spfield-url-display.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("templates/form-templates/spfield-url-display.html",
    "<div>\n" +
    "	<a ng-href=\"{{value.Url}}\" ng-bind=\"value.Description\" target=\"_blank\" ng-if=\"schema.DisplayFormat == 0\"></a>\n" +
    "	<img ng-src=\"{{value.Url}}\" alt=\"{{value.Description}}\" ng-if=\"schema.DisplayFormat == 1\"/>\n" +
    "</div>");
}]);

angular.module("templates/form-templates/spfield-url-edit.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("templates/form-templates/spfield-url-edit.html",
    "<div>\n" +
    "	<div class=\"ms-formdescription\">{{UrlFieldTypeText}}&nbsp;(<a id=\"{{schema.InternalName}}_{{schema.Id}}_$UrlControlId\" href=\"javascript:TestURL('{{schema.InternalName}}_{{schema.Id}}_$UrlFieldUrl')\" target=\"_self\">{{UrlFieldClickText}}</a>)</div>\n" +
    "	<input dir=\"ltr\" type=\"text\" ng-model=\"value.Url\" data-spfield-focus-element=\"true\" ng-required=\"{{schema.Required}}\" id=\"{{schema.InternalName}}_{{schema.Id}}_$UrlFieldUrl\" title=\"{{schema.Title}}\" class=\"ms-long\">\n" +
    "	<div class=\"ms-formdescription\">{{UrlFieldTypeDescription}}&nbsp;</div>\n" +
    "	<input type=\"text\" maxlength=\"255\" id=\"{{schema.InternalName}}_{{schema.Id}}_$UrlFieldDescription\" title=\"{{Description_Text}}\" ng-model=\"value.Description\" class=\"ms-long\">\n" +
    "	<input type=\"text\" ng-model=\"value.Description\" maxlength=\"255\" id=\"{{schema.InternalName}}_{{schema.Id}}_$UrlFieldDescription\" title=\"{{Description_Text}}\" class=\"ms-long\">\n" +
    "</div>\n" +
    "<spfield-validation-messages></spfield-validation-messages>");
}]);

angular.module("templates/form-templates/spfield-user-display.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("templates/form-templates/spfield-user-display.html",
    "<div>\n" +
    "	<div class=\"ms-vb\" ng-repeat=\"item in selectedUserItems\">\n" +
    "		<nobr ng-if=\"schema.LookupField == 'ImnName' && item.Title != ''\">\n" +
    "			<span class=\"ms-imnSpan\">\n" +
    "				<a href=\"\" ng-click=\"IMNImageOnClick($event)\" class=\"ms-imnlink ms-spimn-presenceLink\" tabindex=\"-1\">\n" +
    "					<span class=\"ms-spimn-presenceWrapper ms-imnImg ms-spimn-imgSize-10x10\">\n" +
    "						<img title=\"\" alt=\"{{noUserPresenceAlt}}\" name=\"imnmark\" class=\"ms-spimn-img ms-spimn-presence-disconnected-10x10x32\" showofflinepawn=\"1\" src=\"/_layouts/15/images/spimn.png\" sip=\"\" id=\"imn0,type=sip\" />\n" +
    "					</span>\n" +
    "				</a>\n" +
    "			</span>\n" +
    "			<span class=\"ms-noWrap ms-imnSpan\">\n" +
    "				<a href=\"\" ng-click=\"IMNImageOnClick($event)\" class=\"ms-imnlink\" tabindex=\"-1\">\n" +
    "					<img title=\"\" alt=\"{{noUserPresenceAlt}}\" name=\"imnmark\" class=\"ms-hide\" showofflinepawn=\"1\" src=\"/_layouts/15/images/spimn.png\" sip=\"\" id=\"imn1,type=sip\"/>\n" +
    "				</a>\n" +
    "				<a ng-click=\"GoToLinkOrDialogNewWindow(this)\" class=\"ms-peopleux-userdisplink ms-subtleLink\" ng-href=\"{{item.url}}\" ng-bind=\"item.Title\"></a>\n" +
    "			</span>\n" +
    "		</nobr>\n" +
    "	</div>\n" +
    "\n" +
    "	<div ng-if=\"schema.LookupField != 'ImnName'\">\n" +
    "		<span ng-repeat=\"item in selectedUserItems\"><a ng-href=\"{{item.url}}\" ng-bind=\"item.Title\"></a>{{!$last ? '; ' : ''}}</span>\n" +
    "	</div>\n" +
    "</div>");
}]);

angular.module("templates/form-templates/spfield-user-edit.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("templates/form-templates/spfield-user-edit.html",
    "<div id=\"{{idPrefix}}_$ClientPeoplePicker\"></div>\n" +
    "<spfield-validation-messages></spfield-validation-messages>");
}]);

angular.module("templates/form-templates/spfield-validation-messages.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("templates/form-templates/spfield-validation-messages.html",
    "<div class=\"ms-formvalidation ms-csrformvalidation\" ng-show=\"modelCtrl.$dirty && modelCtrl.$invalid\">\n" +
    "    <span ng-show=\"modelCtrl.$error.required\" role=\"alert\">{{SPClientRequiredValidatorError}}</span>\n" +
    "    <span ng-show=\"modelCtrl.$error.url\" role=\"alert\">Url error.</span>\n" +
    "    <span ng-show=\"modelCtrl.$error.number\" role=\"alert\">Number error.</span>\n" +
    "    <span ng-show=\"modelCtrl.$error.unique\" role=\"alert\">Unique error.</span>\n" +
    "</div>");
}]);

angular.module("templates/form-templates/spfield.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("templates/form-templates/spfield.html",
    "<div class=\"{{classAttr}}\" style=\"display: table-row; width: 100%;\">\n" +
    "    <div class=\"ms-formlabel spfield-label\" style=\"display: table-cell; vertical-align: top; width: 113px;\">\n" +
    "        <spfield-label {{attributes}}></spfield-label>\n" +
    "    </div>\n" +
    "    <div class=\"ms-formbody spfield-body\" style=\"display: table-cell; vertical-align: top; width: 350px;\">\n" +
    "        <spfield-control {{attributes}}></spfield-control>\n" +
    "        <spfield-description {{attributes}}></spfield-description>\n" +
    "    </div>\n" +
    "</div>\n" +
    "");
}]);

angular.module("templates/form-templates/spform-default.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("templates/form-templates/spform-default.html",
    "<div ng-repeat=\"field in fields\" spfield=\"{{field.InternalName}}\"></div>\n" +
    "<spform-toolbar></spform-toolbar>\n" +
    "");
}]);

angular.module("templates/form-templates/spform-toolbar.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("templates/form-templates/spform-toolbar.html",
    "<div>\n" +
    "	<div ng-if=\"!isInDesignMode && formStatus == status.IDLE\">\n" +
    "		<!-- Form Toolbar DISPLAY MODE -->\n" +
    "		<table cellpadding=\"0\" cellspacing=\"0\" width=\"100%\" style=\"padding-top: 7px\" ng-if=\"mode == 'display'\">\n" +
    "			<tbody>\n" +
    "				<tr>\n" +
    "					<td width=\"100%\">\n" +
    "						<!--\n" +
    "						<input name=\"ctl00$ctl28$g_e2bc9482_4bc2_4158_98ba_504fcc7169d8$ctl00$ctl08$ctl00$owshiddenversion\" type=\"HIDDEN\" id=\"ctl00_ctl28_g_e2bc9482_4bc2_4158_98ba_504fcc7169d8_ctl00_ctl08_ctl00_owshiddenversion\"/>\n" +
    "						-->\n" +
    "						<table class=\"ms-formtoolbar\" cellpadding=\"2\" cellspacing=\"0\" border=\"0\" id=\"ctl00_ctl28_g_e2bc9482_4bc2_4158_98ba_504fcc7169d8_ctl00_toolBarTbl\" width=\"100%\">\n" +
    "							<tbody>\n" +
    "								<tr>\n" +
    "									<!--\n" +
    "									<td class=\"ms-toolbar\" nowrap=\"nowrap\">\n" +
    "										<table cellpadding=\"0\" cellspacing=\"0\">\n" +
    "											<tbody>\n" +
    "												<tr>\n" +
    "													<td class=\"ms-descriptiontext\" id=\"onetidinfoblockV\">Version: 26.0</td>\n" +
    "												</tr>\n" +
    "												<tr>\n" +
    "													<td nowrap=\"nowrap\" class=\"ms-descriptiontext\" id=\"onetidinfoblock1\">\n" +
    "														<span id=\"ctl00_ctl28_g_e2bc9482_4bc2_4158_98ba_504fcc7169d8_ctl00_toolBarTbl_RptControls_ctl00_ctl00_ctl02\">\n" +
    "															Created  at 6/26/2014 6:44 PM&amp;nbsp; by\n" +
    "															<nobr>\n" +
    "																<span class=\"ms-imnSpan\">\n" +
    "																	<a href=\"#\" onclick=\"IMNImageOnClick(event); return false;\" class=\"ms-imnlink ms-spimn-presenceLink\" tabindex=\"-1\">\n" +
    "																		<span class=\"ms-spimn-presenceWrapper ms-imnImg ms-spimn-imgSize-10x10\">\n" +
    "																			<img title=\"\" alt=\"No presence information\" name=\"imnmark\" class=\"ms-spimn-img ms-spimn-presence-disconnected-10x10x32\" showofflinepawn=\"1\" src=\"/_layouts/15/images/spimn.png\" sip=\"alguien@example.com\" id=\"imn0,type=sip\"/>\n" +
    "																		</span>\n" +
    "																	</a>\n" +
    "																</span>\n" +
    "																<span class=\"ms-noWrap ms-imnSpan\">\n" +
    "																	<a href=\"#\" onclick=\"IMNImageOnClick(event); return false;\" class=\"ms-imnlink\" tabindex=\"-1\">\n" +
    "																		<img title=\"\" alt=\"No presence information\" name=\"imnmark\" class=\"ms-hide\" showofflinepawn=\"1\" src=\"/_layouts/15/images/spimn.png\" sip=\"alguien@example.com\" id=\"imn1,type=sip\"/>\n" +
    "																	</a>\n" +
    "																	<a onclick=\"GoToLinkOrDialogNewWindow(this); return false;\" class=\"ms-peopleux-userdisplink ms-subtleLink\" href=\"/_layouts/15/listform.aspx?PageType=4&amp;ListId={a12cca6c-a92e-495a-80ce-66f110b74735}&amp;ID=1\">0#.w|sp2013-01\\administrador</a>\n" +
    "																</span>\n" +
    "															</nobr>\n" +
    "														</span>\n" +
    "													</td>\n" +
    "												</tr>\n" +
    "												<tr>\n" +
    "													<td nowrap=\"nowrap\" class=\"ms-descriptiontext\" id=\"onetidinfoblock2\">\n" +
    "														<span id=\"ctl00_ctl28_g_e2bc9482_4bc2_4158_98ba_504fcc7169d8_ctl00_toolBarTbl_RptControls_ctl00_ctl00_ctl03\">\n" +
    "															Last modified at 7/14/2014 1:15 PM&amp;nbsp; by\n" +
    "															<nobr>\n" +
    "																<span class=\"ms-imnSpan\">\n" +
    "																	<a href=\"#\" onclick=\"IMNImageOnClick(event); return false;\" class=\"ms-imnlink ms-spimn-presenceLink\" tabindex=\"-1\">\n" +
    "																		<span class=\"ms-spimn-presenceWrapper ms-imnImg ms-spimn-imgSize-10x10\">\n" +
    "																			<img title=\"\" alt=\"No presence information\" name=\"imnmark\" class=\"ms-spimn-img ms-spimn-presence-disconnected-10x10x32\" showofflinepawn=\"1\" src=\"/_layouts/15/images/spimn.png\" sip=\"alguien@example.com\" id=\"imn2,type=sip\"/>\n" +
    "																		</span>\n" +
    "																	</a>\n" +
    "																</span>\n" +
    "																<span class=\"ms-noWrap ms-imnSpan\">\n" +
    "																	<a href=\"#\" onclick=\"IMNImageOnClick(event); return false;\" class=\"ms-imnlink\" tabindex=\"-1\">\n" +
    "																		<img title=\"\" alt=\"No presence information\" name=\"imnmark\" class=\"ms-hide\" showofflinepawn=\"1\" src=\"/_layouts/15/images/spimn.png\" sip=\"alguien@example.com\" id=\"imn3,type=sip\"/>\n" +
    "																	</a>\n" +
    "																	<a onclick=\"GoToLinkOrDialogNewWindow(this); return false;\" class=\"ms-peopleux-userdisplink ms-subtleLink\" href=\"/_layouts/15/listform.aspx?PageType=4&amp;ListId={a12cca6c-a92e-495a-80ce-66f110b74735}&amp;ID=1\">0#.w|sp2013-01\\administrador</a>\n" +
    "																</span>\n" +
    "															</nobr>\n" +
    "														</span>\n" +
    "													</td>\n" +
    "												</tr>\n" +
    "											</tbody>\n" +
    "										</table>\n" +
    "									</td>\n" +
    "									-->\n" +
    "									<td width=\"99%\" class=\"ms-toolbar\" nowrap=\"nowrap\">\n" +
    "										<img src=\"/_layouts/15/images/blank.gif\" width=\"1\" height=\"18\" alt=\"\"/>\n" +
    "									</td>\n" +
    "\n" +
    "									<td class=\"ms-toolbar\" nowrap=\"nowrap\">\n" +
    "										<!--\n" +
    "										<table cellpadding=\"0\" cellspacing=\"0\" width=\"100%\">\n" +
    "											<tbody>\n" +
    "												<tr>\n" +
    "													<td align=\"right\" width=\"100%\" nowrap=\"nowrap\">\n" +
    "														<input type=\"button\" name=\"ctl00$ctl28$g_e2bc9482_4bc2_4158_98ba_504fcc7169d8$ctl00$toolBarTbl$RightRptControls$ctl01$ctl00$diidIOGoBack\" value=\"Close\" onclick=\"STSNavigate('http:\\u002f\\u002fsp2013-01\\u002fLists\\u002fIssues\\u002fAllItems.aspx');return false;WebForm_DoPostBackWithOptions(new WebForm_PostBackOptions(&quot;ctl00$ctl28$g_e2bc9482_4bc2_4158_98ba_504fcc7169d8$ctl00$toolBarTbl$RightRptControls$ctl01$ctl00$diidIOGoBack&quot;, &quot;&quot;, true, &quot;&quot;, &quot;&quot;, false, true))\" id=\"ctl00_ctl28_g_e2bc9482_4bc2_4158_98ba_504fcc7169d8_ctl00_toolBarTbl_RightRptControls_ctl01_ctl00_diidIOGoBack\" accesskey=\"C\" class=\"ms-ButtonHeightWidth\" target=\"_self\"/>								\n" +
    "													</td>\n" +
    "												</tr>\n" +
    "											</tbody>\n" +
    "										</table>\n" +
    "										-->\n" +
    "										<input type=\"button\" value=\"{{CloseButtonCaption}}\" class=\"ms-ButtonHeightWidth\" ng-click=\"cancelForm()\" />\n" +
    "\n" +
    "									</td>\n" +
    "								</tr>\n" +
    "							</tbody>\n" +
    "						</table>\n" +
    "					</td>\n" +
    "				</tr>\n" +
    "			</tbody>\n" +
    "		</table>\n" +
    "\n" +
    "		<!-- Form Toolbar EDIT MODE -->\n" +
    "		<table cellpadding=\"0\" cellspacing=\"0\" width=\"100%\" style=\"padding-top: 7px\" ng-if=\"mode != 'display'\">\n" +
    "			<tbody>\n" +
    "				<tr>\n" +
    "					<td width=\"100%\">\n" +
    "						<!--\n" +
    "							<input name=\"ctl00$ctl28$g_ba9f6e2a_381a_4eeb_8d37_4d5b28b8f15a$ctl00$ctl08$ctl00$owshiddenversion\" type=\"HIDDEN\" id=\"ctl00_ctl28_g_ba9f6e2a_381a_4eeb_8d37_4d5b28b8f15a_ctl00_ctl08_ctl00_owshiddenversion\" value=\"25\"/>\n" +
    "						-->\n" +
    "						<table class=\"ms-formtoolbar\" cellpadding=\"2\" cellspacing=\"0\" border=\"0\" id=\"ctl00_ctl28_g_ba9f6e2a_381a_4eeb_8d37_4d5b28b8f15a_ctl00_toolBarTbl\" width=\"100%\">\n" +
    "							<tbody>\n" +
    "								<tr>\n" +
    "									<!--\n" +
    "									<td class=\"ms-toolbar\" nowrap=\"nowrap\">\n" +
    "										<table cellpadding=\"0\" cellspacing=\"0\">\n" +
    "											<tbody>\n" +
    "												<tr>\n" +
    "													<td class=\"ms-descriptiontext\" id=\"onetidinfoblockV\">Version: 25.0</td>\n" +
    "												</tr>\n" +
    "												<tr>\n" +
    "													<td nowrap=\"nowrap\" class=\"ms-descriptiontext\" id=\"onetidinfoblock1\">\n" +
    "														<span id=\"ctl00_ctl28_g_ba9f6e2a_381a_4eeb_8d37_4d5b28b8f15a_ctl00_toolBarTbl_RptControls_ctl00_ctl00_ctl02\">\n" +
    "															Created  at 6/26/2014 6:44 PM&nbsp; by\n" +
    "															<nobr>\n" +
    "																<span class=\"ms-imnSpan\">\n" +
    "																	<a href=\"#\" onclick=\"IMNImageOnClick(event); return false;\" class=\"ms-imnlink ms-spimn-presenceLink\" tabindex=\"-1\">\n" +
    "																		<span class=\"ms-spimn-presenceWrapper ms-imnImg ms-spimn-imgSize-10x10\">\n" +
    "																			<img title=\"\" alt=\"No presence information\" name=\"imnmark\" class=\"ms-spimn-img ms-spimn-presence-disconnected-10x10x32\" showofflinepawn=\"1\" src=\"/_layouts/15/images/spimn.png\" sip=\"alguien@example.com\" id=\"imn0,type=sip\"/>\n" +
    "																		</span>\n" +
    "																	</a>\n" +
    "																</span>\n" +
    "																<span class=\"ms-noWrap ms-imnSpan\">\n" +
    "																	<a href=\"#\" onclick=\"IMNImageOnClick(event); return false;\" class=\"ms-imnlink\" tabindex=\"-1\">\n" +
    "																		<img title=\"\" alt=\"No presence information\" name=\"imnmark\" class=\"ms-hide\" showofflinepawn=\"1\" src=\"/_layouts/15/images/spimn.png\" sip=\"alguien@example.com\" id=\"imn1,type=sip\"/>\n" +
    "																	</a>\n" +
    "																	<a onclick=\"GoToLinkOrDialogNewWindow(this); return false;\" class=\"ms-peopleux-userdisplink ms-subtleLink\" href=\"/_layouts/15/listform.aspx?PageType=4&amp;ListId={a12cca6c-a92e-495a-80ce-66f110b74735}&amp;ID=1\">0#.w|sp2013-01\\administrador</a>\n" +
    "																</span>\n" +
    "															</nobr>\n" +
    "														</span>\n" +
    "													</td>\n" +
    "												</tr>\n" +
    "												<tr>\n" +
    "													<td nowrap=\"nowrap\" class=\"ms-descriptiontext\" id=\"onetidinfoblock2\">\n" +
    "														<span id=\"ctl00_ctl28_g_ba9f6e2a_381a_4eeb_8d37_4d5b28b8f15a_ctl00_toolBarTbl_RptControls_ctl00_ctl00_ctl03\">\n" +
    "															Last modified at 7/14/2014 12:51 PM&nbsp; by\n" +
    "															<nobr>\n" +
    "																<span class=\"ms-imnSpan\">\n" +
    "																	<a href=\"#\" onclick=\"IMNImageOnClick(event); return false;\" class=\"ms-imnlink ms-spimn-presenceLink\" tabindex=\"-1\">\n" +
    "																		<span class=\"ms-spimn-presenceWrapper ms-imnImg ms-spimn-imgSize-10x10\">\n" +
    "																			<img title=\"\" alt=\"No presence information\" name=\"imnmark\" class=\"ms-spimn-img ms-spimn-presence-disconnected-10x10x32\" showofflinepawn=\"1\" src=\"/_layouts/15/images/spimn.png\" sip=\"alguien@example.com\" id=\"imn2,type=sip\"/>\n" +
    "																		</span>\n" +
    "																	</a>\n" +
    "																</span>\n" +
    "																<span class=\"ms-noWrap ms-imnSpan\">\n" +
    "																	<a href=\"#\" onclick=\"IMNImageOnClick(event); return false;\" class=\"ms-imnlink\" tabindex=\"-1\">\n" +
    "																		<img title=\"\" alt=\"No presence information\" name=\"imnmark\" class=\"ms-hide\" showofflinepawn=\"1\" src=\"/_layouts/15/images/spimn.png\" sip=\"alguien@example.com\" id=\"imn3,type=sip\"/>\n" +
    "																	</a>\n" +
    "																	<a onclick=\"GoToLinkOrDialogNewWindow(this); return false;\" class=\"ms-peopleux-userdisplink ms-subtleLink\" href=\"/_layouts/15/listform.aspx?PageType=4&amp;ListId={a12cca6c-a92e-495a-80ce-66f110b74735}&amp;ID=1\">0#.w|sp2013-01\\administrador</a>\n" +
    "																</span>\n" +
    "															</nobr>\n" +
    "														</span>\n" +
    "													</td>\n" +
    "												</tr>\n" +
    "											</tbody>\n" +
    "										</table>\n" +
    "									</td>\n" +
    "									-->\n" +
    "									<td width=\"99%\" class=\"ms-toolbar\" nowrap=\"nowrap\">\n" +
    "										<img src=\"/_layouts/15/images/blank.gif\" width=\"1\" height=\"18\" alt=\"\"/>\n" +
    "									</td>\n" +
    "\n" +
    "									<td class=\"ms-toolbar\" nowrap=\"nowrap\">\n" +
    "\n" +
    "										<!--\n" +
    "										<table cellpadding=\"0\" cellspacing=\"0\" width=\"100%\">\n" +
    "											<tbody>\n" +
    "												<tr>\n" +
    "													<td align=\"right\" width=\"100%\" nowrap=\"nowrap\">\n" +
    "														<input type=\"button\" name=\"ctl00$ctl28$g_ba9f6e2a_381a_4eeb_8d37_4d5b28b8f15a$ctl00$toolBarTbl$RightRptControls$ctl00$ctl00$diidIOSaveItem\" value=\"Save\" onclick=\"if (!PreSaveItem()) return false;if (SPClientForms.ClientFormManager.SubmitClientForm('WPQ2')) return false;WebForm_DoPostBackWithOptions(new WebForm_PostBackOptions(&quot;ctl00$ctl28$g_ba9f6e2a_381a_4eeb_8d37_4d5b28b8f15a$ctl00$toolBarTbl$RightRptControls$ctl00$ctl00$diidIOSaveItem&quot;, &quot;&quot;, true, &quot;&quot;, &quot;&quot;, false, true))\" id=\"ctl00_ctl28_g_ba9f6e2a_381a_4eeb_8d37_4d5b28b8f15a_ctl00_toolBarTbl_RightRptControls_ctl00_ctl00_diidIOSaveItem\" accesskey=\"O\" class=\"ms-ButtonHeightWidth\" target=\"_self\"/>\n" +
    "													</td>\n" +
    "												</tr>\n" +
    "											</tbody>\n" +
    "										</table>\n" +
    "										-->\n" +
    "										\n" +
    "										<input type=\"button\" value=\"{{SaveButtonCaption}}\" class=\"ms-ButtonHeightWidth\" ng-click=\"saveForm()\" />\n" +
    "\n" +
    "									</td>\n" +
    "\n" +
    "									<td class=\"ms-separator\">&nbsp;</td>\n" +
    "\n" +
    "									<td class=\"ms-toolbar\" nowrap=\"nowrap\">\n" +
    "\n" +
    "										<!--\n" +
    "										<table cellpadding=\"0\" cellspacing=\"0\" width=\"100%\">\n" +
    "											<tbody>\n" +
    "												<tr>\n" +
    "													<td align=\"right\" width=\"100%\" nowrap=\"nowrap\">\n" +
    "														<input type=\"button\" name=\"ctl00$ctl28$g_ba9f6e2a_381a_4eeb_8d37_4d5b28b8f15a$ctl00$toolBarTbl$RightRptControls$ctl01$ctl00$diidIOGoBack\" value=\"Cancel\" onclick=\"STSNavigate('http:\\u002f\\u002fsp2013-01\\u002fLists\\u002fIssues\\u002fAllItems.aspx');return false;WebForm_DoPostBackWithOptions(new WebForm_PostBackOptions(&quot;ctl00$ctl28$g_ba9f6e2a_381a_4eeb_8d37_4d5b28b8f15a$ctl00$toolBarTbl$RightRptControls$ctl01$ctl00$diidIOGoBack&quot;, &quot;&quot;, true, &quot;&quot;, &quot;&quot;, false, true))\" id=\"ctl00_ctl28_g_ba9f6e2a_381a_4eeb_8d37_4d5b28b8f15a_ctl00_toolBarTbl_RightRptControls_ctl01_ctl00_diidIOGoBack\" accesskey=\"C\" class=\"ms-ButtonHeightWidth\" target=\"_self\"/>\n" +
    "													</td>\n" +
    "												</tr>\n" +
    "											</tbody>\n" +
    "										</table>\n" +
    "										-->\n" +
    "										<input type=\"button\" value=\"{{CancelButtonCaption}}\" class=\"ms-ButtonHeightWidth\" ng-click=\"cancelForm()\" />\n" +
    "									</td>\n" +
    "								</tr>\n" +
    "							</tbody>\n" +
    "						</table>\n" +
    "					</td>\n" +
    "				</tr>\n" +
    "			</tbody>\n" +
    "		</table>\n" +
    "	</div>\n" +
    "</div>");
}]);

angular.module("templates/form-templates/spform.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("templates/form-templates/spform.html",
    "<form novalidate=\"true\">\n" +
    "    <div id=\"form-loading-animation-wrapper-{{$id}}\" ng-show=\"!isInDesignMode\"><img src=\"/_layouts/15/images/loadingcirclests16.gif\" alt=\"\" /></div>\n" +
    "    <div transclusion-container=\"\"></div>\n" +
    "</form>\n" +
    "");
}]);

angular.module("templates/scroll.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("templates/scroll.html",
    "<div class=\"loading\">\n" +
    "	<div ng-show=\"onLoading\">Loading ...</div>\n" +
    "	<a class=\"g-btn btn-more\" ng-click=\"loadNextPage()\" ng-show=\"!lastPage && !onLoading\">See more</a>\n" +
    "</div>\n" +
    "");
}]);

angular.module("templates/spworking-on-it.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("templates/spworking-on-it.html",
    "<div id=\"ms-loading-box\" class=\"ms-dlgContent\">\n" +
    "	<div id=\"ms-gearPageTitle\">\n" +
    "		<h1 class=\"ms-dlgTitle\">{{SP.Res.dialogLoading15}}</h1>\n" +
    "	</div>\n" +
    "	<div id=\"ms-gearPageBody\">\n" +
    "		<span class=\"ms-textLarge\">\n" +
    "			<a id=\"gearsImageLink\" href=\"javascript:;\" onclick=\"hideGears();\" title=\"This animation indicates the operation is in progress. Click to remove this animated image.\">\n" +
    "				<img id=\"gearsImage\" alt=\"This animation indicates the operation is in progress. Click to remove this animated image.\" src=\"/_layouts/15/images/gears_anv4.gif\" style=\"width:16px; height:16px; font-size:0px;\"></a>\n" +
    "			<span class=\"ms-loading-message\">Sorry to keep you waiting.</span>\n" +
    "		</span>\n" +
    "	</div>\n" +
    "</div>");
}]);
