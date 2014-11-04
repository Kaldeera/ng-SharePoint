/*
    SPConfig - provider
    
    Pau Codina (pau.codina@kaldeera.com)
    Pedro Castro (pedro.castro@kaldeera.com, pedro.cm@gmail.com)

    Copyright (c) 2014
    Licensed under the MIT License
*/



///////////////////////////////////////
//  SPConfig
///////////////////////////////////////

angular.module('ngSharePoint').provider('SPConfig', 

    [
    
    function SPConfig_Provider() {

        'use strict';

        var self = this;

        self.options = {

            /* 
             * force15LayoutsDirectory 
             * -----------------------------------------------------------------------------
             * Force to load LAYOUTS files from '../15/Layouts' folder instead to get the
             * default LAYOUTS folder (14|15/Layouts) using the function 
             * 'SP.Utilities.Utility.getLayoutsPageUrl()'.
             *
             */
            force15LayoutsDirectory: false,


            /* 
             * loadMinimalSharePointInfraestructure
             * -----------------------------------------------------------------------------
             * Load minimal script resources from SharePoint.
             * See 'SPUtils.SharePointReady' method for more details about the scripts loaded when
             * in full-load mode (i.e., when 'loadMinimalSharePointInfraestructure' is set to FALSE).
             *
             */
            loadMinimalSharePointInfraestructure: true,


            /*
             * forceLoadResources
             * -----------------------------------------------------------------------------
             * If set to TRUE ignores the property 'loadMinimalSharePointInfraestructure'
             * and load the resource files specified in the 'filenames' property.
             * Automatically set to TRUE when the user adds resources manually.
             *
             */
            forceLoadResources: false,


            /* 
             * resourceFiles
             * -----------------------------------------------------------------------------
             * Object to control the load of localization resource files (.resx) at start-up.
             *
             */
            resourceFiles: (function() {

                var _ResourceFiles = function() {

                    /*
                     * _filenames
                     * -----------------------------------------------------------------------------
                     * Array of resource files (.resx filenames) to load at start-up.
                     * By default loads 'core.resx' when 'loadMinimalSharePointInfraestructure' 
                     * is set to FALSE.
                     *
                     */
                    var _filenames = ['core'];


                    /*
                     * get()
                     * -----------------------------------------------------------------------------
                     * Return the array of resources filenames.
                     *
                     */
                    this.get = function() {
                        return _filenames;
                    };


                    /*
                     * add()
                     * -----------------------------------------------------------------------------
                     * Add resource/s file/s to load at start-up.
                     * The 'resources' parameter could be a single string or an array of strings.
                     *
                     */
                    this.add = function(resources) {

                        var validResource = false;

                        if (angular.isArray(resources)) {

                            // Process the array of resources filenames
                            anfular.forEach(resources, function(resource) {
                                
                                if (angular.isString(resource)) {

                                    _filenames.push(resource);
                                    validResource = true;
                                }
                            });

                        } else {

                            // Process a single resource filename
                            if (angular.isString(resources)) {

                                _filenames.push(resources);
                                validResource = true;
                            }
                        }


                        if (validResource) {

                            self.options.forceLoadResources = true;
                        }

                    };
                };

                // Returns a new  '_ResourceFiles' object.
                return new _ResourceFiles();

            })()
        };

        
        self.$get = function() {

            var Settings = function() {
            };

            Settings.options = self.options;
            
            return Settings;
        };

    }
]);
