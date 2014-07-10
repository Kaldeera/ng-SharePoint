angular.module('ngSharePoint.templates', ['templates/error.html', 'templates/form-templates/spfield-control.html', 'templates/form-templates/spfield-description.html', 'templates/form-templates/spfield-label.html', 'templates/form-templates/spfield-text-display.html', 'templates/form-templates/spfield-text-edit.html', 'templates/form-templates/spfield.html', 'templates/form-templates/spform.html', 'templates/scroll.html']);

angular.module("templates/error.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("templates/error.html",
    "<h3>Error!!</h3>\n" +
    "");
}]);

angular.module("templates/form-templates/spfield-control.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("templates/form-templates/spfield-control.html",
    "<span dir=\"none\">\n" +
    "	\n" +
    "</span>");
}]);

angular.module("templates/form-templates/spfield-description.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("templates/form-templates/spfield-description.html",
    "<span class=\"ms-metadata\" ng-bind=\"description\" ng-show=\"mode == 'edit'\"></span>");
}]);

angular.module("templates/form-templates/spfield-label.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("templates/form-templates/spfield-label.html",
    "<h3 class=\"ms-standardheader\"><nobr>{{label}}<span class=\"ms-accentText\" title=\"This is a required field.\" ng-show=\"required && mode == 'edit'\"> *</span></nobr></h3>");
}]);

angular.module("templates/form-templates/spfield-text-display.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("templates/form-templates/spfield-text-display.html",
    "<div ng-bind=\"value\"></div>");
}]);

angular.module("templates/form-templates/spfield-text-edit.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("templates/form-templates/spfield-text-edit.html",
    "<input type=\"text\" ng-model=\"value\" maxlength=\"{{schema.MaxLength}}\" required=\"{{schema.Required}}\"  class=\"ms-long ms-spellcheck-true\" />");
}]);

angular.module("templates/form-templates/spfield.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("templates/form-templates/spfield.html",
    "<tr>\n" +
    "	<td nowrap=\"true\" valign=\"top\" width=\"113px\" class=\"ms-formlabel\">\n" +
    "		<!--<h3 class=\"ms-standardheader\"><nobr>Title<span class=\"ms-accentText\" title=\"This is a required field.\"> *</span></nobr></h3>-->\n" +
    "		<spfield-label name=\"{{name}}\" {{mode}}></spfield-label>\n" +
    "	</td>\n" +
    "	<td valign=\"top\" width=\"350px\" class=\"ms-formbody\">\n" +
    "		<!-- FieldName=\"Title\" FieldInternalName=\"Title\" FieldType=\"SPFieldText\" -->\n" +
    "		<!--\n" +
    "		<span dir=\"none\"><input type=\"text\" value=\"Issue 1\" maxlength=\"255\" id=\"Title_fa564e0f-0c70-4ab9-b863-0177e6ddd247_$TextField\" title=\"Title\" class=\"ms-long ms-spellcheck-true\"><br></span>\n" +
    "		<span class=\"ms-metadata\">Esta es la descripción del campo 'Title'.</span>\n" +
    "		-->\n" +
    "\n" +
    "		<spfield-control name=\"{{name}}\" {{mode}}></spfield-control>\n" +
    "		<spfield-description name=\"{{name}}\" {{mode}}></spfield-description>\n" +
    "	</td>\n" +
    "</tr>");
}]);

angular.module("templates/form-templates/spform.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("templates/form-templates/spform.html",
    "<div class=\"container\">\n" +
    "	<spfield ng-repeat=\"field in fields\" name=\"{{field.InternalName}}\"></spfield>\n" +
    "</div>");
}]);

angular.module("templates/scroll.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("templates/scroll.html",
    "<div class=\"loading\">\n" +
    "	<div ng-show=\"onLoading\">Loading ...</div>\n" +
    "	<a class=\"g-btn btn-more\" ng-click=\"loadNextPage()\" ng-show=\"!lastPage && !onLoading\">See more</a>\n" +
    "</div>\n" +
    "");
}]);
