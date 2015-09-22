/*
	SPWorkingOnIt - directive
	
	Pau Codina (pau.codina@kaldeera.com)
	Pedro Castro (pedro.castro@kaldeera.com, pedro.cm@gmail.com)

	Copyright (c) 2014
	Licensed under the MIT License
*/



///////////////////////////////////////
//	SPWorkingOnIt
///////////////////////////////////////

angular.module('ngSharePoint').directive('spworkingonit', 

	[

	function spworkingonit_DirectiveFactory() {

		return {

			restrict: 'EA',
			templateUrl: 'templates/spworking-on-it.html'

		};

	}

]);
