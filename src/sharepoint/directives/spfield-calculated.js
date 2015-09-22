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
