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

	    } else {

	    	return undefined;
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

		if (response.statusCode !== 204 && response.status !== 204) {

			d = angular.fromJson(response.body || response.data || '{ "d": {} }').d;

			if (d.results) {
				d = d.results;
			}

		}

		// If a new REQUESTDIGEST value was received in the last server call,
		// update the __REQUESTDIGEST form control with the new value.
		if (response.headers !== null && response.headers['X-REQUESTDIGEST']) {

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



    /**
	// ***************************************************************************
	// getFunctionParameterNames
	//
	// Returns an array with the names of the parameters of a function.
	//
	// @func: {function} The function name without the parenthesis.
	// @returns: {Array[{String}]} The names of the parameters.
	*/
	getFunctionParameterNames: function(func) {

		var STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;
		var ARGUMENT_NAMES = /([^\s,]+)/g;

		var fnStr = func.toString().replace(STRIP_COMMENTS, '');
		var result = fnStr.slice(fnStr.indexOf('(') + 1, fnStr.indexOf(')')).match(ARGUMENT_NAMES);

		return result || [];
	},


	/**
	 * Extening object that entered in first argument.
	 * Returns extended object
	 */
	extend: function(obj) {

		if (typeof obj !== 'object') return obj;

		var source, prop;
		for (var i = 1, length = arguments.length; i < length; i++) {

			source = arguments[i];

			for (prop in source) {
				if (hasOwnProperty.call(source, prop)) {
					obj[prop] = source[prop];
				}
			}
		}

		return obj;
	},


	/**
	 * Extening object that entered in first argument.
	 * Returns extended object or false if have no target object or incorrect type.
	 * If you wish to clone object, simply use that:
	 *  deepExtend({}, yourObj_1, [yourObj_N]) - first arg is new empty object
	 */
	deepExtend: function (/*obj_1, [obj_2], [obj_N]*/) {
		if (arguments.length < 1 || typeof arguments[0] !== 'object') {
			return false;
		}

		if (arguments.length < 2) return arguments[0];

		var target = arguments[0];

		// convert arguments to array and cut off target object
		var args = Array.prototype.slice.call(arguments, 1);

		var key, val, src, clone, tmpBuf;

		args.forEach(function (obj) {
			if (typeof obj !== 'object') return;

			for (key in obj) {
				if ( ! (key in obj)) continue;

				src = target[key];
				val = obj[key];

				if (val === target) continue;

				if (typeof val !== 'object' || val === null) {
					target[key] = val;
					continue;
				// } else if (val instanceof Buffer) {
				// 	tmpBuf = new Buffer(val.length);
				// 	val.copy(tmpBuf);
				// 	target[key] = tmpBuf;
				// 	continue;
				} else if (val instanceof Date) {
					target[key] = new Date(val.getTime());
					continue;
				} else if (val instanceof RegExp) {
					target[key] = new RegExp(val);
					continue;
				}

				if (typeof src !== 'object' || src === null) {
					clone = (Array.isArray(val)) ? [] : {};
					target[key] = utils.deepExtend(clone, val);
					continue;
				}

				if (Array.isArray(val)) {
					clone = (Array.isArray(src)) ? src : [];
				} else {
					clone = (!Array.isArray(src)) ? src : {};
				}

				target[key] = utils.deepExtend(clone, val);
			}
		});

		return target;

	}	// deepExtend

};

////////////////////////////////////////////////////////////////////////////////
// This method is used to solve the bug of SharePoint Datepicker that jumps to
// top of window in Chrome.
function OnIframeLoadFinish() {
    var picker;

    if (typeof this.Picker !== 'undefined')
        picker = this.Picker;
    if (picker !== null && typeof picker.readyState !== 'undefined' && picker.readyState !== null && picker.readyState === "complete") {
        document.body.scrollLeft = g_scrollLeft;
        document.body.scrollTop = g_scrollTop;
        g_scrollTop = document.getElementById('s4-workspace').scrollTop;
        picker.style.display = "block";
        if (typeof document.frames !== 'undefined' && Boolean(document.frames)) {
            var frame = document.frames[picker.id];

            if (frame !== null && typeof frame.focus === 'function')
                frame.focus();
        }
        else {
            picker.focus();
        }
    }
    setTimeout(function(){
        document.getElementById('s4-workspace').scrollTop = g_scrollTop;
    }, 1);
}

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


/**
 * @ngdoc overview
 * @name ngSharePoint
 *
 * @description 
 * ### ngSharePoint (core module)
 * The ngSharePoint module is an Angular wrapper for SharePoint 2013.
 * 
 * ## Usage
 * To use ngSharePoint you'll need to include this module as a dependency within your angular app.
 * <pre>
 *
 *     	// In your module application include 'ngSharePoint' as a dependency
 *     	var myApp = angular.module('myApp', ['ngSharePoint']);
 *
 * </pre>
 * 
 * @author Pau Codina [<pau.codina@kaldeera.com>]
 * @author Pedro Castro [<pedro.cm@gmail.com>]
 * @license Licensed under the MIT License
 * @copyright Copyright (c) 2014
 */

angular.module('ngSharePoint', ['CamlHelper']);




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




/** 
 * Module constants
 */
angular.module('ngSharePoint').value('Constants', {
	errorTemplate: 'templates/error.html',
	userProfileUrl: '_layouts/userdisp.aspx?ID='
});



/**
 * @ngdoc object
 * @name ngSharePoint.SharePoint
 *
 * @description
 * Provides top level access to SharePoint web sites api. Through this provider it is possible to access to any SharePoint web.
 *
 * @requires ngSharePoint.SPUtils
 * @requires ngSharePoint.SPWeb
 */


angular.module('ngSharePoint').provider('SharePoint', 

	[

	function SharePoint_Provider() {

		'use strict';

		var SharePoint = function($cacheFactory, $q, SPUtils, SPWeb) {


			/**
			 * @ngdoc function
			 * @name ngSharePoint.SharePoint#getCurrentWeb
			 * @methodOf ngSharePoint.SharePoint
			 * 
			 * @description
			 * Returns an {@link ngSharePoint.SPWeb SPWeb} object initialized with the 
			 * current SharePoint web. That means, the web context where 
			 * this sentence is executed
			 * 
			 * @returns {promise} Promise with a new {@link ngSharePoint.SPWeb SPWeb} object that allows access to
			 * web methods and properties
			 * 
			 * @example
			 * <pre>
			 *	SharePoint.getCurrentWeb().then(function(web) {
			 *	  // ... do something with the web object
			 *	});
			 * </pre>
			 */
			this.getCurrentWeb = function() {
				return this.getWeb();
			};


			/**
			 * @ngdoc function
			 * @name ngSharePoint.SharePoint#getWeb
			 * @methodOf ngSharePoint.SharePoint
			 * 
			 * @description
			 * Returns the {@link ngSharePoint.SPWeb SPWeb} specified by the required url
			 * 
			 * @param {string} url The url of the web that you want to retrieve
			 * @returns {promise} Promise with a new {@link ngSharePoint.SPWeb SPWeb} object that allows access to
			 * web methods and properties
			 * 
			 * @example
			 * <pre>
			 *	SharePoint.getWeb('/sites/rrhh').then(function(web) {
			 *	  // ... do something with the 'rrhh' web object
			 *	});
			 * </pre>
			 */
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

/**
 * @ngdoc object
 * @name ngSharePoint.SPContentType
 *
 * @description
 * SPContentType factory provides access to all content types (web or list). This factory allows 
 * retrieval of associated fields. It also, allows to get and set `jsLink` properties.
 *
 * *At the moment, not all SharePoint API methods for content type objects are implemented in ngSharePoint*
 *
 */


angular.module('ngSharePoint').factory('SPContentType', 

    ['$q', 'SPCache', 'SPFolder', 'SPListItem', 

    function SPContentType_Factory($q, SPCache, SPFolder, SPListItem) {

        'use strict';


        /**
         * @ngdoc function
         * @name ngSharePoint.SPContentType#constructor
         * @constructor
         * @methodOf ngSharePoint.SPContentType
         *
         * @description
         * Instantiates a new `SPContentType` object for a specific web or list content type in the server.
         * It's possible to specify their properties.
         *
         * @param {object} parentObject A valid {@link ngSharePoint.SPWeb SPWeb} or {@link ngSharePoint.SPList SPList} object where the content type is associated.
         * @param {string} id Content type ID.
         * @param {object} contentTypeProperties Properties to initialize the object
         *
         * @example
         * Use {@link ngSharePoint.SPList#getContentType SPList.getContentType} and {@link ngSharePoint.SPList#getContentTypes SPList.getContentTypes} to 
         * retrieve instances of the associated content types.
         *
         * <pre>
         *   list.getContentType('Issue').then(function(issueCt) {
         *
         *     issueCt.getFields().then(function() {
         *
         *          angular.forEach(issueCt.Fields, function(field) {
         *              console.log(field.Title);
         *          });
         *
         *     });
         *   });
         * </pre>
         *
         */
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

                if (contentTypeProperties.Fields !== void 0 && contentTypeProperties.Fields.results !== void 0) {

                    // process fields --> $expand: 'Fields'

                    var fields = {};

                    angular.forEach(contentTypeProperties.Fields.results, function(field) {
                        fields[field.InternalName] = field;
                    });

                    contentTypeProperties.Fields = fields;
                }

                utils.cleanDeferredProperties(contentTypeProperties);
                angular.extend(this, contentTypeProperties);
            }
        };




        /**
         * @ngdoc function
         * @name ngSharePoint.SPContentType#getFields
         * @methodOf ngSharePoint.SPContentType
         *
         * @description
         * This method retrieves the Fields collection of the content type and creates a new object property
         * called "Fields" that contains a named property for every field.
         *
         * After a call to this method, the schema of every field is available in the content type and all
         * their properties (default values, validation expressions, choice values or lookup properties).
         *
         * For a complete list of field properties go to Microsoft
         * SharePoint {@link https://msdn.microsoft.com/EN-US/library/dn600182.aspx#bk_FieldProperties field api reference}.
         * Also, there are additional field specific properties that you can retrieve
         * based on the field type:
         * {@link https://msdn.microsoft.com/EN-US/library/dn600182.aspx#bk_FieldCalculated FieldCalculated},
         * {@link https://msdn.microsoft.com/EN-US/library/dn600182.aspx#bk_FieldCollection FieldCollection},
         * {@link https://msdn.microsoft.com/EN-US/library/dn600182.aspx#bk_FieldComputed FieldComputed},
         * {@link https://msdn.microsoft.com/EN-US/library/dn600182.aspx#bk_FieldDateTime FieldDateTime},
         * {@link https://msdn.microsoft.com/EN-US/library/dn600182.aspx#bk_FieldGeolocation FieldGeolocation},
         * {@link https://msdn.microsoft.com/EN-US/library/dn600182.aspx#bk_FieldGuid FieldGuid},
         * {@link https://msdn.microsoft.com/EN-US/library/dn600182.aspx#bk_FieldLookup FieldLookup and FieldUser},
         * {@link https://msdn.microsoft.com/EN-US/library/dn600182.aspx#bk_FieldMultiChoice FieldMultiChoice, FieldChoice, and FieldRatingScale},
         * {@link https://msdn.microsoft.com/EN-US/library/dn600182.aspx#bk_FieldMultiLineText FieldMultiLineText},
         * {@link https://msdn.microsoft.com/EN-US/library/dn600182.aspx#bk_FieldNumber FieldNumber and FieldCurrency},
         * {@link https://msdn.microsoft.com/EN-US/library/dn600182.aspx#bk_FieldText FieldText},
         * {@link https://msdn.microsoft.com/EN-US/library/dn600182.aspx#bk_FieldUrl FieldUrl},
         *
         * With all of this information, you might construct new interfaces (views, forms, etc) that follow
         * definitions of any SharePoint content type.
         *
         * *Note*: The list of fields of the list isn't necessaray equal to the item content type.
         *
         * @returns {promise} promise with an object that contains all of the fields schema
         *
         * @example
         * <pre>
         *   // a pre-initialized "ct" object ...
         *   ct.getFields().then(function() {
         *
         *       // at this point, you have access to the definition of any content type field
         *       console.log(ct.Fields.Title.DefaultValue);
         *       // this returns '' or any defined value
         *
         *       console.log(ct.Fields.DueDate.Required);                 
         *       // this returns true or false
         *
         *       console.log(ct.Fields.Editor.ReadOnlyField);
         *       // this returns true
         *
         *       console.log(ct.Fields.ProjectStatus.Choices.results);
         *       // this returns an array with available choices ['Open', 'Closed', 'Draft']
         *   });
         *
         * </pre>
         *
         */
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


        /**
        * Modify the ´jsLinkUrl` property of the content type.
        * *Internal use*
        */
        SPContentTypeObj.prototype.setJSLink = function(jsLinkUrl) {

            var self = this;
            var deferred = $q.defer();

            var url;

            if (self.__parent.url) {
                url = self.__parent.url;
            }

            if (url === void 0 && self.__parent.web) {

                url = self.__parent.web.url;
            }

            var ctx;

            if (url === void 0) {

                ctx = SP.ClientContext.get_current();
            } else {

                ctx = new SP.ClientContext(url);
            }
            
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



        /**
        * Retrieves the ´jsLinkUrl` property of the content type.
        * *Internal use*
        */
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

/**
 * @ngdoc object
 * @name ngSharePoint.SPExpressionResolvercurrentUser
 *
 * @description
 * SPExpressionResolvercurrentUser provides functionality to solve current user expressions.
 * 
 */

angular.module('ngSharePoint').factory('SPExpressionResolvercurrentUser', 

    ['SharePoint', 

    function SPExpressionResolvercurrentUser_Factory(SharePoint) {

        'use strict';

        var PARTS_REGEXP = /[\[./]([\w )]+)/g;

        function getExpressionParts(text) {

            var matches = [];
            var match;

            while ((match = PARTS_REGEXP.exec(text))) {

                match.shift();
                matches.push(match.join(''));
            }

            return matches;
        }

        function createExpressionValue(scope, name, value) {

            if (scope.expressions !== void 0) {

                var extendedExpression = {
                    currentUser: {
                    }
                };
                if (angular.isArray(name)) {

                    var valueObject = value;

                    for(var r = name.length - 1; r > 0; r--) {

                        var childValue = valueObject;
                        valueObject = {};
                        valueObject[name[r]] = childValue;

                    }

                    extendedExpression.currentUser[name[0]] = valueObject;

                } else {
                    extendedExpression.currentUser[name] = value;
                }

                scope.expressions = utils.deepExtend(extendedExpression, scope.expressions);
            }

        }

        return {

            resolve: function(expression, scope) {

                return SharePoint.getCurrentWeb().then(function(web) {
                
                    return web.getList('UserInfoList').then(function(list) {

                        var queryParts = getExpressionParts(expression);

                        return list.getItemProperty(_spPageContextInfo.userId, queryParts.join('/')).then(function(data) {

                            var value = data[queryParts[queryParts.length - 1]];
                            createExpressionValue(scope, queryParts, value);
                            return 'expressions.currentUser.' + queryParts.join('.');

                        }, function() {

                            return 'expressions.currentUser.' + queryParts.join('.');
                        });
                    });
                });
            }

        };

    }
]);


/**
 * @ngdoc object
 * @name ngSharePoint.SPExpressionResolveritem
 *
 * @description
 * SPExpressionResolverItem provides functionality to solve item expressions.
 * 
 */

angular.module('ngSharePoint').factory('SPExpressionResolveritem', 

    [

    function SPExpressionResolverItem_Factory() {

        'use strict';

        var PARTS_REGEXP = /[\[./]([\w )]+)/g;

        function getExpressionParts(text) {

            var matches = [];
            var match;

            while ((match = PARTS_REGEXP.exec(text))) {

                match.shift();
                matches.push(match.join(''));
            }

            return matches;
        }

        function createExpressionValue(scope, name, value) {

            if (scope.expressions !== void 0) {

                var extendedExpression = {
                    item: {
                    }
                };
                if (angular.isArray(name)) {

                    var valueObject = value;

                    for(var r = name.length - 1; r > 0; r--) {

                        var childValue = valueObject;
                        valueObject = {};
                        valueObject[name[r]] = childValue;

                    }

                    extendedExpression.item[name[0]] = valueObject;

                } else {
                    extendedExpression.item[name] = value;
                }

                scope.expressions = utils.deepExtend(extendedExpression, scope.expressions);
            }

        }

        return {

            resolve: function(expression, scope) {

                var queryParts = getExpressionParts(expression);

                if (queryParts.length == 1) {

                    var value = scope.item[queryParts[0]];
                    createExpressionValue(scope, queryParts[0], value);
                    return 'expressions.item.' + queryParts[0];

                } else {

                    return scope.item.list.getItemProperty(scope.item.Id, queryParts.join('/')).then(function(data) {

                        var value = data[queryParts[queryParts.length - 1]];
                        createExpressionValue(scope, queryParts, value);
                        return 'expressions.item.' + queryParts.join('.');
                
                    }, function() {

                        return 'expressions.item.' + queryParts.join('.');
                    });
                }
            }

        };

    }
]);


/**
 * @ngdoc object
 * @name ngSharePoint.SPExpressionResolverlist
 *
 * @description
 * SPExpressionResolverlist provides functionality to solve list expressions.
 * 
 */

angular.module('ngSharePoint').factory('SPExpressionResolverlist', 

    [

    function SPExpressionResolverList_Factory() {

        'use strict';

        var PARTS_REGEXP = /[\[./]([\w )]+)/g;

        function getExpressionParts(text) {

            var matches = [];
            var match;

            while ((match = PARTS_REGEXP.exec(text))) {

                match.shift();
                matches.push(match.join(''));
            }

            return matches;
        }

        function createExpressionValue(scope, name, value) {

            if (scope.expressions !== void 0) {

                var extendedExpression = {
                    list: {
                    }
                };
                if (angular.isArray(name)) {

                    var valueObject = value;

                    for(var r = name.length - 1; r > 0; r--) {

                        var childValue = valueObject;
                        valueObject = {};
                        valueObject[name[r]] = childValue;

                    }

                    extendedExpression.list[name[0]] = valueObject;

                } else {
                    extendedExpression.list[name] = value;
                }

                scope.expressions = utils.deepExtend(extendedExpression, scope.expressions);
            }

        }

        return {

            resolve: function(expression, scope) {

                var queryParts = getExpressionParts(expression);

                return scope.item.list.getProperties().then(function(properties) {

                    var value = properties[queryParts[0]];
                    createExpressionValue(scope, queryParts[0], value);
                    return 'expressions.list.' + queryParts[0];
                });
            }

        };

    }
]);


/**
 * @ngdoc object
 * @name ngSharePoint.SPExpressionResolverparam
 *
 * @description
 * SPExpressionResolverparam provides functionality to solve param expressions.
 * 
 */

angular.module('ngSharePoint').factory('SPExpressionResolverparam', 

    [

    function SPExpressionResolverParam_Factory() {

        'use strict';

        var PARTS_REGEXP = /[\[./]([\w )]+)/g;

        function getExpressionParts(text) {

            var matches = [];
            var match;

            while ((match = PARTS_REGEXP.exec(text))) {

                match.shift();
                matches.push(match.join(''));
            }

            return matches;
        }

        return {

            resolve: function(expression, scope) {

                var paramName = getExpressionParts(expression)[0];
                var value = utils.getQueryStringParamByName(paramName);

                if (scope.expressions !== void 0) {

                    var extendedExpression = {
                        param: {
                        }
                    };
                    extendedExpression.param[paramName] = value;

                    scope.expressions = utils.deepExtend(extendedExpression, scope.expressions);
                }
                return 'expressions.param.' + paramName;
            }

        };

    }
]);


/**
 * @ngdoc object
 * @name ngSharePoint.SPExpressionResolverweb
 *
 * @description
 * SPExpressionResolverweb provides functionality to solve web expressions.
 * 
 */

angular.module('ngSharePoint').factory('SPExpressionResolverweb', 

    [

    function SPExpressionResolverWeb_Factory() {

        'use strict';

        var PARTS_REGEXP = /[\[./]([\w )]+)/g;

        function getExpressionParts(text) {

            var matches = [];
            var match;

            while ((match = PARTS_REGEXP.exec(text))) {

                match.shift();
                matches.push(match.join(''));
            }

            return matches;
        }

        function createExpressionValue(scope, name, value) {

            if (scope.expressions !== void 0) {

                var extendedExpression = {
                    web: {
                    }
                };
                if (angular.isArray(name)) {

                    var valueObject = value;

                    for(var r = name.length - 1; r > 0; r--) {

                        var childValue = valueObject;
                        valueObject = {};
                        valueObject[name[r]] = childValue;

                    }

                    extendedExpression.web[name[0]] = valueObject;

                } else {
                    extendedExpression.web[name] = value;
                }

                scope.expressions = utils.deepExtend(extendedExpression, scope.expressions);
            }

        }

        return {

            resolve: function(expression, scope) {

                var queryParts = getExpressionParts(expression);

                return scope.item.list.web.getProperties().then(function(properties) {

                    var value = properties[queryParts[0]];
                    createExpressionValue(scope, queryParts[0], value);
                    return 'expressions.web.' + queryParts[0];
                });
            }

        };

    }
]);


/**
 * @ngdoc object
 * @name ngSharePoint.SPExpressionResolver
 *
 * @description
 * SPExpressionResolver provides functionality to solve expressions.
 *
 * The method creates new scope variable called `expressions` that contains variables with the name of the expression 
 * provider used and their corresponding values. With this way, when AngularJS analizes the 
 * expressions, its will be evaluated correctly.
 *
 * Valid expressions should match the next pattern:
 * <pre>
 * {provider.value}
 * </pre>
 * Where `provider` refers to the provider who will solve the expression, and `value` refers
 * to the valuo to solve.
 * 
 * Actually the only providers that you can use are:
 * - `item`: solves item related values
 * - `currentUser`: solves current user related values (site user info list)
 * - `param`: solves page parameters
 * - `web`: solves web properties
 * - `list`: solves list properties
 * - `userProfile`: (coming soon)
 *
 * Expression, also, can be composed by complex values like:
 * <pre>
 * {provider.value1.value2....valuen}
 * </pre>
 * This only apply to `currentUser` or `item` values.
 *
 * @example
 * Example of expressions:
 * <pre>
 * {item.Status}=='Closed'
 * </pre>
 * <pre>
 * {currentUser.JobTitle}
 * </pre>
 * This expression creates a new variable called `currentUser` with the next composition:
 * <pre>
 * scope.expressions = {
 *      currentUser: {
 *           JobTitle: 'value' 
 *      }
 * }
 * </pre>
 *
 * <pre>
 * {item.Department.Manager.Email}
 * </pre>
 * Refers to the manager's email of the department where the item is referenced.
 * This expressions creates the next object composition:
 * <pre>
 * scope.expressions = {
 *      item: {
 *          Department: {
 *              Manager: {
 *                  Email: 'useremail@company.com'
 *              }
 *          }
 *      }
 * }
 * </pre>
 *
 * <pre>
 * {currentUser.Area.Address}
 * </pre>
 * 
 */

angular.module('ngSharePoint').provider('SPExpressionResolver', 

    [

    function SPExpressionResolver_Provider() {

        'use strict';

        var CustomExpresionProviders = {
            /*
            'currentUser': 'SPExpressionResolvercurrentUser',
            'currentUser': 'otherCurrentUserProvider'
            */
        };

        var SPExpressionResolver = function($injector, $q, SharePoint, $parse) {

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

                var expressionProviderName = 'SPExpressionResolver' + expressionType;
                if (CustomExpresionProviders[expressionType] !== void 0) {
                    expressionProviderName = CustomExpresionProviders[expressionType];
                }

                var service = $injector.get(expressionProviderName);
                var expressionPromise = service.resolve(expression, scope);

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

                if (queryParts.length == 1) {

                    return scope.item[queryParts[0]];

                } else {

                    return scope.item.list.getItemProperty(scope.item.Id, queryParts.join('/')).then(function(data) {

                        return data[queryParts[queryParts.length - 1]];
                
                    }, function() {

                        return undefined;
                    });
                }
                
            }



            function resolveCurrentUserExpression(expression) {

                return SharePoint.getCurrentWeb().then(function(web) {
                
                    return web.getList('UserInfoList').then(function(list) {

                        var queryParts = getExpressionParts(expression);

                        return list.getItemProperty(_spPageContextInfo.userId, queryParts.join('/')).then(function(data) {

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

            /**
             * @ngdoc function
             * @name ngSharePoint.SPExpressionResolver#resolve
             * @methodOf ngSharePoint.SPExpressionResolver
             * 
             * @description
             * This method solves all expressions contained within the text received as parameter.
             *
             * @param {string} Text expression to solve
             * @param {object} scope with the context where `expressions` values will be placed.
             * @returns {promise} Promise with the solved expressions
             * 
             * @example
             * <pre>
             * var textToEvaluate = '{currentUser.Id}=={item.Author.Id} and {params.Close}=="Yes"';
             * SPExpressionResolver.resolve(textToEvaluate, $scope).then(function(sentence) {
             *
             *      // At this point, expressions are solved and scope variables created
             *      // We can evaluate the sentence
             *
             *      if ($scope.$eval(sentence)) {
             *
             *          // The current user is the author of the current item and exists
             *          // a page param equals to `Yes`
             *      }
             *  });
             * </pre>
             */
            this.resolve = function(text, scope) {

                var deferred = $q.defer();
                var expressionsArray = [];

                if (angular.isString(text)) {
                    
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

                }

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

        };


        this.$get = function($injector, $q, SharePoint, $parse) {
            return new SPExpressionResolver($injector, $q, SharePoint, $parse);
        };

    }

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

    ['$compile', '$http', '$templateCache', '$q', 'SPUtils',

    function SPFieldDirective_Factory($compile, $http, $templateCache, $q, SPUtils) {

        // ****************************************************************************
        // Private functions
        //

        function defaultOnValidateFn() {

            // NOTE: Executed in the directive's '$scope' context (i.e.: this === $scope).

            // Update the model property '$viewValue' to change the model state to $dirty and
            // force to run $parsers, which include validators.
            var value = this.modelCtrl.$viewValue;
            if (!angular.isDefined(value)) value = null;

            this.modelCtrl.$setViewValue(value);
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
         *                                       Deprecated: new spfield-* don't have attribute:
         *                                          value: '=ngModel'
         *                                       This behaviors should be done on renderFn
         *
         *              renderFn (function):     If defined, applies it when modelController need to
         *                                       update the view (render). By default, this function
         *                                       set's the scope.value variable with the new value
         *                                       (modelCtrl.$viewValue)

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
            directive.name = $scope.name;
            $scope.schema = $scope.formCtrl.getFieldSchema($attrs.name);
            $scope.item = $scope.formCtrl.getItem(); // Needed?
            $scope.currentMode = $scope.mode || $scope.formCtrl.getFormMode();

            $scope.formCtrl.registerField(this);

            $scope.$on('$destroy', function() {
                $scope.formCtrl.unregisterField(directive);
            });


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


                    if (angular.isDefined($scope.schema) && angular.isDefined($scope.schema.extendedTemplate)) {

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
            // Validate the field.
            //
            directive.validate = function() {

                if ($scope.currentMode !== 'edit') return;

                var deferred = $q.defer();
                $scope.modelCtrl.$dirty = true;

                defaultOnValidateFn.apply($scope, arguments);

                if (angular.isFunction(directive.onValidateFn)) {

                    $q.when(directive.onValidateFn.apply(directive, arguments)).then(function() {

                        if ($scope.schema !== undefined && $scope.schema.onValidate !== undefined) {

                            $q.when(SPUtils.callFunctionWithParams($scope.schema.onValidate, $scope)).then(function(result) {

                                deferred.resolve();
                            });

                        } else {

                            deferred.resolve();
                        }
                    });

                } else {

                    if ($scope.schema !== undefined && $scope.schema.onValidate !== undefined) {

                        $q.when(SPUtils.callFunctionWithParams($scope.schema.onValidate, $scope)).then(function(result) {

                            deferred.resolve();
                        });

                    } else {

                        deferred.resolve();
                    }
                }

                return deferred.promise;
            };


            // ****************************************************************************
            // New model value ... render
            //
            $scope.modelCtrl.$render = function() {

                if (angular.isFunction(directive.renderFn)) {
                    directive.renderFn(directive, arguments);
                } else {
                    $scope.value = $scope.modelCtrl.$viewValue;
                }

            };


            // Apply the directive initializacion if specified.
            var init = true;
            if (angular.isFunction(directive.init)) init = directive.init();

            $q.when(init).then(function() {

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

            });




        }; // baseLinkFn

    } // SPFieldDirective factory

]);

/**
 * @ngdoc object
 * @name ngSharePoint.SPFile
 *
 * @description
 * Provides functionality to manage SharePoint files.
 *
 * *At the moment, not all methods for manage file objects are implemented in ngSharePoint*
 *
 * *Documentation is pending*
 */


angular.module('ngSharePoint').factory('SPFile', 

	['SPObjectProvider', '$q', '$http', 

	function SPFile_Factory(SPObjectProvider, $q, $http) {

		'use strict';


        /**
         * @ngdoc function
         * @name ngSharePoint.SPFile#constructor
         * @constructor
         * @methodOf ngSharePoint.SPFile
         *
         * @description
         * Instantiates a new `SPFile` object for a specific SharePoint file in the server. It's possible
         * to specify their properties.
         *
         * By default, in document and picture libraries, when you call {@link ngSharePoint.SPList#getListItems getListItems} or 
         * {@link ngSharePoint.SPList#getItemById getItemById}, by default a ´item.File´ property are created and contains
         * file information.
         *
         * @param {SPWeb} web A valid {@link ngSharePoint.SPWeb SPWeb} object where the file is stored.
         * @param {string} path The server relative path of the file.
         * @param {object} fileProperties Properties to initialize the object
         *
         */
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

		}; // updateAPIUrlById





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

				this.getProperties({ $expand: 'ListItemAllFields,ListItemAllFields/ParentList'}).then(function() {

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

					this.getProperties({ $expand: 'ListItemAllFields,ListItemAllFields/ParentList'}).then(function() {

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
		// moveFile
		//
		// Move the current file
		//
		// @pathToMove
		// @returns: Promise with the new SPFile object.
		//
		SPFileObj.prototype.moveFile = function (pathToMove) {
			var self = this;
			var def = $q.defer();
			var headers = {
				'Accept': 'application/json; odata=verbose'
			};

			var requestDigest = document.getElementById('__REQUESTDIGEST');
			if (requestDigest !== null) {
				headers['X-RequestDigest'] = requestDigest.value;
			}
			
			var url = self.apiUrl + '/moveto(newurl=\'' + pathToMove + '/' + self.Name + '\',flags=1)';

			$http({

				method: 'POST',
				url: url,
				headers: headers

			}).then(function() {

				def.resolve();

			}, function(error) {

				var err = utils.parseError({
					data: error.data.error,
					errorCode: error.data.error.code,
					errorMessage: error.data.error.message
				});
				err.data.body = err.data.message.value;
				err.message = err.data.code;

				def.reject(err);
			});

			return def.promise;

		}; // moveFile


		

		// ****************************************************************************
		// copyFile
		//
		// Copy the current file
		//
		// @pathToCopy
		// @return: Promise with the new SPFile object.
		//
		SPFileObj.prototype.copyFile = function (pathToCopy) {
			var self = this;
			var def = $q.defer();
			var headers = {
				'Accept': 'application/json; odata=verbose'
			};

			var requestDigest = document.getElementById('__REQUESTDIGEST');
			if (requestDigest !== null) {
				headers['X-RequestDigest'] = requestDigest.value;
			}

			var url = self.apiUrl + '/copyto(strnewurl=\'' + pathToCopy + '/' + self.Name + '\',boverwrite=true)';

			$http({

				method: 'POST',
				url: url,
				headers: headers

			}).then(function() {

				def.resolve();

			}, function(error) {

				var err = utils.parseError({
					data: error.data.error,
					errorCode: error.data.error.code,
					errorMessage: error.data.error.message
				});
				err.data.body = err.data.message.value;
				err.message = err.data.code;

				def.reject(err);
			});


			return def.promise;
		}; // copyFile



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
						$expand: 'CheckedOutByUser,ModifiedBy'
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
						$expand: 'CheckedOutByUser,ModifiedBy'
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
						$expand: 'CheckedOutByUser,ModifiedBy'
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
						$expand: 'CheckedOutByUser,ModifiedBy'
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

			self.getFileListItem().then(function() {

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

			return def.promise;

		};	// checkIn




		// Returns the SPFileObj class
		return SPFileObj;

	}
]);

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

				this.getProperties({ $expand: 'ListItemAllFields,ListItemAllFields/ParentList'}).then(function() {

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

/**
 * @ngdoc object
 * @name ngSharePoint.SPGroup
 *
 * @description
 * SPGroup factory provides access to all SharePoint group properties and allows retrieval of users and 
 * owner (group or user).
 *
 * *At the moment, not all SharePoint API methods for group objects are implemented in ngSharePoint*
 *
 */


angular.module('ngSharePoint').factory('SPGroup', 

	['$q', 'SPHttp', 'SPCache', 'SPObjectProvider', 

	function SPGroup_Factory($q, SPHttp, SPCache, SPObjectProvider) {

		'use strict';


		/**
		 * @ngdoc function
		 * @name ngSharePoint.SPGroup#constructor
		 * @constructor
		 * @methodOf ngSharePoint.SPGroup
		 * 
		 * @description
		 * Initializes a new SPGroup object that points to a specific SharePoint group and allows
		 * retrieval of their properties and users
		 * 
		 * @param {SPWeb} web A valid {@link ngSharePoint.SPWeb SPWeb} object
		 * @param {int|string} groupId|groupName Group id or name
		 * @param {object} data Properties to initialize the object (optional)
		 * 
		 * @example
		 * <pre>
         *  // Previously initiated web service and injected SPGroup service ...
		 *  var group = new SPGroup(web, 'Visitors');
		 *
		 *  // ... do something with the group object
		 *  group.getUsers().then(function(users) {
		 *    // ...
		 *  });
		 * </pre>
		 *
		 */
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



        /**
         * @ngdoc function
         * @name ngSharePoint.SPGroup#getProperties
         * @methodOf ngSharePoint.SPGroup
         *
         * @description
         * Makes a call to the SharePoint server and collects all the group properties.
         * The current object is extended with the recovered properties. This means that when this method is executed,
         * any group property is accessible directly. ex: `group.Title`, `group.Description`, `group.CanCurrentUserEditMembership`, etc.
         *
         * For a complete list of group properties go to Microsoft
         * SharePoint {@link https://msdn.microsoft.com/en-us/library/office/dn531432.aspx#bk_GroupProperties group api reference}
         *
         * @returns {promise} promise with an object with all group properties
         *
         */
		SPGroupObj.prototype.getProperties = function() {

			var self = this,
				url = self.apiUrl;
			
			return SPHttp.get(url).then(function(data) {

				utils.cleanDeferredProperties(data);
				angular.extend(self, data);

				return self;
			});


		}; // getProperties



		/**
	     * @ngdoc function
	     * @name ngSharePoint.SPGroup#getOwner
	     * @methodOf ngSharePoint.SPGroup
	     *
	     * @description
	     * Retrieves the sharepoint owner of the group.
	     *
	     * @returns {promise} promise with an {@link ngSharePoint.SPUser SPUser} object  
	     *
		 * @example
		 * <pre>
		 *
		 *   SharePoint.getCurrentWeb(function(webObject) {
		 *
		 *     var group = web.getGroup('Visitors');
		 *     group.getOwner().then(function(owner) {
		 *       
	     *         console.log(owner.Name);
		 *     });
		 *
		 *   });
		 * </pre>
		 */
		SPGroupObj.prototype.getOwner = function() {

			var self = this,
				url = self.apiUrl + '/Owner';
			
			return SPHttp.get(url).then(function(data) {

				utils.cleanDeferredProperties(data);

				var owner;

				if (data.PrincipalType === 8) {
					// group
					owner = SPObjectProvider.getSPGroup(self.web, data.Id, data);
				} else {
					// user
					owner = SPObjectProvider.getSPUser(self.web, data.Id, data);
				}
				self.Owner = owner;

				return self;
			});

		};	// getOwner




		/**
	     * @ngdoc function
	     * @name ngSharePoint.SPGroup#getUsers
	     * @methodOf ngSharePoint.SPGroup
	     *
	     * @description
	     * Gets a collection of {@link ngSharePoint.SPUser SPUser} objects that represents all of the users in the group.
	     *
	     * @returns {promise} promise with an array of {@link ngSharePoint.SPUser SPUser} objects  
	     *
		 * @example
		 * <pre>
		 *
		 *   SharePoint.getCurrentWeb(function(webObject) {
		 *
		 *     var group = web.getGroup('Visitors');
		 *     group.getUsers().then(function(users) {
		 *       
		 *        angular.forEach(users, function(user) {
	     *           console.log(user.Name);
		 *        });
		 *     });
		 *
		 *   });
		 * </pre>
		 */
		SPGroupObj.prototype.getUsers = function() {

			var self = this,
				url = self.apiUrl + '/Users',
				users = self.Users;


			if (users === void 0) {

				users = SPHttp.get(url).then(function(data) {

					var users = [];
					angular.forEach(data, function(user) {
						users.push(SPObjectProvider.getSPUser(self.web, user.Id, user));
					});

					self.Users = users;
					return users;
				});
			}

            return $q.when(users);

		}; // getUsers



 		// Returns the SPGroupObj class
		return SPGroupObj;

	}
]);

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
        this.post = function(url, params) {



        }; // setJSLink

    }
]);

/**
 * @ngdoc object
 * @name ngSharePoint.SPList
 *
 * @description
 * Represents an SPList object that you can use to access to all SharePoint list properties and data.
 *
 * It is possible to create new SPList objects or use an {@link ngSharePoint.SPWeb SPWeb} object to get SPList object instances.
 *
 * *At the moment, not all SharePoint API methods for list objects are implemented in ngSharePoint*
 *
 * @requires ngSharePoint.SPListItem
 * @requires ngSharePoint.SPFolder
 * @requires ngSharePoint.SPContentType
 *
 */


angular.module('ngSharePoint').factory('SPList',

    ['$q', 'SPHttp', 'SPCache', 'SPFolder', 'SPListItem', 'SPContentType', 'SPObjectProvider',

    function SPList_Factory($q, SPHttp, SPCache, SPFolder, SPListItem, SPContentType, SPObjectProvider) {

        'use strict';


        /**
         * @ngdoc function
         * @name ngSharePoint.SPList#constructor
         * @constructor
         * @methodOf ngSharePoint.SPList
         *
         * @description
         * Instantiates a new `SPList` object that points to a specific SharePoint list. With a
         * list instance it is possible to access their properties and get list items.
         *
         * *Note*: this method only instantiates a new `SPList` object initialized for future access to
         * list related API (get list items, folders, documents). This method doesn't retrieve any
         * list properties or information. To get list properties it is necessary to call
         * {@link ngSharePoint.SPList#getProperties getProperties} method.
         *
         * @param {SPWeb} web A valid {@link ngSharePoint.SPWeb SPWeb} object where the list is located
         * @param {string} listID|listName List ID or list name.
         * It is possible to specify "UserInfoList" to refer to the system list with all site users.
         * @param {object} listProperties Properties to initialize the object
         *
         * @example
         * <pre>
         * var docs = new SPList(web, 'Shared documents');
         * // ... do something with the 'docs' object
         * docs.getListItems().then(...);
         * </pre>
         *
         */
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



        /**
         * Gets the 'ListItemEntityTypeFullName' property for the list and attach it
         * to 'this' object.
         *
         * This property is required for CRUD operations.
         *
         * This method is used internally.
         */
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



        /**
         * @ngdoc function
         * @name ngSharePoint.SPList#getProperties
         * @methodOf ngSharePoint.SPList
         *
         * @description
         * Makes a call to the SharePoint server and collects all list properties.
         * The current object is extended with the recovered properties. This means that when this method is executed,
         * any list property is accessible directly. ex: `list.Title`, `list.BaseTemplate`, `list.AllowContentTypes`, etc.
         *
         * For a complete list of list properties go to Microsoft
         * SharePoint {@link https://msdn.microsoft.com/EN-US/library/dn531433.aspx#bk_ListProperties list api reference}
         *
         * SharePoint REST api only returns certain list properties that have primary values. Properties with complex structures
         * like `ContentTypes`, `EffectiveBasePermissions` or `Fields` are not returned directly by the api and it is necessary to extend the query
         * to retrieve their values. It is possible to accomplish this with the `query` param.
         *
         * @param {object} query This parameter specifies which list properties will be extended and retrieved from the server.
         * By default `Views` property is extended.
         *
         * @returns {promise} promise with an object with all list properties
         *
         * @example
         * This example shows how to retrieve list properties:
         * <pre>
         *
         *   SharePoint.getCurrentWeb(function(web) {
         *
         *     web.getList("Orders").then(function(list) {
         *
         *        list.getProperties().then(function() {
         *
         *            // at this point we have all list properties
         *            if (!list.EnableAttachments) {
         *                alert("You can't attach any file");
         *            }
         *        });
         *     });
         *
         *   });
         * </pre>
         *
         */
        SPListObj.prototype.getProperties = function(query) {

            var self = this;
            var def = $q.defer();
            var defaultExpandProperties = 'Views';

            if (query) {
                query.$expand = defaultExpandProperties + (query.$expand ? ',' + query.$expand : '');
            } else {
                query = {
                    $expand: defaultExpandProperties
                };
            }


            // Check if the requested properties (query.$expand) are already defined to avoid to make an unnecessary new request to the server.
            if (this.Created !== undefined) {

                var infoIsOk = true;

                // The list properties are already here?
                if (query.$expand !== undefined) {
                    /*
                    if (query.$expand.toLowerCase().indexOf('fields') >= 0 && this.Fields === undefined) infoIsOk = false;
                    if (query.$expand.toLowerCase().indexOf('contenttypes') >= 0 && this.ContentTypes === undefined) infoIsOk = false;
                    */
                    angular.forEach(query.$expand.split(/, */g), function(expandKey) {

                        infoIsOk = infoIsOk && self[expandKey] !== void 0;

                    });

                }


                if (infoIsOk) {

                    def.resolve(this);
                    return def.promise;

                }
            }


            // Make the query to the server.
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

                    if (self.Fields !== void 0 && self.Fields.results !== void 0) {

                        // process fields --> $expand: 'Fields'

                        var fields = {};

                        angular.forEach(self.Fields.results, function(field) {
                            fields[field.InternalName] = field;
                        });

                        self.Fields = fields;
                        SPCache.setCacheValue('SPListFieldsCache', self.apiUrl, fields);
                    }

                    if (self.ContentTypes !== void 0 && self.ContentTypes.results !== void 0) {

                        // process contenttypes --> $expand: 'ContentTypes'

                        var contentTypes = [];

                        angular.forEach(self.ContentTypes.results, function(contentType) {

                            contentTypes.push(new SPContentType(self, contentType.StringId, contentType));

                        });

                        self.ContentTypes = contentTypes;
                    }

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




        /**
         * @ngdoc function
         * @name ngSharePoint.SPList#updateProperties
         * @methodOf ngSharePoint.SPList
         *
         * @description
         * With this method, it is possible to modify list properties. The method has an object param
         * with any property to modify and makes a call to the server API in order to modify it.
         *
         * @param {object} properties An object with all the properties to modify
         * @returns {promise} promise with an object that contains all modified list properties
         *
         * @example
         * <pre>
         *   SharePoint.getCurrentWeb(function(web) {
         *
         *     web.getList("Orders").then(function(list) {
         *
         *         list.updateProperties({
         *
         *             EnableAttachments: true,
         *             ForceCheckout: false
         *
         *         }).then(function() {
         *             // ...
         *         });
         *     });
         *
         *   });
         * </pre>
         *
         */
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




        /**
         * @ngdoc function
         * @name ngSharePoint.SPList#getFields
         * @methodOf ngSharePoint.SPList
         *
         * @description
         * This method retrieves the Fields collection of the list and creates a new object property
         * called "Fields" that contains a named property for every field.
         *
         * After a call to this method, the schema of every field is available in the list and all
         * their properties (default values, validation expressions, choice values or lookup properties).
         *
         * For a complete list of field properties go to Microsoft
         * SharePoint {@link https://msdn.microsoft.com/EN-US/library/dn600182.aspx#bk_FieldProperties field api reference}.
         * Also, there are additional field specific properties that you can retrieve
         * based on the field type:
         * {@link https://msdn.microsoft.com/EN-US/library/dn600182.aspx#bk_FieldCalculated FieldCalculated},
         * {@link https://msdn.microsoft.com/EN-US/library/dn600182.aspx#bk_FieldCollection FieldCollection},
         * {@link https://msdn.microsoft.com/EN-US/library/dn600182.aspx#bk_FieldComputed FieldComputed},
         * {@link https://msdn.microsoft.com/EN-US/library/dn600182.aspx#bk_FieldDateTime FieldDateTime},
         * {@link https://msdn.microsoft.com/EN-US/library/dn600182.aspx#bk_FieldGeolocation FieldGeolocation},
         * {@link https://msdn.microsoft.com/EN-US/library/dn600182.aspx#bk_FieldGuid FieldGuid},
         * {@link https://msdn.microsoft.com/EN-US/library/dn600182.aspx#bk_FieldLookup FieldLookup and FieldUser},
         * {@link https://msdn.microsoft.com/EN-US/library/dn600182.aspx#bk_FieldMultiChoice FieldMultiChoice, FieldChoice, and FieldRatingScale},
         * {@link https://msdn.microsoft.com/EN-US/library/dn600182.aspx#bk_FieldMultiLineText FieldMultiLineText},
         * {@link https://msdn.microsoft.com/EN-US/library/dn600182.aspx#bk_FieldNumber FieldNumber and FieldCurrency},
         * {@link https://msdn.microsoft.com/EN-US/library/dn600182.aspx#bk_FieldText FieldText},
         * {@link https://msdn.microsoft.com/EN-US/library/dn600182.aspx#bk_FieldUrl FieldUrl},
         *
         * With all of this information, you might construct new interfaces (views, forms, etc) that follow
         * definitions of any SharePoint list.
         *
         * *Note*: The list of fields of the list isn't necessaray equal to the item content type.
         * If you want to get the content type specific fields, you can call `getFields method of
         * the specific content type.
         *
         * @returns {promise} promise with an object that contains all of the fields schema
         *
         * @example
         * <pre>
         *   // a pre-initialized "list" object ...
         *   list.getFields().then(function() {
         *
         *       // at this point, you have access to the definition of any list field
         *       console.log(list.Fields.Title.DefaultValue);
         *       // this returns '' or any defined value
         *
         *       console.log(list.Fields.DueDate.Required);
         *       // this returns true or false
         *
         *       console.log(list.Fields.Editor.ReadOnlyField);
         *       // this returns true
         *
         *       console.log(list.Fields.ProjectStatus.Choices.results);
         *       // this returns an array with available choices ['Open', 'Closed', 'Draft']
         *   });
         *
         * </pre>
         *
         */
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




        /**
         * @ngdoc function
         * @name ngSharePoint.SPList#getContentTypes
         * @methodOf ngSharePoint.SPList
         *
         * @description
         * This method retrieves a list of all content types of the list.
         *
         * If you call this method, a new `ContentType` property will be set with an array of content types.
         *
         * @returns {promise} promise with an array of all content types associated with the list.
         * Every element on the array is a {@link ngSharePoint.SPContentType SPContentType} object.
         *
         * @example
         * <pre>
         *   list.getContentTypes().then(function() {
         *
         *     // ContentTypes property are set in the list object
         *     list.ContentTypes.forEach(function(ct) {
         *       console.log(ct.Name);
         *     });
         *   });
         * </pre>
         *
        */
        SPListObj.prototype.getContentTypes = function() {

            var self = this;
            var def = $q.defer();

            if (this.ContentTypes !== void 0) {

                def.resolve(this.ContentTypes);

            } else {

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
            }

            return def.promise;

        }; // getContentTypes



        /**
         * @ngdoc function
         * @name ngSharePoint.SPList#getContentType
         * @methodOf ngSharePoint.SPList
         *
         * @description
         * Gets a specified content type by its ID or name.
         *
         * Internally, this method makes a call to {@link ngSharePoint.SPList#getContentTypes getContentTypes} method.
         *
         * @param {string=} ID|name The ID or name of the content type to be retrieved. If this parameter is not
         * specified, the method returns the default content type.
         * @returns {promise} promise with the {@link ngSharePoint.SPContentType SPContentType} object.
         *
         * @example
         * This example retrieves the associated Issue content type and logs all its field titles.
         * <pre>
         *   list.getContentType('Issue').then(function(issueCt) {
         *
         *     issueCt.getFields().then(function() {
         *
         *          angular.forEach(issueCt.Fields, function(field) {
         *              console.log(field.Title);
         *          });
         *
         *     });
         *   });
         * </pre>
         *
        */
        SPListObj.prototype.getContentType = function(contentTypeID) {

            var self = this;
            var def = $q.defer();

            self.getContentTypes().then(function() {

                var contentType = self.ContentTypes[0]; //-> Default content type

                angular.forEach(self.ContentTypes, function(ct) {

                    if (ct.StringId === contentTypeID) {

                        contentType = ct;

                    }

                    if (ct.Name === contentTypeID) {

                        contentType = ct;
                    }

                });


                def.resolve(contentType);

            });


            return def.promise;

        }; // getContentType




        /**
         * @ngdoc function
         * @name ngSharePoint.SPList#getRootFolder
         * @methodOf ngSharePoint.SPList
         *
         * @description
         * This method gets a reference to the root folder of the list.
         *
         * @returns {promise} promise with an {@link ngSharePoint.SPFolder SPFolder} object corresponding
         * to the root folder.
         *
         * @example
         * This example retrieves the root folder of a document library to add a new file
         * <pre>
         *   docLibrary.getRootFolder().then(function(folder) {
         *
         *     folder.addFile(...).then(function() {
         *        . . .
         *     });
         *
         *   });
         * </pre>
         *
        */
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




        /**
         * @ngdoc function
         * @name ngSharePoint.SPList#getWorkflowAssociationByName
         * @methodOf ngSharePoint.SPList
         *
         * @description
         * This method searches a list associated workflow by name and returns an object with this information.
         * The method only find for enabled workflows.
         *
         * @param {string} workflowName The name of the workflow to be retrieved.
         * @returns {promise} promise with an object corresponding to the associated workflow
         *
         * @example
         * This example retrieves one associated workflow
         * <pre>
         *   list.getWorkflowAssociatedByName('Open project').then(function(workflowInfo) {
         *
         *      console.log(workflowInfo);
         *      . . .
         *
         *   });
         * </pre>
         *
        */
        SPListObj.prototype.getWorkflowAssociationByName = function(workflowName) {

            var self = this;
            var def = $q.defer();

            var executor = new SP.RequestExecutor(self.web.url);

            var params = utils.parseQuery({
                $filter: "enabled eq true and Name eq '" + workflowName + "'"
            });

            executor.executeAsync({

                url: self.apiUrl + '/WorkflowAssociations' + params,
                method: 'GET',
                headers: {
                    "Accept": "application/json; odata=verbose"
                },

                success: function(data) {

                    var d = utils.parseSPResponse(data);
                    if (d.length > 0) {
                        def.resolve(d[0]);
                    } else {
                        def.resolve(undefined);
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

        };  // getWorkflowAssociationByName

        /**
         * @ngdoc function
         * @name ngSharePoint.SPList#renderListData
         * @methodOf ngSharePoint.SPList
         *
         * @description
         * This method return an array of objects from the list
         *
         * @param {string} viewXml The CAML query.
         * @returns {promise} promise with an object with all caml options used to retrieve list items
         *
         * @example
         * This example retrieves one associated workflow
         * <pre>
         *   list.renderListData('<View><Query></Query><RowLimit>10</RowLimit></View>').then(function(items) {
         *
         *      console.log(items.toJson());
         *      . . .
         *
         *   });
         * </pre>
         *
        */
        SPListObj.prototype.renderListData = function(viewXml) {

            var self = this;
            var def = $q.defer();
            var executor = new SP.RequestExecutor(self.web.url);
			// Set the headers for the REST API call.
            // ----------------------------------------------------------------------------
            var headers = {
                "Accept": "application/json; odata=verbose",
                "content-type": "application/json;odata=verbose"
            };

            // Make the call.
            // ----------------------------------------------------------------------------
            executor.executeAsync({
				url: self.apiUrl + "/renderlistdata()",
                method: 'POST',
                body: angular.toJson({viewXml: viewXml}),
                headers: headers,
                success: function(data) {
	                var d = angular.fromJson(utils.parseSPResponse(data).RenderListData);
                    angular.forEach(d.Row, function(item) {
						// convert single arrays to object
				        angular.forEach(item, function(value, key) {
				            if (angular.isArray(value) && value.length === 1) {
				            	item[key] = value[0];
				            }
				        });
                    });
                    def.resolve(d.Row);
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

        };  // renderListData



        /**
         * @ngdoc function
         * @name ngSharePoint.SPList#getListItems
         * @methodOf ngSharePoint.SPList
         *
         * @description
         * Use this method to retrieve a collection of items from the list.
         *
         * The method has a `query` parameter that allows you to specify the selection, filters
         * and order options for the data you request from the server.
         * All valid OData options implemented by the SharePoint REST api are accepted.
         *
         * Go to {@link https://msdn.microsoft.com/en-us/library/office/fp142385(v=office.15).aspx SharePoint documentation} for
         * more information about the OData query operations in SharePoint REST api.
         *
         * By default, this method expands the following properties:
         * * ContentType
         * * File
         * * File/ParentFolder
         * * Folder
         * * Folder/ParentFolder
         *
         * @param {object=} query An object with all query options used to retrieve list items.
         *
         * It is possible to specify different query options:
         * <pre>
         *     var query = {
         *          // Use the $filter query option to select
         *          // which items to return
         *          $filter: "filter expression",
         *          // Use $top to indicate the number of items
         *          // to be retrieved (for pagination purposes)
         *          $top: nn,
         *          // User $orderby to specify how to sort the
         *          // items in your query return set
         *          $orderby: "field1 asc,field2 desc,...",
         *          // to get additional information of other
         *          // lookup fields
         *          $expand: "field1,field2,..."
         *     };
         *     someList.getListItems(query).then(...);
         * </pre>
         * @param {boolean=} resetPagination With this param you can specify if you want to continue with the
         * previous query and retrieve the next set of items or want to reset the counter and start a completely new query.
         *
         * By default SharePoint returns sets of 100 items from the server. You can modify this value with the param `$top`
         *
         * @returns {promise} promise with a collection of {@link ngSharePoint.SPListItem SPListItem} elements
         * retrieved from the server
         *
         * @example
         * This example retrieves the list of "Closed" projects in a list ordered by close date
         * <pre>
         *   list.getListItems({
         *
         *      $filter: "ProjectStatus eq 'Closed'",
         *      $orderby: "ClosedDate desc"
         *
         *   }).then(function(listItems) {
         *
         *      console.log(listItems);
         *
         *   });
         * </pre>
         *
         * Suppose that you have a list of announcements categorized by department. A `Department` field
         * is a lookup to the "departments" lists and you want to query the announcements of the "RRHH" department.
         *
         * If you know the ID of the RRHH item in the "departments" list (ex: 2), you would make this query:
         * <pre>
         *      announcementsList.getListItems({ $filter: "Department eq 2"}).then(...);
         * </pre>
         *
         * But if you don't know the ID and want to make the query by its title, you should expand
         * the lookup column, select the desired related column and filter the result set.
         * The query will be similar to this:
         *
         * <pre>
         *      announcementsList.getListItems({
         *
         *          $expand: "Department",
         *          $select: "Department/Title,*",
         *          $filter: "Department/Title eq 'RRHH'"
         *
         *      }).then(...);
         * </pre>
         *
        */
        SPListObj.prototype.getListItems = function(query, resetPagination) {

            var self = this;
            var def = $q.defer();
            var executor = new SP.RequestExecutor(self.web.url);
            var defaultExpandProperties = 'ContentType,File,File/ParentFolder,Folder,Folder/ParentFolder';
            var urlParams = '';

            if (this.$skiptoken !== void 0 && !resetPagination) {

                urlParams = '?' + this.$skiptoken;

            } else {

                if (query) {
                    if (query.$expand !== void 0) {
                        var idx = query.$expand.lastIndexOf(defaultExpandProperties);
                        if (idx !== -1) {
                            // previous expanded (remove ...)
                            query.$expand = query.$expand.substring(defaultExpandProperties.length + 1, query.$expand.length);
                        }
                    }
                    query.$expand = defaultExpandProperties + (query.$expand ? ',' + query.$expand : '');
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

                        if (item.File !== undefined && item.File.__deferred === undefined) {
                            var newFile = SPObjectProvider.getSPFile(self.web, item.File.ServerRelativeUrl, item.File);
                            newFile.List = self;
                            item.File = newFile;
                        }
                        if (item.Folder !== undefined && item.Folder.__deferred === undefined) {
                            var newFolder = SPObjectProvider.getSPFolder(self.web, item.Folder.ServerRelativeUrl, item.Folder);
                            newFolder.List = self;
                            item.Folder = newFolder;
                        }

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




        /**
         * @ngdoc function
         * @name ngSharePoint.SPList#getItemById
         * @methodOf ngSharePoint.SPList
         *
         * @description
         * This method gets a specified list item.
         *
         * @param {integer} ID The ID of the item to be retrieved.
         * @param {string} expandProperties Comma separated values with the properties to expand
         * in the REST query
         * @returns {promise} promise with an object of type {@link ngSharePoint.SPListItem SPListItem} corresponding
         * with the element retrieved
         *
         * @example
         * This example retrieves the item specified by the query string over the contextual list.
         * This assumes that this code is executed in a form page
         * <pre>
         *      var itemID = utils.getQueryStringParamByName('ID');
         *
         *      SharePoint.getCurrentWeb().then(function(web) {
         *
         *          web.getList(_spPageContextInfo.pageListId).then(function(list) {
         *
         *              list.getItemById(itemID).then(function(item) {
         *
         *                  $scope.currentItem = item;
         *
         *              });
         *          });
         *
         *      });
         *
         * </pre>
         *
        */
        SPListObj.prototype.getItemById = function(ID, expandProperties) {

            var self = this;
            var def = $q.defer();
            var executor = new SP.RequestExecutor(self.web.url);
            var defaultExpandProperties = 'ContentType,File,File/ParentFolder,Folder,Folder/ParentFolder';
            var query = {
                $expand: defaultExpandProperties + (expandProperties ? ',' + expandProperties : '')
            };

            executor.executeAsync({

                url: self.apiUrl + '/getItemById(' + ID + ')' + utils.parseQuery(query),
                method: 'GET',
                headers: {
                    "Accept": "application/json; odata=verbose"
                },

                success: function(data) {

                    var d = utils.parseSPResponse(data);

                    if (d.File !== undefined && d.File.__deferred === undefined) {
                        var newFile = SPObjectProvider.getSPFile(self.web, d.File.ServerRelativeUrl, d.File);
                        newFile.List = self;
                        d.File = newFile;
                    }
                    if (d.Folder !== undefined && d.Folder.__deferred === undefined) {
                        var newFolder = SPObjectProvider.getSPFolder(self.web, d.Folder.ServerRelativeUrl, d.Folder);
                        newFolder.List = self;
                        d.Folder = newFolder;
                    }

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

        }; // getItemByID




        /**
         * @ngdoc function
         * @name ngSharePoint.SPList#getItemProperty
         * @methodOf ngSharePoint.SPList
         *
         * @description
         * This method gets a specified related item property from the list.
         *
         * @param {integer} ID The ID of the item.
         * @param {string} query The REST query after '.../getItemById(<ID>)/'
         *
         * @returns {promise} promise with the value of the property. Can be a primary value like a string or
         * an integer or can be a complex value like a item. It depends of the query specified.
         *
         * @example
         * With this method you can obtain the related information of an item. You can specify simple expressions
         * or other more sophisticated expressions. The following examples show how you can use it.
         *
         * <pre>
         *   // This returns the name of the author (string)
         *   list.getItemProperty(ID, 'Created/Name').then(...);
         *
         *   // This returns the title of the department (string)
         *   list.getItemProperty(ID, 'Department/Title').then(...)
         *
         *   // This returns the manager of the department (item)
         *   list.getItemProperty(ID, 'Department/Manager').then(...)
         *
         *   // This returns the EMail of the manager's department for the
         *   // user who has created the item
         *   list.getItemProperty(ID, 'Created/Department/Manager/EMail');
         * </pre>
         *
        */
        SPListObj.prototype.getItemProperty = function(ID, query) {

            var self = this;
            var def = $q.defer();
            var executor = new SP.RequestExecutor(self.web.url);

            executor.executeAsync({

                url: self.apiUrl + '/getItemById(' + ID + ')/' + query.ltrim('/'),
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

        }; // getItemProperty




        /**
         * @ngdoc function
         * @name ngSharePoint.SPList#getDefaultViewUrl
         * @methodOf ngSharePoint.SPList
         *
         * @description
         * Use this method to obtain the default view URL of a list.
         *
         * **Note** This method uses JSOM to retrieve this URL because there aren't
         * any REST API call that returns this value.
         *
         * @returns {promise} promise with the url.
         *
        */
        SPListObj.prototype.getDefaultViewUrl = function() {

            var self = this;
            var def = $q.defer();

            if (this.defaultViewUrl !== void 0) {

                def.resolve(this.defaultViewUrl);
                return def.promise;
            }

            var listGuid = self.Id;

            self.context = new SP.ClientContext(self.web.url);
            var web = self.context.get_web();

            if (self.Id !== void 0) {
                self._list = web.get_lists().getById(self.Id);
            } else {
                self._list = web.get_lists().getByTitle(self.listName);
            }

            self.context.load(self._list, 'DefaultViewUrl');

            self.context.executeQueryAsync(function() {


                self.defaultViewUrl = self._list.get_defaultViewUrl();
                def.resolve(self.defaultViewUrl);


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

            return def.promise;

        };   // getDefaultViewUrl




        /**
         * @ngdoc function
         * @name ngSharePoint.SPList#getDefaultEditFormUrl
         * @methodOf ngSharePoint.SPList
         *
         * @description
         * Use this method to obtain the URL of the default edit form.
         *
         * **Note** This method uses JSOM to retrieve this URL because there isn't
         * an REST API call that returns this value.
         *
         * @returns {promise} promise with the url.
         *
        */
        SPListObj.prototype.getDefaultEditFormUrl = function() {

            var self = this;
            var def = $q.defer();

            if (this.defaultEditFormUrl !== void 0) {

                def.resolve(this.defaultEditFormUrl);
                return def.promise;
            }

            var listGuid = self.Id;

            self.context = new SP.ClientContext(self.web.url);
            var web = self.context.get_web();

            if (self.Id !== void 0) {
                self._list = web.get_lists().getById(self.Id);
            } else {
                self._list = web.get_lists().getByTitle(self.listName);
            }

            self.context.load(self._list, 'DefaultEditFormUrl');

            self.context.executeQueryAsync(function() {


                self.defaultEditFormUrl = self._list.get_defaultEditFormUrl();
                def.resolve(self.defaultEditFormUrl);


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

            return def.promise;

        };   // getDefaultEditFormUrl




        /**
         * @ngdoc function
         * @name ngSharePoint.SPList#getDefaultDisplayFormUrl
         * @methodOf ngSharePoint.SPList
         *
         * @description
         * Use this method to obtain the URL of the default display form.
         *
         * **Note** This method uses JSOM to retrieve this URL because there aren't
         * any REST API call that returns this value.
         *
         * @returns {promise} promise with the url.
         *
        */
        SPListObj.prototype.getDefaultDisplayFormUrl = function() {

            var self = this;
            var def = $q.defer();

            if (this.defaultDisplayFormUrl !== void 0) {

                def.resolve(this.defaultDisplayFormUrl);
                return def.promise;
            }

            var listGuid = self.Id;

            self.context = new SP.ClientContext(self.web.url);
            var web = self.context.get_web();

            if (self.Id !== void 0) {
                self._list = web.get_lists().getById(self.Id);
            } else {
                self._list = web.get_lists().getByTitle(self.listName);
            }

            self.context.load(self._list, 'DefaultDisplayFormUrl');

            self.context.executeQueryAsync(function() {


                self.defaultDisplayFormUrl = self._list.get_defaultDisplayFormUrl();
                def.resolve(self.defaultDisplayFormUrl);


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

            return def.promise;

        };   // getDefaultDisplayFormUrl




        /**
         * @ngdoc function
         * @name ngSharePoint.SPList#getDefaultNewFormUrl
         * @methodOf ngSharePoint.SPList
         *
         * @description
         * Use this method to obtain the URL of the default new form.
         *
         * **Note** This method uses JSOM to retrieve this URL because there aren't
         * any REST API call that returns this value.
         *
         * @returns {promise} promise with the url.
         *
        */
        SPListObj.prototype.getDefaultNewFormUrl = function() {

            var self = this;
            var def = $q.defer();

            if (this.defaultNewFormUrl !== void 0) {

                def.resolve(this.defaultNewFormUrl);
                return def.promise;
            }

            var listGuid = self.Id;

            self.context = new SP.ClientContext(self.web.url);
            var web = self.context.get_web();

            if (self.Id !== void 0) {
                self._list = web.get_lists().getById(self.Id);
            } else {
                self._list = web.get_lists().getByTitle(self.listName);
            }

            self.context.load(self._list, 'DefaultNewFormUrl');

            self.context.executeQueryAsync(function() {


                self.defaultNewFormUrl = self._list.get_defaultNewFormUrl();
                def.resolve(self.defaultNewFormUrl);


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

            return def.promise;

        };   // getDefaultNewFormUrl



        /**
         * Creates an item in the list
         * This method is obsolete. Use the SPListItem.save method.
         */
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



        /**
         * Updates a specific item in the list
         * This method is obsolete. Use the SPListItem.save method.
         */
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



        /**
         * Removes an item in the list
         * This method is obsolete. Use the SPListItem.remove method.
         */
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

/**
 * @ngdoc object
 * @name ngSharePoint.SPListItem
 *
 * @description
 * Represents an SPListItem object that you could use to insert, modify or remove items on
 * SharePoint lists.
 *
 * It is possible to create new SPListItem objects or use an {@link ngSharePoint.SPList SPList} object to
 * get the SPListItems stored in the list.
 *
 * *At the moment, not all SharePoint API methods for list items are implemented in ngSharePoint*
 *
 * @requires ngSharePoint.SPList
 *
 */



angular.module('ngSharePoint').factory('SPListItem',

    ['$q', 'SPUtils',

    function SPListItem_Factory($q, SPUtils) {

        'use strict';


        /**
         * @ngdoc function
         * @name ngSharePoint.SPListItem#constructor
         * @constructor
         * @methodOf ngSharePoint.SPListItem
         *
         * @description
         * Instantiates a new `SPListItem` object for a specific list. It's possible
         * to specify their new properties (data).
         *
         * When you call {@link ngSharePoint.SPList#getListItems getListItems} or
         * {@link ngSharePoint.SPList#getItemById getItemById}, SPListItem objects are returned.
         *
         * @param {SPList} list A valid {@link ngSharePoint.SPList SPList} object where the item is stored
         * @param {object|Int32} data|itemId Can be an object with item properties or an item identifier.
         *
         * @example
         * The next code creates a new announcement:
         * <pre>
         *   SharePoint.getCurrentWeb(function(web) {
         *
         *     web.getList('Announcements').then(function(list) {
         *
         *          var item = new SPListItem(list);
         *
         *          item.Title = 'ngSharePoint is here!!';
         *          item.Body = '<strong>ngSharePoint</strong> is a new Angular library that allows to <br/>interact easily with SharePoint';
         *          item.Expires = new Date(2020, 12, 31);
         *
         *          item.save().then(function() {
         *              SP.UI.Notify.addNotification('Annuncement created', false);
         *          });
         *     });
         *
         *   });
         * </pre>
         */
        var SPListItemObj = function(list, data) {

            var self = this;

            if (list === void 0) {
                throw 'Required @list parameter not specified in SPListItem constructor.';
            }


            this.list = list;


            if (data !== void 0) {

                if (typeof data === 'object' && data.concat === void 0) { //-> is object && not is array

                    if (data.list !== void 0) {
                        delete data.list;
                    }

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



        /**
         * @ngdoc function
         * @name ngSharePoint.SPListItem#isNew
         * @methodOf ngSharePoint.SPListItem
         *
         * @description
         * List items can be retrieved from the server or created on the client side before
         * being saved on the server.
         *
         * This method indicates if the item is new and will create an item on the server
         * or will update an existing element.
         *
         * Any item that doesn't have `Id` property is considered new.
         *
         * @returns {Boolean} indicating if the item is new or not.
         *
         */
        SPListItemObj.prototype.isNew = function() {
            return this.Id === void 0;
        };



        /**
         * This method is called internally to get the correct API url depending if the
         * item is new or not.
         * This can be <site>/_api/web/<list>/Items for new elements or
         * <site>/_api/web/<list>/Items(<itemId>) for existing items
         *
         * @returns {string} with the correct API REST url endpoint for the item.
         */
        SPListItemObj.prototype.getAPIUrl = function() {

            var apiUrl = this.list.apiUrl + '/Items';

            if (this.Id !== void 0) {

                apiUrl += '(' + this.Id + ')';
            }

            return apiUrl;
        };



        /**
         * @ngdoc function
         * @name ngSharePoint.SPListItem#getProperties
         * @methodOf ngSharePoint.SPListItem
         *
         * @description
         * Retrieve an item from the server and attaches it to 'this' object. To retrieve
         * a specific item, you must specify the item ID.
         *
         *
         * Instead of creating a new SPListItem, specify the ID and `getProperties` then it is recommendable
         * to use {@link ngSharePoint.SPList#getItemById getItemById} of the SPList object.
         *
         * By default, if the item is a DocumentLibrary item, this method gets the {@link ngSharePoint.SPFile File}
         * and/or {@link ngSharePoint.SPFolder Folder} properties.
         *
         * @param {string} expandProperties Comma separated values with the properties to expand
         * in the item.
         *
         * @returns {promise} promise with all the item properties (fields) retrieved from the server
         *
         * @example
         * <pre>
         *    var item = new SPListItem(anyList, anyId);
         *    // or
         *    var otherItem = new SPListItem(anyList);
         *    otherItem.Id = anyId;
         *
         *    // Later ...
         *    item.getProperties().then(function() {
         *
         *      console.log('This will return false: ' + item.isNew());
         *      console.log(item.Title);
         *
         *    });
         *
         * </pre>
        */
        SPListItemObj.prototype.getProperties = function(expandProperties) {

            var self = this;
            var def = $q.defer();
            var query = {};

            if (expandProperties !== void 0) {
                query.$expand = expandProperties;
            }

            var executor = new SP.RequestExecutor(self.list.web.url);

            executor.executeAsync({

                url: self.getAPIUrl() + utils.parseQuery(query),
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



        /**
         * @ngdoc function
         * @name ngSharePoint.SPListItem#getFieldValuesAsHtml
         * @methodOf ngSharePoint.SPListItem
         *
         * @description
         * This method performs a REST call to _api/web/list/item/FieldValuesAsHtml.
         *
         * That is different to expand the property when executes getProperties. That method
         * makes a call like _api/web/list/item?$expand=FieldValuesAsHtml.
         *
         * if expanding this property does not retrieve detailed information lookup
         * values nor user fields, then it is necessary to call this method.
         *
         * @returns {promise} promise with the result of the REST query
         *
         */
        SPListItemObj.prototype.getFieldValuesAsHtml = function() {

            var self = this;
            var def = $q.defer();
            var executor = new SP.RequestExecutor(self.list.web.url);

            executor.executeAsync({

                url: self.getAPIUrl() + '/FieldValuesAsHtml',
                method: 'GET',
                headers: {
                    "Accept": "application/json; odata=verbose"
                },

                success: function(data) {

                    var d = utils.parseSPResponse(data);

                    utils.cleanDeferredProperties(d);
                    self.FieldValuesAsHtml = d;
                    def.resolve(this);
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

        };  // getFieldValuesAsHtml




        /**
         * @ngdoc function
         * @name ngSharePoint.SPListItem#getFile
         * @methodOf ngSharePoint.SPListItem
         *
         * @description
         * Gets the file property of the item and attaches it to 'this' objtect.
         * If the item is not a DocumentLibrary document element, the REST query returns no results.
         *
         * @returns {promise} promise with the result of the REST query
         *
         */
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



        /**
         * @ngdoc function
         * @name ngSharePoint.SPListItem#getFolder
         * @methodOf ngSharePoint.SPListItem
         *
         * @description
         * Gets the folder property of the item and attaches it to 'this' objtect.
         * If the item is not a DocumentLibrary folder element, the REST query returns no results.
         *
         * @returns {promise} promise with the result of the REST query
         *
         */
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



        /**
         * @ngdoc function
         * @name ngSharePoint.SPListItem#getAttachments
         * @methodOf ngSharePoint.SPListItem
         *
         * @description
         * Gets all attachments of the item. This method initializes a new item property
         * called AttachmentFiles with an array of all attached elements.
         *
         * @returns {promise} promise with the array of attachments.
         *
         */
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



        /**
         * @ngdoc function
         * @name ngSharePoint.SPListItem#addAttachment
         * @methodOf ngSharePoint.SPListItem
         *
         * @description
         * Attach a new file to the item.
         *
         * **Note** This method is called internally by the method `processAttachments`
         * when the item is saved to the server
         * and their property item.attachments.add is an array with files to attach.
         *
         * @param {object} file DOM object to be attached to the item
         * @returns {promise} promise with the result of the REST call.
         *
         */
        SPListItemObj.prototype.addAttachment = function(file) {

            var self = this;
            var def = $q.defer();
            var executor = new SP.RequestExecutor(self.list.web.url);

            SPUtils.getFileBinary(file).then(function(binaryData) {

                // Set the headers for the REST API call.
                // ----------------------------------------------------------------------------
                var headers = {
                    "Accept": "application/json; odata=verbose"
                };



                var requestDigest = document.getElementById('__REQUESTDIGEST');
                // Remote apps that use OAuth can get the form digest value from the http://<site url>/_api/contextinfo endpoint.
                // SharePoint-hosted apps can get the value from the #__REQUESTDIGEST page control if it's available on the SharePoint page.

                if (requestDigest !== null) {
                    headers['X-RequestDigest'] = requestDigest.value;
                }



                executor.executeAsync({

                    url: self.getAPIUrl() + "/AttachmentFiles/add(FileName='" + file.name + "')",
                    method: "POST",
                    binaryStringRequestBody: true,
                    body: binaryData,
                    state: "Update",
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

        }; // addAttachment



        /**
         * @ngdoc function
         * @name ngSharePoint.SPListItem#removeAttachment
         * @methodOf ngSharePoint.SPListItem
         *
         * @description
         * Remove an item attached file
         *
         * **Note** This method is called internally by the method `processAttachments
         * when the item is saved to the server
         * and their property item.attachments.remove is an array with files to remove.
         *
         * @param {string} fileName The name of the file to remove.
         * @returns {promise} promise with the result of the REST call.
         *
         */
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




        /**
         * @ngdoc function
         * @name ngSharePoint.SPListItem#processAttachment
         * @methodOf ngSharePoint.SPListItem
         *
         * @description
         * Process the attachments array (item.attachments.add and item.attachments.remove)
         * when the item is saved to the server.
         *
         * The attachments array contains the collection of files to attach to the item
         * and the attachments to remove.
         *
         * After the process, the attachments array will be initialized.
         *
         * **Note** This method is called internally by the `save method.
         *
         * @returns {promise} promise with the result of the process.
         *
         */
        SPListItemObj.prototype.processAttachments = function() {

            var self = this;
            var def = $q.defer();



            function processAttachmentsInternal(attachmentsOperations, index, deferred) {

                index = index || 0;
                deferred = deferred || $q.defer();

                var attachmentOperation = attachmentsOperations[index++];

                if (attachmentOperation === void 0) {

                    deferred.resolve();
                    return deferred.promise;

                }

                switch(attachmentOperation.operation.toLowerCase()) {

                    case 'add':
                        self.addAttachment(attachmentOperation.file).finally(function() {

                            processAttachmentsInternal(attachmentsOperations, index, deferred);

                        }).catch(function(err) {

                            try {

                                var errorStatus = err.data.statusCode + ' (' + err.data.statusText + ')';
                                alert(attachmentOperation.file.name + '\n\n' + err.code + '\n' + errorStatus + '\n\n' + err.message);

                            } catch(e) {

                                console.log(err);
                                alert('Error attaching the file ' + attachmentOperation.file.name);

                            }

                        });
                        break;

                    case 'remove':
                        self.removeAttachment(attachmentOperation.fileName).finally(function() {

                            processAttachmentsInternal(attachmentsOperations, index, deferred);

                        });
                        break;

                }

                return deferred.promise;

            } // processAttachmentsInternal



            // Check if the attachments property has been initialized
            if (this.attachments !== void 0) {

                var attachmentsOperations = [];

                if (this.attachments.remove !== void 0 && this.attachments.remove.length > 0) {
                    angular.forEach(this.attachments.remove, function(fileName) {
                        attachmentsOperations.push({
                            operation: 'remove',
                            fileName: fileName
                        });
                    });
                }

                if (this.attachments.add !== void 0 && this.attachments.add.length > 0) {
                    angular.forEach(this.attachments.add, function(file) {
                        attachmentsOperations.push({
                            operation: 'add',
                            file: file
                        });
                    });
                }


                // Process the attachments operations sequentially with promises.
                processAttachmentsInternal(attachmentsOperations).then(function() {

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




        /**
         * @ngdoc function
         * @name ngSharePoint.SPListItem#save
         * @methodOf ngSharePoint.SPListItem
         *
         * @description
         * This method saves the item to the server.
         *
         * If the item is new because it doesn't have an `Id, a new item is created.
         * If the item is an existing element retrieved previously, the
         * element is updated with the new set of properties (fields).
         *
         * This method saves the item and processes the attachments arrays.
         *
         * After processing, the attachments array will be initialized.
         *
         * @returns {promise} promise with an object with the item properties
         *
         * @example
         * This example retrieves a task item from the server and
         * changes his state to 'Closed'
         * <pre>
         *
         *    taskList.getItemById(taskId).then(function(task) {
         *
         *        task.Status = 'Closed';
         *        task.save().then(function() {
         *
         *            SP.UI.Notify.addNotification("Task closed!", false);
         *
         *        });
         *
         *    });
         *
         * </pre>
         *
         */
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
                        // delete saveObj[field.InternalName];
                        if (field.EntityPropertyName !== 'ContentTypeId') delete saveObj[field.EntityPropertyName];
                    }

                    // NOTA DE MEJORA!
                    // Se pueden controlar los campos de tipo Lookup y User para que convierta los valores
                    // al nombre de campo correcto (si es que están mal)
                    //
                    // Ej. un campo que se llama Sala y el objeto tiene
                    // obj.Sala = 12
                    //
                    // Para que no se produzca un error, se deberia convertir a:
                    //
                    // obj.SalaId = 12
                    //

                    var fieldType = field.originalTypeAsString || field.TypeAsString;
                    // var fieldName = field.InternalName;
                    var fieldName = field.EntityPropertyName;
                    if (fieldType == 'Lookup' || fieldType == 'LookupMulti' || fieldType == 'User' || fieldType == 'UserMulti') {
                        fieldName = fieldName + 'Id';
                    }

                    if (fieldType == 'LookupMulti' || fieldType == 'MultiChoice' || fieldType == 'UserMulti') {

                        // To prevent Collection(Edm.String)[Nullable=False] error.
                        // This error will be thrown even if this is not a required field
                        if (saveObj[fieldName] === null) {
                            delete saveObj[fieldName];
                        }
                    }

                    // Required fields with null values don't allow to save the item
                    // Deleting this properties the item will be saved correctly
                    if (field.Required === true) {
                        if (saveObj[fieldName] === null) {

                            delete saveObj[fieldName];
                        }
                    }

                    // NOTE 5/25/2016
                    // If you want to update User properties, use the <field-name>StringId property
                    // instead of <field-name>Id.
                    // Note, this only apply for update items, not when creates a new one.
                    // This behavior is detected on SharePoint on-line (16.0.0.5312)!!
                    if (fieldType == 'User' || fieldType == 'UserMulti') {
                        if (saveObj[field.EntityPropertyName + 'StringId'] !== undefined) {
                            // There is a property with name <field-name>StringId.
                            // Update it ...
                            if (fieldType == 'User') {
                                saveObj[field.EntityPropertyName + 'StringId'] = (saveObj[fieldName] || '').toString();
                            } else {
                                var value = { results: [] };
                                angular.forEach(saveObj[fieldName].results, function(v) {
                                    value.results.push(v.toString());
                                });
                                saveObj[field.EntityPropertyName + 'StringId'] = value;
                            }
                        }
                    }
                });

                // Remove attachments
                delete saveObj.attachments;
                delete saveObj.AttachmentFiles;
                delete saveObj.ContentType;
                delete saveObj.FieldValuesAsHtml;
                delete saveObj.Folder;
                delete saveObj.File;

                angular.extend(body, saveObj);


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

                        /**
                         * On a document library, if user changes the name of the
                         * file (by the FileLeafRef field), the .File property that
                         * points to the File object on the server, will have a bad
                         * api url
                         * This problem can solfe with a call to updateAPIUrlById method
                         * that modifies the apiURL property correctly

                        if (self.File !== undefined) {
                            self.File.updateAPIUrlById(self.list, self.Id);
                        }

                        */

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




        /**
         * @ngdoc function
         * @name ngSharePoint.SPListItem#remove
         * @methodOf ngSharePoint.SPListItem
         *
         * @description
         * This method removes the item from the server.
         *
         * @param {boolean=} permanent Indicates if the item is recycled or removed permanently.
         * @returns {promise} promise with the result of the REST query.
         *
         */
        SPListItemObj.prototype.remove = function(permanent) {

            var self = this;
            var def = $q.defer();
            var executor = new SP.RequestExecutor(self.list.web.url);


            // Set the headers for the REST API call.
            // ----------------------------------------------------------------------------
            var headers = {
                "Accept": "application/json; odata=verbose"
            };

            var requestDigest = document.getElementById('__REQUESTDIGEST');
            // Remote apps that use OAuth can get the form digest value from the http://<site url>/_api/contextinfo endpoint.
            // SharePoint-hosted apps can get the value from the #__REQUESTDIGEST page control if it's available on the SharePoint page.

            if (requestDigest !== null) {
                headers['X-RequestDigest'] = requestDigest.value;
            }

            var url = self.getAPIUrl() + '/recycle';

            if (permanent === true) {
                url = url.rtrim('/recycle');
                headers['X-HTTP-Method'] = 'DELETE';
                headers['IF-MATCH'] = '*';
            }


            // Make the call.
            // ----------------------------------------------------------------------------
            executor.executeAsync({

                url: url,
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




        /**
         * @ngdoc function
         * @name ngSharePoint.SPListItem#runWorkflow
         * @methodOf ngSharePoint.SPListItem
         *
         * @description
         * This method starts a new instance of a specified workflow for the current item.
         *
         * The workflow must be enabled and no other instances of the same workflow version
         * can be running.
         *
         * The method allows you to specify the initiation form data.
         *
         * **NOTE**:
         * Due to limitations of the SharePoint REST api, there isn't a method
         * to run a workflow. Because of that, this method uses the SharePoint `workflow.asmx` web service.
         *
         * **Limitations**:
         * This method uses JSOM to retrieve the `FileRef` property of the item. This means
         * that this method can't be executed outside of the SharePoint page context.
         *
         *
         * @param {string} workflowName The name or the ID of the workflow that you want to run.
         * @param {object} params Initiation workflow data. An object with all properties and
         * values that will be passed to the workflow.
         * @returns {promise} promise with the result of the operation.
         *
         */
        SPListItemObj.prototype.runWorkflow = function(workflowName, params) {

            var self = this;
            var def = $q.defer();
            var executor = new SP.RequestExecutor(self.list.web.url);

            if (workflowName === void 0) {
                throw 'Required @workflowName parameter not specified in SPListItem.runWorkflow method.';
            }

            if (!utils.isGuid(workflowName)) {

                this.list.getWorkflowAssociationByName(workflowName).then(function(workflowAssociations) {

                    if (workflowAssociations.length > 0) {

                        return self.runWorkflow(workflowAssociations[0].Id, params);

                    } else {

                        console.error('There is no associated workflow with name ' + workflowName);
                        def.reject('There is no associated workflow with name ' + workflowName);
                    }
                });

            } else {

                var context = new SP.ClientContext(self.list.web.url);
                var web = context.get_web();
                var list = web.get_lists().getById(self.list.Id);
                self._item = list.getItemById(self.Id);
                context.load(self._item);

                context.executeQueryAsync(function() {

                    // Set the headers for the REST API call.
                    // ----------------------------------------------------------------------------
                    var headers = {
                        "content-type": "text/xml;charset='utf-8'"
                    };

                    var requestDigest = document.getElementById('__REQUESTDIGEST');
                    // Remote apps that use OAuth can get the form digest value from the http://<site url>/_api/contextinfo endpoint.
                    // SharePoint-hosted apps can get the value from the #__REQUESTDIGEST page control if it's available on the SharePoint page.

                    if (requestDigest !== null) {
                        headers['X-RequestDigest'] = requestDigest.value;
                    }

                    var data = '<soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap12="http://www.w3.org/2003/05/soap-envelope"><soap12:Body><StartWorkflow xmlns="http://schemas.microsoft.com/sharepoint/soap/workflow/"><item>';
                    data += _spPageContextInfo.webAbsoluteUrl + self._item.get_item('FileRef');
                    data += '</item><templateId>';
                    data += workflowName;
                    data += '</templateId><workflowParameters><root /></workflowParameters></StartWorkflow></soap12:Body></soap12:Envelope>';

                    // Make the call.
                    // ----------------------------------------------------------------------------
                    executor.executeAsync({

                        url: self.list.web.url.rtrim('/') + '/_vti_bin/workflow.asmx',
                        method: "POST",
                        dataType: "xml",
                        async: true,
                        headers: headers,
                        body: data,

                        success: function(data) {

                            self.getProperties().then(function() {
                                def.resolve();
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

                }); // get _item

            }

            return def.promise;

        }; // runWorkflow



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

/**
 * @ngdoc object
 * @name ngSharePoint.SPUtils
 *
 * @description
 * This factory provides functionality to manage ribbon (tabs, groups, buttons).
 *
 * *At the moment, not all SharePoint API methods for content type objects are implemented in ngSharePoint*
 *
 * *Documentation is pending*
 */


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

            // NOTE: The 'pageManager.$2o_1' property is an object that contains all the components 
            //       by name and we could try to get the correct component id from it but we can't 
            //       ensure that this property ($2o_1) always will have this name.
            //

            // Unregister the commands for SharePoint 2013 FOUNDATION !?
            unregisterComponentCommands('WebPartWPQ1', 'Ribbon.ListForm.Edit.Commit.Publish');
            unregisterComponentCommands('WebPartWPQ1', 'Ribbon.ListForm.Edit.Commit.Cancel');
            unregisterComponentCommands('WebPartWPQ1', 'Ribbon.ListForm.Edit.Actions.AttachFile');


            // Register classes and initialize page component
            ngSharePointPageComponent.registerClass('ngSharePointPageComponent', CUI.Page.PageComponent);
            var instance = ngSharePointPageComponent.initializePageComponent();


            // Returns the component instance
            return instance;

        } // registerPageComponent

    } // SPRibbon factory

})();

/**
 * @ngdoc object
 * @name ngSharePoint.SPUser
 *
 * @description
 * Represents an SPUser object that is used to access all SharePoint user properties.
 * 
 * When you instantiate an SPUser object (with any user ID), the service is configured
 * with a pointer to the next REST api: `http://<site-url>/_api/web/SiteUserInfoList/getItemById(userID)`.
 * If you instantiate an SPUser object with a login name, the api is configured with the
 * url: `http://<site-url>/_api/web/siteusers/getByLoginName(loginName)`.
 *
 * You should take care with this difference, because the properties returned by these 
 * two API's are different. View the SharePoint documentation to get more information or 
 * make some calls to the API in a browser in order to see which method you prefer.
 *
 * *At the moment, not all SharePoint API methods for user objects are implemented in ngSharePoint*
 *
 */



angular.module('ngSharePoint').factory('SPUser', 

	['$q', 'SPObjectProvider', 'SPHttp', 

	function SPUser_Factory($q, SPObjectProvider, SPHttp) {


		/**
		 * @ngdoc function
		 * @name ngSharePoint.SPUser#constructor
		 * @constructor
		 * @methodOf ngSharePoint.SPUser
		 * 
		 * @description
		 * Instantiates a new SPUser object that points to a specific SharePoint user and allows
		 * retrieval of their properties
		 * 
		 * @param {SPWeb} web A valid {@link ngSharePoint.SPWeb SPWeb} object
		 * @param {int|string} userId|loginName User id or login name of the user that will retrieve properties
		 * @param {object} data Properties to initialize the object (optional)
		 * 
		 * @example
		 * <pre>
		 * var user = new SPUser(web, 'mydomain\user1');
		 * // ... do something with the user object
		 * user.getProperties().then(...);
		 * </pre>
		 *
		 */
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

				this.apiUrl = '/siteusers/getByLoginName(@v)?@v=\'' + encodeURIComponent(userId) + '\'';

			}

			// Initializes the SharePoint API REST url for the user.
			this.apiUrl = web.apiUrl + this.apiUrl;

			// Init userProperties (if exists)
			if (userData !== void 0) {
				utils.cleanDeferredProperties(userData);
				angular.extend(this, userData);
				if (this.LoginName === void 0 && this.Name !== void 0) {
					this.LoginName = this.Name;
				}
			}
		};



		/**
		 * @ngdoc function
		 * @name ngSharePoint.SPUser#getProperties
		 * @constructor
		 * @methodOf ngSharePoint.SPUser
		 * 
		 * @description
		 * Makes a call to the SharePoint server and gets all their properties.
		 * The current object is extended with all recovered properties. This means that when you have executed this 
		 * method, you will have direct access to their values. ex: `user.IsSiteAdmin`, `user.LoginName`, `user.Title`, etc.
		 * 
		 * For a complete list of user properties go to Microsoft 
		 * SharePoint {@link https://msdn.microsoft.com/EN-US/library/dn531432.aspx#bk_UserProperties api reference}.
		 *
		 * SharePoint REST api only returns certain user properties that have primary values. Properties with complex structures
		 * like user `Groups` are not returned directly by the api and you need to extend the query
		 * to retrieve their values. You can accomplish this with the `query` param.
		 *
		 * @param {object} query With this parameter you can specify which web properties you want to extend and to retrieve from the server.
		 * @returns {promise} promise with an object with all user properties
		 * 
		 * @example
		 * <pre>
		 * // _spContextInfo.userId contains the ID of the current loged user. We can use
		 * // this SharePoint environtment variable to retrieve current user information
		 * var currentUser = new SPUser(currentWeb, _spPageContextInfo.userId);
		 * currentUser.getProperties().then(function() {
	     * 
	     *   if (currentUser.IsSiteAdmin) {
		 *      // ...
		 *   }
		 * });
		 * </pre>
		 */
		SPUserObj.prototype.getProperties = function(query) {

			var self = this,
				url = self.apiUrl + utils.parseQuery(query);

			return SPHttp.get(url).then(function(data) {

				utils.cleanDeferredProperties(data);
				
				angular.extend(self, data);
				self.LoginName = self.Name;

				return self;

			});

		}; // getProperties


		/**
	     * @ngdoc function
	     * @name ngSharePoint.SPUser#getGroups
	     * @methodOf ngSharePoint.SPUser
	     *
	     * @description
	     * Retrieves the asociated user groups and returns an
	     * array of {@link ngSharePoint.SPGroup SPGroup} objects.
	     *
	     * @returns {promise} promise with an array of {@link ngSharePoint.SPGroup SPGroup} objects.
	     *
		 * @example
		 * <pre>
		 *
		 *   SharePoint.getCurrentWeb(function(webObject) {
		 *
		 *     var web = webObject;
		 *     web.getCurrentUser().then(function(user) {
		 *
		 *		  user.getGropus().then(function(groups) {
		 *       
		 *        	angular.forEach(groups, function(group) {
	     *           
	     *           	console.log(group.Title + ' ' + group.Description);
		 *        	});
		 *		  });
		 *     });
		 *
		 *   });
		 * </pre>
		 */
		SPUserObj.prototype.getGroups = function() {

			var self = this;

			var url = self.web.apiUrl + '/getUserById(' + self.Id + ')/Groups';
			return SPHttp.get(url).then(function(data) {

				var groups = [];

				angular.forEach(data, function(groupProperties) {
					var spGroup = SPObjectProvider.getSPGroup(self.web, groupProperties.Id, groupProperties);
					groups.push(spGroup);
				});

				self.Groups = groups;
				return groups;

			});

		};


				// Returns the SPUserObj class
		return SPUserObj;

	}
]);

/**
 * @ngdoc object
 * @name ngSharePoint.SPUtils
 *
 * @description
 * This factory provides helpers and utilities.
 *
 * *Documentation is pending*
 */


angular.module('ngSharePoint').factory('SPUtils',

    ['SPConfig', '$q', '$http', '$injector', 'ODataParserProvider',

    function SPUtils_Factory(SPConfig, $q, $http, $injector, ODataParserProvider) {

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

                if (window.SP === undefined) {

                    // ng-SharePoint is running outside of SharePoint site
                    isSharePointReady = true;
                }

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


            refreshDigestValue: function(baseUrl) {

                var self = this;
                var deferred = $q.defer();

                var url = (baseUrl || _spPageContextInfo.webAbsoluteUrl) + '/_api/contextinfo';
                $http({

                    url: url,
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


            getUserInfoByLoginName: function(loginName) {

                var self = this;
                var deferred = $q.defer();

                var ctx = new SP.ClientContext.get_current();
                var user = ctx.get_web().ensureUser(loginName);
                ctx.load(user);
                ctx.executeQueryAsync(function() {

                    var objectData = user.get_objectData();
                    deferred.resolve(objectData.get_properties());

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

                if (self.lcid !== undefined) {
                    // lcid exists yet
                    deferred.resolve(self.lcid);
                    return deferred.promise;
                }

                if (self.getCurrentUserLCIDPromises !== undefined) {
                    // there are a pending request
                    self.getCurrentUserLCIDPromises.push(deferred);
                    return deferred.promise;
                }

                self.getCurrentUserLCIDPromises = [];
                self.getCurrentUserLCIDPromises.push(deferred);

                function getLCIDFromRegionalSettingsPage(pageUrl) {

                    var def = $q.defer();

                    $http.get(pageUrl).success(function(data) {

                        var html = angular.element(data);
                        var form, lcid;

                        angular.forEach(html, function(element) {
                            if (element.tagName && element.tagName.toLowerCase() === 'form') {
                                form = element;
                            }
                        });

                        var retValue;

                        if (form !== void 0) {

                            var followWebSettings = form.querySelector('#ctl00_PlaceHolderMain_ctl08_ChkFollowWebRegionalSettings');
                            if (followWebSettings === null) {
                                followWebSettings = { checked: false };
                            }

                            if (followWebSettings.checked) {

                                // inherits settings
                                // def.resolve(undefined);

                            } else {

                                var selectedOption = { value: undefined };
                                var regionalSettingsSelect = form.querySelector('#ctl00_PlaceHolderMain_ctl02_ctl01_DdlwebLCID');
                                if (regionalSettingsSelect !== null) {
                                    selectedOption = regionalSettingsSelect.querySelector('[selected]');
                                }

                                // def.resolve(selectedOption.value);
                                retValue = selectedOption.value;
                            }
                        }

                        def.resolve(retValue);

                    }); // $http

                    return def.promise;

                }   // getLCIDFromRegionalSettingsPage



                // retrieve the User LCID
                var url = _spPageContextInfo.webServerRelativeUrl.rtrim('/') + "/_layouts/15/regionalsetng.aspx?Type=User";
                getLCIDFromRegionalSettingsPage(url).then(function(lcid) {

                    if (lcid === undefined) {

                        // we will get the web sttings configuration
                        url = _spPageContextInfo.webServerRelativeUrl.rtrim('/') + "/_layouts/15/regionalsetng.aspx";
                        getLCIDFromRegionalSettingsPage(url).then(function(lcid) {

                            if (lcid === undefined) {
                                // no language :-(
                                self.lcid = _spPageContextInfo.currentLanguage;
                            } else {
                                self.lcid = lcid;
                            }

                            angular.forEach(self.getCurrentUserLCIDPromises, function(promise) {
                                promise.resolve(self.lcid);
                            });
                        });

                    } else {

                        self.lcid = lcid;

                        angular.forEach(self.getCurrentUserLCIDPromises, function(promise) {
                            promise.resolve(self.lcid);
                        });

                    }
                });

/*

                $http.get(url).success(function(data) {

                    var html = angular.element(data);
                    var form, lcid;

                    angular.forEach(html, function(element) {
                        if (element.tagName && element.tagName.toLowerCase() === 'form') {
                            form = element;
                        }
                    });

                    if (form !== void 0) {

                        if (form.querySelector('#ctl00_PlaceHolderMain_ctl08_ChkFollowWebRegionalSettings').checked) {
                            // user inherits web settings

                        } else {

                            var regionalSettingsSelect = form.querySelector('#ctl00_PlaceHolderMain_ctl02_ctl01_DdlwebLCID');
                            var selectedOption = regionalSettingsSelect.querySelector('[selected]');
                            self.lcid = selectedOption.value;

                            angular.forEach(self.getCurrentUserLCIDPromises, function(promise) {
                                promise.resolve(self.lcid);
                            });
                        }

                    }

                    if (self.lcid === undefined) {

                        // we will get the web sttings configuration
                        url = _spPageContextInfo.webServerRelativeUrl.rtrim('/') + "/_layouts/15/regionalsetng.aspx";
                        $http.get(url).success(function(data) {

                            html = angular.element(data);

                            angular.forEach(html, function(element) {
                                if (element.tagName && element.tagName.toLowerCase() === 'form') {
                                    form = element;
                                }
                            });

                            if (form !== void 0) {

                                regionalSettingsSelect = form.querySelector('#ctl00_PlaceHolderMain_ctl02_ctl01_DdlwebLCID');
                                selectedOption = regionalSettingsSelect.querySelector('[selected]');
                                self.lcid = selectedOption.value;

                                angular.forEach(self.getCurrentUserLCIDPromises, function(promise) {
                                    promise.resolve(self.lcid);
                                });

                            } else {
                                // no language :-(
                                self.lcid = _spPageContextInfo.currentLanguage;
                                angular.forEach(self.getCurrentUserLCIDPromises, function(promise) {
                                    promise.resolve(self.lcid);
                                });
                            }

                        });
                    }
                });

*/


                return deferred.promise;

            },  // getCurrentUserLCID



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



            /**
             * Converts a file object to binary data string.
             * @param {file} A file object from the files property of the DOM element <input type="File" ... />.
             * @returns {promise} Promise with the binary data.
             */
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
            },


            /**
            * This function calls the 'fn' function injecting the params (services)
            */
            callFunctionWithParams: function(fn, scope) {

                var result = true;
                if (fn) {

                    var annotations = $injector.annotate(fn);
                    result = $injector.invoke(fn, scope, scope);

                }

                return result;
            }

        };

    }
]);


/**
 * @ngdoc object
 * @name ngSharePoint.SPWeb
 *
 * @description
 * Represents an SPWeb object that is used to access to all SharePoint web site properties, lists and users.
 * 
 * When you instantiate an SPWeb object (with any SharePoint site url), the service is configured
 * with a pointer to a REST API of the site `http://<site url>/_api/web`.
 *
 * You musn't instantiate this object directly. You must use {@link ngSharePoint.SharePoint SharePoint} service
 * to get SPWeb instances.
 *
 * If you instantiate a new SPWeb object, you have an object that points to the SharePoint web api. Then, you can access to all
 * web properties or get lists, and users through its methods.
 *
 * *At the moment, not all SharePoint API methods for web objects are implemented in ngSharePoint*
 *
 * @requires ngSharePoint.SPUtils
 * @requires ngSharePoint.SPList
 * @requires ngSharePoint.SPUser
 * @requires ngSharePoint.SPFolder
 * 
 */


angular.module('ngSharePoint').factory('SPWeb', 

	['$q', 'SPHttp', 'SPUtils', 'SPList', 'SPUser', 'SPGroup', 'SPFolder',

	function SPWeb_Factory($q, SPHttp, SPUtils, SPList, SPUser, SPGroup, SPFolder) {

		'use strict';


		/**
		 * @ngdoc function
		 * @name ngSharePoint.SPWeb#constructor
		 * @constructor
		 * @methodOf ngSharePoint.SPWeb
		 * 
		 * @description
		 * Instantiates a new SPWeb object that points to a specific SharePoint site.
		 * 
		 * @param {sring=} url|webID url or web ID. If this parameter is not provided, the object is initialized with the current web
		 * @returns {promise} with the SPWeb object correctly instantiated
		 * 
		 * @example
		 * <pre>
		 * new SPWeb('/mySite').then(function(web) {
		 *   // ... do something with the web object
		 * })
		 * </pre>
		 *
		 * All method calls to this `SPWeb` object will refer to the content of this site (lists, users, ...)
		 */
		var SPWebObj = function(url) {

			this.url = url;

			return this.getApiUrl();

		};



		/**
		 * This method is called when a new SPWeb object is instantiated.
		 * The proupose of this method is to resolve the correct api url of the web, depending on `url` property
		 *
		 * @returns {promise} that will be resolved after the initialization of the SharePoint web API REST url endpoint
		 */
		SPWebObj.prototype.getApiUrl = function() {

			var self = this;
			var def = $q.defer();


			if (this.apiUrl !== void 0) {

				def.resolve(this);

			} else {

				// If not 'url' parameter provided in the constructor, gets the url of the current web.
				if (this.url === void 0) {

					if (window._spPageContextInfo !== undefined) {
						this.url = window._spPageContextInfo.webServerRelativeUrl;
					} else {
						this.url = '/';
					}
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



		/**
		 * @ngdoc function
		 * @name ngSharePoint.SPWeb#getProperties
		 * @methodOf ngSharePoint.SPWeb
		 * 
		 * @description
		 * Makes a call to the SharePoint server and retrieves all web properties.
		 * The current object is extended with all retrieved properties. This means that when you have executed this 
		 * method, you will have direct access to these values. ex: `web.Title`, `web.Language`, etc.
		 * 
		 * For a complete list of web properties go to Microsoft 
		 * SharePoint {@link https://msdn.microsoft.com/en-us/library/dn499819.aspx#bk_WebProperties api reference}
		 *
		 * SharePoint REST api only returns certain web properties that have primary values. Properties with complex structures
		 * like `SiteGroups`, `Lists` or `ContentTypes` are not returned directly by the api and you will need to extend the query
		 * to retrieve their values. You can accomplish this with the `query` param.
		 *
		 * @param {object} query With this parameter you can specify which web properties you want to extend and to retrieve from the server.
		 * By default `RegionalSettings/TimeZone` properties are extended.
		 *
		 * @returns {promise} promise with an object with all web properties
		 * 
		 * @example
		 * This example shows how to retrieve the web properties:
		 * <pre>
		 *
		 *   SharePoint.getCurrentWeb(function(webObject) {
		 *
		 *     var web = webObject;
		 *     web.getProperties().then(function(properties) {
		 *       
		 *        // at this point we have all web properties
		 *        alert(properties.Title);
		 *
		 *        // or you can do
		 *        alert(web.Title);
		 *     });
		 *
		 *   });
		 * </pre>
		 *
		 * This example shows how to retrieve site groups:
		 * <pre>
		 *
		 *   SharePoint.getCurrentWeb(function(webObject) {
		 *
		 *     var web = webObject;
		 *     web.getProperties({$expand: 'SiteGroups'}).then(function() {
		 *       
		 *        angular.forEach(web.SiteGroups.results, function(group) {
	     *           
	     *           console.log(group.Title + ' ' + group.Description);
		 *        });
		 *     });
		 *
		 *   });
		 * </pre>
		 */
		SPWebObj.prototype.getProperties = function(query) {

			var self = this;
			var defaultExpandProperties = 'RegionalSettings/TimeZone';

			return SPUtils.SharePointReady().then(function() {

				if (query) {
					query.$expand = defaultExpandProperties + (query.$expand ? ',' + query.$expand : '');
				} else {
					query = { 
						$expand: defaultExpandProperties
					};
				}

				var url = self.apiUrl + utils.parseQuery(query);

				return SPHttp.get(url).then(function(data) {

					utils.cleanDeferredProperties(data);
					angular.extend(self, data);

					return data;
						
				});
			});

		}; // getProperties



		/**
	     * @ngdoc function
	     * @name ngSharePoint.SPWeb#getLists
	     * @methodOf ngSharePoint.SPWeb
	     *
	     * @description
	     * Retrieves all SharePoint lists and document libraries from the server and returns an
	     * array of {@link ngSharePoint.SPList SPList} objects.
	     *
	     * @returns {promise} promise with an array of {@link ngSharePoint.SPList SPList} objects.
	     *
		 * @example
		 * <pre>
		 *
		 *   SharePoint.getCurrentWeb(function(webObject) {
		 *
		 *     var web = webObject;
		 *     web.getLists().then(function(lists) {
		 *       
		 *        angular.forEach(lists, function(list) {
	     *           
	     *           console.log(list.Title + ' ' + list.EnableAttachments);
		 *        });
		 *     });
		 *
		 *   });
		 * </pre>
		 */
		SPWebObj.prototype.getLists = function() {

			var self = this;

			return SPUtils.SharePointReady().then(function() {

				var url = self.apiUrl + '/Lists';
				return SPHttp.get(url).then(function(data) {

					var lists = [];

					angular.forEach(data, function(listProperties) {
						var spList = new SPList(self, listProperties.Id, listProperties);
						lists.push(spList);
					});

					return lists;

				});

			});

		};



		/**
	     * @ngdoc function
	     * @name ngSharePoint.SPWeb#getList
	     * @methodOf ngSharePoint.SPWeb
	     *
	     * @description
	     * Retrieves an instance of the specified SharePoint list or document library from the server
	     *
	     * @param {string|GUID} name The name or the GUID of the list
	     *
         * Also, you can specify "UserInfoList" to refer to the system list with all site users.
         * 
	     * @returns {promise} promise with an {@link ngSharePoint.SPList SPList} object
	     *
		 * @example
		 * <pre>
		 *
		 *   SharePoint.getCurrentWeb(function(webObject) {
		 *
		 *     var web = webObject;
		 *     web.getList('Tasks').then(function(taskList) {
		 *       
		 *        taskList.getListItems();
		 *     });
		 *
		 *   });
		 * </pre>
		 *
		 * You can access to any list with their GUID.
		 * <pre>
		 *   
		 *    web.getList('12fa20d2-1bb8-489c-bea3-b81797ddfeaf').then(function(list) {
	     *        list.getProperties().then(function() {
		 *		     alert(list.Title);
		 *		  });
		 *    });
		 * </pre>
		 *
		*/
		SPWebObj.prototype.getList = function(listName) {

			var def = $q.defer();
			def.resolve(new SPList(this, listName));
			return def.promise;

		};



		/**
		 * @ngdoc function
		 * @name ngSharePoint.SPWeb#getRootFolder
		 * @methodOf ngSharePoint.SPWeb
		 *
		 * @description
		 * Use this method to get a reference of the web root folder.
		 *
		 * @returns {promise} promise with a {@link ngSharePoint.SPFolder SPFolder} object
		 *
		*/
		SPWebObj.prototype.getRootFolder = function() {

            var self = this,
            	rootFolder = this.RootFolder;

            if (rootFolder === void 0) {

            	var url = self.apiUrl + '/RootFolder';

            	rootFolder = SPHttp.get(url).then(function(data) {

                    self.RootFolder = new SPFolder(self, data.ServerRelativeUrl, data);
                    self.RootFolder.web = self;

                    return self.RootFolder;

            	});
            }

            return $q.when(rootFolder);

		};



		/**
	     * @ngdoc function
	     * @name ngSharePoint.SPWeb#getCurrentUser
	     * @methodOf ngSharePoint.SPWeb
	     *
	     * @description
	     * Retrieves the current user from SharePoint
	     *
	     * @returns {promise} promise with an {@link ngSharePoint.SPUser SPUser} object
	     *
		 * @example
		 * <pre>
		 *
		 * // previously initiated web object ...
		 * web.getCurrentUser().then(function(user) {
		 *   
		 *    if (user.IsSiteAdmin) {
		 *      // some stuff ... 
		 *    }
		 * });
		 * </pre>
		*/
		SPWebObj.prototype.getCurrentUser = function() {

			var def = $q.defer();
			var self = this;

			if (this.currentUser !== void 0) {

				def.resolve(this.currentUser);

			} else {

				var solveUserId;

				if (window._spPageContextInfo !== undefined) {

					solveUserId = window._spPageContextInfo.userId;

				} else {

					var url = this.apiUrl + '/currentUser';

					solveUserId = SPHttp.get(url).then(function(data) {

						return data.Id;
					});
				}

				$q.when(solveUserId).then(function(userId) {

					self.getUserById(userId).then(function(user) {
						self.currentUser = user;
						def.resolve(user);
					}, function(err) {
						def.reject(err);
					});

				});
			}

			return def.promise;
		};



		/**
	     * @ngdoc function
	     * @name ngSharePoint.SPWeb#getUserById
	     * @methodOf ngSharePoint.SPWeb
	     *
	     * @description
	     * Retrieves a specified user from SharePoint
	     *
	     * @param {int} userID User ID of the desired user to retrieve
	     * @returns {promise} promise with a {@link ngSharePoint.SPUser SPUser} object
	     *
		 * @example
		 * <pre>
		 *
		 * // previously initiated web object ...
		 * web.getUser(12).then(function(user) {
		 *   
		 *    if (user.IsSiteAdmin) {
		 *      // some stuff ... 
		 *    }
		 * });
		 * </pre>
		*/
		SPWebObj.prototype.getUserById = function(userID) {

			return new SPUser(this, userID).getProperties();
		};



		/**
	     * @ngdoc function
	     * @name ngSharePoint.SPWeb#getSiteGroups
	     * @methodOf ngSharePoint.SPWeb
	     *
	     * @description
	     * Retrieves all SharePoint site groups for the current web and returns an
	     * array of {@link ngSharePoint.SPGroup SPGroup} objects.
	     *
	     * @returns {promise} promise with an array of {@link ngSharePoint.SPGroup SPGroup} objects.
	     *
		 * @example
		 * <pre>
		 *
		 *   SharePoint.getCurrentWeb(function(webObject) {
		 *
		 *     var web = webObject;
		 *     web.getSiteGroups().then(function(groups) {
		 *       
		 *        angular.forEach(groups, function(group) {
	     *           
	     *           console.log(group.Title + ' ' + group.Description);
		 *        });
		 *     });
		 *
		 *   });
		 * </pre>
		 */
		SPWebObj.prototype.getSiteGroups = function() {

			var self = this,
				siteGroups = self.Groups;

			if (siteGroups === void 0) {

				siteGroups = SPUtils.SharePointReady().then(function() {

					var url = self.apiUrl + '/SiteGroups';
					return SPHttp.get(url).then(function(data) {

						var groups = [];

						angular.forEach(data, function(groupProperties) {
							var spGroup = new SPGroup(self, groupProperties.Id, groupProperties);
							groups.push(spGroup);
						});

						self.Groups = groups;
						return groups;

					});
				});
			}

			return $q.when(siteGroups); 


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
                spAction: '@',
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


            function allowRedirect() {

                if (attrs.noredirect !== void 0) return false;
                return spformToolbarController.allowRedirect;
            }



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

                        if (element.html() === '') {
                            element.append(Strings.STS.L_SaveButtonCaption);
                        }

                        scope.action = save;
                        redirectUrl = redirectUrl || 'default';

                        SPRibbon.ready().then(function() {

                            SPRibbon.registerCommand('Ribbon.ListForm.Edit.Commit.Publish', makeAction, true);

                        });

                        break;
                    

                    // Default cancel action
                    case 'cancel':

                        if (element.html() === '') {
                            element.append(Strings.STS.L_CancelButtonCaption);
                        }

                        scope.action = cancel;
                        redirectUrl = redirectUrl || 'default';

                        SPRibbon.ready().then(function() {

                            SPRibbon.registerCommand('Ribbon.ListForm.Edit.Commit.Cancel', makeAction, true);

                        });

                        break;


                    // Default close action
                    case 'close':

                        if (element.html() === '') {
                            element.append(Strings.STS.L_CloseButtonCaption);
                        }

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

                if (SP.UI.ModalDialog.get_childDialog()) {
                    scope.dialogResult = SP.UI.DialogResult.OK;
                }

                return scope.formCtrl.save();

            }



            // Default CANCEL form action
            function cancel() {

                if (SP.UI.ModalDialog.get_childDialog()) {
                    scope.dialogResult = SP.UI.DialogResult.cancel;
                }

                return scope.formCtrl.cancel();

            }




            // ****************************************************************************
            // Public methods
            //
            function makeAction() {

                scope.formCtrl.setFormStatus(scope.status.PROCESSING);

                var promise;

                switch(scope.spAction.toLowerCase()) {

                    case 'save':
                    case 'cancel':
                    case 'close':
                        // default functions
                        var safeActionFn = function() {
                            try {
                                return scope.action();
                            } catch(e) {
                                console.error('>>>> ngSharePoint: sp-action "' + getLabel() + '" rejected automatically due to an unhandled exception.');
                                return $q.reject(e);
                            }
                        };

                        promise = SPUtils.callFunctionWithParams(scope.action, scope);
                        break;



                    default:
                        // custom function
                        promise = SPUtils.callFunctionWithParams(scope.$parent[scope.spAction], scope.$parent);
                        break;
                }


                $q.when(promise).then(function(result) {

                    if (result !== false) {

                        //var redirectUrl = scope.redirectUrl;

                        if (redirectUrl && allowRedirect()) {

                            var item = scope.formCtrl.getItem();
                            var list = item.list;

                            // Checks for pre-defined values in the redirect url.
                            switch(redirectUrl.toLowerCase()) {

                                case 'display':

                                    list.getDefaultDisplayFormUrl().then(function(url) {

                                        // Redirects to the correct url
                                        var params = window.location.search;
                                        var idParam = 'ID=' + item.Id;

                                        if (params.indexOf(idParam) == -1) {

                                            if (params === "") {
                                                params = "?" + idParam;
                                            } else {
                                                params = "?" + idParam + '&' + params.substr(1);
                                            }

                                        }
                                        window.location = url + params;
                                        
                                    });
                            
                                    break;


                                case 'edit':

                                    list.getDefaultEditFormUrl().then(function(url) {

                                        // Redirects to the correct url
                                        var params = window.location.search;
                                        var idParam = 'ID=' + item.Id;

                                        if (params.indexOf(idParam) == -1) {

                                            if (params === "") {
                                                params = "?" + idParam;
                                            } else {
                                                params = "?" + idParam + '&' + params.substr(1);
                                            }

                                        }
                                        window.location = url + params;
                                        
                                    });

                                    break;


                                case 'new':

                                    list.getDefaultNewFormUrl().then(function(url) {

                                        // Redirects to the correct url
                                        window.location = url;
                                        
                                    });

                                    break;


                                case 'default':
                                            
                                    var dialog = SP.UI.ModalDialog.get_childDialog();

                                    if (dialog) {

                                        $timeout(function() {

                                            try {

                                                scope.dialogReturnValue = item;

                                                // NOTE: The next call will throw an error if the dialog wasn't opened with the method
                                                //       SP.UI.ModalDialog.commonModalDialogOpen(url, options, callback, args)
                                                dialog.commonModalDialogClose(scope.dialogResult, scope.dialogReturnValue);

                                            } catch(e) {

                                                dialog.close(scope.dialogResult);

                                            }

                                        });

                                    } else {

                                        var redirectPromise = utils.getQueryStringParamByName('Source');
                                        if (redirectPromise === void 0) {
                                            redirectPromise = list.getDefaultViewUrl();
                                        }

                                        $q.when(redirectPromise).then(function(redirectUrl) {

                                            // Redirects to the correct url
                                            window.location = redirectUrl;
                                        });

                                    }

                                    break;

                                default:

                                    // Redirects to the correct url
                                    window.location = redirectUrl;

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
				mode: '@'
			},
			templateUrl: 'templates/form-templates/spfield-control-loading.html',


			link: function($scope, $element, $attrs, controllers) {


				var directive = {

					fieldTypeName: 'attachments',
					replaceAll: false,

					init: function() {

						$scope.DeleteAttachmentText = STSHtmlEncode(Strings.STS.L_DeleteDocItem_Text);
						$scope.AttachFileText = Resources.core.cui_ButAttachFile;
						$scope.LanguageID = _spPageContextInfo.currentLanguage.toString();

					},

					renderFn: function(newValue, oldValue) {

						// Check if the old and new values really differ.
						if (newValue === null && oldValue === undefined) return;



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
				mode: '@'
			},
			templateUrl: 'templates/form-templates/spfield-control.html',


			link: function($scope, $element, $attrs, controllers) {


				var directive = {

					fieldTypeName: 'boolean',
					replaceAll: false,

					renderFn: function() {

						$scope.value = $scope.modelCtrl.$viewValue;
						$scope.displayValue = $scope.modelCtrl.$viewValue ? STSHtmlEncode(Strings.STS.L_SPYes) : STSHtmlEncode(Strings.STS.L_SPNo);
					},

					formatterFn: function(modelValue) {

						$scope.formCtrl.fieldValueChanged($scope.schema.InternalName, modelValue, $scope.lastValue);
						$scope.lastValue = modelValue;

                        return modelValue;
                    },

					parserFn: function(viewValue) {

						if ($scope.lastValue !== $scope.value) {
							// Calls the 'fieldValueChanged' method in the SPForm controller to broadcast to all child elements.
							$scope.formCtrl.fieldValueChanged($scope.schema.InternalName, viewValue, $scope.lastValue);
							$scope.lastValue = viewValue;
						}

						return viewValue;
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



    Minimal Schema definition and extended properties:

    FieldXXXX: {
        TypeAsString: 'Choice',
        FillInChoice: false,
        EditFormat: 0,          // 0 - DropDown, 1 - RadioButton
        Choices: {              // ListQuery apply if exists and removes current results
            ListQuery: {
                Web: '/path/to/valid/web',  // Optional (by default gets the curerent web)
                List: 'ListName',
                Field: 'Title',             // Optional (by default gets the 'Title')
                Query: {                    // Optional. All query properties of OData query operations are valid
                                            // https://msdn.microsoft.com/en-us/library/office/fp142385%28v=office.15%29.aspx
                    $orderBy: 'Title'
                }
            },
            // If you don't want to make a list query, you can specify one custom array of options
            results: ['Activity 1', 'Activity 2', 'Activity 3', '...']
        }
    }

    **NOTE**
    Query $filter value can include references to other item fields.
    This references are evaluated and used to retrieve dropDownValues.
    Example:
        $filter: "status eq 'Aprobado' and userName eq '{requiredBy.Title}'",

    Choice field watch for requiredBy changes, refresh the ListQuery sentence
    and retrieves new values.
*/



///////////////////////////////////////
//  SPFieldChoice
///////////////////////////////////////

angular.module('ngSharePoint').directive('spfieldChoice',

    ['SharePoint', 'SPFieldDirective', '$q', '$timeout',

    function spfieldChoice_DirectiveFactory(SharePoint, SPFieldDirective, $q, $timeout) {

        var spfieldChoice_DirectiveDefinitionObject = {

            restrict: 'EA',
            require: ['^spform', 'ngModel'],
            replace: true,
            scope: {
                mode: '@'
            },
            templateUrl: 'templates/form-templates/spfield-control.html',


            link: function($scope, $element, $attrs, controllers) {


                var directive = {

                    fieldTypeName: 'choice',
                    replaceAll: false,

                    init: function() {

                        if ($scope.schema.Choices.ListQuery !== undefined) {

                            $scope.choices = [];
                            if ($scope.currentMode === 'edit') {
                                getResultsFromListQuery($scope.schema.Choices.ListQuery);
                            }

                        } else {

                            $scope.choices = $scope.schema.Choices.results;
                        }

                        $scope.chooseText = STSHtmlEncode(Strings.STS.L_Choose_Text);
                        $scope.choiceFillInDisplayText = STSHtmlEncode(Strings.STS.L_ChoiceFillInDisplayText);
                        $scope.selectedOption = null;
                        $scope.dropDownValue = null;
                        $scope.fillInChoiceValue = null;
                    },

                    renderFn: function() {

                        $scope.value = $scope.modelCtrl.$viewValue;


                        if ($scope.schema.FillInChoice && $scope.choices.indexOf($scope.value) == -1) {

                            $scope.fillInChoiceValue = $scope.value;
                            $scope.selectedOption = 'FillInButton';

                        } else {

                            switch($scope.schema.EditFormat) {

                                case 0:
                                    // Dropdown
                                    if ($scope.choices !== void 0) {
                                        $scope.dropDownValue = $scope.value;
                                    }
                                    $scope.selectedOption = 'DropDownButton';
                                    break;

                                case 1:
                                    // Radio buttons
                                    $scope.selectedOption = $scope.value;
                                    break;
                            }

                        }
                    },

                    formatterFn: function(modelValue) {

						$scope.formCtrl.fieldValueChanged($scope.schema.InternalName, modelValue, $scope.lastValue);
						$scope.lastValue = modelValue;

                        return modelValue;
                    },

					parserFn: function(viewValue) {

                        var data;
                        if ($scope.items !== void 0) {
                            angular.forEach($scope.items, function(item) {
                                if (item.campo14 === viewValue) data = item;
                            });
                        }
						$scope.formCtrl.fieldValueChanged($scope.schema.InternalName, viewValue, $scope.lastValue, data);
						$scope.lastValue = viewValue;

						return viewValue;
                    }

                };


                SPFieldDirective.baseLinkFn.apply(directive, arguments);


                // ****************************************************************************
				// Check for dependences.
				//
                if ($scope.currentMode === 'edit' && $scope.schema.Choices.ListQuery !== undefined) {
                    if ($scope.schema.Choices.ListQuery.Query !== void 0) {
                        if ($scope.schema.Choices.ListQuery.Query.$filter !== void 0) {

                            $scope.schema.Choices.ListQuery.Query.originalFilter = $scope.schema.Choices.ListQuery.Query.$filter;
                            $scope.dependences = [];

                            var EXPRESSION_REGEXP = /{(\w+\W*[\w\s./\[\]\(\)]+)}(?!})/g;
                            EXPRESSION_REGEXP.lastIndex = 0;
                            var matches;

                            while ((matches = EXPRESSION_REGEXP.exec($scope.schema.Choices.ListQuery.Query.$filter))) {

                                var dependenceField, dependenceValue;

                                var match = matches[1].split('.');
                                if (match.length > 1) {
                                    dependenceField = match[0];
                                    dependenceValue = match[1];
                                } else {
                                    dependenceField = match[0];
                                    dependenceValue = undefined;
                                }

                                $scope.dependences.push({
                                    field: dependenceField,
                                    fieldValue: dependenceValue
                                });


                            }

                            angular.forEach($scope.dependences, function(dependence) {

                                $scope.$on(dependence.field + '_changed', function(evt, newValue, oldValue, params) {

                                    angular.forEach($scope.dependences, function(dependence) {

                                        if (evt.name === dependence.field + '_changed') {

                                            if (dependence.fieldValue !== undefined) {
                                                dependence.value = (params !== undefined) ? params[dependence.fieldValue] : undefined;
                                            } else {
                                                dependence.value = newValue;
                                            }
                                        }
                                    });

//                                    $scope.dropDownValue = undefined;
//                                    $scope.value = undefined;
//                                    $scope.modelCtrl.$setViewValue($scope.dropDownValue);
                                    getResultsFromListQuery($scope.schema.Choices.ListQuery);
                                });
                            });
                        }

                    }
                }


                ///////////////////////////////////////////////////////////////////////////////


                $scope.$watch('fillInChoiceValue', function(newValue, oldValue) {

                    if (newValue == oldValue || newValue === void 0 || newValue === null) return;

                    $scope.selectedOption = 'FillInButton';
                    $scope.modelCtrl.$setViewValue(newValue);

                });


                $scope.$watch('selectedOption', function(newValue, oldValue) {

                    if (newValue == oldValue) return;

                    if ($scope.selectedOption == 'FillInButton') {

                        $scope.modelCtrl.$setViewValue($scope.fillInChoiceValue);

                        var fillInChoiceElement = document.getElementById($scope.schema.InternalName + '_' + $scope.schema.Id + '_$FillInChoice');

                        if (fillInChoiceElement) {

                            fillInChoiceElement.focus();

                        }

                    } else {

                        switch($scope.schema.EditFormat) {

                            case 0:
                                // DropDown
                                $scope.value = $scope.dropDownValue;
                                $scope.modelCtrl.$setViewValue($scope.dropDownValue);
                                break;

                            case 1:
                                //Radio buttons
                                $scope.value = $scope.selectedOption;
                                $scope.modelCtrl.$setViewValue($scope.selectedOption);
                                break;

                        }
                    }

                });


                $scope.dropDownChanged = function() {

                    $scope.selectedOption = 'DropDownButton';
                    $scope.modelCtrl.$setViewValue($scope.dropDownValue);

                    if ($scope.dropDownValue === undefined) {
                        $scope.formCtrl.fieldValueChanged($scope.schema.InternalName, undefined, $scope.lastValue, undefined);
                        $scope.lastValue = $scope.value;
                    }
                    $scope.value = $scope.dropDownValue;
                };


                $scope.dropDownClick = function() {

                    $scope.selectedOption = 'DropDownButton';

                };


                $scope.fillInChoiceClick = function() {

                    $scope.selectedOption = 'FillInButton';

                };


                ///////////////////////////////////////////////////////////////////
                function getResultsFromListQuery(ListQuery) {

                    var def = $q.defer();
                    var webPromise = $scope.item.list.web;

                    if (ListQuery.Web !== undefined) {
                        webPromise = SharePoint.getWeb(ListQuery.Web);
                    }

                    $q.when(webPromise).then(function(web) {

                        web.getList(ListQuery.List).then(function(list) {

                            parseQuery(ListQuery);
                            list.getListItems(ListQuery.Query).then(function(items) {

                                $scope.items = items;
                                var choices = [];
                                $scope.dropDownValue = undefined;
                                if (!$scope.schema.Required) {
                                    choices.push(undefined);
                                }
                                angular.forEach(items, function(item) {
                                    choices.push(item[ListQuery.Field || 'Title']);
                                });

                                $timeout(function() {
                                    $scope.$apply(function() {
                                        $scope.choices = choices;
                                        $scope.dropDownValue = $scope.value;
                                    });
                                });
                            });

                        }, function(err) {

                            def.reject(err);
                        });

                    });

                    return def.promise;
                }


                function parseQuery(ListQuery) {

                    if ($scope.dependences === void 0) return ListQuery;
                    if ($scope.dependences.length === 0) return ListQuery;

                    var originalFilter = $scope.schema.Choices.ListQuery.Query.originalFilter;
                    $scope.schema.Choices.ListQuery.Query.originalFilter = originalFilter;

                    angular.forEach($scope.dependences, function(dependence) {

                        var expression = '{' + dependence.field;
                        if (dependence.fieldValue !== undefined) {
                            expression += '.' + dependence.fieldValue + '}';
                        } else {
                            expression += '}';
                        }

                        originalFilter = originalFilter.replace(expression, dependence.value);
                    });

                    $scope.schema.Choices.ListQuery.Query.$filter = originalFilter;
                    return ListQuery;
                }


            } // link


        }; // Directive definition object


        return spfieldChoice_DirectiveDefinitionObject;

    } // Directive factory

]);

/*
	SPFieldContenttypeid - directive
	
	Pau Codina (pau.codina@kaldeera.com)
	Pedro Castro (pedro.castro@kaldeera.com, pedro.cm@gmail.com)

	Copyright (c) 2014
	Licensed under the MIT License
*/



///////////////////////////////////////
//	SPFieldContenttypeid
///////////////////////////////////////

angular.module('ngSharePoint').directive('spfieldContenttypeid', 

	['SPFieldDirective', '$q', '$http', '$templateCache', '$compile', '$filter', '$location', '$window',

	function spfieldFile_DirectiveFactory(SPFieldDirective, $q, $http, $templateCache, $compile, $filter, $location, $window) {

		var spfieldFile_DirectiveDefinitionObject = {

			restrict: 'EA',
			require: ['^spform', 'ngModel'],
			replace: true,
			scope: {
				mode: '@'
			},
			templateUrl: 'templates/form-templates/spfield-control.html',


			link: function($scope, $element, $attrs, controllers) {

				var directive = {
					
					fieldTypeName: 'contenttypeid',
					replaceAll: false,

                    init: function() {

                        $scope.ContentTypes = $filter('filter')($scope.item.list.ContentTypes, function(ct) {
                        	// Not hidden or folder based content types
                        	if (ct.Hidden) return false;
                        	if (ct.StringId.substr(0,6) === '0x0120') return false;
                        	return true;
                        });
                        $scope.selectedContentType = null;
                    },

                    renderFn: function() {

                    	$scope.value = $scope.modelCtrl.$viewValue;
                    	$scope.schema.Title = $scope.item.list.Fields.ContentType.Title;

                    	var cts = $filter('filter')($scope.ContentTypes, { StringId: $scope.modelCtrl.$viewValue});
                    	if (cts.length > 0) {
                    		$scope.selectedContentType = cts[0];
                    		$scope.schema.Description = $scope.selectedContentType.Description;
                    	}
                    },
				};


				SPFieldDirective.baseLinkFn.apply(directive, arguments);

				$scope.contentTypeChanged = function() {

					if ($scope.value !== $scope.modelCtrl.$viewValue) {

                        /**
                         * If user changes the ContentType the complete
                         * form must be refreshed
                         */
                        var currentContentType = utils.getQueryStringParameter('ContentTypeId');
                        if (currentContentType === $scope.value) return;

                        if (currentContentType === undefined) {
                            $window.location.href = $window.location.href + '&ContentTypeId=' + $scope.value;
                        } else {
                            $window.location.href = $window.location.href.replace(currentContentType, $scope.value);
                        }
                    }

//					$scope.modelCtrl.$setViewValue($scope.value);
				};

			} // link

		}; // Directive definition object


		return spfieldFile_DirectiveDefinitionObject;

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
            require: '?^spform',
            replace: true,
            templateUrl: 'templates/form-templates/spfield-control.html',


            link: function($scope, $element, $attrs, spformController) {

                if (spformController === null) return;

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
                    spformController.initField(schema.EntityPropertyName).then(function() {

                        // NOTE: Include a <spfield-control name="<name_of_the_field>" mode="hidden" /> to initialize
                        //       the field with it's default value, but without showing it up in the form.
                        if ($attrs.mode == 'hidden') {
                            $element.addClass('ng-hide');
                            return;
                        }

                        // Gets the field type
                        var fieldType = schema.originalTypeAsString;
                        if (fieldType === 'UserMulti') fieldType = 'User';

                        // Gets the field name
                        var fieldName = schema.EntityPropertyName + (fieldType == 'Lookup' || fieldType == 'LookupMulti' || fieldType == 'User' || fieldType == 'UserMulti' ? 'Id' : '');

                        fieldType = schema.TypeAsString;
                        if (fieldType === 'UserMulti') fieldType = 'User';

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
                        //var validationAttributes = (angular.isDefined($attrs.required) ? ' ng-required="' + schema.Required + '"' : '');

                        var validationAttributes = '';
                        if (getFieldMode() == 'edit') {
                            validationAttributes = ' ng-required="' + schema.Required + '"';
                        }


                        // Specific field type validation attributes
                        switch(schema.TypeAsString) {

                            case 'Text':
                            case 'Note':
                                validationAttributes += ' ng-maxlength="' + schema.MaxLength + '"';
                                break;
                        }


                        // Check for 'render-as' attribute
                        if (schema.RenderAs !== undefined) {
                            fieldType = schema.RenderAs;
                        }
                        if ($attrs.renderAs) {
                            fieldType = $attrs.renderAs;
                        }


                        // Process other attributes
                        var otherAttributes = '';
                        var processedAttributes = ['name', 'mode', 'required', 'dependsOn', 'renderAs'];
                        angular.forEach($attrs.$attr, function(attr, normalizedAttr) {

                            if (processedAttributes.indexOf(normalizedAttr) == -1) {

                                otherAttributes += ' ' + attr + '="' + $attrs[normalizedAttr] + '"';

                            }

                        });


                        // Clean up the validation attributes if the field is in 'display' mode.
                        if ($attrs.mode === 'display') {

                            validationAttributes = '';

                        }


                        // Mount the field directive HTML
                        var fieldControlHTML = '<spfield-' + fieldType + ngModelAttr + nameAttr + modeAttr + dependsOnAttr + hiddenAttr + validationAttributes + otherAttributes + ' class="spfield-body-control ' + fieldType + '"></spfield-' + fieldType + '>';
                        var newElement = $compile(fieldControlHTML)($scope);

                        $element.replaceWith(newElement);
                        $element = newElement;

                    }); // initField

                } else {

                    console.error('Unknown field "' + $attrs.name + '"');

                    /*
                    var errorElement = '<span class="ms-formvalidation ms-csrformvalidation">Unknown field "' + $attrs.name + '"</span>';
                    $element.replaceWith(errorElement);
                    $element = errorElement;
                    */

                    setEmptyElement();

                }


                function getFieldMode() {

                    return $attrs.mode || spformController.getFormMode();
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
				mode: '@'
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

					formatterFn: function(modelValue) {

                        if (typeof modelValue === 'string') {
                            modelValue = parseFloat(modelValue);
							if (isNaN(modelValue)) modelValue = undefined;
                        }

						$scope.formCtrl.fieldValueChanged($scope.schema.InternalName, modelValue, $scope.lastValue);
						$scope.lastValue = modelValue;

                        return modelValue;
                    },

					parserFn: function(viewValue) {

						if ($scope.lastValue !== parseFloat(viewValue)) {
							// Calls the 'fieldValueChanged' method in the SPForm controller to broadcast to all child elements.
							$scope.formCtrl.fieldValueChanged($scope.schema.InternalName, parseFloat(viewValue), $scope.lastValue);
							$scope.lastValue = parseFloat(viewValue);
						}

						return parseFloat(viewValue);
                    }

				};


				SPFieldDirective.baseLinkFn.apply(directive, arguments);

	            $scope.modelCtrl.$validators.number = function(modelValue, viewValue) {

	            	return (viewValue === undefined) || (!isNaN(viewValue) && isFinite(viewValue));
	            };

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
//  SPFieldDateTime
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

                    parserFn: function(viewValue) {

                        // Calls the 'fieldValueChanged' method in the SPForm controller to broadcast to all child elements.
						$scope.formCtrl.fieldValueChanged($scope.schema.InternalName, viewValue, $scope.lastValue);
						$scope.lastValue = viewValue;

						return viewValue;
                    },

                    renderFn: function() {

                        getData();
                    },

                    formatterFn: function(modelValue) {

                        if (typeof modelValue === 'string') {
                            modelValue = new Date(modelValue);
                        }

                        $scope.formCtrl.fieldValueChanged($scope.schema.InternalName, modelValue, $scope.lastValue);
						$scope.lastValue = modelValue;

                        return modelValue;
                    },
/*
                    watchModeFn: function(newValue) {

                        getData().then(function() {
                            directive.renderField(newValue);
                        });
                    }
*/
                };


                SPFieldDirective.baseLinkFn.apply(directive, arguments);


                $scope.modelCtrl.$validators.date = function(modelValue, viewValue) {

                    if (viewValue === void 0) return true;
                    if (viewValue === null) return true;
                    if (typeof viewValue === 'string') {
                        viewValue = new Date(viewValue);
                    }
                    if (isNaN(viewValue.getTime())) return false;

                    return angular.isDate(viewValue);
                };




                function getData() {

                    var def = $q.defer();

                    // Gets web regional settings
                    $scope.formCtrl.getWebRegionalSettings().then(function(webRegionalSettings) {

                        $scope.webRegionalSettings = webRegionalSettings;

                        // Gets addicional properties from the Regional Settings via CSOM.
                        //
                        // NOTA: Mientras no se recuperen las RegionalSettings del usuario, se recupera
                        //       la propiedad 'direction' (rtl/ltr) de aquí.
                        //       Una vez se consigan recuperar, habrá que ver si existe este valor.
                        //
                        SPUtils.getRegionalSettings().then(function(regionalSettings) {
                            $scope.regionalSettings = regionalSettings;
                            $scope.direction = regionalSettings.get_isRightToLeft() ? 'rtl' : 'ltr';
                        });


                        // Gets current user language (LCID) from user regional settings configuration.
                        //
                        var lcidPromise = $scope.schema.lcid;
                        if (lcidPromise === undefined) {
                            lcidPromise = SPUtils.getCurrentUserLCID();
                        }
                        //SPUtils.getCurrentUserLCID().then(function(lcid) {
                        $q.when(lcidPromise).then(function(lcid) {

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
                            //    <system.web>
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
                            var TimeZoneDifference = '01:59:59.9999809';            // TODO: Recuperar o calcular.
                            var WorkWeek = '0111110';                               // TODO: Recuperar o calcular.
                            var MinJDay = '109207';                                 // TODO: Recuperar o calcular.
                            var MaxJDay = '2666269';                                // TODO: Recuperar o calcular.
                            $scope.hoursMode24 = $scope.webRegionalSettings.Time24; // TODO: Recuperar el modo de hora (12/24) de las 'RegionalSettings' del usuario.


                            $scope.idPrefix = $scope.schema.InternalName + '_'+ $scope.schema.Id;
                            $scope.minutes = minutes;
                            $scope.hours = ($scope.hoursMode24 ? hours24 : hours12);
                            $scope.datePickerPath = getDatePickerPath();
                            $scope.datePickerUrl = STSHtmlEncode($scope.datePickerPath) +
                                                   'iframe.aspx?cal=' + STSHtmlEncode(String($scope.webRegionalSettings.CalendarType)) +
                                                   '&lcid=' + STSHtmlEncode($scope.lcid) +                                  // Locale (User Regional Settings)
                                                   '&langid=' + STSHtmlEncode(_spPageContextInfo.currentLanguage) +         // Language (UI Language)
                                                   '&tz=' + STSHtmlEncode(TimeZoneDifference) +
                                                   '&ww=' + STSHtmlEncode(WorkWeek) +
                                                   '&fdow=' + STSHtmlEncode($scope.webRegionalSettings.FirstDayOfWeek) +
                                                   '&fwoy=' + STSHtmlEncode($scope.webRegionalSettings.FirstWeekOfYear) +
                                                   '&hj=' + STSHtmlEncode($scope.webRegionalSettings.AdjustHijriDays) +     // HijriAdjustment ?
                                                   '&swn=' + STSHtmlEncode($scope.webRegionalSettings.ShowWeeks) +          // ShowWeekNumber ?
                                                   '&minjday=' + STSHtmlEncode(MinJDay) +
                                                   '&maxjday=' + STSHtmlEncode(MaxJDay) +
                                                   '&date=';

                            $scope.DatePickerFrameID = g_strDatePickerFrameID;
                            $scope.DatePickerImageID = g_strDatePickerImageID;

                            // Initialize the models for data-binding.
                            var value = $scope.modelCtrl.$viewValue;

                            if (value !== null && value !== void 0) {

                                $scope.dateModel = new Date(value);
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

                    var iframe = this;
                    var picker;
                    if (iframe === null) {
                        iframe = arguments[0].srcElement;
                        picker = iframe;
                    } else {
                        picker = iframe.Picker; // IFRAME element
                    }

                    if (typeof picker !== undefined && picker !== null) {

                        var resultfunc = picker.resultfunc;

                        // Wraps the default IFRAME.resultfunc
                        picker.resultfunc = function() {

                            resultfunc();

                            // Updates the model with the selected value from the DatePicker iframe.
                            $timeout(function() {
                                $scope.$apply(function() {
                                    $scope.dateOnlyModel = picker.resultfield.value;
                                });
                            });
                        };

                    } else {

                        // Can't catch the result value from the DatetimePicker IFRAME...
                        // :(

                    }
                }



                // ****************************************************************************
                // Watch for changes in the model variables to update the field model.
                //
                $scope.$watch('[dateOnlyModel, hoursModel, minutesModel]', updateModel, true);



                // ****************************************************************************
                // Updates the field model with the correct value and format.
                //
                function updateModel(newValue, oldValue) {

                    if (newValue === oldValue || $scope.dateOnlyModel === void 0 || $scope.dateOnlyModel === null) return;

                    try {

                        if ($scope.dateOnlyModel === '') {

                            $scope.modelCtrl.$setViewValue(null);
                        } else {
                            // TODO: Hay que ajustar la fecha/hora con el TimeZone correcto.

                            var dateValues = $scope.dateOnlyModel.split($scope.cultureInfo.dateTimeFormat.DateSeparator);
                            var dateParts = $scope.cultureInfo.dateTimeFormat.ShortDatePattern.split($scope.cultureInfo.dateTimeFormat.DateSeparator);
                            var dateComponents = {};

                            for(var i = 0; i < dateParts.length; i++) {
                                dateComponents[dateParts[i]] = dateValues[i];
                            }

                            if (dateComponents.yyyy !== undefined) {
                                /**
                                  * if user enter a short year with only two digits (ex: 12/9/15)
                                  * we add the two digits of the millennium
                                  **/
                                if (dateComponents.yyyy.length == 2) {
                                    dateComponents.yyyy = new Date().getUTCFullYear().toString().substr(0,2) + dateComponents.yyyy;
                                }
                            }

                            var hours = $scope.hoursModel;
                            if (hours !== null) {
                                hours = ($scope.hoursMode24 ? hours.substr(0, hours.length - 1) : hours.substr(0, 2));
                            }
                            var minutes = $scope.minutesModel;
                            var utcDate = Date.UTC(dateComponents.yyyy, (dateComponents.MM || dateComponents.M) - 1, dateComponents.dd || dateComponents.d, hours, minutes);
                            var offset = new Date(utcDate).getTimezoneOffset() * 60 * 1000;

                            // Into the item must store a valid Date object
                            $scope.modelCtrl.$setViewValue(new Date(utcDate + offset));
                        }

                    } catch(e) {

                        $scope.modelCtrl.$setViewValue(null);
//                        $scope.value = null;
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
			require: '?^spform',
			replace: true,
			scope: {
				mode: '@'
			},
			templateUrl: 'templates/form-templates/spfield-description.html',


			link: function($scope, $element, $attrs, spformController) {

				if (spformController === null) return;
				
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
	SPFieldFile - directive
	
	Pau Codina (pau.codina@kaldeera.com)
	Pedro Castro (pedro.castro@kaldeera.com, pedro.cm@gmail.com)

	Copyright (c) 2014
	Licensed under the MIT License
*/



///////////////////////////////////////
//	SPFieldFile
///////////////////////////////////////

angular.module('ngSharePoint').directive('spfieldFile', 

	['SPFieldDirective', '$q', '$http', '$templateCache', '$compile',

	function spfieldFile_DirectiveFactory(SPFieldDirective, $q, $http, $templateCache, $compile) {

		var spfieldFile_DirectiveDefinitionObject = {

			restrict: 'EA',
			require: ['^spform', 'ngModel'],
			replace: true,
			scope: {
				mode: '@'
			},
			templateUrl: 'templates/form-templates/spfield-control.html',


			link: function($scope, $element, $attrs, controllers) {

				var directive = {
					
					fieldTypeName: 'file',
					replaceAll: false,

					watchModeFn: function(newValue) {

						if ($scope.name === 'FileLeafRef') {

							$scope.fileName = $scope.item.File.Name;
							var idx = $scope.fileName.lastIndexOf('.');
							if (idx === -1) {
								$scope.value = $scope.fileName;
								$scope.extension = '';
							} else {
								$scope.value = $scope.fileName.substr(0, $scope.fileName.lastIndexOf('.'));
								$scope.extension = $scope.fileName.substr($scope.fileName.lastIndexOf('.'));
							}

							$scope.url = $scope.item.File.ServerRelativeUrl;

							$scope.modelCtrl.$setViewValue($scope.value);

						} else {
							console.error('Unknown SPFile field');
							return;
						}

						directive.renderField();
					}
				};


				SPFieldDirective.baseLinkFn.apply(directive, arguments);

	            $scope.modelCtrl.$validators.pattern = function(modelValue, viewValue) {
	            	// ~ " # % & * : < > ? / \ { | }.
					var rg1=/^[^\\\/:\*\?"<>\|\~#&{}%]+$/; 				// forbidden characters \ / : * ? " < > |
					var rg2=/^\./; 										// cannot start with dot (.)
//					var rg3=/^(nul|prn|con|lpt[0-9]|com[0-9])(\.|$)/i; 	// forbidden file names
					var fname = modelValue || viewValue;

					return rg1.test(fname) && !rg2.test(fname); // && !rg3.test(fname);
	            };



				$scope.EditOrDownload = function($event) {

		            $event.preventDefault();

		            switch($scope.extension.ltrim('.')) {
						case 'doc':
						case 'docx':
						case 'xsl':
						case 'xslx':
						case 'ppt':
						case 'pptx':
				            editDocumentWithProgID2($scope.url, '', 'SharePoint.OpenDocuments', '0', _spPageContextInfo.siteAbsoluteUrl, '0');
				            break;

				        default:
				        	document.location = $scope.url;
		            }

		            return false;
				};

			} // link

		}; // Directive definition object


		return spfieldFile_DirectiveDefinitionObject;

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
			require: '?^spform',
			replace: true,
			scope: {
				mode: '@'
			},
			templateUrl: 'templates/form-templates/spfield-label.html',


			link: function($scope, $element, $attrs, spformController) {

				if (spformController === null) return;

				$scope.schema = spformController.getFieldSchema($attrs.name);

				// Sets the field label
				if ($attrs.label !== void 0) {

					// Custom label
					$scope.label = $attrs.label;

				} else {

					// Default label
					// If no 'label' attribute specified assigns the 'Title' property from the field schema as label.
					$scope.$watch(function() {

						return ($scope.schema ? $scope.schema.Title : '');

					}, function(newValue) {

						$scope.label = newValue;
					});
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
				mode: '@'
			},
			templateUrl: 'templates/form-templates/spfield-control-loading.html',
			

			link: function($scope, $element, $attrs, controllers) {


				var directive = {
					
					fieldTypeName: 'lookup',
					replaceAll: false,

					watchModeFn: function(newValue) {

//						refreshData();
					},

					renderFn: function() {

                        $scope.value = $scope.modelCtrl.$viewValue;

//						if (newValue === oldValue) return;

						$scope.lookupItem = void 0;
						refreshData();
					}

				};


				SPFieldDirective.baseLinkFn.apply(directive, arguments);



				// ****************************************************************************
				// Check for dependences.
				//
				if ($attrs.dependsOn !== void 0) {

					$scope.dependency = {
						fieldName: $attrs.dependsOn,
						value: $scope.item[$attrs.dependsOn]
					};

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

						var item = getItemById($scope.value);

						// Calls the 'fieldValueChanged' method in the SPForm controller to broadcast to all child elements.
						$scope.formCtrl.fieldValueChanged($scope.schema.InternalName, $scope.value, $scope.lastValue, item);

						$scope.lastValue = $scope.value;
					}
				};



				// ****************************************************************************
				// Refresh the lookup data and render the field.
				//
				function getItemById(id) {

					for(var r=0; r < $scope.lookupItems.length; r++) {
						if ($scope.lookupItems[r].Id === id) return $scope.lookupItems[r];
					}

					return undefined;

				}	// getItemById


				// ****************************************************************************
				// Refresh the lookup data and render the field.
				//
				function refreshData() {

					// If we are in display mode, there are not a extended template (that probably shows
					// additional information), and there are the FieldValuesAsHtml ... we can show
					// directly this value improving performance.
					var extendedTemplateForDisplay = false;
					if (angular.isDefined($scope.schema.extendedTemplate)) {
						if (angular.isDefined($scope.schema.extendedTemplate.display)) {
							extendedTemplateForDisplay = true;
						} else {
							if (!angular.isDefined($scope.schema.extendedTemplate.edit)) {
								extendedTemplateForDisplay = true;
							}
						}
					}

					if ($scope.currentMode === 'display' && !extendedTemplateForDisplay) {

                        var fieldName = $scope.name.replace(/_/g, '_x005f_');
						if ($scope.item.FieldValuesAsHtml !== void 0 && $scope.item.FieldValuesAsHtml[fieldName] !== void 0) {

							directive.setElementHTML($scope.item.FieldValuesAsHtml[fieldName]);
							return;
						}
					}

					// if not ... performs the default behavior

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

				}	// refreshData



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

								list.getProperties({ $expand: 'Forms,Fields' }).then(function() {

									// TODO: Add the list to the form's cache when resolved
									//SPCache.setCacheValue(<form_identifier>, $scope.schema.LookupList, $scope.lookupList);
									
									def.resolve($scope.lookupList);

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

							var $query = {
								$orderby: $scope.schema.LookupField,
								$top: 999999
							};

							if ($scope.schema.query !== void 0) {
								angular.extend($query, $scope.schema.query);
							}

							if ($scope.dependency !== void 0) {

								if ($scope.dependency.value === void 0) {
									// this lookup has dependency with another field and still has no value
									def.resolve($scope.lookupItems);
									return def.promise;
								}

								if ($query.select !== undefined) {
									$query.$select += ',';
								} else {
									$query.$select = '*,';	
								}
								$query.$select += $scope.dependency.fieldName + '/Id';

								if ($query.$expand !== undefined) {
									$query.$expand += ',';
								} else {
									$query.$expand = '';
								}
								$query.$expand += $scope.dependency.fieldName + '/Id';
								
								if ($query.$filter !== undefined) {
									$query.$filter += ' and';
								} else {
									$query.$filter = '';
								}
								$query.$filter += $scope.dependency.fieldName + '/Id eq ' + $scope.dependency.value;

								/*
								$query = {
									$select: '*, ' + $scope.dependency.fieldName + '/Id',
									$expand: $scope.dependency.fieldName + '/Id',
									$filter: $scope.dependency.fieldName + '/Id eq ' + $scope.dependency.value,
									$orderby: $scope.schema.LookupField
								};
								*/
							}

							list.getListItems($query, true).then(function(items) {

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
				mode: '@'
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


					},

                    watchModeFn: function(newValue) {
                    	// to prevent default behavior
                    },

					renderFn: function() {

						$scope.value = $scope.modelCtrl.$viewValue;

						// Adjust the model if no value is provided
						if ($scope.value === null || $scope.value === void 0) {
							$scope.value = { results: [] };
						}
						//if (newValue === oldValue) return;

						$scope.selectedLookupItems = void 0;
						refreshData();


                        // Replace standar required validator
                        $scope.modelCtrl.$validators.required = function(modelValue, viewValue) {

                            if ($scope.currentMode != 'edit') return true;
                            if (!$scope.schema.Required) return true;
                            if (viewValue && viewValue.results.length > 0) return true;

                            return false;
                        };
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

					// If we are in display mode, there are not a extended template (that probably shows
					// additional information), and there are the FieldValuesAsHtml ... we can show
					// directly this value improving performance.
					var extendedTemplateForDisplay = false;
					if (angular.isDefined($scope.schema.extendedTemplate)) {
						if (angular.isDefined($scope.schema.extendedTemplate.display)) {
							extendedTemplateForDisplay = true;
						} else {
							if (!angular.isDefined($scope.schema.extendedTemplate.edit)) {
								extendedTemplateForDisplay = true;
							}
						}
					}

					if ($scope.currentMode === 'display' && !extendedTemplateForDisplay) {

                        var fieldName = $scope.name.replace(/_/g, '_x005f_');
						if ($scope.item.FieldValuesAsHtml !== void 0 && $scope.item.FieldValuesAsHtml[fieldName] !== void 0) {

							directive.setElementHTML($scope.item.FieldValuesAsHtml[fieldName]);
							return;
						}
					}

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
					var $query = {
						$orderby: $scope.schema.LookupField,
						$top: 999999
					};

					if ($scope.schema.query !== undefined) {
						angular.extend($query, $scope.schema.query);
					}

					if ($scope.dependency !== void 0) {

						if ($query.select !== undefined) {
							$query.$select += ',';
						} else {
							$query.$select = '*,';
						}
						$query.$select += $scope.dependency.fieldName + '/Id';

						if ($query.$expand !== undefined) {
							$query.$expand += ',';
						} else {
							$query.$expand = '';
						}
						$query.$expand += $scope.dependency.fieldName + '/Id';

						if ($query.$filter !== undefined) {
							$query.$filter += ' and';
						} else {
							$query.$filter = '';
						}
						$query.$filter += $scope.dependency.fieldName + '/Id eq ' + $scope.dependency.value;


						/*
						$query = {
							$select: '*, ' + $scope.dependency.fieldName + '/Id',
							$expand: $scope.dependency.fieldName + '/Id',
							$filter: $scope.dependency.fieldName + '/Id eq ' + $scope.dependency.value,
							$orderby: $scope.schema.LookupField,
							$top: 999999
						};
						*/
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
								title: displayValue,
								item: item
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

					var results = [];

					angular.forEach($scope.resultItems, function(item) {
						results.push(item.id);
					});


					if ($scope.lastValue !== $scope.value) {

						// Calls the 'fieldValueChanged' method in the SPForm controller to broadcast to all child elements.
						$scope.formCtrl.fieldValueChanged($scope.schema.InternalName, {results: results }, $scope.lastValue, $scope.resultItems);

						$scope.lastValue = $scope.value;
					}

					$scope.value = {results: results };
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
//  SPFieldMultiChoice
///////////////////////////////////////

angular.module('ngSharePoint').directive('spfieldMultichoice',

    ['SPFieldDirective',

    function spfieldMultichoice_DirectiveFactory(SPFieldDirective) {

        var spfieldMultichoice_DirectiveDefinitionObject = {

            restrict: 'EA',
            require: ['^spform', 'ngModel'],
            replace: true,
            scope: {
                mode: '@'
            },
            templateUrl: 'templates/form-templates/spfield-control.html',


            link: function($scope, $element, $attrs, controllers) {


                var directive = {

                    fieldTypeName: 'multichoice',
                    replaceAll: false,

                    init: function() {

                        $scope.chooseText = STSHtmlEncode(Strings.STS.L_Choose_Text);
                        $scope.choiceFillInDisplayText = STSHtmlEncode(Strings.STS.L_ChoiceFillInDisplayText);
                        $scope.fillInChoiceCheckbox = false;
                        $scope.fillInChoiceValue = null;
                    },

                    renderFn: function() {

                        var value = $scope.modelCtrl.$viewValue;

                        // Adjust the model if no value is provided
                        if (value === null || value === void 0) {
                            value = { results: [] };
                        }

                        $scope.choices = [].concat(value.results);
                        // Checks if 'FillInChoice' option is enabled
                        if ($scope.schema.FillInChoice) {

                            // Checks if there is a value that don't match with the predefined schema choices.
                            // If so, will be the 'FillInChoice' value (user custom value).
                            angular.forEach($scope.choices, function(choice) {

                                if ($scope.schema.Choices.results.indexOf(choice) == -1) {

                                    $scope.fillInChoiceCheckbox = true;
                                    $scope.fillInChoiceValue = choice;

                                }

                            });
                        }

                        // Replace standar required validator
                        $scope.modelCtrl.$validators.required = function(modelValue, viewValue) {

                            if ($scope.currentMode != 'edit') return true;
                            if (!$scope.schema.Required) return true;
                            if (viewValue && viewValue.results.length > 0) return true;

                            return false;
                        };
                    },

                    formatterFn: function(modelValue) {

						$scope.formCtrl.fieldValueChanged($scope.schema.InternalName, modelValue, $scope.lastValue);
						$scope.lastValue = modelValue;

                        return modelValue;
                    },

					parserFn: function(viewValue) {

						// Calls the 'fieldValueChanged' method in the SPForm controller to broadcast to all child elements.
						$scope.formCtrl.fieldValueChanged($scope.schema.InternalName, viewValue, $scope.lastValue);
						$scope.lastValue = viewValue;

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
                // NOTE: The choices are already ordered in the schema.
                //
                function sortChoices() {

                    var sortedChoices = [];

                    angular.forEach($scope.schema.Choices.results, function(choice) {

                        if($scope.choices.indexOf(choice) != -1) {
                            sortedChoices.push(choice);
                        }

                    });


                    if ($scope.schema.FillInChoice && $scope.fillInChoiceCheckbox && $scope.fillInChoiceValue) {

                        sortedChoices.push($scope.fillInChoiceValue);

                    }

                    $scope.modelCtrl.$setViewValue({ results: sortedChoices });

                }


                $scope.$watch('fillInChoiceValue', function(newValue, oldValue) {

                    if (newValue == oldValue) return;

                    var oldValueIndex = $scope.choices.indexOf(oldValue);

                    if (oldValueIndex != -1) {

                        $scope.choices.splice(oldValueIndex, 1);

                    }

                    sortChoices();

                });


                $scope.fillInChoiceCheckboxChanged = function() {

                    if ($scope.fillInChoiceCheckbox) {

                        var fillInChoiceElement = document.getElementById($scope.schema.InternalName + '_' + $scope.schema.Id + 'FillInText');

                        if (fillInChoiceElement) {

                            fillInChoiceElement.focus();

                        }

                    }


                    sortChoices();

                };

            } // link

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
//  SPFieldNote
///////////////////////////////////////

angular.module('ngSharePoint').directive('spfieldNote',

    ['SPFieldDirective', 'SPUtils', '$q', '$timeout',

    function spfielNote_DirectiveFactory(SPFieldDirective, SPUtils, $q, $timeout) {

        var spfieldNote_DirectiveDefinitionObject = {

            restrict: 'EA',
            require: ['^spform', 'ngModel'],
            replace: true,
            scope: {
                mode: '@'
            },
            templateUrl: 'templates/form-templates/spfield-control.html',


            link: function($scope, $element, $attrs, controllers) {


                var directive = {

                    fieldTypeName: 'note',
                    replaceAll: false,

                    init: function() {

                        var xml = SPUtils.parseXmlString($scope.schema.SchemaXml);
                        $scope.rteFullHtml = xml.documentElement.getAttribute('RichTextMode') == 'FullHtml';
                        $scope.rteHelpMessage = STSHtmlEncode(Strings.STS.L_RichTextHelpLink);
                        $scope.rteLabelText = STSHtmlEncode(Strings.STS.L_RichTextHiddenLabelText);
                        $scope.cultureInfo = (typeof __cultureInfo == 'undefined' ? Sys.CultureInfo.CurrentCulture : __cultureInfo);

                        // Check if the field have the option "Append Changes to Existing Text" activated.
                        if ($scope.schema.AppendOnly) {

                            $scope.versions = [];

                            $scope.item.list.getDefaultViewUrl().then(function(defaultViewUrl) {

                                $scope.defaultViewUrl = defaultViewUrl;

                                getFieldVersions().then(function(versions) {

                                    $scope.versions = versions || [];

                                });

                            });

                        }

                    },

                    renderFn: function() {

                        $scope.value = $scope.modelCtrl.$viewValue;

                        if ($scope.rteFullHtml) {

                            $timeout(function() {

                                var rteElement = document.getElementById($scope.schema.EntityPropertyName + '_' + $scope.schema.Id + '_$TextField_inplacerte');

                                if (rteElement) {

                                    // Init the 'contenteditable' value
                                    rteElement.innerHTML = $scope.value || '';

                                }

                            });

                        }

                    },

                    formatterFn: function(modelValue) {

						$scope.formCtrl.fieldValueChanged($scope.schema.InternalName, modelValue, $scope.lastValue);
						$scope.lastValue = modelValue;

                        return modelValue;
                    },

					parserFn: function(viewValue) {

						// Calls the 'fieldValueChanged' method in the SPForm controller to broadcast to all child elements.
						$scope.formCtrl.fieldValueChanged($scope.schema.InternalName, viewValue, $scope.lastValue);
						$scope.lastValue = viewValue;

						return viewValue;
                    }

                };


                SPFieldDirective.baseLinkFn.apply(directive, arguments);



                $scope.updateModel = function($event) {

                    var rteElement = document.getElementById($scope.schema.EntityPropertyName + '_' + $scope.schema.Id + '_$TextField_inplacerte');

                    if (rteElement) {

                        $scope.modelCtrl.$setViewValue(rteElement.innerHTML);
//                        $scope.value = rteElement.innerHTML;

                    }

                };



                function getFieldVersions() {

                    var deferred = $q.defer();

                    // SharePoint Service <web_url>/_vti_bin/lists.asmx?op=GetVersionCollection
                    var soapCall = '<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">';
                    soapCall += '<soap:Body>';
                    soapCall += '<GetVersionCollection xmlns="http://schemas.microsoft.com/sharepoint/soap/">';
                    soapCall += '<strlistID>' + $scope.item.list.Id + '</strlistID>';
                    soapCall += '<strlistItemID>' + $scope.item.Id + '</strlistItemID>';
                    soapCall += '<strFieldName>' + $scope.schema.EntityPropertyName + '</strFieldName>';
                    soapCall += '</GetVersionCollection>';
                    soapCall += '</soap:Body>';
                    soapCall += '</soap:Envelope>';

                    $.ajax({
                        url: $scope.item.list.web.url.rtrim('/') + '/_vti_bin/lists.asmx',
                        type: "POST",
                        data: soapCall,
                        dataType: "xml",
                        contentType: "text/xml;charset='utf-8'",
                        complete: function(result, status) {

                            if (result.status == 200) {

                                var resultXml = SPUtils.parseXmlString(result.responseText);
                                var versionNodeCollection = resultXml.getElementsByTagName('Version');
                                var versions = [];

                                angular.forEach(versionNodeCollection, function(versionNode) {

                                    // Parse the 'Editor' attribute
                                    var editorAttribute = versionNode.getAttribute('Editor');
                                    var editor = {
                                        id: 0,
                                        name: ''
                                    };

                                    if (editorAttribute) {

                                        var editorValues = editorAttribute.split(',');

                                        if (editorValues.length > 0) {

                                            var editorData = editorValues[0].split(';#');

                                            editor.id = editorData[0];
                                            editor.name = editorData[1];

                                        }

                                    }

                                    var version = {
                                        value: versionNode.getAttribute($scope.schema.EntityPropertyName),
                                        modified: versionNode.getAttribute('Modified'),
                                        editor: editor
                                    };

                                    versions.push(version);

                                });


                                deferred.resolve(versions);

                            } else {

                                deferred.reject();

                            }

                        }

                    });


                    return deferred.promise;

                } // getFieldVersions

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
				mode: '@'
			},
			templateUrl: 'templates/form-templates/spfield-control.html',


			link: function($scope, $element, $attrs, controllers) {


				var directive = {

					fieldTypeName: 'number',
					replaceAll: false,

					init: function() {

						var xml = SPUtils.parseXmlString($scope.schema.SchemaXml);
						var percentage = xml.documentElement.getAttribute('Percentage') || $scope.schema.Percentage || 'false';
						var decimals = xml.documentElement.getAttribute('Decimals') || $scope.schema.Decimals || 'auto';
						$scope.schema.Percentage = percentage.toLowerCase() === 'true';
						$scope.schema.Decimals = parseInt(decimals);
						$scope.cultureInfo = (typeof __cultureInfo == 'undefined' ? Sys.CultureInfo.CurrentCulture : __cultureInfo);
					},

					formatterFn: function(modelValue) {

                        if (typeof modelValue === 'string') {
                            modelValue = parseFloat(modelValue);
							if (isNaN(modelValue)) modelValue = undefined;
                        }

						$scope.formCtrl.fieldValueChanged($scope.schema.InternalName, modelValue, $scope.lastValue);
						$scope.lastValue = modelValue;

                        return modelValue;
                    },

					parserFn: function(viewValue) {

						if ($scope.lastValue !== parseFloat(viewValue)) {
							// Calls the 'fieldValueChanged' method in the SPForm controller to broadcast to all child elements.
							$scope.formCtrl.fieldValueChanged($scope.schema.InternalName, parseFloat(viewValue), $scope.lastValue);
							$scope.lastValue = parseFloat(viewValue);
						}

						return parseFloat(viewValue);
                    }
				};


				SPFieldDirective.baseLinkFn.apply(directive, arguments);

	            $scope.modelCtrl.$validators.number = function(modelValue, viewValue) {

	            	return (viewValue === undefined) || (!isNaN(viewValue) && isFinite(viewValue));
	            };

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
						// var decimals = isNaN($scope.schema.Decimals) ? 2 : $scope.schema.Decimals;
						var percentageNumber = parseFloat(value / 100);
						return (isNaN(value)) ? value : percentageNumber;
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
				mode: '@'
			},
			templateUrl: 'templates/form-templates/spfield-control.html',


			link: function($scope, $element, $attrs, controllers) {


				var directive = {

					fieldTypeName: 'text',
					replaceAll: false,

                    formatterFn: function(modelValue) {

						$scope.formCtrl.fieldValueChanged($scope.schema.InternalName, modelValue, $scope.lastValue);
						$scope.lastValue = modelValue;

                        return modelValue;
                    },

					parserFn: function(viewValue) {

						// Calls the 'fieldValueChanged' method in the SPForm controller to broadcast to all child elements.
						$scope.formCtrl.fieldValueChanged($scope.schema.InternalName, viewValue, $scope.lastValue);
						$scope.lastValue = viewValue;

						return viewValue;
                    }
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
				mode: '@'
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

					renderFn: function() {

						var value = $scope.modelCtrl.$viewValue;

                        // Adjust the model if no value is provided
                        if (value === null || value === void 0) {
                            value = { Url: '', Description: '' };
                        }

                        $scope.Url = value.Url;
                        $scope.Description = value.Description;

                        // Replace standar required validator
                        $scope.modelCtrl.$validators.required = function(modelValue, viewValue) {

                            if ($scope.currentMode != 'edit') return true;
                            if (!$scope.schema.Required) return true;
                            if (viewValue) {

                            	if (viewValue.Url !== void 0 && viewValue.Url !== '') return true;
                            }

                            return false;
                        };
					},

                    formatterFn: function(modelValue) {

						$scope.formCtrl.fieldValueChanged($scope.schema.InternalName, modelValue, $scope.lastValue);
						$scope.lastValue = modelValue;

                        return modelValue;
                    },

					parserFn: function(viewValue) {

						// Calls the 'fieldValueChanged' method in the SPForm controller to broadcast to all child elements.
						$scope.formCtrl.fieldValueChanged($scope.schema.InternalName, viewValue, $scope.lastValue);
						$scope.lastValue = viewValue;

						return viewValue;
                    }
				};

				SPFieldDirective.baseLinkFn.apply(directive, arguments);

				$scope.$watch('[Url,Description]', function(newValue, oldValue) {

					if (newValue === oldValue) return;

					$scope.modelCtrl.$setViewValue({
						Url: $scope.Url,
						Description: $scope.Description
					});
				});

	            $scope.modelCtrl.$validators.url = function(modelValue, viewValue) {

	            	if (viewValue === void 0) return true;
	            	if (viewValue === null) return true;
	            	if (viewValue.Url === void 0 || viewValue.Url === '') return true;

					var validUrlRegExp = new RegExp('^http://');
					return validUrlRegExp.test(viewValue.Url);
	            };

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
//  SPFieldUser
///////////////////////////////////////

angular.module('ngSharePoint').directive('spfieldUser',

    ['SPFieldDirective', '$q', '$timeout', '$filter', 'SharePoint', 'SPUtils', '$compile',

    function spfieldUser_DirectiveFactory(SPFieldDirective, $q, $timeout, $filter, SharePoint, SPUtils, $compile) {

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
                        $scope.lastValue = oldValue;
                        refreshData();
                    },

                    postRenderFn: function(html) {

                        if ($scope.currentMode === 'edit') {
                            var peoplePickerElementId = $scope.idPrefix + '_$ClientPeoplePicker';

                            $timeout(function() {
                                initializePeoplePicker(peoplePickerElementId);

                                // Calls the 'fieldValueChanged' method in the SPForm controller to broadcast to all child elements.
                                $scope.formCtrl.fieldValueChanged($scope.schema.InternalName, $scope.value, $scope.lastValue, getEntitiesInformation($scope.selectedUserItems));
                            });
                        }
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
                // Refresh the user data and render the field.
                //
                function refreshData() {

                    // If we are in display mode, there are not a extended template (that probably shows
                    // additional information), and there are the FieldValuesAsHtml ... we can show
                    // directly this value improving performance.
                    var extendedTemplateForDisplay = false;
                    if (angular.isDefined($scope.schema.extendedTemplate)) {
                        if (angular.isDefined($scope.schema.extendedTemplate.display)) {
                            extendedTemplateForDisplay = true;
                        } else {
                            if (!angular.isDefined($scope.schema.extendedTemplate.edit)) {
                                extendedTemplateForDisplay = true;
                            }
                        }
                    }

                    if ($scope.currentMode === 'display' && !extendedTemplateForDisplay) {

                        var fieldName = $scope.name.replace(/_/g, '_x005f_');
                        if ($scope.item.FieldValuesAsHtml !== void 0 && $scope.item.FieldValuesAsHtml[fieldName] !== void 0) {

                            directive.setElementHTML($scope.item.FieldValuesAsHtml[fieldName]);
                            return;
                        }
                    }

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

                            // If no value returns an empty object for correct binding
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
                            Claim                   Gets or sets an object that represents whether an entity has the right to claim the specified values.
                            Description             Gets or sets text in a text box in the browser.
                            DisplayText             Gets or sets text in the editing control.
                            EntityData              Gets or sets a data-mapping structure that is defined by the consumer of the PickerEntity class.
                            EntityDataElements
                            EntityGroupName         Group under which this entity is filed in the picker.
                            EntityType              Gets or sets the name of the entity data type.
                            HierarchyIdentifier     Gets or sets the identifier of the current picker entity within the hierarchy provider.
                            IsResolved              Gets or sets a value that indicates whether the entity has been validated.
                            Key                     Gets or sets the identifier of a database record.
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
                                            entityPromise = SPUtils.getUserInfoByLoginName(entity.Key).then(function(userInfo) {

                                                resolvedValues.push(userInfo.Id);
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


                        // Set the focus element for the validate
                        var editorElement = document.getElementById($scope.peoplePicker.EditorElementId);

                        if (editorElement) {

                            editorElement.setAttribute('data-spfield-focus-element', 'true');
                            $compile(angular.element(editorElement))($scope);

                        }

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



                function getEntitiesInformation(entitiesArray) {

                    var info = [];
                    angular.forEach(entitiesArray, function(entity) {
                        if (entity.data !== null) {
                            info.push(entity.data);
                        }
                    });

                    if ($scope.schema.AllowMultipleValues) {
                        return info;
                    } else {
                        return (info.length > 0) ? info[0] : undefined;
                    }
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
    SPFieldValue - directive

    Pedro Castro (pedro.castro@kaldeera.com, pedro.cm@gmail.com)
    Pau Codina (pau.codina@kaldeera.com)

    Copyright (c) 2014
    Licensed under the MIT License
*/



//////////////////////////////////////////////////
//  SPFieldValue
//  Shows a item field (display mode)
//////////////////////////////////////////////////

(function() {

    'use strict';

    angular
        .module('ngSharePoint')
        .directive('spfieldValue', spfieldValue);


    spfieldValue.$inject = ['$q', 'SharePoint', '$filter'];


    /* @ngInject */
    function spfieldValue($q, SharePoint, $filter) {

        var directive = {

            restrict: 'AE',
            template: '<div ng-bind-html="fieldValue | unsafe"></div>',
            replace: true,
            scope: {
                item: '=',
                field: '='
            },
            link: postLink,

        };

        return directive;



        ///////////////////////////////////////////////////////////////////////////////



        function postLink(scope, element, attrs) {

            if (!angular.isDefined(scope.item) || !angular.isDefined(scope.field)) {

                throw 'Required "item" or "field" attributes missing in SPFieldValue directive.';

            }


            // Init the field value
            scope.fieldValue = '';


            var fieldType = scope.field.TypeAsString || scope.field.Type;
            var fieldName = scope.field.InternalName || scope.field.Name;
            fieldName = fieldName + (fieldType == 'Lookup' || fieldType == 'LookupMulti' || fieldType == 'User' || fieldType == 'UserMulti' ? 'Id' : '');
            var fieldValue = scope.item[fieldName] || '';

            if (fieldType === 'Calculated') {
                switch (scope.field.OutputType) {
                    case SP.FieldType.dateTime:
                    case 'DateTime':
                        fieldType = 'DateTime';
                        break;
                    case SP.FieldType.boolean:
                    case 'Boolean':
                        fieldType = 'Boolean';
                        break;
                    case SP.FieldType.number:
                    case 'Number':
                        fieldType = 'Number';
                        break;
                    case SP.FieldType.currency:
                    case 'Currency':
                        fieldType = 'Number';
                        break;
                    default:
                        fieldType = 'Text';
                        break;
                }
            }

            if (fieldType === 'Number') {
                fieldValue = parseFloat(fieldValue);
                if (isNaN(fieldValue)) fieldValue = undefined;
            }


            if (fieldValue !== '') {

                var cultureInfo = (typeof __cultureInfo == 'undefined' ? Sys.CultureInfo.CurrentCulture : __cultureInfo);
                switch(fieldType) {

                    case 'DateTime':
                        scope.fieldValue = '<span>' + new Date(fieldValue).format(cultureInfo.dateTimeFormat.ShortDatePattern) + '</span>';
                        break;

                    case 'MultiChoice':
                        if (fieldValue === void 0 || fieldValue === null) {
                            fieldValue = { results: [] };
                        }
                        scope.fieldValue = '<span>' + fieldValue.results.join('; ') + '</span>';
                        break;

                    case 'Boolean':
                        scope.fieldValue = '<span>' + $filter('boolean')(fieldValue) + '</span>';
                        break;

                    case 'User':
                    case 'UserMulti':
                    case 'Lookup':
                    case 'LookupMulti':

                        if (fieldValue === void 0 || fieldValue === null) {
                            fieldValue = { results: [] };
                        }

                        if (!angular.isObject(fieldValue)) {
                            fieldValue = { results: [fieldValue].filter(Boolean) };
                        }

                        getLookupValues(fieldValue.results).then(function(values) {

                            scope.fieldValue = '<span>';

                            angular.forEach(values, function(value) {

                                scope.fieldValue += '<a href="' + value.url + '" onclick="if(event.stopPropagation) event.stopPropagation();">' + value.title + '</a>, ';

                            });

                            // Remove the comma from the last element
                            scope.fieldValue = scope.fieldValue.replace(/ *, *$/, '');

                            scope.fieldValue += '</span>';

                        });

                        break;

                    case 'URL':
                        // Url
                        if (scope.field.DisplayFormat === 0) {
                            scope.fieldValue += '<a href="' + fieldValue.Url + '" target="_blank" onclick="if(event.stopPropagation) event.stopPropagation();">' + fieldValue.Description + '</a>';
                        }

                        // Image
                        if (scope.field.DisplayFormat === 1) {
                            scope.fieldValue += '<img src="' + fieldValue.Url + '" alt="' + fieldValue.Description + '" />';
                        }

                        break;

                    case 'Number':
                        var value = '';

                        if (fieldValue !== undefined) {
                            value = fieldValue.toFixed(scope.field.Decimals);
                            if (scope.field.Percentage) {
                                value = value + cultureInfo.numberFormat.PercentSymbol;
                            }
                        }

                        scope.fieldValue = '<span>' + value + '</span>';

                        break;

                    default:
                        scope.fieldValue = '<span>' + fieldValue + '</span>';
                }

            }



            function getLookupValues(values) {

                var resolvedValues = [];

                return SharePoint.getWeb(scope.field.LookupWebId).then(function(lookupWeb) {

                    return lookupWeb.getList(scope.field.LookupList).then(function(lookupList) {

                        var query = {
                            $expand: 'Fields'
                        };

                        // Expand 'Forms' property for Lookup and LookupMulti fields.
                        if (scope.field.TypeAsString == 'Lookup' || scope.field.TypeAsString == 'LookupMulti') {

                            query.$expand += ',Forms';

                        }

                        return lookupList.getProperties(query).then(function() {

                            var promises = [];

                            angular.forEach(values, function(lookupValue) {

                                var lookupPromise = lookupList.getItemById(lookupValue).then(function(lookupItem) {

                                    if (scope.field.LookupField === '') {
                                        scope.field.LookupField = 'Title';
                                    }
                                    var displayValue = lookupItem[scope.field.LookupField];
                                    var fieldSchema = lookupList.Fields[scope.field.LookupField];

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
                                        displayValue = lookupItem.Title;
                                    }


                                    // Gets the lookup url
                                    var url = '';

                                    if (scope.field.TypeAsString == 'User' || scope.field.TypeAsString == 'UserMulti') {

                                        url = lookupItem.list.web.url.rtrim('/') + '/_layouts/15/userdisp.aspx' + '?ID=' + lookupValue + '&Source=' + encodeURIComponent(window.location);

                                    } else {

                                        url = lookupItem.list.Forms.results[0].ServerRelativeUrl + '?ID=' + lookupValue + '&Source=' + encodeURIComponent(window.location);

                                    }


                                    // Set the final field value.
                                    resolvedValues.push({

                                        title: displayValue,
                                        url: url

                                    });

                                    return true;

                                });

                                promises.push(lookupPromise);

                            });


                            return $q.all(promises).then(function() {

                                return resolvedValues;

                            });

                        });

                    });

                });

            } // getLookupValues

        } // postLink

    } // Directive factory function

})();

/*
	SPFieldWorkflowStatus - directive
	
	Pau Codina (pau.codina@kaldeera.com)
	Pedro Castro (pedro.castro@kaldeera.com, pedro.cm@gmail.com)

	Copyright (c) 2014
	Licensed under the MIT License
*/



///////////////////////////////////////
//	SPFieldWorkflowStatus
///////////////////////////////////////

angular.module('ngSharePoint').directive('spfieldWorkflowstatus', 

	['SPFieldDirective', 'SPUtils',

	function spfieldWorkflowstatus_DirectiveFactory(SPFieldDirective, SPUtils) {

		var spfieldWorkflowstatus_DirectiveDefinitionObject = {

			restrict: 'EA',
			require: ['^spform', 'ngModel'],
			replace: true,
			scope: {
				mode: '@'
			},
			templateUrl: 'templates/form-templates/spfield-control.html',


			link: function($scope, $element, $attrs, controllers) {

				var directive = {
					
					fieldTypeName: 'workflowstatus',
					replaceAll: false,
					displayTemplateUrl: 'templates/form-templates/spfield-workflowstatus-display.html',
					editTemplateUrl: 'templates/form-templates/spfield-workflowstatus-display.html'

//						$scope.choices = $scope.schema.Choices.results;
				};
				
				SPFieldDirective.baseLinkFn.apply(directive, arguments);

				$scope.getWorkflowStatusDisplayValue = function() {

					if ($scope.value !== void 0 && $scope.value !== null) {
						return $scope.schema.Choices.results[$scope.value];
					} else {
						return '';
					}
				};
			}

		}; // Directive definition object


		return spfieldWorkflowstatus_DirectiveDefinitionObject;

	} // Directive factory

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

				if (spformController === null) return;
				
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

						if ($element.parent().length === 0) return;
						
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

//				if ($element.parent().length > 0) {

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
//				}
				
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
            require: '?^spform',
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


                this.allowRedirect = function() {
                    return $scope.noredirect;
                };

            },



            link: function($scope, $element, $attrs, spformController, transcludeFn) {

                if (spformController === null) return;
                
                $scope.formCtrl = spformController;
                $scope.ribbonToolbar = null;


                // ****************************************************************************
                // Watch for form mode changes.
                //
                $scope.$watch(spformController.getFormMode, function(newValue, oldValue) {

                    //if($scope.currentMode === newValue) return;

                    $scope.currentMode = newValue;
                    $scope.noredirect = ($attrs.noredirect !== void 0);
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

    ['SPUtils', '$compile', '$templateCache', '$http', '$q', '$timeout', '$injector', 'SPExpressionResolver', 'SPListItem',

    function spform_DirectiveFactory(SPUtils, $compile, $templateCache, $http, $q, $timeout, $injector, SPExpressionResolver, SPListItem) {

        var spform_DirectiveDefinitionObject = {

            restrict: 'EA',
            transclude: true,
            replace: true,
            scope: {
                item: '=item',
                mode: '=mode',
                extendedSchema: '=?',
                extendedController: '=?',
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

                this.registerField = function(fieldControl) {

                    this.formFields = this.formFields || [];
                    this.formFields.push(fieldControl);
                };

                this.unregisterField = function(fieldControl) {

                    for(var r=this.formFields.length -1; r >= 0; r--) {

                        if (this.formFields[r].name === fieldControl.name) {
                            this.formFields.splice(r, 1);
                        }
                    }
                };

                this.initField = function(fieldName) {

                    var def = $q.defer();
                    var EXPRESSION_REGEXP = /{(\w+\W*[\w\s./\[\]\(\)]+)}(?!})/g;

                    if (this.isNew()) {

                        var fieldSchema = this.getFieldSchema(fieldName);

                        SPExpressionResolver.resolve(fieldSchema.DefaultValue, $scope).then(function(solvedDefaultValue) {

                            EXPRESSION_REGEXP.lastIndex = 0;
                            if (solvedDefaultValue !== void 0 && EXPRESSION_REGEXP.test(fieldSchema.DefaultValue)) {
                                solvedDefaultValue = $scope.$eval(solvedDefaultValue);
                            }

                            // Set field default value.
                            switch(fieldSchema.TypeAsString) {

                                case 'MultiChoice':
                                    $scope.item[fieldName] = { results: [] };
                                    if (solvedDefaultValue !== null) {
                                        $scope.item[fieldName].results.push(solvedDefaultValue);
                                    }
                                    break;

                                case 'DateTime':
                                    var value;

                                    switch(solvedDefaultValue) {
                                        case '[today]':
                                            value = new Date();
                                            break;

                                        case 'undefined':
                                        case undefined:
                                        case '':
                                        case null:
                                            value = undefined;
                                            break;

                                        default:
                                            value = new Date(solvedDefaultValue);
                                            if (isNaN(value.getTime())) value = undefined;
                                            break;
                                    }


                                    $scope.item[fieldName] = value;
                                    break;

                                case 'Boolean':
                                    if (solvedDefaultValue !== null) {
                                        $scope.item[fieldName] = solvedDefaultValue == '1';
                                    }
                                    break;

                                case 'Lookup':
                                case 'User':
                                    if (solvedDefaultValue !== null) {
                                        $scope.item[fieldName + 'Id'] = parseInt(solvedDefaultValue);
                                    }
                                    break;

                                case 'Number':
                                case 'Currency':
                                    var num = parseFloat(solvedDefaultValue);
                                    if (!isNaN(num)) {
                                        $scope.item[fieldName] = num;
                                    }
                                    break;

                                default:
                                    if (solvedDefaultValue !== null && solvedDefaultValue != 'undefined') {
                                        $scope.item[fieldName] = solvedDefaultValue;
                                    }
                                    break;
                            }

                            def.resolve();

                        });

                    } else {

                        def.resolve();
                    }

                    return def.promise;
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

                        // returns the content type field or list field (workflow fields and other hand added fields to list)
                        return $scope.schema[fieldName] || $scope.item.list.Fields[fieldName] || undefined;
                    }

                };


                this.fieldValueChanged = function(fieldName, newValue, oldValue, params) {

                    if ($scope.mode === 'edit') {
                        // Propagate to child Elements/Fields
                        $scope.$broadcast(fieldName + '_changed', newValue, oldValue, params);

                        // Propagate to parent Elements/Controllers
                        if ($scope.$parent !== undefined) {
                            $scope.$parent.$emit(fieldName + '_changed', newValue, oldValue, params);
                        }
                    }
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

                        fieldFocused = this.focusElements[0];

                    }

                    // Set the focus on the final element if exists.
                    if (fieldFocused !== void 0 && fieldFocused.length > 0) {

                        fieldFocused[0].focus();

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


                    // Check the form validity
                    $scope.$broadcast('validate');

                    // Make a call to all form fields validation function
                    var validationPromises = [];

                    angular.forEach(this.formFields, function(formField) {

                        if (formField.validate !== undefined) {

                            var promise = $q.when(formField.validate());
                            validationPromises.push(promise);
                        }
                    });

                    // Check the form validity broadcasting a 'validate' event to all the fields.
                    $q.all(validationPromises).then(function() {

                        // Set the focus in the first invalid field.
                        var fieldFocused = self.setFieldFocus();

                        $scope.$broadcast('postValidate', fieldFocused);
                        $scope.$emit('postValidate', fieldFocused);


                        // Check if the form is valid after validate all the fields
                        if (!$scope.ngFormCtrl.$valid) {

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


                        // Start the 'save' process...
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


                        // Invoke 'onPreSave' function
                        $q.when(SPUtils.callFunctionWithParams($scope.onPreSave, $scope)).then(function(result) {

                            // If the 'onPreSave' function returns FALSE, cancels the save operation.
                            if (result !== false) {

                                $scope.item.save().then(function(data) {

                                    $scope.formStatus = this.status.IDLE;

                                    // Invoke 'onPostSave' function.
                                    $q.when(SPUtils.callFunctionWithParams($scope.onPostSave, $scope)).then(function(result) {

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

                    });


                    return def.promise;

                };


                this.cancel = function() {

                    var self = this;
                    var def = $q.defer();

                    // Change the form to a 'pristine' state to avoid field validation.
                    $scope.ngFormCtrl.$setPristine();

                    $scope.formStatus = this.status.PROCESSING;

                    // Invoke 'onCancel' function
                    $q.when(SPUtils.callFunctionWithParams($scope.onCancel, $scope)).then(function(result) {

                        if (result !== false) {

                            // Performs the default 'cancel' action...
                            //self.closeForm(redirectUrl);

                            // Restore the item to its 'original' value.
                            //$scope.item = angular.copy($scope.originalItem);
                            //$scope.item = new SPListItem($scope.originalItem.list, $scope.originalItem);
                            $scope.item = new SPListItem($scope.originalItem.list, angular.copy($scope.originalItem));

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

                            if ($scope.childScope !== void 0) {

                                $scope.childScope.$destroy();
                            }
                            $scope.childScope = $scope.$new();


                            loadItemInfrastructure().then(function() {
                                loadItemTemplate();
                            });

                        });



                        // Watch for item changes
                        $scope.$watch('item', function(newValue, oldValue) {

                            // Checks if the item has a value
                            if (newValue === void 0) return;

                            if ($scope.childScope !== void 0) {

                                $scope.childScope.$destroy();
                            }
                            $scope.childScope = $scope.$new();

                            // Store a copy of the original item.
                            // See 'onPreSave', 'onPostSave' and 'onCancel' callbacks in the controller's 'save' method.

                            // Using the 'angular.copy' method, the objects __proto__ are different.
                            //$scope.originalItem = angular.copy(newValue);

                            // Instead, create a 'new SPListItem(@list, @data)' that use the 'angular.extend' method.
                            // $scope.originalItem = new SPListItem($scope.item.list, $scope.item);
                            $scope.originalItem = new SPListItem($scope.item.list, angular.copy($scope.item));

                            loadItemInfrastructure().then(function() {
                                loadItemTemplate();
                            });

                        });


                        function loadItemInfrastructure() {

                            var self = this;
                            var def = $q.defer();

                            // Checks if the form is already being processed.
                            if ($scope.formStatus === spformController.status.PROCESSING) {
                                def.reject();
                                return def.promise;
                            }

                            // Ensure item has a value
                            if (!angular.isDefined($scope.item)) {
                                def.reject();
                                return def.promise;
                            }

                            // Ensure mode has a value
                            if (!angular.isDefined($scope.mode)) {

                                $scope.mode = spformController.getFormMode();

                            }

                            // Update form status
                            $scope.formStatus = spformController.status.PROCESSING;


                            // Extend the formController with the extendedController (if exists)
                            if (angular.isDefined($scope.extendedController)) {

                                utils.extend($scope, $scope.extendedController);
                            }

                            // Gets the schema (fields) of the list.
                            // Really, gets the fields of the list content type specified in the
                            // item or, if not specified, the default list content type.
                            $scope.item.list.getProperties({

                                $expand: 'Fields,ContentTypes,ContentTypes/Fields'

                            }).then(function() {

                                $scope.item.list.getFields().then(function(listFields) {

                                    $scope.item.list.getContentType($scope.item.ContentTypeId).then(function(contentType) {

                                        contentType.getFields().then(function(ctFields) {

                                            var fields = ctFields;

                                            // The 'Attachments' field belongs to the list not to the content type.
                                            // So adds it to the content type fields, if needed.
                                            if ($scope.item.list.EnableAttachments) {

                                                fields.Attachments = listFields.Attachments;

                                            }

                                            // Sets schema
                                            $scope.schema = fields;

                                            // There are dialog args ?
                                            var dialogExtendedSchema = {};

                                            var dlg = SP.UI.ModalDialog.get_childDialog();
                                            if (dlg !== null) {
                                                var args = dlg.get_args();
                                                if (args !== null && args.extendedSchema !== undefined) {

                                                    dialogExtendedSchema = args.extendedSchema;
                                                }
                                            }

                                            $scope.extendedSchema = utils.deepExtend({Fields: {}}, $scope.extendedSchema, dialogExtendedSchema);


                                            // Resolve expressions
                                            /*
                                            SPExpressionResolver.resolve(angular.toJson($scope.extendedSchema), $scope).then(function(extendedSchemaSolved) {

                                                var solvedExtendedSchema = angular.fromJson(extendedSchemaSolved);

                                                // Extend original schema with extended properties
                                                $scope.schema = utils.deepExtend({}, $scope.schema, solvedExtendedSchema.Fields);

                                                def.resolve();
                                            });
                                            */

                                            // Extend original schema with extended properties
                                            $scope.schema = utils.deepExtend($scope.item.list.Fields, $scope.schema, $scope.extendedSchema.Fields);

                                            // Set the originalTypeAsString
                                            angular.forEach($scope.schema, function(field) {
                                                field.originalTypeAsString = field.TypeAsString;
                                            });

                                            def.resolve();

                                        }); // contentType.getFields

                                    }); // lit.getContentType

                                }); // list.getFields

                            }); // list.getProperties


                            return def.promise;

                        }   // loadItemInfrastructure



                        function loadItemTemplate() {

                            // If there is a previous form (other item or other mode), how we can destroy?

                            $q.when(SPUtils.callFunctionWithParams($scope.onPreBind, $scope)).then(function(result) {

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

                                // Initialize the 'rules' array.
                                $scope.rules = [];
                                $scope.expressions = {};


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
                                    transcludeFn($scope.childScope, function(clone, newScope) {

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

                        } // loadItemTemplate



                        function compile(element) {

                            $q.when($compile(element)($scope.childScope)).then(function() {

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

                            var forceRuleParam = utils.getQueryStringParamByName('rule');
                            var forceRuleElement = '';

                            if (forceRuleParam !== undefined) {

                                forceRuleParam = parseInt(forceRuleParam);

                                for (var r=0, count=0; r < sourceElements.length; r++) {

                                    forceRuleElement = sourceElements[r];

                                    if (forceRuleElement.tagName !== void 0 && forceRuleElement.tagName.toLowerCase() === 'spform-rule') {

                                        count++;
                                        if (count === forceRuleParam) break;

                                    }
                                }

                                if (forceRuleElement !== '') {

                                    return SPExpressionResolver.resolve(forceRuleElement.outerHTML, $scope).then(function(elemResolved) {

                                        targetElement.append(angular.element(elemResolved)[0]);

                                        deferred.resolve();
                                        return deferred.promise;

                                    });

                                }

                            }

                            // Gets the element to parse.
                            var elem = sourceElements[elementIndex++];

                            // Resolve the promise when there are no more elements to parse.
                            if (elem === void 0) {

                                deferred.resolve();
                                return deferred.promise;
                            }


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

                                    var ruleName;
                                    if (elem.hasAttribute('name')) {
                                        ruleName = elem.getAttribute('name');
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
                                                        solved: true,
                                                        name: ruleName
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
                                                solved: false,
                                                name: ruleName
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


            if (scope.item !== void 0) {
    
                if (!scope.item.isNew()) {

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
	boolean - filter
	
	Pau Codina (pau.codina@kaldeera.com)
	Pedro Castro (pedro.castro@kaldeera.com, pedro.cm@gmail.com)

	Copyright (c) 2014
	Licensed under the MIT License
*/



///////////////////////////////////////
//  boolean
///////////////////////////////////////

angular.module('ngSharePoint').filter('boolean', 

    [ 

    function boolean_Filter($) {

        return function(val) {

        	return val ? STSHtmlEncode(Strings.STS.L_SPYes) : STSHtmlEncode(Strings.STS.L_SPNo);

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

/**
 * @ngdoc overview
 * @name ngSharePointFormPage

 * @description Adds 'spform' directive and bootstrap the angular application with the correct SharePoint List/Item page context.
 
 * @author Pau Codina [<pau.codina@kaldeera.com>]
 * @author Pedro Castro [<pedro.cm@gmail.com>]
 * @license Licensed under the MIT License
 * @copyright Copyright (c) 2014
 */


angular.module('ngSharePointFormPage', ['ngSharePoint', 'ngSharePoint.templates', 'oc.lazyLoad']);


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

    ['SharePoint', 'SPUtils', 'SPListItem', '$q', '$http', '$templateCache', '$compile', 'ctx', '$ocLazyLoad', '$window', 

    function(SharePoint, SPUtils, SPListItem, $q, $http, $templateCache, $compile, ctx, $ocLazyLoad, $window) {
        
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

                        list.getProperties({

                            $expand: 'Fields,ContentTypes,ContentTypes/Fields'

                        }).then(function(props) {

                            getItem(itemId).then(function(item) {

                                // Load dependencies
                                loadDependencies(item).then(function(formDefinition) {

                                    var hideRibbon = formDefinition.hideRibbon;
                                    var dlg = SP.UI.ModalDialog.get_childDialog();
                                    if (dlg !== null) {
                                        var args = dlg.get_args();
                                        if (args !== null && args.hideRibbon !== undefined) {
                                            hideRibbon = args.hideRibbon;
                                        }
                                    }

                                    if (typeof hideRibbon === 'function') {

                                        hideRibbon = hideRibbon();
                                    }

                                    if (hideRibbon === true) {

                                        var ribbon = $('#s4-ribbonrow');
                                        ribbon.next().height(ribbon.next().height() + ribbon.height());
                                        ribbon.remove();
                                    }

                                    if (formDefinition.formModesOverride) {

                                        $scope.mode = formDefinition.formModesOverride[controlMode] || currentMode;

                                        // If no valid override mode specified, sets the mode back to its default value.
                                        if ($scope.mode !== 'display' && $scope.mode !== 'edit') {

                                            $scope.mode = currentMode;

                                        }

                                    }


                                    // Try to get the template
                                    getTemplateUrl().then(function(templateUrl) {

                                        var spformHTML = '';

                                        $scope.extendedSchema = formDefinition.extendedSchema || {};
                                        $scope.controller = formDefinition.controller || {};

                                        spformHTML = '<div data-spform="true" name="spform" mode="mode" item="item" extended-schema="extendedSchema" extended-controller="controller" template-url="' + templateUrl + '"></div>';

                                        var newElement = $compile(spformHTML)($scope);
                                        $element.replaceWith(newElement);
                                        $element = newElement;

                                        // Sets the item
                                        $scope.item = item;

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



                // This method returns the item to edit. If ClientControlMode is New
                // returns a new Item object inititalized with the specified ContentTypeId
                // Otherwise, the method retrieves the item from de server.
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

                        $scope.list.getItemById(itemId, 'FieldValuesAsHtml').then(function(item) {

                            var ct = utils.getQueryStringParamByName('ContentTypeId');
                            if (ct !== undefined) item.ContentTypeId = ct;

                            deferred.resolve(item);

                        }, function(err) {

                            console.log('Error item', err);

                        });
                        
                    }

                    return deferred.promise;

                } // getItem



                // This gets the template from the server based on the list, the content type and the
                // form controlMode.
                function getTemplateUrl() {

                    var deferred = $q.defer();

                    var templateUrl;
                    var mode = (controlMode == 'new' ? controlMode : $scope.mode);

                    if (formDefinition.templates !== void 0) {
                        templateUrl = formDefinition.templates[mode];
                    }

                    if (templateUrl === void 0) {
                        templateUrl = $scope.web.url.rtrim('/') + '/ngSharePointFormTemplates/' + $scope.list.Title + '-' + ctx.ListData.Items[0].ContentType + '-' + mode + 'Form.html';
                    }


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

                            // Process AngularJS modules dependencies.
                            angular.forEach(formDefinition.angularModules, function(module) {

                                dependencies.push(replaceWebRelativeUrls(module));

                            });

                            // Process JavaScript dependencies (Non AngularJS scripts).
                            angular.forEach(formDefinition.jsIncludes, function(js) {

                                dependencies.push(replaceWebRelativeUrls(js));

                            });


                            // Process CSS dependencies.
                            angular.forEach(formDefinition.cssIncludes, function(css) {

                                dependencies.push(replaceWebRelativeUrls(css));

                            });


                            // Process other.
                            // ...


                            $ocLazyLoad.load(dependencies).then(function() {

                                deferred.resolve(formDefinition);

                            }, function(err) {

                                deferred.reject(err);
                            });

                        } else {

                            deferred.resolve({});
                            
                        }

                    });


                    return deferred.promise;

                } // loadDependencies


                function replaceWebRelativeUrls(module) {

                    if (module === void 0) return module;

                    if (module.files) {

                        if (angular.isArray(module.files)) {

                            for(var r=0; r < module.files.length; r++) {

                                module.files[r] = module.files[r].replace(/~site/g, $scope.web.url.rtrim('/'));
                            }

                        } else if (angular.isString(module.files)) {

                            module.files = module.files.replace(/~site/g, $scope.web.url.rtrim('/'));
                        }
                    }

                    return module;
                }

            }

        };

    }

]);


