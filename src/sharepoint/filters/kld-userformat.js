/*
    kld-userformat
    Pau Codina for Kaldeera
    Copyright (c) 2014 Pau Codina (pau.codina@kaldeera.com)
    Licensed under the MIT License


    Format the reference of a user (nnn;#user) in a link to their profile page
*/


angular.module('kld.ngSharePoint')
.filter('userFormat', ['kldConstants', '$location', function(kldConstants, $location) {

    'use strict';

    return function(user) {
        
        if (user === undefined) return "";

        var usuario;
        if (typeof user == 'string') {
        	var userId = user.substring(0, user.indexOf(';#'));
        	var userName = user.substring(user.indexOf(';#') + 2);
        	var profileUrl = kldConstants.userProfileUrl + userId + '&source=' + $location.absUrl();

	        return '<a href="' + profileUrl + '">' + userName + '</a>';
        }

        return "";
    };

}]);
