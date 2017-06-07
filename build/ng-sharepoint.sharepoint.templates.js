angular.module('ngSharePoint.templates', ['templates/error.html', 'templates/form-templates/spfield-attachments-display.html', 'templates/form-templates/spfield-attachments-edit.html', 'templates/form-templates/spfield-boolean-display.html', 'templates/form-templates/spfield-boolean-edit.html', 'templates/form-templates/spfield-choice-display.html', 'templates/form-templates/spfield-choice-edit.html', 'templates/form-templates/spfield-contenttypeid-display.html', 'templates/form-templates/spfield-contenttypeid-edit.html', 'templates/form-templates/spfield-control-loading.html', 'templates/form-templates/spfield-control.html', 'templates/form-templates/spfield-currency-display.html', 'templates/form-templates/spfield-currency-edit.html', 'templates/form-templates/spfield-datetime-display.html', 'templates/form-templates/spfield-datetime-edit.html', 'templates/form-templates/spfield-description.html', 'templates/form-templates/spfield-file-display.html', 'templates/form-templates/spfield-file-edit.html', 'templates/form-templates/spfield-label.html', 'templates/form-templates/spfield-lookup-display.html', 'templates/form-templates/spfield-lookup-edit.html', 'templates/form-templates/spfield-lookupmulti-display.html', 'templates/form-templates/spfield-lookupmulti-edit.html', 'templates/form-templates/spfield-multichoice-display.html', 'templates/form-templates/spfield-multichoice-edit.html', 'templates/form-templates/spfield-note-display.html', 'templates/form-templates/spfield-note-edit.html', 'templates/form-templates/spfield-number-display.html', 'templates/form-templates/spfield-number-edit.html', 'templates/form-templates/spfield-text-display.html', 'templates/form-templates/spfield-text-edit.html', 'templates/form-templates/spfield-url-display.html', 'templates/form-templates/spfield-url-edit.html', 'templates/form-templates/spfield-user-display.html', 'templates/form-templates/spfield-user-edit.html', 'templates/form-templates/spfield-validation-messages.html', 'templates/form-templates/spfield-workflowstatus-display.html', 'templates/form-templates/spfield.html', 'templates/form-templates/spform-default.html', 'templates/form-templates/spform-toolbar-button.html', 'templates/form-templates/spform-toolbar.html', 'templates/form-templates/spform.html', 'templates/form-templates/spitem-authoringinfo.html', 'templates/scroll.html', 'templates/spworking-on-it.html']);

angular.module("templates/error.html", []).run(["$templateCache", function ($templateCache) {
  $templateCache.put("templates/error.html",
    "<h3>Error!!</h3>\n" +
    "");
}]);

angular.module("templates/form-templates/spfield-attachments-display.html", []).run(["$templateCache", function ($templateCache) {
  $templateCache.put("templates/form-templates/spfield-attachments-display.html",
    "<div ng-repeat=\"file in attachmentFiles\">\n" +
    "	<a ng-href=\"{{file.ServerRelativeUrl}}\" ng-bind=\"file.FileName\" target=\"{{target}}\"></a>\n" +
    "</div>\n" +
    "");
}]);

angular.module("templates/form-templates/spfield-attachments-edit.html", []).run(["$templateCache", function ($templateCache) {
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
    "					<img alt=\"Eliminar\" src=\"/_layouts/15/images/rect.gif?rev=23\">&nbsp;<a href=\"#\" ng-click=\"removeAttachment($event, $index, file.local)\">{{DeleteAttachmentText}}</a>\n" +
    "				</td>\n" +
    "			</tr>\n" +
    "		</tbody>\n" +
    "	</table>\n" +
    "\n" +
    "	<a href=\"#\" file-select=\"onFileSelect($files, $event)\" data-multiple=\"true\">\n" +
    "		<span style=\"width: 16px; height: 16px; overflow: hidden; display: inline-block; position: relative; top: 3px;\">\n" +
    "			<img alt=\"\" ng-src=\"/_layouts/15/{{LanguageID}}/images/formatmap16x16.png?rev=23\" style=\"position: absolute; top: -235px; left: -235px;\" />\n" +
    "		</span>\n" +
    "		<span ng-bind=\"AttachFileText\"></span>\n" +
    "	</a>\n" +
    "</div>\n" +
    "<spfield-validation-messages></spfield-validation-messages>\n" +
    "");
}]);

angular.module("templates/form-templates/spfield-boolean-display.html", []).run(["$templateCache", function ($templateCache) {
  $templateCache.put("templates/form-templates/spfield-boolean-display.html",
    "<div ng-bind=\"displayValue\" class=\"field-display-value\"></div>\n" +
    "");
}]);

angular.module("templates/form-templates/spfield-boolean-edit.html", []).run(["$templateCache", function ($templateCache) {
  $templateCache.put("templates/form-templates/spfield-boolean-edit.html",
    "<label style=\"cursor: pointer;\"><input type=\"checkbox\" ng-model=\"value\" style=\"cursor: pointer;\" /> <span ng-bind=\"schema.Title\"></span></label>\n" +
    "<spfield-validation-messages></spfield-validation-messages>\n" +
    "");
}]);

