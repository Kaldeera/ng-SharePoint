/*
    kld-listitemurl
    Pau Codina for Kaldeera
    Copyright (c) 2014 Pau Codina (pau.codina@kaldeera.com)
    Licensed under the MIT License


    This filter formats a valid SharePoint URL for a specific splist item form.
    Params:
        SiteId
        WebId
        ListId
        FormName (dispform | editform)

    Example:
        <a href="{{item.ID | ListItemUrl:SiteId:item.WebId:item.ListId:'dispform'}}">Test</a>

*/


angular.module('kld.ngSharePoint')
.filter('ListItemUrl', ['$location', function($location) {

    'use strict';

    return function(ListItemId, SiteId, WebId, ListId, FormName) {

    	var url = '_layouts/copyutil.aspx?Use=id&Action=' + (FormName || 'dispform');
    	url += '&ItemId=' + ListItemId;
    	url += '&ListId=' + ListId;
    	url += '&WebId=' + WebId;
    	url += '&SiteId=' + SiteId;
    	url += '&Source=' + $location.absUrl();

    	return url;
    };
}]);
