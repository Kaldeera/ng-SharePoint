//<![CDATA[
var _spFormDigestRefreshInterval = 1440000;
var _fV4UI = true;

function _RegisterWebPartPageCUI() {
	var initInfo = {
		editable: true,
		isEditMode: false,
		allowWebPartAdder: false
	};
	SP.Ribbon.WebPartComponent.registerWithPageManager(initInfo);
	var wpcomp = SP.Ribbon.WebPartComponent.get_instance();
	var hid;
	hid = document.getElementById("_wpSelected");
	if (hid != null) {
		var wpid = hid.value;
		if (wpid.length > 0) {
			var zc = document.getElementById(wpid);
			if (zc != null)
				wpcomp.selectWebPart(zc, false);
		}
	}
	hid = document.getElementById("_wzSelected");
	if (hid != null) {
		var wzid = hid.value;
		if (wzid.length > 0) {
			wpcomp.selectWebPartZone(null, wzid);
		}
	}
};

function __RegisterWebPartPageCUI() {
	ExecuteOrDelayUntilScriptLoaded(_RegisterWebPartPageCUI, "sp.ribbon.js");
}
_spBodyOnLoadFunctionNames.push("__RegisterWebPartPageCUI");
var __wpmExportWarning = 'Este elemento Web se ha personalizado. En consecuencia, una o más propiedades del elemento Web podrían contener información confidencial. Asegúrese de que las propiedades contienen información segura para que otros la lean. Después de expandir este elemento Web, vea las propiedades en el archivo de descripción del elemento Web (.WebPart) utilizando un editor de texto como Microsoft Notepad.';
var __wpmCloseProviderWarning = 'Está a punto de cerrar este elemento Web. Actualmente está proporcionando datos a otros elementos Web y estas conexiones se eliminará si se cierra este elemento Web. Para cerrar el elemento Web, haga clic en Aceptar. Para conservarlo, haga clic en Cancelar.';
var __wpmDeleteWarning = 'Está a punto de eliminar de manera definitiva este elemento Web. ¿Confirma que desea hacerlo? Para eliminar este elemento Web, haga clic en Aceptar. Para conservarlo, haga clic en Cancelar.';
var topBar = document.getElementById("listFormToolBarTop");
if (topBar != null)
	topBar.style.display = "none";
if (typeof(_v_rg_spbutton) == 'undefined')
	var _v_rg_spbutton = new Array();
_v_rg_spbutton['Ribbon.ListForm.Edit.Actions.AttachFile'] = 'ctl00_ctl28_g_ba9f6e2a_381a_4eeb_8d37_4d5b28b8f15a_ctl00_ctl01_ctl00_toolBarTbl_RptControls_diidIOAttach';
if (typeof(_v_rg_spbutton) == 'undefined')
	var _v_rg_spbutton = new Array();
