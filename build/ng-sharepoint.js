/*
	misc - js functions

	Miscellaneous JavaScript utility functions.

	Pau Codina (pau.codina@kaldeera.com)
	Pedro Castro (pedro.castro@kaldeera.com, pedro.cm@gmail.com)

	Copyright (c) 2014
	Licensed under the MIT License

*/


// ***************************************************************************
// ***************************************************************************
// javascript extensions
//
String.prototype.ltrim = function(s) { 
    return this.replace(new RegExp("^" + s), ''); 
};


String.prototype.rtrim = function(s) { 
    return this.replace(new RegExp(s + "*$"), '');
};


String.prototype.trimS = function(s) {
	return this.replace(new RegExp("^" + s), '').replace(new RegExp(s + "*$"), '');
};





// ***************************************************************************
// ***************************************************************************
// Miscellaneous functions in 'utils' namespace.
//
var utils = {

	// ***************************************************************************
	// x2js
	//
	// Utility to convert XML to JSON objects and vice-versa.
	//
	// @return: X2JS object.
	//
	x2js: new X2JS({ 
		attributePrefix: ''
	}),



	// ***************************************************************************
	// isGuid
	//
	// Checks if the @value parameter is a valid GUID.
	//
	// @value: {String} The value to check if is a valid GUID.
	// @return: {Boolean} true if @value is a valid GUID. false otherwise.
	//
	isGuid: function isGuid(value) {

		var guidRegExp = new RegExp("^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$");

		return guidRegExp.test(value.trim().ltrim('{').rtrim('}'));

	},



	// ***************************************************************************
	// getQueryStringParameter
	//
	// Returns the value of one parameter from the current URL.
	// Adapted from MSDN getQueryStringParameter function.
	//
	// @paramToRetrieve: String with the name of the parameter to retrieve.
	// @return: The value of the parameter (if exists).
	//
	getQueryStringParameter: function(paramToRetrieve) {

		//var params = document.URL.split("?")[1].split("&");
		var params = window.location.search.split('?');
		var strParams = "";

		if (params.length > 1) {

			params = params[1].split('&');

			for (var i = 0; i < params.length; i++) {

				var singleParam = params[i].split("=");
				if (singleParam[0] == paramToRetrieve) return singleParam[1];

			}

		}

	},



	// ***************************************************************************
	// getQueryStringParamByName
	//
	// Returns the value of one parameter form the current 'QueryString'.
	//
	// @paramName: String with the name of the parameter to retrieve.
	// @return: The value of the parameter (if exists).
	//
	getQueryStringParamByName: function(paramName) {

	    paramName = paramName.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');

	    var regexS = '[\\?&]' + paramName + '=([^&#]*)';
	    var regex = new RegExp(regexS);
	    var results = regex.exec(window.location.search);


	    if (results !== null) {

	        return decodeURIComponent(results[1].replace(/\+/g, ' '));

	    }

	},



	// ***************************************************************************
	// parseQuery
	//
	// Converts the key/value properties of the object passed in the @query parameter 
	// to a string ready to use for REST query options QueryString parameters.
	//
	// @query: Object with REST query options like a key/value pairs properties.
	// @returns: A string with que QueryString parameters.
	//
	parseQuery: function(query) {

		var strQuery = '';

		angular.forEach(query, function(value, key) {

			var param = key + '=' + value;

			if (key.toLowerCase() === 'restfunc') {
				param = '$' + value;
			}

			strQuery += (strQuery === '' ? '?' : '&') + param;
		});

		return strQuery;

	},



	// ***************************************************************************
	// parseError
	//
	// Parse the object passed in the @error parameter like a friendly error object.
	// If the error object is the result of an error from SP.RequestExecutor.executeAsync call
	// then parse the 'body' property friendly.
	//
	// @error: Object with error properties.
	// @returns: A friendly error object.
	//
	parseError: function(error) {

		var errObj = {
			data: error.data,
			code: error.errorCode,
			message: error.errorMessage
		};


		try {

			var body = error.data.body.rtrim('\u0000');

			if (error.data.contentType.indexOf('application/json') != -1) {

				// ContentType: "application/json"
				var bodyError = angular.fromJson(body).error;

				errObj.code = bodyError.code;
				errObj.message = bodyError.message.value;

			} else {

				// ContentType: "text/html"
				errObj.message = body;

			}

		}
		catch(ex) { }

		console.error(errObj.message, errObj);

		return errObj;
	},



	// ***************************************************************************
	// parseSPResponse
	//
	// Parses the SharePoint 2013 REST query response to a JavaScript object.
	//
	// @response: The SharePoint 2013 REST query response data.
	// @returns: A friendly JavaScript objec with the response.
	//
	parseSPResponse: function(response) {

		var d = {};

		// Status code 204 = No content, so return empty object.
		// (http://www.w3.org/Protocols/rfc2616/rfc2616-sec10.html)

		if (response.statusCode != 204) {

			d = angular.fromJson(response.body || '{ "d": {} }').d;

			if (d.results){
				d = d.results;
			}
		}

		return d;
	},



	// ***************************************************************************
	// getFunctionParameterNames
	//
	// Returns an array with the names of the parameters of a function.
	//
	// @func: {function} The function name without the parenthesis.
	// @returns: {Array[{String}]} The names of the parameters.
	//
	getFunctionParameterNames: function (func) {

		var STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;
		var ARGUMENT_NAMES = /([^\s,]+)/g;

		var fnStr = func.toString().replace(STRIP_COMMENTS, '');
		var result = fnStr.slice(fnStr.indexOf('(') + 1, fnStr.indexOf(')')).match(ARGUMENT_NAMES);

		return result || [];
	}

};



/*
	CamlHelper
	Pau Codina for Kaldeera
	Copyright (c) 2014 Pau Codina (pau.codina@kaldeera.com)
	Licensed under the MIT License


	Inspired in SharePoint CAML Query Helper (http://spcamlqueryhelper.codeplex.com/) allows to convert
	OData Sentences (www.odata.org) into CAMLQuery expressions.

	Example:

		var odata = ODataParserProvider.ODataParser(listSchema);
		odata.parseExpression({
			filter: 'Country eq USA and Modified eq [Today]',
			orderBy: 'Title asc, Modified desc',
			select: 'Title, Country',
			top: 10
		});
		camlQueryXml = odata.getCAMLQuery();

	This module is used when accessing SharePoint lists through JSOM. When you use REST API this conversion 
	is not necessary and you can use directly OData queries.
*/



angular.module('CamlHelper', [])

.value('CamlOperatorEnumerator', {
	CamlQueryOperator: {
		BeginsWith: "BeginsWith",
		Contains: "Contains",
		DateRangesOverlap: "DateRangesOverlap",
		Eq: "Eq",
		Geq: "Geq",
		Gt: "Gt",
		In: "In", //-> SharePoint 2010
		Includes: "Includes", //-> SharePoint 2010
		IsNotNull: "IsNotNull",
		IsNull: "IsNull",
		Leq: "Leq",
		Lt: "Lt",
		Neq: "Neq",
		NotIncludes: "NotIncludes" //-> SharePoint 2010
	}
})

