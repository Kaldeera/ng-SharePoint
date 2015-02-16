/*
    SPFieldNote - directive
    
    Pau Codina (pau.codina@kaldeera.com)
    Pedro Castro (pedro.castro@kaldeera.com, pedro.cm@gmail.com)

    Copyright (c) 2014
    Licensed under the MIT License
*/



///////////////////////////////////////
//  SPFieldNote
///////////////////////////////////////

angular.module('ngSharePoint').directive('spfieldNote', 

    ['SPFieldDirective', 'SPUtils', '$q', '$timeout',

    function spfielNote_DirectiveFactory(SPFieldDirective, SPUtils, $q, $timeout) {

        var spfieldNote_DirectiveDefinitionObject = {

            restrict: 'EA',
            require: ['^spform', 'ngModel'],
            replace: true,
            scope: {
                mode: '@',
                value: '=ngModel'
            },
            templateUrl: 'templates/form-templates/spfield-control.html',


            link: function($scope, $element, $attrs, controllers) {


                var directive = {
                    
                    fieldTypeName: 'note',
                    replaceAll: false,

                    init: function() {

                        var xml = SPUtils.parseXmlString($scope.schema.SchemaXml);
                        $scope.rteFullHtml = xml.documentElement.getAttribute('RichTextMode') == 'FullHtml';
                        $scope.rteHelpMessage = STSHtmlEncode(Strings.STS.L_RichTextHelpLink);
                        $scope.rteLabelText = STSHtmlEncode(Strings.STS.L_RichTextHiddenLabelText);
                        $scope.cultureInfo = (typeof __cultureInfo == 'undefined' ? Sys.CultureInfo.CurrentCulture : __cultureInfo);

                        // Check if the field have the option "Append Changes to Existing Text" activated.
                        if ($scope.schema.AppendOnly) {

                            $scope.versions = [];

                            $scope.item.list.getDefaultViewUrl().then(function(defaultViewUrl) {

                                $scope.defaultViewUrl = defaultViewUrl;

                                getFieldVersions().then(function(versions) {

                                    $scope.versions = versions || [];

                                });

                            });

                        }

                    },


                    postRenderFn: function() {

                        if ($scope.rteFullHtml) {

                            $timeout(function() {

                                var rteElement = document.getElementById($scope.schema.EntityPropertyName + '_' + $scope.schema.Id + '_$TextField_inplacerte');

                                if (rteElement) {

                                    // Init the 'contenteditable' value
                                    rteElement.innerHTML = $scope.value || '';

                                }

                            });

                        }

                    }

                };


                SPFieldDirective.baseLinkFn.apply(directive, arguments);



                $scope.updateModel = function($event) {

                    var rteElement = document.getElementById($scope.schema.EntityPropertyName + '_' + $scope.schema.Id + '_$TextField_inplacerte');

                    if (rteElement) {

                        $scope.value = rteElement.innerHTML;

                    }

                };



                function getFieldVersions() {

                    var deferred = $q.defer();

                    // SharePoint Service <web_url>/_vti_bin/lists.asmx?op=GetVersionCollection
                    var soapCall = '<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">';
                    soapCall += '<soap:Body>';
                    soapCall += '<GetVersionCollection xmlns="http://schemas.microsoft.com/sharepoint/soap/">';
                    soapCall += '<strlistID>' + $scope.item.list.Id + '</strlistID>';
                    soapCall += '<strlistItemID>' + $scope.item.Id + '</strlistItemID>';
                    soapCall += '<strFieldName>' + $scope.schema.EntityPropertyName + '</strFieldName>';
                    soapCall += '</GetVersionCollection>';
                    soapCall += '</soap:Body>';
                    soapCall += '</soap:Envelope>';

                    $.ajax({
                        url: $scope.item.list.web.url.rtrim('/') + '/_vti_bin/lists.asmx',
                        type: "POST",
                        data: soapCall,
                        dataType: "xml",
                        contentType: "text/xml;charset='utf-8'",
                        complete: function(result, status) {

                            console.log(result);

                            if (result.status == 200) {

                                var resultXml = SPUtils.parseXmlString(result.responseText);
                                var versionNodeCollection = resultXml.getElementsByTagName('Version');
                                var versions = [];

                                angular.forEach(versionNodeCollection, function(versionNode) {

                                    // Parse the 'Editor' attribute
                                    var editorAttribute = versionNode.getAttribute('Editor');
                                    var editor = {
                                        id: 0,
                                        name: ''
                                    };

                                    if (editorAttribute) {

                                        var editorValues = editorAttribute.split(',');

                                        if (editorValues.length > 0) {

                                            var editorData = editorValues[0].split(';#');

                                            editor.id = editorData[0];
                                            editor.name = editorData[1];

                                        }

                                    }

                                    var version = {
                                        value: versionNode.getAttribute($scope.schema.EntityPropertyName),
                                        modified: versionNode.getAttribute('Modified'),
                                        editor: editor
                                    };

                                    versions.push(version);

                                });


                                deferred.resolve(versions);

                            } else {

                                deferred.reject();

                            }
                            
                        }

                    });


                    return deferred.promise;

                } // getFieldVersions

            } // link

        }; // Directive definition object


        return spfieldNote_DirectiveDefinitionObject;

    } // Directive factory

]);