angular.module("templates/form-templates/spfield-choice-display.html", []).run(["$templateCache", function ($templateCache) {
  $templateCache.put("templates/form-templates/spfield-choice-display.html",
    "<div ng-bind=\"value\" class=\"field-display-value\"></div>\n" +
    "");
}]);

angular.module("templates/form-templates/spfield-choice-edit.html", []).run(["$templateCache", function ($templateCache) {
  $templateCache.put("templates/form-templates/spfield-choice-edit.html",
    "<div ng-switch=\"schema.EditFormat\">\n" +
    "\n" +
    "	<div ng-switch-when=\"0\">\n" +
    "		<span ng-if=\"schema.FillInChoice\"><input id=\"{{schema.InternalName}}_{{schema.Id}}_DropDownButton\" type=\"radio\" value=\"DropDownButton\" ng-model=\"$parent.$parent.selectedOption\"></span>\n" +
    "		<select ng-model=\"$parent.dropDownValue\" data-spfield-focus-element=\"true\" ng-options=\"option for option in choices\" ng-required=\"{{schema.Required}}\" title=\"{{schema.Title}}\" class=\"ms-RadioText\" ng-change=\"dropDownChanged()\" ng-click=\"dropDownClick()\"></select>\n" +
    "		<div ng-if=\"schema.FillInChoice\">\n" +
    "			<div class=\"ms-RadioText\">\n" +
    "				<input id=\"{{schema.InternalName}}_{{schema.Id}}_FillInButton\" type=\"radio\" value=\"FillInButton\" ng-model=\"$parent.$parent.selectedOption\" />\n" +
    "				<label for=\"{{schema.InternalName}}_{{schema.Id}}_FillInButton\" ng-bind=\"choiceFillInDisplayText\"></label>\n" +
    "			</div>\n" +
    "			<input type=\"text\" maxlength=\"255\" id=\"{{schema.InternalName}}_{{schema.Id}}_$FillInChoice\" tabindex=\"-1\" ng-model=\"$parent.$parent.fillInChoiceValue\" ng-click=\"fillInChoiceClick()\" style=\"margin: 3px 0 0 25px;\">\n" +
    "		</div>\n" +
    "	</div>\n" +
    "	\n" +
    "	<table ng-switch-when=\"1\" cellpadding=\"0\" cellspacing=\"1\">\n" +
    "		<tbody>\n" +
    "			<tr ng-repeat=\"option in choices\">\n" +
    "				<td>\n" +
    "					<span>\n" +
    "						<input type=\"radio\" ng-model=\"$parent.$parent.selectedOption\" ng-value=\"option\" id=\"{{schema.InternalName}}_{{$index}}\" />\n" +
    "						<label for=\"{{schema.InternalName}}_{{$index}}\" ng-bind=\"option\"></label>\n" +
    "					</span>\n" +
    "				</td>\n" +
    "			</tr>\n" +
    "			<tr ng-if=\"schema.FillInChoice\">\n" +
    "				<td>\n" +
    "					<div class=\"ms-RadioText\">\n" +
    "						<input id=\"{{schema.InternalName}}_{{schema.Id}}_FillInButton\" type=\"radio\" value=\"FillInButton\" ng-model=\"$parent.$parent.selectedOption\" />\n" +
    "						<label for=\"{{schema.InternalName}}_{{schema.Id}}_FillInButton\" ng-bind=\"choiceFillInDisplayText\"></label>\n" +
    "					</div>\n" +
    "					<input type=\"text\" maxlength=\"255\" id=\"{{schema.InternalName}}_{{schema.Id}}_$FillInChoice\" tabindex=\"-1\" ng-model=\"$parent.$parent.fillInChoiceValue\" ng-click=\"fillInChoiceClick()\" style=\"margin: 3px 0 0 25px;\">\n" +
    "				</td>\n" +
    "			</tr>\n" +
    "		</tbody>\n" +
    "	</table>\n" +
    "\n" +
    "</div>\n" +
    "<spfield-validation-messages></spfield-validation-messages>\n" +
    "");
}]);

angular.module("templates/form-templates/spfield-contenttypeid-display.html", []).run(["$templateCache", function ($templateCache) {
  $templateCache.put("templates/form-templates/spfield-contenttypeid-display.html",
    "<div ng-bind=\"selectedContentType.Name\" class=\"field-display-value\"></div>\n" +
    "");
}]);

angular.module("templates/form-templates/spfield-contenttypeid-edit.html", []).run(["$templateCache", function ($templateCache) {
  $templateCache.put("templates/form-templates/spfield-contenttypeid-edit.html",
    "<div>\n" +
    "	<select ng-model=\"value\" \n" +
    "			ng-options=\"ct.StringId as ct.Name for ct in ContentTypes\" \n" +
    "			ng-required=\"true\" \n" +
    "			title=\"{{schema.Title}}\"\n" +
    "			class=\"ms-RadioText\"\n" +
    "			ng-change=\"contentTypeChanged()\"></select>\n" +
    "</div>\n" +
    "<spfield-validation-messages></spfield-validation-messages>\n" +
    "");
}]);

