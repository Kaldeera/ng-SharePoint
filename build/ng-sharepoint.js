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

		if (query === void 0) return '';
		
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

			if (d.results) {
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





angular.module('ngSharePoint').config(['$compileProvider', 'SPConfig', function($compileProvider, SPConfig) {

	// Reconfigure the RegExp for aHrefSanitizationWhiteList to accept 'javascript'.
	$compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|file|javascript):/);
	// NOTE: The previous statement is for angular versions 1.2.8 and above.
	//		 For version 1.0.5 or 1.1.3 please use the next statement:
	//
	//				$compileProvider.urlSanitizationWhitelist(/^\s*(https?|ftp|mailto|file|javascript):/);
	//
	// ----------------------------------------------------------------------------

	//SPConfig.CSOM = true;

}]);



// ****************************************************************************
// Module constants
//
angular.module('ngSharePoint').value('Constants', {
	errorTemplate: 'templates/error.html',
	userProfileUrl: '_layouts/userdisp.aspx?ID='
});

/*
	Config - provider

	Configuration settings SharePoint provider.
	
	Pau Codina (pau.codina@kaldeera.com)
	Pedro Castro (pedro.castro@kaldeera.com, pedro.cm@gmail.com)

	Copyright (c) 2014
	Licensed under the MIT License
*/



///////////////////////////////////////
//	Config
///////////////////////////////////////