.provider('CamlQueryHelperProvider', function () {
		'use strict';	
		var CamlQueryHelperProvider = function (CamlOperatorEnumerator) {
		this.CamlQueryHelper = function () {
			return {
				// Properties
				Query: "",
				OrderByFields: "",
				GroupByFiels: "",

				// Methods
				Wrap: function (joinOperator, value) {
					return "<" + joinOperator + ">" + value + "</" + joinOperator + ">";
				},

				Join: function (joinOperator, fieldRef, type, value, lookupId) {
					var fieldRefTag;

					if (lookupId) {
						fieldRefTag = "<FieldRef Name='" + fieldRef + "' LookupId='True' />";
					} else {
						fieldRefTag = "<FieldRef Name='" + fieldRef + "' />";
					}

					var operatorTagName = joinOperator;
					var subQuery = "";

					switch (joinOperator) {
						case CamlOperatorEnumerator.CamlQueryOperator.In:
							// Eliminamos las llaves de array
							value = value.replace("[", "");
							value = value.replace("]", "");

							// Generamos el array de valores
							var valuesArray = value.split(",");

							var inValuesTag = "<Values>";

							valuesArray.forEach(function (each) {
								var eachValue = each.trim();
								var eachValueTag = "";

								// Si al transformar el valor a numero no es NaN, es un numero
								if (!isNaN(parseInt(eachValue))) {
									eachValueTag = "<Value Type='Integer'>" + eachValue + "</Value>";
								} else {
									eachValueTag = "<Value Type='Text'>" + eachValue + "</Value>";
								}

								inValuesTag = inValuesTag + eachValueTag;
							});

							inValuesTag += "</Values>";

							subQuery = fieldRefTag + inValuesTag;

							break;

						case CamlOperatorEnumerator.CamlQueryOperator.IsNull:
						case CamlOperatorEnumerator.CamlQueryOperator.IsNotNull:
							subQuery = fieldRefTag;
							break;

						default:
							var valueTag = "<Value Type='" + type + "'>" + value + "</Value>";
							subQuery = fieldRefTag + valueTag;
							break;
					}

					return this.Wrap(operatorTagName, subQuery);
				},

				OrJoin: function (joinOperator, fieldRef, type, value, lookupId) {
					var subQuery = this.Join(joinOperator, fieldRef, type, value, lookupId);

					if (!this.Query) {
						this.Query += subQuery;
					} else {
						this.Query += subQuery;
						this.Query = this.Wrap("Or", this.Query);
					}
				},

				AndJoin: function (joinOperator, fieldRef, type, value, lookupId) {
					var subQuery = this.Join(joinOperator, fieldRef, type, value, lookupId);

					if (!this.Query) {
						this.Query += subQuery;
					} else {
						this.Query += subQuery;
						this.Query = this.Wrap("And", this.Query);
					}
				},

				AddOrderByField: function (fieldRefName, ascending) {
					this.OrderByFields += "<FieldRef Name='" + fieldRefName + "' Ascending='" + ascending + "' />";
				},

				AddGroupByField: function (fieldRefName) {
					this.GroupByFiels += "<FieldRef Name='" + fieldRefName + "' />";
				},

				ToString: function () {
					var Where = "";
					var OrderBy = "";
					var GroupBy = "";
					
					if (this.Query) {
						Where = this.Wrap("Where", this.Query);
					}
					
					if (this.OrderByFields) {
						OrderBy = this.Wrap("OrderBy", this.OrderByFields);
					}

					if (this.GroupByFiels) {
						GroupBy = this.Wrap("GroupBy", this.GroupByFiels);
						// GroupBy = '<GroupBy Collapse="TRUE" GroupLimit="999">' + this.GroupByFiels + "</GroupBy>";
					}
					
					return "<Query>" + Where + GroupBy + OrderBy + "</Query>";
				}
			};
		};
	};

	this.$get = function (CamlOperatorEnumerator) {
		return new CamlQueryHelperProvider(CamlOperatorEnumerator);
	};
})

.provider('ODataSentencePartProvider', function () {
	var ODataSentencePartProvider = function (CamlOperatorEnumerator) {
		this.ODataSentencePart = function (expression, join, fields) {
			/*if (fields == undefined) {
				throw 'fields not specified';
				return;
			}

			if (expression == undefined || expression == "") {
				throw 'expression not specified';
				return;
			}

			if (join == undefined || join == "") {
				throw 'join not specified';
				return;
			}*/

			return {
				// Properties
				Expression: expression,
				Join: join,
				Fields: fields,
				
				ProcessOk: false,
				Operator: "",
				Left: "",
				Right: "",
				Field: "",
				Value: "",

				process: function () {
					if (this.testOperator(" eq ")) { this.processOperator(" eq ", CamlOperatorEnumerator.CamlQueryOperator.Eq); }
					if (this.testOperator(" ne ")) { this.processOperator(" ne ", CamlOperatorEnumerator.CamlQueryOperator.Neq); }
					if (this.testOperator(" gt ")) { this.processOperator(" gt ", CamlOperatorEnumerator.CamlQueryOperator.Gt); }
					if (this.testOperator(" ge ")) { this.processOperator(" ge ", CamlOperatorEnumerator.CamlQueryOperator.Geq); }
					if (this.testOperator(" lt ")) { this.processOperator(" lt ", CamlOperatorEnumerator.CamlQueryOperator.Lt); }
					if (this.testOperator(" le ")) { this.processOperator(" le ", CamlOperatorEnumerator.CamlQueryOperator.Leq); }
					if (this.testOperator(" lt ")) { this.processOperator(" lt ", CamlOperatorEnumerator.CamlQueryOperator.Lt); }
					if (this.testOperator(" in ")) { this.processOperator(" in ", CamlOperatorEnumerator.CamlQueryOperator.In); }
					if (this.testOperator(" contains ")) { this.processOperator(" contains ", CamlOperatorEnumerator.CamlQueryOperator.Contains); }
					if (this.testOperator(" beginswith ")) { this.processOperator(" beginswith ", CamlOperatorEnumerator.CamlQueryOperator.Contains); }
					if (this.testOperator(" isnull")) { this.processOperator(" isnull", CamlOperatorEnumerator.CamlQueryOperator.IsNull); }
					if (this.testOperator(" isnotnull")) { this.processOperator(" isnotnull", CamlOperatorEnumerator.CamlQueryOperator.IsNotNull); }

					if (!this.ProcessOk) {
						throw "Invalid sentence: " + this.Expression;
					}

					if (!this.isValidFieldInternalName(this.Fields, this.Left, this.Right)) {
						if (!this.isValidFieldInternalName(this.Fields, this.Right, this.Left)) {
							throw "Invalid sentence, any valid field vas specified (" + this.Expression + ")";
						}
					}
				},

				isValidFieldInternalName: function (fields, name, value) {
					try {
						this.Field = this.Fields.Fields[name];
						this.Value = value;
						return true;
					} catch (error) {
						return false;
					}
				},

				processOperator: function (operator, camlOperator) {
					this.Operator = camlOperator;
					var position = this.Expression.indexOf(operator);

					this.Left = this.Expression.substring(0, position);
					this.Right = this.Expression.substring(position + operator.length);

					this.ProcessOk = true;
				},

				testOperator: function (operator) {
					if (this.Expression.toLowerCase().indexOf(operator) == -1) {
						return false;
					} else {
						return true;
					}
				}
			};
		};
	};

	this.$get = function (CamlOperatorEnumerator) {
		return new ODataSentencePartProvider(CamlOperatorEnumerator);
	};
})

