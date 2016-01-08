/**
 * @ngdoc object
 * @name ngSharePoint.SPFolder
 *
 * @description
 * Provides functionality to manage SharePoint folders.
 *
 * *At the moment, not all methods for managing folder objects are implemented in ngSharePoint*
 *
 */

angular.module('ngSharePoint').factory('SPFolder', 

	['SPObjectProvider', 'SPUtils', '$q', 

	function SPFolder_Factory(SPObjectProvider, SPUtils, $q) {

		'use strict';



        /**
         * @ngdoc function
         * @name ngSharePoint.SPFolder#constructor
         * @constructor
         * @methodOf ngSharePoint.SPFolder
         *
         * @description
         * Instantiates a new `SPFolder` object that points to a specific SharePoint folder. With a
         * folder instance it is possible to access their properties and get files and subfolders.
         *
         * @param {SPWeb} web A valid {@link ngSharePoint.SPWeb SPWeb} object where the folder is located
         * @param {string} path Server relative path to the folder.
         * @param {object} folderProperties Properties to initialize the object
         *
         * @example
         * <pre>
         * var folder = new SPFolder(web, '/Shared documents');
         * // ... do something with the 'folder' object
         * folder.getFiles().then(...);
         * </pre>
         *
         */
		var SPFolderObj = function(web, path, folderProperties) {

			if (web === void 0) {
				throw '@web parameter not specified in SPFolder constructor.';
			}

			if (path === void 0) {
				throw '@path parameter not specified in SPFolder constructor.';
			}
			// IMPROVEMENT: If path is undefined, instead of throw an error, set the path to '' or '/' to point to the root folder of the web.


			this.web = web;

			this.apiUrl = '/GetFolderByServerRelativeUrl(\'' + path + '\')';


			// Initializes the SharePoint API REST url for the folder.
			this.apiUrl = web.apiUrl + this.apiUrl;

			// Init folderProperties (if exists)
			if (folderProperties !== void 0) {
				utils.cleanDeferredProperties(folderProperties);
				angular.extend(this, folderProperties);
			}
		};




        /**
         * @ngdoc function
         * @name ngSharePoint.SPFolder#getProperties
         * @methodOf ngSharePoint.SPFolder
         *
         * @description
         * Makes a call to the SharePoint server and collects all folder properties.
         * The current object is extended with the recovered properties.
         *
         * For a complete list of folder properties go to Microsoft
         * SharePoint {@link https://msdn.microsoft.com/EN-US/library/office/dn450841.aspx#bk_FolderProperties folder api reference}
         *
         * SharePoint REST api only returns certain folder properties that have primary values. Properties with complex structures
         * like `ParentFolder` or `Files` are not returned directly by the api and it is necessary to extend the query
         * to retrieve their values. It is possible to accomplish this with the `query` param.
         *
         * @param {object=} query This parameter specifies which folder properties will be extended and retrieved from the server.
         * @returns {promise} promise with an object with the folder object
         *
         * @example
         * This example shows how to retrieve folder properties:
         * <pre>
         *
         *   SharePoint.getCurrentWeb(function(web) {
         *
         *     web.getFolder("/Images").then(function(folder) {
         *
         *        folder.getProperties().then(function() {
         *
         *            // at this point we have all folder properties
         *            window.location = folder.WelcomePage;
         *        });
         *     });
         *
         *   });
         * </pre>
         *
         */
		SPFolderObj.prototype.getProperties = function(query) {

			var self = this;
			var def = $q.defer();
			var executor = new SP.RequestExecutor(self.web.url);

			executor.executeAsync({

				url: self.apiUrl + utils.parseQuery(query),
				method: 'GET', 
				headers: { 
					"Accept": "application/json; odata=verbose"
				}, 

				success: function(data) {

					var d = utils.parseSPResponse(data);
					utils.cleanDeferredProperties(d);
					
					angular.extend(self, d);

					def.resolve(self);
				}, 

				error: function(data, errorCode, errorMessage) {

					var err = utils.parseError({
						data: data,
						errorCode: errorCode,
						errorMessage: errorMessage
					});

					def.reject(err);
				}
			});

			return def.promise;

		}; // getProperties




		/**
	     * @ngdoc function
	     * @name ngSharePoint.SPFolder#getFiles
	     * @methodOf ngSharePoint.SPFolder
	     *
	     * @description
		 * Gets the collection of all {@link ngSharePoint.SPFile files} contained in the folder.
	     *
         * @param {object=} query An object with all query options used to retrieve files.
	     * @returns {promise} promise with an array of {@link ngSharePoint.SPFile SPFile} objects.
	     *
		 * @example
		 * <pre>
		 *
		 *   SharePoint.getCurrentWeb(function(web) {
		 *		var folder = new SPFolder(web, '/images');
		 *		folder.getFiles().then(function(files) {
		 *       
		 *           angular.forEach(files, function(file) {
	     *           
	     *               console.log(file.Name + ' ' + file.Length);
		 *           });
		 *      });
		 *
		 *   });
		 * </pre>
		 */		
		SPFolderObj.prototype.getFiles = function(query) {

			var self = this;
			var def = $q.defer();

			var executor = new SP.RequestExecutor(self.web.url);

			executor.executeAsync({

				url: self.apiUrl + '/Files' + utils.parseQuery(query),
				method: 'GET', 
				headers: { 
					"Accept": "application/json; odata=verbose"
				}, 

				success: function(data) {

					var d = utils.parseSPResponse(data);
					var files = [];

					angular.forEach(d, function(file) {

						var newFile = SPObjectProvider.getSPFile(self.web, file.ServerRelativeUrl, file);
						if (self.List != void 0) {
							newFile.List = self.List;
						}
						
						files.push(newFile);

					});

					def.resolve(files);
				}, 

				error: function(data, errorCode, errorMessage) {

					var err = utils.parseError({
						data: data,
						errorCode: errorCode,
						errorMessage: errorMessage
					});

					def.reject(err);
				}
			});

			return def.promise;

		}; // getFiles




		/**
	     * @ngdoc function
	     * @name ngSharePoint.SPFolder#getFolders
	     * @methodOf ngSharePoint.SPFolder
	     *
	     * @description
	     * Gets the collection of folders contained in the folder.
	     *
         * @param {object=} query An object with all query options used to retrieve folders.
	     * @returns {promise} promise with an array of {@link ngSharePoint.SPFolder SPFolder} objects.
	     *
		 * @example
		 * <pre>
		 *
		 *   SharePoint.getCurrentWeb(function(web) {
		 *		var folder = new SPFolder(web, '/images');
		 *		folder.getFolders().then(function(folders) {
		 *       
		 *           angular.forEach(folders, function(folder) {
	     *           
	     *               console.log(folder.Name + ' ' + folder.ItemCount);
		 *           });
		 *      });
		 *
		 *   });
		 * </pre>
		 */
		SPFolderObj.prototype.getFolders = function(query) {

			var self = this;
			var def = $q.defer();

			var executor = new SP.RequestExecutor(self.web.url);

			executor.executeAsync({

				url: self.apiUrl + '/Folders' + utils.parseQuery(query),
				method: 'GET', 
				headers: { 
					"Accept": "application/json; odata=verbose"
				}, 

				success: function(data) {

					var d = utils.parseSPResponse(data);
					var folders = [];

					angular.forEach(d, function(folder) {

						var newFolder = new SPFolderObj(self.web, folder.ServerRelativeUrl, folder);
						if (self.List !== void 0) {
							newFolder.List = self.List;
						}

						folders.push(newFolder);


					});

					def.resolve(folders);
				}, 

				error: function(data, errorCode, errorMessage) {

					var err = utils.parseError({
						data: data,
						errorCode: errorCode,
						errorMessage: errorMessage
					});

					def.reject(err);
				}
			});

			return def.promise;

		}; // getFolders




        /**
         * @ngdoc function
         * @name ngSharePoint.SPFolder#getList
         * @methodOf ngSharePoint.SPFolder
         *
         * @description
         * Returns an SPList object corresponding with the list or document library that contains the folder.
         * If the folder doesn't corresponds with a list or document library, this method throws an error.
         *
         * @returns {promise} promise with an {@link ngSharePoint.SPList SPList} object.
         *
         */
		SPFolderObj.prototype.getList = function() {

			var def = $q.defer();
			var self = this;

			if (this.List === void 0) {

				if (this.ListItemAllFields !== void 0) {

					if (this.ListItemAllFields.ParentList !== void 0) {

						var list = SPObjectProvider.getSPList(self.web, self.ListItemAllFields.ParentList.Id, self.ListItemAllFields.ParentList);
						this.List = list;
					}
				}
			}

			if (this.List !== void 0) {

				def.resolve(this.List);

			} else {

				this.getProperties({ $expand: 'ListItemAllFields, ListItemAllFields/ParentList'}).then(function() {

					var list = SPObjectProvider.getSPList(self.web, self.ListItemAllFields.ParentList.Id, self.ListItemAllFields.ParentList);
					self.List = list;
					def.resolve(list);
				});
			}

			return def.promise;

		};	// getList




        /**
         * @ngdoc function
         * @name ngSharePoint.SPFolder#getFolderListItem
         * @methodOf ngSharePoint.SPFolder
         *
         * @description
         * Gets the list item object corresponding with the current folder.
         *
         * If the folder isn't in a list or document library, then there isn't an item
         * that corresponds with it and this method throws an error.
         *
         * @returns {promise} promise with an {@link ngSharePoint.SPListItem SPListItem} object.
         *
         */
		SPFolderObj.prototype.getFolderListItem = function() {

			var def = $q.defer();
			var self = this;

			if (this.ListItem !== void 0) {

				def.resolve(this.ListItem);

			} else {

				this.getList().then(function() {

					self.ListItem = SPObjectProvider.getSPListItem(self.List, self.ListItemAllFields);
					def.resolve(self.ListItem);
				});

			}

			return def.promise;

		};	// getFolderListItem




		/**
         * @ngdoc function
         * @name ngSharePoint.SPFolder#addFolder
         * @methodOf ngSharePoint.SPFolder
         *
         * @description
         * Creates a new folder within the current folder.
         *
         * @param {string} folderName The name of the folder to be created.
         * @returns {promise} promise with the new {@link ngSharePoint.SPFolder SPFolder} object.
         *
		 * @example
		 * <pre>
		 *
		 *	var folder = new SPFolder(web, '/public-documents');
		 *	folder.addFolder('manuals').then(function(manualsFolder) {
		 *
		 *		// . . . 
		 *      
		 *	});
		 *
		 * </pre>
         */
		SPFolderObj.prototype.addFolder = function(folderName) {

			var self = this;
			var def = $q.defer();
			var folderPath = (self.ServerRelativeUrl || '').rtrim('/') + '/' + folderName;
			var url = self.apiUrl + '/folders';

			var headers = {
				'Accept': 'application/json; odata=verbose',
				"content-type": "application/json;odata=verbose"
			};

			var requestDigest = document.getElementById('__REQUESTDIGEST');
			if (requestDigest !== null) {
				headers['X-RequestDigest'] = requestDigest.value;
			}

			var executor = new SP.RequestExecutor(self.web.url);

			// Set the contents for the REST API call.
			// ----------------------------------------------------------------------------
			var body = {
				__metadata: {
					type: 'SP.Folder'
				},
				ServerRelativeUrl: folderPath
			};

			executor.executeAsync({

				url: url,
				method: 'POST',
				headers: headers,
				body: angular.toJson(body),

				success: function(data) {

					var d = utils.parseSPResponse(data);
					var newFolder = new SPFolderObj(self.web, folderPath, d);
					def.resolve(newFolder);
				},


				error: function(data, errorCode, errorMessage) {

					var err = utils.parseError({
						data: data,
						errorCode: errorCode,
						errorMessage: errorMessage
					});

					def.reject(err);
				}
			});

			return def.promise;

		};	// addFolder




        /**
         * @ngdoc function
         * @name ngSharePoint.SPFolder#addFile
         * @methodOf ngSharePoint.SPFolder
         *
         * @description
         * Uploads a new binary file to current folder.
         *
         * @param {string} fileName The name of the new file to upload.
         * @param {stream} file A stream with the content of the file to be uploaded. The maximum size of a binary file that you can add by using this method is 2 GB.
         * @param {boolean=} overwrite If a file with the same name exists on the server, this parameter
         * indicates if the file will be overwritten
         * @returns {promise} promise with the new {@link ngSharePoint.SPFile SPFile} object.
         *
         */
        SPFolderObj.prototype.addFile = function(fileName, file, overwrite) {

            var self = this;
            var def = $q.defer();
            var folderPath = self.ServerRelativeUrl + '/' + fileName;
            var url = self.apiUrl + '/files/add(url=\'' + fileName + '\',overwrite=' + (overwrite === false ? 'false' : 'true') + ')';

            var executor = new SP.RequestExecutor(self.web.url);

            SPUtils.getFileBinary(file).then(function (binaryData) {

                var headers = {
                    'Accept': 'application/json; odata=verbose',
                    "content-type": "application/json;odata=verbose"
                };

                var requestDigest = document.getElementById('__REQUESTDIGEST');
                if (requestDigest !== null) {
                    headers['X-RequestDigest'] = requestDigest.value;
                }

                executor.executeAsync({

                    url: url,
                    method: 'POST',
                    headers: headers,
                    body: binaryData,
                    binaryStringRequestBody: true,

                    success: function(data) {

                        var d = utils.parseSPResponse(data);
                        var newFile = SPObjectProvider.getSPFile(self.web, d.ServerRelativeUrl, d);
                        newFile.List = self.List;

                        def.resolve(newFile);
                    },

                    error: function(data, errorCode, errorMessage) {

                        var err = utils.parseError({
                            data: data,
                            errorCode: errorCode,
                            errorMessage: errorMessage
                        });

                        def.reject(err);
                    }
                });

            });

            return def.promise;

        };  // addFile
        



		/**
         * @ngdoc function
         * @name ngSharePoint.SPFolder#rename
         * @methodOf ngSharePoint.SPFolder
         *
         * @description
         * Changes the name of the current folder.
         *
         * @param {string} newName The new name to be applied to the folder.
         * @returns {promise} promise with the operation results.
         *
         * **Limitations**:
         * This method uses JSOM to rename the folder. This means
         * that this method can't be executed outside of the SharePoint page context.
         */
		SPFolderObj.prototype.rename = function(newName) {

			var self = this;
			var def = $q.defer();

			this.getFolderListItem().then(function() {

				var listGuid = self.List.Id;
				var itemId = self.ListItem.Id;

				var context = new SP.ClientContext.get_current();
				var web = context.get_web();
				var list = web.get_lists().getById(listGuid);
				self._folder = list.getItemById(itemId);
				self._folder.set_item('FileLeafRef', newName);
				self._folder.update();

				context.load(self._folder);

				context.executeQueryAsync(function() {

					self.Name = newName;
					def.resolve();

				}, function(sender, args) {

					var err = {
						Code: args.get_errorCode(),
						Details: args.get_errorDetails(),
						TypeName: args.get_errorTypeName(),
						Value: args.get_errorValue(),
						message: args.get_message(),
						request: args.get_request(),
						stackTrace: args.get_stackTrace()
					};

					def.reject(err);

				});

			});


			return def.promise;

		};	// rename




        /**
         * @ngdoc function
         * @name ngSharePoint.SPFolder#remove
         * @methodOf ngSharePoint.SPFolder
         *
         * @description
         * This method removes the folder from the server.
         * 
         * @param {string|object} folder Can be an SPFolder object or the name of the folder to be removed.
         * @param {boolean=} permanent Indicates if the folder is recycled or removed permanently.
         * @returns {promise} promise with the result of the REST query.
         *
         */
		SPFolderObj.prototype.removeFolder = function(folder, permament) {

			var self = this;
			var def = $q.defer();
			var folderPath;

			if (typeof folder === 'string') {

				var folderName = folder;
				folderPath = self.ServerRelativeUrl + '/' + folderName;

			} else if (typeof folder === 'object') {

				folderPath = folder.ServerRelativeUrl;
			}

			var url = self.web.apiUrl + '/GetFolderByServerRelativeUrl(\'' + folderPath + '\')/recycle';

			if (permament === true) {
				url = url.rtrim('/recycle');
			}

			var executor = new SP.RequestExecutor(self.web.url);

			executor.executeAsync({

				url: url,
				method: 'POST',
				// headers: { "X-HTTP-Method":"DELETE" },

				success: function() {

					def.resolve();
				},


				error: function(data, errorCode, errorMessage) {

					var err = utils.parseError({
						data: data,
						errorCode: errorCode,
						errorMessage: errorMessage
					});

					def.reject(err);
				}
			});

			return def.promise;

		};	// removeFolder



 		// Returns the SPFolderObj class
		return SPFolderObj;

	}
]);