_v_rg_spbutton['Ribbon.ListForm.Display.Manage.DeleteItem'] = 'ctl00_ctl28_g_ba9f6e2a_381a_4eeb_8d37_4d5b28b8f15a_ctl00_ctl01_ctl00_toolBarTbl_RptControls_diidIODeleteItem';
var WPQ2FormCtx = {
	"ListData": {
		"owshiddenversion": 109,
		"ContentType": "Issue",
		"Title": "Test",
		"MyChoice": ";#Enter Choice #2;#",
		"MyMultiChoiceWithoutDefaultValue": ";#one;#two;#three;#four;#seven;#ten;#",
		"MySingleChoice": "Escriba la opci\u00f3n n\u00ba 2",
		"MyDateTime": "07/03/2016 0:0",
		"MyNumber": "18,0",
		"MyNumberPercentage": "33,00",
		"MyCurrency": "150",
		"MyLookup": "1;#Tarea 1",
		"MyLookupRequired": "1;#Rubiks_Cube_Solution_book_LOW_RES",
		"AssignedTo": [{
			"Claim": {
				"ClaimType": "http://schemas.microsoft.com/sharepoint/2009/08/claims/userlogonname",
				"Value": "sp2013-01\\pcasme",
				"ValueType": "http://www.w3.org/2001/XMLSchema#string",
				"OriginalIssuer": "Windows"
			},
			"Key": "i:0#.w|sp2013-01\\pcasme",
			"DisplayText": "SP2013-01\\pcasme",
			"IsResolved": true,
			"Description": "i:0#.w|sp2013-01\\pcasme",
			"EntityType": "",
			"EntityGroupName": "",
			"HierarchyIdentifier": null,
			"EntityData": {
				"SPUserID": "7",
				"AccountName": "i:0#.w|sp2013-01\\pcasme",
				"PrincipalType": "User"
			},
			"EntityDataElements": [{
				"First": "SPUserID",
				"Second": "7"
			}, {
				"First": "AccountName",
				"Second": "i:0#.w|sp2013-01\\pcasme"
			}, {
				"First": "PrincipalType",
				"Second": "User"
			}],
			"MultipleMatches": [],
			"ProviderName": "",
			"ProviderDisplayName": ""
		}],
		"MyUser": [{
			"Claim": {
				"ClaimType": "http://schemas.microsoft.com/sharepoint/2009/08/claims/userlogonname",
				"Value": "sp2013-01\\joan",
				"ValueType": "http://www.w3.org/2001/XMLSchema#string",
				"OriginalIssuer": "Windows"
			},
			"Key": "i:0#.w|sp2013-01\\joan",
			"DisplayText": "SP2013-01\\joan",
			"IsResolved": true,
			"Description": "i:0#.w|sp2013-01\\joan",
			"EntityType": "",
			"EntityGroupName": "",
			"HierarchyIdentifier": null,
			"EntityData": {
				"SPUserID": "9",
				"AccountName": "i:0#.w|sp2013-01\\joan",
				"PrincipalType": "User"
			},
			"EntityDataElements": [{
				"First": "SPUserID",
				"Second": "9"
			}, {
				"First": "AccountName",
				"Second": "i:0#.w|sp2013-01\\joan"
			}, {
				"First": "PrincipalType",
				"Second": "User"
			}],
			"MultipleMatches": [],
			"ProviderName": "",
			"ProviderDisplayName": ""
		}],
		"MyUserMulti": [{
			"Claim": {
				"ClaimType": "http://schemas.microsoft.com/sharepoint/2009/08/claims/userlogonname",
				"Value": "sp2013-01\\pcasme",
				"ValueType": "http://www.w3.org/2001/XMLSchema#string",
				"OriginalIssuer": "Windows"
			},
			"Key": "i:0#.w|sp2013-01\\pcasme",
			"DisplayText": "SP2013-01\\pcasme",
			"IsResolved": true,
			"Description": "i:0#.w|sp2013-01\\pcasme",
			"EntityType": "",
			"EntityGroupName": "",
			"HierarchyIdentifier": null,
			"EntityData": {
				"SPUserID": "7",
				"AccountName": "i:0#.w|sp2013-01\\pcasme",
				"PrincipalType": "User"
			},
			"EntityDataElements": [{
				"First": "SPUserID",
				"Second": "7"
			}, {
				"First": "AccountName",
				"Second": "i:0#.w|sp2013-01\\pcasme"
			}, {
				"First": "PrincipalType",
				"Second": "User"
			}],
			"MultipleMatches": [],
			"ProviderName": "",
			"ProviderDisplayName": ""
		}, {
			"Claim": {
				"ClaimType": "http://schemas.microsoft.com/sharepoint/2009/08/claims/userlogonname",
				"Value": "sp2013-01\\joan",
				"ValueType": "http://www.w3.org/2001/XMLSchema#string",
				"OriginalIssuer": "Windows"
			},
			"Key": "i:0#.w|sp2013-01\\joan",
			"DisplayText": "SP2013-01\\joan",
			"IsResolved": true,
			"Description": "i:0#.w|sp2013-01\\joan",
			"EntityType": "",
			"EntityGroupName": "",
			"HierarchyIdentifier": null,
			"EntityData": {
				"SPUserID": "9",
				"AccountName": "i:0#.w|sp2013-01\\joan",
				"PrincipalType": "User"
			},
			"EntityDataElements": [{
				"First": "SPUserID",
				"Second": "9"
			}, {
				"First": "AccountName",
				"Second": "i:0#.w|sp2013-01\\joan"
			}, {
				"First": "PrincipalType",
				"Second": "User"
			}],
			"MultipleMatches": [],
			"ProviderName": "",
			"ProviderDisplayName": ""
		}, {
			"Claim": {
				"ClaimType": "http://schemas.microsoft.com/sharepoint/2009/08/claims/userlogonname",
				"Value": "sp2013-01\\pau",
				"ValueType": "http://www.w3.org/2001/XMLSchema#string",
				"OriginalIssuer": "Windows"
			},
			"Key": "i:0#.w|sp2013-01\\pau",
			"DisplayText": "SP2013-01\\pau",
			"IsResolved": true,
			"Description": "i:0#.w|sp2013-01\\pau",
			"EntityType": "",
			"EntityGroupName": "",
			"HierarchyIdentifier": null,
			"EntityData": {
				"SPUserID": "8",
				"AccountName": "i:0#.w|sp2013-01\\pau",
				"PrincipalType": "User"
			},
			"EntityDataElements": [{
				"First": "SPUserID",
				"Second": "8"
			}, {
				"First": "AccountName",
				"Second": "i:0#.w|sp2013-01\\pau"
			}, {
				"First": "PrincipalType",
				"Second": "User"
			}],
			"MultipleMatches": [],
			"ProviderName": "",
			"ProviderDisplayName": ""
		}],
		"MyYesNo": "0",
		"DueDate": "25/10/2015 2:5",
		"Status": "Resuelto",
		"Priority": "(3) Baja",
		"Comment": "Lorem ipsum...",
		"Category": "(3) Categor\u00eda 3",
		"RelatedIssues": "57;#asd asd asd;#60;#aaaaaaa;#54;#Test",
		"V3Comments": "",
		"Text_x0020_column_x0020_1": "M\u00e1x. 10 ca",
		"Text_x0020_column_x0020_3": "Valor por defecto de C3",
		"Note_x0020_column": "Note column test",
		"Attachments": "",
		"Created": "15/07/2014 19:10",
		"Author": "1;#0#.w|sp2013-01\\administrador,#i:0#.w|sp2013-01\\administrador,#alguien@example.com,#alguien@example.com,#0#.w|sp2013-01\\administrador",
		"Modified": "25/07/2014 8:43",
		"Editor": "1;#0#.w|sp2013-01\\administrador,#i:0#.w|sp2013-01\\administrador,#alguien@example.com,#alguien@example.com,#0#.w|sp2013-01\\administrador"
	},
	"ListSchema": {
		"Title": {
			"Id": "fa564e0f-0c70-4ab9-b863-0177e6ddd247",
			"Title": "Title",
			"Hidden": false,
			"IMEMode": null,
			"Name": "Title",
			"Required": true,
			"Direction": "none",
			"FieldType": "Text",
			"Description": "Esta es la descripci\u00f3n del campo \u0027Title\u0027.",
			"ReadOnlyField": false,
			"Type": "Text",
			"MaxLength": 255
		},
		"MyChoice": {
			"Id": "265d0453-7689-4173-ba60-7c9f45b238cd",
			"Title": "MyChoice",
			"Hidden": false,
			"IMEMode": null,
			"Name": "MyChoice",
			"Required": false,
			"Direction": "none",
			"FieldType": "MultiChoice",
			"Description": "",
			"ReadOnlyField": false,
			"Type": "MultiChoice",
			"FillInChoice": false,
			"MultiChoices": ["Enter Choice #1", "Enter Choice #2", "Enter Choice #3"]
		},
		"MyMultiChoiceWithoutDefaultValue": {
			"Id": "8fe65d55-8f8c-4d58-946a-48ab82648e11",
			"Title": "MyMultiChoiceWithoutDefaultValue",
			"Hidden": false,
			"IMEMode": null,
			"Name": "MyMultiChoiceWithoutDefaultValue",
			"Required": false,
			"Direction": "none",
			"FieldType": "MultiChoice",
			"Description": "",
			"ReadOnlyField": false,
			"Type": "MultiChoice",
			"FillInChoice": false,
			"MultiChoices": ["one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten"]
		},
		"MySingleChoice": {
			"Id": "24a66e6e-e855-4dc1-a473-401aa41a53d5",
			"Title": "MySingleChoice",
			"Hidden": false,
			"IMEMode": null,
			"Name": "MySingleChoice",
			"Required": false,
			"Direction": "none",
			"FieldType": "Choice",
			"Description": "",
			"ReadOnlyField": false,
			"Type": "Choice",
			"FillInChoice": true,
			"MultiChoices": ["Escriba la opci\u00f3n n\u00ba 1", "Escriba la opci\u00f3n n\u00ba 2", "Escriba la opci\u00f3n n\u00ba 3"],
			"Choices": ["Escriba la opci\u00f3n n\u00ba 1", "Escriba la opci\u00f3n n\u00ba 2", "Escriba la opci\u00f3n n\u00ba 3"],
			"FormatType": 0
		},
		"MyDateTime": {
			"Id": "35e3ed27-3d17-454f-bfaf-6d9a5f53f2be",
			"Title": "MyDateTime",
			"Hidden": false,
			"IMEMode": null,
			"Name": "MyDateTime",
			"Required": false,
			"Direction": "none",
			"FieldType": "DateTime",
			"Description": "",
			"ReadOnlyField": false,
			"Type": "DateTime",
			"DisplayFormat": 0,
			"CalendarType": 1,
			"ShowWeekNumber": false,
			"TimeSeparator": ":",
			"TimeZoneDifference": "01:59:59.9993776",
			"FirstDayOfWeek": 1,
			"FirstWeekOfYear": 0,
			"HijriAdjustment": 0,
			"WorkWeek": "0111110",
			"LocaleId": "3082",
			"LanguageId": "1033",
			"MinJDay": 109207,
			"MaxJDay": 2666269
		},
		"MyNumber": {
			"Id": "10dc3eac-f874-4586-aab4-c0835126c3a5",
			"Title": "MyNumber",
			"Hidden": false,
			"IMEMode": "inactive",
			"Name": "MyNumber",
			"Required": false,
			"Direction": "none",
			"FieldType": "Number",
			"Description": "",
			"ReadOnlyField": false,
			"Type": "Number",
			"ShowAsPercentage": false
		},
		"MyNumberPercentage": {
			"Id": "58ffc98c-424a-4782-9b9f-a1879034c15e",
			"Title": "MyNumberPercentage",
			"Hidden": false,
			"IMEMode": "inactive",
			"Name": "MyNumberPercentage",
			"Required": false,
			"Direction": "none",
			"FieldType": "Number",
			"Description": "",
			"ReadOnlyField": false,
			"Type": "Number",
			"ShowAsPercentage": true
		},
		"MyCurrency": {
			"Id": "a6890dce-43ec-4119-83d5-4edd87e3f28b",
			"Title": "MyCurrency",
			"Hidden": false,
			"IMEMode": "inactive",
			"Name": "MyCurrency",
			"Required": false,
			"Direction": "none",
			"FieldType": "Currency",
			"Description": "",
			"ReadOnlyField": false,
			"Type": "Currency",
			"ShowAsPercentage": false
		},
		"MyLookup": {
			"Id": "201d37aa-163b-4b53-8e50-b8bf25ebf012",
			"Title": "MyLookup",
			"Hidden": false,
			"IMEMode": null,
			"Name": "MyLookup",
			"Required": false,
			"Direction": "none",
			"FieldType": "Lookup",
			"Description": "La descripci\u00f3n del lookup",
			"ReadOnlyField": false,
			"Type": "Lookup",
			"DependentLookup": false,
			"AllowMultipleValues": false,
			"BaseDisplayFormUrl": "http://sp2013-01/_layouts/15/listform.aspx?PageType=4",
			"Throttled": false,
			"LookupListId": "7c43300a-ad8f-4629-8b82-96b806f4a3b7",
			"ChoiceCount": 4,
			"Choices": [{
				"LookupId": 1,
				"LookupValue": "Tarea 1"
			}, {
				"LookupId": 2,
				"LookupValue": "Tarea 2"
			}, {
				"LookupId": 4,
				"LookupValue": "Tarea 3"
			}, {
				"LookupId": 3,
				"LookupValue": "Tarea 4"
			}]
		},
		"MyLookupRequired": {
			"Id": "1063b436-c890-445c-b499-89cacedd63a0",
			"Title": "MyLookupRequired",
			"Hidden": false,
			"IMEMode": null,
			"Name": "MyLookupRequired",
			"Required": true,
			"Direction": "none",
			"FieldType": "Lookup",
			"Description": "",
			"ReadOnlyField": false,
			"Type": "Lookup",
			"DependentLookup": false,
			"AllowMultipleValues": false,
			"BaseDisplayFormUrl": "http://sp2013-01/_layouts/15/listform.aspx?PageType=4",
			"Throttled": false,
			"LookupListId": "2e537a03-728b-4d43-b3d3-b603c35ec559",
			"ChoiceCount": 3,
			"Choices": [{
				"LookupId": 1,
				"LookupValue": "Rubiks_Cube_Solution_book_LOW_RES"
			}, {
				"LookupId": 3,
				"LookupValue": "Shortest Path Problem with Pixel Level"
			}, {
				"LookupId": 2,
				"LookupValue": "THE-FUTURE-OF-CSS"
			}]
		},
		"AssignedTo": {
			"Id": "53101f38-dd2e-458c-b245-0c236cc13d1a",
			"Title": "Assigned To",
			"Hidden": false,
			"IMEMode": null,
			"Name": "AssignedTo",
			"Required": false,
			"Direction": "none",
			"FieldType": "User",
			"Description": "SPFieldUser\r\n------------------------------------------------\r\nAllow multiple selections: No\r\nAllow selection of: People and Groups\r\nChoose from: All Users\r\nShow field: Name (with presence) - ImnName",
			"ReadOnlyField": false,
			"Type": "User",
			"DependentLookup": false,
			"AllowMultipleValues": false,
			"Presence": true,
			"WithPicture": false,
			"DefaultRender": true,
			"WithPictureDetail": false,
			"ListFormUrl": "/_layouts/15/listform.aspx",
			"UserDisplayUrl": "/_layouts/15/userdisp.aspx",
			"EntitySeparator": ";",
			"PictureOnly": false,
			"PictureSize": null,
			"UserInfoListId": "{a12cca6c-a92e-495a-80ce-66f110b74735}",
			"SharePointGroupID": 0,
			"PrincipalAccountType": "User,SecGroup,SPGroup",
			"SearchPrincipalSource": 15,
			"ResolvePrincipalSource": 15
		},
		"MyUser": {
			"Id": "a93b4740-d410-40b1-a5df-9a9f0ba6f7ef",
			"Title": "MyUser",
			"Hidden": false,
			"IMEMode": null,
			"Name": "MyUser",
			"Required": false,
			"Direction": "none",
			"FieldType": "User",
			"Description": "SPFieldUser \r\n------------------------------------------------ \r\nAllow multiple selections: No \r\nAllow selection of: People Only \r\nChoose from: Integrantes Inicio \r\nShow field: Account",
			"ReadOnlyField": false,
			"Type": "User",
			"DependentLookup": false,
			"AllowMultipleValues": false,
			"Presence": true,
			"WithPicture": false,
			"DefaultRender": false,
			"WithPictureDetail": false,
			"ListFormUrl": "/_layouts/15/listform.aspx",
			"UserDisplayUrl": "/_layouts/15/userdisp.aspx",
			"EntitySeparator": ";",
			"PictureOnly": false,
			"PictureSize": null,
			"SharePointGroupID": 6,
			"PrincipalAccountType": "User",
			"SearchPrincipalSource": 15,
			"ResolvePrincipalSource": 15
		},
		"MyUserMulti": {
			"Id": "149e3f87-ccfc-431e-975e-6f4692da3d85",
			"Title": "MyUserMulti",
			"Hidden": false,
			"IMEMode": null,
			"Name": "MyUserMulti",
			"Required": false,
			"Direction": "none",
			"FieldType": "UserMulti",
			"Description": "SPFieldUser\r\n------------------------------------------------\r\nAllow multiple selections: Yes\r\nAllow selection of: People and Groups\r\nChoose from: All Users\r\nShow field: Name",
			"ReadOnlyField": false,
			"Type": "User",
			"DependentLookup": false,
			"AllowMultipleValues": true,
			"Presence": true,
			"WithPicture": false,
			"DefaultRender": false,
			"WithPictureDetail": false,
			"ListFormUrl": "/_layouts/15/listform.aspx",
			"UserDisplayUrl": "/_layouts/15/userdisp.aspx",
			"EntitySeparator": ";",
			"PictureOnly": false,
			"PictureSize": null,
			"SharePointGroupID": 0,
			"PrincipalAccountType": "User,SecGroup,SPGroup",
			"SearchPrincipalSource": 15,
			"ResolvePrincipalSource": 15
		},
		"MyYesNo": {
			"Id": "359129b2-9cca-4ed2-9974-b8e202898170",
			"Title": "MyYesNo",
			"Hidden": false,
			"IMEMode": null,
			"Name": "MyYesNo",
			"Required": false,
			"Direction": "none",
			"FieldType": "Boolean",
			"Description": "",
			"ReadOnlyField": false,
			"Type": "Boolean"
		},
		"DueDate": {
			"Id": "cd21b4c2-6841-4f9e-a23a-738a65f99889",
			"Title": "Due Date",
			"Hidden": false,
			"IMEMode": null,
			"Name": "DueDate",
			"Required": false,
			"Direction": "none",
			"FieldType": "DateTime",
			"Description": "",
			"ReadOnlyField": false,
			"Type": "DateTime",
			"DisplayFormat": 1,
			"CalendarType": 1,
			"ShowWeekNumber": false,
			"TimeSeparator": ":",
			"TimeZoneDifference": "01:59:59.9991774",
			"FirstDayOfWeek": 1,
			"FirstWeekOfYear": 0,
			"HijriAdjustment": 0,
			"WorkWeek": "0111110",
			"LocaleId": "3082",
			"LanguageId": "1033",
			"MinJDay": 109207,
			"MaxJDay": 2666269,
			"HoursMode24": true,
			"HoursOptions": ["00:", "01:", "02:", "03:", "04:", "05:", "06:", "07:", "08:", "09:", "10:", "11:", "12:", "13:", "14:", "15:", "16:", "17:", "18:", "19:", "20:", "21:", "22:", "23:"]
		},
		"Status": {
			"Id": "3f277a5c-c7ae-4bbe-9d44-0456fb548f94",
			"Title": "Issue Status",
			"Hidden": false,
			"IMEMode": null,
			"Name": "Status",
			"Required": false,
			"Direction": "none",
			"FieldType": "Choice",
			"Description": "",
			"ReadOnlyField": false,
			"Type": "Choice",
			"FillInChoice": false,
			"MultiChoices": ["Activo", "Resuelto", "Cerrado"],
			"Choices": ["Activo", "Resuelto", "Cerrado"],
			"FormatType": 0
		},
		"Priority": {
			"Id": "a8eb573e-9e11-481a-a8c9-1104a54b2fbd",
			"Title": "Priority",
			"Hidden": false,
			"IMEMode": null,
			"Name": "Priority",
			"Required": false,
			"Direction": "none",
			"FieldType": "Choice",
			"Description": "",
			"ReadOnlyField": false,
			"Type": "Choice",
			"FillInChoice": false,
			"MultiChoices": ["(1) Alta", "(2) Normal", "(3) Baja"],
			"Choices": ["(1) Alta", "(2) Normal", "(3) Baja"],
			"FormatType": 0
		},
		"Comment": {
			"Id": "6df9bd52-550e-4a30-bc31-a4366832a87f",
			"Title": "Description",
			"Hidden": false,
			"IMEMode": null,
			"Name": "Comment",
			"Required": false,
			"Direction": "none",
			"FieldType": "Note",
			"Description": "Esta es la descripci\u00f3n del campo \u0027V3Comments\u0027.",
			"ReadOnlyField": false,
			"Type": "Note",
			"RichText": true,
			"AppendOnly": false,
			"RichTextMode": 0,
			"NumberOfLines": 6,
			"AllowHyperlink": false,
			"RestrictedMode": true,
			"ScriptEditorAdderId": "11f2261f-f5a2-4ae6-9439-b191d30c8c14=4b537169-1c9c-4197-aeb0-9eb6423024e6"
		},
		"Category": {
			"Id": "6df9bd52-550e-4a30-bc31-a4366832a87d",
			"Title": "Category",
			"Hidden": false,
			"IMEMode": null,
			"Name": "Category",
			"Required": false,
			"Direction": "none",
			"FieldType": "Choice",
			"Description": "",
			"ReadOnlyField": false,
			"Type": "Choice",
			"FillInChoice": false,
			"MultiChoices": ["(1) Categor\u00eda 1", "(2) Categor\u00eda 2", "(3) Categor\u00eda 3"],
			"Choices": ["(1) Categor\u00eda 1", "(2) Categor\u00eda 2", "(3) Categor\u00eda 3"],
			"FormatType": 1
		},
		"RelatedIssues": {
			"Id": "875fab27-6e95-463b-a4a6-82544f1027fb",
			"Title": "Related Issues",
			"Hidden": false,
			"IMEMode": null,
			"Name": "RelatedIssues",
			"Required": false,
			"Direction": "none",
			"FieldType": "LookupMulti",
			"Description": "",
			"ReadOnlyField": false,
			"Type": "Lookup",
			"DependentLookup": false,
			"AllowMultipleValues": true,
			"BaseDisplayFormUrl": "http://sp2013-01/_layouts/15/listform.aspx?PageType=4",
			"Throttled": false,
			"LookupListId": "4f265dcf-de27-4525-9f50-d411a5c97cdf",
			"ChoiceCount": 5,
			"Choices": [{
				"LookupId": 60,
				"LookupValue": "aaaaaaa"
			}, {
				"LookupId": 57,
				"LookupValue": "asd asd asd"
			}, {
				"LookupId": 61,
				"LookupValue": "bbbbbb"
			}, {
				"LookupId": 58,
				"LookupValue": "kkkkk"
			}, {
				"LookupId": 54,
				"LookupValue": "Test"
			}]
		},
		"V3Comments": {
			"Id": "6df9bd52-550e-4a30-bc31-a4366832a87e",
			"Title": "Comments",
			"Hidden": false,
			"IMEMode": null,
			"Name": "V3Comments",
			"Required": false,
			"Direction": "none",
			"FieldType": "Note",
			"Description": "",
			"ReadOnlyField": false,
			"Type": "Note",
			"RichText": true,
			"AppendOnly": true,
			"RichTextMode": 0,
			"NumberOfLines": 6,
			"AllowHyperlink": false,
			"RestrictedMode": true,
			"ScriptEditorAdderId": "11f2261f-f5a2-4ae6-9439-b191d30c8c14=4b537169-1c9c-4197-aeb0-9eb6423024e6"
		},
		"Text_x0020_column_x0020_1": {
			"Id": "ddc6d4ce-90db-4a01-b5d5-4b4d3352c5df",
			"Title": "Text column 1",
			"Hidden": false,
			"IMEMode": null,
			"Name": "Text_x0020_column_x0020_1",
			"Required": false,
			"Direction": "none",
			"FieldType": "Text",
			"Description": "The description of \u0027Text column 1\u0027.\r\n(Length: 10)",
			"ReadOnlyField": false,
			"Type": "Text",
			"MaxLength": 10
		},
		"Text_x0020_column_x0020_3": {
			"Id": "d27a988c-30cc-42c1-a73a-ccb13d415a77",
			"Title": "Text column 3",
			"Hidden": false,
			"IMEMode": null,
			"Name": "Text_x0020_column_x0020_3",
			"Required": false,
			"Direction": "none",
			"FieldType": "Text",
			"Description": "The description of \u0027Text column 3\u0027.\r\n(Default value)",
			"ReadOnlyField": false,
			"Type": "Text",
			"MaxLength": 255
		},
		"Note_x0020_column": {
			"Id": "48849a06-0d18-40b0-a621-64e593881edd",
			"Title": "Note column",
			"Hidden": false,
			"IMEMode": null,
			"Name": "Note_x0020_column",
			"Required": false,
			"Direction": "none",
			"FieldType": "Note",
			"Description": "The description of \u0027Note column\u0027.",
			"ReadOnlyField": false,
			"Type": "Note",
			"RichText": false,
			"AppendOnly": false,
			"RichTextMode": 0,
			"NumberOfLines": 3,
			"AllowHyperlink": false,
			"RestrictedMode": true,
			"ScriptEditorAdderId": "11f2261f-f5a2-4ae6-9439-b191d30c8c14=4b537169-1c9c-4197-aeb0-9eb6423024e6"
		},
		"Attachments": {
			"Id": "67df98f4-9dec-48ff-a553-29bece9c5bf4",
			"Title": "Attachments",
			"Hidden": false,
			"IMEMode": null,
			"Name": "Attachments",
			"Required": false,
			"Direction": "none",
			"FieldType": "Attachments",
			"Description": "",
			"ReadOnlyField": false,
			"Type": "Attachments"
		},
		"Created": {
			"Id": "8c06beca-0777-48f7-91c7-6da68bc07b69",
			"Title": "Created",
			"Hidden": false,
			"IMEMode": null,
			"Name": "Created",
			"Required": false,
			"Direction": "none",
			"FieldType": "DateTime",
			"Description": "",
			"ReadOnlyField": true,
			"Type": "DateTime"
		},
		"Author": {
			"Id": "1df5e554-ec7e-46a6-901d-d85a3881cb18",
			"Title": "Created By",
			"Hidden": false,
			"IMEMode": null,
			"Name": "Author",
			"Required": false,
			"Direction": "none",
			"FieldType": "User",
			"Description": "",
			"ReadOnlyField": true,
			"Type": "User",
			"DependentLookup": false,
			"AllowMultipleValues": false,
			"Presence": true,
			"WithPicture": false,
			"DefaultRender": true,
			"WithPictureDetail": false,
			"ListFormUrl": "/_layouts/15/listform.aspx",
			"UserDisplayUrl": "/_layouts/15/userdisp.aspx",
			"EntitySeparator": ";",
			"PictureOnly": false,
			"PictureSize": null,
			"UserInfoListId": "{a12cca6c-a92e-495a-80ce-66f110b74735}"
		},
		"Modified": {
			"Id": "28cf69c5-fa48-462a-b5cd-27b6f9d2bd5f",
			"Title": "Modified",
			"Hidden": false,
			"IMEMode": null,
			"Name": "Modified",
			"Required": false,
			"Direction": "none",
			"FieldType": "DateTime",
			"Description": "",
			"ReadOnlyField": true,
			"Type": "DateTime"
		},
		"Editor": {
			"Id": "d31655d1-1d5b-4511-95a1-7a09e9b75bf2",
			"Title": "Modified By",
			"Hidden": false,
			"IMEMode": null,
			"Name": "Editor",
			"Required": false,
			"Direction": "none",
			"FieldType": "User",
			"Description": "",
			"ReadOnlyField": true,
			"Type": "User",
			"DependentLookup": false,
			"AllowMultipleValues": false,
			"Presence": true,
			"WithPicture": false,
			"DefaultRender": true,
			"WithPictureDetail": false,
			"ListFormUrl": "/_layouts/15/listform.aspx",
			"UserDisplayUrl": "/_layouts/15/userdisp.aspx",
			"EntitySeparator": ";",
			"PictureOnly": false,
			"PictureSize": null,
			"UserInfoListId": "{a12cca6c-a92e-495a-80ce-66f110b74735}"
		}
	},
	"FormControlMode": 2,
	"FieldControlModes": {
		"Title": 2,
		"MyChoice": 2,
		"MyMultiChoiceWithoutDefaultValue": 2,
		"MySingleChoice": 2,
		"MyDateTime": 2,
		"MyNumber": 2,
		"MyNumberPercentage": 2,
		"MyCurrency": 2,
		"MyLookup": 2,
		"MyLookupRequired": 2,
		"AssignedTo": 2,
		"MyUser": 2,
		"MyUserMulti": 2,
		"MyYesNo": 2,
		"DueDate": 2,
		"Status": 2,
		"Priority": 2,
		"Comment": 2,
		"Category": 2,
		"RelatedIssues": 2,
		"V3Comments": 2,
		"Text_x0020_column_x0020_1": 2,
		"Text_x0020_column_x0020_3": 2,
		"Note_x0020_column": 2,
		"Attachments": 2,
		"Created": 1,
		"Author": 1,
		"Modified": 1,
		"Editor": 1
	},
	"WebAttributes": {
		"WebUrl": "/",
		"EffectivePresenceEnabled": true,
		"AllowScriptableWebParts": false,
		"PermissionCustomizePages": true,
		"LCID": "1033",
		"CurrentUserId": 1
	},
	"ItemAttributes": {
		"Id": 54,
		"FsObjType": 0,
		"ExternalListItem": false,
		"Url": "/Lists/Issues/54_.000",
		"EffectiveBasePermissionsLow": 4294967295,
		"EffectiveBasePermissionsHigh": 2147483647
	},
	"ListAttributes": {
		"Id": "4f265dcf-de27-4525-9f50-d411a5c97cdf",
		"BaseType": 5,
		"Direction": "none",
		"ListTemplateType": 1100,
		"DefaultItemOpen": 1,
		"EnableVersioning": false
	},
	"InitialFocus": "Title",
	"CSRCustomLayout": false,
	"PostBackRequired": false,
	"PreviousPostBackHandled": false,
	"UploadMode": false,
	"RedirectInfo": {
		"popUI": false,
		"redirectUrl": "http://sp2013-01/Lists/Issues/AllItems.aspx",
		"listRootFolderUrl": "/Lists/Issues"
	},
	"SubmitButtonID": "ctl00_ctl28_g_ba9f6e2a_381a_4eeb_8d37_4d5b28b8f15a_ctl00_toolBarTbl_RightRptControls_ctl00_ctl00_diidIOSaveItem",
	"ItemContentTypeName": "Issue",
	"ItemContentTypeId": "0x0103001EA072D3B5945743BE7648C625C9DBCC"
};
SPClientForms.ClientFormManager.RegisterClientForm('WPQ2');
var form = SPClientForms.ClientFormManager.GetClientForm('WPQ2');
if (form != null) form.RenderClientForm();
var _spWebPermMasks = {
	High: 2147483647,
	Low: 4294967295
};
var slNavUrl = '\u002f';
_spBodyOnLoadFunctionNames.push('_cUpdonetidProjectPropertyTitleGraphic');

