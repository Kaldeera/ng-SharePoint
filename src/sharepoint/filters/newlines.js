/*
	newlines - filter
	
	Pau Codina (pau.codina@kaldeera.com)
	Pedro Castro (pedro.castro@kaldeera.com, pedro.cm@gmail.com)

	Copyright (c) 2014
	Licensed under the MIT License
*/



///////////////////////////////////////
//  newlines
///////////////////////////////////////

angular.module('ngSharePoint').filter('newlines', 

    ['$sce', 

    function newlines_Filter($sce) {

        return function(text) {

            return $sce.trustAsHtml((text || '').replace(/\n/g, '<br/>'));
        };
        
    }
]);