angular.module("templates/form-templates/spfield-control-loading.html", []).run(["$templateCache", function ($templateCache) {
  $templateCache.put("templates/form-templates/spfield-control-loading.html",
    "<div><img src=\"/_layouts/15/images/loadingcirclests16.gif\" alt=\"\" /></div>\n" +
    "");
}]);

angular.module("templates/form-templates/spfield-control.html", []).run(["$templateCache", function ($templateCache) {
  $templateCache.put("templates/form-templates/spfield-control.html",
    "<div dir=\"{{schema.Direction}}\"></div>\n" +
    "");
}]);

angular.module("templates/form-templates/spfield-currency-display.html", []).run(["$templateCache", function ($templateCache) {
  $templateCache.put("templates/form-templates/spfield-currency-display.html",
    "<div ng-if=\"!isNaN(viewValue)\" ng-bind=\"$parent.viewValue.toFixed(cultureInfo.numberFormat.CurrencyDecimalDigits) + ' ' + cultureInfo.numberFormat.CurrencySymbol\" class=\"field-display-value\"></div>\n" +
    "");
}]);

angular.module("templates/form-templates/spfield-currency-edit.html", []).run(["$templateCache", function ($templateCache) {
  $templateCache.put("templates/form-templates/spfield-currency-edit.html",
    "<input 	type=\"text\" \n" +
    "		ng-model=\"viewValue\" \n" +
    "		data-spfield-focus-element=\"true\" \n" +
    "		maxlength=\"{{schema.MaxLength}}\" \n" +
    "		ng-required=\"{{schema.Required}}\" \n" +
    "		size=\"11\" \n" +
    "		title=\"{{schema.Title}}\" \n" +
    "		class=\"ms-input\" \n" +
    "		style=\"ime-mode: inactive\" />\n" +
    "<span>&nbsp;{{cultureInfo.numberFormat.CurrencySymbol}}</span>\n" +
    "<br/>\n" +
    "<spfield-validation-messages></spfield-validation-messages>\n" +
    "");
}]);

angular.module("templates/form-templates/spfield-datetime-display.html", []).run(["$templateCache", function ($templateCache) {
  $templateCache.put("templates/form-templates/spfield-datetime-display.html",
    "<div ng-bind=\"dateModel | date:cultureInfo.dateTimeFormat.ShortDatePattern + (schema.DisplayFormat == 0 ? '' :  ' ' + cultureInfo.dateTimeFormat.ShortTimePattern)\" class=\"field-display-value\"></div>\n" +
    "");
}]);

angular.module("templates/form-templates/spfield-datetime-edit.html", []).run(["$templateCache", function ($templateCache) {
  $templateCache.put("templates/form-templates/spfield-datetime-edit.html",
    "<table id=\"{{idPrefix}}_$DateTimeFieldTopTable\" border=\"0\" cellpadding=\"0\" cellspacing=\"0\">\n" +
    "	<tbody>\n" +
    "		<tr>\n" +
    "			<td class=\"ms-dtinput\">\n" +
    "				<label for=\"{{idPrefix}}_$DateTimeFieldDate\" style=\"display:none\">{{STSHtmlEncode(StBuildParam(Strings.STS.L_DateTimeFieldDateLabel, schema.InternalName))}}</label>\n" +
    "				<input type=\"text\" ng-model=\"dateOnlyModel\" data-spfield-focus-element=\"true\" maxlength=\"45\" id=\"{{idPrefix}}_$DateTimeFieldDate\" title=\"{{schema.Title}}\" class=\"ms-input\" autopostback=\"0\" />\n" +
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
    "<spfield-validation-messages></spfield-validation-messages>\n" +
    "");
}]);

angular.module("templates/form-templates/spfield-description.html", []).run(["$templateCache", function ($templateCache) {
  $templateCache.put("templates/form-templates/spfield-description.html",
    "<span class=\"ms-metadata spfield-body-control\" ng-bind-html=\"::schema.Description | newlines\" ng-show=\"currentMode == 'edit'\"></span>\n" +
    "");
}]);

angular.module("templates/form-templates/spfield-file-display.html", []).run(["$templateCache", function ($templateCache) {
  $templateCache.put("templates/form-templates/spfield-file-display.html",
    "<a ng-href=\"{{url}}\" ng-click=\"EditOrDownload($event)\" ng-bind=\"fileName\" class=\"field-display-value\"></a>\n" +
    "");
}]);

angular.module("templates/form-templates/spfield-file-edit.html", []).run(["$templateCache", function ($templateCache) {
  $templateCache.put("templates/form-templates/spfield-file-edit.html",
    "<input type=\"text\" ng-model=\"value\" data-spfield-focus-element=\"true\" ng-required=\"{{schema.Required}}\" title=\"{{schema.Title}}\" class=\"ms-spellcheck-true\" size=\"35\" /> <span ng-bind=\"extension\"></span>\n" +
    "<br/>\n" +
    "<spfield-validation-messages></spfield-validation-messages>\n" +
    "");
}]);

