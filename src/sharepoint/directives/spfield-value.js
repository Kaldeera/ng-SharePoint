/*
    SPFieldValue - directive

    Pedro Castro (pedro.castro@kaldeera.com, pedro.cm@gmail.com)
    Pau Codina (pau.codina@kaldeera.com)

    Copyright (c) 2014
    Licensed under the MIT License
*/



//////////////////////////////////////////////////
//  SPFieldValue
//  Shows a item field (display mode)
//////////////////////////////////////////////////

(function() {

    'use strict';

    angular
        .module('ngSharePoint')
        .directive('spfieldValue', spfieldValue);


    spfieldValue.$inject = ['$q', 'SharePoint', '$filter'];


    /* @ngInject */
    function spfieldValue($q, SharePoint, $filter) {

        var directive = {

            restrict: 'AE',
            template: '<div ng-bind-html="fieldValue | unsafe"></div>',
            replace: true,
            scope: {
                item: '=',
                field: '='
            },
            link: postLink,

        };

        return directive;



        ///////////////////////////////////////////////////////////////////////////////



        function postLink(scope, element, attrs) {

            if (!angular.isDefined(scope.item) || !angular.isDefined(scope.field)) {

                throw 'Required "item" or "field" attributes missing in SPFieldValue directive.';

            }


            // Init the field value
            scope.fieldValue = '';


            var fieldType = scope.field.TypeAsString || scope.field.Type;
            var fieldName = scope.field.InternalName || scope.field.Name;
            fieldName = fieldName + (fieldType == 'Lookup' || fieldType == 'LookupMulti' || fieldType == 'User' || fieldType == 'UserMulti' ? 'Id' : '');
            var fieldValue = scope.item[fieldName] || '';


            if (fieldValue !== '') {

                switch(fieldType) {

                    case 'DateTime':
                        var cultureInfo = (typeof __cultureInfo == 'undefined' ? Sys.CultureInfo.CurrentCulture : __cultureInfo);
                        scope.fieldValue = '<span>' + new Date(fieldValue).format(cultureInfo.dateTimeFormat.ShortDatePattern) + '</span>';
                        break;

                    case 'MultiChoice':
                        if (fieldValue === void 0 || fieldValue === null) {
                            fieldValue = { results: [] };
                        }
                        scope.fieldValue = '<span>' + fieldValue.results.join('; ') + '</span>';
                        break;

                    case 'Boolean':
                        scope.fieldValue = '<span>' + $filter('boolean')(fieldValue) + '</span>';
                        break;

                    case 'User':
                    case 'UserMulti':
                    case 'Lookup':
                    case 'LookupMulti':

                        if (fieldValue === void 0 || fieldValue === null) {
                            fieldValue = { results: [] };
                        }

                        if (!angular.isObject(fieldValue)) {
                            fieldValue = { results: [fieldValue].filter(Boolean) };
                        }

                        getLookupValues(fieldValue.results).then(function(values) {

                            scope.fieldValue = '<span>';

                            angular.forEach(values, function(value) {

                                scope.fieldValue += '<a href="' + value.url + '" onclick="if(event.stopPropagation) event.stopPropagation();">' + value.title + '</a>, ';

                            });

                            // Remove the comma from the last element
                            scope.fieldValue = scope.fieldValue.replace(/ *, *$/, '');

                            scope.fieldValue += '</span>';

                        });

                        break;

                    case 'URL':
                        // Url
                        if (scope.field.DisplayFormat === 0) {
                            scope.fieldValue += '<a href="' + fieldValue.Url + '" target="_blank" onclick="if(event.stopPropagation) event.stopPropagation();">' + fieldValue.Description + '</a>';
                        }

                        // Image
                        if (scope.field.DisplayFormat === 1) {
                            scope.fieldValue += '<img src="' + fieldValue.Url + '" alt="' + fieldValue.Description + '" />';
                        }

                        break;

                    default:
                        scope.fieldValue = '<span>' + fieldValue + '</span>';
                }

            }



            function getLookupValues(values) {

                var resolvedValues = [];

                return SharePoint.getWeb(scope.field.LookupWebId).then(function(lookupWeb) {

                    return lookupWeb.getList(scope.field.LookupList).then(function(lookupList) {

                        var query = {
                            $expand: 'Fields'
                        };

                        // Expand 'Forms' property for Lookup and LookupMulti fields.
                        if (scope.field.TypeAsString == 'Lookup' || scope.field.TypeAsString == 'LookupMulti') {

                            query.$expand += ',Forms';

                        }

                        return lookupList.getProperties(query).then(function() {

                            var promises = [];

                            angular.forEach(values, function(lookupValue) {

                                var lookupPromise = lookupList.getItemById(lookupValue).then(function(lookupItem) {

                                    if (scope.field.LookupField === '') {
                                        scope.field.LookupField = 'Title';
                                    }
                                    var displayValue = lookupItem[scope.field.LookupField];
                                    var fieldSchema = lookupList.Fields[scope.field.LookupField];

                                    if (fieldSchema.TypeAsString === 'DateTime' && displayValue !== null) {
                                        var cultureInfo = (typeof __cultureInfo == 'undefined' ? Sys.CultureInfo.CurrentCulture : __cultureInfo);
                                        var date = new Date(displayValue);
                                        displayValue = $filter('date')(date, cultureInfo.dateTimeFormat.ShortDatePattern + (fieldSchema.DisplayFormat === 0 ? '' :  ' ' + cultureInfo.dateTimeFormat.ShortTimePattern));
                                    }

                                    if (fieldSchema.TypeAsString === 'Number') {
                                        if (fieldSchema.Percentage) {
                                            displayValue += '%';
                                        }
                                    }


                                    // When the field is a Computed field, shows its title.
                                    // TODO: Resolve computed fields.
                                    if (fieldSchema.TypeAsString === 'Computed' && displayValue !== null) {
                                        displayValue = lookupItem.Title;
                                    }


                                    // Gets the lookup url
                                    var url = '';

                                    if (scope.field.TypeAsString == 'User' || scope.field.TypeAsString == 'UserMulti') {

                                        url = lookupItem.list.web.url.rtrim('/') + '/_layouts/15/userdisp.aspx' + '?ID=' + lookupValue + '&Source=' + encodeURIComponent(window.location);

                                    } else {

                                        url = lookupItem.list.Forms.results[0].ServerRelativeUrl + '?ID=' + lookupValue + '&Source=' + encodeURIComponent(window.location);

                                    }


                                    // Set the final field value.
                                    resolvedValues.push({

                                        title: displayValue,
                                        url: url

                                    });

                                    return true;

                                });

                                promises.push(lookupPromise);

                            });


                            return $q.all(promises).then(function() {

                                return resolvedValues;

                            });

                        });

                    });

                });

            } // getLookupValues

        } // postLink

    } // Directive factory function

})();
