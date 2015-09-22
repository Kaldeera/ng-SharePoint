/*
	boolean - filter
	
	Pau Codina (pau.codina@kaldeera.com)
	Pedro Castro (pedro.castro@kaldeera.com, pedro.cm@gmail.com)

	Copyright (c) 2014
	Licensed under the MIT License
*/



///////////////////////////////////////
//  boolean
///////////////////////////////////////

angular.module('ngSharePoint').filter('boolean', 

    [ 

    function boolean_Filter($) {

        return function(val) {

        	return val ? STSHtmlEncode(Strings.STS.L_SPYes) : STSHtmlEncode(Strings.STS.L_SPNo);

        };
        
    }
]);