angular.module("templates/form-templates/spfield-label.html", []).run(["$templateCache", function ($templateCache) {
  $templateCache.put("templates/form-templates/spfield-label.html",
    "<h3 class=\"ms-standardheader\"><nobr>{{::label}}<span class=\"ms-accentText\" title=\"This is a required field.\" ng-show=\"schema.Required && currentMode == 'edit'\"> *</span></nobr></h3>\n" +
    "");
}]);

angular.module("templates/form-templates/spfield-lookup-display.html", []).run(["$templateCache", function ($templateCache) {
  $templateCache.put("templates/form-templates/spfield-lookup-display.html",
    "<a ng-href=\"{{lookupItem.url}}\" ng-bind=\"lookupItem.title\"></a>\n" +
    "");
}]);

angular.module("templates/form-templates/spfield-lookup-edit.html", []).run(["$templateCache", function ($templateCache) {
  $templateCache.put("templates/form-templates/spfield-lookup-edit.html",
    "<div>\n" +
    "	<select title=\"{{schema.Title}}\" \n" +
    "			ng-model=\"value\" \n" +
    "			data-spfield-focus-element=\"true\" \n" +
    "			ng-options=\"item.Id as item[schema.LookupField] for item in lookupItems\" \n" +
    "			ng-change=\"valueChanged()\"></select>\n" +
    "</div>\n" +
    "<spfield-validation-messages></spfield-validation-messages>\n" +
    "");
}]);

angular.module("templates/form-templates/spfield-lookupmulti-display.html", []).run(["$templateCache", function ($templateCache) {
  $templateCache.put("templates/form-templates/spfield-lookupmulti-display.html",
    "<div><span ng-repeat=\"item in selectedLookupItems\"><a ng-href=\"{{item.url}}\" ng-bind=\"item.Title\"></a>{{!$last ? '; ' : ''}}</span></div>\n" +
    "");
}]);

angular.module("templates/form-templates/spfield-lookupmulti-edit.html", []).run(["$templateCache", function ($templateCache) {
  $templateCache.put("templates/form-templates/spfield-lookupmulti-edit.html",
    "<table id=\"{{idPrefix}}_MultiLookup_topTable\" class=\"ms-long\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\">\n" +
    "	<tbody>\n" +
    "		<tr>\n" +
    "			<td class=\"ms-input\">\n" +
    "				<select id=\"{{idPrefix}}_SelectCandidate\" ng-model=\"selectedCandidateItems\" data-spfield-focus-element=\"true\" ng-options=\"item as item.name for item in candidateItems | orderBy:'name'\" multiple=\"multiple\" title=\"{{candidateAltText}}\" style=\"width:143px; height:125px; overflow:scroll;\" ng-focus=\"selectedResultItems = []\" ng-dblclick=\"addItems()\"></select>\n" +
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
    "<spfield-validation-messages></spfield-validation-messages>\n" +
    "");
}]);

angular.module("templates/form-templates/spfield-multichoice-display.html", []).run(["$templateCache", function ($templateCache) {
  $templateCache.put("templates/form-templates/spfield-multichoice-display.html",
    "<div ng-bind=\"choices.join('; ')\" class=\"field-display-value\"></div>\n" +
    "");
}]);

angular.module("templates/form-templates/spfield-multichoice-edit.html", []).run(["$templateCache", function ($templateCache) {
  $templateCache.put("templates/form-templates/spfield-multichoice-edit.html",
    "<table cellpadding=\"0\" cellspacing=\"1\">\n" +
    "    <tbody>\n" +
    "        <tr ng-repeat=\"choice in schema.Choices.results\">\n" +
    "            <td>\n" +
    "                <span class=\"ms-RadioText\" title=\"{{choice}}\">\n" +
    "                    <input type=\"checkbox\" id=\"{{schema.Title}}_{{$index}}\" ng-click=\"toggleCheckbox(choice)\" ng-checked=\"choices.indexOf(choice) != -1\" />\n" +
    "                    <label for=\"{{schema.Title}}_{{$index}}\">{{choice}}</label>\n" +
    "                </span>\n" +
    "            </td>\n" +
    "        </tr>\n" +
    "        <tr ng-if=\"schema.FillInChoice\">\n" +
    "            <td>\n" +
    "                <div class=\"ms-RadioText\">\n" +
    "                    <input id=\"{{schema.InternalName}}_{{schema.Id}}_FillInRadio\" type=\"checkbox\" ng-model=\"$parent.fillInChoiceCheckbox\" ng-change=\"fillInChoiceCheckboxChanged()\" />\n" +
    "                    <label for=\"{{schema.InternalName}}_{{schema.Id}}_FillInRadio\" ng-bind=\"choiceFillInDisplayText\"></label>\n" +
    "                </div>\n" +
    "                <input type=\"text\" maxlength=\"255\" id=\"{{schema.InternalName}}_{{schema.Id}}FillInText\" tabindex=\"-1\" ng-model=\"$parent.fillInChoiceValue\" ng-focus=\"fillInChoiceCheckbox = true\" style=\"margin: 3px 0 0 25px;\">\n" +
    "            </td>\n" +
    "        </tr>\n" +
    "    </tbody>\n" +
    "</table>\n" +
    "<spfield-validation-messages></spfield-validation-messages>\n" +
    "");
}]);

