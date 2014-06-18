/*
	kld-sputils
	Pau Codina for Kaldeera
	Copyright (c) 2014 Pau Codina (pau.codina@kaldeera.com)
	Licensed under the MIT License

	SharePoint utility functions
*/

angular.module('kld.ngSharePoint').factory('SPUtils', ['$q', 'ODataParserProvider', function ($q, ODataParserProvider) {

	'use strict';

	return {
		inDesignMode: function () {
			var publishingEdit = window.g_disableCheckoutInEditMode;
			var form = document.forms[MSOWebPartPageFormName];
			var input = form.MSOLayout_InDesignMode || form._wikiPageMode;

			return !!(publishingEdit || (input && input.value));
		},

		SharePointReady: function () {
			var deferred = $q.defer();
			SP.SOD.executeOrDelayUntilScriptLoaded(function () {
				deferred.resolve();
			}, "sp.js");
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
		}
	};
}]);