function _cUpdonetidProjectPropertyTitleGraphic() {
	var myd = null;
	if (typeof(dataonetidProjectPropertyTitleGraphic) != 'undefined') {
		myd = dataonetidProjectPropertyTitleGraphic;
	}
	var myc = document.getElementById('ctl00_onetidProjectPropertyTitleGraphic');
	_cUpdconetidProjectPropertyTitleGraphic(myd, myc);
}

function _cUpdconetidProjectPropertyTitleGraphic(data, ctrl) {
	ctrl.href = slNavUrl;
}

function _cUpdonetidHeadbnnr2() {
	var myd = null;
	if (typeof(dataonetidHeadbnnr2) != 'undefined') {
		myd = dataonetidHeadbnnr2;
	}
	var myc = document.getElementById('ctl00_onetidHeadbnnr2');
	_cUpdconetidHeadbnnr2(myd, myc);
}

function _cUpdconetidHeadbnnr2(data, ctrl) {
	SiteLogoImagePageUpdate(ctrl, data);
}
WPSC.Init(document);
var varPartWPQ2 = WPSC.WebPartPage.Parts.Register('WPQ2', 'ba9f6e2a-381a-4eeb-8d37-4d5b28b8f15a', document.getElementById('WebPartWPQ2'));
WPSC.WebPartPage.WebURL = 'http:\u002f\u002fsp2013-01';
WPSC.WebPartPage.WebServerRelativeURL = '\u002f';


