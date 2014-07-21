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

	['$compile', '$templateCache', '$http', '$filter', 'SPUtils',

	function($compile, $templateCache, $http, $filter, SPUtils) {

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
				SPUtils.getRegionalSettings().then(function(regionalSettings) {
					$scope.regionalSettings = regionalSettings;
					$scope.direction = regionalSettings.get_isRightToLeft() ? 'rtl' : 'ltr';
				});


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
									   '&lcid=' + STSHtmlEncode(SP.Res.lcid) +
									   '&langid=' + STSHtmlEncode(_spPageContextInfo.currentLanguage) + 
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
				$scope.dateOnlyModel = $filter('date')($scope.dateModel, 'shortDate'); // TODO: Formatear la fecha en el LCID correcto.
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
						$scope.$apply(function() {
							$scope.dateOnlyModel = self.resultfield.value;
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

					var dateValue = new Date($scope.dateOnlyModel);
					var hours = $scope.hoursModel;
					var minutes = $scope.minutesModel;

					hours = ($scope.hoursMode24 ? hours.substr(0, hours.length - 1) : hours.substr(0, 2));

					dateValue.setHours(hours);
					dateValue.setMinutes(minutes);

					$scope.value = dateValue.toISOString();

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