/*
    SPObjectProvider - factory

    Pau Codina (pau.codina@kaldeera.com)
    Pedro Castro (pedro.castro@kaldeera.com, pedro.cm@gmail.com)

    Copyright (c) 2014
    Licensed under the MIT License
*/



///////////////////////////////////////
//  SPObjectProvider
///////////////////////////////////////

angular.module('ngSharePoint').factory('SPObjectProvider', 

    ['$injector', 

    function SPObjectProvider_Factory($injector) {

        'use strict';

        return {

        	getSPWeb: function(url) {

        		var service = $injector.get('SPWeb');
        		return new service(url);
        	},

        	getSPList: function(web, listName, listProperties) {

        		var service = $injector.get('SPList');
        		return new service(web, listName, listProperties);
        	},

        	getSPListItem: function(list, data) {

        		var service = $injector.get('SPListItem');
        		return new service(list, data);
        	},

            getSPFolder: function(web, path, folderProperties) {

                var service = $injector.get('SPFolder');
                return new service(web, path, folderProperties);
            },

            getSPFile: function(web, path, fileProperties) {
                var service = $injector.get('SPFile');
                return new service(web, path, fileProperties);
            },

        	getSPGroup: function(web, groupName, groupProperties) {

        		var service = $injector.get('SPGroup');
        		return new service(web, groupName, groupProperties);
        	},

        	getSPUser: function(web, userId, userData) {

        		var service = $injector.get('SPUser');
        		return new service(web, userId, userData);
        	}


        };

    }
]);
