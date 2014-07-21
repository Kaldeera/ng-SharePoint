angular.module('ngSharePoint.templates', ['templates/error.html', 'templates/form-templates/spfield-boolean-display.html', 'templates/form-templates/spfield-boolean-edit.html', 'templates/form-templates/spfield-choice-display.html', 'templates/form-templates/spfield-choice-edit.html', 'templates/form-templates/spfield-control.html', 'templates/form-templates/spfield-currency-display.html', 'templates/form-templates/spfield-currency-edit.html', 'templates/form-templates/spfield-datetime-display.html', 'templates/form-templates/spfield-datetime-edit.html', 'templates/form-templates/spfield-description.html', 'templates/form-templates/spfield-label.html', 'templates/form-templates/spfield-lookup-display.html', 'templates/form-templates/spfield-lookup-edit.html', 'templates/form-templates/spfield-lookupmulti-display.html', 'templates/form-templates/spfield-lookupmulti-edit.html', 'templates/form-templates/spfield-multichoice-display.html', 'templates/form-templates/spfield-multichoice-edit.html', 'templates/form-templates/spfield-note-display.html', 'templates/form-templates/spfield-note-edit.html', 'templates/form-templates/spfield-number-display.html', 'templates/form-templates/spfield-number-edit.html', 'templates/form-templates/spfield-text-display.html', 'templates/form-templates/spfield-text-edit.html', 'templates/form-templates/spfield.html', 'templates/form-templates/spform-toolbar.html', 'templates/form-templates/spform.html', 'templates/scroll.html']);

angular.module("templates/error.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("templates/error.html",
    "<h3>Error!!</h3>\n" +
    "");
}]);

angular.module("templates/form-templates/spfield-boolean-display.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("templates/form-templates/spfield-boolean-display.html",
    "<div ng-bind=\"displayValue\" class=\"field-display-value\"></div>");
}]);

angular.module("templates/form-templates/spfield-boolean-edit.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("templates/form-templates/spfield-boolean-edit.html",
    "<input type=\"checkbox\" ng-model=\"value\" />");
}]);

angular.module("templates/form-templates/spfield-choice-display.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("templates/form-templates/spfield-choice-display.html",
    "<div ng-bind=\"value\" class=\"field-display-value\"></div>");
}]);

angular.module("templates/form-templates/spfield-choice-edit.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("templates/form-templates/spfield-choice-edit.html",
    "<div ng-switch=\"schema.EditFormat\">\n" +
    "\n" +
    "	<select ng-switch-when=\"0\" ng-model=\"$parent.value\" ng-options=\"option for option in schema.Choices.results\" ng-required=\"{{schema.Required}}\" title=\"{{schema.Title}}\" class=\"ms-RadioText\" ></select>\n" +
    "\n" +
    "	<table ng-switch-when=\"1\" cellpadding=\"0\" cellspacing=\"1\">\n" +
    "		<tbody>\n" +
    "			<tr ng-repeat=\"option in schema.Choices.results\">\n" +
    "				<td>\n" +
    "					<span>\n" +
    "						<input type=\"radio\" ng-model=\"$parent.$parent.value\" ng-value=\"option\" id=\"{{schema.InternalName}}_{{$index}}\" name=\"{{schema.InternalName}}_$RadioButtonChoiceField\" />\n" +
    "						<label for=\"{{schema.InternalName}}_{{$index}}\" ng-bind=\"option\"></label>\n" +
    "					</span>\n" +
    "				</td>\n" +
    "			</tr>\n" +
    "		</tbody>\n" +
    "	</table>\n" +
    "\n" +
    "</div>");
}]);

angular.module("templates/form-templates/spfield-control.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("templates/form-templates/spfield-control.html",
    "<span dir=\"{{fieldSchema.Direction}}\"></span>");
}]);

angular.module("templates/form-templates/spfield-currency-display.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("templates/form-templates/spfield-currency-display.html",
    "<div ng-bind=\"value\" class=\"field-display-value\"></div>");
}]);

angular.module("templates/form-templates/spfield-currency-edit.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("templates/form-templates/spfield-currency-edit.html",
    "<input type=\"text\" ng-model=\"value\" maxlength=\"{{schema.MaxLength}}\" ng-required=\"{{schema.Required}}\" title=\"{{schema.Title}}\" class=\"ms-long ms-spellcheck-true\" />");
}]);