angular.module("templates/form-templates/spfield-note-display.html", []).run(["$templateCache", function ($templateCache) {
  $templateCache.put("templates/form-templates/spfield-note-display.html",
    "<div ng-if=\"!schema.AppendOnly\" ng-bind-html=\"value | unsafe\" class=\"field-display-value\"></div>\n" +
    "<div ng-if=\"schema.AppendOnly\">\n" +
    "    <div ng-repeat=\"version in versions\" class=\"accumulated-wrapper\">\n" +
    "        <span class=\"ms-noWrap accumulated-user\">\n" +
    "            <span class=\"ms-imnSpan\">\n" +
    "                <a href=\"#\" onclick=\"IMNImageOnClick(event);return false;\" class=\"ms-imnlink ms-spimn-presenceLink\">\n" +
    "                    <span class=\"ms-spimn-presenceWrapper ms-imnImg ms-spimn-imgSize-10x10\">\n" +
    "                        <img name=\"imnmark\" class=\"ms-spimn-img ms-spimn-presence-disconnected-10x10x32\" title=\"\" showofflinepawn=\"1\" src=\"/_layouts/15/images/spimn.png?rev=23\" alt=\"No presence information\" />\n" +
    "                    </span>\n" +
    "                </a>\n" +
    "            </span>\n" +
    "            <span class=\"ms-noWrap ms-imnSpan\">\n" +
    "                <a href=\"#\" onclick=\"IMNImageOnClick(event);return false;\" class=\"ms-imnlink\" tabindex=\"-1\">\n" +
    "                    <img name=\"imnmark\" class=\"ms-hide\" title=\"\" showofflinepawn=\"1\" src=\"/_layouts/15/images/blank.gif?rev=23\" alt=\"\" />\n" +
    "                </a>\n" +
    "                <a class=\"ms-subtleLink\" onclick=\"GoToLinkOrDialogNewWindow(this);return false;\" href=\"/_layouts/15/userdisp.aspx?ID={{version.editor.id}}\" ng-bind=\"version.editor.name\"></a>\n" +
    "            </span>\n" +
    "        </span>\n" +
    "        <span class=\"accumulated-date\">(<a href=\"/_layouts/15/listform.aspx?ListId={{item.list.Id}}&PageType=4&ID={{item.Id}}&Source={{defaultViewUrl}}&VersionNo=3072\" ng-bind=\"version.modified | date:cultureInfo.dateTimeFormat.ShortDatePattern + ' ' + cultureInfo.dateTimeFormat.ShortTimePattern\"></a>): </span><span class=\"accumulated-text\" ng-bind-html=\"version.value | unsafe\"></span>\n" +
    "    </div>\n" +
    "</div>");
}]);

