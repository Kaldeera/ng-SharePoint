/**
 * @ngdoc object
 * @name ngSharePoint.SPUtils
 *
 * @description
 * This factory provides helpers and utilities.
 *
 * *Documentation is pending*
 */


angular.module('ngSharePoint').factory('SPUtils',

    ['SPConfig', '$q', '$http', '$injector', 'ODataParserProvider',

    function SPUtils_Factory(SPConfig, $q, $http, $injector, ODataParserProvider) {

        'use strict';


        var isSharePointReady = false;

        return {



            inDesignMode: function () {
                var publishingEdit = window.g_disableCheckoutInEditMode;
                var form = document.forms[MSOWebPartPageFormName];
                var input = form.MSOLayout_InDesignMode || form._wikiPageMode;

                return !!(publishingEdit || (input && input.value));
            },



            SharePointReady: function () {

                var deferred = $q.defer();
                var self = this;

                if (window.SP === undefined) {

                    // ng-SharePoint is running outside of SharePoint site
                    isSharePointReady = true;
                }

                if (isSharePointReady) {

                    deferred.resolve();

                } else {

                    // http://mahmoudfarhat.net/post/2013/03/23/SharePoint-2013-ExecuteOrDelayUntilScriptLoaded-not-executing-after-page-publish.aspx
                    // Load sp.js
                    SP.SOD.executeFunc('sp.js', 'SP.ClientContext', function () {

                        var loadScriptPromises = [],
                            loadResourcePromises = [];

                        // Loads additional needed scripts
                        loadScriptPromises.push(self.loadScript('SP.RequestExecutor.js', 'SP.RequestExecutor'));

                        // Shows current SPconfig settings.
                        // console.info(SPConfig.options);


                        if (SPConfig.options.loadMinimalSharePointInfraestructure === false) {

                            loadScriptPromises.push(self.loadScript('SP.UserProfiles.js', 'SP.UserProfiles'));
                            loadScriptPromises.push(self.loadScript('datepicker.debug.js', 'clickDatePicker'));
                            loadScriptPromises.push(self.loadScript('clienttemplates.js', 'SPClientTemplates'));
                            loadScriptPromises.push(self.loadScript('clientforms.js', 'SPClientForms'));
                            loadScriptPromises.push(self.loadScript('clientpeoplepicker.js', 'SPClientPeoplePicker'));
                            loadScriptPromises.push(self.loadScript('autofill.js', 'SPClientAutoFill'));
                            loadScriptPromises.push(self.loadScript(_spPageContextInfo.currentLanguage + '/initstrings.js', 'Strings'));
                            loadScriptPromises.push(self.loadScript(_spPageContextInfo.currentLanguage + '/strings.js', 'Strings'));
                        }

                        // Resolve script promises
                        $q.all(loadScriptPromises).then(function() {

                            if (SPConfig.options.loadMinimalSharePointInfraestructure === false || SPConfig.options.forceLoadResources) {

                                // Process resource files
                                angular.forEach(SPConfig.options.resourceFiles.get(), function(filename) {

                                    // Add the 'resx' extension to the 'filename' if don't have it.
                                    if (filename.indexOf('.resx') == -1) {
                                        filename += '.resx';
                                    }

                                    loadResourcePromises.push(self.loadResourceFile(filename));
                                });

                            }

                            // Resolve resource promises
                            $q.all(loadResourcePromises).then(function() {

                                isSharePointReady = true;
                                deferred.resolve();

                            }, function(err) {

                                console.error('Error loading SharePoint resources dependences.', err);
                                deferred.reject(err);
                            });

                        }, function(err) {

                            console.error('Error loading SharePoint scripts dependences.', err);
                            deferred.reject(err);
                        });

                    });
                }

                return deferred.promise;
            },



            loadResourceFile: function(resourceFilename) {

                var deferred = $q.defer();
                var pos = resourceFilename.lastIndexOf('.resx');
                var name = resourceFilename.substr(0, (pos != -1 ? pos : resourceFilename.length));
                var url;
                var params = '?name=' + name + '&culture=' + STSHtmlEncode(Strings.STS.L_CurrentUICulture_Name || _spPageContextInfo.currentUICultureName);


                if (SPConfig.options.force15LayoutsDirectory) {
                    url = '/_layouts/15/ScriptResx.ashx' + params;
                } else {
                    url = SP.Utilities.Utility.getLayoutsPageUrl('ScriptResx.ashx') + params;
                }

                $http.get(url)
                    .success(function(data, status, headers, config) {

                        window.Resources = window.Resources || {};

                        // Fix bad transformation in core.resx
                        data = data.replace(/align - right|align-right/g, 'align_right');
                        data = data.replace(/e - mail|e-mail/g, 'email');
                        data = data.replace(/e - Mail|e-Mail/g, 'email');
                        data = data.replace(/tty - TDD|tty-TDD/g, 'tty_TDD');

                        try {
                            var _eval = eval; // Fix jshint warning: eval can be harmful.
                            _eval(data);

                            window.Res = window.Res || void 0;

                            if (window.Res !== void 0) {
                                window.Resources[name] = window.Res;
                            }

                        } catch(ex) {

                            console.error(ex);
                        }

                        deferred.resolve();

                    })
                    .error(function(data, status, headers, config) {

                        deferred.resolve();
                    });

                return deferred.promise;
            },



            loadScript: function(scriptFilename, functionName) {

                var deferred = $q.defer();

                if (SPConfig.options.force15LayoutsDirectory) {
                    SP.SOD.registerSod(scriptFilename, '/_layouts/15/' + scriptFilename);
                } else {
                    SP.SOD.registerSod(scriptFilename, SP.Utilities.Utility.getLayoutsPageUrl(scriptFilename));
                }

                EnsureScriptFunc(scriptFilename, functionName, function() {
                    deferred.resolve();
                });

                return deferred.promise;
            },



            generateCamlQuery: function (queryInfo, listSchema) {
                /*
                    Formato del objeto de filtro:
                    {
                        filter: 'Country eq ' + $routeParams.country + ' and Modified eq [Today]',
                        orderBy: 'Title asc, Modified desc',
                        select: 'Title, Country',
                        top: 10,
                        pagingInfo: 'Paged=TRUE&p_ID=nnn[&PagedPrev=TRUE]'
                    }
                */
                var camlQueryXml = "";
                var camlQuery;

                if (queryInfo === undefined) {
                    camlQuery = SP.CamlQuery.createAllItemsQuery();
                } else {
                    // El formato del parametro puede ser un objeto, que hay que procesar, o un string directo de CamlQuery
                    if (typeof queryInfo === 'string') {
                        camlQueryXml = queryInfo;
                    } else if (typeof queryInfo === 'object') {
                        var odata = ODataParserProvider.ODataParser(listSchema);
                        odata.parseExpression(queryInfo);
                        camlQueryXml = odata.getCAMLQuery();
                    }

                    if (camlQueryXml) {
                        camlQuery = new SP.CamlQuery();
                        camlQuery.set_viewXml(camlQueryXml);
                    }

                    if (queryInfo.pagingInfo) {
                        var position = new SP.ListItemCollectionPosition();
                        position.set_pagingInfo(queryInfo.pagingInfo);
                        camlQuery.set_listItemCollectionPosition(position);
                    }
                }
                return camlQuery;
            },



            getRegionalSettings: function() {

                var self = this;
                var deferred = $q.defer();

                this.SharePointReady().then(function() {
                    var ctx = new SP.ClientContext.get_current();
                    var web = ctx.get_web();
                    var regionalSettings = web.get_regionalSettings();
                    var timeZone = regionalSettings.get_timeZone();

                    ctx.load(regionalSettings);
                    ctx.load(timeZone);

                    ctx.executeQueryAsync(function() {

                        regionalSettings.TimeZone = timeZone;
                        deferred.resolve(regionalSettings);

                    }, function(sender, args) {

                        deferred.reject({ sender: sender, args: args });
                    });
                });

                return deferred.promise;
            },


            refreshDigestValue: function(baseUrl) {

                var self = this;
                var deferred = $q.defer();

                var url = (baseUrl || _spPageContextInfo.webAbsoluteUrl) + '/_api/contextinfo';
                $http({

                    url: url,
                    method: "POST",
                    headers: { "Accept": "application/json; odata=verbose"}

                }).then(function (data) {

                    var requestDigest = document.getElementById('__REQUESTDIGEST');
                    if (requestDigest !== null) {
                        requestDigest.value = data.data.d.GetContextWebInformation.FormDigestValue;
                    }

                    deferred.resolve(data.data.d.GetContextWebInformation.FormDigestValue);

                }, function (data) {
                    console.log(data.data);
                    deferred.reject(data.data);
                });

                return deferred.promise;
            },

            // TODA ESTA FUNCIONALIDAD DEBE ESTAR DENTRO DE UN SERVICIO SPUser (o algo asi)
            // O en todo caso, la llamada a getCurrentUser debe ser del SPWeb!!!
            getCurrentUser: function() {

                var self = this;
                var deferred = $q.defer();

                this.SharePointReady().then(function() {
                    var ctx = new SP.ClientContext.get_current();
                    var web = ctx.get_web();
                    var user = web.get_currentUser();

                    ctx.load(user);

                    ctx.executeQueryAsync(function() {

                        deferred.resolve(user);

                    }, function(sender, args) {

                        deferred.reject({ sender: sender, args: args });
                    });
                });

                return deferred.promise;
            },


            getUserId: function(loginName) {

                var self = this;
                var deferred = $q.defer();

                var ctx = new SP.ClientContext.get_current();
                var user = ctx.get_web().ensureUser(loginName);
                ctx.load(user);
                ctx.executeQueryAsync(function() {

                    deferred.resolve(user.get_id());

                }, function(sender, args) {

                    deferred.reject({ sender: sender, args: args });
                });

                return deferred.promise;
            },


            getUserRegionalSettings: function(loginName) {

                var self = this;
                var deferred = $q.defer();

                this.SharePointReady().then(function() {
                    var ctx = new SP.ClientContext.get_current();
                    var peopleManager = new SP.UserProfiles.PeopleManager(ctx);
                    //var userRegionalSettings = peopleManager.getUserProfilePropertyFor(loginName, 'RegionalSettings');
                    //var userProperties = peopleManager.getPropertiesFor(loginName);
                    var userProperties = peopleManager.getMyProperties();

                    ctx.load(userProperties);

                    ctx.executeQueryAsync(function() {

                        deferred.resolve(userProperties);

                    }, function(sender, args) {

                        deferred.reject({ sender: sender, args: args });
                    });
                });

                return deferred.promise;
            },


            parseXmlString: function(xmlDocStr) {

                var xmlDoc;

                if (window.DOMParser) {

                    var parser = new window.DOMParser();
                    xmlDoc = parser.parseFromString(xmlDocStr, "text/xml");

                } else {

                    // IE :(
                    if(xmlDocStr.indexOf("<?") === 0) {
                        xmlDocStr = xmlDocStr.substr(xmlDocStr.indexOf("?>") + 2);
                    }

                    xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
                    xmlDoc.async = "false";
                    xmlDoc.loadXML(xmlDocStr);

                }

                return xmlDoc;
            },


            getCurrentUserLCID: function() {

                var self = this;
                var deferred = $q.defer();

                var url = _spPageContextInfo.webServerRelativeUrl.rtrim('/') + "/_layouts/15/regionalsetng.aspx?Type=User";

                $http.get(url).success(function(data) {

                    var html = angular.element(data);
                    var form, lcid;

                    angular.forEach(html, function(element) {
                        if (element.tagName && element.tagName.toLowerCase() === 'form') {
                            form = element;
                        }
                    });

                    if (form !== void 0) {
                        if (form.querySelector('#ctl00_PlaceHolderMain_ctl08_ChkFollowWebRegionalSettings').checked) {
                            // user inherits web settings
                            lcid = _spPageContextInfo.currentLanguage;
                        } else {
                            var regionalSettingsSelect = form.querySelector('#ctl00_PlaceHolderMain_ctl02_ctl01_DdlwebLCID');
                            var selectedOption = regionalSettingsSelect.querySelector('[selected]');
                            lcid = selectedOption.value;
                        }
                    }


                    deferred.resolve(lcid);

                });

                return deferred.promise;
            },



            getWebById: function(webId) {

                var self = this;
                var deferred = $q.defer();

                this.SharePointReady().then(function() {
                    var ctx = new SP.ClientContext();
                    var site = ctx.get_site();
                    var web = site.openWebById(webId.ltrim('{').rtrim('}'));

                    ctx.load(web, 'ServerRelativeUrl');

                    ctx.executeQueryAsync(function() {

                        deferred.resolve(web);

                    }, function(sender, args) {

                        deferred.reject({ sender: sender, args: args });
                    });
                });

                return deferred.promise;
            },



            /**
             * Converts a file object to binary data string.
             * @param {file} A file object from the files property of the DOM element <input type="File" ... />.
             * @returns {promise} Promise with the binary data.
             */
            getFileBinary: function(file) {

                var self = this;
                var deferred = $q.defer();
                var reader = new FileReader();

                reader.onload = function(e) {
                    var buffer = e.target.result;
                    var bytes = new Uint8Array(buffer);
                    var binaryData = '';

                    for (var i = 0; i < bytes.length; i++) {
                        binaryData += String.fromCharCode(bytes[i]);
                    }

                    deferred.resolve(binaryData);
                };

                reader.onerror = function(e) {
                    deferred.reject(e.target.error);
                };

                reader.readAsArrayBuffer(file);

                return deferred.promise;
            },


            /**
            * This function calls the 'fn' function injecting the params (services)
            */
            callFunctionWithParams: function(fn, scope) {

                var result = true;
                if (fn) {

                    var annotations = $injector.annotate(fn);
                    result = $injector.invoke(fn, scope, scope);

                }

                return result;
            }

        };

    }
]);