.provider('ODataParserProvider', function () {
	var ODataParserProvider = function (CamlQueryHelperProvider, ODataSentencePartProvider, CamlOperatorEnumerator) {
		this.ODataParser = function (fieldsSchema) {
			if (fieldsSchema === undefined) {
				throw 'fieldsSchema not specified';
			}

			return {
				Filter: "",
				Sort: "",
				Select: "",
				Top: "",
				Paging: false,
				Skip: "",
				Sentences: [],
				FieldsSchema: fieldsSchema,

				parseExpression: function (queryInfo) {
					this.Filter = "";
					this.Sort = "";
					this.Select = "";
					this.Top = "";
					this.Skip = "";
					this.GroupBy = "";
					this.Paging = false;

					if (queryInfo.filter !== undefined) { this.Filter = queryInfo.filter; }
					if (queryInfo.orderBy !== undefined) { this.Sort = queryInfo.orderBy; }
					if (queryInfo.select !== undefined) { this.Select = queryInfo.select; }
					if (queryInfo.groupBy !== undefined) { this.GroupBy = queryInfo.groupBy; }
					if (queryInfo.top !== undefined) { this.Top = queryInfo.top; }
					if (queryInfo.paging !== undefined) { this.Paging = queryInfo.paging; }
					if (queryInfo.skip !== undefined) { this.Skip = queryInfo.skip; }

					var ex = this.Filter;
					while (ex.length > 0) {
						var resultObject = this.getNextSentence(ex);
						var sentence = resultObject.dataSentencePart;
						sentence.process();
						ex = resultObject.expression;

						this.Sentences.push(sentence);
					}
				},

				getCAMLQuery: function () {
					var finalCamlQueryString = "";
					var camlHelper = CamlQueryHelperProvider.CamlQueryHelper();
					this.Sentences.reverse();

					for (var i = 0; i < this.Sentences.length; i++) {
						var lookupId = false;
						var sentence = this.Sentences[i];

						if (sentence.Field.get_typeAsString() == "Lookup" || sentence.Field.get_typeAsString() == "User" || sentence.Field.get_typeAsString() == "LookupMulti" || sentence.Field.get_typeAsString() == "UserMulti") {
							// Se quitan las llaves, si las hay
							var sentenceValue = sentence.Value;
							sentenceValue = sentenceValue.replace("[", "");
							sentenceValue = sentenceValue.replace("]", "");

							// Se intenta hacer un split por ',' y se coge el primer elemento, que sera el que nos guiara si es lookup o no
							var tempArray = sentenceValue.split(",");

							if (!isNaN(parseInt(tempArray[0]))) {
								lookupId = true;
							} else {
								lookupId = false;
							}
						}

						switch (sentence.Join) {
							case "or":
								camlHelper.OrJoin(sentence.Operator, sentence.Field.get_internalName(), sentence.Field.get_typeAsString(), sentence.Value, lookupId);
								break;

							default:
								camlHelper.AndJoin(sentence.Operator, sentence.Field.get_internalName(), sentence.Field.get_typeAsString(), sentence.Value, lookupId);
								break;
						}
					}

					if (this.Sort.length > 0) {
						var sortSentences = this.Sort.split(",");
						for (var r = 0; r < sortSentences.length; r++) {
							if (sortSentences[r] !== "") {
								var sortSentence = sortSentences[r];
								var parts = sortSentence.trim().split(" ");

								try {
									var field = this.FieldsSchema.Fields[parts[0]];
									var ascending = true;

									if (parts.length > 1 && parts[1].trim().toLowerCase() == "desc") {
										ascending = false;
									}

									camlHelper.AddOrderByField(field.get_internalName(), ascending);
								} catch (error) {
									throw error;
								}
							}
						}
					}

					if (this.GroupBy !== undefined && this.GroupBy !== "") {
						var groupFieldsList = this.GroupBy.split(',');

						for (var g = 0; g < groupFieldsList.length; g++) {
							var eachField = groupFieldsList[g].trim();

							if (eachField.length > 0) {
								camlHelper.AddGroupByField(eachField);
							}
						}
					}


					finalCamlQueryString = camlHelper.ToString();

					var rowLimitQuery = "";

					// Generamos el string con el parametro Top
					if (this.Top !== undefined && this.Top !== "") {
						rowLimitQuery += "<RowLimit Paged='TRUE'>" + this.Top + "</RowLimit>";
					}

					var viewFieldsQuery = "";

					// Generamos el string de los campos que se seleccionaran
					if (this.Select.length > 0) {
						viewFieldsQuery = "<ViewFields>";

						var selectFieldsList = this.Select.split(',');

						for (var iterator = 0; iterator < selectFieldsList.length; iterator++) {
							var selectedField = selectFieldsList[iterator].trim();

							if (selectedField.length > 0) {
								viewFieldsQuery += "<FieldRef Name='" + selectedField + "' />";
							}
						}

						viewFieldsQuery += "</ViewFields>";
					}

					// console.log("<View>" + viewFieldsQuery + finalCamlQueryString + rowLimitQuery + "</View>");

					return "<View>" + viewFieldsQuery + finalCamlQueryString + rowLimitQuery + "</View>";
				},

				getNextSentence: function (expression) {
					var position = -1;
					var operator = " and ";

					position = expression.toLowerCase().indexOf(operator);
					if (position == -1) {
						operator = " or ";
						position = expression.toLowerCase().indexOf(operator);
					}

					if (position == -1) {
						position = expression.length;
						operator = "";
					}

					var sentence = expression.substring(0, position);
					expression = expression.substring(position + operator.length);

					var dataSentence = ODataSentencePartProvider.ODataSentencePart(sentence, operator.trim(), this.FieldsSchema);

					var resultObject = {
						expression: expression,
						dataSentencePart: dataSentence
					};

					return resultObject;
				}
			};
		};
	};

	this.$get = function (CamlQueryHelperProvider, ODataSentencePartProvider, CamlOperatorEnumerator) {
		return new ODataParserProvider(CamlQueryHelperProvider, ODataSentencePartProvider, CamlOperatorEnumerator);
	};
});

/*
	ngSharePoint - module

	The ngSharePoint module is an Angular wrapper for SharePoint 2013.
	
	Pau Codina (pau.codina@kaldeera.com)
	Pedro Castro (pedro.castro@kaldeera.com, pedro.cm@gmail.com)
	
	Copyright (c) 2014
	Licensed under the MIT License
*/



// GitHub documentation style:

/**
 * @ngdoc module
 * @name ngSharePoint
 * @module ngSharePoint
 * @description
 *
 * # ngSharePoint (core module)
 * The ngSharePoint module is an Angular wrapper for SharePoint 2013.
 *
 * <div doc-module-components="ngSharePoint"></div>
 */



///////////////////////////////////////
//	ngSharePoint
///////////////////////////////////////

angular.module('ngSharePoint', ['ngSharePoint.templates', 'CamlHelper']);
angular.module('kld.ngSharePoint', []);





angular.module('ngSharePoint').constant('SPConfig', {

	CSOM: false

});





angular.module('ngSharePoint').config(['SPConfig', function(SPConfig) {

	SPConfig.CSOM = true;

}]);



/*
---------------------------------------------------------------------------------------
	Module constants
---------------------------------------------------------------------------------------
*/
angular.module('ngSharePoint').value('Constants', {
	errorTemplate: 'templates/error.html',
	userProfileUrl: '_layouts/userdisp.aspx?ID='
});

/*
	SharePoint - provider

	Main SharePoint provider.
	
	Pau Codina (pau.codina@kaldeera.com)
	Pedro Castro (pedro.castro@kaldeera.com, pedro.cm@gmail.com)

	Copyright (c) 2014
	Licensed under the MIT License
*/



///////////////////////////////////////
//	SharePoint
///////////////////////////////////////