angular.module("templates/form-templates/spfield-datetime-display.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("templates/form-templates/spfield-datetime-display.html",
    "<div ng-bind=\"value | date:(schema.DisplayFormat == 0 ? 'shortDate' : 'short')\" class=\"field-display-value\"></div>");
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
    "</table>");
}]);

angular.module("templates/form-templates/spfield-description.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("templates/form-templates/spfield-description.html",
    "<span class=\"ms-metadata\" ng-bind-html=\"schema.Description | newlines\" ng-if=\"currentMode == 'edit'\"></span>");
}]);

angular.module("templates/form-templates/spfield-label.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("templates/form-templates/spfield-label.html",
    "<h3 class=\"ms-standardheader\"><nobr>{{schema.Title}}<span class=\"ms-accentText\" title=\"This is a required field.\" ng-show=\"schema.Required && currentMode == 'edit'\"> *</span></nobr></h3>");
}]);

angular.module("templates/form-templates/spfield-lookup-display.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("templates/form-templates/spfield-lookup-display.html",
    "<a ng-href=\"{{lookupItem.url}}\">{{lookupItem.Title}}</a>");
}]);

angular.module("templates/form-templates/spfield-lookup-edit.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("templates/form-templates/spfield-lookup-edit.html",
    "<div><select title=\"{{schema.Title}}\" ng-model=\"value\" ng-options=\"item.Id as item.Title for item in lookupItems\"></select></div>");
}]);

angular.module("templates/form-templates/spfield-lookupmulti-display.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("templates/form-templates/spfield-lookupmulti-display.html",
    "<div><span ng-repeat=\"item in selectedLookupItems\"><a ng-href=\"{{item.url}}\">{{item.Title}}</a>{{!$last ? '; ' : ''}}</span></div>");
}]);

angular.module("templates/form-templates/spfield-lookupmulti-edit.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("templates/form-templates/spfield-lookupmulti-edit.html",
    "<span>En desarrollo...</span>");
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
    "</table>");
}]);

angular.module("templates/form-templates/spfield-note-display.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("templates/form-templates/spfield-note-display.html",
    "<div ng-bind=\"value\" class=\"field-display-value\"></div>");
}]);

angular.module("templates/form-templates/spfield-note-edit.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("templates/form-templates/spfield-note-edit.html",
    "<div>\n" +
    "	<span dir=\"ltr\">\n" +
    "		<textarea ng-model=\"value\" ng-required=\"{{schema.Required}}\" rows=\"{{schema.NumberOfLines}}\" cols=\"20\" title=\"{{schema.Title}}\" class=\"ms-long\"></textarea>\n" +
    "	</span>\n" +
    "	<br/>\n" +
    "	<span class=\"ms-formdescription\" ng-if=\"schema.RichText\" ng-show=\"currentMode == 'edit'\">\n" +
    "		<a href=\"javascript:HelpWindowKey('nsrichtext')\">Click for help about adding basic HTML formatting.</a>\n" +
    "	</span>\n" +
    "	<br ng-if=\"schema.RichText\" />\n" +
    "</div>");
}]);

angular.module("templates/form-templates/spfield-number-display.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("templates/form-templates/spfield-number-display.html",
    "<div ng-bind=\"value\" class=\"field-display-value\"></div>");
}]);

angular.module("templates/form-templates/spfield-number-edit.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("templates/form-templates/spfield-number-edit.html",
    "<div><input type=\"text\" ng-model=\"value\" ng-required=\"{{schema.Required}}\" min=\"{{schema.MinimumValue}}\" max=\"{{schema.MaximumValue}}\" size=\"11\" title=\"{{schema.Title}}\" class=\"ms-input\" style=\"ime-mode : inactive\"></div>");
}]);

angular.module("templates/form-templates/spfield-text-display.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("templates/form-templates/spfield-text-display.html",
    "<div ng-bind=\"value\" class=\"field-display-value\"></div>");
}]);

angular.module("templates/form-templates/spfield-text-edit.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("templates/form-templates/spfield-text-edit.html",
    "<div><input type=\"text\" ng-model=\"value\" maxlength=\"{{schema.MaxLength}}\" ng-required=\"{{schema.Required}}\" title=\"{{schema.Title}}\" class=\"ms-long ms-spellcheck-true\" /></div>");
}]);

