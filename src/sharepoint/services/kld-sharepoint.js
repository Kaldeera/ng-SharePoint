/*
	kld-sharepoint
	Pau Codina for Kaldeera
	Copyright (c) 2014 Pau Codina (pau.codina@kaldeera.com)
	Licensed under the MIT License


	Main SharePoint provider.
		SPList
		SPUser
		SPGroup (comming soon)
*/


angular.module('kld.ngSharePoint')
.provider('SharePoint', function() {

	'use strict';

	var SharePoint = function($cacheFactory, SPUtils, $q) {

		/*
		---------------------------------------------------------------------------------------
			SPList ofers functionality to interact with SharePoint lists.
			Methods:
				* getListItems(query)
				* getItemById(itemId)
				* insertItem(values)
				* updateItem(values)
				* deleteItem(itemId)
		---------------------------------------------------------------------------------------
		*/
		this.SPList = function(listName, webId, webUrl) {

			if (listName === undefined) {
				throw 'listName not specified';
			}

			return {
				// properties
				webUrl: webUrl,
				ListName: listName,
				webId: webId,

				// inernal methods
				initContext: function() {
					var def = $q.defer();

					// Si ya esta inicializado ... no hacemos nada
					if (this.Context && this.List && this.Schema) {
						def.resolve(this.Schema);
						return def.promise;
					}

					// obtenemos el contexto
					if (!this.webUrl) {
						this.Context = new SP.ClientContext.get_current();
					} else {
						this.Context = new SP.ClientContext(this.webUrl);
					}

					var web = "";

					if (this.webId !== undefined) {
						web = this.Context.get_web(this.webId);
					} else {
						web = this.Context.get_web();
					}

					// Obtenemos la lista; ListName puede ser un string o un guid
					this.ListName = this.ListName.trim();
					// Se eliminan los claudators
					this.ListName = this.ListName.replace("{", "");
					this.ListName = this.ListName.replace("}", "");

					// Guid Expression
					var guidRegExp = new RegExp("^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$");

					if (guidRegExp.test(this.ListName)) {
						this.List = web.get_lists().getById(this.ListName);
					} else {
						if (this.ListName == 'userinfolist') {
							this.List = web.get_siteUserInfoList();
						} else {
							this.List = web.get_lists().getByTitle(this.ListName);
						}
					}

					var cache = $cacheFactory.get('SPListCache');
					if (cache === undefined) {
						cache = $cacheFactory('SPListCache');
					}

					this.Schema = cache.get(web + '.' + listName);
					if (this.Schema === undefined) {
						this.ListFields = this.List.get_fields();
						this.Context.load(this.ListFields);

						var self = this;

						self.Context.executeQueryAsync(Function.createDelegate(self, function() {

							var fieldEnumerator = self.ListFields.getEnumerator();
							self.Schema = {
								Fields: {}
							};

					        while (fieldEnumerator.moveNext()) {
					            var f = fieldEnumerator.get_current();
					            self.Schema.Fields[f.get_internalName()] = f;
					        }

					        cache.put(web + '.' + listName, self.Schema);
							def.resolve(self.Schema);

						}), Function.createDelegate(self, function() {
							console.error('Error al recuperar el schema!!');
							def.reject();
						}));
					} else {
						def.resolve(this.Schema);
					}

					return def.promise;

				},

				onError: function(sender, args) {
					var self = this;
					var err = {
						Code: args.get_errorCode(),
						Details: args.get_errorDetails(),
						TypeName: args.get_errorTypeName(),
						Value: args.get_errorValue(),
						message: args.get_message(),
						request: args.get_request(),
						stackTrace: args.get_stackTrace()
					};

					console.error('SPList request failed: ' + err.message + '\n' + err.stackTrace);
					self.deferred.reject(err);
				},

				// public methods
				getListItems: function(queryInfo) {
					this.deferred = $q.defer();
					var self = this;
					var queryInformation = queryInfo;

					SPUtils.SharePointReady().then(function () {
						self.initContext().then(function(data) {
							// Generamos la CamlQuery
							var camlQuery = SPUtils.generateCamlQuery(queryInformation, self.Schema);
							self.Items = self.List.getItems(camlQuery);

							var includeSentence;
							if (queryInfo) {
								if (queryInfo.select) {
									includeSentence = 'Include(' + queryInfo.select + ')';
								}
							}

							if (includeSentence !== undefined) {
								self.Context.load(self.Items, includeSentence);
							} else {
								self.Context.load(self.Items);
							}

							self.Context.executeQueryAsync(Function.createDelegate(self, function() {
								var items = [];
								var enumItems = this.Items.getEnumerator();

								while(enumItems.moveNext()) {
									var spitem = enumItems.get_current();
									items.push(spitem.get_fieldValues());
								}

								self.deferred.resolve(items);

							}), Function.createDelegate(self, self.onError));
						});
					});

					return this.deferred.promise;
				},

				getItemById: function(itemId) {

					this.deferred = $q.defer();
					var self = this;

					SPUtils.SharePointReady().then(function () {

						self.initContext().then(function() {
					    	self.Item = self.List.getItemById(itemId);
					    	self.Context.load(self.Item);

					    	self.Context.executeQueryAsync(Function.createDelegate(self, function() {
								var values = self.Item.get_fieldValues();
								self.deferred.resolve(values);

					    	}), Function.createDelegate(self, self.onError));
						});
					});

					return this.deferred.promise;
				},

				insertItem: function(values) {

					this.deferred = $q.defer();
					var self = this;

					SPUtils.SharePointReady().then(function() {
						self.initContext();

						var creationInformation = new SP.ListItemCreationInformation();
						var newItem = self.List.addItem(creationInformation);

						angular.forEach(values, function(value, key) {
							newItem.set_item(key, value);
						});
						newItem.update();
						self.Context.load(newItem);

						self.Context.executeQueryAsync(Function.createDelegate(self, function() {

							self.deferred.resolve(newItem.get_fieldValues());

						}), Function.createDelegate(self, self.onError));
					});

					return this.deferred.promise;
				},

				updateItem: function(itemId, values) {
					this.deferred = $q.defer();
					var self = this;

					SPUtils.SharePointReady().then(function() {
						self.initContext();

				    	self.Item = self.List.getItemById(itemId);

						angular.forEach(values, function(value, key) {
							var field = self.Schema.Fields[key];

							if (!field.get_readOnlyField() && field.get_typeAsString() != 'Attachments') {
								self.Item.set_item(key, value);
							}
						});
						self.Item.update();

						self.Context.executeQueryAsync(Function.createDelegate(self, function() {

							// NOTA PAU: el item se queda sin el valor ID (seguramente pq no lo envia al servidor)
							// se lo inyectamos
							var retValues = self.Item.get_fieldValues();
							retValues.ID = itemId;
							self.deferred.resolve(retValues);

						}), Function.createDelegate(self, self.onError));

					});

					return this.deferred.promise;
				},

				deleteItem: function(toDelete) {
					this.deferred = $q.defer();
					var self = this;

					SPUtils.SharePointReady().then(function() {
						self.initContext();

						var itemId = toDelete;
						if (typeof toDelete === 'object') {
							itemId = toDelete.ID;
						}

						var itemToDelete = self.List.getItemById(itemId);
						itemToDelete.deleteObject();

						self.Context.executeQueryAsync(Function.createDelegate(self, function() {

							self.deferred.resolve();

						}), Function.createDelegate(self, self.onError));

					});

					return this.deferred.promise;
				}
			};
		};

		/*
		---------------------------------------------------------------------------------------
			SPUser
			Methods:
				* getCurrent()
				* getUserByLoginName(userLoginName)
				* ensureUser(loginName)
		---------------------------------------------------------------------------------------
		*/
		this.SPUser = function() {
			return {
				getCurrent: function() {

					var self = this;
					self.def = $q.defer();

					if (self.currentUser) {
						console.log('Ya existe currentUser');
					}

					SPUtils.SharePointReady().then(function() {
						self.context = new SP.ClientContext.get_current();

						/* Esta opcion retorna un objeto de tipo Usuario, pero no
						   retorna ninguna de las propiedades del usuario.
						   En lugar del web.getCurrentUser optamos por hacer una
						   query sobre la lista de usuarios con el id del usuario
						   conectado actualmente (variable _spPageContextInfo.userId)
						 */
						//self.currentUser = self.context.get_web().get_currentUser();
						//self.context.load(self.currentUser);

						self.usersInfoList = self.context.get_web().get_siteUserInfoList();
					    	self.currentUser = self.usersInfoList.getItemById(_spPageContextInfo.userId);
					    	self.context.load(self.currentUser);

						self.context.executeQueryAsync(Function.createDelegate(self, function() {

							self.def.resolve(self.currentUser.get_fieldValues());

						}), Function.createDelegate(self, function (sender, args) {
							console.error('Error retrieving currentUser!!');
							console.error(args.get_message());

							if (self.currentUser.get_fieldValues().Id === undefined) {
								self.def.reject({
									Code: args.get_errorCode(),
									Details: args.get_errorDetails(),
									TypeName: args.get_errorTypeName,
									Value: args.get_errorValue(),
									message: args.get_message(),
									request: args.get_request(),
									stackTrace: args.get_stackTrace()
								});
							} else {
								self.def.resolve(self.currentUser.get_fieldValues());								
							}
						}));
					});

					return self.def.promise;
				},

				getUserByLoginName: function (userLoginName) {
					var self = this;
					self.def = $q.defer();

					SPUtils.SharePointReady().then(function () {
						self.context = new SP.ClientContext.get_current();

						self.user = self.context.get_web().ensureUser(userLoginName);
						self.context.load(self.user);

						self.context.executeQueryAsync(Function.createDelegate(self, function () {
							self.def.resolve(self.user);
						}), Function.createDelegate(self, function (args) {
							console.error("Error at getUserByLoginName");
							self.def.reject({
								Code: args.get_errorCode(),
								Details: args.get_errorDetails(),
								TypeName: args.get_errorTypeName,
								Value: args.get_errorValue(),
								message: args.get_message(),
								request: args.get_request(),
								stackTrace: args.get_stackTrace()
							});
						}));
					});

					return self.def.promise;
				},

				ensureUser: function(loginName) {
					var self = this;
					self.def = $q.defer();

					SPUtils.SharePointReady().then(function() {
						self.context = new SP.ClientContext.get_current();
						self.web = self.context.get_web();

						self.currentUser = self.web.ensureUser(loginName);
				    		self.context.load(self.currentUser);

						self.context.executeQueryAsync(Function.createDelegate(self, function() {

							self.def.resolve(self.currentUser);

						}), Function.createDelegate(self, function(args) {
							console.error('Error on ensureUser!!');
							self.def.reject({
								Code: args.get_errorCode(),
								Details: args.get_errorDetails(),
								TypeName: args.get_errorTypeName,
								Value: args.get_errorValue(),
								message: args.get_message(),
								request: args.get_request(),
								stackTrace: args.get_stackTrace()
							});
						}));
					});

					return self.def.promise;
				}
			};
		};
	};
	
	this.$get = function($cacheFactory, SPUtils, $q) {
		return new SharePoint($cacheFactory, SPUtils, $q);
	};
});