ExecuteOrDelayUntilScriptLoaded(
	function() {
		Srch.ScriptApplicationManager.get_current().states = {
			"browserLanguage": 3082,
			"webUILanguageName": "en-US",
			"webDefaultLanguageName": "es-ES",
			"contextUrl": "http://sp2013-01",
			"showAdminDetails": true,
			"defaultPagesListName": "Pages",
			"defaultQueryProperties": {
				"culture": 3082,
				"uiLanguage": 3082,
				"summaryLength": 180,
				"desiredSnippetLength": 90,
				"enableStemming": true,
				"enablePhonetic": false,
				"enableNicknames": false,
				"trimDuplicates": true,
				"bypassResultTypes": false,
				"enableInterleaving": true,
				"enableQueryRules": true,
				"processBestBets": true,
				"enableOrderingHitHighlightedProperty": false,
				"hitHighlightedMultivaluePropertyLimit": -1,
				"processPersonalFavorites": true
			}
		};
		Srch.U.trace(null, 'SerializeToClient', 'ScriptApplicationManager state initialized.');
	}, 'Search.ClientControls.js');
var g_clientIdDeltaPlaceHolderMain = "ctl00_DeltaPlaceHolderMain";
var g_clientIdDeltaPlaceHolderPageTitleInTitleArea = "ctl00_DeltaPlaceHolderPageTitleInTitleArea";
var g_clientIdDeltaPlaceHolderUtilityContent = "ctl00_DeltaPlaceHolderUtilityContent";

