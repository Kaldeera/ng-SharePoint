/*
    SPItemAuthoringinfo - directive
    
    Pau Codina (pau.codina@kaldeera.com)
    Pedro Castro (pedro.castro@kaldeera.com, pedro.cm@gmail.com)

    Copyright (c) 2014
    Licensed under the MIT License
*/



///////////////////////////////////////
//  SPItemAuthoringinfo
///////////////////////////////////////

(function() {
    
    'use strict';

    angular
        .module('ngSharePoint')
        .directive('spitemAuthoringinfo', spitemAuthoringinfo);


    spitemAuthoringinfo.$inject = ['SharePoint'];


    /* @ngInject */
    function spitemAuthoringinfo(SharePoint) {

        var directive = {

            restrict: 'EA',
            replace: true,
            templateUrl: 'templates/form-templates/spitem-authoringinfo.html',
            link: postLink

        };

        return directive;

        

        ///////////////////////////////////////////////////////////////////////////////



        function postLink(scope, element, attrs) {

            scope.cultureInfo = (typeof __cultureInfo == 'undefined' ? Sys.CultureInfo.CurrentCulture : __cultureInfo);

            // Init localized texts
            scope.createdAtText = 'Created at';
            scope.lastModifiedText = 'Last modified at';
            scope.byText = 'by';

            // TODO: Gets the above strings in the correct localization !!!
            //       The strings are located at wss.resx that currently can't load dinamically.


            if (scope.item) {

                // Gets the item info
                scope.createdDate = scope.item.Created;
                scope.modifiedDate = scope.item.Modified;
                scope.authorName = null;
                scope.editorName = null;

                // Gets 'Author' properties
                scope.item.list.web.getUserById(scope.item.AuthorId).then(function(author) {

                    scope.authorName = author.Name;
                    scope.authorLink = _spPageContextInfo.webAbsoluteUrl + '/_layouts/15/userdisp.aspx?ID=' + scope.item.AuthorId;

                });

                // Gets 'Editor' properties
                scope.item.list.web.getUserById(scope.item.EditorId).then(function(editor) {

                    scope.editorName = editor.Name;
                    scope.editorLink = _spPageContextInfo.webAbsoluteUrl + '/_layouts/15/userdisp.aspx?ID=' + scope.item.EditorId;

                });

            }

        } // postLink

    } // Directive factory function

})();
