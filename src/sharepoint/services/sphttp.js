/**
 * @ngdoc object
 * @name ngSharePoint.SPHttp
 *
 * @description
 * SPHttp service is a core ng-SharePoint service that facilitates communication with remote REST api and perform
 * common configuration and response process tasks.
 *
 */


angular.module('ngSharePoint').service('SPHttp', 

    ['$q', '$http', 

    function ($q, $http) {

        'use strict';



        /**
        * Makes a GET call to a specified REST api
        * *Internal use*
        */
        this.get = function(url, params) {

            var self = this;
            var def = $q.defer();

            $http({

                url: url,
                method: 'GET', 
                headers: { 
                    "Accept": "application/json; odata=verbose"
                }

            }).then(function(data) {

                var d = utils.parseSPResponse(data);
                def.resolve(d);
                    
            }, function(data, errorCode, errorMessage) {

                var err = utils.parseError({
                    data: data.config,
                    errorCode: data.status,
                    errorMessage: data.statusText
                });

                def.reject(err);
            });

            return def.promise;

        }; // get


        /**
        * Makes a POST call to a specified REST api
        * *Internal use*
        */
        this.post = function(spweb, url, headers, body) {

            var self = this;
            var def = $q.defer();
            var d = null;

            spweb.getDigestValue()
            .then(function(digestValue){

                headers['X-RequestDigest'] = digestValue;

                return $http({
                    method: "POST",
                    url : url,
                    data: body,  
                    headers: headers 
                });
            },
            function(data, errorCode, errorMessage){

                var err = utils.parseError({
                    data: data.config,
                    errorCode: data.status,
                    errorMessage: data.statusText
                });

                def.reject(err);
            })
            .then(function(data) {

                d = utils.parseSPResponse(data);

                if (data.headers && data.headers['X-REQUESTDIGEST']) {
                    spweb.FormDigestValue = data.headers['X-REQUESTDIGEST'];
                }

                def.resolve(d);
                    
            }, function(data, errorCode, errorMessage) {

                var err = utils.parseError({
                    data: data.config,
                    errorCode: data.status,
                    errorMessage: data.statusText
                });

                def.reject(err);
            });

            return def.promise;

        };
    }
]);