theForm.oldSubmit = theForm.submit;
theForm.submit = WebForm_SaveScrollPositionSubmit;

theForm.oldOnSubmit = theForm.onsubmit;
theForm.onsubmit = WebForm_SaveScrollPositionOnSubmit;

function _ribbonInitFunc1()

{
	EnsureScriptParams('core.js', '_ribbonInitFunc1Wrapped', '', '', '\u002f_layouts\u002f15\u002fcommandui.ashx', '1226713005', '1033', 'RibbonContainer', {
		'Ribbon.EditingTools.CPEditTab': true,
		'Ribbon.Table.Design': true,
		'Ribbon.EditingTools.CPInsert': true,
		'Ribbon.ListForm.Edit': true,
		'Ribbon.Link.Link': true,
		'Ribbon.Read': true,
		'Ribbon.Image.Image': true,
		'Ribbon.Table.Layout': true
	}, null, {
		'Ribbon.ListForm.Display.Manage.DeleteItemVersion': true,
		'Ribbon.ListForm.Display.Manage.ClaimReleaseTask': true,
		'Ribbon.ListForm.Display.Manage.EnterFolder': true,
		'Ribbon.EditingTools.CPEditTab.EditAndCheckout': true,
		'Ribbon.WebPartInsert.InsertRelatedDataToListForm': true,
		'Ribbon.ListForm.Display.Manage.Workflows': true,
		'Ribbon.DocLibListForm.Edit.Actions.CheckIn': true,
		'Ribbon.EditingTools.CPEditTab.Layout': true,
		'Ribbon.DocLibListForm.Edit.Actions.ExportWebPart': true,
		'Ribbon.ListForm.Display.Manage.DistributionListsApproval': true,
		'Ribbon.ListForm.Display.Solution.Deactivate': true,
		'Ribbon.ListForm.Display.HealthActions.HealthReportRunNow': true,
		'Ribbon.DocLibListForm.Edit.Actions.VersionHistory': true,
		'Ribbon.ListForm.Edit.Actions.DistributionListsApproval': true,
		'Ribbon.ListForm.Edit.Actions.EditSeries': true,
		'Ribbon.PostListForm.Edit.Actions.EditSeries': true,
		'Ribbon.ListForm.Display.Manage.CheckIn': true,
		'Ribbon.ListForm.Display.Manage.ManageCopies': true,
		'Ribbon.ListForm.Edit.Actions.ClaimReleaseTask': true,
		'Ribbon.DocLibListForm.Edit.Commit.CheckIn': true,
		'Ribbon.DocLibListForm.Edit.Actions.ViewWebPartXml': true,
		'Ribbon.ListForm.Display.HealthActions.HealthReportRepair': true,
		'Ribbon.ListForm.Display.Manage.Alert': true,
		'Ribbon.ListForm.Display.Manage.RestoreItemVersion': true,
		'Ribbon.DocLibListForm.Edit.Actions.ManagePermissions': true,
		'Ribbon.EditingTools.CPInsert.WebParts': true,
		'Ribbon.ListForm.Display.Manage.ApproveReject': true,
		'Ribbon.ListForm.Display.Solution.Upgrade': true,
		'Ribbon.DocLibListForm.Edit.Actions.CheckOut': true,
		'Ribbon.ListForm.Display.Solution.Activate': true,
		'Ribbon.ListForm.Display.Manage.EditSeries': true,
		'Ribbon.ListForm.Display.Manage.CheckOut': true,
		'Ribbon.FormatText.PageState': true,
		'Ribbon.ListForm.Display.HealthActions.HealthRuleRunNow': true
	}, {
		'WSSNonSpecialFormVisibilityContext': true,
		'WSSRTE': true
	}, true, 0, false, 'SP.Ribbon.PageManager.get_instance()', false, null, null, null, '1715178220', 0, ',');
}