angular.module("templates/form-templates/spfield-note-edit.html", []).run(["$templateCache", function ($templateCache) {
  $templateCache.put("templates/form-templates/spfield-note-edit.html",
    "<span dir=\"ltr\" ng-if=\"!rteFullHtml\">\n" +
    "	<textarea ng-model=\"$parent.value\" data-spfield-focus-element=\"true\" maxlength=\"{{schema.MaxLength}}\" ng-maxlength=\"{{schema.MaxLength}}\" ng-required=\"{{schema.Required}}\" rows=\"{{schema.NumberOfLines}}\" cols=\"20\" title=\"{{schema.Title}}\" class=\"ms-long\"></textarea>\n" +
    "</span>\n" +
    "<br ng-if=\"!rteFullHtml\" />\n" +
    "\n" +
    "<div ng-if=\"rteFullHtml\" class=\"ms-rtestate-field ms-rtefield ms-inputBox\" id=\"{{schema.EntityPropertyName}}_{{schema.Id}}_$TextField_topDiv\">\n" +
    "    <div id=\"{{schema.EntityPropertyName}}_{{schema.Id}}_$TextField_inplacerte_label\" style=\"display:none\" ng-bind=\"$parent.rteLabelText\"></div>\n" +
    "    <div ng-model=\"$parent.value\" ng-blur=\"$parent.updateModel($event)\" ng-keyup=\"$parent.updateModel($event)\" ng-change=\"$parent.updateModel($event)\" contenteditable=\"true\" data-spfield-focus-element=\"true\" class=\"ms-rtestate-write ms-rteflags-0 ms-rtestate-field\" id=\"{{schema.EntityPropertyName}}_{{schema.Id}}_$TextField_inplacerte\" style=\"min-height:84px\" aria-labelledby=\"{{schema.EntityPropertyName}}_{{schema.Id}}_$TextField_inplacerte_label\" role=\"textbox\" aria-autocomplete=\"both\" aria-haspopup=\"true\" aria-multiline=\"true\"></div>\n" +
    "    <div style=\"clear : both;\"></div>\n" +
    "</div>\n" +
    "\n" +
    "<spfield-validation-messages></spfield-validation-messages>\n" +
    "\n" +
    "<div class=\"ms-formdescription\" ng-if=\"schema.RichText && !rteFullHtml\">\n" +
    "    <a href=\"javascript:HelpWindowKey('nsrichtext')\" ng-bind=\"rteHelpMessage\"></a>\n" +
    "</div>\n" +
    "\n" +
    "<div ng-if=\"schema.AppendOnly\">\n" +
    "    <div ng-repeat=\"version in versions\" class=\"accumulated-wrapper\">\n" +
    "        <span class=\"ms-noWrap accumulated-user\">\n" +
    "            <span class=\"ms-imnSpan\">\n" +
    "                <a href=\"#\" onclick=\"IMNImageOnClick(event);return false;\" class=\"ms-imnlink ms-spimn-presenceLink\">\n" +
    "                    <span class=\"ms-spimn-presenceWrapper ms-imnImg ms-spimn-imgSize-10x10\">\n" +
    "                        <img name=\"imnmark\" class=\"ms-spimn-img ms-spimn-presence-disconnected-10x10x32\" title=\"\" showofflinepawn=\"1\" src=\"/_layouts/15/images/spimn.png?rev=23\" alt=\"No presence information\" />\n" +
    "                    </span>\n" +
    "                </a>\n" +
    "            </span>\n" +
    "            <span class=\"ms-noWrap ms-imnSpan\">\n" +
    "                <a href=\"#\" onclick=\"IMNImageOnClick(event);return false;\" class=\"ms-imnlink\" tabindex=\"-1\">\n" +
    "                    <img name=\"imnmark\" class=\"ms-hide\" title=\"\" showofflinepawn=\"1\" src=\"/_layouts/15/images/blank.gif?rev=23\" alt=\"\" />\n" +
    "                </a>\n" +
    "                <a class=\"ms-subtleLink\" onclick=\"GoToLinkOrDialogNewWindow(this);return false;\" href=\"/_layouts/15/userdisp.aspx?ID={{version.editor.id}}\" ng-bind=\"version.editor.name\"></a>\n" +
    "            </span>\n" +
    "        </span>\n" +
    "        <span class=\"accummulated-date\">(<a href=\"/_layouts/15/listform.aspx?ListId={{item.list.Id}}&PageType=4&ID={{item.Id}}&Source={{defaultViewUrl}}&VersionNo=3072\" ng-bind=\"version.modified | date:cultureInfo.dateTimeFormat.ShortDatePattern + ' ' + cultureInfo.dateTimeFormat.ShortTimePattern\"></a>): </span><span class=\"accumulated-text\" ng-bind-html=\"version.value | unsafe\"></span>\n" +
    "    </div>\n" +
    "</div>\n" +
    "");
}]);

angular.module("templates/form-templates/spfield-number-display.html", []).run(["$templateCache", function ($templateCache) {
  $templateCache.put("templates/form-templates/spfield-number-display.html",
    "<div ng-if=\"!isNaN(viewValue)\" ng-bind=\"(schema.Percentage ? ($parent.viewValue * 100).toFixed(schema.Decimals) + ' ' + cultureInfo.numberFormat.PercentSymbol : $parent.viewValue.toFixed(schema.Decimals))\" class=\"field-display-value\"></div>\n" +
    "");
}]);

angular.module("templates/form-templates/spfield-number-edit.html", []).run(["$templateCache", function ($templateCache) {
  $templateCache.put("templates/form-templates/spfield-number-edit.html",
    "<input type=\"text\" ng-model=\"viewValue\" data-spfield-focus-element=\"true\" sp-percentage=\"{{schema.Percentage}}\" ng-required=\"{{schema.Required}}\" min=\"{{schema.MinimumValue}}\" max=\"{{schema.MaximumValue}}\" size=\"11\" title=\"{{schema.Title}}\" class=\"ms-input\" style=\"ime-mode: inactive\" />\n" +
    "<span ng-if=\"schema.Percentage\">&nbsp;{{cultureInfo.numberFormat.PercentSymbol}}</span>\n" +
    "<br/>\n" +
    "<spfield-validation-messages></spfield-validation-messages>\n" +
    "");
}]);

angular.module("templates/form-templates/spfield-text-display.html", []).run(["$templateCache", function ($templateCache) {
  $templateCache.put("templates/form-templates/spfield-text-display.html",
    "<div ng-bind=\"value\" class=\"field-display-value\"></div>\n" +
    "");
}]);