angular.module("templates/form-templates/spfield.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("templates/form-templates/spfield.html",
    "<tr>\n" +
    "	<td nowrap=\"true\" valign=\"top\" width=\"113px\" class=\"ms-formlabel\">\n" +
    "		<spfield-label name=\"{{name}}\" {{mode}}></spfield-label>\n" +
    "	</td>\n" +
    "	<td valign=\"top\" width=\"350px\" class=\"ms-formbody\">\n" +
    "		<spfield-control name=\"{{name}}\" {{mode}}></spfield-control>\n" +
    "		<spfield-description name=\"{{name}}\" {{mode}}></spfield-description>\n" +
    "	</td>\n" +
    "</tr>");
}]);

angular.module("templates/form-templates/spform-toolbar.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("templates/form-templates/spform-toolbar.html",
    "<div>\n" +
    "	<!-- Form Toolbar DISPLAY MODE -->\n" +
    "	<table cellpadding=\"0\" cellspacing=\"0\" width=\"100%\" style=\"padding-top: 7px\" ng-if=\"mode == 'display'\">\n" +
    "		<tbody>\n" +
    "			<tr>\n" +
    "				<td width=\"100%\">\n" +
    "					<!--\n" +
    "					<input name=\"ctl00$ctl28$g_e2bc9482_4bc2_4158_98ba_504fcc7169d8$ctl00$ctl08$ctl00$owshiddenversion\" type=\"HIDDEN\" id=\"ctl00_ctl28_g_e2bc9482_4bc2_4158_98ba_504fcc7169d8_ctl00_ctl08_ctl00_owshiddenversion\"/>\n" +
    "					-->\n" +
    "					<table class=\"ms-formtoolbar\" cellpadding=\"2\" cellspacing=\"0\" border=\"0\" id=\"ctl00_ctl28_g_e2bc9482_4bc2_4158_98ba_504fcc7169d8_ctl00_toolBarTbl\" width=\"100%\">\n" +
    "						<tbody>\n" +
    "							<tr>\n" +
    "								<!--\n" +
    "								<td class=\"ms-toolbar\" nowrap=\"nowrap\">\n" +
    "								<table cellpadding=\"0\" cellspacing=\"0\">\n" +
    "									<tbody>\n" +
    "										<tr>\n" +
    "											<td class=\"ms-descriptiontext\" id=\"onetidinfoblockV\">Version: 26.0</td>\n" +
    "										</tr>\n" +
    "										<tr>\n" +
    "											<td nowrap=\"nowrap\" class=\"ms-descriptiontext\" id=\"onetidinfoblock1\">\n" +
    "												<span id=\"ctl00_ctl28_g_e2bc9482_4bc2_4158_98ba_504fcc7169d8_ctl00_toolBarTbl_RptControls_ctl00_ctl00_ctl02\">\n" +
    "													Created  at 6/26/2014 6:44 PM&amp;nbsp; by\n" +
    "													<nobr>\n" +
    "														<span class=\"ms-imnSpan\">\n" +
    "															<a href=\"#\" onclick=\"IMNImageOnClick(event); return false;\" class=\"ms-imnlink ms-spimn-presenceLink\" tabindex=\"-1\">\n" +
    "																<span class=\"ms-spimn-presenceWrapper ms-imnImg ms-spimn-imgSize-10x10\">\n" +
    "																	<img title=\"\" alt=\"No presence information\" name=\"imnmark\" class=\"ms-spimn-img ms-spimn-presence-disconnected-10x10x32\" showofflinepawn=\"1\" src=\"/_layouts/15/images/spimn.png\" sip=\"alguien@example.com\" id=\"imn0,type=sip\"/>\n" +
    "																</span>\n" +
    "															</a>\n" +
    "														</span>\n" +
    "														<span class=\"ms-noWrap ms-imnSpan\">\n" +
    "															<a href=\"#\" onclick=\"IMNImageOnClick(event); return false;\" class=\"ms-imnlink\" tabindex=\"-1\">\n" +
    "																<img title=\"\" alt=\"No presence information\" name=\"imnmark\" class=\"ms-hide\" showofflinepawn=\"1\" src=\"/_layouts/15/images/spimn.png\" sip=\"alguien@example.com\" id=\"imn1,type=sip\"/>\n" +
    "															</a>\n" +
    "															<a onclick=\"GoToLinkOrDialogNewWindow(this); return false;\" class=\"ms-peopleux-userdisplink ms-subtleLink\" href=\"/_layouts/15/listform.aspx?PageType=4&amp;ListId={a12cca6c-a92e-495a-80ce-66f110b74735}&amp;ID=1\">0#.w|sp2013-01\\administrador</a>\n" +
    "														</span>\n" +
    "													</nobr>\n" +
    "												</span>\n" +
    "											</td>\n" +
    "										</tr>\n" +
    "										<tr>\n" +
    "											<td nowrap=\"nowrap\" class=\"ms-descriptiontext\" id=\"onetidinfoblock2\">\n" +
    "												<span id=\"ctl00_ctl28_g_e2bc9482_4bc2_4158_98ba_504fcc7169d8_ctl00_toolBarTbl_RptControls_ctl00_ctl00_ctl03\">\n" +
    "													Last modified at 7/14/2014 1:15 PM&amp;nbsp; by\n" +
    "													<nobr>\n" +
    "														<span class=\"ms-imnSpan\">\n" +
    "															<a href=\"#\" onclick=\"IMNImageOnClick(event); return false;\" class=\"ms-imnlink ms-spimn-presenceLink\" tabindex=\"-1\">\n" +
    "																<span class=\"ms-spimn-presenceWrapper ms-imnImg ms-spimn-imgSize-10x10\">\n" +
    "																	<img title=\"\" alt=\"No presence information\" name=\"imnmark\" class=\"ms-spimn-img ms-spimn-presence-disconnected-10x10x32\" showofflinepawn=\"1\" src=\"/_layouts/15/images/spimn.png\" sip=\"alguien@example.com\" id=\"imn2,type=sip\"/>\n" +
    "																</span>\n" +
    "															</a>\n" +
    "														</span>\n" +
    "														<span class=\"ms-noWrap ms-imnSpan\">\n" +
    "															<a href=\"#\" onclick=\"IMNImageOnClick(event); return false;\" class=\"ms-imnlink\" tabindex=\"-1\">\n" +
    "																<img title=\"\" alt=\"No presence information\" name=\"imnmark\" class=\"ms-hide\" showofflinepawn=\"1\" src=\"/_layouts/15/images/spimn.png\" sip=\"alguien@example.com\" id=\"imn3,type=sip\"/>\n" +
    "															</a>\n" +
    "															<a onclick=\"GoToLinkOrDialogNewWindow(this); return false;\" class=\"ms-peopleux-userdisplink ms-subtleLink\" href=\"/_layouts/15/listform.aspx?PageType=4&amp;ListId={a12cca6c-a92e-495a-80ce-66f110b74735}&amp;ID=1\">0#.w|sp2013-01\\administrador</a>\n" +
    "														</span>\n" +
    "													</nobr>\n" +
    "												</span>\n" +
    "											</td>\n" +
    "										</tr>\n" +
    "									</tbody>\n" +
    "								</table>\n" +
    "							</td>\n" +
    "							-->\n" +
    "							<td width=\"99%\" class=\"ms-toolbar\" nowrap=\"nowrap\">\n" +
    "								<img src=\"/_layouts/15/images/blank.gif\" width=\"1\" height=\"18\" alt=\"\"/>\n" +
    "							</td>\n" +
    "\n" +
    "							<td class=\"ms-toolbar\" nowrap=\"nowrap\">\n" +
    "								<!--\n" +
    "								<table cellpadding=\"0\" cellspacing=\"0\" width=\"100%\">\n" +
    "									<tbody>\n" +
    "										<tr>\n" +
    "											<td align=\"right\" width=\"100%\" nowrap=\"nowrap\">\n" +
    "												<input type=\"button\" name=\"ctl00$ctl28$g_e2bc9482_4bc2_4158_98ba_504fcc7169d8$ctl00$toolBarTbl$RightRptControls$ctl01$ctl00$diidIOGoBack\" value=\"Close\" onclick=\"STSNavigate('http:\\u002f\\u002fsp2013-01\\u002fLists\\u002fIssues\\u002fAllItems.aspx');return false;WebForm_DoPostBackWithOptions(new WebForm_PostBackOptions(&quot;ctl00$ctl28$g_e2bc9482_4bc2_4158_98ba_504fcc7169d8$ctl00$toolBarTbl$RightRptControls$ctl01$ctl00$diidIOGoBack&quot;, &quot;&quot;, true, &quot;&quot;, &quot;&quot;, false, true))\" id=\"ctl00_ctl28_g_e2bc9482_4bc2_4158_98ba_504fcc7169d8_ctl00_toolBarTbl_RightRptControls_ctl01_ctl00_diidIOGoBack\" accesskey=\"C\" class=\"ms-ButtonHeightWidth\" target=\"_self\"/>								\n" +
    "											</td>\n" +
    "										</tr>\n" +
    "									</tbody>\n" +
    "								</table>\n" +
    "								-->\n" +
    "							<input type=\"button\" value=\"Close\" class=\"ms-ButtonHeightWidth\" ng-click=\"cancelForm()\" />\n" +
    "\n" +
    "						</td>\n" +
    "					</tr>\n" +
    "				</tbody>\n" +
    "			</table>\n" +
    "		</td>\n" +
    "	</tr>\n" +
    "</tbody>\n" +
    "</table>\n" +
    "\n" +
    "<!-- Form Toolbar EDIT MODE -->\n" +
    "<table cellpadding=\"0\" cellspacing=\"0\" width=\"100%\" style=\"padding-top: 7px\" ng-if=\"mode != 'display'\">\n" +
    "<tbody>\n" +
    "	<tr>\n" +
    "		<td width=\"100%\">\n" +
    "			<!--\n" +
    "					<input name=\"ctl00$ctl28$g_ba9f6e2a_381a_4eeb_8d37_4d5b28b8f15a$ctl00$ctl08$ctl00$owshiddenversion\" type=\"HIDDEN\" id=\"ctl00_ctl28_g_ba9f6e2a_381a_4eeb_8d37_4d5b28b8f15a_ctl00_ctl08_ctl00_owshiddenversion\" value=\"25\"/>\n" +
    "			-->\n" +
    "			<table class=\"ms-formtoolbar\" cellpadding=\"2\" cellspacing=\"0\" border=\"0\" id=\"ctl00_ctl28_g_ba9f6e2a_381a_4eeb_8d37_4d5b28b8f15a_ctl00_toolBarTbl\" width=\"100%\">\n" +
    "				<tbody>\n" +
    "					<tr>\n" +
    "						<!--\n" +
    "								<td class=\"ms-toolbar\" nowrap=\"nowrap\">\n" +
    "						<table cellpadding=\"0\" cellspacing=\"0\">\n" +
    "							<tbody>\n" +
    "								<tr>\n" +
    "									<td class=\"ms-descriptiontext\" id=\"onetidinfoblockV\">Version: 25.0</td>\n" +
    "								</tr>\n" +
    "								<tr>\n" +
    "									<td nowrap=\"nowrap\" class=\"ms-descriptiontext\" id=\"onetidinfoblock1\">\n" +
    "										<span id=\"ctl00_ctl28_g_ba9f6e2a_381a_4eeb_8d37_4d5b28b8f15a_ctl00_toolBarTbl_RptControls_ctl00_ctl00_ctl02\">\n" +
    "											Created  at 6/26/2014 6:44 PM&nbsp; by\n" +
    "											<nobr>\n" +
    "												<span class=\"ms-imnSpan\">\n" +
    "													<a href=\"#\" onclick=\"IMNImageOnClick(event); return false;\" class=\"ms-imnlink ms-spimn-presenceLink\" tabindex=\"-1\">\n" +
    "														<span class=\"ms-spimn-presenceWrapper ms-imnImg ms-spimn-imgSize-10x10\">\n" +
    "															<img title=\"\" alt=\"No presence information\" name=\"imnmark\" class=\"ms-spimn-img ms-spimn-presence-disconnected-10x10x32\" showofflinepawn=\"1\" src=\"/_layouts/15/images/spimn.png\" sip=\"alguien@example.com\" id=\"imn0,type=sip\"/>\n" +
    "														</span>\n" +
    "													</a>\n" +
    "												</span>\n" +
    "												<span class=\"ms-noWrap ms-imnSpan\">\n" +
    "													<a href=\"#\" onclick=\"IMNImageOnClick(event); return false;\" class=\"ms-imnlink\" tabindex=\"-1\">\n" +
    "														<img title=\"\" alt=\"No presence information\" name=\"imnmark\" class=\"ms-hide\" showofflinepawn=\"1\" src=\"/_layouts/15/images/spimn.png\" sip=\"alguien@example.com\" id=\"imn1,type=sip\"/>\n" +
    "													</a>\n" +
    "													<a onclick=\"GoToLinkOrDialogNewWindow(this); return false;\" class=\"ms-peopleux-userdisplink ms-subtleLink\" href=\"/_layouts/15/listform.aspx?PageType=4&amp;ListId={a12cca6c-a92e-495a-80ce-66f110b74735}&amp;ID=1\">0#.w|sp2013-01\\administrador</a>\n" +
    "												</span>\n" +
    "											</nobr>\n" +
    "										</span>\n" +
    "									</td>\n" +
    "								</tr>\n" +
    "								<tr>\n" +
    "									<td nowrap=\"nowrap\" class=\"ms-descriptiontext\" id=\"onetidinfoblock2\">\n" +
    "										<span id=\"ctl00_ctl28_g_ba9f6e2a_381a_4eeb_8d37_4d5b28b8f15a_ctl00_toolBarTbl_RptControls_ctl00_ctl00_ctl03\">\n" +
    "											Last modified at 7/14/2014 12:51 PM&nbsp; by\n" +
    "											<nobr>\n" +
    "												<span class=\"ms-imnSpan\">\n" +
    "													<a href=\"#\" onclick=\"IMNImageOnClick(event); return false;\" class=\"ms-imnlink ms-spimn-presenceLink\" tabindex=\"-1\">\n" +
    "														<span class=\"ms-spimn-presenceWrapper ms-imnImg ms-spimn-imgSize-10x10\">\n" +
    "															<img title=\"\" alt=\"No presence information\" name=\"imnmark\" class=\"ms-spimn-img ms-spimn-presence-disconnected-10x10x32\" showofflinepawn=\"1\" src=\"/_layouts/15/images/spimn.png\" sip=\"alguien@example.com\" id=\"imn2,type=sip\"/>\n" +
    "														</span>\n" +
    "													</a>\n" +
    "												</span>\n" +
    "												<span class=\"ms-noWrap ms-imnSpan\">\n" +
    "													<a href=\"#\" onclick=\"IMNImageOnClick(event); return false;\" class=\"ms-imnlink\" tabindex=\"-1\">\n" +
    "														<img title=\"\" alt=\"No presence information\" name=\"imnmark\" class=\"ms-hide\" showofflinepawn=\"1\" src=\"/_layouts/15/images/spimn.png\" sip=\"alguien@example.com\" id=\"imn3,type=sip\"/>\n" +
    "													</a>\n" +
    "													<a onclick=\"GoToLinkOrDialogNewWindow(this); return false;\" class=\"ms-peopleux-userdisplink ms-subtleLink\" href=\"/_layouts/15/listform.aspx?PageType=4&amp;ListId={a12cca6c-a92e-495a-80ce-66f110b74735}&amp;ID=1\">0#.w|sp2013-01\\administrador</a>\n" +
    "												</span>\n" +
    "											</nobr>\n" +
    "										</span>\n" +
    "									</td>\n" +
    "								</tr>\n" +
    "							</tbody>\n" +
    "						</table>\n" +
    "					</td>\n" +
    "					-->\n" +
    "					<td width=\"99%\" class=\"ms-toolbar\" nowrap=\"nowrap\">\n" +
    "						<img src=\"/_layouts/15/images/blank.gif\" width=\"1\" height=\"18\" alt=\"\"/>\n" +
    "					</td>\n" +
    "\n" +
    "					<td class=\"ms-toolbar\" nowrap=\"nowrap\">\n" +
    "\n" +
    "						<!--\n" +
    "									<table cellpadding=\"0\" cellspacing=\"0\" width=\"100%\">\n" +
    "						<tbody>\n" +
    "							<tr>\n" +
    "								<td align=\"right\" width=\"100%\" nowrap=\"nowrap\">\n" +
    "									<input type=\"button\" name=\"ctl00$ctl28$g_ba9f6e2a_381a_4eeb_8d37_4d5b28b8f15a$ctl00$toolBarTbl$RightRptControls$ctl00$ctl00$diidIOSaveItem\" value=\"Save\"\n" +
    "													       onclick=\"if (!PreSaveItem()) return false;if (SPClientForms.ClientFormManager.SubmitClientForm('WPQ2')) return false;WebForm_DoPostBackWithOptions(new WebForm_PostBackOptions(&quot;ctl00$ctl28$g_ba9f6e2a_381a_4eeb_8d37_4d5b28b8f15a$ctl00$toolBarTbl$RightRptControls$ctl00$ctl00$diidIOSaveItem&quot;, &quot;&quot;, true, &quot;&quot;, &quot;&quot;, false, true))\"\n" +
    "													       id=\"ctl00_ctl28_g_ba9f6e2a_381a_4eeb_8d37_4d5b28b8f15a_ctl00_toolBarTbl_RightRptControls_ctl00_ctl00_diidIOSaveItem\" accesskey=\"O\" class=\"ms-ButtonHeightWidth\" target=\"_self\"/>\n" +
    "								</td>\n" +
    "							</tr>\n" +
    "						</tbody>\n" +
    "					</table>\n" +
    "					-->\n" +
    "					<input type=\"button\" value=\"Save\" class=\"ms-ButtonHeightWidth\" ng-click=\"saveForm()\" />\n" +
    "\n" +
    "				</td>\n" +
    "\n" +
    "				<td class=\"ms-separator\">&nbsp;</td>\n" +
    "\n" +
    "				<td class=\"ms-toolbar\" nowrap=\"nowrap\">\n" +
    "\n" +
    "					<!--\n" +
    "									<table cellpadding=\"0\" cellspacing=\"0\" width=\"100%\">\n" +
    "					<tbody>\n" +
    "						<tr>\n" +
    "							<td align=\"right\" width=\"100%\" nowrap=\"nowrap\">\n" +
    "								<input type=\"button\" name=\"ctl00$ctl28$g_ba9f6e2a_381a_4eeb_8d37_4d5b28b8f15a$ctl00$toolBarTbl$RightRptControls$ctl01$ctl00$diidIOGoBack\" value=\"Cancel\"\n" +
    "													       onclick=\"STSNavigate('http:\\u002f\\u002fsp2013-01\\u002fLists\\u002fIssues\\u002fAllItems.aspx');return false;WebForm_DoPostBackWithOptions(new WebForm_PostBackOptions(&quot;ctl00$ctl28$g_ba9f6e2a_381a_4eeb_8d37_4d5b28b8f15a$ctl00$toolBarTbl$RightRptControls$ctl01$ctl00$diidIOGoBack&quot;, &quot;&quot;, true, &quot;&quot;, &quot;&quot;, false, true))\"\n" +
    "													       id=\"ctl00_ctl28_g_ba9f6e2a_381a_4eeb_8d37_4d5b28b8f15a_ctl00_toolBarTbl_RightRptControls_ctl01_ctl00_diidIOGoBack\" accesskey=\"C\" class=\"ms-ButtonHeightWidth\" target=\"_self\"/>\n" +
    "							</td>\n" +
    "						</tr>\n" +
    "					</tbody>\n" +
    "				</table>\n" +
    "				-->\n" +
    "				<input type=\"button\" value=\"Cancel\" class=\"ms-ButtonHeightWidth\" ng-click=\"cancelForm()\" />\n" +
    "			</td>\n" +
    "		</tr>\n" +
    "	</tbody>\n" +
    "</table>\n" +
    "</td>\n" +
    "</tr>\n" +
    "</tbody>\n" +
    "</table>\n" +
    "</div>");
}]);

angular.module("templates/form-templates/spform.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("templates/form-templates/spform.html",
    "<div>\n" +
    "	<table class=\"ms-formtable\" style=\"margin-top: 8px;\" border=\"0\" cellpadding=\"0\" cellspacing=\"0\" width=\"100%\">\n" +
    "		<tbody>\n" +
    "			<tr ng-repeat=\"field in fields\" spfield=\"{{field.InternalName}}\"></tr>\n" +
    "		</tbody>\n" +
    "	</table>\n" +
    "\n" +
    "	<spform-toolbar></spform-toolbar>\n" +
    "</div>\n" +
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
