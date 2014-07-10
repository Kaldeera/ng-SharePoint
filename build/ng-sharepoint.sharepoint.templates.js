angular.module('ngSharePoint.templates', ['templates/error.html', 'templates/form-templates/spfield-choice-display.html', 'templates/form-templates/spfield-choice-edit.html', 'templates/form-templates/spfield-control.html', 'templates/form-templates/spfield-description.html', 'templates/form-templates/spfield-label.html', 'templates/form-templates/spfield-multichoice-display.html', 'templates/form-templates/spfield-multichoice-edit.html', 'templates/form-templates/spfield-note-display.html', 'templates/form-templates/spfield-note-edit.html', 'templates/form-templates/spfield-text-display.html', 'templates/form-templates/spfield-text-edit.html', 'templates/form-templates/spfield.html', 'templates/form-templates/spform.html', 'templates/scroll.html']);

angular.module("templates/error.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("templates/error.html",
    "<h3>Error!!</h3>\n" +
    "");
}]);

angular.module("templates/form-templates/spfield-choice-display.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("templates/form-templates/spfield-choice-display.html",
    "<div ng-bind=\"value\" class=\"field-display-value\"></div>");
}]);

angular.module("templates/form-templates/spfield-choice-edit.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("templates/form-templates/spfield-choice-edit.html",
    "<select ng-model=\"value\" ng-options=\"option for option in schema.Choices.results\" ng-required=\"{{schema.Required}}\" title=\"{{schema.Title}}\" class=\"ms-RadioText\" ></select>");
}]);

angular.module("templates/form-templates/spfield-control.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("templates/form-templates/spfield-control.html",
    "<span dir=\"none\"></span>");
}]);

angular.module("templates/form-templates/spfield-description.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("templates/form-templates/spfield-description.html",
    "<span class=\"ms-metadata\" ng-bind=\"schema.Description\" ng-show=\"currentMode == 'edit'\"></span>");
}]);

angular.module("templates/form-templates/spfield-label.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("templates/form-templates/spfield-label.html",
    "<h3 class=\"ms-standardheader\"><nobr>{{schema.Title}}<span class=\"ms-accentText\" title=\"This is a required field.\" ng-show=\"schema.Required && currentMode == 'edit'\"> *</span></nobr></h3>");
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
    "					<input type=\"checkbox\" id=\"{{schema.Title}}_{{$index}}\" ng-click=\"toggleCheckbox(choice, $index, $event)\" ng-checked=\"choices.indexOf(choice) != -1\" />\n" +
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
    "<span dir=\"ltr\">\n" +
    "	<textarea ng-model=\"value\" ng-required=\"{{schema.Required}}\" rows=\"{{schema.NumberOfLines}}\" cols=\"20\" title=\"{{schema.Title}}\" class=\"ms-long\"></textarea>\n" +
    "</span>\n" +
    "<br/>\n" +
    "<span class=\"ms-formdescription\" ng-if=\"schema.RichText\" ng-show=\"currentMode == 'edit'\">\n" +
    "	<a href=\"javascript:HelpWindowKey('nsrichtext')\">Click for help about adding basic HTML formatting.</a>\n" +
    "</span>\n" +
    "<br/>");
}]);

angular.module("templates/form-templates/spfield-text-display.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("templates/form-templates/spfield-text-display.html",
    "<div ng-bind=\"value\" class=\"field-display-value\"></div>");
}]);

angular.module("templates/form-templates/spfield-text-edit.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("templates/form-templates/spfield-text-edit.html",
    "<input type=\"text\" ng-model=\"value\" maxlength=\"{{schema.MaxLength}}\" ng-required=\"{{schema.Required}}\" title=\"{{schema.Title}}\" class=\"ms-long ms-spellcheck-true\" />\n" +
    "<br/>");
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

angular.module("templates/form-templates/spform.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("templates/form-templates/spform.html",
    "<table class=\"ms-formtable\" style=\"margin-top: 8px;\" border=\"0\" cellpadding=\"0\" cellspacing=\"0\" width=\"100%\">\n" +
    "	<tbody>\n" +
    "		<tr spfield=\"\" ng-repeat=\"field in fields\" name=\"{{field.InternalName}}\"></tr>\n" +
    "	</tbody>\n" +
    "</table>\n" +
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
