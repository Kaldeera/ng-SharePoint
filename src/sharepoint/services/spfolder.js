/*
	SPFolder - factory
	
	Pau Codina (pau.codina@kaldeera.com)
	Pedro Castro (pedro.castro@kaldeera.com, pedro.cm@gmail.com)

	Copyright (c) 2014
	Licensed under the MIT License
*/



///////////////////////////////////////
//	SPFolder
///////////////////////////////////////

angular.module('ngSharePoint').factory('SPFolder', 

	['SPObjectProvider', 'SPUtils', '$q', 

	function SPFolder_Factory(SPObjectProvider, SPUtils, $q) {

		'use strict';


		// ****************************************************************************
		// SPFolder constructor
		//
		// @web: SPWeb instance that contains the folder in SharePoint.
		// @path: Name the folder you want to instantiate.
		//
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



		// ****************************************************************************
		// getProperties
		//
		// Gets folder properties and attach it to 'this' object.
		//
		// @returns: Promise with the result of the REST query.
		//
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



		// ****************************************************************************
		// getFiles
		//
		// Gets folder files
		//
		// @returns: Promise with the result of the REST query.
		//
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



		// ****************************************************************************
		// getFolders
		//
		// Gets folder files
		//
		// @returns: Promise with the result of the REST query.
		//
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



		// ****************************************************************************
		// getList
		//
		// Gets the list that contains the curruent folder
		//
		// @returns: Promise with the new SPFolder object.
		//
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



		// ****************************************************************************
		// getFolderListItem
		//
		// Gets the list item object correspondig with the current folder
		//
		// @returns: Promise with the new SPFolder object.
		//
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



		// ****************************************************************************
		// addFolder
		//
		// Create a new folder under the current folder
		//
		// @folderName: The name of the new folder
		// @returns: Promise with the new SPFolder object.
		//
		SPFolderObj.prototype.addFolder = function(folderName) {

			var self = this;
			var def = $q.defer();
			var folderPath = self.ServerRelativeUrl.rtrim('/') + '/' + folderName;
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



		// ****************************************************************************
		// addFile
		//
		// Uploads a new binary file to current folder
		//
		// @fileName: The name of the new file to upload
		// @file: A file object to upload
		// @returns: Promise with the new SPFolder object.
		//
		SPFolderObj.prototype.addFile = function(fileName, file) {

			var self = this;
			var def = $q.defer();
			var folderPath = self.ServerRelativeUrl + '/' + fileName;
			var url = self.apiUrl + '/files/add(url=\'' + fileName + '\',overwrite=true)';

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

		};	// addFile


		// ******************************************
		// rename
		//
		// Renames the current folder with the new name
		//
		// @folderName: The new name of the folder
		// @returns: Promise with the result.
		//
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



		// ****************************************************************************
		// removeFolder
		//
		// Delete the specified folder under the current folder
		//
		// @folderName: The name of the folder to remove
		// @permanent: Indicates if the folder is recycled or removed permanently
		// @returns: Promise with the new SPFolder object.
		//
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
