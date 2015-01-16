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

		return guidRegExp.test((value || '').trim().ltrim('{').rtrim('}'));

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

		//console.error(errObj.message, errObj);

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
		
		// If a new REQUESTDIGEST value was received in the last server call,
		// update the __REQUESTDIGEST form control with the new value.
		if (response.headers['X-REQUESTDIGEST']) {

			var requestDigest = document.getElementById('__REQUESTDIGEST');
			if (requestDigest !== null) {
				requestDigest.value = response.headers['X-REQUESTDIGEST'];
			}
		}

		return d;
	},



    // ****************************************************************************
    // cleanDeferredProperties
    //
    // Cleans undesirable object properties obtained form SharePoint.
    //
    // @returns: {SPListItem} The item itself to allow chaining calls.
    //
    cleanDeferredProperties: function(spobject) {

        var obj = spobject;

        angular.forEach(spobject, function(value, key) {

            if (typeof value === 'object' && value !== null && key !== '__parent') {

                if (value.__deferred) {

                    delete obj[key];

                } else {

                	utils.cleanDeferredProperties(value);

                }
            }

        });
    },



	// ***************************************************************************
	// getFunctionParameterNames
	//
	// Returns an array with the names of the parameters of a function.
	//
	// @func: {function} The function name without the parenthesis.
	// @returns: {Array[{String}]} The names of the parameters.
	//
	getFunctionParameterNames: function(func) {

		var STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;
		var ARGUMENT_NAMES = /([^\s,]+)/g;

		var fnStr = func.toString().replace(STRIP_COMMENTS, '');
		var result = fnStr.slice(fnStr.indexOf('(') + 1, fnStr.indexOf(')')).match(ARGUMENT_NAMES);

		return result || [];
	},


	extendDeep: function(dest) {

	    angular.forEach(arguments, function(obj) {

	        if (obj !== dest) {

	            angular.forEach(obj, function(value, key) {

	                if (dest[key] && angular.isObject(dest[key])) {

	                    utils.extendDeep(dest[key], value);

	                } else if(!angular.isFunction(dest[key])) {

	                    dest[key] = angular.copy(value);

	                }

	            });

	        }

	    });


	    return dest;

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




angular.module('ngSharePoint').config(['$compileProvider', function($compileProvider) {

	// Reconfigure the RegExp for aHrefSanitizationWhiteList to accept 'javascript'.
	$compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|file|javascript):/);
	/* NOTE: The previous statement is for angular versions 1.2.8 and above.
	 *		 For version 1.0.5 or 1.1.3 please use the next statement:
	 *
	 *				$compileProvider.urlSanitizationWhitelist(/^\s*(https?|ftp|mailto|file|javascript):/);
	 *
	 */

}]);




// ****************************************************************************
// Module constants
//
angular.module('ngSharePoint').value('Constants', {
	errorTemplate: 'templates/error.html',
	userProfileUrl: '_layouts/userdisp.aspx?ID='
});

/*
	SharePoint - provider
	
	Pau Codina (pau.codina@kaldeera.com)
	Pedro Castro (pedro.castro@kaldeera.com, pedro.cm@gmail.com)

	Copyright (c) 2014
	Licensed under the MIT License
*/



///////////////////////////////////////
//	SharePoint
///////////////////////////////////////