angular.module("templates/form-templates/spfield-text-edit.html", []).run(["$templateCache", function ($templateCache) {
  $templateCache.put("templates/form-templates/spfield-text-edit.html",
    "<input type=\"text\" ng-model=\"value\" data-spfield-focus-element=\"true\" maxlength=\"{{schema.MaxLength}}\" ng-maxlength=\"{{schema.MaxLength}}\" ng-required=\"{{schema.Required}}\" title=\"{{schema.Title}}\" class=\"ms-long ms-spellcheck-true\" />\n" +
    "<br/>\n" +
    "<spfield-validation-messages></spfield-validation-messages>\n" +
    "");
}]);

angular.module("templates/form-templates/spfield-url-display.html", []).run(["$templateCache", function ($templateCache) {
  $templateCache.put("templates/form-templates/spfield-url-display.html",
    "<div>\n" +
    "	<a ng-href=\"{{Url}}\" ng-bind=\"Description\" target=\"_blank\" ng-if=\"schema.DisplayFormat == 0\"></a>\n" +
    "	<img ng-src=\"{{Url}}\" alt=\"{{Description}}\" ng-if=\"schema.DisplayFormat == 1\"/>\n" +
    "</div>\n" +
    "");
}]);

angular.module("templates/form-templates/spfield-url-edit.html", []).run(["$templateCache", function ($templateCache) {
  $templateCache.put("templates/form-templates/spfield-url-edit.html",
    "<div>\n" +
    "	<div class=\"ms-formdescription\">{{UrlFieldTypeText}}&nbsp;(<a id=\"{{schema.InternalName}}_{{schema.Id}}_$UrlControlId\" href=\"javascript:TestURL('{{schema.InternalName}}_{{schema.Id}}_$UrlFieldUrl')\" target=\"_self\">{{UrlFieldClickText}}</a>)</div>\n" +
    "	<input dir=\"ltr\" type=\"text\" ng-model=\"Url\" data-spfield-focus-element=\"true\" ng-required=\"{{schema.Required}}\" id=\"{{schema.InternalName}}_{{schema.Id}}_$UrlFieldUrl\" title=\"{{schema.Title}}\" class=\"ms-long\">\n" +
    "	<div class=\"ms-formdescription\">{{UrlFieldTypeDescription}}&nbsp;</div>\n" +
    "	<input type=\"text\" ng-model=\"Description\" maxlength=\"255\" id=\"{{schema.InternalName}}_{{schema.Id}}_$UrlFieldDescription\" title=\"{{Description_Text}}\" class=\"ms-long\">\n" +
    "</div>\n" +
    "<spfield-validation-messages></spfield-validation-messages>\n" +
    "");
}]);

angular.module("templates/form-templates/spfield-user-display.html", []).run(["$templateCache", function ($templateCache) {
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
    "</div>\n" +
    "");
}]);

angular.module("templates/form-templates/spfield-user-edit.html", []).run(["$templateCache", function ($templateCache) {
  $templateCache.put("templates/form-templates/spfield-user-edit.html",
    "<div id=\"{{idPrefix}}_$ClientPeoplePicker\"></div>\n" +
    "<spfield-validation-messages></spfield-validation-messages>\n" +
    "");
}]);

angular.module("templates/form-templates/spfield-validation-messages.html", []).run(["$templateCache", function ($templateCache) {
  $templateCache.put("templates/form-templates/spfield-validation-messages.html",
    "<div class=\"ms-formvalidation ms-csrformvalidation\" ng-show=\"modelCtrl.$dirty && modelCtrl.$invalid\">\n" +
    "    <span ng-show=\"modelCtrl.$error.required\" role=\"alert\">{{SPClientRequiredValidatorError}}</span>\n" +
    "    <span ng-show=\"modelCtrl.$error.url\" role=\"alert\">Url error.</span>\n" +
    "    <span ng-show=\"modelCtrl.$error.number\" role=\"alert\">Number error.</span>\n" +
    "    <span ng-show=\"modelCtrl.$error.unique\" role=\"alert\">Unique error.</span>\n" +
    "    <span ng-show=\"modelCtrl.$error.date\" role=\"alert\">Invalid date.</span>\n" +
    "    <span ng-show=\"modelCtrl.$error.pattern\" role=\"alert\">Invalid name.</span>\n" +
    "</div>\n" +
    "");
}]);

angular.module("templates/form-templates/spfield-workflowstatus-display.html", []).run(["$templateCache", function ($templateCache) {
  $templateCache.put("templates/form-templates/spfield-workflowstatus-display.html",
    "<span>{{getWorkflowStatusDisplayValue()}}</span>\n" +
    "");
}]);

angular.module("templates/form-templates/spfield.html", []).run(["$templateCache", function ($templateCache) {
  $templateCache.put("templates/form-templates/spfield.html",
    "<div class=\"{{classAttr}}\"\n" +
    "	 style=\"display: table-row; width: 100%;\">\n" +
    "    <div class=\"ms-formlabel spfield-label\"\n" +
    "		 style=\"display: table-cell; vertical-align: top; width: 113px;\">\n" +
    "        <spfield-label {{attributes}}></spfield-label>\n" +
    "    </div>\n" +
    "    <div class=\"ms-formbody spfield-body\"\n" +
    "		 style=\"display: table-cell; vertical-align: top; width: 350px;\">\n" +
    "        <spfield-control {{attributes}}></spfield-control>\n" +
    "        <spfield-description {{attributes}}></spfield-description>\n" +
    "    </div>\n" +
    "</div>\n" +
    "");
}]);