function _ribbonStartInit(initialTabId, buildMinimized, e) {
	EnsureScriptParams('core.js', '_ribbonStartInitWrapped', initialTabId, buildMinimized, e, true, 'EnsureScriptParams("core.js", "RibbonControlInitWrapped");EnsureScriptFunc("ribbon", "SP.Ribbon.PageManager", function () { _registerCUIEComponentWrapped( "\u002f_layouts\u002f15\u002fcommandui.ashx", "1033", "1226713005");});EnsureScript("ribbon", Boolean(typeof(SP.Ribbon.PageManager)) ? SP.Ribbon.PageManager : "undefined", _ribbonInitFunc1);');
}

function _ribbonKeyboardTitleShortcut(e) {
	EnsureScriptParams('core.js', '_ribbonKeyboardTitleShortcutWrapped', e, 'tff[', 'Ribbon.ListForm.Edit-title');
}

function _ribbonDataInit(p6, p7) {
	_ribbon = new Object();
	_ribbon.initialTabId = p6;
	_ribbon.buildMinimized = p7;
	_ribbon.initStarted = false;
	_ribbon.initialTabSelectedByUser = false;
	_ribbon.launchedByKeyboard = false;
}

function _ribbonWaitForBodyEvent() {
	if (true)
		_ribbonStartInit();

	function _ribbonOnWindowResizeForHeaderScaling(evt) {
		_ribbonOnWindowResizeForHeaderScalingWrapped(evt, 'RibbonContainer', false);
	}
	EnsureScriptParams('core.js', '_ribbonInitResizeHandlers', _ribbonOnWindowResizeForHeaderScaling, 'RibbonContainer', true, false);

	EnsureScriptParams('core.js', '_ribbonAddEventListener', _ribbonKeyboardTitleShortcut);
}
_ribbonDataInit('Ribbon.ListForm.Edit', false);
EnsureScriptFunc('ribbon', 'SP.Ribbon.PageStateActionButton', _ribbonWaitForBodyEvent);