angular.module('ngSharePoint').provider('SharePoint', 

	[

	function SharePoint_Provider() {

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

	}
]);

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

	function SPCache_Factory($q, $cacheFactory) {

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

/*
    SPContentType - factory
    
    Pau Codina (pau.codina@kaldeera.com)
    Pedro Castro (pedro.castro@kaldeera.com, pedro.cm@gmail.com)

    Copyright (c) 2014
    Licensed under the MIT License
*/



///////////////////////////////////////
//  SPList
///////////////////////////////////////

angular.module('ngSharePoint').factory('SPContentType', 

    ['$q', 'SPCache', 'SPFolder', 'SPListItem', 

    function SPContentType_Factory($q, SPCache, SPFolder, SPListItem) {

        'use strict';


        // ****************************************************************************
        // SPContentType constructor
        //
        // @parentObject: The object instance of the content type parent.
        // @id: Name or Guid of the content type you want to instantiate.
        // @data: Properties 
        //
        var SPContentTypeObj = function(parentObject, id, contentTypeProperties) {

            if (parentObject === void 0) {
                throw '@parentObject parameter not specified in SPContentType constructor.';
            }

            if (id === void 0) {
                throw '@id parameter not specified in SPContentType constructor.';
            }


            // Sets the content type 'id'.
            this.id = id;

            // Sets the content type parent object
            this.__parent = parentObject;

            // Initializes the SharePoint API REST url for the ContentType.
            this.apiUrl = this.__parent.apiUrl + '/ContentTypes(\'' + this.id + '\')';

            // Gets the content type fields (Schema) from the cache if exists.
            this.Fields = SPCache.getCacheValue('SPContentTypeFieldsCache', this.apiUrl);

            // Init the content type properties (if exists)
            if (contentTypeProperties !== void 0) {
                utils.cleanDeferredProperties(contentTypeProperties);
                angular.extend(this, contentTypeProperties);
            }
        };




        // ****************************************************************************
        // getFields
        //
        // Gets content type fields
        //
        // @returns: Promise with the result of the REST query.
        //
        SPContentTypeObj.prototype.getFields = function() {

            var self = this;
            var def = $q.defer();

            if (this.Fields !== void 0) {

                def.resolve(this.Fields);

            } else {

                var executor = new SP.RequestExecutor('/');

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
                        SPCache.setCacheValue('SPContentTypeFieldsCache', self.apiUrl, fields);

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



        SPContentTypeObj.prototype.setJSLink = function(jsLinkUrl) {

            var self = this;
            var deferred = $q.defer();

            var ctx = SP.ClientContext.get_current();
            var web = ctx.get_web();
            var list = web.get_lists().getByTitle(self.__parent.Title);
            var contentTypes = list.get_contentTypes();
            var ct = contentTypes.getById(self.id);

            ct.set_jsLink(jsLinkUrl);
            ct.update();

            ctx.executeQueryAsync(function() {

                deferred.resolve(ct);

            }, function(sender, args) {

                deferred.reject({ sender: sender, args: args });

            });


            return deferred.promise;

        }; // setJSLink



        SPContentTypeObj.prototype.getJSLink = function() {

            var self = this;
            var def = $q.defer();
            var executor = new SP.RequestExecutor('/');

            executor.executeAsync({

                url: self.apiUrl + "/jsLink",
                method: "GET",
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


            return def.promise;

        }; // getJSLink



        // Returns the SPContentTypeObj class
        return SPContentTypeObj;

    }
]);

/*
    SPExpressionResolver - service
    
    Pau Codina (pau.codina@kaldeera.com)
    Pedro Castro (pedro.castro@kaldeera.com, pedro.cm@gmail.com)

    Copyright (c) 2014
    Licensed under the MIT License
*/



///////////////////////////////////////
//  SPExpressionResolver
///////////////////////////////////////

angular.module('ngSharePoint').service('SPExpressionResolver', 

    ['$q', 'SharePoint', '$parse',

    function SPExpressionResolver_Factory($q, SharePoint, $parse) {

        'use strict';


        //var OLD_EXPRESSION_REGEXP = /{\b([\w+( |.)]*|[\[\w+\]]*)}/g;
        var EXPRESSION_REGEXP = /{(\w+\W*[\w\s./\[\]\(\)]+)}(?!})/g; //-> Faster but less accurate
        //var EXPRESSION_REGEXP = /{(\w+?(?:[.\/\[](?! )[\w \]]*?)+?)}(?!})/g; //-> More accurate but slower
        var PARTS_REGEXP = /[\[./]([\w )]+)/g;


        // ****************************************************************************
        // Private methods
        //

        function resolveExpression(expressionsArray, scope, index, deferred) {

            index = index || 0;
            deferred = deferred || $q.defer();

            var expression = expressionsArray[index++];

            if (expression === void 0) {

                deferred.resolve();
                return deferred.promise;
            }


            // Extract the expression type.
            var expressionType = expression.substring(0, expression.indexOf(/\W/.exec(expression)));
            var expressionPromise;

            switch (expressionType) {

                case 'param':
                    var paramName = getExpressionParts(expression)[0];
                    expressionPromise = utils.getQueryStringParamByName(paramName);
                    break;

                case 'item':
                    expressionPromise = resolveItemExpression(expression, scope);
                    break;

                case 'currentUser':
                    expressionPromise = resolveCurrentUserExpression(expression);
                    break;

                case 'fn':
                    var functionExpression = /\W(.*)/.exec(expression)[1];
                    expressionPromise = resolveFunctionExpression(functionExpression, scope);
                    break;
            }


            // Resolve/Reject the current expression promise
            $q.when(expressionPromise).then(function(result) {

                // Sets the resolved value for the current expression
                expressionsArray[index - 1] = result;

                // Resolve next expression
                resolveExpression(expressionsArray, scope, index, deferred);

            }, function(result) {

                // Even with a promise rejection, sets the result in the current expression
                expressionsArray[index - 1] = result;
                
                // Resolve next expression
                resolveExpression(expressionsArray, scope, index, deferred);

            });


            return deferred.promise;
        }



        function getExpressionParts(text) {

            var matches = [];
            var match;

            while ((match = PARTS_REGEXP.exec(text))) {

                match.shift();
                matches.push(match.join(''));
            }

            return matches;
        }



        function resolveItemExpression(expression, scope) {

            var queryParts = getExpressionParts(expression);

            return scope.item.list.getItemQueryById(scope.item.Id, queryParts.join('/')).then(function(data) {

                return data[queryParts[queryParts.length - 1]];
        
            }, function() {

                return undefined;
            });
            
        }



        function resolveCurrentUserExpression(expression) {

            return SharePoint.getCurrentWeb().then(function(web) {
            
                return web.getList('UserInfoList').then(function(list) {

                    var queryParts = getExpressionParts(expression);

                    return list.getItemQueryById(_spPageContextInfo.userId, queryParts.join('/')).then(function(data) {

                        return data[queryParts[queryParts.length - 1]];

                    }, function() {

                        return undefined;
                    });
                });
            });
        }



        function resolveFunctionExpression(functionExpression, scope) {

            return scope.$eval($parse(functionExpression));

        }



        // ****************************************************************************
        // Public methods (Service API)
        //

        this.resolve = function(text, scope) {

            var deferred = $q.defer();
            var expressionsArray = [];

            // Use 'replace' function to extract the expressions and replace them for {e:1} to {e:n}.
            text = text.replace(EXPRESSION_REGEXP, function(match, p1, offset, originalText) {

                // Check if the expression is already added.
                // This way resolves the expression only once and replaces it in all places 
                // where appears in the text.
                var pos = expressionsArray.indexOf(p1);

                if (pos == -1) {
                    expressionsArray.push(p1);
                    pos = expressionsArray.length - 1;
                }

                return '{e:' + pos + '}';

            });


            // Resolve the 'expressionsArray' with promises
            resolveExpression(expressionsArray, scope).then(function() {

                // Replace {e:1} to {e:n} in the 'text' with the corresponding resolved expressions values.
                for (var i = 0; i < expressionsArray.length; i++) {
                    text = text.replace(new RegExp('{e:' + i + '}', 'g'), expressionsArray[i]);
                }

                // Resolve the main promise
                deferred.resolve(text);

            });


            return deferred.promise;

        }; // resolve method

    } // SPExpressionResolver factory

]);

/*
    SPFieldDirective - Service
    
    Pau Codina (pau.codina@kaldeera.com)
    Pedro Castro (pedro.castro@kaldeera.com, pedro.cm@gmail.com)

    Copyright (c) 2014
    Licensed under the MIT License
*/



///////////////////////////////////////
//  SPFieldDirective
///////////////////////////////////////

angular.module('ngSharePoint').service('SPFieldDirective', 

    ['$compile', '$http', '$templateCache', '$q',

    function SPFieldDirective_Factory($compile, $http, $templateCache, $q) {

        // ****************************************************************************
        // Private functions
        //

        function defaultOnValidateFn() {

            // NOTE: Executed in the directive's '$scope' context (i.e.: this === $scope).

            // Update the model property '$viewValue' to change the model state to $dirty and
            // force to run $parsers, which include validators.
            this.modelCtrl.$setViewValue(this.modelCtrl.$viewValue || null);
        }


        function defaultWatchValueFn(newValue, oldValue) {

            // NOTE: Executed in the directive $scope context.

            if (newValue === oldValue) return;

            // Update the model property '$viewValue' when the model value changes.
            this.modelCtrl.$setViewValue(newValue);
        }




        // ****************************************************************************
        // Public API
        //

        /*
         * baseLinkFn
         * ----------------------------------------------------------------------------
         *
         * Serves as the base 'link' function to all 'spfield-xxx' directives.
         *
         * The 'this' word in this function is the directive object defined in the
         * 'spfield-xxx' directive. See the definition of the 'directive object' below.
         * 
         * Example of use in a directive 'post-link' function:
         *
         *      // Define the 'directive' object
         *
         *      var directiveObj = {
         *          fieldTypeName: 'text',
         *          replaceAll: false,
         *          init: function() {
         *              $scope.SomeText = 'My directive';
         *          
         *              // Call some private function
         *              MyPrivateFunction();
         *          }
         *      };
         *
         *      // Apply the directive definition object to the 'baseLinkFn'.
         *      // Pass 'post-link' function arguments as arguments to the 'baseLinkFn'.
         *      // The 'directive object' becomes the execution context of the 'baseLinkFn'.
         *      // (Becomes the 'this' word within the 'baseLinkFn' function).
         *
         *      SPFieldDirective.baseLinkFn.apply(directiveObj, arguments);
         *      
         *
         * 'directiveObj' definition:
         *
         *        Required properties:
         *        --------------------
         *
         *              fieldTypeName: The type name of the directive to load the 
         *                             correct directive template.
         *
         *              
         *        Optional properties/functions:
         *        ------------------------------
         *
         *              replaceAll: If set to true, the 'renderField' function will replace 
         *                          the entire element instead its contents.
         *
         *              displayTemplateUrl: Custom field template for display rendering.
         *
         *              editTemplateUrl: Custom field template for edit rendering.
         *
         *              init (function): An initialization function for the directive.
         *
         *              parserFn (function): If defined, add this parser function to the 
         *              (view to model)      model controller '$parsers' array.
         *                                   Used to sanitize/convert the value as well as 
         *                                   validation.
         *                                   Working examples are in the 'spfieldMultichoice' 
         *                                   or 'spfieldLookupmulti' directives.
         *
         *              formatterFn (function): If defined, add this formatter function to the 
         *              (model to view)         model controller '$formatters' array.
         *                                      Used to format/convert values for display in the 
         *                                      control and validation.
         *
         *              watchModeFn (function): If defined, replace the default behavior in the 
         *                                      'Watch for form mode changes' function.
         *                                      The default behavior is to call the 'renderField' 
         *                                      function.
         *                          
         *              watchValueFn (function): If defined, applies it after the default behavior 
         *                                       in the 'Watch for field value changes' function.
         *
         *              onValidateFn (function): If defined, applies it after the default behavior 
         *                                       in the '$scope.$on('validate', ...)' function.
         *
         *              postRenderFn (function): If defined, will be executed after the default
         *                                       render action (setElementHtml).
         */
        this.baseLinkFn = function($scope, $element, $attrs, controllers) {

            // Directive definition object from 'spfield-xxx' directive.
            var directive = this;

            // Initialize some $scope properties.
            $scope.formCtrl = controllers[0];
            $scope.modelCtrl = controllers[1];
            $scope.name = $attrs.name;
            $scope.schema = $scope.formCtrl.getFieldSchema($attrs.name);
            $scope.item = $scope.formCtrl.getItem(); // Needed?


            // Apply the directive initializacion if specified.
            if (angular.isFunction(directive.init)) directive.init();


            // Apply the directive parser function if specified.
            if (angular.isFunction(directive.parserFn)) $scope.modelCtrl.$parsers.unshift(directive.parserFn);


            // Apply the directive formatter function if specified.
            if (angular.isFunction(directive.formatterFn)) $scope.modelCtrl.$formatters.unshift(directive.formatterFn);



            // ****************************************************************************
            // Replaces the directive element HTML.
            //
            directive.setElementHTML = function(html) {

                if (directive.replaceAll === true) {

                    var newElement = $compile(html)($scope);
                    $element.replaceWith(newElement);
                    $element = newElement;

                } else {

                    $element.html(html);
                    $compile($element)($scope);
                }
            };



            // ****************************************************************************
            // Gets the field rendering template.
            //
            directive.getFieldTemplate = function() {

                var deferred = $q.defer();
                var templateUrl = 'templates/form-templates/spfield-' + directive.fieldTypeName + '-' + $scope.currentMode + '.html';

                if ($scope.currentMode === 'display' && directive.displayTemplateUrl) templateUrl = directive.displayTemplateUrl;
                if ($scope.currentMode === 'edit' && directive.editTemplateUrl) templateUrl = directive.editTemplateUrl;


                $http.get(templateUrl, { cache: $templateCache }).success(function(html) {

                    // Checks if the field has an 'extended template'.
                    // The 'extended template' is defined in the field 'extended schema'.
                    //
                    // Extended template definition (Apply for display and edit modes):
                    //
                    // extendedTemplate: {
                    //     html: A string that contains the HTML.
                    //     url: Url to the template that contains the HTML. This overwrites 'html' property
                    //     replaceOnDisplay: true or false that indicates if the template will replace the 
                    //                       default field template on 'display' mode.
                    //     replaceOnEdit: true or false that indicates if the template will replace the default 
                    //                    field template on 'edit' mode.
                    //     replace: true or false that indicates if the template will replace the default field
                    //              template on both form modes (display and edit).
                    //              This have precedence over 'replaceOnEdit' and 'replaceOnDisplay'
                    //              properties.
                    // }
                    //
                    // or
                    //
                    // extendedTemplate: {
                    //     display|edit: {
                    //         html: String
                    //         url: String
                    //         replace: Boolean
                    //     }   
                    // }
                    //


                    if (angular.isDefined($scope.schema.extendedTemplate)) {

                        var finalHtml = html;
                        var templateEx = $scope.schema.extendedTemplate;

                        // Checks if there are defined and explicit mode extended template.
                        if (angular.isDefined(templateEx[$scope.currentMode])) {

                            templateEx = templateEx[$scope.currentMode];

                        }

                        var replace = (
                            ($scope.currentMode === 'display' && templateEx.replaceOnDisplay === true) || 
                            ($scope.currentMode === 'edit' && templateEx.replaceOnEdit === true) ||
                            templateEx.replace === true
                        );

                        if (angular.isDefined(templateEx.url)) {

                            $http.get(templateEx.url, { cache: $templateCache }).success(function(htmlEx) {

                                finalHtml = replace ? htmlEx : html + htmlEx;
                                deferred.resolve(finalHtml);

                            });

                        } else if (angular.isDefined(templateEx.html)) {
                            
                            finalHtml = replace ? templateEx.html : html + templateEx.html;
                            deferred.resolve(finalHtml);

                        } else {

                            // The properties 'url' or 'html' not found.
                            deferred.resolve(finalHtml);

                        }

                    } else {

                        deferred.resolve(html);

                    }

                });
                

                return deferred.promise;

            };




            // ****************************************************************************
            // Renders the field with the correct layout based on the field/form mode.
            //
            directive.renderField = function() {

                directive.getFieldTemplate().then(function(html) {
                        
                    directive.setElementHTML(html);
                    if (angular.isFunction(directive.postRenderFn)) directive.postRenderFn.apply(directive, arguments);

                });

            };



            // ****************************************************************************
            // Sets the field validity only when in 'edit' mode.
            //
            // @validator: String with the validator name.
            // @isValid: Boolean value indicating if the validator is valid or not.
            //
            // IMPORTANT: Use this function in custom 'parserFn' to set field validities instead
            //            to call directly to '$scope.modelCtrl.$setValidity' method.
            //
            directive.setValidity = function(validator, isValid) {

                if ($scope.currentMode === 'edit') {

                    $scope.modelCtrl.$setValidity(validator, isValid);
                }
            };



            // ****************************************************************************
            // Watch for form mode changes.
            //
            $scope.$watch(function() {

                return $scope.mode || $scope.formCtrl.getFormMode();

            }, function(newValue, oldValue) {

                // Sets field current mode
                $scope.currentMode = newValue;
                
                // Renders the field or apply the specific field type function
                if (angular.isFunction(directive.watchModeFn)) {

                    directive.watchModeFn.apply(directive, arguments);

                } else {

                    directive.renderField();
                }
            });



            // ****************************************************************************
            // Watch for field value changes.
            //
            $scope.$watch('value', function(newValue, oldValue) {

                defaultWatchValueFn.apply($scope, arguments);
                if (angular.isFunction(directive.watchValueFn)) directive.watchValueFn.apply(directive, arguments);

            }, true);



            // ****************************************************************************
            // Validate the field.
            //
            $scope.unregisterValidateFn = $scope.$on('validate', function() {

                defaultOnValidateFn.apply($scope, arguments);
                if (angular.isFunction(directive.onValidateFn)) directive.onValidateFn.apply(directive, arguments);
            });


        }; // baseLinkFn

    } // SPFieldDirective factory

]);

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

	function SPGroup_Factory($q, SPCache, SPUser) {

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
				utils.cleanDeferredProperties(groupProperties);
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
//  SPList
///////////////////////////////////////

angular.module('ngSharePoint').factory('SPList', 

    ['$q', 'SPCache', 'SPFolder', 'SPListItem', 'SPContentType', 

    function SPList_Factory($q, SPCache, SPFolder, SPListItem, SPContentType) {

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
                utils.cleanDeferredProperties(listProperties);
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
                    utils.cleanDeferredProperties(d);

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
        // updateProperties
        //
        // Updates the list properties
        //
        // @properties: Object with the properties to update.
        // @returns: Promise with the result of the REST query.
        //
        SPListObj.prototype.updateProperties = function(properties) {

            var self = this;
            var def = $q.defer();
            var executor = new SP.RequestExecutor(self.web.url);

            var body = {
                __metadata: {
                    type: 'SP.List'
                }
            };

            // Sets the properties to update
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
            // Remote apps that use OAuth can get the form digest value from the http://<site url>/_api/contextinfo endpoint.
            // SharePoint-hosted apps can get the value from the #__REQUESTDIGEST page control if it's available on the SharePoint page.

            if (requestDigest !== null) {
                headers['X-RequestDigest'] = requestDigest.value;
            }


            // Make the call.
            // ----------------------------------------------------------------------------
            executor.executeAsync({

                url: self.apiUrl,
                method: 'POST',
                body: angular.toJson(body),
                headers: headers,

                success: function(data) {

                    var d = utils.parseSPResponse(data);

                    angular.extend(self, properties);

                    def.resolve(properties);

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

        }; // updateProperties




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
        // getContentTypes
        //
        // Gets the list content types
        //
        // @returns: Promise with the result of the REST query.
        //
        SPListObj.prototype.getContentTypes = function() {

            var self = this;
            var def = $q.defer();
            var executor = new SP.RequestExecutor(self.web.url);

            // We don't cache the content types due to that the user can 
            // change its order (the default content type) anytime.

            executor.executeAsync({

                url: self.apiUrl + '/ContentTypes',
                method: 'GET',
                headers: {
                    "Accept": "application/json; odata=verbose"
                },

                success: function(data) {

                    var d = utils.parseSPResponse(data);
                    var contentTypes = [];

                    angular.forEach(d, function(contentType) {

                        contentTypes.push(new SPContentType(self, contentType.StringId, contentType));

                    });

                    self.ContentTypes = contentTypes;

                    def.resolve(contentTypes);

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

        }; // getContentTypes




        // ****************************************************************************
        // getContentType
        //
        // Gets a list content type by its ID.
        //
        // @contentTypeId: The ID of the content type to retrieve.
        // @returns: Promise with the result of the REST query.
        //
        SPListObj.prototype.getContentType = function(contentTypeId) {

            var self = this;
            var def = $q.defer();

            self.getContentTypes().then(function() {

                var contentType = self.ContentTypes[0]; //-> Default content type

                angular.forEach(self.ContentTypes, function(ct) {

                    if (ct.Id === contentTypeId) {

                        contentType = ct;

                    }

                });


                def.resolve(contentType);

            });


            return def.promise;

        }; // getContentType




        // ****************************************************************************
        // getSchema
        //
        // Gets list content type fields
        //
        // @returns: Promise with the result of the REST query.
        //
        SPListObj.prototype.getSchema = function(contentTypeId) {

            return this.getContentType().then(function(defaultContentType) {

                return defaultContentType.getFields();

            });

        }; // getSchema



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
                        this.RootFolder.List = self;

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

        }; // getRootFolder



        // ****************************************************************************
        // getListItems
        //
        // Gets the list items
        //
        // @query: An object with REST query options.
        //         References:
        //              http://msdn.microsoft.com/en-us/library/office/fp142385(v=office.15).aspx
        //              http://msdn.microsoft.com/en-us/library/office/dn292552(v=office.15).aspx
        //              http://msdn.microsoft.com/en-us/library/office/dn292553(v=office.15).aspx
        // @returns: Promise with the result of the REST query.
        //
        SPListObj.prototype.getListItems = function(query, resetPagination) {

            var self = this;
            var def = $q.defer();
            var executor = new SP.RequestExecutor(self.web.url);
            var defaultExpandProperties = 'ContentType, File, File/ParentFolder, Folder, Folder/ParentFolder';
            var urlParams = '';

            if (this.$skiptoken !== void 0 && !resetPagination) {

                urlParams = '?' + this.$skiptoken;

            } else {

                if (query) {
                    query.$expand = defaultExpandProperties + (query.$expand ? ', ' + query.$expand : '');
                } else {
                    query = { 
                        $expand: defaultExpandProperties
                    };
                }

                urlParams = utils.parseQuery(query);
            }

            executor.executeAsync({

                url: self.apiUrl + '/Items' + urlParams,
                method: 'GET', 
                headers: { 
                    "Accept": "application/json; odata=verbose"
                }, 

                success: function(data) {
                    var d = utils.parseSPResponse(data);
                    var items = [];

                    angular.forEach(d, function(item) {
                        var spListItem = new SPListItem(self, item);
                        items.push(spListItem);
                    });

                    // If pagination is present, save for futher function calls
                    if (data.statusCode != 204 && data.body) {

                        var responseBody = angular.fromJson(data.body || '{ "d": {} }').d;

                        if (responseBody.__next) {
                            self.$skiptoken = '$' + responseBody.__next.substring(responseBody.__next.indexOf('skiptoken'));
                        }
                    }

                    // Returns an array of initialized 'SPListItem' objects.
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
        //                    expand in the REST query.
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
        // getItemQueryById
        //
        // Gets an item property value from the list by item ID. 
        //
        // @id: {Counter} The id of the item.
        // @query: {String} The REST query after '.../getItemById(<id>)/'
        //         e.g. If query parameter equals to 'Author/Name'
        //              the final query will be '.../getItemById(<id>)/Author/Name'
        //              and will return the 'Name' of the 'Author' of the item.
        // @returns: Promise with the result of the REST query.
        //
        SPListObj.prototype.getItemQueryById = function(id, query) {

            var self = this;
            var def = $q.defer();
            var executor = new SP.RequestExecutor(self.web.url);

            executor.executeAsync({

                url: self.apiUrl + '/getItemById(' + id + ')/' + query.ltrim('/'),
                method: 'GET', 
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
//  SPListItem
///////////////////////////////////////

angular.module('ngSharePoint').factory('SPListItem', 

    ['$q', 'SPUtils', 

    function SPListItem_Factory($q, SPUtils) {

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
                throw 'Required @list parameter not specified in SPListItem constructor.';
            }


            this.list = list;


            if (data !== void 0) {

                if (typeof data === 'object' && data.concat === void 0) { //-> is object && not is array

                    utils.cleanDeferredProperties(data);
                    angular.extend(this, data);

                } else {

                    if (!isNaN(parseInt(data))) {

                        this.Id = data;

                    } else {

                        throw 'Incorrect @data parameter in SPListItem constructor.';
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

                    utils.cleanDeferredProperties(d);
                    angular.extend(self, d);

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

                    } else {

                        def.resolve(d);
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
                    utils.cleanDeferredProperties(d);
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
                    utils.cleanDeferredProperties(d);
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
                        utils.cleanDeferredProperties(d);
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

/*
    SPRibbon - factory
    
    Pau Codina (pau.codina@kaldeera.com)
    Pedro Castro (pedro.castro@kaldeera.com, pedro.cm@gmail.com)

    Copyright (c) 2014
    Licensed under the MIT License
*/



///////////////////////////////////////
//  SPRibbon
///////////////////////////////////////

(function() {
    
    'use strict';

    angular
        .module('ngSharePoint')
        .factory('SPRibbon', SPRibbon);


    SPRibbon.$inject = ['$q', '$timeout'];


    /* @ngInject */
    function SPRibbon($q, $timeout) {

        var pageManager, ribbon, commandDispatcher;
        var ribbonDeferred = $q.defer();
        var toolbarSequence = 1;
        var buttonSequence = 1;
        var ribbonReady = false;


        var spRibbonService = {

            ready                       : ready,
            refresh                     : refresh,
            addTab                      : addTab,
            getTab                      : getTab,
            getEditTab                  : getEditTab,
            getDefaultTab               : getDefaultTab,
            addGroupToTab               : addGroupToTab,
            addLayoutToGroup            : addLayoutToGroup,
            addSectionToLayout          : addSectionToLayout,
            addButtonToSection          : addButtonToSection,
            registerComponentCommands   : registerComponentCommands,
            unregisterComponentCommands : unregisterComponentCommands,
            getStructure                : getStructure,
            createToolbar               : createToolbar,
            addButtonToToolbar          : addButtonToToolbar,
            registerCommand             : registerCommand

        };


        return spRibbonService;



        ///////////////////////////////////////////////////////////////////////////////



        function onRibbonInited() {

            ribbon = pageManager.get_ribbon();
            commandDispatcher = pageManager.get_commandDispatcher();

            ribbonReady = true;
            
            ribbonDeferred.resolve();

        } // onRibbonInited



        function ready() {

            if (ribbonReady === true) {

                ribbonDeferred.resolve();

            }

            // Initialize ribbon
            SP.SOD.executeOrDelayUntilScriptLoaded(function () {

                pageManager = SP.Ribbon.PageManager.get_instance();

                // Adds a new event handler for the page manager 'RibbonInited' event.
                pageManager.add_ribbonInited(onRibbonInited);

                // Try to get the ribbon
                try {

                    ribbon = pageManager.get_ribbon();

                }
                catch (e) { }


                if (!ribbon) {

                    if (typeof (_ribbonStartInit) == "function") {

                        _ribbonStartInit(_ribbon.initialTabId, false, null);

                    }

                } else {

                    onRibbonInited();

                }

            }, "sp.ribbon.js");


            return ribbonDeferred.promise;

        } // ready



        function refresh() {

            ready().then(function() {

                ribbon.refresh();

            });

        } // refresh



        function addTab(id, title, description, commandId, hidden, contextualGroupId, cssClass) {

            var tab = new CUI.Tab(ribbon, id, title, description, commandId, hidden || false, contextualGroupId || '', cssClass || null);
            ribbon.addChild(tab);
            ribbon.refresh();

            return tab;

        } // addTab



        function getTab(id) {

            // Gets tab by id
            var tab = ribbon.getChild(id);

            if (tab === null) {

                // Gets tab by title
                tab = ribbon.getChildByTitle(id);

            }

            return tab;

        } // getTab



        function getEditTab() {

            var editTab = ribbon.getChild('Ribbon.ListForm.Edit');

            if (editTab === null) {
                // Try with Document library edit tab
                editTab = ribbon.getChild('Ribbon.DocLibListForm.Edit');
            }


            if (editTab === null) {
                // Try with Posts list edit tab
                editTab = ribbon.getChild('Ribbon.PostListForm.Edit');
            }

            return editTab;

        } // getEditTab



        function getDefaultTab() {

            return ribbon.getChild(ribbon.get_selectedTabId());

        } // getDefaultTab



        function addGroupToTab(tabId, id, title, description, commandId) {

            var tab = ribbon.getChild(tabId);
            var group, layout, section;

            if (tab !== null) {

                group = new CUI.Group(ribbon, id, title, description, commandId, null);
                tab.addChild(group);

                layout = addLayoutToGroup(group);
                section = addSectionToLayout(layout);
                ribbon.refresh();

            }

            return {
                group: group,
                layout: layout,
                section: section
            };

        } // addGroupToTab



        function addLayoutToGroup(group) {

            var layoutId = group.get_id() + '.Layout';
            var layout = new CUI.Layout(ribbon, layoutId, layoutId);
            group.addChild(layout);
            //group.selectLayout(layoutId);

            return layout;

        } // addLayoutToGroup



        function addSectionToLayout(layout) {

            var sectionId = layout.get_id() + '.Section';
            var section = new CUI.Section(ribbon, sectionId, 2, 'Top'); //-> Type = 2 = One row
            /*
                The 'Type' argument in the CUI.Section constructor can be one of the following values:

                    1: The section will be a vertical separator and can't add other elements inside.
                    2: The section will have one row (1)
                    3: The section will have two rows (1 and 2)
                    4: The section will have three rows (1, 2 and 3)
            */
            layout.addChild(section);

            return section;

        } // addSectionToLayout



        function createButtonProperties(id, label, tooltip, description, btnImage) {

            var controlProperties = new CUI.ControlProperties();

            controlProperties.Command = id;// + '.Command';
            controlProperties.Id = id + '.ControlProperties';
            controlProperties.TemplateAlias = 'o1';
            /*
                Property: TemplateAlias
                The TemplateAlias property is used to specify which template alias to use from 
                the Group Template Layout. That is how the control is positioned, which section 
                or row. This property must be a string value corresponding to one of the aliases 
                defined in the group template layout.

                See 'RibbonTemplates' at the end of the file 'CMDUI.XML' (<15_deep>\TEMPLATE\GLOBAL\CMDUI.XML).
                Also see these recomendations: http://www.andrewconnell.com/blog/Always-Create-Your-Own-Group-Templates-with-SharePoint-Ribbon-Customizations
            */
            controlProperties.Image32by32 = btnImage || '_layouts/15/images/placeholder32x32.png';
            controlProperties.ToolTipTitle = tooltip || label;
            controlProperties.ToolTipDescription = description || tooltip || '';
            controlProperties.LabelText = label;

            return controlProperties;

        } // createButtonProperties



        function addButtonToSection(section, id, label, tooltip, description, btnImage) {

            var button = new CUI.Controls.Button(ribbon, id, createButtonProperties(id, label, tooltip, description, btnImage));
            var controlComponent = button.createComponentForDisplayMode('Large'); //-> 'Large', 'Medium', 'Small', 'Menu|Menu16', 'Menu32', ''
            var row = section.getRow(1); // Assumes section of type 2 (one row). It could also be type 3 or 4 and in this case always use the row 1.
            row.addChild(controlComponent);

        } // addButtonToSection



        function showEditingTools() {

            var commandId = 'CommandContextChanged';
            var properties = new CUI.CommandContextSwitchCommandProperties();

            properties.ChangedByUser = false;
            properties.NewContextComand = 'CPEditTab';
            properties.NewContextId = 'Ribbon.EditingTools.CPEditTab';
            properties.OldContextCommand = 'Ribbon.ListForm.Edit';
            properties.OldContextId = 'Ribbon.ListForm.Edit';

            return commandDispatcher.executeCommand(commandId, properties);

        } // showEditingTools



        function _validateCommands(commands) {

            if (!angular.isArray(commands)) {

                if (angular.isString(commands)) {

                    commands = [commands];

                } else {

                    // No valid commands specified
                    return false;

                }
            }

            return commands;

        } // _validateCommands



        function registerComponentCommands(componentId, commands) {

            var cmds = _validateCommands(commands);
            var component = pageManager.getPageComponentById(componentId);

            if (component && cmds) {

                commandDispatcher.registerMultipleCommandHandler(component, cmds);
                ribbon.refresh();
                return true;

            }

            return false;

        } // registerComponentCommands



        function unregisterComponentCommands(componentId, commands) {

            var cmds = _validateCommands(commands);
            var component = pageManager.getPageComponentById(componentId);

            if (component && cmds) {

                commandDispatcher.unregisterMultipleCommandHandler(component, cmds);
                ribbon.refresh();
                return true;

            }

            return false;

        } // unregisterComponentCommands



        function _getRibbonStructure(fromNode) {

            var structure = {};
            var items = fromNode.$6_0;

            if (items) {

                var enumerator = items.getEnumerator();

                while (enumerator.moveNext()) {
                    
                    var item = enumerator.get_current();

                    // TODO: Si el item es un 'CUI_Tab', acceder al tab para inicializarlo antes de obtener su estructura.
                    //       De lo contrario estará vacío si no se ha accedido anteriormente :(

                    structure[item.get_id()] = item;
                    angular.extend(structure[item.get_id()], _getRibbonStructure(item));

                }

            }

            return structure;

        } // _getRibbonStructure



        function getStructure() {

            // Gets the current selected tab id
            var selectedTabId = ribbon.get_selectedTabId();

            // Gets the ribbon structure
            var ribbonStructure = _getRibbonStructure(ribbon);

            // Restore selected tab
            ribbon.selectTabById(selectedTabId);

            return ribbonStructure;

        } // getStructure



        function createToolbar(name, targetTab) {

            var groupName = name || 'Toolbar ' + _getNextToolbarSequence();
            var groupId = 'Ribbon.ngSharePoint.' + groupName.replace(/ /g, '-');
            var groupCommandId = groupId + '.Command';
            var tab, toolbar;


            // Checks for 'targetTab'
            if (targetTab) {

                tab = getTab(targetTab);

                // If specified tab do not exists, creates a new one.
                if (tab === null) {

                    // Creates a new tab
                    var tabId = 'Ribbon.ngSharePoint.' + targetTab.replace(/ /g, '-');
                    tab = addTab(tabId, targetTab, '', tabId + '.Command');
                    registerCommand(tabId + '.Command', angular.noop, true);

                }

            } else {

                // Gets the default selected tab (View|Edit).
                tab = getDefaultTab();

            }


            // Adds the toolbar as a new group in the tab.
            toolbar = addGroupToTab(tab.get_id(), groupId, groupName, groupCommandId);
            registerCommand(groupCommandId, angular.noop, true);

            return toolbar;

        } // createToolbar



        function addButtonToToolbar(toolbar, label, handlerFn, tooltip, description, btnImage, canHandle) {

            var buttonId = toolbar.group.get_id() + '.Button-' + _getNextButtonSequence();

            addButtonToSection(toolbar.section, buttonId, label, tooltip, description, btnImage);
            toolbar.group.selectLayout(toolbar.layout.get_id());
            registerCommand(buttonId, handlerFn, canHandle);

        } // addButtonToToolbar



        function _getNextToolbarSequence() {

            return toolbarSequence++;

        } // _getNextToolbarSequence



        function _getNextButtonSequence() {

            return buttonSequence++;

        } // _getNextButtonSequence



        function registerCommand(commandId, handlerFn, canHandle) {

            var component = pageManager.getPageComponentById('ngSharePointPageComponent');

            if (!component) {

                component = registerPageComponent();

            }

            // Adds the command to the 'ngSharePointPageComponent' component.
            if (component.addCommand(commandId, handlerFn, canHandle)) {

                // Register the command in the CommandDispatcher of the CUI.Page.PageComponent
                registerComponentCommands(component.getId(), commandId);

            }

        } // registerCommand



        function registerPageComponent() {

            // Register the type 'ngSharePointPageComponent'.
            Type.registerNamespace('ngSharePointPageComponent');


            // Initialize the 'ngSharePointPageComponent' members
            ngSharePointPageComponent = function() {

                ngSharePointPageComponent.initializeBase(this);

            };


            ngSharePointPageComponent.initializePageComponent = function() {

                var instance = ngSharePointPageComponent.get_instance();

                pageManager.addPageComponent(instance);

                return instance;

            };


            ngSharePointPageComponent.get_instance = function() {

                if (!angular.isDefined(ngSharePointPageComponent.instance)) {

                    ngSharePointPageComponent.instance = new ngSharePointPageComponent();

                }

                return ngSharePointPageComponent.instance;

            };


            ngSharePointPageComponent.prototype = {

                // Create an array of handled commands with handler methods
                init: function() {

                    this._commands = [];
                    this._handledCommands = {};

                },


                getGlobalCommands: function() {

                    return this._commands;

                },


                getFocusedCommands: function() {

                    return [];

                },


                handleCommand: function(commandId, properties, sequence) {

                    return this._handledCommands[commandId].handle(commandId, properties, sequence);

                },


                canHandleCommand: function(commandId) {

                    var canHandle = this._handledCommands[commandId].enabled;

                    if (angular.isFunction(canHandle)) {

                        return canHandle();

                    }

                    return !!canHandle;

                },


                isFocusable: function() {

                    return false;

                },


                receiveFocus: function() {

                    return true;

                },


                yieldFocus: function() {

                    return false;

                },


                getId: function() {

                    return 'ngSharePointPageComponent';

                },


                addCommand: function(commandId, handlerFn, canHandle) {

                    if (!CUI.ScriptUtility.isNullOrUndefined(commandId) && !CUI.ScriptUtility.isNullOrUndefined(handlerFn) && !Array.contains(this._commands, commandId)) {

                        this._handledCommands[commandId] = {

                            handle: handlerFn,
                            enabled: canHandle

                        };

                        this._commands.push(commandId);

                        return true;

                    }

                    return false;

                }

            };


            // Unregister the default 'save', 'cancel' and 'attach file' commands
            unregisterComponentCommands('WebPartWPQ2', 'Ribbon.ListForm.Edit.Commit.Publish');
            unregisterComponentCommands('WebPartWPQ2', 'Ribbon.ListForm.Edit.Commit.Cancel');
            unregisterComponentCommands('WebPartWPQ2', 'Ribbon.ListForm.Edit.Actions.AttachFile');


            // Register classes and initialize page component
            ngSharePointPageComponent.registerClass('ngSharePointPageComponent', CUI.Page.PageComponent);
            var instance = ngSharePointPageComponent.initializePageComponent();


            // Returns the component instance
            return instance;

        } // registerPageComponent

    } // SPRibbon factory

})();

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

	['$q', 

	function SPUser_Factory($q) {


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
				utils.cleanDeferredProperties(userData);
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




		// Returns the SPUserObj class
		return SPUserObj;

	}
]);

/*
    SPUtils - factory

    Pau Codina (pau.codina@kaldeera.com)
    Pedro Castro (pedro.castro@kaldeera.com, pedro.cm@gmail.com)

    Copyright (c) 2014
    Licensed under the MIT License
*/



///////////////////////////////////////
//  SPUtils
///////////////////////////////////////

angular.module('ngSharePoint').factory('SPUtils', 

    ['SPConfig', '$q', '$http', 'ODataParserProvider', 

    function SPUtils_Factory(SPConfig, $q, $http, ODataParserProvider) {

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

                    // http://mahmoudfarhat.net/post/2013/03/23/SharePoint-2013-ExecuteOrDelayUntilScriptLoaded-not-executing-after-page-publish.aspx
                    // Load sp.js
                    SP.SOD.executeFunc('sp.js', 'SP.ClientContext', function () {

                        var loadScriptPromises = [],
                            loadResourcePromises = [];

                        // Loads additional needed scripts
                        loadScriptPromises.push(self.loadScript('SP.RequestExecutor.js', 'SP.RequestExecutor'));

                        // Shows current SPconfig settings.
                        // console.info(SPConfig.options);


                        if (SPConfig.options.loadMinimalSharePointInfraestructure === false) {

                            loadScriptPromises.push(self.loadScript('SP.UserProfiles.js', 'SP.UserProfiles'));
                            loadScriptPromises.push(self.loadScript('datepicker.debug.js', 'clickDatePicker'));
                            loadScriptPromises.push(self.loadScript('clienttemplates.js', 'SPClientTemplates'));
                            loadScriptPromises.push(self.loadScript('clientforms.js', 'SPClientForms'));
                            loadScriptPromises.push(self.loadScript('clientpeoplepicker.js', 'SPClientPeoplePicker'));
                            loadScriptPromises.push(self.loadScript('autofill.js', 'SPClientAutoFill'));
                            loadScriptPromises.push(self.loadScript(_spPageContextInfo.currentLanguage + '/initstrings.js', 'Strings'));
                            loadScriptPromises.push(self.loadScript(_spPageContextInfo.currentLanguage + '/strings.js', 'Strings'));
                        }

                        // Resolve script promises
                        $q.all(loadScriptPromises).then(function() {

                            if (SPConfig.options.loadMinimalSharePointInfraestructure === false || SPConfig.options.forceLoadResources) {

                                // Process resource files
                                angular.forEach(SPConfig.options.resourceFiles.get(), function(filename) {

                                    // Add the 'resx' extension to the 'filename' if don't have it.
                                    if (filename.indexOf('.resx') == -1) {
                                        filename += '.resx';
                                    }

                                    loadResourcePromises.push(self.loadResourceFile(filename));
                                });
                                
                            }

                            // Resolve resource promises
                            $q.all(loadResourcePromises).then(function() {

                                isSharePointReady = true;
                                deferred.resolve();

                            }, function(err) {

                                console.error('Error loading SharePoint resources dependences.', err);
                                deferred.reject(err);
                            });

                        }, function(err) {

                            console.error('Error loading SharePoint scripts dependences.', err);
                            deferred.reject(err);
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
                var params = '?name=' + name + '&culture=' + STSHtmlEncode(Strings.STS.L_CurrentUICulture_Name || _spPageContextInfo.currentUICultureName);


                if (SPConfig.options.force15LayoutsDirectory) {
                    url = '/_layouts/15/ScriptResx.ashx' + params;
                } else {
                    url = SP.Utilities.Utility.getLayoutsPageUrl('ScriptResx.ashx') + params;
                }

                $http.get(url)
                    .success(function(data, status, headers, config) {

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

                    })
                    .error(function(data, status, headers, config) {

                        deferred.resolve();
                    });

                return deferred.promise;
            },



            loadScript: function(scriptFilename, functionName) {

                var deferred = $q.defer();

                if (SPConfig.options.force15LayoutsDirectory) {
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


            refreshDigestValue: function() {

                var self = this;
                var deferred = $q.defer();

                $http({

                    url: _spPageContextInfo.webAbsoluteUrl + "/_api/contextinfo",
                    method: "POST",
                    headers: { "Accept": "application/json; odata=verbose"}

                }).then(function (data) {

                    var requestDigest = document.getElementById('__REQUESTDIGEST');
                    if (requestDigest !== null) {
                        requestDigest.value = data.data.d.GetContextWebInformation.FormDigestValue;
                    }

                    deferred.resolve(data.data.d.GetContextWebInformation.FormDigestValue);

                }, function (data) {
                    console.log(data.data);
                    deferred.reject(data.data);
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

    }
]);

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

	function SPWeb_Factory($q, SPUtils, SPList, SPUser) {

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
						utils.cleanDeferredProperties(d);
						
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
    SPAction - directive
    
    Pau Codina (pau.codina@kaldeera.com)
    Pedro Castro (pedro.castro@kaldeera.com, pedro.cm@gmail.com)

    Copyright (c) 2014
    Licensed under the MIT License
*/



///////////////////////////////////////
//  SPAction
///////////////////////////////////////

(function() {
    
    'use strict';

    angular
        .module('ngSharePoint')
        .directive('spAction', spAction);


    spAction.$inject = ['$compile', '$q', 'SPUtils', 'SPRibbon', '$timeout'];


    /* @ngInject */
    function spAction($compile, $q, SPUtils, SPRibbon, $timeout) {

        var directive = {

            restrict: 'A',
            require: '^spformToolbar',
            priority: 500,
            terminal: true,

            scope: {
                spAction: '&',
                redirectUrl: '@',
                enabled: '='
            },

            link: postLink

        };

        return directive;

        

        ///////////////////////////////////////////////////////////////////////////////



        function postLink(scope, element, attrs, spformToolbarController) {

            // Public properties
            scope.formCtrl = spformToolbarController.getFormCtrl();
            scope.isInDesignMode = SPUtils.inDesignMode();
            scope.status = scope.formCtrl.status;


            // Public methods
            scope.makeAction = makeAction;


            // Process attributes and compile
            var redirectUrl = attrs.redirectUrl;
            var ngClick = attrs.ngClick;
            var tooltip = attrs.tooltip;
            var description = attrs.description;
            var ribbonButtonImage = attrs.ribbonButtonImage;


            // Watch for 'enabled' attribute
            scope.$watch('enabled', SPRibbon.refresh);


            // Watch for 'formStatus'
            scope.$watch(function() {

                return scope.formCtrl.getFormStatus();

            }, SPRibbon.refresh);


            processAction();



            // ****************************************************************************
            // Private methods
            //


            function processAction() {


                // Removes 'sp-action' attribute to avoid infinite loop when compile
                element.removeAttr('sp-action');

                // Sets the action click event
                element.attr('ng-click', 'makeAction();' + (attrs.ngClick || ''));

                // Sets the logic for 'ng-disabled' attribute
                element.attr('ng-disabled', 'isInDesignMode || formCtrl.getFormStatus() != status.IDLE || enabled === false');

                // Sets css classes
                element.addClass('spform-toolbar-element spform-toolbar-action');


                // Checks for pre-defined buttons actions (i.e., save, cancel and close)
                switch(attrs.spAction.toLowerCase()) {

                    // Default save action
                    case 'save':

                        scope.action = save;
                        redirectUrl = redirectUrl || 'default';

                        SPRibbon.ready().then(function() {

                            SPRibbon.registerCommand('Ribbon.ListForm.Edit.Commit.Publish', makeAction, true);

                        });

                        break;
                    

                    // Default cancel action
                    case 'cancel':

                        scope.action = cancel;
                        redirectUrl = redirectUrl || 'default';

                        SPRibbon.ready().then(function() {

                            SPRibbon.registerCommand('Ribbon.ListForm.Edit.Commit.Cancel', makeAction, true);

                        });

                        break;


                    // Default close action
                    case 'close':

                        scope.action = cancel;
                        redirectUrl = redirectUrl || 'default';

                        break;


                    // Custom action
                    default:

                        scope.action = scope.spAction;

                        if (attrs.showInRibbon === 'true' || (!angular.isDefined(attrs.showInRibbon) && spformToolbarController.showToolbarInRibbon())) {

                            SPRibbon.ready().then(function() {

                                var toolbar = spformToolbarController.getRibbonToolbar();

                                if (toolbar) {

                                    SPRibbon.addButtonToToolbar(toolbar, getLabel(), makeAction, tooltip, description, ribbonButtonImage, canHandle);

                                }

                            });

                        }

                }


                // Compile the element with the new attributes and scope values
                $compile(element)(scope);

            }



            // Gets if the action is enabled and can be handled.
            function canHandle() {

                return scope.enabled !== false && scope.formCtrl.getFormStatus() == scope.status.IDLE;

            }



            // Gets the action text/label
            function getLabel() {

                var label = '';

                if (element.get(0).tagName.toLowerCase() == 'input') {

                    label = element.val();

                } else {

                    label = element.text();

                }


                return label;

            }



            // Default SAVE form action
            function save() {

                return scope.formCtrl.save(redirectUrl);

            }



            // Default CANCEL form action
            function cancel() {

                return scope.formCtrl.cancel(redirectUrl);

            }




            // ****************************************************************************
            // Public methods
            //
            function makeAction() {

                scope.formCtrl.setFormStatus(scope.status.PROCESSING);

                var safeActionFn = function() {
                    try {
                        return scope.action();
                    } catch(e) {
                        console.error('>>>> ngSharePoint: sp-action "' + getLabel() + '" rejected automatically due to an unhandled exception.');
                        return $q.reject(e);
                    }
                };



                $q.when(safeActionFn())

                    .then(function(result) {

                        if (result !== false) {

                            //var redirectUrl = scope.redirectUrl;

                            if (redirectUrl) {

                                // Checks for pre-defined values in the redirect url.
                                switch(redirectUrl.toLowerCase()) {

                                    case 'display':
                                        redirectUrl = window.location.href.toLowerCase().replace(/new|edit/, 'display');
                                        // NOTA: No sirve porque la url del formulario por defecto para 'Display' 
                                        //       puede ser '.../lo-que-sea.aspx'.
                                        // TODO: Get the right default 'DispForm' url.
                                        //       Use spList.getProperties({$expand: 'Forms'}) to get the list forms.
                                        //       Use CSOM to get the default 'display' form.
                                

                                        // Redirects to the correct url
                                        window.location = redirectUrl;
                                        break;


                                    case 'edit':
                                        redirectUrl = window.location.href.toLowerCase().replace(/disp|new/, 'edit');
                                        // TODO: Get the right default 'EditForm' url.
                                        //       Use spList.getProperties({$expand: 'Forms'}) to get the list forms.
                                        //       Use CSOM to get the default 'edit' form.

                                        // Redirects to the correct url
                                        window.location = redirectUrl;
                                        break;


                                    case 'new':
                                        redirectUrl = window.location.href.toLowerCase().replace(/disp|edit/, 'new');
                                        // TODO: Get the right default 'NewForm' url.
                                        //       Use spList.getProperties({$expand: 'Forms'}) to get the list forms.
                                        //       Use CSOM to get the default 'new' form.

                                        // Redirects to the correct url
                                        window.location = redirectUrl;
                                        break;


                                    case 'default':

                                        if (SP.UI.ModalDialog.get_childDialog()) {

                                            $timeout(function() {

                                                SP.UI.ModalDialog.get_childDialog().close();

                                            });

                                        } else {

                                            redirectUrl = utils.getQueryStringParamByName('Source') || _spPageContextInfo.webServerRelativeUrl;
                                            // TODO: Redireccionar a la vista por defecto de la lista.

                                            // Redirects to the correct url
                                            window.location = redirectUrl;

                                        }

                                        break;

                                }

                            }

                        }

                    }, function(err) {

                        if (err) {

                            // Show error details in the console.
                            console.error(err);

                        }

                    })

                    .finally(function() {

                        // Sets the form in its IDLE state.
                        scope.formCtrl.setFormStatus(scope.status.IDLE);

                    });

            } // makeAction

        } // link

    } // Directive factory function


})();

/*
  SPIf - directive
  
  Pau Codina (pau.codina@kaldeera.com)
  Pedro Castro (pedro.castro@kaldeera.com, pedro.cm@gmail.com)

  Copyright (c) 2014
  Licensed under the MIT License
*/



///////////////////////////////////////
//  SPIf
///////////////////////////////////////

angular.module('ngSharePoint').directive('spIf',

    ['$compile', 'SPExpressionResolver',

    function spIf_DirectiveFactory($compile, SPExpressionResolver) {

        var spIfDirectiveDefinitionObject = {

            restrict: 'A',
            terminal: true,
            priority: 600,


            link: function ($scope, $element, $attrs) {

                // NOTA: Habría que hacer un $watch o $observe del atributo 'spif' igual que hace
                //       la directiva 'ngIf' de angular para que se evalúe dinámicamente.

                SPExpressionResolver.resolve($attrs.spIf, $scope).then(function(result) {

                    if (!$scope.$eval(result)) {

                        $element.remove();
                        $element = null;

                    } else {

                        $element.removeAttr('sp-if');
                        $element = $compile($element, 600)($scope);

                    }

                });

            } // link

        }; // Directive definition object


        return spIfDirectiveDefinitionObject;

    } // Directive factory

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

	['SPFieldDirective',

	function spfieldAttachments_DirectiveFactory(SPFieldDirective) {

		var spfieldAttachments_DirectiveDefinitionObject = {

			restrict: 'EA',
			require: ['^spform', 'ngModel'],
			replace: true,
			scope: {
				mode: '@',
				value: '=ngModel'
			},
			templateUrl: 'templates/form-templates/spfield-control-loading.html',
			

			link: function($scope, $element, $attrs, controllers) {


				var directive = {

					fieldTypeName: 'attachments',
					replaceAll: false,

					init: function() {

						$scope.DeleteAttachmentText = STSHtmlEncode(Strings.STS.L_DeleteDocItem_Text);
						$scope.AttachFileText = Resources.core.cui_ButAttachFile;
						$scope.L_Menu_LCID = L_Menu_LCID;
					},

					watchValueFn: function(newValue) {

						// Show loading animation.
						directive.setElementHTML('<div><img src="/_layouts/15/images/loadingcirclests16.gif" alt="" /></div>');

						// Gets the files attached to the item
						$scope.$parent.item.getAttachments().then(function(attachmentFiles){

							$scope.attachmentFiles = attachmentFiles;
							directive.renderField();

						}, function(err) {

							$scope.errorMsg = err.message;
							directive.setElementHTML('<span style="color: brown">{{errorMsg}}</span>');
						});
					}
				};


				SPFieldDirective.baseLinkFn.apply(directive, arguments);


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
				// Removes existing attachment, local or server side.
				// NOTE: Attachments will be effective when save the item.
				//
				$scope.removeAttachment = function($event, index, local) {

					$event.preventDefault();

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


					return false;

				};



			} // link

		}; // Directive definition object


		return spfieldAttachments_DirectiveDefinitionObject;

	} // Directive factory

]);




angular.module('ngSharePoint').directive('fileSelect', 

	['$parse', '$timeout', 'SPRibbon', 

	function fileSelect_DirectiveFactory($parse, $timeout, SPRibbon) {

		var fileSelect_DirectiveDefinitionObject = function($scope, $element, $attrs) {

			var fn = $parse($attrs.fileSelect);
			$element.removeAttr('file-select');
			

			if ($element[0].tagName.toLowerCase() !== 'input' || ($element.attr('type') && $element.attr('type').toLowerCase() !== 'file')) {

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



            SPRibbon.ready().then(function() {

            	SPRibbon.attachFileElement = $element;
                SPRibbon.registerCommand(
                	'Ribbon.ListForm.Edit.Actions.AttachFile', 
                	function() {
                		SPRibbon.attachFileElement.click();
                	}, true);

            });


		}; // Directive definition object/function


		return fileSelect_DirectiveDefinitionObject;

	} // Directive factory

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

	['SPFieldDirective',

	function spfieldBoolean_DirectiveFactory(SPFieldDirective) {

		var spfieldBoolean_DirectiveDefinitionObject = {

			restrict: 'EA',
			require: ['^spform', 'ngModel'],
			replace: true,
			scope: {
				mode: '@',
				value: '=ngModel'
			},
			templateUrl: 'templates/form-templates/spfield-control.html',
			

			link: function($scope, $element, $attrs, controllers) {


				var directive = {
					
					fieldTypeName: 'boolean',
					replaceAll: false,

					watchValueFn: function(newValue) {
						
						$scope.displayValue = newValue ? STSHtmlEncode(Strings.STS.L_SPYes) : STSHtmlEncode(Strings.STS.L_SPNo);
					}
				};


				SPFieldDirective.baseLinkFn.apply(directive, arguments);

			} // link

		}; // Directive definition object


		return spfieldBoolean_DirectiveDefinitionObject;

	} // Directive factory

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

	['SPFieldDirective', 'SPUtils',

	function spfieldCalculated_DirectiveFactory(SPFieldDirective, SPUtils) {

		var spfieldCalculated_DirectiveDefinitionObject = {

			restrict: 'EA',
			require: ['^spform', 'ngModel'],
			replace: true,
			scope: {
				mode: '@',
				value: '=ngModel'
			},
			templateUrl: 'templates/form-templates/spfield-control.html',


			link: function($scope, $element, $attrs, controllers) {

				// NOTA: El campo calculado puede ser de los siguientes tipos:
				//		 Text, DateTime, Boolean, Number, Currency

				/*
				 * SPFieldCalculated schema:
				 *
				 * FieldTypeKind: 17 (SP.FieldType.calculated)
				 * OutputType: 2, 4, 8, 9, 10
				 *			  (SP.FieldType.text, SP.FieldType.dateTime, SP.FieldType.boolean, SP.FieldType.number, SP.FieldType.currency)
				 *
				 * Sample 'SchemaXml' property:
				 * SchemaXml.Format="DateOnly"
				 *			.LCID="3082"
				 *			.ResultType="Number"
				 *			.Decimals="2"
				 */


				var directive = {
					
					fieldTypeName: 'text',
					replaceAll: false,

					init: function() {

						 switch($scope.schema.OutputType) {

						 	case SP.FieldType.text:
						 		// Change directive type
						 		directive.fieldTypeName = 'text';
						 		break;


						 	case SP.FieldType.dateTime:
						 		// Change directive type
						 		directive.fieldTypeName = 'datetime';

						 		// Specific type initialization
						 		$scope.cultureInfo = (typeof __cultureInfo == 'undefined' ? Sys.CultureInfo.CurrentCulture : __cultureInfo);
						 		break;


						 	case SP.FieldType.boolean:
						 		// Change directive type
						 		directive.fieldTypeName = 'boolean';
						 		break;


						 	case SP.FieldType.number:
						 		// Change directive type
						 		directive.fieldTypeName = 'number';

						 		// Specific type initialization
								var xml = SPUtils.parseXmlString($scope.schema.SchemaXml);
								var percentage = xml.documentElement.getAttribute('Percentage') || 'false';
								var decimals = xml.documentElement.getAttribute('Decimals') || 'auto';
								$scope.schema.Percentage = percentage.toLowerCase() === 'true';
								$scope.schema.Decimals = parseInt(decimals);
								$scope.cultureInfo = (typeof __cultureInfo == 'undefined' ? Sys.CultureInfo.CurrentCulture : __cultureInfo);
						 		break;


						 	case SP.FieldType.currency:
						 		// Change directive type
						 		directive.fieldTypeName = 'currency';

						 		// Specific type initialization
								$scope.currencyLocaleId = $scope.schema.CurrencyLocaleId;
								// TODO: Get the CultureInfo object based on the field schema 'CurrencyLocaleId' property.
								$scope.cultureInfo = (typeof __cultureInfo == 'undefined' ? Sys.CultureInfo.CurrentCulture : __cultureInfo);

								// TODO: Currency could also have the 'Decimal' value in the 'SchemaXml' property.
								//		 (See SPFieldNumber)

						 		break;

						 }

					},

					watchValueFn: function(newValue) {
						
						switch($scope.schema.OutputType) {

						 	case SP.FieldType.text:
						 		break;


						 	case SP.FieldType.dateTime:
								if ($scope.value !== null && $scope.value !== void 0) {
									
									$scope.dateModel = new Date($scope.value);

								} else {

									$scope.dateModel = null;

								}
					 			break;


						 	case SP.FieldType.boolean:
								$scope.displayValue = newValue ? STSHtmlEncode(Strings.STS.L_SPYes) : STSHtmlEncode(Strings.STS.L_SPNo);
						 		break;


						 	case SP.FieldType.number:
						 		// Parse the value to match the type.
						 		$scope.value = parseFloat(newValue);
						 		break;


						 	case SP.FieldType.currency:
						 		// Parse the value to match the type.
						 		$scope.value = parseFloat(newValue);
						 		break;

						}

					},

					watchModeFn: function() {

						// Force always to render in display mode.
						// NOTE: Edit mode is not supported for calculated fields.
						$scope.currentMode = 'display';

						// Renders the field
						directive.renderField();

					}

				};
				

				SPFieldDirective.baseLinkFn.apply(directive, arguments);

			}

		}; // Directive definition object


		return spfieldCalculated_DirectiveDefinitionObject;

	} // Directive factory

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

	['SPFieldDirective',

	function spfieldChoice_DirectiveFactory(SPFieldDirective) {

		var spfieldChoice_DirectiveDefinitionObject = {

			restrict: 'EA',
			require: ['^spform', 'ngModel'],
			replace: true,
			scope: {
				mode: '@',
				value: '=ngModel'
			},
			templateUrl: 'templates/form-templates/spfield-control.html',
			

			link: function($scope, $element, $attrs, controllers) {


				var directive = {
					
					fieldTypeName: 'choice',
					replaceAll: false,

					init: function() {

						$scope.choices = $scope.schema.Choices.results;
					}
				};
				

				SPFieldDirective.baseLinkFn.apply(directive, arguments);

			} // link

		}; // Directive definition object


		return spfieldChoice_DirectiveDefinitionObject;

	} // Directive factory

]);

/*
    SPFieldControl - directive
    
    Pau Codina (pau.codina@kaldeera.com)
    Pedro Castro (pedro.castro@kaldeera.com, pedro.cm@gmail.com)

    Copyright (c) 2014
    Licensed under the MIT License
*/



///////////////////////////////////////
//  SPFieldControl
///////////////////////////////////////

angular.module('ngSharePoint').directive('spfieldControl', 

    ['$compile', '$templateCache', '$http',

    function spfieldControl_DirectiveFactory($compile, $templateCache, $http) {

        var spfieldControl_DirectiveDefinitionObject = {

            restrict: 'EA',
            require: '^spform',
            replace: true,
            templateUrl: 'templates/form-templates/spfield-control.html',


            link: function($scope, $element, $attrs, spformController) {

                var name = ($attrs.name || $attrs.spfieldControl);
                var schema = spformController.getFieldSchema(name);
                
                if (schema !== void 0) {

                    // Checks if attachments are enabled in the list when process the 'Attachments' field.
                    if (name === 'Attachments') {

                        var item = spformController.getItem();

                        if (item !== void 0 && item.list !== void 0 && item.list.EnableAttachments === false) {

                            console.error('Can\'t add "Attachments" field because the attachments are disabled in the list.');
                            setEmptyElement();
                            return;

                        }

                    }
                    

                    // Sets the default value for the field
                    spformController.initField(name);

                    // NOTE: Include a <spfield-control name="<name_of_the_field>" mode="hidden" /> to initialize 
                    //       the field with it's default value, but without showing it up in the form.
                    if ($attrs.mode == 'hidden') {
                        $element.addClass('ng-hide');
                        return;
                    }

                    // Gets the field type
                    var fieldType = (schema.hasExtendedSchema ? schema.originalTypeAsString : schema.TypeAsString);
                    if (fieldType === 'UserMulti') fieldType = 'User';

                    // Gets the field name
                    var fieldName = name + (fieldType == 'Lookup' || fieldType == 'LookupMulti' || fieldType == 'User' || fieldType == 'UserMulti' ? 'Id' : '');

                    // If the field has extended schema, adjust the type to its extended 'TypeAsString' property.
                    // This must be done after adjust the 'fieldName' in order to bind the 'ng-model' to the correct field name.
                    if (schema.hasExtendedSchema) {

                        fieldType = schema.TypeAsString;
                        if (fieldType === 'UserMulti') fieldType = 'User';

                    }

                    // Adjust the field name if necessary.
                    // This is for additional read-only fields attached to Lookup and LookupMulti field types.
                    // Also, for this read-only fields, sets always the form mode to display.
                    if ((fieldType == 'Lookup' || fieldType == 'LookupMulti') && schema.PrimaryFieldId !== null) {

                        var primaryFieldSchema = spformController.getFieldSchema(schema.PrimaryFieldId);

                        if (primaryFieldSchema !== void 0) {
                            fieldName = primaryFieldSchema.InternalName + 'Id';
                            $attrs.mode = 'display';
                        }
                    }


                    // Check for 'require' attribute (Force required)
                    if ($attrs.required) {
                        schema.Required = $attrs.required == 'true';
                    }


                    // Mount field attributes
                    var ngModelAttr = ' ng-model="item.' + fieldName + '"';
                    var nameAttr = ' name="' + name + '"';
                    var modeAttr = ($attrs.mode ? ' mode="' + $attrs.mode + '"' : '');
                    var dependsOnAttr = ($attrs.dependsOn ? ' depends-on="' + $attrs.dependsOn + '"' : '');
                    var hiddenAttr = ($attrs.mode == 'hidden' ? ' ng-hide="true"' : '');
                    var validationAttributes = ' ng-required="' + schema.Required + '"';
                    
                    // Specific field type validation attributes
                    switch(schema.TypeAsString) {

                        case 'Text':
                        case 'Note':
                            validationAttributes += ' ng-maxlength="' + schema.MaxLength + '"';
                            break;
                    }


                    // Check for 'render-as' attribute
                    if ($attrs.renderAs) {
                        fieldType = $attrs.renderAs;
                    }
                    

                    // Mount the field directive HTML
                    var fieldControlHTML = '<spfield-' + fieldType + ngModelAttr + nameAttr + modeAttr + dependsOnAttr + hiddenAttr + validationAttributes + '></spfield-' + fieldType + '>';
                    var newElement = $compile(fieldControlHTML)($scope);

                    $element.replaceWith(newElement);
                    $element = newElement;

                } else {

                    console.error('Unknown field "' + $attrs.name + '"');

                    /*
                    var errorElement = '<span class="ms-formvalidation ms-csrformvalidation">Unknown field "' + $attrs.name + '"</span>';
                    $element.replaceWith(errorElement);
                    $element = errorElement;
                    */
                    
                    setEmptyElement();

                }


                function setEmptyElement() {

                    var emptyElement = '';
                    $element.replaceWith(emptyElement);
                    $element = emptyElement;

                }


            } // link

        }; // Directive definition object


        return spfieldControl_DirectiveDefinitionObject;

    } // Directive factory

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

	['SPFieldDirective',

	function spfieldCurrency_DirectiveFactory(SPFieldDirective) {

		var spfieldCurrency_DirectiveDefinitionObject = {

			restrict: 'EA',
			require: ['^spform', 'ngModel'],
			replace: true,
			scope: {
				mode: '@',
				value: '=ngModel'
			},
			templateUrl: 'templates/form-templates/spfield-control.html',
			

			link: function($scope, $element, $attrs, controllers) {


				var directive = {
					
					fieldTypeName: 'currency',
					replaceAll: false,

					init: function() {

						$scope.currencyLocaleId = $scope.schema.CurrencyLocaleId;
						// TODO: Get the CultureInfo object based on the field schema 'CurrencyLocaleId' property.
						$scope.cultureInfo = (typeof __cultureInfo == 'undefined' ? Sys.CultureInfo.CurrentCulture : __cultureInfo);

						// TODO: Currency could also have the 'Decimal' value in the 'SchemaXml' property.
						//		 (See SPFieldNumber)

					},

					parserFn: function(viewValue) {

						// Number validity
						directive.setValidity('number', !viewValue || (!isNaN(+viewValue) && isFinite(viewValue)));

						// TODO: Update 'spfieldValidationMessages' directive to include the number validity error message.

						// Adjust value to match field type 'Double' in SharePoint.
						if (viewValue === '' || viewValue === void 0) {
						
							$scope.value = null;
						}
						
						return $scope.value;
					}
				};
				

				SPFieldDirective.baseLinkFn.apply(directive, arguments);

			} // link

		}; // Directive definition object


		return spfieldCurrency_DirectiveDefinitionObject;

	} // Directive factory

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

	['SPFieldDirective', '$filter', '$timeout', '$q', 'SPUtils',

	function spfieldDatetime_DirectiveFactory(SPFieldDirective, $filter, $timeout, $q, SPUtils) {

		var spfieldDatetime_DirectiveDefinitionObject = {

			restrict: 'EA',
			require: ['^spform', 'ngModel'],
			replace: true,
			scope: {
				mode: '@',
				value: '=ngModel'
			},
			templateUrl: 'templates/form-templates/spfield-control.html',
			

			link: function($scope, $element, $attrs, controllers) {


				var directive = {
					
					fieldTypeName: 'datetime',
					replaceAll: false,

					watchModeFn: function(newValue) {

						getData().then(function() {
							directive.renderField(newValue);
						});
					}
				};


				SPFieldDirective.baseLinkFn.apply(directive, arguments);


				function getData() {

					var def = $q.defer();

					// Gets web regional settings
					$scope.formCtrl.getWebRegionalSettings().then(function(webRegionalSettings) {

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

				} // getData



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

					try {

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

					} catch(e) {

						$scope.value = null;
						// TODO: Create a 'DateTimeValidator' and assigns it in 'SPFieldControl' directive when field type is 'DateTime'.
					}
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

			} // link

		}; // Directive definition object


		return spfieldDatetime_DirectiveDefinitionObject;

	} // Directive factory

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

	[

	function spfieldDescription_DirectiveFactory() {

		var spfieldDescription_DirectiveDefinitionObject = {


			restrict: 'EA',
			require: '^spform',
			replace: true,
			scope: {
				mode: '@'
			},
			templateUrl: 'templates/form-templates/spfield-description.html',


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

			} // link

		}; // Directive definition object


		return spfieldDescription_DirectiveDefinitionObject;
		
	} // Directive factory

]);

/*
    SPFieldFocusElement - directive
    
    Pau Codina (pau.codina@kaldeera.com)
    Pedro Castro (pedro.castro@kaldeera.com, pedro.cm@gmail.com)

    Copyright (c) 2014
    Licensed under the MIT License
*/



///////////////////////////////////////
//  SPFieldFocusElement
///////////////////////////////////////

angular.module('ngSharePoint').directive('spfieldFocusElement', 

    [

    function spfieldFocusElement_DirectiveFactory() {

        var spfieldFocusElement_DirectiveDefinitionObject = {

            restrict: 'A',

            link: function($scope, $element, $attrs) {

                if ($scope.formCtrl) {

                    $scope.formCtrl.focusElements = $scope.formCtrl.focusElements || [];

                    removeFocusElement($scope.name);

                    $scope.formCtrl.focusElements.push({ name: $scope.name, element: $element });

                }


                function removeFocusElement(name) {

                    for (var i = 0; i < $scope.formCtrl.focusElements.length; i++) {
                        
                        if ($scope.formCtrl.focusElements[i].name === name) {

                            $scope.formCtrl.focusElements.splice(i, 1);

                        }

                    }

                }

            } // link

        }; // Directive definition object


        return spfieldFocusElement_DirectiveDefinitionObject;
        
    } // Directive factory

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

	[

	function spfieldLabel_DirectiveFactory() {

		var spfieldLabel_DirectiveDefinitionObject = {

			restrict: 'EA',
			require: '^spform',
			replace: true,
			scope: {
				mode: '@'
			},
			templateUrl: 'templates/form-templates/spfield-label.html',


			link: function($scope, $element, $attrs, spformController) {

				$scope.schema = spformController.getFieldSchema($attrs.name);

				// Sets the field label
				if ($attrs.label !== void 0) {

					// Custom label
					$scope.label = $attrs.label;

				} else {

					// Default label
					// If no 'label' attribute specified assigns the 'Title' property from the field schema as label.
					// NOTE: If field don't exists, assigns an empty label or code will crash when try to access the schema.
					//	     As alternative could assign the 'name' attribute as label.
					$scope.label = ($scope.schema ? $scope.schema.Title : '');
				}


				// ****************************************************************************
				// Watch for form mode changes.
				//
				$scope.$watch(function() {

					return $scope.mode || spformController.getFormMode();

				}, function(newValue) {

					$scope.currentMode = newValue;

				});

			} // link

		}; // Directive definition object


		return spfieldLabel_DirectiveDefinitionObject;
	
	} // Directive factory

]);

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

	['SPFieldDirective', '$q', '$filter', 'SharePoint',

	function spfieldLookup_DirectiveFactory(SPFieldDirective, $q, $filter, SharePoint) {

		var spfieldLookup_DirectiveDefinitionObject = {

			restrict: 'EA',
			require: ['^spform', 'ngModel'],
			replace: true,
			scope: {
				mode: '@',
				value: '=ngModel'
			},
			templateUrl: 'templates/form-templates/spfield-control-loading.html',
			

			link: function($scope, $element, $attrs, controllers) {


				var directive = {
					
					fieldTypeName: 'lookup',
					replaceAll: false,

					watchModeFn: function(newValue) {

						refreshData();
					},

					watchValueFn: function(newValue, oldValue) {

						if (newValue === oldValue) return;

						$scope.lookupItem = void 0;
						refreshData();
					}

				};


				SPFieldDirective.baseLinkFn.apply(directive, arguments);



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
						$scope.formCtrl.fieldValueChanged($scope.schema.InternalName, $scope.value, $scope.lastValue);

						$scope.lastValue = $scope.value;
					}
				};



				// ****************************************************************************
				// Refresh the lookup data and render the field.
				//
				function refreshData() {
					
					// Show loading animation.
					directive.setElementHTML('<div><img src="/_layouts/15/images/loadingcirclests16.gif" alt="" /></div>');

					// Gets the data for the lookup and then render the field.
					getLookupData($scope.currentMode).then(function() {

						if ($scope.currentMode === 'edit') {

							// Extends the internal 'lookupItem' object with the real lookup item to make
							// available all the lookup fields for use in the 'extendedSchema' extra-template.

							$scope.lookupItem = {}; // Initialize 'lookupItem' object.

							if ($scope.value !== null && $scope.value !== void 0 && $scope.value > 0) {

								angular.forEach($scope.lookupItems, function(lookupItem) {

									if (lookupItem.Id == $scope.value) {

										$scope.lookupItem = lookupItem;

									}

								});

							}

						}

						directive.renderField();

					}, function(err) {

						$scope.errorMsg = err.message;

						if ($scope.value === void 0) {
							directive.setElementHTML('');
						} else {
							directive.setElementHTML('<span style="color: brown">{{errorMsg}}</span>');
						}
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
									title: '',
									url: ''
								};

								def.resolve($scope.lookupItem);

							} else {

								list.getItemById($scope.value).then(function(item) {

									var displayValue = item[$scope.schema.LookupField];
									var fieldSchema = $scope.lookupList.Fields[$scope.schema.LookupField];

									if (fieldSchema.TypeAsString === 'DateTime' && displayValue !== null) {
										var cultureInfo = (typeof __cultureInfo == 'undefined' ? Sys.CultureInfo.CurrentCulture : __cultureInfo);
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
										title: displayValue,
										url: item.list.Forms.results[0].ServerRelativeUrl + '?ID=' + $scope.value + '&Source=' + encodeURIComponent(window.location)
									};

									// Extends the internal 'lookupItem' object with the real lookup item to make
									// available all the lookup fields for use in the 'extendedSchema' extra-template.
									angular.extend($scope.lookupItem, item);

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

					if ($scope.lookupItems !== void 0) {

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

			} // link

		}; // Directive definition object


		return spfieldLookup_DirectiveDefinitionObject;

	} // Directive factory

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

	['SPFieldDirective', '$q', '$filter', 'SharePoint',

	function spfieldLookupmulti_DirectiveFactory(SPFieldDirective, $q, $filter, SharePoint) {

		var spfieldLookupmulti_DirectiveDefinitionObject = {

			restrict: 'EA',
			require: ['^spform', 'ngModel'],
			replace: true,
			scope: {
				mode: '@',
				value: '=ngModel'
			},
			templateUrl: 'templates/form-templates/spfield-control-loading.html',


			link: function($scope, $element, $attrs, controllers) {


				var directive = {
					fieldTypeName: 'lookupmulti',
					replaceAll: false,

					init: function() {

						$scope.idPrefix = $scope.schema.InternalName + '_'+ $scope.schema.Id;
						$scope.addButtonText = STSHtmlEncode(Strings.STS.L_LookupMultiFieldAddButtonText) + ' >';
						$scope.removeButtonText = '< ' + STSHtmlEncode(Strings.STS.L_LookupMultiFieldRemoveButtonText);
						$scope.candidateAltText = STSHtmlEncode(StBuildParam(Strings.STS.L_LookupMultiFieldCandidateAltText, $scope.schema.Title));
						$scope.resultAltText = STSHtmlEncode(StBuildParam(Strings.STS.L_LookupMultiFieldResultAltText, $scope.schema.Title));

						// Adjust the model if no value is provided
						if ($scope.value === null || $scope.value === void 0) {
							$scope.value = { results: [] };
						}
						
					},
					
					parserFn: function(viewValue) {

						var hasValue = $scope.value && $scope.value.results.length > 0;
						directive.setValidity('required', !$scope.schema.Required || hasValue);
						
						return viewValue;
					},

					watchModeFn: function(newValue) {

						refreshData();
					},

					watchValueFn: function(newValue, oldValue) {

						if (newValue === oldValue) return;

						$scope.selectedLookupItems = void 0;
						refreshData();						
					}
				};


				SPFieldDirective.baseLinkFn.apply(directive, arguments);



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
					$scope.formCtrl.fieldValueChanged($scope.schema.InternalName, $scope.value);
				};
				*/



				// ****************************************************************************
				// Refresh the lookup data and render the field.
				//
				function refreshData() {

					// Adjust the model if no value is provided
					if ($scope.value === null || $scope.value === void 0) {
						$scope.value = { results: [] };
					}
					
					// Show loading animation.
					directive.setElementHTML('<div><img src="/_layouts/15/images/loadingcirclests16.gif" alt="" /></div>');

					// Gets the data for the lookup and then render the field.
					getLookupData($scope.currentMode).then(function() {

						directive.renderField($scope.currentMode);

					}, function(err) {

						$scope.errorMsg = err.message;

						if ($scope.value === void 0) {
							directive.setElementHTML('');
						} else {
							directive.setElementHTML('<span style="color: brown">{{errorMsg}}</span>');
						}
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

			} // link

		}; // Directive definition object


		return spfieldLookupmulti_DirectiveDefinitionObject;

	} // Directive factory

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

	['SPFieldDirective',

	function spfieldMultichoice_DirectiveFactory(SPFieldDirective) {

		var spfieldMultichoice_DirectiveDefinitionObject = {

			restrict: 'EA',
			require: ['^spform', 'ngModel'],
			replace: true,
			scope: {
				mode: '@',
				value: '=ngModel'
			},
			templateUrl: 'templates/form-templates/spfield-control.html',


			link: function($scope, $element, $attrs, controllers) {


				var directive = {
					
					fieldTypeName: 'multichoice',
					replaceAll: false,

					init: function() {

						// Adjust the model if no value is provided
						if ($scope.value === null || $scope.value === void 0) {
							$scope.value = { results: [] };
						}

						$scope.choices = $scope.value.results;
						sortChoices();
					},

					parserFn: function(viewValue) {

						directive.setValidity('required', !$scope.schema.Required || $scope.choices.length > 0);

						return viewValue;
					}
				};


				SPFieldDirective.baseLinkFn.apply(directive, arguments);


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

		}; // Directive definition object


		return spfieldMultichoice_DirectiveDefinitionObject;

	} // Directive factory

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

	['SPFieldDirective',

	function spfielNote_DirectiveFactory(SPFieldDirective) {

		var spfieldNote_DirectiveDefinitionObject = {

			restrict: 'EA',
			require: ['^spform', 'ngModel'],
			replace: true,
			scope: {
				mode: '@',
				value: '=ngModel'
			},
			templateUrl: 'templates/form-templates/spfield-control.html',


			link: function($scope, $element, $attrs, controllers) {


				var directive = {
					
					fieldTypeName: 'note',
					replaceAll: false
				};


				SPFieldDirective.baseLinkFn.apply(directive, arguments);

			} // link

		}; // Directive definition object


		return spfieldNote_DirectiveDefinitionObject;

	} // Directive factory

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

	['SPFieldDirective', 'SPUtils',

	function spfieldNumber_DirectiveFactory(SPFieldDirective, SPUtils) {

		var spfieldNumber_DirectiveDefinitionObject = {

			restrict: 'EA',
			require: ['^spform', 'ngModel'],
			replace: true,
			scope: {
				mode: '@',
				value: '=ngModel'
			},
			templateUrl: 'templates/form-templates/spfield-control.html',


			link: function($scope, $element, $attrs, controllers) {


				var directive = {
					
					fieldTypeName: 'number',
					replaceAll: false,

					init: function() {

						var xml = SPUtils.parseXmlString($scope.schema.SchemaXml);
						var percentage = xml.documentElement.getAttribute('Percentage') || 'false';
						var decimals = xml.documentElement.getAttribute('Decimals') || 'auto';
						$scope.schema.Percentage = percentage.toLowerCase() === 'true';
						$scope.schema.Decimals = parseInt(decimals);
						$scope.cultureInfo = (typeof __cultureInfo == 'undefined' ? Sys.CultureInfo.CurrentCulture : __cultureInfo);
					},

					parserFn: function(viewValue) {
						
						// Number validity
						directive.setValidity('number', !viewValue || (!isNaN(+viewValue) && isFinite(viewValue)));

						// TODO: Update 'spfieldValidationMessages' directive to include the number validity error message.

						// Adjust value to match field type 'Double' in SharePoint.
						if (viewValue === '' || viewValue === void 0) {
						
							$scope.value = null;
						}
						
						return $scope.value;
					}
				};


				SPFieldDirective.baseLinkFn.apply(directive, arguments);

			} // link

		}; // Directive definition object


		return spfieldNumber_DirectiveDefinitionObject;

	} // Directive factory

]);





///////////////////////////////////////
//	SPNumber
///////////////////////////////////////

angular.module('ngSharePoint').directive('spPercentage', 

	[

	function spPercentage_DirectiveFactory() {

		var spPercentageDirectiveDefinitionObject = {

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

			} // link

		}; // Directive definition object


		return spPercentageDirectiveDefinitionObject;

	} // Directive factory

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

	['SPFieldDirective',

	function spfieldText_DirectiveFactory(SPFieldDirective) {

		var spfieldText_DirectiveDefinitionObject = {

			restrict: 'EA',
			require: ['^spform', 'ngModel'],
			replace: true,
			scope: {
				mode: '@',
				value: '=ngModel'
			},
			templateUrl: 'templates/form-templates/spfield-control.html',


			link: function($scope, $element, $attrs, controllers) {


				var directive = {
					
					fieldTypeName: 'text',
					replaceAll: false
				};


				SPFieldDirective.baseLinkFn.apply(directive, arguments);

			} // link

		}; // Directive definition object


		return spfieldText_DirectiveDefinitionObject;

	} // Directive factory

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

	['SPFieldDirective',

	function spfieldUrl_DirectiveFactory(SPFieldDirective) {

		var spfieldUrl_DirectiveDefinitionObject = {

			restrict: 'EA',
			require: ['^spform', 'ngModel'],
			replace: true,
			scope: {
				mode: '@',
				value: '=ngModel'
			},
			templateUrl: 'templates/form-templates/spfield-control.html',


			link: function($scope, $element, $attrs, controllers) {


				var directive = {

					fieldTypeName: 'url',
					replaceAll: false,

					init: function() {

						$scope.UrlFieldTypeText = Strings.STS.L_UrlFieldTypeText;
						$scope.UrlFieldTypeDescription = Strings.STS.L_UrlFieldTypeDescription;
						$scope.UrlFieldClickText = Strings.STS.L_UrlFieldClickText;
						$scope.Description_Text = Strings.STS.L_Description_Text;
					},

					parserFn: function(viewValue) {
						
						// Required validity
						directive.setValidity('required', !$scope.schema.Required || ($scope.value && $scope.value.Url));
						
						// Url validity
						var validUrlRegExp = new RegExp('^http://');
						var isValidUrl = (!$scope.value || ($scope.value && !$scope.value.Url) || ($scope.value && $scope.value.Url && validUrlRegExp.test($scope.value.Url)));
						directive.setValidity('url', isValidUrl);
						
						// TODO: Update 'spfieldValidationMessages' directive to include the url validity error message.

						return viewValue;
					}
				};


				SPFieldDirective.baseLinkFn.apply(directive, arguments);

			} // link

		}; // Directive definition object


		return spfieldUrl_DirectiveDefinitionObject;

	} // Directive factory

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

	['SPFieldDirective', '$q', '$timeout', '$filter', 'SharePoint', 'SPUtils',

	function spfieldUser_DirectiveFactory(SPFieldDirective, $q, $timeout, $filter, SharePoint, SPUtils) {

		var spfieldUserDirectiveDefinitionObject = {

			restrict: 'EA',
			require: ['^spform', 'ngModel'],
			replace: true,
			scope: {
				mode: '@',
				value: '=ngModel'
			},
			templateUrl: 'templates/form-templates/spfield-control-loading.html',


			link: function($scope, $element, $attrs, controllers) {


				var directive = {
					
					fieldTypeName: 'user',
					replaceAll: false,

					init: function() {

						$scope.noUserPresenceAlt = STSHtmlEncode(Strings.STS.L_UserFieldNoUserPresenceAlt);
						$scope.idPrefix = $scope.schema.InternalName + '_'+ $scope.schema.Id;
					},
					
					parserFn: function(viewValue) {

						if ($scope.schema.AllowMultipleValues) {

							var hasValue = $scope.value && $scope.value.results.length > 0;
							directive.setValidity('required', !$scope.schema.Required || hasValue);

						} else {

							//directive.setValidity('required', !$scope.schema.Required || !!$scope.value);
							// NOTE: Required validator is implicitly applied when no multiple values.

							// Checks for 'peoplePicker' due to when in 'display' mode it's not created.
							if ($scope.peoplePicker) {
								
								// Unique validity (Only one value is allowed)
								directive.setValidity('unique', $scope.peoplePicker.TotalUserCount <= 1);
							}
						}

						return viewValue;
					},

					watchModeFn: function(newValue) {

						refreshData();
					},

					watchValueFn: function(newValue, oldValue) {

						if (newValue === oldValue) return;

						// Adjust the model if no value is provided
						if (($scope.value === null || $scope.value === void 0) && $scope.schema.AllowMultipleValues) {
							$scope.value = { results: [] };
						}

						$scope.selectedUserItems = void 0;
						refreshData();
					},

					postRenderFn: function(html) {

						if ($scope.currentMode === 'edit') {
							var peoplePickerElementId = $scope.idPrefix + '_$ClientPeoplePicker';

							$timeout(function() {
								initializePeoplePicker(peoplePickerElementId);
							});
						}

					}
				};


				SPFieldDirective.baseLinkFn.apply(directive, arguments);				



				// ****************************************************************************
				// Refresh the user data and render the field.
				//
				function refreshData() {

					// Adjust the model if no value is provided
					if (($scope.value === null || $scope.value === void 0) && $scope.schema.AllowMultipleValues) {
						$scope.value = { results: [] };
					}

					// Show loading animation.
					directive.setElementHTML('<div><img src="/_layouts/15/images/loadingcirclests16.gif" alt="" /></div>');

					// Gets the data for the user (lookup) and then render the field.
					getUserData().then(function() {

						directive.renderField($scope.currentMode);

					}, function() {

						directive.setElementHTML('<div style="color: red;">Error al recuperar el usuario {{value}}.</div>');

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
				// Gets an user item by ID from the users list.
				//
				function getUserItem(itemId) {

					return getLookupList().then(function(list) {

						return list.getItemById(itemId);

					});

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
						/*
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
						*/

						var getUserItemsPromises = [];

						if ($scope.schema.AllowMultipleValues) {

							angular.forEach($scope.value.results, function(selectedItem) {

								//var selectedUserItem = $filter('filter')(items, { Id: selectedItem }, true)[0];
								var userItemPromise = getUserItem(selectedItem).then(function(selectedUserItem) {

									if (selectedUserItem !== void 0) {

										var userItem = {
											Title: selectedUserItem[$scope.schema.LookupField] || selectedUserItem.Title,
											url: selectedUserItem.list.web.url.rtrim('/') + '/_layouts/15/userdisp.aspx' + '?ID=' + $scope.value + '&Source=' + encodeURIComponent(window.location),
											data: selectedUserItem
										};

										$scope.selectedUserItems.push(userItem);
									}

								});

								getUserItemsPromises.push(userItemPromise);

							});

						} else {

							// If no value returns an empty object for corrent binding
							var userItem = {
								Title: '',
								url: '',
								data: null
							};


							if ($scope.value === null || $scope.value === void 0) {

								$scope.selectedUserItems.push(userItem);

							} else {

								//var selectedUserItem = $filter('filter')(items, { Id: $scope.value }, true)[0];
								var userItemPromise = getUserItem($scope.value).then(function(selectedUserItem) {

									if (selectedUserItem !== void 0) {

										userItem = {
											Title: selectedUserItem[$scope.schema.LookupField] || selectedUserItem.Title,
											url: selectedUserItem.list.web.url.rtrim('/') + '/_layouts/15/userdisp.aspx' + '?ID=' + $scope.value + '&Source=' + encodeURIComponent(window.location),
											data: selectedUserItem
										};

										$scope.selectedUserItems.push(userItem);
									}

								});

								getUserItemsPromises.push(userItemPromise);
							}
						}

						// Resolves all 'getUserItem' promises
						$q.all(getUserItemsPromises).then(function() {

							def.resolve($scope.selectedUserItems);

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
				    	UserInfoListId: $scope.schema.LookupList,
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

				    $scope.peoplePicker = peoplePicker;

				    if (peoplePicker !== void 0 && peoplePicker !== null) {

				    	// Get information about all users.
				    	//var users = peoplePicker.GetAllUserInfo();


				    	// Maps the needed callback functions...

				    	//peoplePicker.OnControlValidateClientScript = function(peoplePickerId, entitiesArray) {};

				    	//peoplePicker.OnValueChangedClientScript = function(peoplePickerId, entitiesArray) {};

				    	peoplePicker.OnUserResolvedClientScript = function(peoplePickerId, entitiesArray) {

				    		//console.log('OnUserResolvedClientScript', peoplePickerId, entitiesArray);

							var resolvedValues = [];
							var promises = [];

				    		angular.forEach(entitiesArray, function(entity) {

				    			if (entity.IsResolved) {

				    				if ($scope.schema.AllowMultipleValues || promises.length === 0) {

					    				var entityPromise;

					    				if (entity.EntityType === 'User') {

					    					// Get the user ID
						    				entityPromise = SPUtils.getUserId(entity.Key).then(function(userId) {

						    					resolvedValues.push(userId);
						    					return resolvedValues;
						    				});

						    			} else {

						    				// Get the group ID
						    				entityPromise = $q.when(resolvedValues.push(entity.EntityData.SPGroupID));
						    			}

					    				promises.push(entityPromise);

					    			} else {

					    				// Force to commit the value through the model controller $parsers and $validators pipelines.
					    				// This way the validators will be launched and the view will be updated.
					    				$scope.modelCtrl.$setViewValue($scope.modelCtrl.$viewValue);
					    			}
				    			}
				    		});


							if (promises.length > 0) {
					    		
					    		$q.all(promises).then(function() {

					    			updateModel(resolvedValues);

					    		});

					    	} else {

					    		updateModel(resolvedValues);
					    	}
				    	};
				    }
				}



				function updateModel(resolvedValues) {

					if ($scope.schema.AllowMultipleValues === true) {

						$scope.value.results = resolvedValues;

					} else {

						$scope.value = resolvedValues[0] || null;
					}

					$scope.modelCtrl.$setViewValue($scope.value);
				}
				


				// ****************************************************************************
				// Query the picker for user information.
				// NOTE: This function is actually not used.
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

			} // link

		}; // Directive definition object


		return spfieldUserDirectiveDefinitionObject;

	} // Directive factory

]);

/*
    SPFieldValidationMessages - directive
    
    Pau Codina (pau.codina@kaldeera.com)
    Pedro Castro (pedro.castro@kaldeera.com, pedro.cm@gmail.com)

    Copyright (c) 2014
    Licensed under the MIT License
*/



///////////////////////////////////////
//  SPFieldValidationMessages
///////////////////////////////////////

angular.module('ngSharePoint').directive('spfieldValidationMessages', 

    [

    function spfieldValidationMessages_DirectiveFactory() {

        var spfieldValidationMessages_DirectiveDefinitionObject = {

            restrict: 'E',
            replace: true,
            templateUrl: 'templates/form-templates/spfield-validation-messages.html',


            link: function($scope, $element, $attrs) {

                $scope.SPClientRequiredValidatorError = Strings.STS.L_SPClientRequiredValidatorError;
            }

        };


        return spfieldValidationMessages_DirectiveDefinitionObject;

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

	function spfield_DirectiveFactory($compile, $templateCache, $http) {

		var spfield_DirectiveDefinitionObject = {

			restrict: 'EA',
			require: '^?spform',
			template: '<div></div>',

			link: function($scope, $element, $attrs, spformController) {

				var name = ($attrs.name || $attrs.spfield);
				var schema;

				if (spformController) schema = spformController.getFieldSchema(name);

				
				if (schema !== void 0) {

					// Checks if attachments are enabled in the list when process the 'Attachments' field.
					if (name === 'Attachments') {

						var item = spformController.getItem();

						if (item !== void 0 && item.list !== void 0 && item.list.EnableAttachments === false) {

							console.error('Can\'t add "Attachments" field because the attachments are disabled in the list.');
							setEmptyElement();
							return;

						}

					}


					$http.get('templates/form-templates/spfield.html', { cache: $templateCache }).success(function(html) {

						var originalAttrs = $element[0].attributes;
						var elementAttributes = '';
						var cssClasses = ['spfield-wrapper'];

						for (var i = 0; i < originalAttrs.length; i++) {
	                        
							var nameAttr = originalAttrs.item(i).nodeName;
							var valueAttr = originalAttrs.item(i).value;

							if (nameAttr == 'ng-repeat') continue;
							if (nameAttr == 'spfield') nameAttr = 'name';
							if (nameAttr == 'class') {
								// Removes AngularJS classes (ng-*)
								valueAttr = valueAttr.replace(/ng-[\w-]*/g, '').trim();

								// If there aren't classes after the removal, skips the 'class' attribute.
								if (valueAttr === '') continue;

								cssClasses.push(valueAttr);

								// Leave the 'class' attribute just in the main element (field wrapper) 
								// and do not propagate the attribute to child elements.
								continue;
							}

							elementAttributes += nameAttr + '="' + valueAttr + '" ';
						}


						html = html.replace(/\{\{attributes\}\}/g, elementAttributes.trim());
						html = html.replace(/\{\{classAttr\}\}/g, cssClasses.join(' '));
						
	                    var newElement = $compile(html)($scope);
						$element.replaceWith(newElement);
						$element = newElement;

					});

				} else {

					console.error('Unknown field "' + $attrs.name + '"');
					setEmptyElement();

				}


				function setEmptyElement() {

					var emptyElement = '';
					$element.replaceWith(emptyElement);
					$element = emptyElement;

				}


			} // link

		}; // Directive definition object


        return spfield_DirectiveDefinitionObject;

	} // Directive factory

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

	function spformRule_DirectiveFactory($compile, $templateCache, $http, $animate) {

		var spformruleDirectiveDefinitionObject = {
			
			restrict: 'E',
			transclude: true,

			link: function ($scope, $element, $attrs, ctrl, transcludeFn) {

				if ($element.parent().length > 0) {

					if ($attrs.templateUrl) {

						$http.get($attrs.templateUrl, { cache: $templateCache }).success(function (html) {

							var newElement = $compile(html)($scope);
							$element.replaceWith(newElement);
							$element = newElement;

						});

					} else {

						transcludeFn($scope, function (clone) {

							for(var i = clone.length - 1; i >= 0; i--) {
								var e = clone[i];
								//$animate.enter(element, parentElement, afterElement, [options]);
								$animate.enter(e, $element.parent(), $element);
							}
							
						});

						$element.remove();
						$element = null;
					}
				}
				
			} // link

		}; // Directive definition object


		return spformruleDirectiveDefinitionObject;

	} // Directive factory

]);

/*
    SPFormToolbar - directive
    
    Pau Codina (pau.codina@kaldeera.com)
    Pedro Castro (pedro.castro@kaldeera.com, pedro.cm@gmail.com)

    Copyright (c) 2014
    Licensed under the MIT License
*/



///////////////////////////////////////
//  SPFormToolbar
///////////////////////////////////////

angular.module('ngSharePoint').directive('spformToolbar', 

    ['$compile', 'SPUtils', 'SPRibbon',

    function spformToolbar_DirectiveFactory($compile, SPUtils, SPRibbon) {

        var spformToolbarDirectiveDefinitionObject = {

            restrict: 'EA',
            templateUrl: 'templates/form-templates/spform-toolbar.html',
            require: '^spform',
            replace: true,
            transclude: true,


            controller: function spformToolbarController($scope) {

                this.getFormCtrl = function() {

                    return $scope.formCtrl;

                };


                this.getRibbonToolbar = function() {

                    return $scope.ribbonToolbar;

                };


                this.showToolbarInRibbon = function() {

                    return $scope.showToolbarInRibbon;

                };

            },



            link: function($scope, $element, $attrs, spformController, transcludeFn) {

                $scope.formCtrl = spformController;
                $scope.ribbonToolbar = null;


                // ****************************************************************************
                // Watch for form mode changes.
                //
                $scope.$watch(spformController.getFormMode, function(newValue, oldValue) {

                    //if($scope.currentMode === newValue) return;

                    $scope.currentMode = newValue;
                    processToolbar();

                });



                function isRibbonNeeded(clone) {

                    var ribbonNeeded = false;
                    $scope.showToolbarInRibbon = ($attrs.showInRibbon === 'true');


                    // Iterate over 'clone' elements to check if there are 'action' elements and are not the default actions.
                    for (var i = 0; i < clone.length; i++) {

                        var elem = clone[i];

                        if (elem.tagName !== void 0) {

                            var showInRibbon = false;

                            if (elem.hasAttribute('show-in-ribbon')) {

                                showInRibbon = (elem.getAttribute('show-in-ribbon').toLowerCase() === 'true');

                            } else {

                                showInRibbon = $scope.showToolbarInRibbon;

                            }

                            if (showInRibbon) {

                                // Checks for '<spform-toolbar-button>' element
                                if ((elem.tagName.toLowerCase() === 'spform-toolbar-button' && elem.hasAttribute('action')) || elem.hasAttribute('spform-toolbar-button')) {

                                    var actionAttr = elem.getAttribute('action').toLowerCase();

                                    // Checks if the action is a default action
                                    if (actionAttr !== 'save' && actionAttr !== 'cancel' && actionAttr !== 'close') {

                                        ribbonNeeded = true;
                                        break;

                                    }

                                }

                                // Checks for '<any sp-action="">' element
                                if (elem.hasAttribute('sp-action')) {

                                    var spActionAttr = elem.getAttribute('sp-action').toLowerCase();

                                    // Checks if the action is a default action
                                    if (spActionAttr !== 'save' && spActionAttr !== 'cancel' && spActionAttr !== 'close') {

                                        ribbonNeeded = true;
                                        break;

                                    }

                                }
                                
                            }

                        }

                    }


                    return ribbonNeeded;

                } // isRibbonNeeded


                function processToolbar() {

                    // Compila el contenido en el scope correcto.
                    var transcludeElement = $element.find('[sp-transclude]');


                    // Ensure 'transclusion' element.
                    if ((transcludeElement === void 0 || transcludeElement.length === 0) && $element.attr('sp-transclude') !== void 0) {
                        transcludeElement = $element;
                    }

                    // If no transclude element found could be that has been replaced by 
                    // another directive with less priority. i.e.: ngIf or spIf
                    // 
                    if (transcludeElement === void 0 || transcludeElement.length === 0) return;


                    // Makes the transclusion
                    transcludeFn($scope, function(clone) {
                        
                        // Checks if there are elements to transclude before processing the ribbon.
                        if (isRibbonNeeded(clone)) {

                            SPRibbon.ready().then(function() {

                                $scope.ribbonToolbar = SPRibbon.createToolbar($attrs.name, $attrs.tabTitle);

                            });

                        } else {

                            $scope.ribbonToolbar = null;
                            
                        }

                        // Empty the contents
                        transcludeElement.empty();

                        // Iterate over clone elements and appends them to 'transcludeElement' unless the comments.
                        angular.forEach(clone, function(elem){

                            if (elem.nodeType !== elem.COMMENT_NODE) {

                                transcludeElement.append(elem);

                            }

                        });

                    });


                    // Checks if there are transcluded content
                    if (transcludeElement.contents().length === 0) {

                        // Append default toolbar buttons
                        switch($scope.currentMode) {

                            case 'display':
                                //transcludeElement.append($compile('<button type="button" sp-action="close">' + STSHtmlEncode(Strings.STS.L_CloseButtonCaption) + '</button>')($scope));
                                transcludeElement.append('<button type="button" sp-action="close">' + STSHtmlEncode(Strings.STS.L_CloseButtonCaption) + '</button>');
                                break;

                            case 'edit':
                                /*
                                transcludeElement.append($compile('<button type="button" sp-action="save">' + STSHtmlEncode(Strings.STS.L_SaveButtonCaption) + '</button>')($scope));
                                transcludeElement.append($compile('<button type="button" sp-action="cancel">' + STSHtmlEncode(Strings.STS.L_CancelButtonCaption) + '</button>')($scope));
                                */
                                transcludeElement.append('<button type="button" sp-action="save">' + STSHtmlEncode(Strings.STS.L_SaveButtonCaption) + '</button>');
                                transcludeElement.append('<button type="button" sp-action="cancel">' + STSHtmlEncode(Strings.STS.L_CancelButtonCaption) + '</button>');
                                break;
                        }

                        $compile(transcludeElement)($scope);

                    }

                } // processToolbar

            } // link

        }; // Directive definition object


        return spformToolbarDirectiveDefinitionObject;

    } // Directive factory

]);

/*
    SPForm - directive
    
    Pau Codina (pau.codina@kaldeera.com)
    Pedro Castro (pedro.castro@kaldeera.com, pedro.cm@gmail.com)

    Copyright (c) 2014
    Licensed under the MIT License
*/



///////////////////////////////////////
//  SPForm
///////////////////////////////////////

angular.module('ngSharePoint').directive('spform', 

    ['SPUtils', '$compile', '$templateCache', '$http', '$q', '$timeout', 'SPExpressionResolver', 'SPListItem',

    function spform_DirectiveFactory(SPUtils, $compile, $templateCache, $http, $q, $timeout, SPExpressionResolver, SPListItem) {

        var spform_DirectiveDefinitionObject = {

            restrict: 'EA',
            transclude: true,
            replace: true,
            scope: {
                item: '=item',
                mode: '=mode',
                extendedSchema: '=',
                onPreSave: '&',
                onPostSave: '&',
                onCancel: '&'
                // NOTE: The functions 'onPreSave', 'onPostSave' and 'onCancel' must be 
                //       function references (without parenthesis).
                //       Using this technique allows us to pass the right argument values.
                //
                //       e.g. assigning the function directly (WRONG):
                //              <spform ... on-pre-save="myOnPreSaveFn()" ... ></spform>
                //
                //       e.g. assigning the function reference (CORRECT):
                //              <spform ... on-pre-save="myOnPreSaveFn" ... ></spform>
                //
            },
            templateUrl: 'templates/form-templates/spform.html',


            controllerAs: 'spformCtrl',


            controller: ['$scope', '$attrs', function spformController($scope, $attrs) {


                this.status = {
                    IDLE: 0,
                    PROCESSING: 1
                };

                
                this.getItem = function() {

                    return $scope.item;
                };


                this.getFormCtrl = function() {

                    // Returns the 'ng-form' directive controller
                    return $scope.ngFormCtrl;
                };


                this.isNew = function() {

                    return $scope.item.isNew();
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


                this.fieldValueChanged = function(fieldName, newValue, oldValue) {

                    // Propagate to child Elements/Fields
                    $scope.$broadcast(fieldName + '_changed', newValue, oldValue);

                    // Propagate to parent Elements/Controllers
                    $scope.$emit(fieldName + '_changed', newValue, oldValue);
                    
                };


                this.getFormMode = function() {

                    return $scope.mode || 'display';
                };


                this.setFormMode = function(newMode) {

                    $scope.mode = newMode;
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


                this.setFormStatus = function(status) {

                    $timeout(function() {

                        $scope.formStatus = status;
                        $scope.$apply();

                    }, 0);
                };


                this.setFieldFocus = function(fieldName) {

                    var fieldFocused;

                    // Ensure 'focusElements' array.
                    this.focusElements = this.focusElements || [];

                    // Set the focus in the field specified by @fieldName argument or, if not defined,
                    // in the first invalid field found or, if there are no invalid fields, in
                    // the first field.

                    for (var i = 0; i < this.focusElements.length; i++) {
                        
                        if (fieldName !== void 0) {

                            // If argument @fieldName is defined, set the focus in the field specified (if found).
                            if (this.focusElements[i].name === fieldName) {

                                fieldFocused = this.focusElements[i].element;
                                break;
                            }

                        } else {

                            // If argument @fieldName is not defined, set the focus in the first invalid field.
                            var control = $scope.ngFormCtrl[this.focusElements[i].name];

                            if (control && control.$invalid) {

                                fieldFocused = this.focusElements[i].element;
                                break;

                            }
                        }
                    }

                    // If there are not invalid field focused, focus the first field.
                    if (!fieldFocused && this.focusElements.length > 0) {

                        fieldFocused = this.focusElements[0].element;

                    }

                    // Set the focus on the final element if exists.
                    if (fieldFocused) {

                        fieldFocused.focus();

                    }

                    return fieldFocused;

                };



                this.save = function(options) {

                    var self = this;
                    var def = $q.defer();
                    var dlg;


                    function closeDialog() {
                        if (dlg) dlg.close();
                    }


                    // Process @options argument.
                    // If is a string, assumes the value as the redirect url to use after the save operation.
                    // Otherwise, process as an object with the next properties:
                    //
                    //      redirectUrl:    The url to redirect after the save operation. Default is undefined.
                    //      force:          Indicates that must perform the save operation even if the form is not valid.
                    //                      Default is FALSE.
                    //      silent:         Indicates that runs in 'silent' mode, i.e., don't show the 'Working on it...' dialog.
                    //                      Default is FALSE.
                    //
                    // NOTE: This options are unavailable when use the built-in toolbar which uses the default options.
                    //
                    if (angular.isString(options)) {

                        options = {
                            redirectUrl: options
                        };

                    } else {

                        // If @options is not an object, initializes it as an object.
                        if (!angular.isObject(options) || angular.isArray(options)) {

                            options = {};
                        }
                    }


                    // Change the form to a 'dirty' state.
                    $scope.ngFormCtrl.$setDirty();

                    // Check the form validity broadcasting a 'validate' event to all the fields.
                    if (!$scope.ngFormCtrl.$valid) {

                        $q.when($scope.$broadcast('validate')).then(function(result) {

                            // Set the focus in the first invalid field.
                            var fieldFocused = self.setFieldFocus();

                            $scope.$broadcast('postValidate', fieldFocused);
                            $scope.$emit('postValidate', fieldFocused);

                        });

                        // Check if 'force' option is enabled.
                        // If so, continues with the saving process even if there are invalid fields.
                        // Otherwise, cancel the saving process.
                        //
                        // NOTE: Must check if there are fields that will generate an error when saving the item.
                        //       e.g. If the user sets an string in a numeric field and so on.
                        //
                        if (options.force !== true) {

                            def.reject();
                            return def.promise;

                        }
                    }

                    $scope.formStatus = this.status.PROCESSING;

                    // Shows the 'Working on it...' dialog.
                    if (options.silent !== true) {
                        dlg = SP.UI.ModalDialog.showWaitScreenWithNoClose(SP.Res.dialogLoading15);
                    }


                    // Removes all the custom 'virtual' fields.
                    angular.forEach($scope.schema, function(field, key) {

                        if (field.isVirtualField) {

                            delete $scope.item[key];

                        }

                    });


                    // Invoke 'onPreSave' function and pass the 'item' and the 'originalItem' as arguments.
                    $q.when(($scope.onPreSave || angular.noop)()($scope.item, $scope.originalItem)).then(function(result) {

                        // If the 'onPreSave' function returns FALSE, cancels the save operation.
                        if (result !== false) {

                            $scope.item.save().then(function(data) {

                                $scope.formStatus = this.status.IDLE;

                                // Invoke 'onPostSave' function and pass the 'item' and the 'originalItem' as arguments.
                                $q.when(($scope.onPostSave || angular.noop)()($scope.item, $scope.originalItem)).then(function(result) {

                                    if (result !== false) {

                                        // Default 'post-save' action.
                                        //self.closeForm(options.redirectUrl);
                                        def.resolve(result);

                                    } else {

                                        def.reject();

                                    }

                                    // Close the 'Working on it...' dialog.
                                    closeDialog();
                                    
                                }, function() {

                                    // At this point, the 'OnPostSave' promise has been rejected 
                                    // due to an exception or manually by the user.

                                    closeDialog();
                                    def.reject();
                                    
                                });

                            }, function(err) {

                                // At this point, the 'item.save' promise has been rejected 
                                // due to an exception.

                                console.error(err);
                                closeDialog();

                                // Shows a popup with the error details.
                                var dom = document.createElement('div');
                                dom.innerHTML = '<div style="color:brown">' + err.code + '<br/><strong>' + err.message + '</strong></div>';

                                SP.UI.ModalDialog.showModalDialog({
                                    title: SP.Res.dlgTitleError,
                                    html: dom,
                                    showClose: true,
                                    autoSize: true,
                                    dialogReturnValueCallback: function() {
                                        def.reject();
                                    }
                                });

                            });

                        } else {

                            // At this point, the 'OnPreSave' promise has been canceled 
                            // by the user (By the 'onPreSave' method implemented by the user).

                            closeDialog();
                            def.reject();

                        }
                        
                    }, function() {

                        // At this point, the 'OnPreSave' promise has been rejected 
                        // due to an exception or manually by the user.

                        closeDialog();
                        def.reject();

                    });


                    return def.promise;

                };


                this.cancel = function(redirectUrl) {

                    var self = this;
                    var def = $q.defer();

                    // Change the form to a 'pristine' state to avoid field validation.
                    $scope.ngFormCtrl.$setPristine();

                    $scope.formStatus = this.status.PROCESSING;

                    // Invoke 'onCancel' function and pass the 'item' and the 'originalItem' as arguments.
                    $q.when(($scope.onCancel || angular.noop)()($scope.item, $scope.originalItem)).then(function(result) {

                        if (result !== false) {

                            // Performs the default 'cancel' action...
                            //self.closeForm(redirectUrl);

                            // Restore the item to its 'original' value.
                            //$scope.item = angular.copy($scope.originalItem);
                            $scope.item = new SPListItem($scope.originalItem.list, $scope.originalItem);

                            def.resolve(result);

                        } else {

                            def.reject();

                        }


                    }, function() {

                        // When error, should close the form ?
                        //self.closeForm(redirectUrl);
                        def.reject();
                    });

                    return def.promise;
                };
 
 
 
                this.closeForm = function(redirectUrl) {
 
                    if (redirectUrl !== void 0) {
 
                        window.location = redirectUrl;
 
                    } else {
                         
                        window.location = utils.getQueryStringParamByName('Source') || _spPageContextInfo.webServerRelativeUrl;
 
                    }
 
                };

            }], // controller property



            compile: function compile(element, attrs/*, transcludeFn (DEPRECATED)*/) {

                return {

                    pre: function prelink($scope, $element, $attrs, spformController, transcludeFn) {
                    
                        // Sets the form 'name' attribute if user don't provide it.
                        // This way has always available the 'ng-form' directive controller for form validations.
                        if (!$attrs.name) {
                            $attrs.$set('name', 'spform');
                        }

                    },



                    post: function postLink($scope, $element, $attrs, spformController, transcludeFn) {

                        // Makes an internal reference to the 'ng-form' directive controller for form validations.
                        // (See pre-linking function above).
                        $scope.ngFormCtrl = $scope[$attrs.name];


                        // Checks if the page is in design mode.
                        $scope.isInDesignMode = SPUtils.inDesignMode();
                        if ($scope.isInDesignMode) return;



                        // Watch for form mode changes
                        $scope.$watch('mode', function(newValue, oldValue) {

                            if (newValue === void 0 || newValue === oldValue) return;

                            loadItemTemplate();

                        });



                        // Watch for item changes
                        $scope.$watch('item', function(newValue, oldValue) {

                            // Checks if the item has a value
                            if (newValue === void 0) return;

                            // Store a copy of the original item.
                            // See 'onPreSave', 'onPostSave' and 'onCancel' callbacks in the controller's 'save' method.

                            // Using the 'angular.copy' method, the objects __proto__ are different.
                            //$scope.originalItem = angular.copy(newValue);

                            // Instead, create a 'new SPListItem(@list, @data)' that use the 'angular.extend' method.
                            $scope.originalItem = new SPListItem($scope.item.list, $scope.item);

                            loadItemTemplate();

                        });



                        function loadItemTemplate() {
                            
                            // Checks if the form is already being processed.
                            if ($scope.formStatus === spformController.status.PROCESSING) return;

                            // Ensure item has a value
                            if (!angular.isDefined($scope.item)) return;

                            // Ensure mode has a value
                            if (!angular.isDefined($scope.mode)) {

                                $scope.mode = spformController.getFormMode();

                            }


                            // Update form status
                            $scope.formStatus = spformController.status.PROCESSING;


                            // Gets the schema (fields) of the list.
                            // Really, gets the fields of the list content type specified in the 
                            // item or, if not specified, the default list content type.
                            $scope.item.list.getProperties().then(function() {

                                $scope.item.list.getFields().then(function(listFields) {

                                    $scope.item.list.getContentType($scope.item.ContentTypeId).then(function(contentType) {

                                        contentType.getFields().then(function(ctFields) {

                                            var fields = ctFields;

                                            // The 'Attachments' field belongs to the list not to the content type.
                                            // So adds it to the content type fields, if needed.
                                            if ($scope.item.list.EnableAttachments) {

                                                fields.Attachments = listFields.Attachments;

                                            }

                                            // Sets the final schema
                                            $scope.schema = fields;

                                            // Checks for an 'extendedSchema' and applies it.
                                            if (angular.isDefined($scope.extendedSchema) && angular.isDefined($scope.extendedSchema.Fields)) {

                                                // The next instruction replaces the entire field definition. Wrong way!
                                                //angular.extend($scope.schema, $scope.extendedSchema.Fields);

                                                /*
                                                 * Temporary solution:
                                                 *
                                                 * Expand all the existent fields individually and then add the
                                                 * inexistent ones.
                                                 *
                                                 */

                                                angular.forEach($scope.extendedSchema.Fields, function(extendedField, fieldName) {

                                                    var fieldSchema = $scope.schema[fieldName];

                                                    if (angular.isDefined(fieldSchema)) {

                                                        extendedField.hasExtendedSchema = true;
                                                        extendedField.originalTypeAsString = fieldSchema.TypeAsString;

                                                        angular.extend($scope.schema[fieldName], extendedField);

                                                    } else {

                                                        extendedField.isVirtualField = true;
                                                        $scope.schema[fieldName] = extendedField;

                                                    }

                                                });

                                                /*
                                                 * TODO:
                                                 *
                                                 * Make a deep angular.extend without replacing existing properties and, optionally, 
                                                 * with a limit of recursion levels to avoid infinite loops due to redundant objects.
                                                 *
                                                 */

                                            }

                                            // Search for the 'transclusion-container' attribute in the 'spform' template elements.
                                            var elements = $element.find('*');
                                            var transclusionContainer;

                                            angular.forEach(elements, function(elem) {
                                                if (elem.attributes['transclusion-container'] !== void 0) {
                                                    transclusionContainer = angular.element(elem);
                                                }
                                            });


                                            // Ensure 'transclusion' element.
                                            if (transclusionContainer === void 0 || transclusionContainer.length === 0) {
                                                transclusionContainer = $element;
                                            }


                                            /*
                                            // Remove the 'loading animation' element
                                            var loadingAnimation = document.querySelector('#form-loading-animation-wrapper-' + $scope.$id);
                                            if (loadingAnimation !== void 0) angular.element(loadingAnimation).remove();
                                            */


                                            transclusionContainer.empty(); // Needed?


                                            // Check for 'templateUrl' attribute
                                            if ($attrs.templateUrl) {

                                                // Apply the 'templateUrl' attribute
                                                $http.get($attrs.templateUrl, { cache: $templateCache }).success(function(html) {

                                                    parseRules(transclusionContainer, angular.element(html), false).then(function() {

                                                        /*
                                                        $compile(transclusionContainer)($scope);
                                                        $scope.formStatus = spformController.status.IDLE;
                                                        dialogResize();
                                                        */

                                                        compile(transclusionContainer);

                                                    });

                                                }).error(function(data, status, headers, config, statusText) {

                                                    $element.html('<div><h2 class="ms-error">' + data + '</h2><p class="ms-error">Form Template URL: <strong>' + $attrs.templateUrl + '</strong></p></div>');

                                                    /*
                                                    $compile(transclusionContainer)($scope);
                                                    $scope.formStatus = spformController.status.IDLE;
                                                    dialogResize();
                                                    */

                                                    compile(transclusionContainer);

                                                });

                                            } else {

                                                // Apply transclusion
                                                transcludeFn($scope, function(clone) {
                                                    
                                                    parseRules(transclusionContainer, clone, true).then(function() {

                                                        // If no content was detected within the 'spform' element, generates a default form template.
                                                        if (transclusionContainer[0].children.length === 0) {

                                                            $scope.fields = [];

                                                            angular.forEach($scope.schema, function(field) {
                                                                if (!field.Hidden && !field.Sealed && !field.ReadOnlyField && field.InternalName !== 'ContentType') {
                                                                    $scope.fields.push(field);
                                                                }
                                                            });

                                                            $http.get('templates/form-templates/spform-default.html', { cache: $templateCache }).success(function (html) {

                                                                transclusionContainer.append(html);
                                                                /*
                                                                $compile(transclusionContainer)($scope);
                                                                $scope.formStatus = spformController.status.IDLE;
                                                                dialogResize();
                                                                */

                                                                compile(transclusionContainer);

                                                            });

                                                        } else {

                                                            /*
                                                            $scope.formStatus = spformController.status.IDLE;
                                                            dialogResize();
                                                            */

                                                            compile(transclusionContainer);

                                                        }
                                                    });
                                                });

                                            }

                                        });

                                    });

                                });

                            });

                        } // loadItemTemplate



                        function compile(element) {

                            $q.when($compile(element)($scope)).then(function() {

                                // Remove the 'loading animation' element if still present.
                                var loadingAnimation = document.querySelector('#form-loading-animation-wrapper-' + $scope.$id);
                                if (loadingAnimation !== void 0) angular.element(loadingAnimation).remove();

                                // Waits for the next $digest cycle when all the DOM has been rendered.
                                $timeout(function() {

                                    // Sets the form to its idle status.
                                    $scope.formStatus = spformController.status.IDLE;

                                    // Checks for dialog and resize if needed.
                                    dialogResize();

                                    // Broadcast the 'formRenderComplete' event to form childs.
                                    $scope.$broadcast('formRenderComplete');

                                    // Also emit the event to parent elements/controllers.
                                    $scope.$emit('formRenderComplete');

                                });

                            });

                        } // compile



                        function parseRules(targetElement, sourceElements, isTransclude, elementIndex, deferred, terminalRuleAdded) {

                            elementIndex = elementIndex || 0;
                            deferred = deferred || $q.defer();
                            terminalRuleAdded = terminalRuleAdded || false;

                            // Gets the element to parse.
                            var elem = sourceElements[elementIndex++];

                            // Resolve the promise when there are no more elements to parse.
                            if (elem === void 0) {

                                deferred.resolve();
                                return deferred.promise;
                            }


                            // Initialize the 'rules' array for debug purposes.
                            $scope.rules = $scope.rules || [];


                            // Check if 'elem' is a <spform-rule> element.
                            if (elem.tagName !== void 0 && elem.tagName.toLowerCase() == 'spform-rule') {

                                // Check if a previous 'terminal' <spform-rule> element was detected.
                                if (!terminalRuleAdded) {

                                    var testExpression = 'false',
                                        terminalExpression = 'false';

                                    // Check for 'test' attribute
                                    if (elem.hasAttribute('test')) {
                                        testExpression = elem.getAttribute('test');
                                    }

                                    // Check for 'terminal' attribute
                                    if (elem.hasAttribute('terminal')) {
                                        terminalExpression = elem.getAttribute('terminal');
                                    }


                                    // Resolve 'test' attribute expressions.
                                    SPExpressionResolver.resolve(testExpression, $scope).then(function(testResolved) {

                                        // Evaluates the test expression.
                                        if ($scope.$eval(testResolved)) {

                                            // Update the 'test' attribute value
                                            elem.setAttribute('test', testResolved);


                                            // Resolve the 'terminal' attribute expression
                                            SPExpressionResolver.resolve(terminalExpression, $scope).then(function(terminalResolved) {

                                                // Update the 'terminal' attribute value
                                                elem.setAttribute('terminal', terminalResolved);

                                                // Evaluates the 'terminal' attribute
                                                terminalRuleAdded = $scope.$eval(terminalResolved);


                                                // Resolve 'expressions' within the 'spform-rule' element.
                                                SPExpressionResolver.resolve(elem.outerHTML, $scope).then(function(elemResolved) {

                                                    var elem = angular.element(elemResolved)[0];

                                                    // Append the element to the final form template
                                                    targetElement.append(elem);


                                                    // Add the rule to the 'rules' array for debug purposes.
                                                    $scope.rules.push({
                                                        test: testExpression, 
                                                        testResolved: testResolved, 
                                                        terminal: terminalExpression, 
                                                        terminalResolved: terminalResolved,
                                                        solved: true
                                                    });


                                                    // Process the next element
                                                    parseRules(targetElement, sourceElements, isTransclude, elementIndex, deferred, terminalRuleAdded);

                                                });
                                            });

                                        } else {

                                            if (isTransclude) {

                                                // NOTE: If this function is called from a transclusion function, removes the 'spform-rule' 
                                                //       elements when the expression in its 'test' attribute evaluates to FALSE.
                                                //       This is because when the transclusion is performed the elements are inside the 
                                                //       current 'spform' element and should be removed.
                                                //       When this function is called from an asynchronous template load ('templete-url' attribute), 
                                                //       the elements are not yet in the element.
                                                elem.remove();
                                                elem = null;
                                            }


                                            // Add the rule to the 'rules' array for debug purposes.
                                            $scope.rules.push({
                                                test: testExpression, 
                                                testResolved: testResolved,
                                                terminal: terminalExpression, 
                                                terminalResolved: 'n/a',
                                                solved: false
                                            });


                                            // Process the next element
                                            parseRules(targetElement, sourceElements, isTransclude, elementIndex, deferred, terminalRuleAdded);
                                        }
                                        
                                    });

                                } else {

                                    // Process the next element
                                    parseRules(targetElement, sourceElements, isTransclude, elementIndex, deferred, terminalRuleAdded);

                                }

                            } else {

                                // Append the element to the final form template
                                targetElement.append(elem);


                                // Process the next element
                                parseRules(targetElement, sourceElements, isTransclude, elementIndex, deferred, terminalRuleAdded);
                            }


                            return deferred.promise;

                        } // parseRules private function



                        // Checks if SharePoint is rendering the form in a dialog, and if so 
                        // resizes it after de DOM is loaded using the $timeout service.
                        //
                        function dialogResize() {

                            if (SP.UI.ModalDialog.get_childDialog()) {

                                $timeout(function() {

                                    SP.UI.ModalDialog.get_childDialog().autoSize();

                                });

                            }

                        } // dialogResize


                    } // compile.post-link

                }; // compile function return

            } // compile property

        }; // Directive definition object


        return spform_DirectiveDefinitionObject;

    } // Directive factory function

]);

/*
    SPItemAuthoringinfo - directive
    
    Pau Codina (pau.codina@kaldeera.com)
    Pedro Castro (pedro.castro@kaldeera.com, pedro.cm@gmail.com)

    Copyright (c) 2014
    Licensed under the MIT License
*/



///////////////////////////////////////
//  SPItemAuthoringinfo
///////////////////////////////////////

(function() {
    
    'use strict';

    angular
        .module('ngSharePoint')
        .directive('spitemAuthoringinfo', spitemAuthoringinfo);


    spitemAuthoringinfo.$inject = ['SharePoint'];


    /* @ngInject */
    function spitemAuthoringinfo(SharePoint) {

        var directive = {

            restrict: 'EA',
            replace: true,
            templateUrl: 'templates/form-templates/spitem-authoringinfo.html',
            link: postLink

        };

        return directive;

        

        ///////////////////////////////////////////////////////////////////////////////



        function postLink(scope, element, attrs) {

            scope.cultureInfo = (typeof __cultureInfo == 'undefined' ? Sys.CultureInfo.CurrentCulture : __cultureInfo);

            // Init localized texts

            scope.contentTypeText = 'Content Type';
            // NOTA: El ContentType únicamente se muestra cuando está activa la administración de tipos de contenido en la lista.

            scope.versionText = SP.Res.storefront_AppDetails_Version;
            // NOTA: La versión únicamente se muestra cuando está activo en control de versiones en la lista.

            scope.createdAtText = 'Created at';
            scope.lastModifiedText = 'Last modified at';
            scope.byText = 'by';

            // TODO: Gets the above strings in the correct localization !!!
            //       The strings are located at wss.resx that currently can't load dinamically.


            scope.isNewItem = scope.item.isNew();


            if (scope.item && !scope.isNewItem) {

                // Gets the item info
                scope.createdDate = scope.item.Created;
                scope.modifiedDate = scope.item.Modified;
                scope.authorName = null;
                scope.editorName = null;

                // Gets 'Author' properties
                scope.item.list.web.getUserById(scope.item.AuthorId).then(function(author) {

                    scope.authorName = author.Title;
                    scope.authorLink = _spPageContextInfo.webAbsoluteUrl + '/_layouts/15/userdisp.aspx?ID=' + scope.item.AuthorId;

                });

                // Gets 'Editor' properties
                scope.item.list.web.getUserById(scope.item.EditorId).then(function(editor) {

                    scope.editorName = editor.Title;
                    scope.editorLink = _spPageContextInfo.webAbsoluteUrl + '/_layouts/15/userdisp.aspx?ID=' + scope.item.EditorId;

                });

            }


            // Try to get original generated authoring info
            scope.originalAuthoringInfoFound = false;
            var originalAuthoringInfoElement = document.getElementById('ngsharepoint-formbinder-authoringinfo');

            if (originalAuthoringInfoElement) {

                element.append(originalAuthoringInfoElement);
                originalAuthoringInfoElement.style.display = 'block';
                scope.originalAuthoringInfoFound = true;
            }


        } // postLink

    } // Directive factory function

})();

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

angular.module('ngSharePoint').directive('spuser', 

	['SharePoint', 

	function spuser_DirectiveFactory(SharePoint) {

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

angular.module('ngSharePoint').directive('spworkingonit', 

	[

	function spworkingonit_DirectiveFactory() {

		return {

			restrict: 'EA',
			templateUrl: 'templates/spworking-on-it.html'

		};

	}

]);

/*
	newlines - filter
	
	Pau Codina (pau.codina@kaldeera.com)
	Pedro Castro (pedro.castro@kaldeera.com, pedro.cm@gmail.com)

	Copyright (c) 2014
	Licensed under the MIT License
*/



///////////////////////////////////////
//  newlines
///////////////////////////////////////

angular.module('ngSharePoint').filter('newlines', 

    ['$sce', 

    function newlines_Filter($sce) {

        return function(text) {

            return $sce.trustAsHtml((text || '').replace(/\n\r?/g, '<br/>'));
        };
        
    }
]);

/*
	unsafe - filter
	
	Pau Codina (pau.codina@kaldeera.com)
	Pedro Castro (pedro.castro@kaldeera.com, pedro.cm@gmail.com)

	Copyright (c) 2014
	Licensed under the MIT License
*/



///////////////////////////////////////
//  unsafe
///////////////////////////////////////

angular.module('ngSharePoint').filter('unsafe', 

    ['$sce', 

    function unsafe_Filter($sce) {

        return function(val) {

            return $sce.trustAsHtml(val);
        };
        
    }
]);

/*
 *  Module: ngSharePointFormPage
 *  Directive: spformpage
 *
 *  Adds 'spform' directive and bootstrap the angular application with the correct SharePoint List/Item page context.
 *
 */

angular.module('ngSharePointFormPage', ['ngSharePoint', 'oc.lazyLoad']);



angular.module('ngSharePointFormPage').config(

    ['SPConfigProvider', '$ocLazyLoadProvider', 

    function(SPConfigProvider, $ocLazyLoadProvider) {

        SPConfigProvider.options.loadMinimalSharePointInfraestructure = false;
        //SPConfigProvider.options.forceLoadResources = true;

        // Config ocLazyLoad...
        // If you use angular.bootstrap(...) to launch your application, you need to define the main app module as a loaded module.
        $ocLazyLoadProvider.config({

            loadedModules: ['ngSharePoint', 'ngSharePointFormPage']

        });

    }

]);



angular.module('ngSharePointFormPage').directive('spformpage', 

    ['SharePoint', 'SPUtils', 'SPListItem', '$q', '$http', '$templateCache', '$compile', 'ctx', '$ocLazyLoad', 'SPExpressionResolver', 

    function(SharePoint, SPUtils, SPListItem, $q, $http, $templateCache, $compile, ctx, $ocLazyLoad, SPExpressionResolver) {
        
        return {

            restrict: 'EA',

            link: function($scope, $element, $attrs) {

                var listId = _spPageContextInfo.pageListId;
                var itemId = utils.getQueryStringParamByName('ID');

                // Sets the form mode
                //$scope.mode = (ctx.ControlMode == SPClientTemplates.ClientControlMode.NewForm || ctx.ControlMode == SPClientTemplates.ClientControlMode.EditForm ? 'edit' : 'display');

                var controlMode = 'display';
                var currentMode = 'display';
                $scope.mode = 'display';
                /*
                 * SPClientTemplates.ClientControlMode:
                 *
                 * Invalid: 0
                 * DisplayForm: 1
                 * EditForm: 2
                 * NewForm: 3
                 * View: 4
                 *
                 */

                switch(ctx.ControlMode) {

                    case SPClientTemplates.ClientControlMode.Invalid:
                        controlMode = 'invalid';
                        currentMode = 'display';
                        $scope.mode = 'display';
                        break;

                    case SPClientTemplates.ClientControlMode.DisplayForm:
                        controlMode = 'display';
                        currentMode = 'display';
                        $scope.mode = 'display';
                        break;

                    case SPClientTemplates.ClientControlMode.EditForm:
                        controlMode = 'edit';
                        currentMode = 'edit';
                        $scope.mode = 'edit';
                        break;

                    case SPClientTemplates.ClientControlMode.NewForm:
                        controlMode = 'new';
                        currentMode = 'edit';
                        $scope.mode = 'edit';
                        break;

                    case SPClientTemplates.ClientControlMode.View:
                        controlMode = 'view';
                        currentMode = 'display';
                        $scope.mode = 'display';
                        break;

                }


                // Checks if the 'listId' exists.
                if (listId === void 0) {
                    throw 'Can\'t access to the page context list or the page context does not exists.';
                }



                SharePoint.getWeb().then(function(web) {

                    $scope.web = web;

                    web.getList(listId).then(function(list) {

                        $scope.list = list;

                        list.getProperties().then(function(props) {

                            getItem(itemId).then(function(item) {

                                // Load dependencies
                                loadDependencies(item).then(function(formDefinition) {

                                    if (formDefinition.formModesOverride) {

                                        $scope.mode = formDefinition.formModesOverride[controlMode] || currentMode;

                                        // If no valid override mode specified, sets the mode back to its default value.
                                        if ($scope.mode !== 'display' && $scope.mode !== 'edit') {

                                            $scope.mode = currentMode;

                                        }

                                    }

                                    // Try to get the template
                                    getTemplateUrl().then(function(templateUrl) {

                                        var formController = formDefinition.formController;
                                        var useControllerAsSyntax = formDefinition.useControllerAsSyntax;
                                        var spformHTML = '';

                                        $scope.extendedSchema = formDefinition.extendedSchema || {};

                                        if (!angular.isDefined(formController)) {

                                            spformHTML = '<div data-spform="true" mode="mode" item="item" extended-schema="extendedSchema" template-url="' + templateUrl + '"></div>';

                                        } else {

                                            spformHTML = '<div ng-controller="' + formController + (useControllerAsSyntax ? ' as appCtrl">' : '">') +
                                                         '    <div data-spform="true" mode="mode" item="item" extended-schema="$parent.extendedSchema" on-pre-save="appCtrl.onPreSave" on-post-save="appCtrl.onPostSave" on-cancel="appCtrl.onCancel" template-url="' + templateUrl + '"></div>' +
                                                         '</div>';
                                        }


                                        var newElement = $compile(spformHTML)($scope);
                                        $element.replaceWith(newElement);
                                        $element = newElement;


                                        preBind(item).finally(function() {

                                            // Sets the item
                                            $scope.item = item;

                                        });

                                    });

                                }, function(err) {

                                    console.error(err);

                                });

                            });

                        });


                    }, function(error) {

                        console.log('Error list', error);

                    });

                }, function(error) {

                    console.log('Error web', error);

                });




                function getItem(itemId) {

                    var deferred = $q.defer();
                    var item = null;


                    if (ctx.ControlMode == SPClientTemplates.ClientControlMode.NewForm) {

                        var data = {
                            ContentTypeId: utils.getQueryStringParamByName('ContentTypeId')
                        };

                        var newItem = new SPListItem($scope.list, data);
                        deferred.resolve(newItem);

                    } else {

                        $scope.list.getItemById(itemId).then(function(item) {

                            deferred.resolve(item);

                        }, function(err) {

                            console.log('Error item', err);

                        });
                        
                    }

                    return deferred.promise;

                } // getItem




                function getTemplateUrl() {

                    var deferred = $q.defer();
                    //var mode = SPClientTemplates.Utility.ControlModeToString(ctx.ControlMode);
                    var mode = (controlMode == 'new' ? controlMode : $scope.mode);
                    var templateUrl = $scope.web.url.rtrim('/') + '/ngSharePointFormTemplates/' + $scope.list.Title + '-' + ctx.ListData.Items[0].ContentType + '-' + mode + 'Form.html';

                    // Check if the 'templateUrl' is valid, i.e. the template exists.
                    $http.get(templateUrl, { cache: $templateCache }).success(function(html) {

                        // Returns the 'templateUrl'
                        deferred.resolve(templateUrl);

                    }).error(function(data, status, headers, config, statusText) {

                        // No valid template url specified.
                        console.log(data);

                        // The 'SPForm' directive will be generated with the default form template, so
                        // returns an empty 'templateUrl'.
                        deferred.resolve('');

                    });

                    return deferred.promise;

                } // getTemplateUrl



                function loadDependencies(item) {

                    var deferred = $q.defer();

                    // TODO: Hacer un $http para comprobar que exista el script de definición.
                    //       Si no existe, generar error? utilizar uno vacío? ... ???


                    SP.SOD.registerSod('formDefinition', $scope.web.url.rtrim('/') + '/ngSharePointFormTemplates/' + $scope.list.Title + '-' + ctx.ListData.Items[0].ContentType + '-definition.js');

                    SP.SOD.executeFunc('formDefinition', null, function() {

                        // Process the form definition object and load dependencies.
                        // NOTE: Here should have the variable 'formDefinition'.
                        var dependencies = [];

                        if (formDefinition !== void 0) {

                            var formDefinitionScope = $scope.$new();
                            formDefinitionScope.item = item;

                            SPExpressionResolver.resolve(angular.toJson(formDefinition), formDefinitionScope).then(function(formDefinitionResolved) {

                                // Destroys the scope
                                formDefinitionScope.$destroy();

                                // Replaces the token ~site with the site relative url
                                formDefinitionResolved = formDefinitionResolved.replace(/~site/g, $scope.web.url.rtrim('/'));

                                // Converts back the JSON object resolved to a real object.
                                formDefinition = angular.fromJson(formDefinitionResolved);

                                // Process AngularJS modules dependencies.
                                angular.forEach(formDefinition.angularModules, function(module) {

                                    dependencies.push(module);

                                });

                                // Process JavaScript dependencies (Non AngularJS scripts).
                                angular.forEach(formDefinition.jsIncludes, function(js) {

                                    dependencies.push(js);

                                });


                                // Process CSS dependencies.
                                angular.forEach(formDefinition.cssIncludes, function(css) {

                                    dependencies.push(css);

                                });


                                // Process other.
                                // ...


                                $ocLazyLoad.load(dependencies).then(function() {

                                    deferred.resolve(formDefinition);

                                });

                            });

                        } else {

                            deferred.resolve({});
                            
                        }

                    });


                    return deferred.promise;

                } // loadDependencies



                function preBind(item) {

                    var elementScope = $element.scope();
                    var onPreBind;

                    if (angular.isDefined(elementScope.appCtrl)) {

                        onPreBind = elementScope.appCtrl.onPreBind;

                    }

                    return $q.when((onPreBind || angular.noop)(item));
                    
                } // preBind

            }

        };

    }

]);


/*
var element = document.querySelector('[data-spformpage]');

if (element) {
    angular.bootstrap(element, ['ngSharePointFormPage']);
}
*/