angular.module("templates/form-templates/spform-default.html", []).run(["$templateCache", function ($templateCache) {
  $templateCache.put("templates/form-templates/spform-default.html",
    "<div ng-repeat=\"field in fields\" spfield=\"{{field.InternalName}}\"></div>\n" +
    "<spitem-authoringinfo></spitem-authoringinfo>\n" +
    "<spform-toolbar></spform-toolbar>\n" +
    "");
}]);

angular.module("templates/form-templates/spform-toolbar-button.html", []).run(["$templateCache", function ($templateCache) {
  $templateCache.put("templates/form-templates/spform-toolbar-button.html",
    "<input type=\"button\" class=\"spform-toolbar-element spform-toolbar-action ms-ButtonHeightWidth\" value=\"{{text}}\" ng-click=\"makeAction();\" ng-disabled=\"isInDesignMode || formCtrl.getFormStatus() != status.IDLE || enabled === false\" />\n" +
    "");
}]);

angular.module("templates/form-templates/spform-toolbar.html", []).run(["$templateCache", function ($templateCache) {
  $templateCache.put("templates/form-templates/spform-toolbar.html",
    "<div class=\"spform-toolbar\" sp-transclude=\"true\" style=\"text-align: right; margin: 10px 0; white-space: nowrap;\"></div>\n" +
    "");
}]);

angular.module("templates/form-templates/spform.html", []).run(["$templateCache", function ($templateCache) {
  $templateCache.put("templates/form-templates/spform.html",
    "<form novalidate=\"true\">\n" +
    "    <div id=\"form-loading-animation-wrapper-{{$id}}\" ng-show=\"!isInDesignMode\"><img src=\"/_layouts/15/images/loadingcirclests16.gif\" alt=\"\" /></div>\n" +
    "    <div transclusion-container=\"\" class=\"spform spform-{{mode}}\"></div>\n" +
    "</form>\n" +
    "");
}]);

angular.module("templates/form-templates/spitem-authoringinfo.html", []).run(["$templateCache", function ($templateCache) {
  $templateCache.put("templates/form-templates/spitem-authoringinfo.html",
    "<div class=\"spform-item-info\" style=\"float: left; display: inline-block; margin: 10px 0;\">\n" +
    "\n" +
    "    <div ng-if=\"!isNewItem && !originalAuthoringInfoFound\">\n" +
    "        <div class=\"ms-descriptiontext\" ng-show=\"item.list.ContentTypesEnabled == true\">\n" +
    "            <span ng-bind=\"contentTypeText\"></span>: <span ng-bind=\"item.ContentType.Name\"></span>\n" +
    "        </div>\n" +
    "\n" +
    "        <div class=\"ms-descriptiontext\" ng-show=\"item.list.EnableVersioning == true\">\n" +
    "            <span ng-bind=\"versionText\"></span>: <span ng-bind=\"item.OData__UIVersionString\"></span>\n" +
    "        </div>\n" +
    "\n" +
    "        <div class=\"ms-descriptiontext\">\n" +
    "            <span ng-bind=\"createdAtText\"></span> <span ng-bind=\"createdDate | date: cultureInfo.dateTimeFormat.ShortDatePattern + ' HH:mm'\"></span> <span ng-bind=\"byText\"></span> <a class=\"ms-peopleux-userdisplink ms-subtleLink\" ng-href=\"{{authorLink}}\" ng-bind=\"authorName\"></a>\n" +
    "        </div>\n" +
    "\n" +
    "        <div class=\"ms-descriptiontext\">\n" +
    "            <span ng-bind=\"lastModifiedText\"></span> <span ng-bind=\"modifiedDate | date: cultureInfo.dateTimeFormat.ShortDatePattern + ' HH:mm'\"></span> <span ng-bind=\"byText\"></span> <a class=\"ms-peopleux-userdisplink ms-subtleLink\" ng-href=\"{{editorLink}}\" ng-bind=\"editorName\"></a>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "\n" +
    "</div>\n" +
    "");
}]);

angular.module("templates/scroll.html", []).run(["$templateCache", function ($templateCache) {
  $templateCache.put("templates/scroll.html",
    "<div class=\"loading\">\n" +
    "	<div ng-show=\"onLoading\">Loading ...</div>\n" +
    "	<a class=\"g-btn btn-more\" ng-click=\"loadNextPage()\" ng-show=\"!lastPage && !onLoading\">See more</a>\n" +
    "</div>\n" +
    "");
}]);

angular.module("templates/spworking-on-it.html", []).run(["$templateCache", function ($templateCache) {
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
    "</div>\n" +
    "");
}]);
