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

	/* No external dependences! */
	/*
	x2js: new X2JS({ 
		attributePrefix: ''
	}),
	*/


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





angular.module('ngSharePoint').constant('SPConfig', {

	CSOM: false

});





angular.module('ngSharePoint').config(['SPConfig', function(SPConfig) {

	//SPConfig.CSOM = true;

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


		// ****************************************************************************		
		// getCurrentWeb
		//
		// Gets the current web.
		//
		// @returns: Promise with a new SPWeb (factory) object that allow access to 
		//			 web methods and properties.
		//
		this.getCurrentWeb = function() {
			return this.getWeb();
		};



		// ****************************************************************************		
		// getWeb
		//
		// Gets the current web.
		//
		// @url: The url of the web you want to retrieve.
		// @returns: Promise with a new SPWeb (factory) object that allow access to 
		//			 web methods and properties.
		//
		this.getWeb = function(url) {
			var def = $q.defer();

			SPUtils.SharePointReady().then(function() {
				def.resolve(new SPWeb(url));
			});

			return def.promise;
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

	['$q', '$cacheFactory', 

	function($q, $cacheFactory) {

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

	['$q', 'SPCache', 'SPListItem', 

	function($q, SPCache, SPListItem) {

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


			// Initializes the SharePoint API REST url for the list.
			this.apiUrl = web.apiUrl + this.apiUrl;

			// Gets the list fields (Schema) from the cache if exists.
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
		SPListObj.prototype.getProperties = function(query) {

			var self = this;
			var def = $q.defer();
			var executor = new SP.RequestExecutor(self.web.url);
			var defaultExpandProperties = 'Views';
			// NOTA: Se ha eliminado la expansión automática del objeto 'Forms' debido a 
			// que si la lista es la 'SiteUserInfoList' se genera un error porque no 
			// tiene formularios sino que se utiliza la página /_layouts/15/UserDisp.aspx
			// para visualizar un usuario y un popup para la edición.

			if (query) {
				query.$expand = defaultExpandProperties + (query.$expand ? ', ' + query.$expand : '');
			} else {
				query = { 
					$expand: defaultExpandProperties
				};
			}

			executor.executeAsync({

				url: self.apiUrl + utils.parseQuery(query),
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


				// Set the contents for the REST API call.
				// ----------------------------------------------------------------------------
				var body = {
					__metadata: {
						type: listItemEntityTypeFullName
					}
				};

				angular.extend(body, properties);


				// Set the headers for the REST API call.
				// ----------------------------------------------------------------------------
				var headers = {
					"Accept": "application/json; odata=verbose",
					"content-type": "application/json;odata=verbose"
				};

				var requestDigest = document.getElementById('__REQUESTDIGEST');
				// Remote apps that use OAuth can get the form digest value from the http://<site url>/_api/contextinfo endpoint.
				// SharePoint-hosted apps can get the value from the #__REQUESTDIGEST page control if it's available on the SharePoint page.

				if (requestDigest !== null) {
					headers['X-RequestDigest'] = requestDigest.value;
				}


				// Make the call.
				// ----------------------------------------------------------------------------
				executor.executeAsync({

					url: self.apiUrl + '/items',
					method: 'POST',
					body: angular.toJson(body),
					headers: headers, 

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


				// Set the contents for the REST API call.
				// ----------------------------------------------------------------------------
				var body = {
					__metadata: {
						type: listItemEntityTypeFullName
					}
				};

				angular.extend(body, properties);


				// Set the headers for the REST API call.
				// ----------------------------------------------------------------------------
				var headers = {
					"Accept": "application/json; odata=verbose",
					"content-type": "application/json;odata=verbose",
					"X-HTTP-Method": "MERGE",
					"IF-MATCH": "*" // Overwrite any changes in the item. 
									// Use 'item.__metadata.etag' to provide a way to verify that the object being changed has not been changed since it was last retrieved.
				};

				var requestDigest = document.getElementById('__REQUESTDIGEST');

				if (requestDigest !== null) {
					headers['X-RequestDigest'] = requestDigest.value;
				}


				// Make the call.
				// ----------------------------------------------------------------------------
				executor.executeAsync({

					url: self.apiUrl + '/items(' + id + ')',
					method: 'POST',
					body: angular.toJson(body),
					headers: headers,

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
		// Removes an item from the list.
		//
		// @id: {counter} The ID of the item to delete.
		// @returns: Promise with the result of the REST query.
		//
		SPListObj.prototype.deleteItem = function(id) {

			var self = this;
			var def = $q.defer();
			var executor = new SP.RequestExecutor(self.web.url);


			// Set the headers for the REST API call.
			// ----------------------------------------------------------------------------
			var headers = {
				"Accept": "application/json; odata=verbose",
				"X-HTTP-Method": "DELETE",
				"IF-MATCH": "*"
			};

			var requestDigest = document.getElementById('__REQUESTDIGEST');

			if (requestDigest !== null) {
				headers['X-RequestDigest'] = requestDigest.value;
			}


			// Make the call.
			// ----------------------------------------------------------------------------				
			executor.executeAsync({

				url: self.apiUrl + '/items(' + id + ')',
				method: 'POST',
				headers: headers,

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

			var self = this;

			if (list === void 0) {
				throw '@list parameter not specified in SPListItem constructor.';
			}


			this.list = list;


			if (data !== void 0) {

				if (typeof data === 'object' && data.concat === void 0) { //-> is object && not is array

					angular.extend(this, data);
					this.clean();

				} else {

					if (!isNaN(parseInt(data))) {

						this.Id = data;

					} else {

						throw 'Incorrect @data parameter in SPListItem constructor';
					}
				}

			}
		};



		// ****************************************************************************
		// isNew
		//
		// Returns a boolean value indicating if the item is anew item.
		//
		// @returns: {Boolean} True if the item is a new item. Otherwise false.
		//
		SPListItemObj.prototype.isNew = function() {
			return this.Id === void 0;
		};



		// ****************************************************************************
		// clean
		//
		// Cleans undesirable item properties obtained form SharePoint.
		//
		// @returns: {SPListItem} The item itself to allow chaining calls.
		//
		SPListItemObj.prototype.clean = function() {

			var self = this;

			angular.forEach(this, function(value, key) {

				if (typeof value === 'object' && value !== null) {
					if (value.__deferred) {
						delete self[key];
					}
				}

			});

			return this;
		};



		// ****************************************************************************		
		// getAPIUrl
		//
		// Gets the SharePoint 2013 REST API url for the item.
		//
		// @returns: {String} The item API url.
		//
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

		}; // getProperties



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


				// Set the contents for the REST API call.
				// ----------------------------------------------------------------------------
				var body = {
					__metadata: {
						type: listItemEntityTypeFullName
					}
				};

				var saveObj = angular.extend({}, self);
				delete saveObj.list;
				delete saveObj.apiUrl;

				// Remove all Computed and ReadOnlyFields
				angular.forEach(self.list.Fields, function(field) {
					
					if (field.TypeAsString === 'Computed' || field.ReadOnlyField) {
						delete saveObj[field.InternalName];
					}

				});

				angular.extend(body, saveObj);
				console.log(saveObj, angular.toJson(saveObj));



				// Set the headers for the REST API call.
				// ----------------------------------------------------------------------------
				var headers = {
					"Accept": "application/json; odata=verbose",
					"content-type": "application/json;odata=verbose"
				};

				var requestDigest = document.getElementById('__REQUESTDIGEST');
				// Remote apps that use OAuth can get the form digest value from the http://<site url>/_api/contextinfo endpoint.
				// SharePoint-hosted apps can get the value from the #__REQUESTDIGEST page control if it's available on the SharePoint page.

				if (requestDigest !== null) {
					headers['X-RequestDigest'] = requestDigest.value;
				}

				// If the item has 'Id', means that is not a new item, so set the call headers for make an update.
				if (!self.isNew()) {

					// UPDATE
					angular.extend(headers, {
    					"X-HTTP-Method": "MERGE",
						"IF-MATCH": "*" // Overwrite any changes in the item. 
										// Use 'item.__metadata.etag' to provide a way to verify that the object being changed has not been changed since it was last retrieved.
					});
				}


				// Make the call.
				// ----------------------------------------------------------------------------
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

		}; // save



		// ****************************************************************************		
		// remove
		//
		// Removes this item from the list. 
		//
		// @returns: Promise with the result of the REST query.
		//
		SPListItemObj.prototype.remove = function() {

			var self = this;
			var def = $q.defer();
			var executor = new SP.RequestExecutor(self.list.web.url);


			// Set the headers for the REST API call.
			// ----------------------------------------------------------------------------
			var headers = {
				"Accept": "application/json; odata=verbose",
				"X-HTTP-Method": "DELETE",
				"IF-MATCH": "*"
			};

			var requestDigest = document.getElementById('__REQUESTDIGEST');
			// Remote apps that use OAuth can get the form digest value from the http://<site url>/_api/contextinfo endpoint.
			// SharePoint-hosted apps can get the value from the #__REQUESTDIGEST page control if it's available on the SharePoint page.

			if (requestDigest !== null) {
				headers['X-RequestDigest'] = requestDigest.value;
			}


			// Make the call.
			// ----------------------------------------------------------------------------
			executor.executeAsync({

				url: self.getAPIUrl(),
				method: 'POST',
				headers: headers,

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

		}; // remove


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
			var self = this;

			if (isSharePointReady) {

				deferred.resolve();

			} else {

				// Load sp.js
				SP.SOD.executeOrDelayUntilScriptLoaded(function () {

					var loadScriptPromises = [];

					// Loads additional needed scripts
					loadScriptPromises.push(self.loadScript('SP.RequestExecutor.js', 'SP.RequestExecutor'));
					loadScriptPromises.push(self.loadScript('SP.UserProfiles.js', 'SP.UserProfiles'));
					loadScriptPromises.push(self.loadScript('datepicker.debug.js', 'clickDatePicker'));
					loadScriptPromises.push(self.loadScript('clienttemplates.js', ''));
					loadScriptPromises.push(self.loadScript('clientforms.js', ''));
					loadScriptPromises.push(self.loadScript('clientpeoplepicker.js', 'SPClientPeoplePicker'));
					loadScriptPromises.push(self.loadScript('autofill.js', ''));
					

					$q.all(loadScriptPromises).then(function() {

						isSharePointReady = true;
						deferred.resolve();

					});


				}, 'sp.js');
			}

			return deferred.promise;
		},



		loadScript: function(scriptFilename, functionName) {

			var deferred = $q.defer();

			SP.SOD.registerSod(scriptFilename, SP.Utilities.Utility.getLayoutsPageUrl(scriptFilename));

			EnsureScriptFunc(scriptFilename, functionName, function() {
				deferred.resolve();
			});

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
		},



		getRegionalSettings: function() {

			var self = this;
			var deferred = $q.defer();

			this.SharePointReady().then(function() {
				var ctx = new SP.ClientContext.get_current();
				var web = ctx.get_web();
				var regionalSettings = web.get_regionalSettings();
				var timeZone = regionalSettings.get_timeZone();

				ctx.load(regionalSettings);
				ctx.load(timeZone);

				ctx.executeQueryAsync(function() {

					regionalSettings.TimeZone = timeZone;
					deferred.resolve(regionalSettings);

				}, function(sender, args) {

					deferred.reject({ sender: sender, args: args });
				});
			});

			return deferred.promise;
		},


		// TODA ESTA FUNCIONALIDAD DEBE ESTAR DENTRO DE UN SERVICIO SPUser (o algo asi)
		// O en todo caso, la llamada a getCurrentUser debe ser del SPWeb!!!
		getCurrentUser: function() {

			var self = this;
			var deferred = $q.defer();

			this.SharePointReady().then(function() {
				var ctx = new SP.ClientContext.get_current();
				var web = ctx.get_web();
				var user = web.get_currentUser();

				ctx.load(user);

				ctx.executeQueryAsync(function() {

					deferred.resolve(user);

				}, function(sender, args) {

					deferred.reject({ sender: sender, args: args });
				});
			});

			return deferred.promise;
		},


		getUserId: function(loginName) {

			var self = this;
			var deferred = $q.defer();

			var ctx = new SP.ClientContext.get_current();
			var user = ctx.get_web().ensureUser(loginName);
			ctx.load(user);
			ctx.executeQueryAsync(function() {

				deferred.resolve(user.get_id());

			}, function(sender, args) {

				deferred.reject({ sender: sender, args: args });
			});

			return deferred.promise;
		},


		getUserRegionalSettings: function(loginName) {

			var self = this;
			var deferred = $q.defer();

			this.SharePointReady().then(function() {
				var ctx = new SP.ClientContext.get_current();
				var peopleManager = new SP.UserProfiles.PeopleManager(ctx);
				//var userRegionalSettings = peopleManager.getUserProfilePropertyFor(loginName, 'RegionalSettings');
				//var userProperties = peopleManager.getPropertiesFor(loginName);
				var userProperties = peopleManager.getMyProperties();

				ctx.load(userProperties);

				ctx.executeQueryAsync(function() {

					deferred.resolve(userProperties);

				}, function(sender, args) {

					deferred.reject({ sender: sender, args: args });
				});
			});

			return deferred.promise;			
		},


		parseXmlString: function(xmlDocStr) {

	        var xmlDoc;

	        if (window.DOMParser) {

	            var parser = new window.DOMParser();          
	            xmlDoc = parser.parseFromString(xmlDocStr, "text/xml");

	        } else {
	        
	            // IE :(
	            if(xmlDocStr.indexOf("<?") === 0) {
	                xmlDocStr = xmlDocStr.substr(xmlDocStr.indexOf("?>") + 2);
	            }
	        
	            xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
	            xmlDoc.async = "false";
	            xmlDoc.loadXML(xmlDocStr);

	        }

	        return xmlDoc;
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

				var query = {
					$expand: 'RegionalSettings/TimeZone'
				};

				executor.executeAsync({

					url: self.apiUrl + utils.parseQuery(query),
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

						// NOTE: this function could return an array of SPList objects?
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
	SPFieldBoolean - directive
	
	Pau Codina (pau.codina@kaldeera.com)
	Pedro Castro (pedro.castro@kaldeera.com, pedro.cm@gmail.com)

	Copyright (c) 2014
	Licensed under the MIT License
*/



///////////////////////////////////////
//	SPFieldBoolean
///////////////////////////////////////

angular.module('ngSharePoint').directive('spfieldBoolean', 

	['$compile', '$templateCache', '$http',

	function($compile, $templateCache, $http) {

		return {

			restrict: 'EA',
			require: ['^spform', 'ngModel'],
			replace: true,
			scope: {
				mode: '@',
				value: '=ngModel'
			},
			template: '<div></div>',

			link: function($scope, $element, $attrs, controllers) {

				$scope.schema = controllers[0].getFieldSchema($attrs.name);



				// ****************************************************************************
				// Watch for model value changes to parse the display value.
				//
				$scope.$watch('value', function(newValue) {

					$scope.displayValue = newValue ? Strings.STS.L_SPYes : Strings.STS.L_SPNo;
				});



				// ****************************************************************************
				// Watch for form mode changes.
				//
				$scope.$watch(function() {

					return $scope.mode || controllers[0].getFormMode();

				}, function(newValue) {

					$scope.currentMode = newValue;
					renderField(newValue);

				});



				// ****************************************************************************
				// Renders the field with the correct layout based on the form mode.
				//
				function renderField(mode) {

					$http.get('templates/form-templates/spfield-boolean-' + mode + '.html', { cache: $templateCache }).success(function(html) {
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

	['$compile', '$templateCache', '$http',

	function($compile, $templateCache, $http) {

		return {

			restrict: 'EA',
			require: ['^spform', 'ngModel'],
			replace: true,
			scope: {
				mode: '@',
				value: '=ngModel'
			},
			template: '<div></div>',

			link: function($scope, $element, $attrs, controllers) {

				$scope.schema = controllers[0].getFieldSchema($attrs.name);



				// ****************************************************************************
				// Watch for form mode changes.
				//
				$scope.$watch(function() {

					return $scope.mode || controllers[0].getFormMode();

				}, function(newValue) {

					$scope.currentMode = newValue;
					renderField(newValue);

				});



				// ****************************************************************************
				// Renders the field with the correct layout based on the form mode.
				//
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

	['$compile', '$templateCache', '$http',

	function($compile, $templateCache, $http) {

		return {

			restrict: 'EA',
			require: '^spform',
			replace: true,
			templateUrl: 'templates/form-templates/spfield-control.html',


			link: function($scope, $element, $attrs, spformController) {
				
				$scope.fieldSchema = spformController.getFieldSchema($attrs.name);
				
				spformController.initField($attrs.name);

				var fieldType = $scope.fieldSchema.TypeAsString;
				if (fieldType === 'UserMulti') fieldType = 'User';
				var fieldName = $attrs.name + (fieldType == 'Lookup' || fieldType == 'LookupMulti' || fieldType == 'User' || fieldType == 'UserMulti' ? 'Id' : '');
				var mode = ($attrs.mode ? ' mode="' + $attrs.mode + '"' : '');
				var fieldControlHTML = '<spfield-' + fieldType + ' ng-model="item.' + fieldName + '" name="' + $attrs.name + '"' + mode + '></spfield-' + fieldType + '>';

				$element.append(fieldControlHTML);
				$compile($element)($scope);

			}

		};

	}

]);

/*
	SPFieldCurrency - directive
	
	Pau Codina (pau.codina@kaldeera.com)
	Pedro Castro (pedro.castro@kaldeera.com, pedro.cm@gmail.com)

	Copyright (c) 2014
	Licensed under the MIT License
*/



///////////////////////////////////////
//	SPFieldCurrency
///////////////////////////////////////

angular.module('ngSharePoint').directive('spfieldCurrency', 

	['$compile', '$templateCache', '$http',

	function($compile, $templateCache, $http) {

		return {

			restrict: 'EA',
			require: ['^spform', 'ngModel'],
			replace: true,
			scope: {
				mode: '@',
				value: '=ngModel'
			},
			template: '<div></div>',

			link: function($scope, $element, $attrs, controllers) {

				$scope.schema = controllers[0].getFieldSchema($attrs.name);
				$scope.cultureInfo = (typeof __cultureInfo == 'undefined' ? Sys.CultureInfo.CurrentCulture : __cultureInfo);

				// NOTA: El valor de 'CultureInfo' debería de ser el que se indica en el 'schema' del campo en este caso.
				//		 Se debería crear un nuevo objeto 'CultureInfo' (no se cómo) con el valor (LCID) indicado en
				//		 la propiedad 'CurrencyLocaleId' del esquema.


				// ****************************************************************************
				// Watch for form mode changes.
				//
				$scope.$watch(function() {

					return $scope.mode || controllers[0].getFormMode();

				}, function(newValue) {

					$scope.currentMode = newValue;
					renderField(newValue);

				});



				// ****************************************************************************
				// Renders the field with the correct layout based on the form mode.
				//
				function renderField(mode) {

					$http.get('templates/form-templates/spfield-currency-' + mode + '.html', { cache: $templateCache }).success(function(html) {
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
	SPFieldDateTime - directive
	
	Pau Codina (pau.codina@kaldeera.com)
	Pedro Castro (pedro.castro@kaldeera.com, pedro.cm@gmail.com)

	Copyright (c) 2014
	Licensed under the MIT License
*/



///////////////////////////////////////
//	SPFieldDateTime
///////////////////////////////////////

angular.module('ngSharePoint').directive('spfieldDatetime', 

	['$compile', '$templateCache', '$http', '$filter', '$timeout', 'SPUtils',

	function($compile, $templateCache, $http, $filter, $timeout, SPUtils) {

		return {

			restrict: 'EA',
			require: ['^spform', 'ngModel'],
			replace: true,
			scope: {
				mode: '@',
				value: '=ngModel'
			},
			template: '<div></div>',

			link: function($scope, $element, $attrs, controllers) {

				$scope.schema = controllers[0].getFieldSchema($attrs.name);

				// Gets web regional settings
				$scope.webRegionalSettings = controllers[0].getWebRegionalSettings();

				// Gets addicional properties from the Regional Settings via CSOM.
				//
				// NOTA: Mientras no se recuperen las RegionalSettings del usuario, se recupera
				//		 la propiedad 'direction' (rtl/ltr) de aquí.
				//		 Una vez se consigan recuperar, habrá que ver si existe este valor.
				//
				SPUtils.getRegionalSettings().then(function(regionalSettings) {
					$scope.regionalSettings = regionalSettings;
					$scope.direction = regionalSettings.get_isRightToLeft() ? 'rtl' : 'ltr';
				});


				// La clase Sys.CultureInfo contiene la información de la cultura actual del servidor mostrando.
				// Para recuperar la información de la cultura seleccionada en la configuración regional del usuario
				// se deben realizar los siguientes pasos:
				// 
				// 1. Establecer el valor del atributo EnableScriptGlobalization a true en el tag <asp:ScriptManager ... />:
				//
				//    <asp:ScriptManager runat="server" ... EnableScriptGlobalization="true" EnableScriptLocalization="true" ScriptMode="Debug" />
				//
				//
				// 2. Añadir en el web.config de la aplicación web la siguiente entrada si no existe:
				//    ESTE PASO REALMENTE NO ES NECESARIO.
				//
				//	  <system.web>
    			//        <globalization uiCulture="auto" culture="auto" />
    			//        ...
				//
				//
				// A pesar de estos cambios, el valor de Sys.CultureInfo.CurrentCulture siempre será 'en-US' (o el idioma por defecto del servidor). Sin embargo, al
				// realizar los pasos anteriores, cuando la configuración regional sea diferente de la establecida en Sys.CultureInfo.CurrentCulture
				// se generará la variable '__cultureInfo' con la información de la cultura seleccionada en la configuración regional del usuario
				// y se podrán obtener los valores de formato para números y fechas correctos.
				//
				$scope.cultureInfo = (typeof __cultureInfo == 'undefined' ? Sys.CultureInfo.CurrentCulture : __cultureInfo);

				var minutes = ["00", "05", "10", "15", "20", "25", "30", "35", "40", "45", "50", "55"];
				var hours12 = ["12 AM", "1 AM", "2 AM", "3 AM", "4 AM", "5 AM", "6 AM", "7 AM", "8 AM", "9 AM", "10 AM", "11 AM", "12 PM", "1 PM", "2 PM", "3 PM", "4 PM", "5 PM", "6 PM", "7 PM", "8 PM", "9 PM", "10 PM", "11 PM"];
				var hours24 = ["00:", "01:", "02:", "03:", "04:", "05:", "06:", "07:", "08:", "09:", "10:", "11:", "12:", "13:", "14:", "15:", "16:", "17:", "18:", "19:", "20:", "21:", "22:", "23:"];
				var TimeZoneDifference = '01:59:59.9999809';			// TODO: Recuperar o calcular.
				var WorkWeek = '0111110';								// TODO: Recuperar o calcular.
				var MinJDay = '109207';									// TODO: Recuperar o calcular.
				var MaxJDay = '2666269';								// TODO: Recuperar o calcular.
				$scope.hoursMode24 = $scope.webRegionalSettings.Time24;	// TODO: Recuperar el modo de hora (12/24) de las 'RegionalSettings' del usuario.


				$scope.idPrefix = $scope.schema.InternalName + '_'+ $scope.schema.Id;
				$scope.minutes = minutes;
				$scope.hours = ($scope.hoursMode24 ? hours24 : hours12);
				$scope.datePickerPath = getDatePickerPath();
				$scope.datePickerUrl = STSHtmlEncode($scope.datePickerPath) + 
									   'iframe.aspx?cal=' + STSHtmlEncode(String($scope.webRegionalSettings.CalendarType)) + 
									   '&lcid=' + STSHtmlEncode(SP.Res.lcid) + 									// Locale (Regional Settings)
									   '&langid=' + STSHtmlEncode(_spPageContextInfo.currentLanguage) + 		// Language (UI Language)
									   '&tz=' + STSHtmlEncode(TimeZoneDifference) + 
									   '&ww=' + STSHtmlEncode(WorkWeek) + 
									   '&fdow=' + STSHtmlEncode($scope.webRegionalSettings.FirstDayOfWeek) + 
									   '&fwoy=' + STSHtmlEncode($scope.webRegionalSettings.FirstWeekOfYear) + 
									   '&hj=' + STSHtmlEncode($scope.webRegionalSettings.AdjustHijriDays) + 	// HijriAdjustment ?
									   '&swn=' + STSHtmlEncode($scope.webRegionalSettings.ShowWeeks) + 			// ShowWeekNumber ?
									   '&minjday=' + STSHtmlEncode(MinJDay) + 
									   '&maxjday=' + STSHtmlEncode(MaxJDay) + 
									   '&date=';

				$scope.DatePickerFrameID = g_strDatePickerFrameID;
				$scope.DatePickerImageID = g_strDatePickerImageID;

				// Initialize the models for data-binding.
				$scope.dateModel = new Date($scope.value);
				$scope.dateOnlyModel = $filter('date')($scope.dateModel, $scope.cultureInfo.dateTimeFormat.ShortDatePattern);
				$scope.minutesModel = $scope.dateModel.getMinutes().toString();
				var hours = $scope.dateModel.getHours();
				$scope.hoursModel = hours.toString() + ($scope.hoursMode24 ? ':' : '');
				if (hours < 10) {
					$scope.hoursModel = '0' + $scope.hoursModel;
				}



				// ****************************************************************************
				// Watch for form mode changes.
				//
				$scope.$watch(function() {

					return $scope.mode || controllers[0].getFormMode();

				}, function(newValue) {

					$scope.currentMode = newValue;
					renderField(newValue);

				});



				// ****************************************************************************
				// Shows the date picker.
				//
				// Uses the SharePoint OOB 'clickDatePicker' function to show the calendar
				// in an IFRAME (<15 DEEP>/TEMPLATE/LAYOUTS/datepicker.js).
				//
				$scope.showDatePicker = function($event) {

					var fieldId = $scope.idPrefix + '_$DateTimeFieldDate';
					var iframe = document.getElementById(fieldId + g_strDatePickerFrameID);

					if (iframe !== null) {
						if (Boolean(iframe.attachEvent)) {
				            iframe.attachEvent('onreadystatechange', OnIframeLoadFinish);
				        }
				        else if (Boolean(iframe.addEventListener)) {
				            iframe.Picker = iframe;
				            iframe.readyState = 'complete';
				            iframe.addEventListener('load', OnIframeLoadFinish, false);
				        }
					}


					clickDatePicker(fieldId, $scope.datePickerUrl, $scope.dateOnlyModel, $event.originalEvent);

					return false;

				};



				// ****************************************************************************
				// Catch when the DatePicker iframe load has finished.
				//
				function OnIframeLoadFinish() {

					var self = this; //-> IFRAME element
					var resultfunc = this.resultfunc;

					// Wraps the default IFRAME.resultfunc
					this.resultfunc = function() {

						resultfunc();

						// Updates the model with the selected value from the DatePicker iframe.
						$timeout(function() {
							$scope.$apply(function() {
								$scope.dateOnlyModel = self.resultfield.value;
							});
						});
					};
				}



				// ****************************************************************************
				// Watch for changes in the model variables to update the field model ($scope.value).
				//
				$scope.$watch('[dateOnlyModel, hoursModel, minutesModel]', updateModel, true);



				// ****************************************************************************
				// Updates the field model with the correct value and format.
				//
				function updateModel() {
					/*
					var dateValue = new Date($scope.dateOnlyModel);
					var hours = $scope.hoursModel;
					var minutes = $scope.minutesModel;

					hours = ($scope.hoursMode24 ? hours.substr(0, hours.length - 1) : hours.substr(0, 2));

					dateValue.setHours(hours);
					dateValue.setMinutes(minutes);

					$scope.value = dateValue.toISOString();
					*/

					var dateValues = $scope.dateOnlyModel.split($scope.cultureInfo.dateTimeFormat.DateSeparator);
					var dateParts = $scope.cultureInfo.dateTimeFormat.ShortDatePattern.split($scope.cultureInfo.dateTimeFormat.DateSeparator);
					var dateComponents = {};
					for(var i = 0; i < dateParts.length; i++) {
						dateComponents[dateParts[i]] = dateValues[i];
					}
					var hours = $scope.hoursModel;
					hours = ($scope.hoursMode24 ? hours.substr(0, hours.length - 1) : hours.substr(0, 2));
					var minutes = $scope.minutesModel;
					var date = new Date(Date.UTC(dateComponents.yyyy, dateComponents.MM || dateComponents.M, dateComponents.dd || dateComponents.d, hours, minutes));

					$scope.value = date.toISOString();
				}



				// ****************************************************************************
				// Renders the field with the correct layout based on the form mode.
				//
				function renderField(mode) {

					$http.get('templates/form-templates/spfield-datetime-' + mode + '.html', { cache: $templateCache }).success(function(html) {
						var newElement = $compile(html)($scope);
						$element.replaceWith(newElement);
						$element = newElement;
					});

				}



				// ****************************************************************************
				// Gets the current web _layouts/15 url.
				// This will be used as the base url for the IFRAME that shows the date picker.
				//
				function getDatePickerPath() {

					var datePickerPath = _spPageContextInfo.webServerRelativeUrl;

			        if (datePickerPath === null)
			            datePickerPath = '';
			        if (datePickerPath.endsWith('/'))
			            datePickerPath = datePickerPath.substring(0, datePickerPath.length - 1);
			        datePickerPath += "/_layouts/15/";

			        return datePickerPath;
				}

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

angular.module('ngSharePoint')

.directive('spfieldDescription', function() {

	return {

		restrict: 'EA',
		require: '^spform',
		replace: true,
		templateUrl: 'templates/form-templates/spfield-description.html',
		scope: true,


		link: function($scope, $element, $attrs, spformController) {

			$scope.schema = spformController.getFieldSchema($attrs.name);



			// ****************************************************************************
			// Watch for form mode changes.
			//
			$scope.$watch(function() {

				return $scope.mode || spformController.getFormMode();

			}, function(newValue) {

				$scope.currentMode = newValue;

			});
		}
	};
	
});
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

angular.module('ngSharePoint')

.directive('spfieldLabel', function() {

	return {

		restrict: 'EA',
		require: '^spform',
		replace: true,
		templateUrl: 'templates/form-templates/spfield-label.html',
		scope: {
			mode: '@'
		},


		link: function($scope, $element, $attrs, spformController) {

			$scope.schema = spformController.getFieldSchema($attrs.name);



			// ****************************************************************************
			// Watch for form mode changes.
			//
			$scope.$watch(function() {

				return $scope.mode || spformController.getFormMode();

			}, function(newValue) {

				$scope.currentMode = newValue;

			});
		}
	};
	
});
/*
	SPFieldLookup - directive
	
	Pau Codina (pau.codina@kaldeera.com)
	Pedro Castro (pedro.castro@kaldeera.com, pedro.cm@gmail.com)

	Copyright (c) 2014
	Licensed under the MIT License
*/



///////////////////////////////////////
//	SPFieldLookup
///////////////////////////////////////

angular.module('ngSharePoint').directive('spfieldLookup', 

	['$compile', '$templateCache', '$http', '$q', '$filter', 'SharePoint',

	function($compile, $templateCache, $http, $q, $filter, SharePoint) {

		return {

			restrict: 'EA',
			require: ['^spform', 'ngModel'],
			replace: true,
			scope: {
				mode: '@',
				value: '=ngModel'
			},
			template: '<div><img src="/_layouts/15/images/loadingcirclests16.gif" alt="" /></div>',

			link: function($scope, $element, $attrs, controllers) {

				$scope.schema = controllers[0].getFieldSchema($attrs.name);



				// ****************************************************************************
				// Watch for form mode changes.
				//
				$scope.$watch(function() {

					return { mode: $scope.mode || controllers[0].getFormMode(), value: $scope.value };

				}, function(newValue, oldValue) {

					$scope.currentMode = newValue.mode;

					if (newValue.value !== oldValue.value) {
						$scope.lookupItem = void 0;
					}

					// Show loading animation.
					setElementHTML('<div><img src="/_layouts/15/images/loadingcirclests16.gif" alt="" /></div>');

					// Gets the data for the lookup and then render the field.
					getLookupData($scope.currentMode).then(function(){

						renderField($scope.currentMode);

					});

				}, true);



				// ****************************************************************************
				// Replaces the directive element HTML.
				//
				function setElementHTML(html) {

					var newElement = $compile(html)($scope);
					$element.replaceWith(newElement);
					$element = newElement;

				}



				// ****************************************************************************
				// Renders the field with the correct layout based on the form mode.
				//
				function renderField(mode) {

					$http.get('templates/form-templates/spfield-lookup-' + mode + '.html', { cache: $templateCache }).success(function(html) {

						setElementHTML(html);
					});

				}



				// ****************************************************************************
				// Gets lookup data for data-binding.
				//
				function getLookupData(mode) {

					if (mode === 'edit') {

						return getLookupDataForEdit();

					} else {

						return getLookupDataForDisplay();

					}
				}



				// ****************************************************************************
				// Gets the lookup list.
				//
				function getLookupList() {

					var def = $q.defer();

					if ($scope.lookupList === void 0) {

						SharePoint.getWeb().then(function(web) {

							web.getList($scope.schema.LookupList).then(function(list) {

								$scope.lookupList = list;

								list.getProperties({ $expand: 'Forms' }).then(function() {

									list.getFields().then(function() {

										def.resolve($scope.lookupList);

									});

								});

							});

						});

					} else {

						// Returns cached list
						def.resolve($scope.lookupList);
					}


					return def.promise;
				}



				// ****************************************************************************
				// Gets the lookup data for display mode.
				//
				function getLookupDataForDisplay() {

					var def = $q.defer();

					if ($scope.lookupItem !== void 0) {

						// Returns cached selected item
						def.resolve($scope.lookupItem);

					} else {

						getLookupList().then(function(list) {

							if ($scope.value === null || $scope.value === 0) {

								// If no value returns an empty object for corrent binding
								$scope.lookupItem = {
									Title: '',
									url: ''
								};

								def.resolve($scope.lookupItem);

							} else {

								list.getItemById($scope.value).then(function(item) {

									var displayValue = item[$scope.schema.LookupField];
									var fieldSchema = $scope.lookupList.Fields[$scope.schema.LookupField];

									if (fieldSchema.TypeAsString === 'DateTime' && displayValue !== null) {
										var cultureInfo = __cultureInfo || Sys.CultureInfo.CurrentCulture;
										var date = new Date(displayValue);
										displayValue = $filter('date')(date, cultureInfo.dateTimeFormat.ShortDatePattern + (fieldSchema.DisplayFormat === 0 ? '' :  ' ' + cultureInfo.dateTimeFormat.ShortTimePattern));
									}

									if (fieldSchema.TypeAsString === 'Number') {
										if (fieldSchema.Percentage) {
											displayValue += '%';
										}
									}

									// When the field is a Computed field, shows its title.
									// TODO: Resolve computed fields.
									if (fieldSchema.TypeAsString === 'Computed' && displayValue !== null) {
										displayValue = item.Title;
									}

									$scope.lookupItem = {
										Title: displayValue,
										url: item.list.Forms.results[0].ServerRelativeUrl + '?ID=' + $scope.value + '&Source=' + encodeURIComponent(window.location)
									};

									def.resolve($scope.lookupItem);

								});
							}

						});
					}

					return def.promise;

				}



				// ****************************************************************************
				// Gets the lookup data for edit mode.
				//
				function getLookupDataForEdit() {

					var def = $q.defer();

					if ($scope.lookupItems !== void 0){

						// Returns cached selected items
						def.resolve($scope.lookupItems);

					} else {
						
						getLookupList().then(function(list) {

							list.getListItems().then(function(items) {

								$scope.lookupItems = items;

								// Adds an extra empty element '(None)' if the field is not required.
								if (!$scope.schema.Required) {
									$scope.lookupItems = [{ Id: 0, Title: STSHtmlEncode(Strings.STS.L_LookupFieldNoneOption) }].concat(items);
								}

								// Init the initial value when no value is provided
								if ($scope.value === null) {
									$scope.value = 0;
								}

								def.resolve($scope.lookupItems);

							});

						});
					}


					return def.promise;

				}

			}

		};

	}

]);
/*
	SPFieldLookupMulti - directive
	
	Pau Codina (pau.codina@kaldeera.com)
	Pedro Castro (pedro.castro@kaldeera.com, pedro.cm@gmail.com)

	Copyright (c) 2014
	Licensed under the MIT License
*/



///////////////////////////////////////
//	SPFieldLookupMulti
///////////////////////////////////////

angular.module('ngSharePoint').directive('spfieldLookupmulti', 

	['$compile', '$templateCache', '$http', '$q', '$filter', 'SharePoint',

	function($compile, $templateCache, $http, $q, $filter, SharePoint) {

		return {

			restrict: 'EA',
			require: ['^spform', 'ngModel'],
			replace: true,
			scope: {
				mode: '@',
				value: '=ngModel'
			},
			template: '<div><img src="/_layouts/15/images/loadingcirclests16.gif" alt="" /></div>',

			link: function($scope, $element, $attrs, controllers) {

				$scope.schema = controllers[0].getFieldSchema($attrs.name);
				$scope.idPrefix = $scope.schema.InternalName + '_'+ $scope.schema.Id;
				$scope.addButtonText = STSHtmlEncode(Strings.STS.L_LookupMultiFieldAddButtonText) + ' >';
				$scope.removeButtonText = '< ' + STSHtmlEncode(Strings.STS.L_LookupMultiFieldRemoveButtonText);
				$scope.candidateAltText = STSHtmlEncode(StBuildParam(Strings.STS.L_LookupMultiFieldCandidateAltText, $scope.schema.Title));
				$scope.resultAltText = STSHtmlEncode(StBuildParam(Strings.STS.L_LookupMultiFieldResultAltText, $scope.schema.Title));



				// ****************************************************************************
				// Watch for form mode changes.
				//
				$scope.$watch(function() {

					// Adjust the model if no value is provided
					if ($scope.value === null) {
						$scope.value = { results: [] };
					}
					
					return { mode: $scope.mode || controllers[0].getFormMode(), value: $scope.value };

				}, function(newValue, oldValue) {

					$scope.currentMode = newValue.mode;

					if (newValue.value.results !== oldValue.value.results) {
						$scope.selectedLookupItems = void 0;
					}

					// Show loading animation.
					setElementHTML('<div><img src="/_layouts/15/images/loadingcirclests16.gif" alt="" /></div>');

					// Gets the data for the lookup and then render the field.
					getLookupData($scope.currentMode).then(function(){

						renderField($scope.currentMode);

					});

				}, true);



				// ****************************************************************************
				// Replaces the directive element HTML.
				//
				function setElementHTML(html) {

					var newElement = $compile(html)($scope);
					$element.replaceWith(newElement);
					$element = newElement;
				}



				// ****************************************************************************
				// Renders the field with the correct layout based on the form mode.
				//
				function renderField(mode) {

					$http.get('templates/form-templates/spfield-lookupmulti-' + mode + '.html', { cache: $templateCache }).success(function(html) {

						setElementHTML(html);
					});

				}



				// ****************************************************************************
				// Gets lookup data for data-binding.
				//
				function getLookupData(mode) {

					if (mode === 'edit') {

						return getLookupDataForEdit();

					} else {

						return getLookupDataForDisplay();

					}
				}



				// ****************************************************************************
				// Gets the lookup list.
				//
				function getLookupList() {

					var def = $q.defer();

					if ($scope.lookupList === void 0) {

						SharePoint.getWeb().then(function(web) {

							web.getList($scope.schema.LookupList).then(function(list) {

								$scope.lookupList = list;

								list.getProperties({ $expand: 'Forms' }).then(function() {

									list.getFields().then(function() {

										def.resolve($scope.lookupList);

									});

								});

							});

						});

					} else {

						// Returns cached list
						def.resolve($scope.lookupList);
					}


					return def.promise;
				}



				// ****************************************************************************
				// Gets the items from the lookup list.
				//
				function getLookupItems() {

					var def = $q.defer();

					if ($scope.lookupItems !== void 0) {

						// Returns cached items
						def.resolve($scope.lookupItems);

					} else {
						
						getLookupList().then(function(list) {

							list.getListItems().then(function(items) {

								$scope.lookupItems = items;
								def.resolve($scope.lookupItems);

							});

						});
					}

					return def.promise;
				}



				// ****************************************************************************
				// Gets the lookup data for display mode.
				//
				function getLookupDataForDisplay() {

					var def = $q.defer();

					if ($scope.selectedLookupItems !== void 0) {

						// Returns cached selected items
						def.resolve($scope.selectedLookupItems);

					} else {

						// Initialize the selected items array
						$scope.selectedLookupItems = [];

						// Gets the lookup items and populate the selected items array
						getLookupItems().then(function(items) {

							angular.forEach($scope.value.results, function(selectedItem) {

								var lookupItem = $filter('filter')(items, { Id: selectedItem }, true)[0];

								if (lookupItem !== void 0) {

									var displayValue = lookupItem[$scope.schema.LookupField];
									var fieldSchema = $scope.lookupList.Fields[$scope.schema.LookupField];

									if (fieldSchema.TypeAsString === 'DateTime' && displayValue !== null) {
										var cultureInfo = __cultureInfo || Sys.CultureInfo.CurrentCulture;
										var date = new Date(displayValue);
										displayValue = $filter('date')(date, cultureInfo.dateTimeFormat.ShortDatePattern + (fieldSchema.DisplayFormat === 0 ? '' :  ' ' + cultureInfo.dateTimeFormat.ShortTimePattern));
									}

									// When the field is a Computed field, shows its title.
									// TODO: Resolve computed fields.
									if (fieldSchema.TypeAsString === 'Computed' && displayValue !== null) {
										displayValue = lookupItem.Title;
									}

									$scope.selectedLookupItems.push({
										Title: displayValue,
										url: lookupItem.list.Forms.results[0].ServerRelativeUrl + '?ID=' + selectedItem + '&Source=' + encodeURIComponent(window.location)
									});

								}

							});

							def.resolve($scope.selectedLookupItems);

						});

					}

					return def.promise;

				}



				// ****************************************************************************
				// Gets the lookup data for edit mode.
				//
				function getLookupDataForEdit() {

					var def = $q.defer();

					getLookupItems().then(function(candidateItems) {

						$scope.candidateItems = [];
						$scope.selectedCandidateItems = [];
						$scope.resultItems = [];
						$scope.selectedResultItems = [];

						// Populate selected and candicate items for data-binding
						angular.forEach(candidateItems, function(item) {

							var displayValue = item[$scope.schema.LookupField];
							var fieldSchema = $scope.lookupList.Fields[$scope.schema.LookupField];

							if (fieldSchema.TypeAsString === 'DateTime') {
								var cultureInfo = __cultureInfo || Sys.CultureInfo.CurrentCulture;
								var date = new Date(displayValue);
								displayValue = $filter('date')(date, cultureInfo.dateTimeFormat.ShortDatePattern + (fieldSchema.DisplayFormat === 0 ? '' :  ' ' + cultureInfo.dateTimeFormat.ShortTimePattern));
							}

							var bindingItem = {
								id: item.Id,
								name: displayValue,
								title: displayValue
							};

							if ($scope.value.results.indexOf(item.Id) != -1) {

								$scope.resultItems.push(bindingItem);

							} else {

								$scope.candidateItems.push(bindingItem);

							}

						});

						def.resolve();

					});

					
					return def.promise;

				}



				function updateModel() {

					$scope.value.results = [];

					angular.forEach($scope.resultItems, function(item) {
						$scope.value.results.push(item.id);
					});
				}



				$scope.addItems = function() {

					// Adds the selected candidate items to the results array
					$scope.resultItems = $scope.resultItems.concat($scope.selectedCandidateItems);

					// Removes the selected candidate items from the candidates array
					$scope.candidateItems = $filter('filter')($scope.candidateItems, function(item) {
						var isSelected = false;

						for (var i = 0; i < $scope.selectedCandidateItems.length; i++) {
							if (item.id == $scope.selectedCandidateItems[i].id) {
								isSelected = true;
								break;
							}
						}

						return !isSelected;
					});

					// Initialize the selected cadidates array
					$scope.selectedCandidateItems = [];

					// Finaly update the model
					updateModel();

				};



				$scope.removeItems = function() {

					// Adds the selected results items to the cadidates array
					$scope.candidateItems = $scope.candidateItems.concat($scope.selectedResultItems);

					// Removes the selected results items from the results array
					$scope.resultItems = $filter('filter')($scope.resultItems, function(item) {
						var isSelected = false;

						for (var i = 0; i < $scope.selectedResultItems.length; i++) {
							if (item.id == $scope.selectedResultItems[i].id) {
								isSelected = true;
								break;
							}
						}

						return !isSelected;
					});

					// Initialize the selected results array
					$scope.selectedResultItems = [];

					// Finaly update the model
					updateModel();
				};

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

	['$compile', '$templateCache', '$http',

	function($compile, $templateCache, $http) {

		return {

			restrict: 'EA',
			require: ['^spform', 'ngModel'],
			replace: true,
			scope: {
				mode: '@',
				value: '=ngModel'
			},
			template: '<div></div>',

			link: function($scope, $element, $attrs, controllers) {

				$scope.schema = controllers[0].getFieldSchema($attrs.name);

				// Adjust the model if no value is provided
				if ($scope.value === null) {
					$scope.value = { results: [] };
				}

				$scope.choices = $scope.value.results;
				sortChoices();



				// ****************************************************************************
				// Watch for form mode changes.
				//
				$scope.$watch(function() {

					return $scope.mode || controllers[0].getFormMode();

				}, function(newValue) {

					$scope.currentMode = newValue;
					renderField(newValue);

				});



				// ****************************************************************************
				// Renders the field with the correct layout based on the form mode.
				//
				function renderField(mode) {

					$http.get('templates/form-templates/spfield-multichoice-' + mode + '.html', { cache: $templateCache }).success(function(html) {
						var newElement = $compile(html)($scope);
						$element.replaceWith(newElement);
						$element = newElement;
					});

				}



				// ****************************************************************************
				// Updates the model (array of choices) when a checkbox is toggled.
				//
				$scope.toggleCheckbox = function(choice) {

					var idx = $scope.choices.indexOf(choice);

					if (idx != -1) {
						$scope.choices.splice(idx, 1);
					} else {
						$scope.choices.push(choice);
					}

					sortChoices();

				};



				// ****************************************************************************
				// Sort the choices according to the definition order.
				//
				function sortChoices() {

					var sortedChoices = [];

					angular.forEach($scope.schema.Choices.results, function(choice) {

						if($scope.choices.indexOf(choice) != -1) {
							sortedChoices.push(choice);
						}
					});

					$scope.choices = $scope.value.results = sortedChoices;
				}

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

	['$compile', '$templateCache', '$http',

	function($compile, $templateCache, $http) {

		return {

			restrict: 'EA',
			require: ['^spform', 'ngModel'],
			replace: true,
			scope: {
				mode: '@',
				value: '=ngModel'
			},
			template: '<div></div>',

			link: function($scope, $element, $attrs, controllers) {

				$scope.schema = controllers[0].getFieldSchema($attrs.name);



				// ****************************************************************************
				// Watch for form mode changes.
				//
				$scope.$watch(function() {

					return $scope.mode || controllers[0].getFormMode();

				}, function(newValue) {

					$scope.currentMode = newValue;
					renderField(newValue);

				});



				// ****************************************************************************
				// Renders the field with the correct layout based on the form mode.
				//
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
	SPFieldNumber - directive
	SPNumber - directive
	
	Pau Codina (pau.codina@kaldeera.com)
	Pedro Castro (pedro.castro@kaldeera.com, pedro.cm@gmail.com)

	Copyright (c) 2014
	Licensed under the MIT License
*/



///////////////////////////////////////
//	SPFieldNumber
///////////////////////////////////////

angular.module('ngSharePoint').directive('spfieldNumber', 

	['$compile', '$templateCache', '$http', 'SPUtils',

	function($compile, $templateCache, $http, SPUtils) {

		return {

			restrict: 'EA',
			require: ['^spform', 'ngModel'],
			replace: true,
			scope: {
				mode: '@',
				value: '=ngModel'
			},
			template: '<div></div>',

			link: function($scope, $element, $attrs, controllers) {

				var schema = controllers[0].getFieldSchema($attrs.name);
				var xml = SPUtils.parseXmlString(schema.SchemaXml);
				var percentage = xml.documentElement.getAttribute('Percentage') || 'false';
				var decimals = xml.documentElement.getAttribute('Decimals') || '0';
				schema.Percentage = percentage.toLowerCase() === 'true';
				schema.Decimals = parseInt(decimals);


				$scope.schema = schema;
				$scope.cultureInfo = (typeof __cultureInfo == 'undefined' ? Sys.CultureInfo.CurrentCulture : __cultureInfo);



				// ****************************************************************************
				// Watch for form mode changes.
				//
				$scope.$watch(function() {

					return $scope.mode || controllers[0].getFormMode();

				}, function(newValue) {

					$scope.currentMode = newValue;
					renderField(newValue);

				});



				// ****************************************************************************
				// Renders the field with the correct layout based on the form mode.
				//
				function renderField(mode) {

					$http.get('templates/form-templates/spfield-number-' + mode + '.html', { cache: $templateCache }).success(function(html) {
						var newElement = $compile(html)($scope);
						$element.replaceWith(newElement);
						$element = newElement;
					});

				}

			}

		};

	}

]);





///////////////////////////////////////
//	SPNumber
///////////////////////////////////////

angular.module('ngSharePoint').directive('spNumber', function() {

	return {

		restrict: 'A',
		require: 'ngModel',

		link: function($scope, $element, $attrs, ngModel) {

			ngModel.$formatters.push(function(value) {
				if ($scope.schema.Percentage) {
					return (value * 100).toFixed($scope.schema.Decimals);
				} else {
					return value;
				}
			});


			ngModel.$parsers.push(function(value) {
				if ($scope.schema.Percentage) {
					return (value / 100).toFixed($scope.schema.Decimals);
				} else {
					return value;
				}
			});
		}

	};

});
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

	['$compile', '$templateCache', '$http',

	function($compile, $templateCache, $http) {

		return {

			restrict: 'EA',
			require: ['^spform', 'ngModel'],
			replace: true,
			scope: {
				mode: '@',
				value: '=ngModel'
			},
			template: '<div></div>',

			link: function($scope, $element, $attrs, controllers) {

				$scope.schema = controllers[0].getFieldSchema($attrs.name);



				// ****************************************************************************
				// Watch for form mode changes.
				//
				$scope.$watch(function() {

					return $scope.mode || controllers[0].getFormMode();

				}, function(newValue) {

					$scope.currentMode = newValue;
					renderField(newValue);

				});



				// ****************************************************************************
				// Renders the field with the correct layout based on the form mode.
				//
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
	SPFieldUser - directive
	
	Pau Codina (pau.codina@kaldeera.com)
	Pedro Castro (pedro.castro@kaldeera.com, pedro.cm@gmail.com)

	Copyright (c) 2014
	Licensed under the MIT License
*/



///////////////////////////////////////
//	SPFieldUser
///////////////////////////////////////

angular.module('ngSharePoint').directive('spfieldUser', 

	['$compile', '$templateCache', '$http', '$q', '$timeout', '$filter', 'SharePoint', 'SPUtils',

	function($compile, $templateCache, $http, $q, $timeout, $filter, SharePoint, SPUtils) {

		return {

			restrict: 'EA',
			require: ['^spform', 'ngModel'],
			replace: true,
			scope: {
				mode: '@',
				value: '=ngModel'
			},
			template: '<div><img src="/_layouts/15/images/loadingcirclests16.gif" alt="" /></div>',

			link: function($scope, $element, $attrs, controllers) {

				$scope.schema = controllers[0].getFieldSchema($attrs.name);
				$scope.noUserPresenceAlt = STSHtmlEncode(Strings.STS.L_UserFieldNoUserPresenceAlt);
				$scope.idPrefix = $scope.schema.InternalName + '_'+ $scope.schema.Id;


				// $scope.schema.SelectionGroup (0 | [GroupId])	-> UserSelectionScope (XML) (0 (All Users) | [GroupId])
				// $scope.schema.SelectionMode  (0 | 1)			-> UserSelectionMode (XML) ("PeopleOnly" | "PeopleAndGroups")


				// ****************************************************************************
				// Watch for form mode changes.
				//
				$scope.$watch(function() {

					// Adjust the model if no value is provided
					if ($scope.value === null && $scope.schema.AllowMultipleValues) {
						$scope.value = { results: [] };
					}

					return { mode: $scope.mode || controllers[0].getFormMode(), value: ($scope.schema.AllowMultipleValues ? $scope.value.results : $scope.value) };

				}, function(newValue, oldValue) {

					$scope.currentMode = newValue.mode;

					// Show loading animation.
					setElementHTML('<div><img src="/_layouts/15/images/loadingcirclests16.gif" alt="" /></div>');

					if ($scope.schema.AllowMultipleValues) {
						if (newValue.value.join(',') !== oldValue.value.join(',')) {
							$scope.selectedUserItems = void 0;
						}
					} else {
						if (newValue.value !== oldValue.value) {
							$scope.selectedUserItems = void 0;
						}
					}

					// Gets the data for the user (lookup) and then render the field.
					getUserData().then(function() {
						renderField($scope.currentMode);
					}, function() {
						setElementHTML('<div style="color: red;">Error al recuperar el usuario {{value}}.</div>');
					});

				}, true);



				// ****************************************************************************
				// Replaces the directive element HTML.
				//
				function setElementHTML(html) {

					var newElement = $compile(html)($scope);
					$element.replaceWith(newElement);
					$element = newElement;
					
				}



				// ****************************************************************************
				// Renders the field with the correct layout based on the form mode.
				//
				function renderField(mode) {

					$http.get('templates/form-templates/spfield-user-' + mode + '.html', { cache: $templateCache }).success(function(html) {

						setElementHTML(html);

						if (mode === 'edit') {
							var peoplePickerElementId = $scope.idPrefix + '_$ClientPeoplePicker';

							$timeout(function() {
								initializePeoplePicker(peoplePickerElementId);
							});
						}
					});

				}



				// ****************************************************************************
				// Gets the lookup list.
				//
				function getLookupList() {

					var def = $q.defer();

					if ($scope.lookupList === void 0) {

						// TODO: Get the web url from $scope.schema.LookupWebId with CSOM

						SharePoint.getWeb().then(function(web) {

							web.getList($scope.schema.LookupList).then(function(list) {

								$scope.lookupList = list;
								def.resolve($scope.lookupList);

							}, function() {
								def.reject();
							});

						}, function() {
							def.reject();
						});

					} else {

						def.resolve($scope.lookupList);
					}


					return def.promise;

				}



				// ****************************************************************************
				// Gets the items from the users list.
				//
				function getUserItems() {

					var def = $q.defer();

					if ($scope.userItems !== void 0) {

						// Returns cached items
						def.resolve($scope.userItems);

					} else {
						
						getLookupList().then(function(list) {

							list.getListItems().then(function(items) {

								$scope.userItems = items;
								def.resolve($scope.userItems);

							});

						});
					}

					return def.promise;
				}


				// ****************************************************************************
				// Gets the user data for display mode.
				//
				function getUserData() {

					var def = $q.defer();

					if ($scope.selectedUserItems !== void 0) {

						def.resolve($scope.selectedUserItems);

					} else {

						// Initialize the selected items array
						$scope.selectedUserItems = [];

						// Gets the user items and populate the selected items array
						getUserItems().then(function(items) {

							if ($scope.schema.AllowMultipleValues) {

								angular.forEach($scope.value.results, function(selectedItem) {

									var selectedUserItem = $filter('filter')(items, { Id: selectedItem }, true)[0];

									if (selectedUserItem !== void 0) {

										var userItem = {
											Title: selectedUserItem[$scope.schema.LookupField] || selectedUserItem.Title,
											url: selectedUserItem.list.web.url.rtrim('/') + '/_layouts/15/userdisp.aspx' + '?ID=' + $scope.value + '&Source=' + encodeURIComponent(window.location),
											data: selectedUserItem
										};

										$scope.selectedUserItems.push(userItem);
									}

								});

							} else {

								// If no value returns an empty object for corrent binding
								var userItem = {
									Title: '',
									url: ''
								};

								if ($scope.value === null || $scope.value === 0) {

									$scope.selectedUserItems.push(userItem);

								} else {

									var selectedUserItem = $filter('filter')(items, { Id: $scope.value }, true)[0];

									if (selectedUserItem !== void 0) {

										userItem = {
											Title: selectedUserItem[$scope.schema.LookupField] || selectedUserItem.Title,
											url: selectedUserItem.list.web.url.rtrim('/') + '/_layouts/15/userdisp.aspx' + '?ID=' + $scope.value + '&Source=' + encodeURIComponent(window.location),
											data: selectedUserItem
										};

										$scope.selectedUserItems.push(userItem);
									}
								}
							}

							def.resolve($scope.selectedUserItems);

						}, function() {
							def.reject();
						});

					}

					return def.promise;

				}



				// ****************************************************************************
				// Shows the SharePoint OOB People Picker presence image pop-up.
				//
				$scope.IMNImageOnClick = function($event) {

					IMNImageOnClick($event.originalEvent);
					return false;

				};



				$scope.GoToLinkOrDialogNewWindow = function(elem) {

					GoToLinkOrDialogNewWindow(elem);
					return false;

				};



				// ****************************************************************************
				// Render and initialize the client-side People Picker.
				//
				function initializePeoplePicker(peoplePickerElementId) {
				 
				    // Create a schema to store picker properties, and set the properties.
				    var schema = {
				    	Id: $scope.schema.Id,
				    	Title: $scope.schema.Title,
				    	Hidden: $scope.schema.Hidden,
				    	IMEMode: null,
				    	Name: $scope.schema.InternalName,
				    	Required: $scope.schema.Required,
				    	Direction: $scope.schema.Direction,
				    	FieldType: $scope.schema.TypeAsString,
				    	//Description: $scope.schema.Description, //-> Hace que renderice la descripción otra vez ya que nosotros ya la renderizamos.
				    	ReadOnlyField: $scope.schema.ReadOnlyField,
				    	Type: 'User',
				    	DependentLookup: false,
				    	AllowMultipleValues: $scope.schema.AllowMultipleValues,
				    	Presence: $scope.schema.Presence,
				    	WithPicture: false,
				    	DefaultRender: true,
				    	WithPictureDetail: false,
				    	ListFormUrl: '/_layouts/15/listform.aspx',
				    	UserDisplayUrl: '/_layouts/15/userdisp.aspx',
				    	EntitySeparator: ';',
				    	PictureOnly: false,
				    	PictureSize: null,
				    	UserInfoListId: '{' + $scope.lookupList.Id + '}',
				    	SharePointGroupID: $scope.schema.SelectionGroup,
				    	PrincipalAccountType: 'User,DL,SecGroup,SPGroup',
				    	SearchPrincipalSource: 15,
				    	ResolvePrincipalSource: 15/*,
				    	MaximumEntitySuggestions: 50,
				    	Width: '280px'*/
				    };


				    // Generate the PickerEntities to fill the PeoplePicker
				    var pickerEntities = [];

				    angular.forEach($scope.selectedUserItems, function(user) {

				    	var displayName = user.data.Title; //user.data[$scope.schema.LookupField];
				    	var userName = user.data.Name;

				    	// MSDN .NET PickerEntity members
				    	/*
						Claim					Gets or sets an object that represents whether an entity has the right to claim the specified values.
						Description				Gets or sets text in a text box in the browser.
						DisplayText				Gets or sets text in the editing control.
						EntityData				Gets or sets a data-mapping structure that is defined by the consumer of the PickerEntity class.
						EntityDataElements	
						EntityGroupName			Group under which this entity is filed in the picker.
						EntityType				Gets or sets the name of the entity data type.
						HierarchyIdentifier		Gets or sets the identifier of the current picker entity within the hierarchy provider.
						IsResolved				Gets or sets a value that indicates whether the entity has been validated.
						Key						Gets or sets the identifier of a database record.
						MultipleMatches	
						ProviderDisplayName	
						ProviderName
						*/

				    	var pickerEntity = {
							AutoFillDisplayText: displayName,
							AutoFillKey: userName,
							AutoFillSubDisplayText: '',
							Description: displayName,
							DisplayText: displayName,
							//EntityData: {},
							EntityType: 'User', //-> Para el administrador es ''
							IsResolved: true,
							Key: userName,
							//LocalSearchTerm: 'adminis', //-> Creo que guarda la última búsqueda realizada en el PeoplePicker.
							ProviderDisplayName: '', //-> Ej.: 'Active Directory', 'Tenant', ...
							ProviderName: '', //-> Ej.: 'AD', 'Tenant', ...
							Resolved: true
				    	};

				    	pickerEntities.push(pickerEntity);

				    });


				    // Render and initialize the picker.
				    // Pass the ID of the DOM element that contains the picker, an array of initial
				    // PickerEntity objects to set the picker value, and a schema that defines
				    // picker properties.
				    this.SPClientPeoplePicker_InitStandaloneControlWrapper(peoplePickerElementId, pickerEntities, schema);


				    // Maps the needed callback functions
				    var peoplePicker = this.SPClientPeoplePicker.SPClientPeoplePickerDict[peoplePickerElementId + '_TopSpan'];

				    if (peoplePicker !== void 0 && peoplePicker !== null) {
				    	//peoplePicker.OnControlValidateClientScript = function(peoplePickerId, entitiesArray) {};
				    	//peoplePicker.OnValueChangedClientScript = function(peoplePickerId, entitiesArray) {};
				    	peoplePicker.OnUserResolvedClientScript = function(peoplePickerId, entitiesArray) {

				    		console.log('OnUserResolvedClientScript', peoplePickerId, entitiesArray);

				    		if ($scope.schema.AllowMultipleValues === true) {

				    			$scope.value.results = [];
				    		}


				    		angular.forEach(entitiesArray, function(entity) {

				    			if (entity.IsResolved) {

				    				SPUtils.getUserId(entity.Key).then(function(userId) {

						    			if ($scope.schema.AllowMultipleValues === true) {

					    					$scope.value.results.push(userId);

						    			} else {

						    				$scope.value = userId;
						    				
						    			}

				    				});

				    			}

				    		});
				    	};
				    }
				}
				


				// ****************************************************************************
				// Query the picker for user information.
				//
				function getUserInfo(peoplePickerId) {
				 
				    // Get the people picker object from the page.
				    var peoplePicker = this.SPClientPeoplePicker.SPClientPeoplePickerDict[peoplePickerId];
				 
				    // Get information about all users.
				    var users = peoplePicker.GetAllUserInfo();
				    var userInfo = '';
				    for (var i = 0; i < users.length; i++) {
				        var user = users[i];
				        for (var userProperty in user) {
				            userInfo += userProperty + ':  ' + user[userProperty] + '<br>';
				        }
				    }

				    console.log(userInfo);
				 	
				    // Get user keys.
				    var keys = peoplePicker.GetAllUserKeys();
				    console.log(keys);
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

	['$compile', '$templateCache', '$http',

	function($compile, $templateCache, $http) {

		return {

			restrict: 'EA',
			replace: true,
			template: '<tr></tr>',

			compile: function(element, attrs) {

				return {
					
					pre: function($scope, $element, $attrs) {

						$http.get('templates/form-templates/spfield.html', { cache: $templateCache }).success(function(html) {

							var mode = ($attrs.mode ? 'mode="' + $attrs.mode + '"' : '');
							html = html.replace(/\{\{name\}\}/g, $attrs.spfield || $attrs.name).replace(/\{\{mode\}\}/g, mode);
								
							var newElement = $compile(html)($scope);
							$element.replaceWith(newElement);
							$element = newElement;

						});

					}
					
				};

			}

		};

	}

]);

/*
	SPFormRule - directive
	
	Pau Codina (pau.codina@kaldeera.com)
	Pedro Castro (pedro.castro@kaldeera.com, pedro.cm@gmail.com)

	Copyright (c) 2014
	Licensed under the MIT License
*/



///////////////////////////////////////
//	SPFormRule
///////////////////////////////////////

angular.module('ngSharePoint').directive('spformRule', 

	['$compile', '$templateCache', '$http', '$animate',

	function($compile, $templateCache, $http, $animate) {

		return {
			restrict: 'E',
			replace: 'element',
			scope: false,
			transclude: true,
			priority: 50,

			link: function ($scope, $element, $attrs, ctrl, $transclude) {

				if ($element.parent().length > 0) {

					if ($attrs.templateUrl) {

						$http.get($attrs.templateUrl, { cache: $templateCache }).success(function (html) {

							var newElement = $compile(html)($scope);
									$element.replaceWith(newElement);
									$element = newElement;

						});

					} else {

						$transclude($scope, function (clone) {
							angular.forEach(clone, function (e) {
								$animate.enter(e, $element.parent(), $element);
							});
						});

						$element.remove();
						$element = null;
					}
				}
			}
		};

	}

]);

/*
	SPFormToolbar - directive
	
	Pau Codina (pau.codina@kaldeera.com)
	Pedro Castro (pedro.castro@kaldeera.com, pedro.cm@gmail.com)

	Copyright (c) 2014
	Licensed under the MIT License
*/



///////////////////////////////////////
//	SPFormToolbar
///////////////////////////////////////

angular.module('ngSharePoint').directive('spformToolbar', 

	['$compile', '$templateCache', '$http',

	function($compile, $templateCache, $http) {

		return {

			restrict: 'EA',
			require: '^spform',
			replace: true,
			templateUrl: 'templates/form-templates/spform-toolbar.html',


			link: function($scope, $element, $attrs, spformController) {



				// ****************************************************************************
				// Watch for form mode changes.
				//
				$scope.$watch(spformController.getFormMode, function(newValue) {
					$scope.mode = newValue;
				});



				$scope.saveForm = function() {

					spformController.save();

				};



				$scope.cancelForm = function() {

					spformController.cancel();

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
			templateUrl: 'templates/form-templates/spform.html',
			transclude: true,
			replace: true,
			priority: 100,
			scope: {
				originalItem: '=item',
				preSave: '&',
				postSave: '&'
			},



			controller: ['$scope', '$attrs', function spformController($scope, $attrs) {

				this.status = {
					IDLE: 0,
					PROCESSING: 1
				};

				this.isNew = function() {

					return $scope.originalItem.isNew();
				};


				this.initField = function(fieldName) {

					if (this.isNew()) {

						var fieldSchema = this.getFieldSchema(fieldName);

						switch(fieldSchema.TypeAsString) {

							case 'MultiChoice':
								$scope.item[fieldName] = { results: [] };
								if (fieldSchema.DefaultValue !== null) {
									$scope.item[fieldName].results.push(fieldSchema.DefaultValue);
								}
								break;

							case 'DateTime':
								if (fieldSchema.DefaultValue !== null) {
									$scope.item[fieldName] = new Date();
								}
								break;

							case 'Boolean':
								if (fieldSchema.DefaultValue !== null) {
									$scope.item[fieldName] = fieldSchema.DefaultValue == '1';
								}
								break;

							default:
								if (fieldSchema.DefaultValue !== null) {
									$scope.item[fieldName] = fieldSchema.DefaultValue;
								}
								break;
						}
					}
				};


				this.getFieldSchema = function(fieldName) {
	
					return $scope.schema[fieldName];
				};


				this.getFormMode = function() {

					return $attrs.mode || 'display';
				};


				this.getWebRegionalSettings = function() {

					if ($scope.item.list.web.RegionalSettings === void 0) {
						$scope.item.list.web.getProperties();//.then(...); // Puede ser necesario hacer esta función una promesa.
					}

					return $scope.item.list.web.RegionalSettings;
				};


				this.getFormStatus = function() {
					return $scope.formStatus;
				};


				this.save = function() {

					$scope.formStatus = this.status.PROCESSING;

					if ($scope.preSave({ item: $scope.item }) !== false) {
						
						$scope.item.save().then(function(data) {

							console.log(data);
							angular.extend($scope.originalItem, data);

							$scope.postSave({ item: $scope.originalItem });

							$scope.formStatus = this.status.IDLE;

						}, function(err) {

							console.error(err);

						});

					}

				};


				this.cancel = function() {

					$scope.item = angular.copy($scope.originalItem);
				};

			}],



			compile: function(element, attrs, transclude) {

				return {

					pre: function($scope, $element, $attrs, spformController) {

						if (SPUtils.inDesignMode()) return;


						$scope.$watch(function() {

							return spformController.getFormMode();

						}, function(newMode) {

							$scope.mode = newMode;

							if ($scope.item !== void 0) {

								if ($scope.item.list.Fields !== void 0) {

									$scope.loadItemTemplate();
								}
							}
						});

						$scope.$watch('originalItem', function(newValue) {

							// Checks if the item has a value
							if (newValue === void 0) return;

							$scope.item = angular.copy(newValue);
							$scope.item.clean();

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

						}, true);



						$scope.loadItemTemplate = function() {
							
							var terminalRuleAdded = false;

							var elements = $element.find('*');
							var transcludeFields = 'transclude-fields';
							var elementToTransclude;

							angular.forEach(elements, function(element) {
								if (element.attributes[transcludeFields] !== void 0) {
									elementToTransclude = angular.element(element);
								}
							});

							if (elementToTransclude === void 0) {
								elementToTransclude = $element;
							}

							elementToTransclude.empty();

							transclude($scope, function (clone) {
								angular.forEach(clone, function (e) {

									// if e (element) is a spform-rule, evaluates first the test expression
									if (e.tagName !== void 0 && e.tagName.toLowerCase() == 'spform-rule' && e.attributes.test !== undefined) {

										var testExpression = e.attributes.test.value;

										if (!terminalRuleAdded && $scope.$eval(testExpression)) {

											elementToTransclude.append(e);

											if (e.attributes.terminal !== void 0) {

												terminalRuleAdded = $scope.$eval(e.attributes.terminal.value);
											}

										} else {
											e.remove();
											e = null;
										}
										
									} else {

										elementToTransclude.append(e);
									}
								});
							});


							if ($attrs.templateUrl) {

								$http.get($attrs.templateUrl, { cache: $templateCache }).success(function (html) {

									$element.html('').append(html);
									$compile($element)($scope);

								});

							} else {

								if (elementToTransclude[0].children.length === 0) {

									// if no template then generate a default template.
									$scope.fields = [];

									angular.forEach($scope.item.list.Fields, function(field) {
										if (!field.Hidden && !field.Sealed && !field.ReadOnlyField && field.InternalName !== 'ContentType' && field.InternalName !== 'Attachments') {
											$scope.fields.push(field);
										}
									});

									$http.get('templates/form-templates/spform-default.html', { cache: $templateCache }).success(function (html) {

										elementToTransclude.html('').append(html);
										$compile(elementToTransclude)($scope);

									});

								}
								
							}

							$scope.templateLoaded = true;
						};

					}
					
				};

			}

		};
	}

]);
/*
	SPWorkingOnIt - directive
	
	Pau Codina (pau.codina@kaldeera.com)
	Pedro Castro (pedro.castro@kaldeera.com, pedro.cm@gmail.com)

	Copyright (c) 2014
	Licensed under the MIT License
*/



///////////////////////////////////////
//	SPWorkingOnIt
///////////////////////////////////////

angular.module('ngSharePoint').directive('spworkingonit', function() {

		return {

			restrict: 'EA',
			templateUrl: 'templates/spworking-on-it.html'

		};

	}

);
/*
	newlines - filter
	
	Pau Codina (pau.codina@kaldeera.com)
	Pedro Castro (pedro.castro@kaldeera.com, pedro.cm@gmail.com)

	Copyright (c) 2014
	Licensed under the MIT License
*/

angular.module('ngSharePoint')

.filter('newlines', ['$sce', function ($sce) {

    return function(text) {

        return $sce.trustAsHtml(text.replace(/\n/g, '<br/>'));
    };

}]);
angular.module('ngSharePointFormpage', ['ngSharePoint']);


angular.module('ngSharePointFormpage').directive('spformpage', ['SharePoint', 'SPUtils', function(SharePoint, SPUtils) {
	
	return {

		restrict: 'EA',

		link: function($scope, $element, $attrs) {

			console.log(">>>>> SPFormPage directive");

			var listId = _spPageContextInfo.pageListId;
			var itemId = utils.getQueryStringParamByName('ID');

			SharePoint.getWeb()
				.then(function(web) { return web.getList(listId); })
				.then(function(list) { return list.getItemById(itemId); })
				.then(function(item) {
					$scope.item = item;

					SPUtils.loadScript('sp.ribbon.js', '').then(function() {

						_ribbonInitFunc1();
					});
					
				});


		}

	};

}]);




var element = document.querySelector('[data-spformpage]');

if (element) {
	angular.bootstrap(element, ['ngSharePointFormpage']);
}