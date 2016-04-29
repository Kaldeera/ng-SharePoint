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