angular.module('ngSharePoint')
.provider('SharePoint', function() {

	'use strict';

	var SharePoint = function($cacheFactory, $q, SPUtils, SPWeb) {



		this.getCurrentWeb = function() {
			return this.getWeb();
		};

		this.getWeb = function(url) {
			var def = $q.defer();

			SPUtils.SharePointReady().then(function() {
				def.resolve(new SPWeb(url));
			});

			return def.promise;
		};



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
				initContext: function(retrieveSchema) {

					// by default list schema is retrieved
					if (retrieveSchema === undefined) {
						retrieveSchema = true;
					}

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
						if (this.ListName.toLowerCase() == 'userinfolist') {
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
					if (this.Schema === undefined && retrieveSchema) {
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
	
	this.$get = function($cacheFactory, $q, SPUtils, SPWeb) {
		return new SharePoint($cacheFactory, $q, SPUtils, SPWeb);
	};
});

/*
	SPCache - factory
	
	Pau Codina (pau.codina@kaldeera.com)
	Pedro Castro (pedro.castro@kaldeera.com, pedro.cm@gmail.com)

	Copyright (c) 2014
	Licensed under the MIT License
*/



///////////////////////////////////////
//	SPCache
///////////////////////////////////////

angular.module('ngSharePoint').factory('SPCache', 

	['$q', '$cacheFactory', 'SPUtils', 'SPListItem', 

	function($q, $cacheFactory, SPUtils, SPListItem) {

		'use strict';


		return {

			getCache: function(cacheName) {

	        	var cache = $cacheFactory.get(cacheName);

	        	if (cache === void 0) {
	        		cache = $cacheFactory(cacheName); //-> Crea la cache
	        	}

	        	return cache;
			},


			getCacheValue: function(cacheName, key) {

				return this.getCache(cacheName).get(key);

			},


			setCacheValue: function(cacheName, key, value) {

				this.getCache(cacheName).put(key, value);
			},


			removeCacheValue: function(cacheName, key) {

        		this.getCache(cacheName).remove(key);
	        }

		};

	}

]);

/*
	SPList - factory
	
	Pau Codina (pau.codina@kaldeera.com)
	Pedro Castro (pedro.castro@kaldeera.com, pedro.cm@gmail.com)

	Copyright (c) 2014
	Licensed under the MIT License
*/



///////////////////////////////////////
//	SPList
///////////////////////////////////////

angular.module('ngSharePoint').factory('SPList', 

	['$q', 'SPCache', 'SPUtils', 'SPListItem', 

	function($q, SPCache, SPUtils, SPListItem) {

		'use strict';


		// ****************************************************************************
		// SPList constructor
		//
		// @web: SPWeb instance that contains the list in SharePoint.
		// @listName: Name or Guid of the list you want to instantiate.
		//
		var SPListObj = function(web, listName) {

			if (web === void 0) {
				throw '@web parameter not specified in SPList constructor.';
			}

			if (listName === void 0) {
				throw '@listName parameter not specified in SPList constructor.';
			}


			this.web = web;

			// Cleans the 'listName' parameter.
			this.listName = listName.trim().ltrim('{').rtrim('}');


			if (utils.isGuid(this.listName)) {

				this.apiUrl = '/Lists(guid\'' + this.listName + '\')';

			} else {

				if (this.listName.toLowerCase() == 'userinfolist') {

					this.apiUrl = '/SiteUserInfoList';

				} else {

					this.apiUrl = '/Lists/GetByTitle(\'' + this.listName + '\')';

				}
			}


			// Inicializa la url de la API REST de SharePoint
			this.apiUrl = web.apiUrl + this.apiUrl;

			this.Fields = SPCache.getCacheValue('SPListFieldsCache', this.apiUrl);

		};



		// ****************************************************************************		
		// getListItemEntityTypeFullName
		//
		// Gets the 'ListItemEntityTypeFullName' for the list and attach to 'this' object.
		// This property is needed for CRUD operations.
		//
		// @returns: Promise with the result of the REST query.
		//
		SPListObj.prototype.getListItemEntityTypeFullName = function() {

			var self = this;
			var def = $q.defer();


			if (this.ListItemEntityTypeFullName) {

				def.resolve(this.ListItemEntityTypeFullName);

			} else {

				self.getProperties().then(function() {
					def.resolve(self.ListItemEntityTypeFullName);
				});
				
			}

			return def.promise;

		}; // getListItemEntityTypeFullName



		// ****************************************************************************		
		// getProperties
		//
		// Gets list properties and attach it to 'this' object.
		//
		// http://msdn.microsoft.com/es-es/library/office/jj164022(v=office.15).aspx
		// @returns: Promise with the result of the REST query.
		//
		SPListObj.prototype.getProperties = function() {

			var self = this;
			var def = $q.defer();
			var executor = new SP.RequestExecutor(self.web.url);

			executor.executeAsync({

				url: self.apiUrl,
				method: 'GET', 
				headers: { 
					"Accept": "application/json; odata=verbose"
				}, 

				success: function(data) {

					var d = utils.parseSPResponse(data);
					delete d.Fields;

					angular.extend(self, d);

					def.resolve(d);
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
		// getFields
		//
		// Gets list fields
		//
		// @returns: Promise with the result of the REST query.
		//
		SPListObj.prototype.getFields = function() {

			var self = this;
			var def = $q.defer();

			if (this.Fields !== void 0) {

				def.resolve(this.Fields);

			} else {

				var executor = new SP.RequestExecutor(self.web.url);

				executor.executeAsync({

					url: self.apiUrl + '/Fields',
					method: 'GET', 
					headers: { 
						"Accept": "application/json; odata=verbose"
					}, 

					success: function(data) {

						var d = utils.parseSPResponse(data);
	/*
						// Parse SchemaXml
						angular.forEach(d, function(field) {
							field.SchemaXmlObj = utils.x2js.xml_str2json(field.SchemaXml).Field;
							field.AuthoringInfo = field.SchemaXmlObj.AuthoringInfo || '';
							field.DisplayName = field.SchemaXmlObj.DisplayName;
						});
	*/

						var fields = {};

						angular.forEach(d, function(field) {
							fields[field.InternalName] = field;
						});

						self.Fields = fields;
						SPCache.setCacheValue('SPListFieldsCache', self.apiUrl, fields);

						def.resolve(fields);
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
			}

			return def.promise;

		}; // getFields



		// ****************************************************************************		
		// getListItems
		//
		// Gets the list items
		//
		// @query: An object with REST query options.
		//		   References:
		//				http://msdn.microsoft.com/en-us/library/office/fp142385(v=office.15).aspx
		//				http://msdn.microsoft.com/en-us/library/office/dn292552(v=office.15).aspx
		//				http://msdn.microsoft.com/en-us/library/office/dn292553(v=office.15).aspx
		// @returns: Promise with the result of the REST query.
		//
		SPListObj.prototype.getListItems = function(query) {

			var self = this;
			var def = $q.defer();
			var executor = new SP.RequestExecutor(self.web.url);
			var defaultExpandProperties = 'ContentType, File, File/ParentFolder, Folder, Folder/ParentFolder';

			if (query) {
				query.$expand = defaultExpandProperties + (query.$expand ? ', ' + query.$expand : '');
			} else {
				query = { 
					$expand: defaultExpandProperties
				};
			}

			executor.executeAsync({

				url: self.apiUrl + '/Items' + utils.parseQuery(query),
				method: 'GET', 
				headers: { 
					"Accept": "application/json; odata=verbose"
				}, 

				success: function(data) {

					// El siguiente código retorna una colección de SPListItem
					// y recupera las propiedades File y/o Folder cuando la lista 
					// es una DocumentLibrary.
					//
					// Se ha comentado porque se ha implemtado la expansión
					// automática de ciertas propiedades necesarias (campos) cuando
					// la lista es una DocumentLibrary (File/Folder).
					//
					// Con el siguiente código, es más lento ya que realiza varias
					// llamadas REST para obtener los datos necesarios.
					/*
					var d = utils.parseSPResponse(data);
					var items = [];
					var itemsPromises = [];

					angular.forEach(d, function(item) {

						var spListItem = new SPListItem(self, item.ID);

						items.push(spListItem);

						// Checks if list is a DocumentLibrary
						if (self.BaseType === 1) {
							// Gets file or folder properties
							itemsPromises.push(spListItem.getProperties());
						} else {
							angular.extend(spListItem, item);
						}

					});

					$q.all(itemsPromises).then(function() {
						def.resolve(items);
					});
					*/

					// Código por defecto que retorna la colección de items que retorna la llamada REST.
					/*
					var d = utils.parseSPResponse(data);
					def.resolve(d);
					*/


					// Código que retorna una colección de objectos SPListItem ya inicializados.
					var d = utils.parseSPResponse(data);
					var items = [];

					angular.forEach(d, function(item) {
						var spListItem = new SPListItem(self, item);
						items.push(spListItem);
					});

					def.resolve(items);

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

		}; // getListItems



		// ****************************************************************************		
		// getItemById
		//
		// Gets an item from the list by its ID. 
		//
		// @id: {Counter} The id of the item.
		// @expandProperties: {String} Comma separated values with the properties to 
		//					  expand in the REST query.
		// @returns: Promise with the result of the REST query.
		//
		SPListObj.prototype.getItemById = function(id, expandProperties) {

			var self = this;
			var def = $q.defer();
			var executor = new SP.RequestExecutor(self.web.url);
			var defaultExpandProperties = 'ContentType, File, File/ParentFolder, Folder, Folder/ParentFolder';
			var query = {
				$expand: defaultExpandProperties + (expandProperties ? ', ' + expandProperties : '')
			};

			executor.executeAsync({

				url: self.apiUrl + '/getItemById(' + id + ')' + utils.parseQuery(query),
				method: 'GET', 
				headers: { 
					"Accept": "application/json; odata=verbose"
				}, 

				success: function(data) {

					var d = utils.parseSPResponse(data);
					var spListItem = new SPListItem(self, d);
					def.resolve(spListItem);
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

		}; // getItemById



		// ****************************************************************************		
		// createItem
		//
		// Creates an item in the list. 
		//
		// @returns: Promise with the result of the REST query.
		//
		SPListObj.prototype.createItem = function(properties) {

			var self = this;
			var def = $q.defer();


			self.getListItemEntityTypeFullName().then(function(listItemEntityTypeFullName) {

				var executor = new SP.RequestExecutor(self.web.url);
				var body = {
					__metadata: {
						type: listItemEntityTypeFullName
					}
				};

				angular.extend(body, properties);

				executor.executeAsync({

					url: self.apiUrl + '/items',
					method: 'POST',
					body: angular.toJson(body),
					headers: { 
						"Accept": "application/json; odata=verbose",
						"content-type": "application/json;odata=verbose",
						"X-RequestDigest": $("#__REQUESTDIGEST").val()
					}, 

					success: function(data) {

						var d = utils.parseSPResponse(data);

						def.resolve(d);
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

		}; // createItem



		// ****************************************************************************		
		// updateItem
		//
		// Creates an item in the list. 
		//
		// @id: {counter} The ID of the item to update.
		// @properties: {Object} The item properties to update.
		// @returns: Promise with the result of the REST query.
		//
		SPListObj.prototype.updateItem = function(id, properties) {

			var self = this;
			var def = $q.defer();


			self.getListItemEntityTypeFullName().then(function(listItemEntityTypeFullName) {

				var executor = new SP.RequestExecutor(self.web.url);
				var body = {
					__metadata: {
						type: listItemEntityTypeFullName
					}
				};

				angular.extend(body, properties);

				executor.executeAsync({

					url: self.apiUrl + '/items(' + id + ')',
					method: 'POST',
					body: angular.toJson(body),
					headers: { 
						"Accept": "application/json; odata=verbose",
						"content-type": "application/json;odata=verbose",
						"X-RequestDigest": $("#__REQUESTDIGEST").val(), // Remote apps that use OAuth can get the form digest value from the http://<site url>/_api/contextinfo endpoint.
																		// SharePoint-hosted apps can get the value from the #__REQUESTDIGEST page control if it's available on the SharePoint page.
    					"X-HTTP-Method": "MERGE",
						"IF-MATCH": "*" // Overwrite any changes in the item. 
										// Use 'item.__metadata.etag' to provide a way to verify that the object being changed has not been changed since it was last retrieved.
					},

					success: function(data) {

						var d = utils.parseSPResponse(data);

						def.resolve(d);
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

		}; // updateItem



		// ****************************************************************************		
		// deleteItem
		//
		// Deletes an item in the list. 
		//
		// @id: {counter} The ID of the item to delete.
		// @returns: Promise with the result of the REST query.
		//
		SPListObj.prototype.deleteItem = function(id) {

			var self = this;
			var def = $q.defer();
			var executor = new SP.RequestExecutor(self.web.url);

			executor.executeAsync({

				url: self.apiUrl + '/items(' + id + ')',
				method: 'POST',
				headers: { 
					"Accept": "application/json; odata=verbose",
					"X-RequestDigest": $("#__REQUESTDIGEST").val(),
					"X-HTTP-Method": "DELETE",
					"IF-MATCH": "*"
				},

				success: function(data) {

					var d = utils.parseSPResponse(data);

					def.resolve(d);
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

		}; // deleteItem



		// Returns the SPListObj class
		return SPListObj;

	}
]);

/*
	SPListItem - factory
	
	Pau Codina (pau.codina@kaldeera.com)
	Pedro Castro (pedro.castro@kaldeera.com, pedro.cm@gmail.com)

	Copyright (c) 2014
	Licensed under the MIT License
*/



///////////////////////////////////////
//	SPList
///////////////////////////////////////

angular.module('ngSharePoint').factory('SPListItem', 

	['$q', 'SPUtils', 

	function($q, SPUtils) {

		'use strict';


		// ****************************************************************************
		// SPListItem constructor
		//
		// @list: SPList instance that contains the item in SharePoint.
		// @data: {Int32 | object} Must be an item identifier (ID) or item properties.
		//
		var SPListItemObj = function(list, data) {

			if (list === void 0) {
				throw '@list parameter not specified in SPListItem constructor.';
			}


			this.list = list;


			if (data !== void 0) {

				if (typeof data === 'object' && data.concat === void 0) { //-> is object && not is array

					angular.extend(this, data);

				} else {

					if (!isNaN(parseInt(data))) {

						this.Id = data;

					} else {

						throw 'Incorrect @data parameter in SPListItem constructor';
					}
				}

			}
		};



		SPListItemObj.prototype.getAPIUrl = function() {

			var apiUrl = this.list.apiUrl + '/Items';

			if (this.Id !== void 0) {
				
				apiUrl += '(' + this.Id + ')';
			}

			return apiUrl;
		};



		// ****************************************************************************		
		// getProperties
		//
		// Gets properties of the item and attach it to 'this' object.
		// If the item is a DocumentLibrary item, also gets the File and/or Folder.
		//
		// @returns: Promise with the result of the REST query.
		//
		SPListItemObj.prototype.getProperties = function() {

			var self = this;
			var def = $q.defer();
			var executor = new SP.RequestExecutor(self.list.web.url);

			executor.executeAsync({

				url: self.getAPIUrl(),
				method: 'GET', 
				headers: { 
					"Accept": "application/json; odata=verbose"
				}, 

				success: function(data) {

					var d = utils.parseSPResponse(data);

					if (self.list.BaseType === 0) {

						// DocumentLibrary properties
						switch (d.FileSystemObjectType) {

							case 0:
								// get the File
								self.getFile().then(function() {
									def.resolve(d);
								});
								break;

							case 1: 
								// get the Folder
								self.getFolder().then(function() {
									def.resolve(d);
								});
								break;

							default:
								def.resolve(d);
								break;

						}

					}
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

		};



		// ****************************************************************************		
		// getFile
		//
		// Gets file properties of the item and attach it to 'this' object.
		// If the item is not a DocumentLibrary item, the REST query returns no results.
		//
		// @returns: Promise with the result of the REST query.
		//
		SPListItemObj.prototype.getFile = function() {

			var self = this;
			var def = $q.defer();
			var executor = new SP.RequestExecutor(self.list.web.url);

			executor.executeAsync({

				url: self.getAPIUrl() + '/File?$expand=ParentFolder',
				method: 'GET', 
				headers: { 
					"Accept": "application/json; odata=verbose"
				}, 

				success: function(data) {

					var d = utils.parseSPResponse(data);
					angular.extend(self, d);

					def.resolve(d);
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

		};



		// ****************************************************************************		
		// getFolder
		//
		// Gets floder properties of the item and attach it to 'this' object.
		// If the item is not a DocumentLibrary item, the REST query returns no results.
		//
		// @returns: Promise with the result of the REST query.
		//
		SPListItemObj.prototype.getFolder = function() {

			var self = this;
			var def = $q.defer();
			var executor = new SP.RequestExecutor(self.list.web.url);

			executor.executeAsync({

				url: self.getAPIUrl() + '/Folder?$expand=ParentFolder',
				method: 'GET', 
				headers: { 
					"Accept": "application/json; odata=verbose"
				}, 

				success: function(data) {

					var d = utils.parseSPResponse(data);
					angular.extend(self, d);

					def.resolve(d);
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

		};



		// ****************************************************************************		
		// save
		//
		// Creates this item in the list. 
		//
		// @returns: Promise with the result of the REST query.
		//
		SPListItemObj.prototype.save = function() {

			var self = this;
			var def = $q.defer();


			self.list.getListItemEntityTypeFullName().then(function(listItemEntityTypeFullName) {

				var executor = new SP.RequestExecutor(self.list.web.url);
				var body = {
					__metadata: {
						type: listItemEntityTypeFullName
					}
				};


				var saveObj = angular.extend({}, self);
				delete saveObj.list;
				delete saveObj.apiUrl;

				angular.forEach(saveObj, function(value, key) {

					if (typeof value === 'object') {
						delete saveObj[key];
					}
				});

				console.log(saveObj);
				
				angular.extend(body, saveObj);

				var headers = {
					"Accept": "application/json; odata=verbose",
					"content-type": "application/json;odata=verbose",
					"X-RequestDigest": $("#__REQUESTDIGEST").val()
				};

				if (self.Id !== void 0) {

					// UPDATE
					angular.extend(headers, {
    					"X-HTTP-Method": "MERGE",
						"IF-MATCH": "*" // Overwrite any changes in the item. 
										// Use 'item.__metadata.etag' to provide a way to verify that the object being changed has not been changed since it was last retrieved.
					});
				}

				executor.executeAsync({

					url: self.getAPIUrl(),
					method: 'POST',
					body: angular.toJson(body),
					headers: headers,

					success: function(data) {

						var d = utils.parseSPResponse(data);

						angular.extend(self, d);

						def.resolve(d);
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

		}; // updateItem



		// ****************************************************************************		
		// delete
		//
		// Deletes this item in the list. 
		//
		// @returns: Promise with the result of the REST query.
		//
		SPListItemObj.prototype.delete = function() {

			var self = this;
			var def = $q.defer();
			var executor = new SP.RequestExecutor(self.list.web.url);

			executor.executeAsync({

				url: self.getAPIUrl(),
				method: 'POST',
				headers: { 
					"Accept": "application/json; odata=verbose",
					"X-RequestDigest": $("#__REQUESTDIGEST").val(),
					"X-HTTP-Method": "DELETE",
					"IF-MATCH": "*"
				},

				success: function(data) {

					var d = utils.parseSPResponse(data);

					def.resolve(d);
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

		}; // deleteItem

		// Returns the SPListItemObj class
		return SPListItemObj;

	}
]);
/*
	SPUtils - factory

	SharePoint utility functions.

	Pau Codina (pau.codina@kaldeera.com)
	Pedro Castro (pedro.castro@kaldeera.com, pedro.cm@gmail.com)

	Copyright (c) 2014
	Licensed under the MIT License
*/



///////////////////////////////////////
//	SPUtils
///////////////////////////////////////

angular.module('ngSharePoint').factory('SPUtils', ['$q', 'ODataParserProvider', function ($q, ODataParserProvider) {

	'use strict';


	var isSharePointReady = false;

	return {
		inDesignMode: function () {
			var publishingEdit = window.g_disableCheckoutInEditMode;
			var form = document.forms[MSOWebPartPageFormName];
			var input = form.MSOLayout_InDesignMode || form._wikiPageMode;

			return !!(publishingEdit || (input && input.value));
		},

		SharePointReady: function () {
			var deferred = $q.defer();

			if (isSharePointReady) {

				deferred.resolve();

			} else {

				// Load sp.js
				SP.SOD.executeOrDelayUntilScriptLoaded(function () {

					// Load SP.RequestExecutor.js
					SP.SOD.registerSod('SP.RequestExecutor.js', SP.Utilities.Utility.getLayoutsPageUrl('SP.RequestExecutor.js'));

					EnsureScriptFunc('SP.RequestExecutor.js', 'SP.RequestExecutor', function() {

						isSharePointReady = true;
						deferred.resolve();

					});

				}, "sp.js");
			}

			return deferred.promise;
		},

		generateCamlQuery: function (queryInfo, listSchema) {
			/*
				Formato del objeto de filtro:
				{
					filter: 'Country eq ' + $routeParams.country + ' and Modified eq [Today]',
					orderBy: 'Title asc, Modified desc',
					select: 'Title, Country',
					top: 10,
					pagingInfo: 'Paged=TRUE&p_ID=nnn[&PagedPrev=TRUE]'
				}
			*/
			var camlQueryXml = "";
			var camlQuery;

			if (queryInfo === undefined) {
				camlQuery = SP.CamlQuery.createAllItemsQuery();
			} else {
				// El formato del parametro puede ser un objeto, que hay que procesar, o un string directo de CamlQuery
				if (typeof queryInfo === 'string') {
					camlQueryXml = queryInfo;
				} else if (typeof queryInfo === 'object') {
					var odata = ODataParserProvider.ODataParser(listSchema);
					odata.parseExpression(queryInfo);
					camlQueryXml = odata.getCAMLQuery();
				}

				if (camlQueryXml) {
					camlQuery = new SP.CamlQuery();
					camlQuery.set_viewXml(camlQueryXml);
				}

				if (queryInfo.pagingInfo) {
					var position = new SP.ListItemCollectionPosition(); 
	        		position.set_pagingInfo(queryInfo.pagingInfo);
					camlQuery.set_listItemCollectionPosition(position);
				}
			}
			return camlQuery;
		},

		parseQuery: function(query) {

			var strQuery = '';

			angular.forEach(query, function(value, key) {
				strQuery += (strQuery !== '' ? '&' : '?') + key + '=' + value;
			});

			return strQuery;
		},

		parseError: function(errorData) {

			var errorObject = {
				code: errorData.errorCode,
				message: errorData.errorMessage
			};

			try {

				var body = angular.fromJson(data.body);

				errorObject.code = body.error.code;
				errorObject.message = body.error.message.value;

			} catch(ex) {}

			console.error(errorObject.message);
			return errorObject;
		}


	};
}]);

/*
	SPWeb - factory
	
	Pau Codina (pau.codina@kaldeera.com)
	Pedro Castro (pedro.castro@kaldeera.com, pedro.cm@gmail.com)

	Copyright (c) 2014
	Licensed under the MIT License
*/



///////////////////////////////////////
//	SPWeb
///////////////////////////////////////

angular.module('ngSharePoint').factory('SPWeb', 

	['$q', 'SPUtils', 'SPList',

	function($q, SPUtils, SPList) {

		'use strict';


		// ****************************************************************************
		// SPWeb constructor
		//
		// @url: Url del web que se quiere instanciar.
		//
		var SPWebObj = function(url) {

			this.url = url;

			// Si no se ha especificado url, obtiene la url del web actual 
			if (!this.url) {

				this.url = _spPageContextInfo.webServerRelativeUrl;

			}


			// Inicializa la url de la API REST de SharePoint
			this.apiUrl = this.url.rtrim('/') + '/_api/web';

		};



		// ****************************************************************************		
		// getProperties
		//
		// Gets web properties and attach it to 'this' object.
		//
		// http://msdn.microsoft.com/es-es/library/office/jj164022(v=office.15).aspx
		// @returns: Promise with the result of the REST query.
		//
		SPWebObj.prototype.getProperties = function() {

			var self = this;
			var def = $q.defer();

			SPUtils.SharePointReady().then(function() {

				var executor = new SP.RequestExecutor(self.url);

				executor.executeAsync({

					url: self.apiUrl,
					method: 'GET', 
					headers: { 
						"Accept": "application/json; odata=verbose"
					}, 

					success: function(data) {

						var d = utils.parseSPResponse(data);
						angular.extend(self, d);
						def.resolve(d);
						
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

		}; // getProperties



		// ****************************************************************************		
		// getList
		//
		// Gets a SPList object (SPList factory)
		//
		// @listName: String or Guid with the name or GUID of the list.
		// @returns: SPList instance.
		//
		SPWebObj.prototype.getLists = function() {

			var self = this;
			var def = $q.defer();


			SPUtils.SharePointReady().then(function() {

				var executor = new SP.RequestExecutor(self.url);

				executor.executeAsync({

					url: self.apiUrl + '/Lists',
					method: 'GET', 
					headers: { 
						"Accept": "application/json; odata=verbose"
					}, 

					success: function(data) {

						def.resolve(utils.parseSPResponse(data));
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

		};



		// ****************************************************************************		
		// getList
		//
		// Gets a SPList object (SPList factory)
		//
		// @listName: String or Guid with the name or GUID of the list.
		// @returns: SPList instance.
		//
		SPWebObj.prototype.getList = function(listName) {

			var def = $q.defer();
			def.resolve(new SPList(this, listName));
			return def.promise;

		};



		// ****************************************************************************		
		// staticMethod
		//
		// Example of static method
		//
		SPWebObj.staticMethod = function() {

			// You can access this method directly from the class without the need of create an instance.
			// Example: SPWeb.staticMethod();
			//
			// Inside this method you don't have access to the 'this' object (instance).

		};



		// Returns the SPWebObj class
		return SPWebObj;

	}
]);

/*
	SPFieldChoice - directive
	
	Pau Codina (pau.codina@kaldeera.com)
	Pedro Castro (pedro.castro@kaldeera.com, pedro.cm@gmail.com)

	Copyright (c) 2014
	Licensed under the MIT License
*/



///////////////////////////////////////
//	SPFieldChoice
///////////////////////////////////////

angular.module('ngSharePoint').directive('spfieldChoice', 

	['SPUtils', '$compile', '$templateCache', '$http',

	function(SPUtils, $compile, $templateCache, $http) {

		return {

			restrict: 'EA',
			require: ['^spform', 'ngModel'],
			replace: true,
			scope: {
				mode: '@',
				value: '=ngModel'
			},
			//templateUrl: 'templates/form-templates/spfield-text.html',
			template: '<div></div>',

			link: function($scope, $element, $attrs, controllers) {

				//console.log('SPFieldChoice.postLink (' + $attrs.name + ')');

				$scope.schema = controllers[0].getFieldSchema($attrs.name);

				// Watch for form mode changes
				$scope.$watch(function() {

					return $scope.mode || controllers[0].getFormMode();

				}, function(newValue) {

					$scope.currentMode = newValue;
					renderField(newValue);

				});



				function renderField(mode) {

					$http.get('templates/form-templates/spfield-choice-' + mode + '.html', { cache: $templateCache }).success(function(html) {
						var newElement = $compile(html)($scope);
						$element.replaceWith(newElement);
						$element = newElement;
					});

				}

			}

		};

	}

]);
/*
	SPFieldControl - directive
	
	Pau Codina (pau.codina@kaldeera.com)
	Pedro Castro (pedro.castro@kaldeera.com, pedro.cm@gmail.com)

	Copyright (c) 2014
	Licensed under the MIT License
*/



///////////////////////////////////////
//	SPFieldControl
///////////////////////////////////////

angular.module('ngSharePoint').directive('spfieldControl', 

	['SPUtils', '$compile', '$templateCache', '$http',

	function(SPUtils, $compile, $templateCache, $http) {

		return {

			restrict: 'EA',
			require: '^spform',
			replace: true,
			//template: '<div class="ms-formbody"></div>',
			templateUrl: 'templates/form-templates/spfield-control.html',


			link: function($scope, $element, $attrs, spformController) {

				//console.log('SPFieldControl.postLink (' + $attrs.name + ')');

				var fieldDefinition = spformController.getFieldSchema($attrs.name);
				var fieldType = fieldDefinition.TypeAsString;
				var mode = ($attrs.mode ? ' mode="' + $attrs.mode + '"' : '');
				var fieldControlHTML = '<spfield-' + fieldType + ' ng-model="item.' + $attrs.name + '" name="' + $attrs.name + '"' + mode + '></spfield-' + fieldType + '>';

				$element.append(fieldControlHTML);
				$compile($element)($scope);

			}

		};

	}

]);

/*
	SPFieldDescription - directive
	
	Pau Codina (pau.codina@kaldeera.com)
	Pedro Castro (pedro.castro@kaldeera.com, pedro.cm@gmail.com)

	Copyright (c) 2014
	Licensed under the MIT License
*/



///////////////////////////////////////
//	SPFieldDescription
///////////////////////////////////////

angular.module('ngSharePoint').directive('spfieldDescription', 

	['SPUtils', '$compile', '$templateCache', '$http',

	function(SPUtils, $compile, $templateCache, $http) {

		return {

			restrict: 'EA',
			require: '^spform',
			replace: true,
			templateUrl: 'templates/form-templates/spfield-description.html',
			scope: true,


			link: function($scope, $element, $attrs, spformController) {

				//console.log('SPFieldDescription.postLink (' + $attrs.name + ')');

				$scope.schema = spformController.getFieldSchema($attrs.name);
				//$scope.description = schema.Description;


				$scope.$watch(function() {

					return $scope.mode || spformController.getFormMode();

				}, function(newValue) {

					$scope.currentMode = newValue;

				});
			}
		};
	}
]);
/*
	SPFieldLabel - directive
	
	Pau Codina (pau.codina@kaldeera.com)
	Pedro Castro (pedro.castro@kaldeera.com, pedro.cm@gmail.com)

	Copyright (c) 2014
	Licensed under the MIT License
*/



///////////////////////////////////////
//	SPFieldLabel
///////////////////////////////////////

angular.module('ngSharePoint').directive('spfieldLabel', 

	['SPUtils', '$compile', '$templateCache', '$http',

	function(SPUtils, $compile, $templateCache, $http) {

		return {

			restrict: 'EA',
			require: '^spform',
			replace: true,
			templateUrl: 'templates/form-templates/spfield-label.html',
			scope: {
				mode: '@'
			},


			link: function($scope, $element, $attrs, spformController) {

				//console.log('SPFieldLabel.postLink (' + $attrs.name + ')');

				$scope.schema = spformController.getFieldSchema($attrs.name);
				//$scope.label = schema.Title;
				//$scope.required = schema.Required;


				$scope.$watch(function() {

					return $scope.mode || spformController.getFormMode();

				}, function(newValue) {

					$scope.currentMode = newValue;

				});
			}
		};
	}
]);
/*
	SPFieldMultiChoice - directive
	
	Pau Codina (pau.codina@kaldeera.com)
	Pedro Castro (pedro.castro@kaldeera.com, pedro.cm@gmail.com)

	Copyright (c) 2014
	Licensed under the MIT License
*/



///////////////////////////////////////
//	SPFieldMultiChoice
///////////////////////////////////////

angular.module('ngSharePoint').directive('spfieldMultichoice', 

	['SPUtils', '$compile', '$templateCache', '$http',

	function(SPUtils, $compile, $templateCache, $http) {

		return {

			restrict: 'EA',
			require: ['^spform', 'ngModel'],
			replace: true,
			scope: {
				mode: '@',
				value: '=ngModel'
			},
			//templateUrl: 'templates/form-templates/spfield-text.html',
			template: '<div></div>',

			link: function($scope, $element, $attrs, controllers) {

				//console.log('SPFieldChoice.postLink (' + $attrs.name + ')');

				$scope.schema = controllers[0].getFieldSchema($attrs.name);
				$scope.choices = $scope.value.results;

				// Watch for form mode changes
				$scope.$watch(function() {

					return $scope.mode || controllers[0].getFormMode();

				}, function(newValue) {

					$scope.currentMode = newValue;
					renderField(newValue);

				});



				function renderField(mode) {

					$http.get('templates/form-templates/spfield-multichoice-' + mode + '.html', { cache: $templateCache }).success(function(html) {
						var newElement = $compile(html)($scope);
						$element.replaceWith(newElement);
						$element = newElement;
					});

				}


				$scope.toggleCheckbox = function(choice, i, e) {

					var idx = $scope.choices.indexOf(choice);

					if (idx != -1) {
						$scope.choices.splice(idx, 1);
					} else {
						$scope.choices.push(choice);
					}

					console.log($scope.choices);
				};

			}

		};

	}

]);

/*
	SPFieldNote - directive
	
	Pau Codina (pau.codina@kaldeera.com)
	Pedro Castro (pedro.castro@kaldeera.com, pedro.cm@gmail.com)

	Copyright (c) 2014
	Licensed under the MIT License
*/



///////////////////////////////////////
//	SPFieldNote
///////////////////////////////////////

angular.module('ngSharePoint').directive('spfieldNote', 

	['SPUtils', '$compile', '$templateCache', '$http',

	function(SPUtils, $compile, $templateCache, $http) {

		return {

			restrict: 'EA',
			require: ['^spform', 'ngModel'],
			replace: true,
			scope: {
				mode: '@',
				value: '=ngModel'
			},
			//templateUrl: 'templates/form-templates/spfield-note.html',
			template: '<div></div>',

			link: function($scope, $element, $attrs, controllers) {

				//console.log('SPFieldNote.postLink (' + $attrs.name + ')');

				$scope.schema = controllers[0].getFieldSchema($attrs.name);

				// Watch for form mode changes
				$scope.$watch(function() {

					return $scope.mode || controllers[0].getFormMode();

				}, function(newValue) {

					$scope.currentMode = newValue;
					renderField(newValue);

				});



				function renderField(mode) {

					$http.get('templates/form-templates/spfield-note-' + mode + '.html', { cache: $templateCache }).success(function(html) {
						var newElement = $compile(html)($scope);
						$element.replaceWith(newElement);
						$element = newElement;
					});

				}

			}

		};

	}

]);
/*
	SPFieldText - directive
	
	Pau Codina (pau.codina@kaldeera.com)
	Pedro Castro (pedro.castro@kaldeera.com, pedro.cm@gmail.com)

	Copyright (c) 2014
	Licensed under the MIT License
*/



///////////////////////////////////////
//	SPFieldText
///////////////////////////////////////

angular.module('ngSharePoint').directive('spfieldText', 

	['SPUtils', '$compile', '$templateCache', '$http',

	function(SPUtils, $compile, $templateCache, $http) {

		return {

			restrict: 'EA',
			require: ['^spform', 'ngModel'],
			replace: true,
			scope: {
				mode: '@',
				value: '=ngModel'
			},
			//templateUrl: 'templates/form-templates/spfield-text.html',
			template: '<div></div>',

			link: function($scope, $element, $attrs, controllers) {

				//console.log('SPFieldText.postLink (' + $attrs.name + ')');

				$scope.schema = controllers[0].getFieldSchema($attrs.name);

				// Watch for form mode changes
				$scope.$watch(function() {

					return $scope.mode || controllers[0].getFormMode();

				}, function(newValue) {

					$scope.currentMode = newValue;
					renderField(newValue);

				});



				function renderField(mode) {

					$http.get('templates/form-templates/spfield-text-' + mode + '.html', { cache: $templateCache }).success(function(html) {
						var newElement = $compile(html)($scope);
						$element.replaceWith(newElement);
						$element = newElement;
					});

				}

			}

		};

	}

]);
/*
	SPField - directive
	
	Pau Codina (pau.codina@kaldeera.com)
	Pedro Castro (pedro.castro@kaldeera.com, pedro.cm@gmail.com)

	Copyright (c) 2014
	Licensed under the MIT License
*/



///////////////////////////////////////
//	SPField
///////////////////////////////////////

angular.module('ngSharePoint').directive('spfield', 

	['SPUtils', '$compile', '$templateCache', '$http',

	function(SPUtils, $compile, $templateCache, $http) {

		return {

			restrict: 'EA',
			replace: true,
			template: '<tr></tr>',
			//templateUrl: 'templates/form-templates/spfield.html',

			compile: function(element, attrs) {

				//console.log('SPField.compile (' + attrs.name + ')');

				return {
					pre: function($scope, $element, $attrs) {

						//console.log('SPField.preLink (' + $attrs.name + ')', $attrs);

						$http.get('templates/form-templates/spfield.html', { cache: $templateCache }).success(function(html) {

							var mode = ($attrs.mode ? 'mode="' + $attrs.mode + '"' : '');
							html = html.replace(/\{\{name\}\}/g, $attrs.name).replace(/\{\{mode\}\}/g, mode);
								
							var newElement = $compile(html)($scope);
							$element.replaceWith(newElement);
							$element = newElement;

						});

/*
						var fieldHTML = '<spfield-label name="' + $attrs.name + '"></spfield-label>'+
										'<spfield-control name="' + $attrs.name + '"></spfield-control>' +
										'<spfield-description name="' + $attrs.name + '"></spfield-description>';

						$element.html('').append(fieldHTML);
						$compile($element)($scope);
*/

					},

					post: function($scope, $element, $attrs) {
						//console.log('SPField.postLink (' + $attrs.name + ')');
					}
				};

			}

		};

	}

]);

/*
	SPForm - directive
	
	Pau Codina (pau.codina@kaldeera.com)
	Pedro Castro (pedro.castro@kaldeera.com, pedro.cm@gmail.com)

	Copyright (c) 2014
	Licensed under the MIT License
*/



///////////////////////////////////////
//	SPForm
///////////////////////////////////////

angular.module('ngSharePoint').directive('spform', 

	['SPUtils', '$compile', '$templateCache', '$http',

	function(SPUtils, $compile, $templateCache, $http) {

		return {
			restrict: 'EA',
			template: '<form></form>',
			transclude: true,
			replace: true,
			//terminal: true,
			scope: {
				item: '='
			},



			controller: ['$scope', '$attrs', function($scope, $attrs) {

				this.getFieldSchema = function(fieldName) {
	
					return $scope.schema[fieldName];
				};

				this.getFormMode = function() {

					return $attrs.mode || 'display';

				};

			}],



			compile: function(element, attrs, transclude) {

				//console.log('SPForm.compile');

				return {

					pre: function($scope, $element, $attrs) {

						//console.log('SPForm.preLink');

						if (SPUtils.inDesignMode()) return;


						$scope.$watch('item', function(newValue) {

							// Checks if the item has a value
							if (newValue === void 0) return;


							// Checks if list fields (schema) were loaded
							if ($scope.item.list.Fields === void 0) {

								$scope.item.list.getFields().then(function(fields) {

									$scope.schema = fields;
									$scope.loadItemTemplate();

								});

							} else {

								$scope.schema = $scope.item.list.Fields;
								$scope.loadItemTemplate();

							}

						});



						$scope.loadItemTemplate = function() {
							
							if (!$scope.templateLoaded) {

								transclude($scope, function (clone) {
									angular.forEach(clone, function (e) {
										$element.append(e);
									});
								});


								if ($attrs.templateUrl) {

									$http.get($attrs.templateUrl, { cache: $templateCache }).success(function (html) {

										$element.html('').append(html);
										$compile($element)($scope);

									});

								} else {

									if ($element[0].children.length === 0) {

										// if no template ... generate a default template
										$scope.fields = [];

										angular.forEach($scope.item.list.Fields, function(field) {
											if (!field.Hidden && !field.Sealed && !field.ReadOnlyField && field.InternalName !== 'ContentType' && field.InternalName !== 'Attachments') {
												$scope.fields.push(field);
											}
										});

										$http.get('templates/form-templates/spform.html', { cache: $templateCache }).success(function (html) {

											$element.html('').append(html);
											$compile($element)($scope);

										});

									}
									
								}

							}

							$scope.templateLoaded = true;
						};

					},

					post: function($scope, $element, $attrs) {
						
						//console.log('SPForm.postLink');
						
					}

				};

			}

		};
	}

]);