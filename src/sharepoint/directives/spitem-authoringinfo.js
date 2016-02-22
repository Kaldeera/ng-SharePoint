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

            scope.contentTypeText = 'Content Type';
            // NOTA: El ContentType únicamente se muestra cuando está activa la administración de tipos de contenido en la lista.

            scope.versionText = SP.Res.storefront_AppDetails_Version;
            // NOTA: La versión únicamente se muestra cuando está activo en control de versiones en la lista.

            scope.createdAtText = 'Created at';
            scope.lastModifiedText = 'Last modified at';
            scope.byText = 'by';

            // TODO: Gets the above strings in the correct localization !!!
            //       The strings are located at wss.resx that currently can't load dinamically.


            if (scope.item !== void 0) {
    
                if (!scope.item.isNew()) {

                    // Gets the item info
                    scope.createdDate = scope.item.Created;
                    scope.modifiedDate = scope.item.Modified;
                    scope.authorName = null;
                    scope.editorName = null;

                    // Gets 'Author' properties
                    scope.item.list.web.getUserById(scope.item.AuthorId).then(function(author) {

                        scope.authorName = author.Title;
                        scope.authorLink = _spPageContextInfo.webAbsoluteUrl + '/_layouts/15/userdisp.aspx?ID=' + scope.item.AuthorId;

                    });

                    // Gets 'Editor' properties
                    scope.item.list.web.getUserById(scope.item.EditorId).then(function(editor) {

                        scope.editorName = editor.Title;
                        scope.editorLink = _spPageContextInfo.webAbsoluteUrl + '/_layouts/15/userdisp.aspx?ID=' + scope.item.EditorId;

                    });

                }
            }


            // Try to get original generated authoring info
            scope.originalAuthoringInfoFound = false;
            var originalAuthoringInfoElement = document.getElementById('ngsharepoint-formbinder-authoringinfo');

            if (originalAuthoringInfoElement) {

                element.append(originalAuthoringInfoElement);
                originalAuthoringInfoElement.style.display = 'block';
                scope.originalAuthoringInfoFound = true;
            }


        } // postLink

    } // Directive factory function

})();
