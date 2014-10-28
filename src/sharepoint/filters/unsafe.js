/*
	unsafe - filter
	
	Pau Codina (pau.codina@kaldeera.com)
	Pedro Castro (pedro.castro@kaldeera.com, pedro.cm@gmail.com)

	Copyright (c) 2014
	Licensed under the MIT License
*/



///////////////////////////////////////
//  unsafe
///////////////////////////////////////

angular.module('ngSharePoint').filter('unsafe', 

    ['$sce', 

    function unsafe_Filter($sce) {

        return function(val) {

            return $sce.trustAsHtml(val);
        };
        
    }
]);