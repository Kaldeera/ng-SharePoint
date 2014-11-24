/*
	SPFile - factory
	
	Pau Codina (pau.codina@kaldeera.com)
	Pedro Castro (pedro.castro@kaldeera.com, pedro.cm@gmail.com)

	Copyright (c) 2014
	Licensed under the MIT License
*/



///////////////////////////////////////
//	SPFile
///////////////////////////////////////

angular.module('ngSharePoint').factory('SPFile', 

	['SPObjectProvider', '$q', '$http', 

	function SPFile_Factory(SPObjectProvider, $q, $http) {

		'use strict';


		// ****************************************************************************
		// SPFile constructor
		//
		// @web: SPWeb instance that contains the file in SharePoint.
		// @path: Name the file you want to instantiate.
		//
		var SPFileObj = function(web, path, fileProperties) {

			if (web === void 0) {
				throw '@web parameter not specified in SPFile constructor.';
			}

			if (path === void 0) {
				throw '@path parameter not specified in SPFile constructor.';
			}


			this.web = web;

			this.apiUrl = '/GetfileByServerRelativeUrl(\'' + path + '\')';


			// Initializes the SharePoint API REST url for the file.
			this.apiUrl = web.apiUrl + this.apiUrl;

			// Init the instance object with properties (if exists)
			if (fileProperties !== void 0) {
				utils.cleanDeferredProperties(fileProperties);
				angular.extend(this, fileProperties);
			}
		};




		// ****************************************************************************
		// updateAPIUrlById
		//
		// When the file is moved or renamed, the internal apiUrl are changed.
		// This internal function is used to update it with the pattern:
		// 	list.apiUrl + '/GetItemById(itemId)/file'
		//
		SPFileObj.prototype.updateAPIUrlById = function(list, itemId) {

			if (list === void 0) {
				throw '@list parameter not specified in updateAPIUrlById.';
			}

			if (itemId === void 0) {
				throw '@itemId parameter not specified in updateAPIUrlById.';
			}

			this.apiUrl = list.apiUrl + '/GetItemById(' + itemId + ')/file';

		}; // getProperties





		// ****************************************************************************
		// getProperties
		//
		// Gets file properties and attach it to 'this' object.
		//
		// @returns: Promise with the result of the REST query.
		//
		SPFileObj.prototype.getProperties = function(query) {

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
		// getList
		//
		// Gets the list that contains the curruent file
		//
		// @returns: Promise with the new SPFolder object.
		//
		SPFileObj.prototype.getList = function() {

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
		// getFileListItem
		//
		// Gets the list item object correspondig with the current file
		//
		// @returns: Promise with the new SPFile object.
		//
		SPFileObj.prototype.getFileListItem = function() {

			var def = $q.defer();
			var self = this;

			if (this.ListItem !== void 0) {

				def.resolve(this.ListItem);

			} else {

				if (this.List !== void 0) {

					this.getProperties({ $expand: 'ListItemAllFields, ListItemAllFields/ParentList'}).then(function() {

						self.ListItem = SPObjectProvider.getSPListItem(self.List, self.ListItemAllFields);
						self.updateAPIUrlById(self.List, self.ListItem.Id);

						def.resolve(self.ListItem);
					});

				} else {

					this.getList().then(function() {

						self.ListItem = SPObjectProvider.getSPListItem(self.List, self.ListItemAllFields);
						self.updateAPIUrlById(self.List, self.ListItem.Id);
						def.resolve(self.ListItem);
					});
				}

			}

			return def.promise;

		};	// getFileListItem





		// ****************************************************************************
		// rename
		//
		// Renames the current file with the new name
		//
		// @fileName: The new name of the file
		// @returns: Promise with the result.
		//
		SPFileObj.prototype.rename = function(fileName) {

			var self = this;
			var def = $q.defer();

			this.getFileListItem().then(function() {

				var listGuid = self.List.Id;
				var itemId = self.ListItem.Id;

				var context = new SP.ClientContext.get_current();
				var web = context.get_web();
				var list = web.get_lists().getById(listGuid);
				self._fileItem = list.getItemById(itemId);
				self._fileItem.set_item('FileLeafRef', fileName);
				self._fileItem.update();

				context.load(self._fileItem);

				context.executeQueryAsync(function() {

					self.getProperties().then(function() {
						def.resolve();
					});

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
		// removeFile
		//
		// Delete the current file
		//
		// @permanent: Indicates if the folder is recycled or removed permanently
		// @returns: Promise with the new SPFile object.
		//
		SPFileObj.prototype.removeFile = function(permament) {

			var self = this;
			var def = $q.defer();
			var headers = {
				'Accept': 'application/json; odata=verbose'
			};


			var url = self.apiUrl + '/recycle';

			if (permament === true) {
				url = url.rtrim('/recycle');
				headers['X-HTTP-Method'] = 'DELETE';
			}

			var executor = new SP.RequestExecutor(self.web.url);

			executor.executeAsync({

				url: url,
				method: 'POST',
				headers: headers,

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

		};	// removeFile



		// ****************************************************************************
		// checkOut
		//
		// checkOut the current file
		//
		// @returns: Promise with the new SPFile object.
		//
		SPFileObj.prototype.checkOut = function() {

			var self = this;
			var def = $q.defer();

			var url = self.apiUrl + '/checkout';

			var executor = new SP.RequestExecutor(self.web.url);

			executor.executeAsync({

				url: url,
				method: 'POST',

				success: function() {

					self.getProperties({
						$expand: 'CheckedOutByUser, ModifiedBy'
					}).then(function() {
						def.resolve();
					});
				},


				error: function(data, errorCode, errorMessage) {

					var err = utils.parseError({
						data: data,
						errorCode: errorCode,
						errorMessage: errorMessage
					});

					self.getProperties({
						$expand: 'CheckedOutByUser, ModifiedBy'
					}).then(function() {
						def.reject(err);
					});
				}
			});

			return def.promise;

		};	// checkOut


		// ****************************************************************************
		// undoCheckOut
		//
		// undoCheckOut the current file
		//
		// @returns: Promise with the new SPFile object.
		//
		SPFileObj.prototype.undoCheckOut = function() {

			var self = this;
			var def = $q.defer();

			var url = self.apiUrl + '/undocheckout';

			var executor = new SP.RequestExecutor(self.web.url);

			executor.executeAsync({

				url: url,
				method: 'POST',

				success: function() {

					self.getProperties({
						$expand: 'CheckedOutByUser, ModifiedBy'
					}).then(function() {
						delete self.CheckedOutByUser;
						def.resolve();
					});
				},


				error: function(data, errorCode, errorMessage) {

					var err = utils.parseError({
						data: data,
						errorCode: errorCode,
						errorMessage: errorMessage
					});

					self.getProperties({
						$expand: 'CheckedOutByUser, ModifiedBy'
					}).then(function() {
						def.reject(err);
					});
				}
			});

			return def.promise;

		};	// undoCheckOut



		// ****************************************************************************
		// checkIn
		//
		// checkIn the current file
		//
		// @Comment: A comment for the check-in
		// @returns: Promise with the new SPFile object.
		//
		SPFileObj.prototype.checkIn = function(Comment) {

			var self = this;
			var def = $q.defer();

			Comment = Comment || '';

			self.getList().then(function() {

				var listGuid = self.List.Id;
				var itemId = self.ListItemAllFields.Id;

				var context = new SP.ClientContext.get_current();
				var web = context.get_web();
				var list = web.get_lists().getById(listGuid);
				var item = list.getItemById(itemId);
				self._file = item.get_file();
				self._file.checkIn(Comment, 1);

				context.load(self._file);

				context.executeQueryAsync(function() {

					self.getProperties({
						$expand: 'CheckedOutByUser,ModifiedBy'
					}).then(function() {
						delete self.CheckedOutByUser;
						def.resolve();
					});

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

					self.getProperties({
						$expand: 'CheckedOutByUser,ModifiedBy'
					}).then(function() {
						def.reject(err);
					});

				});
			});

/*
			var url = self.apiUrl + '/CheckIn(comment=\'' + Comment + '\', checkintype=0)';

			var executor = new SP.RequestExecutor(self.web.url);

			$http({
				url: url,
				method: 'POST'
			}).then(function() {

					self.getProperties({
						$expand: 'CheckedOutByUser'
					}).then(function() {
						delete self.CheckedOutByUser;
						def.resolve();
					});

			}, function(err) {

					self.getProperties({
						$expand: 'CheckedOutByUser'
					}).then(function() {
						def.reject(err);
					});
			});

			executor.executeAsync({

				url: url,
				method: 'POST',

				success: function() {

					self.getProperties({
						$expand: 'CheckedOutByUser'
					}).then(function() {
						delete self.CheckedOutByUser;
						def.resolve();
					});
				},

				error: function(data, errorCode, errorMessage) {

					var err = utils.parseError({
						data: data,
						errorCode: errorCode,
						errorMessage: errorMessage
					});

					self.getProperties({
						$expand: 'CheckedOutByUser'
					}).then(function() {
						def.reject(err);
					});
				}
			});
*/

			return def.promise;

		};	// checkIn




		// Returns the SPFileObj class
		return SPFileObj;

	}
]);
