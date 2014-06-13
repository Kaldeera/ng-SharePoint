/*
	kld-ngsharepoint
	Pau Codina for Kaldeera
	Copyright (c) 2014 Pau Codina (pau.codina@kaldeera.com)
	Licensed under the MIT License
*/

angular.module('kld.ngSharePoint', ['kld.CamlHelper']);

/*
---------------------------------------------------------------------------------------
	Module constants
---------------------------------------------------------------------------------------
*/
angular.module('kld.SharePoint').value('kldConstants', {
	errorTemplate: 'templates/error.html',
	userProfileUrl: '_layouts/userdisp.aspx?ID='
});
