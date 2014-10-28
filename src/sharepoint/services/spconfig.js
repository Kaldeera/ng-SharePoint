/*
	SPConfig - provider
	
	Pau Codina (pau.codina@kaldeera.com)
	Pedro Castro (pedro.castro@kaldeera.com, pedro.cm@gmail.com)

	Copyright (c) 2014
	Licensed under the MIT License
*/



///////////////////////////////////////
//	SPConfig
///////////////////////////////////////

angular.module('ngSharePoint').provider('SPConfig', 

	[
	
	function SPConfig_Provider() {

		'use strict';

		var self = this;
		
		self.options = {
			force15LayoutsDirectory: false,
			loadMinimalSharePointInfraestructure: true
		};
		
		self.$get = function() {

			var Settings = function() {
			};

			Settings.options = self.options;
			
			return Settings;
		};

	}
]);
