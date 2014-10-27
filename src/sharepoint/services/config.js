/*
	ngSharePointConfig - provider

	Configuration settings SharePoint provider.
	
	Pau Codina (pau.codina@kaldeera.com)
	Pedro Castro (pedro.castro@kaldeera.com, pedro.cm@gmail.com)

	Copyright (c) 2014
	Licensed under the MIT License
*/



///////////////////////////////////////
//	ngSharePointConfig
///////////////////////////////////////

angular.module('ngSharePoint')
.provider('ngSharePointConfig', function() {

	'use strict';

	var self = this;
	
	self.options = {
		force15LayoutsDirectory: false,
		minimalLoadSharePointInfraestructure: true
	};
	
	self.$get = function() {

		var Settings = function() {
		};

		Settings.options = self.options;
		
		return Settings;
	};

});