var g_commandUIHandlers = {
	"name": "CommandHandlers",
	"attrs": {},
	"children": []
};

WebForm_InitCallback();
_spBodyOnLoadFunctionNames.push('QuickLaunchInitDroppable');

function zz12_TopNavigationMenu_Callback(data, errorHandlerName) {
	WebForm_DoCallback('ctl00$PlaceHolderTopNavBar$TopNavigationMenu', data, AspMenuHandleDataRefresh, g_QuickLaunchMenu.Id, errorHandlerName, true);
}
var g_zz12_TopNavigationMenu = null;

function init_zz12_TopNavigationMenu() {
	if (g_zz12_TopNavigationMenu == null) g_zz12_TopNavigationMenu = $create(SP.UI.AspMenu, null, null, null, $get('zz12_TopNavigationMenu'));
}
ExecuteOrDelayUntilScriptLoaded(init_zz12_TopNavigationMenu, 'SP.Core.js');

ExecuteOrDelayUntilScriptLoaded(
	function() {
		if ($isNull($find('ctl00_PlaceHolderSearchArea_SmallSearchInputBox1_csr'))) {
			var sb = $create(Srch.SearchBox, {
				"delayLoadTemplateScripts": true,
				"initialPrompt": "Search This Site...",
				"messages": [],
				"navigationNodes": [{
					"name": "This Site",
					"url": "~site/_layouts/15/osssearchresults.aspx?u={contexturl}"
				}],
				"queryGroupNames": ["MasterPage"],
				"renderTemplateId": "~sitecollection/_catalogs/masterpage/Display Templates/Search/Control_SearchBox_Compact.js",
				"resultsPageAddress": "~site/_layouts/15/osssearchresults.aspx?u={contexturl}",
				"serverInitialRender": true,
				"showDataErrors": true,
				"showNavigation": true,
				"states": {},
				"tryInplaceQuery": false
			}, null, null, $get("ctl00_PlaceHolderSearchArea_SmallSearchInputBox1_csr"));
			var prompt = sb.get_initialPrompt();
			if ($isNull(prompt)) {
				prompt = 'Search This Site...';
			}
			sb.activate(prompt, 'ctl00_PlaceHolderSearchArea_SmallSearchInputBox1_csr_sbox', 'ctl00_PlaceHolderSearchArea_SmallSearchInputBox1_csr_sboxdiv', 'ctl00_PlaceHolderSearchArea_SmallSearchInputBox1_csr_NavButton', 'ctl00_PlaceHolderSearchArea_SmallSearchInputBox1_csr_AutoCompList', 'ctl00_PlaceHolderSearchArea_SmallSearchInputBox1_csr_NavDropdownList', 'ctl00_PlaceHolderSearchArea_SmallSearchInputBox1_csr_SearchLink', 'ms-srch-sbprogress', 'ms-srch-sb-prompt ms-helperText');
		}
	}, 'Search.ClientControls.js');
