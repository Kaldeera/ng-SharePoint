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