angular.module('ngSharePoint')
.provider('Config', function() {

	'use strict';

	var self = this;
	
	self.options = {
		force15LayoutsDirectory: false,
		minimalLoadSharePointInfraestructure: true
	};
	
	self.$get = function() {

		var Settings = function() {
		};

		Settings.options = self.options;
		
		return Settings;
	};

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

				new SPWeb(url).then(function(web) {
					def.resolve(web);
				});

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

	['$q', function($q) {

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


			this.web = web;

			this.apiUrl = '/GetFolderByServerRelativeUrl(\'' + path + '\')';


			// Initializes the SharePoint API REST url for the folder.
			this.apiUrl = web.apiUrl + this.apiUrl;

			// Init folderProperties (if exists)
			if (folderProperties !== void 0) {
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

						files.push(file);

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
			var defaultExpandProperties = '';

			var executor = new SP.RequestExecutor(self.web.url);

			if (query) {
				query.$expand = defaultExpandProperties + (query.$expand ? ', ' + query.$expand : '');
			} else {
				query = { 
					$expand: defaultExpandProperties
				};
			}

			executor.executeAsync({

				url: self.apiUrl + '/Folders',
				method: 'GET', 
				headers: { 
					"Accept": "application/json; odata=verbose"
				}, 

				success: function(data) {

					var d = utils.parseSPResponse(data);
					var folders = [];

					angular.forEach(d, function(folder) {

						folders.push(new SPFolderObj(self.web, folder.ServerRelativeUrl, folder));

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


 		// Returns the SPFolderObj class
		return SPFolderObj;

	}
]);

/*
	SPGroup - factory
	
	Pau Codina (pau.codina@kaldeera.com)
	Pedro Castro (pedro.castro@kaldeera.com, pedro.cm@gmail.com)

	Copyright (c) 2014
	Licensed under the MIT License
*/



///////////////////////////////////////
//	SPGroup
///////////////////////////////////////

angular.module('ngSharePoint').factory('SPGroup', 

	['$q', 'SPCache', 'SPUser', 

	function($q, SPCache, SPUser) {

		'use strict';


		// ****************************************************************************
		// SPGroup constructor
		//
		// @web: SPWeb instance that contains the group in SharePoint.
		// @groupName: Name or id of the group you want to instantiate.
		//
		var SPGroupObj = function(web, groupName, groupProperties) {

			if (web === void 0) {
				throw '@web parameter not specified in SPGroup constructor.';
			}

			if (groupName === void 0) {
				throw '@groupName parameter not specified in SPGroup constructor.';
			}


			this.web = web;

			if (typeof groupName === 'number') {

				this.apiUrl = '/sitegroups/GetById(\'' + groupName + '\')';

			} else {

				this.apiUrl = '/sitegroups/GetByName(\'' + groupName + '\')';

			}


			// Initializes the SharePoint API REST url for the group.
			this.apiUrl = web.apiUrl + this.apiUrl;

			// Init groupProperties (if exists)
			if (groupProperties !== void 0) {
				angular.extend(this, groupProperties);
			}
		};



		// ****************************************************************************
		// getProperties
		//
		// Gets group properties and attach it to 'this' object.
		//
		// @returns: Promise with the result of the REST query.
		//
		SPGroupObj.prototype.getProperties = function(query) {

			var self = this;
			var def = $q.defer();
			var executor = new SP.RequestExecutor(self.web.url);
			var defaultExpandProperties = 'Owner';

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
					delete d.Users;
					
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
		// getUsers
		//
		// Gets group users
		//
		// @returns: Promise with the result of the REST query.
		//
		SPGroupObj.prototype.getUsers = function() {

			var self = this;
			var def = $q.defer();

			if (this.Users !== void 0) {

				def.resolve(this.Users);

			} else {

				var executor = new SP.RequestExecutor(self.web.url);

				executor.executeAsync({

					url: self.apiUrl + '/Users',
					method: 'GET', 
					headers: { 
						"Accept": "application/json; odata=verbose"
					}, 

					success: function(data) {

						var d = utils.parseSPResponse(data);
						var users = [];

						angular.forEach(d, function(user) {

							users.push(new SPUser(self.web, user.Id, user));

						});

						self.Users = users;

						def.resolve(users);
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

		}; // getUsers



 		// Returns the SPGroupObj class
		return SPGroupObj;

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

	['$q', 'SPCache', 'SPFolder', 'SPListItem', 

	function($q, SPCache, SPFolder, SPListItem) {

		'use strict';


		// ****************************************************************************
		// SPList constructor
		//
		// @web: SPWeb instance that contains the list in SharePoint.
		// @listName: Name or Guid of the list you want to instantiate.
		//
		var SPListObj = function(web, listName, listProperties) {

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

			// Init listProperties (if exists)
			if (listProperties !== void 0) {
				angular.extend(this, listProperties);
			}
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
		// getRootFolder
		//
		// Gets root folder
		//
		// @returns: Promise with the result of the REST query.
		//
		SPListObj.prototype.getRootFolder = function() {

			var self = this;
			var def = $q.defer();

			if (this.RootFolder !== void 0) {

				if (this.RootFolder.__deferred !== void 0) {
					
					delete this.RootFolder;
				}
			}

			if (this.RootFolder !== void 0) {

				def.resolve(this.RootFolder);

			} else {

				var executor = new SP.RequestExecutor(self.web.url);

				executor.executeAsync({

					url: self.apiUrl + '/RootFolder',
					method: 'GET', 
					headers: { 
						"Accept": "application/json; odata=verbose"
					}, 

					success: function(data) {

						var d = utils.parseSPResponse(data);
						this.RootFolder = new SPFolder(self.web, d.ServerRelativeUrl, d);

						def.resolve(this.RootFolder);
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
//	SPListItem
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
		// Returns a boolean value indicating if the item is a new item.
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
		// Gets folder properties of the item and attach it to 'this' object.
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
		// getAttachments
		//
		// Gets the attachments of the item.
		// If the item is a DocumentLibrary item, also gets the File and/or Folder.
		//
		// @returns: Promise with the result of the REST query.
		//
		SPListItemObj.prototype.getAttachments = function() {

			var self = this;
			var def = $q.defer();
			var executor = new SP.RequestExecutor(self.list.web.url);

			if (this.isNew()) {

				// Initialize the attachments arrays (See processAttachments method).
				self.AttachmentFiles = [];
				self.attachments = { add: [], remove: [] };
				def.resolve(self.AttachmentFiles);

			} else {

				executor.executeAsync({

					url: self.getAPIUrl() + '/AttachmentFiles',
					method: 'GET', 
					headers: { 
						"Accept": "application/json; odata=verbose"
					}, 

					success: function(data) {

						var d = utils.parseSPResponse(data);
						self.AttachmentFiles = d;

						// Initialize the attachments arrays (See processAttachments method).
						self.attachments = {
							add: [],
							remove: []
						};

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
			}

			return def.promise;

		}; // getAttachments



		// ****************************************************************************		
		// addAttachment
		//
		// Attach a file to the item.
		//
		// @file: A file object from the files property of the DOM element <input type="File" ... />.
		// @returns: Promise with the result of the REST query.
		//
		SPListItemObj.prototype.addAttachment = function(file) {

			var self = this;
			var def = $q.defer();
			var executor = new SP.RequestExecutor(self.list.web.url);

			SPUtils.getFileBinary(file).then(function(binaryData) {

				executor.executeAsync({

					url: self.getAPIUrl() + "/AttachmentFiles/add(FileName='" + file.name + "')",
					method: "POST",
			        binaryStringRequestBody: true,
			        body: binaryData,
			        state: "Update",
					headers: { 
						"Accept": "application/json; odata=verbose"
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

		}; // addAttachment



		// ****************************************************************************		
		// removeAttachment
		//
		// Removes a file attached to the item.
		//
		// @fileName: The name of the file to remove.
		// @returns: Promise with the result of the REST query.
		//
		SPListItemObj.prototype.removeAttachment = function(fileName) {

			var self = this;
			var def = $q.defer();
			var executor = new SP.RequestExecutor(self.list.web.url);


			// Set the headers for the REST API call.
			// ----------------------------------------------------------------------------
			var headers = {
				"Accept": "application/json; odata=verbose",
				"X-HTTP-Method": "DELETE"
			};

			var requestDigest = document.getElementById('__REQUESTDIGEST');
			// Remote apps that use OAuth can get the form digest value from the http://<site url>/_api/contextinfo endpoint.
			// SharePoint-hosted apps can get the value from the #__REQUESTDIGEST page control if it's available on the SharePoint page.

			if (requestDigest !== null) {
				headers['X-RequestDigest'] = requestDigest.value;
			}


			executor.executeAsync({

				url: self.getAPIUrl() + "/AttachmentFiles('" + fileName + "')",
				method: "POST",
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

		}; // removeAttachment




		// ****************************************************************************		
		// processAttachments
		//
		// Process the attachments arrays (See SPFieldAttachments directive).
		// The attachments arrays contains the files to attach to the item and the
		// attachments to remove from the item.
		// After the process, the attachments arrays will be initialized.
		//
		// @returns: Promise with the result of the process.
		//
		SPListItemObj.prototype.processAttachments = function() {

			var self = this;
			var def = $q.defer();


			// Check if the attachments property has been initialized
			if (this.attachments !== void 0) {

				var promises = [];

				if (this.attachments.add !== void 0 && this.attachments.add.length > 0) {
					angular.forEach(this.attachments.add, function(file) {
						promises.push(self.addAttachment(file));
					});
				}

				if (this.attachments.remove !== void 0 && this.attachments.remove.length > 0) {
					angular.forEach(this.attachments.remove, function(fileName) {
						promises.push(self.removeAttachment(fileName));
					});
				}

				$q.all(promises).then(function() {

					// Clean up the attachments arrays
					self.attachments.add = [];
					self.attachments.remove = [];

					def.resolve();
				});

			} else {

				// Nothing to do
				def.resolve();
			}


            return def.promise;

		}; // processAttachments




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

				// Remove not valid properties
				delete saveObj.list;
				delete saveObj.apiUrl;

				// Remove functions
				for (var p in saveObj) {
					if (typeof saveObj[p] == 'function') {
						delete saveObj[p];
					}
				}

				// Remove all Computed and ReadOnlyFields
				angular.forEach(self.list.Fields, function(field) {
					
					if (field.TypeAsString === 'Computed' || field.ReadOnlyField) {
						delete saveObj[field.InternalName];
					}

				});

				// Remove attachments
				delete saveObj.attachments;
				delete saveObj.AttachmentFiles;

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

						// After save, process the attachments.
						self.processAttachments().then(function() {
							def.resolve(d);
						}, function() {
							def.resolve(d);
						});
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
	SPUser - factory
	
	Pau Codina (pau.codina@kaldeera.com)
	Pedro Castro (pedro.castro@kaldeera.com, pedro.cm@gmail.com)

	Copyright (c) 2014
	Licensed under the MIT License
*/



///////////////////////////////////////
//	SPUser
///////////////////////////////////////

angular.module('ngSharePoint').factory('SPUser', 

	['$q', function($q) {


		// ****************************************************************************
		// SPUser constructor
		//
		// @web: SPWeb instance that contains the user in SharePoint.
		// @userData: User information. Could be:
		//				number: user id
		//				string: login name
		//				object: user object
		//
		var SPUserObj = function(web, userId, userData) {

			if (web === void 0) {
				throw '@web parameter not specified in SPUser constructor.';
			}

			if (userId === void 0) {
				throw '@userId parameter not specified in SPUser constructor.';
			}


			this.web = web;

			if (typeof userId === 'number') {

				// Instead of attack directly to the WEB api, we can retrieve the user list 
				// item into the SiteUserInfoList.
				// With this, we can retrieve all the user information.

				this.apiUrl = '/SiteUserInfoList/getItemById(\'' + userId + '\')';
				// this.apiUrl = '/GetUserById(\'' + userId + '\')';

			} else if (typeof userId === 'string') {

				this.apiUrl = '/siteusers/getByLoginName(@v)?@v=\'' + userId + '\'';

			}

			// Initializes the SharePoint API REST url for the group.
			this.apiUrl = web.apiUrl + this.apiUrl;

			// Init userProperties (if exists)
			if (userData !== void 0) {
				angular.extend(this, userData);
			}
		};


		// ****************************************************************************
		// getProperties
		//
		// Gets user properties and attach it to 'this' object.
		//
		// @returns: Promise with the result of the REST query.
		//
		SPUserObj.prototype.getProperties = function(query) {

			var self = this;
			var def = $q.defer();
			var executor = new SP.RequestExecutor(self.web.url);
			var defaultExpandProperties = '';

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
//					delete d.Fields;
					
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




		// Returns the SPUserObj class
		return SPUserObj;

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

angular.module('ngSharePoint').factory('SPUtils', ['Config', '$q', '$http', 'ODataParserProvider', function (Config, $q, $http, ODataParserProvider) {

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
/*
				// Max 2.5 sec. to load all needed scripts
				setTimeout(function() {
					isSharePointReady = true;
					deferred.resolve();
				}, 2500);
*/


				// SP.SOD.executeOrDelayUntilScriptLoaded(function () {
				// 	isSharePointReady = true;
				// 	deferred.resolve();
				// }, "sp.js");


				// http://mahmoudfarhat.net/post/2013/03/23/SharePoint-2013-ExecuteOrDelayUntilScriptLoaded-not-executing-after-page-publish.aspx
				// Load sp.js
				SP.SOD.executeFunc('sp.js', 'SP.ClientContext', function () {

					var loadScriptPromises = [];

					// Loads additional needed scripts
					loadScriptPromises.push(self.loadScript('SP.RequestExecutor.js', 'SP.RequestExecutor'));

					if (!Config.options.minimalLoadSharePointInfraestructure) {

						loadScriptPromises.push(self.loadScript('SP.UserProfiles.js', 'SP.UserProfiles'));
						loadScriptPromises.push(self.loadScript('datepicker.debug.js', 'clickDatePicker'));
						loadScriptPromises.push(self.loadScript('clienttemplates.js', ''));
						loadScriptPromises.push(self.loadScript('clientforms.js', ''));
						loadScriptPromises.push(self.loadScript('clientpeoplepicker.js', 'SPClientPeoplePicker'));
						loadScriptPromises.push(self.loadScript('autofill.js', ''));
						loadScriptPromises.push(self.loadScript(_spPageContextInfo.currentLanguage + '/initstrings.js', 'Strings'));
						loadScriptPromises.push(self.loadScript(_spPageContextInfo.currentLanguage + '/strings.js', 'Strings'));
						loadScriptPromises.push(self.loadResourceFile('core.resx'));
						//loadScriptPromises.push(self.loadResourceFile('sp.publishing.resources.resx'));
					}

					$q.all(loadScriptPromises).then(function() {

						isSharePointReady = true;
						deferred.resolve();

					}, function(error) {

						console.error('Error loading SharePoint script dependences', error);
						deferred.reject(error);
					});


				});
			}

			return deferred.promise;
		},



		loadResourceFile: function(resourceFilename) {

			var deferred = $q.defer();
			var pos = resourceFilename.lastIndexOf('.resx');
			var name = resourceFilename.substr(0, (pos != -1 ? pos : resourceFilename.length));
			var url;

			if (Config.options.force15LayoutsDirectory) {
				url = '/_layouts/15/ScriptResx.ashx?name=' + name + '&culture=' + STSHtmlEncode(Strings.STS.L_CurrentUICulture_Name);
			} else {
				url = SP.Utilities.Utility.getLayoutsPageUrl('ScriptResx.ashx') + '?name=' + name + '&culture=' + STSHtmlEncode(Strings.STS.L_CurrentUICulture_Name);
			}

			$http.get(url).success(function(data) {

				window.Resources = window.Resources || {};

				// Fix bad transformation in core.resx
				data = data.replace(/align - right|align-right/g, 'align_right');
				data = data.replace(/e - mail|e-mail/g, 'email');
				data = data.replace(/e - Mail|e-Mail/g, 'email');
				data = data.replace(/tty - TDD|tty-TDD/g, 'tty_TDD');
				
				try {
					var _eval = eval; // Fix jshint warning: eval can be harmful.
					_eval(data);

					window.Res = window.Res || void 0;

					if (window.Res !== void 0) {
						window.Resources[name] = window.Res;
					}

				} catch(ex) {
					console.error(ex);
				}

				deferred.resolve();
			});

			return deferred.promise;
		},



		loadScript: function(scriptFilename, functionName) {

			var deferred = $q.defer();

			if (Config.options.force15LayoutsDirectory) {
				SP.SOD.registerSod(scriptFilename, '/_layouts/15/' + scriptFilename);
			} else {
				SP.SOD.registerSod(scriptFilename, SP.Utilities.Utility.getLayoutsPageUrl(scriptFilename));
			}

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
	    },


	    getCurrentUserLCID: function() {

	    	var self = this;
	    	var deferred = $q.defer();

			var url = _spPageContextInfo.webServerRelativeUrl.rtrim('/') + "/_layouts/15/regionalsetng.aspx?Type=User";

			$http.get(url).success(function(data) {

				var html = angular.element(data);
				var form, lcid;

				angular.forEach(html, function(element) {
					if (element.tagName && element.tagName.toLowerCase() === 'form') {
						form = element;
					}
				});

				if (form !== void 0) {
					var regionalSettingsSelect = form.querySelector('#ctl00_PlaceHolderMain_ctl02_ctl01_DdlwebLCID');
					var selectedOption = regionalSettingsSelect.querySelector('[selected]');
					lcid = selectedOption.value;
				}


				deferred.resolve(lcid);

			});

			return deferred.promise;
	    },



		getWebById: function(webId) {
			
			var self = this;
			var deferred = $q.defer();

			this.SharePointReady().then(function() {
				var ctx = new SP.ClientContext();
				var site = ctx.get_site();
				var web = site.openWebById(webId.ltrim('{').rtrim('}'));

				ctx.load(web, 'ServerRelativeUrl');

				ctx.executeQueryAsync(function() {

					deferred.resolve(web);

				}, function(sender, args) {

					deferred.reject({ sender: sender, args: args });
				});
			});

			return deferred.promise;
		},




		// ****************************************************************************		
		// getFileBinary
		//
		// Converts a file object to binary data string.
		//
		// @file: A file object from the files property of the DOM element <input type="File" ... />.
		// @returns: Promise with the binary data.
		//
		getFileBinary: function(file) {

			var self = this;
			var deferred = $q.defer();
			var reader = new FileReader();

			reader.onload = function(e) {
				var buffer = e.target.result;
				var bytes = new Uint8Array(buffer);
				var binaryData = '';

				for (var i = 0; i < bytes.length; i++) {
					binaryData += String.fromCharCode(bytes[i]);
				}

				deferred.resolve(binaryData);
			};

			reader.onerror = function(e) {
				deferred.reject(e.target.error);
			};

			reader.readAsArrayBuffer(file);

			return deferred.promise;
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

	['$q', 'SPUtils', 'SPList', 'SPUser',

	function($q, SPUtils, SPList, SPUser) {

		'use strict';


		// ****************************************************************************
		// SPWeb constructor
		//
		// @url: The url of the web you want to instanciate.
		//
		var SPWebObj = function(url) {

			this.url = url;

			return this.getApiUrl();

		};



		// ****************************************************************************
		// getApiUrl
		//
		// @returns: Promise that will be resolved after the initialization of the 
		//			 SharePoint web API REST url endpoint.
		//
		SPWebObj.prototype.getApiUrl = function() {

			var self = this;
			var def = $q.defer();


			if (this.apiUrl !== void 0) {

				def.resolve(this);

			} else {

				// If not 'url' parameter provided in the constructor, gets the url of the current web.
				if (this.url === void 0) {

					this.url = _spPageContextInfo.webServerRelativeUrl;
					this.apiUrl = this.url.rtrim('/') + '/_api/web';
					def.resolve(this);

				} else {

					// Cleans the 'url' parameter.
					this.url = this.url.trim().ltrim('{').rtrim('}');

					if (utils.isGuid(this.url)) {

						SPUtils.getWebById(this.url).then(function(jsomWeb) {

							self.url = jsomWeb.get_serverRelativeUrl();
							self.apiUrl = self.url.rtrim('/') + '/_api/web';
							def.resolve(self);

						});

					} else {

						this.apiUrl = this.url.rtrim('/') + '/_api/web';
						def.resolve(this);
					}

				}
			}

			return def.promise;

		};




		// ****************************************************************************		
		// getProperties
		//
		// Gets web properties and attach it to 'this' object.
		//
		// http://msdn.microsoft.com/es-es/library/office/jj164022(v=office.15).aspx
		// @returns: Promise with the result of the REST query.
		//
		SPWebObj.prototype.getProperties = function(query) {

			var self = this;
			var def = $q.defer();
			var defaultExpandProperties = 'RegionalSettings/TimeZone';

			SPUtils.SharePointReady().then(function() {

				var executor = new SP.RequestExecutor(self.url);

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
		// getLists
		//
		// Gets a SPList collection (SPList factory)
		//
		// @listName: String or Guid with the name or GUID of the list.
		// @returns: array of SPList objects.
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

						var d = utils.parseSPResponse(data);
						var lists = [];

						angular.forEach(d, function(listProperties) {
							var spList = new SPList(self, listProperties.Id, listProperties);
							lists.push(spList);
						});

						def.resolve(lists);
						// def.resolve(utils.parseSPResponse(data));
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
		// getCurrentUser
		//
		// Gets a SPUser object (SPUser factory)
		//
		// @returns: SPUser instance.
		//
		SPWebObj.prototype.getCurrentUser = function() {

			var def = $q.defer();
			var self = this;

			if (this.currentUser !== void 0) {

				def.resolve(this.currentUser);

			} else {
				this.getUserById(_spPageContextInfo.userId).then(function(user) {
					self.currentUser = user;
					def.resolve(user);
				});
			}

			return def.promise;
		};



		// ****************************************************************************	
		// getUserById
		//
		// Gets a SPUser object (SPUser factory)
		//
		// @userId: Id of the user to search
		// @returns: SPUser instance.
		//
		SPWebObj.prototype.getUserById = function(userId) {

			var def = $q.defer();

			new SPUser(this, userId).getProperties().then(function(user) {
				def.resolve(user);
			});

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
	SPFieldAttachments - directive
	
	Pau Codina (pau.codina@kaldeera.com)
	Pedro Castro (pedro.castro@kaldeera.com, pedro.cm@gmail.com)

	Copyright (c) 2014
	Licensed under the MIT License
*/



///////////////////////////////////////
//	SPFieldAttachments
///////////////////////////////////////

angular.module('ngSharePoint').directive('spfieldAttachments', 

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
				$scope.DeleteAttachmentText = STSHtmlEncode(Strings.STS.L_DeleteDocItem_Text);
				$scope.AttachFileText = Resources.core.cui_ButAttachFile;


				// ****************************************************************************
				// Watch for form mode changes.
				//
				$scope.$watch(function() {

					return $scope.mode || controllers[0].getFormMode();

				}, function(newValue) {

					$scope.currentMode = newValue;

					// Show loading animation.
					setElementHTML('<div><img src="/_layouts/15/images/loadingcirclests16.gif" alt="" /></div>');

					// Gets the files attached to the item
					$scope.$parent.item.getAttachments().then(function(attachmentFiles){

						$scope.attachmentFiles = attachmentFiles;
						renderField($scope.currentMode);

					}, function(err) {

						$scope.errorMsg = err.message;
						setElementHTML('<span style="color: brown">{{errorMsg}}</span>');
					});

				}, true);



				// ****************************************************************************
				// Add new attachment to the item locally.
				// NOTE: Attachments will be effective when save the item.
				//
				$scope.onFileSelect = function($files, $event) {

					angular.forEach($files, function(file) {

						// Checks if filename has already been selected
						var itemIndex = -1;

						for (var i = 0; i < $scope.attachmentFiles.length; i++) {
							if ($scope.attachmentFiles[i].FileName == file.name) {
								itemIndex = i;
								break;
							}
						}


						if (itemIndex >= 0) {

							alert(Strings.STS.L_ConflictReplaceTitle + ' \'' + file.name + '\'.');

						} else {

							$scope.$parent.item.attachments.add.push(file);
							$scope.attachmentFiles.push({ FileName: file.name, local: true });

						}

					});

					// Initialize the 'files' property in the <input type="file" /> object.
					$event.target.value = '';

				};



				// ****************************************************************************
				// Removes existing attachment, local o server side.
				// NOTE: Attachments will be effective when save the item.
				//
				$scope.removeAttachment = function(index, local) {

					if (local) {

						for (var i = 0; i < $scope.$parent.item.attachments.add.length; i++) {
							if ($scope.$parent.item.attachments.add[i].name == $scope.attachmentFiles[index].FileName) {
								$scope.$parent.item.attachments.add.splice(i, 1);
								break;
							}
						}

						$scope.attachmentFiles.splice(index, 1);

					} else {

						var confirmMessage = Strings.STS.L_ConfirmDelete_TXT;

						if (!!recycleBinEnabled) {
							confirmMessage = Strings.STS.L_ConfirmRecycle_TXT;
						}

						if (confirm(confirmMessage)) {

							$scope.$parent.item.attachments.remove.push($scope.attachmentFiles[index].FileName);
							$scope.attachmentFiles.splice(index, 1);
						}
					}
				};



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

					$http.get('templates/form-templates/spfield-attachments-' + mode + '.html', { cache: $templateCache }).success(function(html) {

						setElementHTML(html);
					});

				}

			}

		};

	}

]);




angular.module('ngSharePoint').directive('fileSelect', 

	['$parse', '$timeout', 

	function($parse, $timeout) {

		return function($scope, $element, $attrs) {

			var fn = $parse($attrs.fileSelect);

			if ($element[0].tagName.toLowerCase() !== 'input' || ($element.attr('type') && $element.attr('type').toLowerCase()) !== 'file') {

				var fileElem = angular.element('<input type="file">');

				for (var i = 0; i < $element[0].attributes.length; i++) {
					fileElem.attr($element[0].attributes[i].name, $element[0].attributes[i].value);
				}

				if ($element.attr("data-multiple")) fileElem.attr("multiple", "true");

				fileElem.css({
					position: 'absolute',
					top: '0px',
					bottom: '0px',
					//left: '0px',
					right: '0px',
					width: '200%',
					margin: '0px',
					padding: '0px',
					opacity: '0',
					filter: 'alpha(opacity=0)',
					'z-index': '1000',
					cursor: 'pointer'

				});

				$element.append(fileElem);

				if (fileElem.parent()[0] != $element[0]) {
					//fix #298
					$element.wrap('<span>');
					$element.css("z-index", "-1000");
					$element.parent().append(fileElem);
					$element = $element.parent();
				}

				if ($element.css("position") === '' || $element.css("position") === 'static') {
					$element.css("position", "relative");
				}

				$element.css({
					display: 'inline-block',
					overflow: 'hidden',
					cursor: 'pointer'
				});

				$element = fileElem;
			}


			$element.bind('change', function(evt) {

				var files = [];
				var fileList = evt.__files_ || evt.target.files;

				if (fileList !== null) {
					for (var i = 0; i < fileList.length; i++) {
						files.push(fileList.item(i));
					}
				}

				$timeout(function() {
					fn($scope, {
						$files : files,
						$event : evt
					});
				});

			});

		};

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

					$scope.displayValue = newValue ? STSHtmlEncode(Strings.STS.L_SPYes) : STSHtmlEncode(Strings.STS.L_SPNo);
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
	SPFieldCalculated - directive
	
	Pau Codina (pau.codina@kaldeera.com)
	Pedro Castro (pedro.castro@kaldeera.com, pedro.cm@gmail.com)

	Copyright (c) 2014
	Licensed under the MIT License
*/



///////////////////////////////////////
//	SPFieldCalculated
///////////////////////////////////////

angular.module('ngSharePoint').directive('spfieldCalculated', 

	['$compile', '$templateCache', '$http',

	function($compile, $templateCache, $http) {

		return {

			restrict: 'EA',
			require: ['^spform', 'ngModel'],
			replace: true,
			scope: {
				//mode: '@',
				value: '=ngModel'
			},
			templateUrl: 'templates/form-templates/spfield-text-display.html'
			/*
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

					$http.get('templates/form-templates/spfield-text-display.html', { cache: $templateCache }).success(function(html) {
						var newElement = $compile(html)($scope);
						$element.replaceWith(newElement);
						$element = newElement;
					});

				}

			}
			*/

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
				$scope.choices = $scope.schema.Choices.results;


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
				
				if ($scope.fieldSchema !== void 0) {

					// Sets the default value for the field
					spformController.initField($attrs.name);

					// NOTE: Include a <spfield-control name="<name_of_the_field>" mode="hidden" /> to initialize the field with it's default value.
					if ($attrs.mode == 'hidden') {
						$element.addClass('ng-hide');
 						return;
					}

					// Gets the field type
					var fieldType = $scope.fieldSchema.TypeAsString;
					if (fieldType === 'UserMulti') fieldType = 'User';

					// Gets the field name
					var fieldName = $attrs.name + (fieldType == 'Lookup' || fieldType == 'LookupMulti' || fieldType == 'User' || fieldType == 'UserMulti' ? 'Id' : '');
					if ((fieldType == 'Lookup' || fieldType == 'LookupMulti') && $scope.fieldSchema.PrimaryFieldId !== null) {
						var primaryFieldSchema = spformController.getFieldSchema($scope.fieldSchema.PrimaryFieldId);

						if (primaryFieldSchema !== void 0) {
							fieldName = primaryFieldSchema.InternalName + 'Id';
						}
					}

					// Gets the field mode
					var mode = ($attrs.mode ? ' mode="' + $attrs.mode + '"' : '');
					var dependsOn = ($attrs.dependsOn ? ' depends-on="' + $attrs.dependsOn + '"' : '');
					var hidden = ($attrs.mode == 'hidden' ? ' ng-hide="true"' : '');

					// Mount the field directive HTML
					var fieldControlHTML = '<spfield-' + fieldType + ' ng-model="item.' + fieldName + '" name="' + $attrs.name + '"' + mode + dependsOn + hidden + '></spfield-' + fieldType + '>';

					$element.append(fieldControlHTML);
					$compile($element)($scope);

				} else {

					console.error('Unknown field ' + $attrs.name);
				}
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

	['$compile', '$templateCache', '$http', '$filter', '$timeout', '$q', 'SPUtils',

	function($compile, $templateCache, $http, $filter, $timeout, $q, SPUtils) {

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

					getData().then(function() {
						renderField(newValue);
					});

				});



				function getData() {

					var def = $q.defer();

					// Gets web regional settings
					controllers[0].getWebRegionalSettings().then(function(webRegionalSettings) {

						$scope.webRegionalSettings = webRegionalSettings;

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


						//$scope.lcid = SP.Res.lcid;

						// Gets current user language (LCID) from user regional settings configuration.
						//
						SPUtils.getCurrentUserLCID().then(function(lcid) {

							$scope.lcid = lcid;


							// La clase Sys.CultureInfo contiene la información de la cultura actual del servidor.
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
												   '&lcid=' + STSHtmlEncode($scope.lcid) + 									// Locale (User Regional Settings)
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
							if ($scope.value !== null && $scope.value !== void 0) {
								
								$scope.dateModel = new Date($scope.value);
								$scope.dateOnlyModel = $filter('date')($scope.dateModel, $scope.cultureInfo.dateTimeFormat.ShortDatePattern);
								$scope.minutesModel = $scope.dateModel.getMinutes().toString();
								var hours = $scope.dateModel.getHours();
								$scope.hoursModel = hours.toString() + ($scope.hoursMode24 ? ':' : '');
								if (hours < 10) {
									$scope.hoursModel = '0' + $scope.hoursModel;
								}

							} else {

								$scope.dateModel = $scope.dateOnlyModel = $scope.minutesModel = $scope.hoursModel = null;

							}


							// All data collected and processed, continue...
							def.resolve();

						});

					});


					return def.promise;

				}



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
				function updateModel(newValue, oldValue) {

					if (newValue === oldValue || $scope.dateOnlyModel === void 0 || $scope.dateOnlyModel === null) return;

					// TODO: Hay que ajustar la fecha/hora con el TimeZone correcto.

					var dateValues = $scope.dateOnlyModel.split($scope.cultureInfo.dateTimeFormat.DateSeparator);
					var dateParts = $scope.cultureInfo.dateTimeFormat.ShortDatePattern.split($scope.cultureInfo.dateTimeFormat.DateSeparator);
					var dateComponents = {};
					
					for(var i = 0; i < dateParts.length; i++) {
						dateComponents[dateParts[i]] = dateValues[i];
					}

					var hours = $scope.hoursModel;
					if (hours !== null) {
						hours = ($scope.hoursMode24 ? hours.substr(0, hours.length - 1) : hours.substr(0, 2));
					}
					var minutes = $scope.minutesModel;
					var date = new Date(Date.UTC(dateComponents.yyyy, (dateComponents.MM || dateComponents.M) - 1, dateComponents.dd || dateComponents.d, hours, minutes));

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
				/*
				$scope.$watch(function() {

					return { mode: $scope.mode || controllers[0].getFormMode(), value: $scope.value };

				}, function(newValue, oldValue) {

					$scope.currentMode = newValue.mode;

					if (newValue.value !== oldValue.value) {
						$scope.lookupItem = void 0;
					}

					refreshData();

				}, true);
				*/



				// ****************************************************************************
				// Watch for form mode changes.
				//
				$scope.$watch(function() {

					return $scope.mode || controllers[0].getFormMode();

				}, function(newValue, oldValue) {

					if ($scope.currentMode === newValue) return;
					
					$scope.currentMode = newValue;
					refreshData();

				});



				// ****************************************************************************
				// Watch for value (model) changes.
				//
				$scope.$watch('value', function(newValue, oldValue) {

					if (newValue === oldValue) return;

					$scope.lookupItem = void 0;
					refreshData();

				});


				// ****************************************************************************
				// Check for dependences.
				//
				if ($attrs.dependsOn !== void 0) {

					$scope.$on($attrs.dependsOn + '_changed', function(evt, newValue) {

						$scope.dependency = {
							fieldName: $attrs.dependsOn,
							value: newValue
						};

						// Initialize the items collection to force query the items again.
						$scope.lookupItems = void 0;

						refreshData();

					});

				}



				// ****************************************************************************
				// Controls the 'changed' event in the associated <select> element.
				//
				$scope.valueChanged = function() {

					if ($scope.lastValue !== $scope.value) {

						// Calls the 'fieldValueChanged' method in the SPForm controller to broadcast to all child elements.
						controllers[0].fieldValueChanged($scope.schema.InternalName, $scope.value);

						$scope.lastValue = $scope.value;
					}
				};



				// ****************************************************************************
				// Refresh the lookup data and render the field.
				//
				function refreshData() {
					
					// Show loading animation.
					setElementHTML('<div><img src="/_layouts/15/images/loadingcirclests16.gif" alt="" /></div>');

					// Gets the data for the lookup and then render the field.
					getLookupData($scope.currentMode).then(function(){

						renderField($scope.currentMode);

					}, function(err) {

						$scope.errorMsg = err.message;

						if ($scope.value === void 0) {
							setElementHTML('');
						} else {
							setElementHTML('<span style="color: brown">{{errorMsg}}</span>');
						}
					});

				}



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

						// TODO: Check if the list is in the form's cache to improve performance and reduce XHR calls.
						// NOTE: Do the same in other fields like SPFieldLookupMulti or SPFieldUser.
						// NOTE 2: Also we could do the same with the SPWeb object.
						/*
						// Try to recover the list from the form's cache.
						$scope.lookupList = SPCache.getCacheValue(<form_identifier>, $scope.schema.LookupList);

						if ($scope.lookupList === void 0) { //-> Not in the cache

							// Recover the list...

						} else {

							// Returns previously resolved list (Form's cache).
							def.resolve($scope.lookupList);
						}
						*/

						SharePoint.getWeb($scope.schema.LookupWebId).then(function(web) {

							web.getList($scope.schema.LookupList).then(function(list) {

								$scope.lookupList = list;

								list.getProperties({ $expand: 'Forms' }).then(function() {

									list.getFields().then(function() {

										// TODO: Add the list to the form's cache when resolved
										//SPCache.setCacheValue(<form_identifier>, $scope.schema.LookupList, $scope.lookupList);
										
										def.resolve($scope.lookupList);

									}, function(err) {

										def.reject(err);
									});

								}, function(err) {

									def.reject(err);
								});

							}, function(err) {

								def.reject(err);
							});

						});

					} else {

						// Returns previously resolved list
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

							if ($scope.value === null || $scope.value === 0 || $scope.value === void 0) {

								// If no value returns an empty object for correct binding
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

								}, function(err) {

									def.reject(err);
								});
							}

						}, function(err) {

							def.reject(err);
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

							var $query = void 0;

							if ($scope.dependency !== void 0) {
								$query = {
									$select: '*, ' + $scope.dependency.fieldName + '/Id',
									$expand: $scope.dependency.fieldName + '/Id',
									$filter: $scope.dependency.fieldName + '/Id eq ' + $scope.dependency.value,
								};
							}

							list.getListItems($query).then(function(items) {

								$scope.lookupItems = items;

								// Adds an extra empty element '(None)' if the field is not required.
								if (!$scope.schema.Required) {
									$scope.lookupItems = [{ Id: 0, Title: STSHtmlEncode(Strings.STS.L_LookupFieldNoneOption) }].concat(items);
								}

								// Sets the initial value when no value is provided
								if ($scope.value === null || $scope.value === void 0) {
									if ($scope.schema.Required) {
										if ($scope.lookupItems.length > 0) {
											$scope.value = $scope.lookupItems[0].Id;
										} else {
											$scope.value = null;
										}
									} else {
										$scope.value = 0;
									}
								}

								// If there is a dependency, checks if the current value exists on the new result set.
								if ($scope.dependency !== void 0) {
									
									var match = $scope.lookupItems.reduce(function(prev, curr) {
										return ($scope.value === curr.Id) || prev;
									}, false);

									// If the current value does not exists, select the first value from the new result set.
									if (!match) {
										if ($scope.lookupItems.length > 0) {
											$scope.value = $scope.lookupItems[0].Id;
										} else {
											$scope.value = null;
										}
									}
								}

								$scope.valueChanged();

								def.resolve($scope.lookupItems);

							}, function(err) {

								def.reject(err);
							});

						}, function(err) {

							def.reject(err);
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
				/*
				$scope.$watch(function() {

					// Adjust the model if no value is provided
					// NOTA: Esto no sé si debería estar fuera.
					//		 No entra en bucle infinito pero no tiene mucho sentido que esté aquí.
					if ($scope.value === null) {
						$scope.value = { results: [] };
					}
					
					return { mode: $scope.mode || controllers[0].getFormMode(), value: $scope.value };

				}, function(newValue, oldValue) {

					$scope.currentMode = newValue.mode;

					//if (newValue.value.results !== oldValue.value.results) {
					if (newValue.value !== oldValue.value) {
						$scope.selectedLookupItems = void 0;
					}

					refreshData();

				}, true);
				*/



				// ****************************************************************************
				// Watch for form mode changes.
				//
				$scope.$watch(function() {

					return $scope.mode || controllers[0].getFormMode();

				}, function(newValue, oldValue) {

					if ($scope.currentMode === newValue) return;

					$scope.currentMode = newValue;
					refreshData();

				});



				// ****************************************************************************
				// Watch for value (model) changes.
				//
				$scope.$watch('value', function(newValue, oldValue) {

					if (newValue === oldValue) return;

					$scope.selectedLookupItems = void 0;

					refreshData();
				});



				// ****************************************************************************
				// Check for dependences.
				//
				if ($attrs.dependsOn !== void 0) {

					$scope.$on($attrs.dependsOn + '_changed', function(evt, newValue) {

						$scope.dependency = {
							fieldName: $attrs.dependsOn,
							value: newValue
						};

						// Initialize the items collection to force query the items again.
						$scope.lookupItems = void 0;

						// Reset the current selected items.
						$scope.value = null;

						refreshData();

					});

				}



				// ****************************************************************************
				// Controls the 'changed' event in the associated <select> element.
				//
				/*
				$scope.valueChanged = function() {

					// Calls the 'fieldValueChanged' method in the SPForm controller to broadcast to all child elements.
					controllers[0].fieldValueChanged($scope.schema.InternalName, $scope.value);
				};
				*/



				// ****************************************************************************
				// Refresh the lookup data and render the field.
				//
				function refreshData() {

					// Adjust the model if no value is provided
					if ($scope.value === null) {
						$scope.value = { results: [] };
					}
					
					// Show loading animation.
					setElementHTML('<div><img src="/_layouts/15/images/loadingcirclests16.gif" alt="" /></div>');

					// Gets the data for the lookup and then render the field.
					getLookupData($scope.currentMode).then(function(){

						renderField($scope.currentMode);

					}, function(err) {

						$scope.errorMsg = err.message;

						if ($scope.value === void 0) {
							setElementHTML('');
						} else {
							setElementHTML('<span style="color: brown">{{errorMsg}}</span>');
						}
					});

				}


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

						SharePoint.getWeb($scope.schema.LookupWebId).then(function(web) {

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
				function getLookupItems($query) {

					var def = $q.defer();

					if ($scope.lookupItems !== void 0) {

						// Returns cached items
						def.resolve($scope.lookupItems);

					} else {
						
						getLookupList().then(function(list) {

							list.getListItems($query).then(function(items) {

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

							if ($scope.value !== null && $scope.value !== void 0) {
								
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
							}

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
					var $query = void 0;

					if ($scope.dependency !== void 0) {
						$query = {
							$select: '*, ' + $scope.dependency.fieldName + '/Id',
							$expand: $scope.dependency.fieldName + '/Id',
							$filter: $scope.dependency.fieldName + '/Id eq ' + $scope.dependency.value,
						};
					}

					getLookupItems($query).then(function(candidateItems) {

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

							if ($scope.value && $scope.value.results && $scope.value.results.indexOf(item.Id) != -1) {

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

					if ($scope.value === null || $scope.value === void 0) {
						$scope.value = {};
					}

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
				var decimals = xml.documentElement.getAttribute('Decimals') || 'auto';
				schema.Percentage = percentage.toLowerCase() === 'true';
				schema.Decimals = parseInt(decimals);

				$scope.SPClientRequiredValidatorError = Strings.STS.L_SPClientRequiredValidatorError;
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
				if ($scope.schema.Percentage && value !== void 0) {
					// If decimals is set to 'Auto', use 2 decimals for percentage values.
					var decimals = isNaN($scope.schema.Decimals) ? 2 : $scope.schema.Decimals;
					return (value * 100).toFixed(decimals);
				} else {
					return value;
				}
			});


			ngModel.$parsers.push(function(value) {
				if ($scope.schema.Percentage && value !== void 0) {
					// If decimals is set to 'Auto', use 2 decimals for percentage values.
					var decimals = isNaN($scope.schema.Decimals) ? 2 : $scope.schema.Decimals;
					return (value / 100).toFixed(decimals);
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
				$scope.SPClientRequiredValidatorError = Strings.STS.L_SPClientRequiredValidatorError;

				

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
	SPFieldUrl - directive
	
	Pau Codina (pau.codina@kaldeera.com)
	Pedro Castro (pedro.castro@kaldeera.com, pedro.cm@gmail.com)

	Copyright (c) 2014
	Licensed under the MIT License
*/



///////////////////////////////////////
//	SPFieldUrl
///////////////////////////////////////

angular.module('ngSharePoint').directive('spfieldUrl', 

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
				$scope.UrlFieldTypeText = Strings.STS.L_UrlFieldTypeText;
				$scope.UrlFieldTypeDescription = Strings.STS.L_UrlFieldTypeDescription;
				$scope.UrlFieldClickText = Strings.STS.L_UrlFieldClickText;
				$scope.Description_Text = Strings.STS.L_Description_Text;
				$scope.SPClientRequiredValidatorError = Strings.STS.L_SPClientRequiredValidatorError;

				

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

					$http.get('templates/form-templates/spfield-url-' + mode + '.html', { cache: $templateCache }).success(function(html) {
						var newElement = $compile(html)($scope);
						$element.replaceWith(newElement);
						$element = newElement;
					});

				}

			} // link

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
				/*
				$scope.$watch(function() {

					// Adjust the model if no value is provided
					if (($scope.value === null || $scope.value === void 0) && $scope.schema.AllowMultipleValues) {
						$scope.value = { results: [] };
					}

					return { mode: $scope.mode || controllers[0].getFormMode(), value: ($scope.schema.AllowMultipleValues ? $scope.value.results : $scope.value) };

				}, function(newValue, oldValue) {

					$scope.currentMode = newValue.mode;

					// Show loading animation.
					setElementHTML('<div><img src="/_layouts/15/images/loadingcirclests16.gif" alt="" /></div>');

					// Initialize the 'selectedUserItems' array if the value was changed.
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
				*/



				// ****************************************************************************
				// Watch for form mode changes.
				//
				$scope.$watch(function() {

					return $scope.mode || controllers[0].getFormMode();

				}, function(newValue, oldValue) {

					if ($scope.currentMode === newValue) return;

					$scope.currentMode = newValue;
					refreshData();

				});



				// ****************************************************************************
				// Watch for value (model) changes.
				//
				$scope.$watch('value', function(newValue, oldValue) {

					if (newValue === oldValue) return;

					// Adjust the model if no value is provided
					if (($scope.value === null || $scope.value === void 0) && $scope.schema.AllowMultipleValues) {
						$scope.value = { results: [] };
					}

					$scope.selectedUserItems = void 0;
					refreshData();

				});



				// ****************************************************************************
				// Refresh the user data and render the field.
				//
				function refreshData() {

					// Adjust the model if no value is provided
					if (($scope.value === null || $scope.value === void 0) && $scope.schema.AllowMultipleValues) {
						$scope.value = { results: [] };
					}

					// Show loading animation.
					setElementHTML('<div><img src="/_layouts/15/images/loadingcirclests16.gif" alt="" /></div>');

					// Gets the data for the user (lookup) and then render the field.
					getUserData().then(function() {

						renderField($scope.currentMode);

					}, function() {

						setElementHTML('<div style="color: red;">Error al recuperar el usuario {{value}}.</div>');

					});
				}




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
									url: '',
									data: null
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

				    	if (user.data !== null) {

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

				    	}

				    });


				    // Render and initialize the picker.
				    // Pass the ID of the DOM element that contains the picker, an array of initial
				    // PickerEntity objects to set the picker value, and a schema that defines
				    // picker properties.
				    this.SPClientPeoplePicker_InitStandaloneControlWrapper(peoplePickerElementId, pickerEntities, schema);


				    
				    // Get the people picker object from the page.
				    var peoplePicker = this.SPClientPeoplePicker.SPClientPeoplePickerDict[peoplePickerElementId + '_TopSpan'];

				    if (peoplePicker !== void 0 && peoplePicker !== null) {

				    	// Get information about all users.
				    	//var users = peoplePicker.GetAllUserInfo();


				    	// Maps the needed callback functions...

				    	//peoplePicker.OnControlValidateClientScript = function(peoplePickerId, entitiesArray) {};

				    	//peoplePicker.OnValueChangedClientScript = function(peoplePickerId, entitiesArray) {};

				    	peoplePicker.OnUserResolvedClientScript = function(peoplePickerId, entitiesArray) {

				    		//console.log('OnUserResolvedClientScript', peoplePickerId, entitiesArray);

				    		if ($scope.schema.AllowMultipleValues === true) {

				    			$scope.value.results = [];

				    		} else {

				    			$scope.value = null;
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

				    		$scope.$apply();
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
			//replace: true,
			template: '<tr></tr>',

			compile: function(element, attrs) {

				return {
					
					pre: function($scope, $element, $attrs) {

						$http.get('templates/form-templates/spfield.html', { cache: $templateCache }).success(function(html) {

							var mode = ($attrs.mode ? 'mode="' + $attrs.mode + '"' : '');
							var dependsOn = ($attrs.dependsOn ? 'depends-on="' + $attrs.dependsOn + '"' : '');

							html = html.replace(/\{\{name\}\}/g, $attrs.spfield || $attrs.name)
									   .replace(/\{\{mode\}\}/g, mode)
									   .replace(/\{\{dependsOn\}\}/g, dependsOn);

							
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
			//scope: false,
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

							for(var i = clone.length - 1; i >= 0; i--) {
								var e = clone[i];
								$animate.enter(e, $element.parent(), $element);
							}
							
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

	['$compile', '$templateCache', '$http', 'SPUtils',

	function($compile, $templateCache, $http, SPUtils) {

		return {

			restrict: 'EA',
			require: '^spform',
			replace: true,
			templateUrl: 'templates/form-templates/spform-toolbar.html',


			link: function($scope, $element, $attrs, spformController) {


				$scope.isInDesignMode = SPUtils.inDesignMode();
				$scope.status = spformController.status;

				SPUtils.SharePointReady().then(function() {
					$scope.CloseButtonCaption = STSHtmlEncode(Strings.STS.L_CloseButtonCaption);
					$scope.SaveButtonCaption = STSHtmlEncode(Strings.STS.L_SaveButtonCaption);
					$scope.CancelButtonCaption = STSHtmlEncode(Strings.STS.L_CancelButtonCaption);
				});



				// ****************************************************************************
				// Watch for form mode changes.
				//
				$scope.$watch(spformController.getFormMode, function(newValue) {
					$scope.mode = newValue;
				});



				// ****************************************************************************
				// Watch for form status changes.
				//
				$scope.$watch(spformController.getFormStatus, function(newValue) {
					$scope.formStatus = newValue;
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

	['SPUtils', '$compile', '$templateCache', '$http', '$q',

	function(SPUtils, $compile, $templateCache, $http, $q) {

		return {
			restrict: 'EA',
			templateUrl: 'templates/form-templates/spform.html',
			transclude: true,
			replace: true,
			priority: 100,
			scope: {
				originalItem: '=item',
				onPreSave: '&',
				onPostSave: '&',
				onCancel: '&'
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

						// Set field default value.
						switch(fieldSchema.TypeAsString) {

							case 'MultiChoice':
								$scope.item[fieldName] = { results: [] };
								if (fieldSchema.DefaultValue !== null) {
									$scope.item[fieldName].results.push(fieldSchema.DefaultValue);
								}
								break;

							case 'DateTime':
								if (fieldSchema.DefaultValue !== null) {
									$scope.item[fieldName] = new Date(); //-> [today]
									// TODO: Hay que controlar el resto de posibles valores por defecto.
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
	
					if (utils.isGuid(fieldName)) {

						var fieldSchema = void 0;

						angular.forEach($scope.schema, function(field) {
							if (field.Id == fieldName) {
								fieldSchema = field;
							}
						});

						return fieldSchema;

					} else {

						return $scope.schema[fieldName];
					}

				};


				this.fieldValueChanged = function(fieldName, fieldValue) {

					//console.log('>>>> spform.fieldValueChanged(' + fieldName + ', ' + fieldValue + ')');
					//console.log('-------------------------------------------------------------------------------');
					
					$scope.$broadcast(fieldName + '_changed', fieldValue);
				};


				this.getFormMode = function() {

					return $attrs.mode || 'display';
				};


				this.getWebRegionalSettings = function() {

					var def = $q.defer();

					if ($scope.item.list.web.RegionalSettings !== void 0) {
						def.resolve($scope.item.list.web.RegionalSettings);
					} else {
						$scope.item.list.web.getProperties().then(function() {
							def.resolve($scope.item.list.web.RegionalSettings);
						});
					}

					return def.promise;
				};


				this.getFormStatus = function() {
					return $scope.formStatus;
				};


				this.save = function(redirectUrl) {

					var self = this;

					$scope.formStatus = this.status.PROCESSING;

					// Shows the 'Working on it...' dialog.
					var dlg = SP.UI.ModalDialog.showWaitScreenWithNoClose(SP.Res.dialogLoading15);

					$q.when($scope.onPreSave({ item: $scope.item })).then(function(result) {

						if (result !== false) {

							$scope.item.save().then(function(data) {

								//angular.extend($scope.originalItem, data); //-> This launch $scope.originalItem $watch !!!
								$scope.formStatus = this.status.IDLE;

								$q.when($scope.onPostSave({ originalItem: $scope.originalItem, item: $scope.item })).then(function(result) {

									if (result !== false) {

										// TODO: Performs the 'post-save' action/s or redirect

										// Default 'post-save' action.
										self.closeForm(redirectUrl);

									}

									// Close the 'Working on it...' dialog.
									dlg.close();
									
								}, function() {

									dlg.close();
									$scope.formStatus = this.status.IDLE;
									
								});

							}, function(err) {

								console.error(err);

								dlg.close();

								var dom = document.createElement('div');
								dom.innerHTML = '<div style="color:brown">' + err.code + '<br/><strong>' + err.message + '</strong></div>';


								SP.UI.ModalDialog.showModalDialog({
									title: SP.Res.dlgTitleError,
									html: dom,
									showClose: true,
									autoSize: true,
									dialogReturnValueCallback: function() {
										$scope.formStatus = self.status.IDLE;
										$scope.$apply();
									}
								});

							});

						} else {

							console.log('>>>> Save form was canceled!');
							dlg.close();
							$scope.formStatus = this.status.IDLE;
						}
						
					}, function() {

						dlg.close();
						$scope.formStatus = this.status.IDLE;

					});
						

				};


				this.cancel = function(redirectUrl) {

					$scope.item = angular.copy($scope.originalItem);

					if ($scope.onCancel({ item: $scope.item }) !== false) {

						// Performs the default 'cancel' action.
						this.closeForm(redirectUrl);

					}
				};



				this.closeForm = function(redirectUrl) {

					if (redirectUrl !== void 0) {

						window.location = redirectUrl;

					} else {
						
						window.location = utils.getQueryStringParamByName('Source') || _spPageContextInfo.webServerRelativeUrl;

					}

				};

			}],



			compile: function(element, attrs, transclude) {

				return {

					pre: function($scope, $element, $attrs, spformController) {

						$scope.isInDesignMode = SPUtils.inDesignMode();
						
						if ($scope.isInDesignMode) return;


						// Watch for form mode changes
						$scope.$watch(function() {

							return spformController.getFormMode();

						}, function(newMode) {

							$scope.mode = newMode;

							if ($scope.item !== void 0) {

								$scope.item.list.getFields().then(function(fields) {

									$scope.schema = fields;
									$scope.loadItemTemplate();

								});

							}
						});


						// Watch for item changes
						$scope.$watch('originalItem', function(newValue) {

							// Checks if the item has a value
							if (newValue === void 0) return;

							$scope.item = angular.copy(newValue);
							$scope.item.clean();

							$scope.item.list.getFields().then(function(fields) {

								// NOTE: We need to get list properties to know if the list has 
								//		 ContentTypesEnabled and, if so, get the schema from the
								//		 ContentType instead.
								//		 Also we need to know which is the default ContentType
								//		 to get the correct schema (I don't know how).
								//
								//		 If the above is not done, field properties like 'Required' will have incorrect data.

								$scope.schema = fields;
								$scope.loadItemTemplate();

							});

						}, true);



						$scope.loadItemTemplate = function() {
							
							$scope.formStatus = spformController.status.PROCESSING;

							
							var loadingAnimation = document.querySelector('#form-loading-animation-wrapper-' + $scope.$id);
							if (loadingAnimation !== void 0) angular.element(loadingAnimation).remove();


							if ($attrs.templateUrl) {

								$http.get($attrs.templateUrl, { cache: $templateCache }).success(function (html) {

									$element.html('');
									parseRules($element, angular.element(html), false);
									$compile($element)($scope);
									$scope.formStatus = spformController.status.IDLE;

								});

							} else {

								var elements = $element.find('*');
								var transcludeFields = 'transclude-fields';
								var elementToTransclude;

								angular.forEach(elements, function(elem) {
									if (elem.attributes[transcludeFields] !== void 0) {
										elementToTransclude = angular.element(elem);
									}
								});

								if (elementToTransclude === void 0) {
									elementToTransclude = $element;
								}

								elementToTransclude.empty();

								transclude($scope, function (clone) {
									parseRules(elementToTransclude, clone, true);
								});


								// If no template-url attribute was provided generate a default form template
								if (elementToTransclude[0].children.length === 0) {

									$scope.fields = [];

									angular.forEach($scope.item.list.Fields, function(field) {
										if (!field.Hidden && !field.Sealed && !field.ReadOnlyField && field.InternalName !== 'ContentType') {
											$scope.fields.push(field);
										}
									});

									$http.get('templates/form-templates/spform-default.html', { cache: $templateCache }).success(function (html) {

										elementToTransclude.html('').append(html);
										$compile(elementToTransclude)($scope);
										$scope.formStatus = spformController.status.IDLE;

									});

								}
								
							}
							
						};


						function parseRules(targetElement, sourceElements, isTransclude) {

							var terminalRuleAdded = false;

							// Initialize the 'rulesApplied' array for debug purposes.
							$scope.rulesApplied = [];

							angular.forEach(sourceElements, function (elem) {

								// Check if 'elem' is a <spform-rule> element.
								if (elem.tagName !== void 0 && elem.tagName.toLowerCase() == 'spform-rule' && elem.attributes.test !== undefined) {

									var testExpression = elem.attributes.test.value;

									// Evaluates the test expression if no 'terminal' attribute was detected in a previous valid rule.
									if (!terminalRuleAdded && $scope.$eval(testExpression)) {

										targetElement.append(elem);
										var terminalExpression = false;

										if (elem.attributes.terminal !== void 0) {

											terminalExpression = elem.attributes.terminal.value;
											terminalRuleAdded = $scope.$eval(terminalExpression);

										}

										// Add the rule applied to the 'rulesApplied' array for debug purposes.
										$scope.rulesApplied.push({ test: testExpression, terminal: terminalExpression });

									} else if (isTransclude) {

										elem.remove();
										elem = null;
									}
									
								} else {

									targetElement.append(elem);
								}
							});

						}

					}
					
				};

			}

		};
	}

]);
/*
	SPUser - directive
	
	Pau Codina (pau.codina@kaldeera.com)
	Pedro Castro (pedro.castro@kaldeera.com, pedro.cm@gmail.com)

	Copyright (c) 2014
	Licensed under the MIT License
*/



/////////////////////////////////////////////////////////////////////////////
//	SPUser
//	This directive adds specific user information to then current context
/////////////////////////////////////////////////////////////////////////////

angular.module('ngSharePoint')

.directive('spuser', ['SharePoint', function(SharePoint) {

	return {

		restrict: 'A',
		replace: false,
		scope: {
			UserData: '=spuser'
		},

		link: function($scope, $element, $attrs) {

			SharePoint.getCurrentWeb().then(function(web) {

				$scope.currentWeb = web;

				if ($element[0].attributes['user-id'] === void 0) {

					// current user
					$scope.currentWeb.getCurrentUser().then(function(user) {

						$scope.UserData = user;
					});

				} else {

					// Have userId attribute with the specified userId or LoginName
					$scope.$watch(function() {
						return $scope.$eval($attrs.userId);
					}, function(newValue) {

						if (newValue === void 0) return;

						$scope.currentWeb.getUserById(newValue).then(function(user) {

							$scope.UserData = user;
						});

					});

				}
			});

		}
	};
	
}]);
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

        return $sce.trustAsHtml((text || '').replace(/\n/g, '<br/>'));
    };

}]);
/*
	newlines - filter
	
	Pau Codina (pau.codina@kaldeera.com)
	Pedro Castro (pedro.castro@kaldeera.com, pedro.cm@gmail.com)

	Copyright (c) 2014
	Licensed under the MIT License
*/

angular.module('ngSharePoint')

.filter('unsafe', ['$sce', function($sce) {
    return function(val) {
        return $sce.trustAsHtml(val);
    };
}]);
angular.module('ngSharePointFormPage', ['ngSharePoint']);


angular.module('ngSharePointFormPage').directive('spformpage', ['SharePoint', 'SPUtils', function(SharePoint, SPUtils) {
	
	return {

		restrict: 'EA',

		link: function($scope, $element, $attrs) {

			var listId = _spPageContextInfo.pageListId;
			var itemId = utils.getQueryStringParamByName('ID');

			if (listId !== void 0 && itemId !== void 0) {

				SharePoint.getWeb().then(function(web) {
					web.getList(listId).then(function(list) {

						list.getItemById(itemId).then(function(item) {

							$scope.item = item;

						}, function(error) {
							console.log('Error item', error);
						});

					}, function(error) {
						console.log('Error list', error);
					});

				}, function(error) {
					console.log('Error web', error);
				});

/*
					.then(function(list) { return list.getItemById(itemId); })
					.then(function(item) {
						$scope.item = item;
					})
					.fail(function(err) {
						console.log('ERROR!', err);
					});
*/					
			}


			$scope.onPreSave = function(item) {
				console.log('>>>> onPreSave', item);
			};


			$scope.onPostSave = function(item) {
				console.log('>>>> onPostSave', item);
			};


			$scope.onCancel = function(item) {
				console.log('>>>> onCancel', item);
			};

		}

	};

}]);




var element = document.querySelector('[data-spformpage]');

if (element) {
	angular.bootstrap(element, ['ngSharePointFormPage']);
}