g_QuickLaunchDropItems = ["zz16_QuickLaunchDrop", "zz17_QuickLaunchDrop"];
_spBodyOnLoadFunctionNames.push('QuickLaunchInitDroppable');
_spBodyOnLoadFunctionNames.push('QuickLaunchInitDroppable');

function zz14_V4QuickLaunchMenu_Callback(data, errorHandlerName) {
	WebForm_DoCallback('ctl00$PlaceHolderLeftNavBar$V4QuickLaunchMenu', data, AspMenuHandleDataRefresh, g_QuickLaunchMenu.Id, errorHandlerName, true);
}
var g_zz14_V4QuickLaunchMenu = null;

function init_zz14_V4QuickLaunchMenu() {
	if (g_zz14_V4QuickLaunchMenu == null) g_zz14_V4QuickLaunchMenu = $create(SP.UI.AspMenu, null, null, null, $get('zz14_V4QuickLaunchMenu'));
}
ExecuteOrDelayUntilScriptLoaded(init_zz14_V4QuickLaunchMenu, 'SP.Core.js');

function _initTRAWebPartWPQ2() {
	var toolbarData = new Object();
	toolbarData['ToolbarData'] = "[{'Command':'Ribbon.ListForm.Edit.Actions.AttachFile','ClickScript':'javascript:UploadAttachment\\u0028\\u0029;','LabelText':'Attach File','ElementClientId':'ctl00_ctl28_g_ba9f6e2a_381a_4eeb_8d37_4d5b28b8f15a_ctl00_ctl01_ctl00_toolBarTbl_RptControls_diidIOAttach','Enabled':'True'},{'Command':'Ribbon.ListForm.Display.Manage.DeleteItem','ClickScript':'return DeleteItemConfirmation\\u0028\\u0029;','LabelText':'Delete Item','ElementClientId':'ctl00_ctl28_g_ba9f6e2a_381a_4eeb_8d37_4d5b28b8f15a_ctl00_ctl01_ctl00_toolBarTbl_RptControls_diidIODeleteItem','Enabled':'True'},{'Command':'Ribbon.ListForm.Edit.Commit.Publish','ClickScript':'if \\u0028!PreSaveItem\\u0028\\u0029\\u0029 return false;if \\u0028SPClientForms.ClientFormManager.SubmitClientForm\\u0028\\u0027WPQ2\\u0027\\u0029\\u0029 return false;','ElementClientId':'ctl00_ctl28_g_ba9f6e2a_381a_4eeb_8d37_4d5b28b8f15a_ctl00_toolBarTbltop_RightRptControls_ctl01_ctl00_diidIOSaveItem'},{'Command':'Ribbon.ListForm.Edit.Commit.Cancel','ClickScript':'STSNavigate\\u0028\\u0027http:\\\\u002f\\\\u002fsp2013-01\\\\u002fLists\\\\u002fIssues\\\\u002fAllItems.aspx\\u0027\\u0029;return false;','ElementClientId':'ctl00_ctl28_g_ba9f6e2a_381a_4eeb_8d37_4d5b28b8f15a_ctl00_toolBarTbltop_RightRptControls_ctl02_ctl00_diidIOGoBack'},{'Command':'Ribbon.ListForm.Edit.Commit.Publish','ClickScript':'if \\u0028!PreSaveItem\\u0028\\u0029\\u0029 return false;if \\u0028SPClientForms.ClientFormManager.SubmitClientForm\\u0028\\u0027WPQ2\\u0027\\u0029\\u0029 return false;','ElementClientId':'ctl00_ctl28_g_ba9f6e2a_381a_4eeb_8d37_4d5b28b8f15a_ctl00_toolBarTbl_RightRptControls_ctl00_ctl00_diidIOSaveItem'},{'Command':'Ribbon.ListForm.Edit.Commit.Cancel','ClickScript':'STSNavigate\\u0028\\u0027http:\\\\u002f\\\\u002fsp2013-01\\\\u002fLists\\\\u002fIssues\\\\u002fAllItems.aspx\\u0027\\u0029;return false;','ElementClientId':'ctl00_ctl28_g_ba9f6e2a_381a_4eeb_8d37_4d5b28b8f15a_ctl00_toolBarTbl_RightRptControls_ctl01_ctl00_diidIOGoBack'}]";

	toolbarData['ViewId'] = 'ba9f6e2a-381a-4eeb-8d37-4d5b28b8f15a';
	var listFormPageComponent = new SP.Ribbon.ListFormWebPartPageComponent('WebPartWPQ2', toolbarData);
	SP.Ribbon.PageManager.get_instance().addPageComponent(listFormPageComponent);
}
ExecuteOrDelayUntilScriptLoaded(_initTRAWebPartWPQ2, "sp.ribbon.js"); //]]>