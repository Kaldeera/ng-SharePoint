
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


if(typeof Sys == 'undefined') {
	__cultureInfo = {
		"name": "en-US",
		"numberFormat": {
			"CurrencyDecimalDigits": 2,
			"CurrencyDecimalSeparator": ".",
			"IsReadOnly": false,
			"CurrencyGroupSizes": [
				3
			],
			"NumberGroupSizes": [
				3
			],
			"PercentGroupSizes": [
				3
			],
			"CurrencyGroupSeparator": ",",
			"CurrencySymbol": "$",
			"NaNSymbol": "NaN",
			"CurrencyNegativePattern": 0,
			"NumberNegativePattern": 1,
			"PercentPositivePattern": 0,
			"PercentNegativePattern": 0,
			"NegativeInfinitySymbol": "-Infinity",
			"NegativeSign": "-",
			"NumberDecimalDigits": 2,
			"NumberDecimalSeparator": ".",
			"NumberGroupSeparator": ",",
			"CurrencyPositivePattern": 0,
			"PositiveInfinitySymbol": "Infinity",
			"PositiveSign": "+",
			"PercentDecimalDigits": 2,
			"PercentDecimalSeparator": ".",
			"PercentGroupSeparator": ",",
			"PercentSymbol": "%",
			"PerMilleSymbol": "‰",
			"NativeDigits": [
				"0",
				"1",
				"2",
				"3",
				"4",
				"5",
				"6",
				"7",
				"8",
				"9"
			],
			"DigitSubstitution": 1
		},
		"dateTimeFormat": {
			"AMDesignator": "AM",
			"Calendar": {
				"MinSupportedDateTime": "@-62135568000000@",
				"MaxSupportedDateTime": "@253402300799999@",
				"AlgorithmType": 1,
				"CalendarType": 1,
				"Eras": [
					1
				],
				"TwoDigitYearMax": 2029,
				"IsReadOnly": false
			},
			"DateSeparator": "/",
			"FirstDayOfWeek": 0,
			"CalendarWeekRule": 0,
			"FullDateTimePattern": "dddd, MMMM dd, yyyy h:mm:ss tt",
			"LongDatePattern": "dddd, MMMM dd, yyyy",
			"LongTimePattern": "h:mm:ss tt",
			"MonthDayPattern": "MMMM dd",
			"PMDesignator": "PM",
			"RFC1123Pattern": "ddd, dd MMM yyyy HH':'mm':'ss 'GMT'",
			"ShortDatePattern": "M/d/yyyy",
			"ShortTimePattern": "h:mm tt",
			"SortableDateTimePattern": "yyyy'-'MM'-'dd'T'HH':'mm':'ss",
			"TimeSeparator": ":",
			"UniversalSortableDateTimePattern": "yyyy'-'MM'-'dd HH':'mm':'ss'Z'",
			"YearMonthPattern": "MMMM, yyyy",
			"AbbreviatedDayNames": [
				"Sun",
				"Mon",
				"Tue",
				"Wed",
				"Thu",
				"Fri",
				"Sat"
			],
			"ShortestDayNames": [
				"Su",
				"Mo",
				"Tu",
				"We",
				"Th",
				"Fr",
				"Sa"
			],
			"DayNames": [
				"Sunday",
				"Monday",
				"Tuesday",
				"Wednesday",
				"Thursday",
				"Friday",
				"Saturday"
			],
			"AbbreviatedMonthNames": [
				"Jan",
				"Feb",
				"Mar",
				"Apr",
				"May",
				"Jun",
				"Jul",
				"Aug",
				"Sep",
				"Oct",
				"Nov",
				"Dec",
				""
			],
			"MonthNames": [
				"January",
				"February",
				"March",
				"April",
				"May",
				"June",
				"July",
				"August",
				"September",
				"October",
				"November",
				"December",
				""
			],
			"IsReadOnly": false,
			"NativeCalendarName": "Gregorian Calendar",
			"AbbreviatedMonthGenitiveNames": [
				"Jan",
				"Feb",
				"Mar",
				"Apr",
				"May",
				"Jun",
				"Jul",
				"Aug",
				"Sep",
				"Oct",
				"Nov",
				"Dec",
				""
			],
			"MonthGenitiveNames": [
				"January",
				"February",
				"March",
				"April",
				"May",
				"June",
				"July",
				"August",
				"September",
				"October",
				"November",
				"December",
				""
			],
			"eras": [
				1,
				"A.D.",
				null,
				0
			]
		}
	};
}


if (typeof STSHtmlEncode == 'undefined') {
	STSHtmlEncode = function(str) {
		if (null === str)
			return "";
		var strIn = "";
		var strOut = [];
		var ix = 0;
		var max = strIn.length;

		for (ix = 0; ix < max; ix++) {
			var ch = strIn.charAt(ix);

			switch (ch) {
				case '<':
					strOut.push("&lt;");
					break;
				case '>':
					strOut.push("&gt;");
					break;
				case '&':
					strOut.push("&amp;");
					break;
				case '\"':
					strOut.push("&quot;");
					break;
				case '\'':
					strOut.push("&#39;");
					break;
				default:
					strOut.push(ch);
					break;
			}
		}
		return strOut.join('');
	};
}

if(typeof Strings == 'undefined'){

	Strings = {};
	Strings.STS=function(){};
	Strings.STS.L_FollowNotificationText='Now following on My Site';
	Strings.STS.L_InsertCellLeftShiftKey_TEXT='false';
	Strings.STS.L_RoamingOffice_AppNameOutlook='Outlook';
	Strings.STS.L_UnPublishWarning_Text=' Are you sure you want to unpublish this version of the document?';
	Strings.STS.L_DeletePartialResponse1_text='A partial survey response has been saved.  Click OK to delete the partial survey response. If you want to continue this survey later click Cancel.  Your partial response can be found in the All Responses survey view.\n\nDo you want to send this partial response to the site Recycle Bin?';
	Strings.STS.L_DocMoveFollowDocument='Follow this document in its new location.';
	Strings.STS.L_LightBlueLong_TEXT='Light Blue';
	Strings.STS.L_SteelBlue_TEXT='SteelBlue';
	Strings.STS.L_DocMoveErrorOccurredMessage='An error occurred.';
	Strings.STS.L_FailedToGetGroupsForList='Failed to get groups for the list.';
	Strings.STS.L_SPDiscApproveConfirmation='If you approve these discussion item(s), all associated abuse reports will be cleared, and the item will be updated to a status of Not Abusive. Are you sure you want to approve these discussion item(s) as not abusive?';
	Strings.STS.L_RoamingOffice_AppNamePublisher='Publisher';
	Strings.STS.L_InsertRowBelowLabel_TEXT='Insert Row Below (Ctrl+Alt+Down)';
	Strings.STS.L_HotPink_TEXT='HotPink';
	Strings.STS.L_CreateDWS_Text='Create Document Workspace';
	Strings.STS.L_DlgFirstLineCaption='Text to display';
	Strings.STS.L_WebFoldersError_IE_Text='We\'re having a problem opening this location in File Explorer. Add this web site to your Trusted Sites list and try again.';
	Strings.STS.L_DropTextNotAvailable='The upload component is not available. Please contact your server administrator.';
	Strings.STS.L_LittleRedDiamond_TXT='&loz;';
	Strings.STS.L_DarkGreen_TEXT='DarkGreen';
	Strings.STS.L_IEOnlyFeature_Text='This feature requires Internet Explorer version 5.5 or greater for Windows to work.';
	Strings.STS.L_ExportContact_Text='Export Contact';
	Strings.STS.L_DeleteDocItem_Text='Delete';
	Strings.STS.L_SPGanttDisposeSavingDialogBody='We want to make sure your changes are saved.';
	Strings.STS.L_DGpreview_CARight_4='SHAREPOINT APPS';
	Strings.STS.L_CancelledMessageSingle='Upload cancelled.';
	Strings.STS.L_InsertImageAltKey_TEXT='false';
	Strings.STS.L_Monthly2MonthDisplay_Text='The number of months between recurrences';
	Strings.STS.L_RedoToolTip_TEXT='Redo (Ctrl+Y)';
	Strings.STS.L_Magenta_TEXT='Magenta';
	Strings.STS.L_Version_NoRestore_Current_ERR='Cannot restore the current version.';
	Strings.STS.L_Thistle_TEXT='Thistle';
	Strings.STS.L_ClickOnce1_text='You are already attempting to save this item. If you attempt to save this item again, you may create duplicate information. Would you like to save this item again?';
	Strings.STS.L_OpenTasksFail_Text='Unable to open tasks.';
	Strings.STS.L_UndoCheckoutWarning_Text='If you discard your check out, you will lose all changes made to the document.  Are you sure you want to discard your check out?';
	Strings.STS.L_CalendarSaka_Text=' using Saka Era Calendar';
	Strings.STS.L_ConflictRenameButton='Keep both (rename new file)';
	Strings.STS.L_EmptySlideShow_Text='No pictures found in the library. Add pictures and try again.';
	Strings.STS.L_DesignBuilderToolsFontSchemeToolTipDescription='Change the font scheme of the site.';
	Strings.STS.L_DesignBuilderToolsFontSchemeAlt='Font Scheme';
	Strings.STS.L_MyDocsSharedWithMeSeeMoreDocuments='See more documents by ^1';
	Strings.STS.L_rgDOW1_Text='Mon';
	Strings.STS.L_NoPreview_Text='No Preview Available';
	Strings.STS.L_InvalidUrlValue_Text='You cannot type a semicolon (;) immediately followed by a number sign (#) in the Web address of a hyperlink.';
	Strings.STS.L_SkyBlueLong_TEXT='Sky Blue';
	Strings.STS.L_ForestGreen_TEXT='ForestGreen';
	Strings.STS.L_Whereabouts_TodaysSchedule_Text='Appointments';
	Strings.STS.L_Chartreuse_TEXT='Chartreuse';
	Strings.STS.L_DeleteRowShiftKey_TEXT='false';
	Strings.STS.L_TaskDueModifier='Due {0}';
	Strings.STS.L_DialogFollowDocAction_Content='When you follow this document, you\'ll get updates in your newsfeed.';
	Strings.STS.L_Language_Text='1033';
	Strings.STS.L_DragDropMenuItemText='Drag and drop link here';
	Strings.STS.L_SPDiscReportAbuseDialogTitleLabel='Title: {0}';
	Strings.STS.L_UnderlineKey_TEXT='U';
	Strings.STS.L_PublishItem_Text='Publish a Major Version';
	Strings.STS.L_TimeLong_Text='<b>Time:</b>';
	Strings.STS.L_AutoHostedAppLicensesNotRequired='This type of app doesn\'t require app hosting licenses.';
	Strings.STS.L_AccReqList_Conversation='Conversation';
	Strings.STS.L_StartFollowingCommand='Follow';
	Strings.STS.L_Monthly1_Text='Day ^1 of every ^2 month(s)';
	Strings.STS.L_RecurPatternNone_Text='None';
	Strings.STS.L_ViewItem_Text='View Item';
	Strings.STS.L_OverwriteView='Your changes will update the existing ^1 ^2 view. To make a ^3 view or a new view, try a different name.';
	Strings.STS.L_ClickToZoom='View full resolution picture.';
	Strings.STS.L_Remove_Text='Remove from this list';
	Strings.STS.L_rgDOWLong1_Text='Monday';
	Strings.STS.L_SucceedMessageWithCheckout='Upload completed with {1} checked out ({0} added)';
	Strings.STS.L_Loading_Error_Text='An error has occurred with the data fetch.  Please refresh the page and retry.';
	Strings.STS.L_DevDashAnimation_NumUnits='#Units';
	Strings.STS.L_OrderedListShiftKey_TEXT='true';
	Strings.STS.L_DocMoveErrorUnresponsiveServerMessage='The following items were not moved because the server is not responding. Try move again later or contact the site administrator if the problem persists:';
	Strings.STS.L_AppCreatedByText='Created by {0}';
	Strings.STS.L_DevDashAnimation_Duration='Duration';
	Strings.STS.L_Date_Text='<b>Date:</b>';
	Strings.STS.L_AccRqCllUtActRsnd='Resend';
	Strings.STS.L_rgMonths0_Text='January';
	Strings.STS.L_DocMoveQueryFolderItemsFailed='Sorry, we could not successfully retrieve the items you chose to move. No items were moved. Please try again at a later time.';
	Strings.STS.L_SendToEmail_Text='E-mail a Link';
	Strings.STS.L_MediumBlue_TEXT='MediumBlue';
	Strings.STS.L_DGpreview_SuiteLink3='Third Item';
	Strings.STS.L_SharedWithDialogOwnerPermission='Owner';
	Strings.STS.L_AccReqResendingInvFail='Resending invitation failed';
	Strings.STS.L_NoExplorerView_Text='To view your documents, please navigate to the library and select the \'Open with Explorer\' action. If the \'Open with Explorer\' action is not available, then your system may not support it.';
	Strings.STS.L_DateSeparator=' - ';
	Strings.STS.L_WhiteSmoke_TEXT='WhiteSmoke';
	Strings.STS.L_AltViewProperty_Text='Click here to view the picture properties.';
	Strings.STS.L_Khaki_TEXT='Khaki';
	Strings.STS.L_Notification_CheckOut='Checking Out...';
	Strings.STS.L_NewFormLibTb6_Text='Only 500 documents can be relinked at a time. Modify your selection and then try again.';
	Strings.STS.L_FullRichTextHelpLink='Click for help about adding HTML formatting.';
	Strings.STS.L_SplitCellToolTip_TEXT='Split Cell (Ctrl+Alt+S)';
	Strings.STS.L_IMNOnline_Text='Available';
	Strings.STS.L_SelectFontSizeShiftKey_TEXT='true';
	Strings.STS.L_MediumSeaGreen_TEXT='MediumSeaGreen';
	Strings.STS.L_DeleteItem_Text='Delete Item';
	Strings.STS.L_StopSharing='Stop sharing';
	Strings.STS.L_SharepointSearch_Text='Search this site...';
	Strings.STS.L_DGpreview_Accent5='Accent 5';
	Strings.STS.L_DontFilterBy_Text='Clear Filters from ^1';
	Strings.STS.L_NextPicture_Text='Next picture';
	Strings.STS.L_RoamingOffice_LaunchingApp='Please hold on while we get things ready for you...';
	Strings.STS.L_AccRqCllUtSts='Status';
	Strings.STS.L_LightTurquoise_TEXT='Light Turquoise';
	Strings.STS.L_SPGanttDisposeErrorDialogFixButton='Go fix them';
	Strings.STS.L_UserFieldPictureAlt2='Picture: ^1';
	Strings.STS.L_LavenderBlush_TEXT='LavenderBlush';
	Strings.STS.L_PromoSites_StopAdminModeTitle='Stop managing promoted sites';
	Strings.STS.L_DeleteSite_Text='Delete Site';
	Strings.STS.L_IndentShiftKey_TEXT='false';
	Strings.STS.L_DocMoveDocMoveFailed='Move failed.';
	Strings.STS.L_SharedWithGuestTooltip='Click to view and manage guest links';
	Strings.STS.L_DateOrderYear_Text='YYYY';
	Strings.STS.AccReqList_HistoryView='History';
	Strings.STS.L_AccReqDenialFail='Failed to decline request';
	Strings.STS.L_Version_Recycle_Confirm_Text='Are you sure you want to send this version to the site Recycle Bin?';
	Strings.STS.L_SharingNotificationUserSeparator=', ';
	Strings.STS.L_InsertColumnLeftShiftKey_TEXT='false';
	Strings.STS.L_DropText='Drop here...';
	Strings.STS.L_EditInApplication_Text='Edit Document';
	Strings.STS.L_RoamingOffice_InstallExtension='Your browser is asking you to install an add-on right now. Please allow the installation and we\'ll open your application automatically.';
	Strings.STS.L_ConfirmUnlinkCopy_Text='Because this item is a copy, it may still be receiving updates from its source.  You should make sure that this item is removed from the source\'s list of items to update, otherwise this item may continue to receive updates.  Are you sure that you want to unlink this item?';
	Strings.STS.L_DueDate_Color='#FF0000';
	Strings.STS.L_cantSave_Text='This form cannot be saved when previewing this page.';
	Strings.STS.L_DocMoveDialogReplaceKey='r';
	Strings.STS.L_SharedWithUsers='Shared with ^1';
	Strings.STS.L_SmallHour_Text='0';
	Strings.STS.L_ContainIllegalChar_Text='^1 can\'t use character \'^2\'.';
	Strings.STS.L_IndentToolTip_TEXT='Increase Indent (Ctrl+M)';
	Strings.STS.L_RoyalBlue_TEXT='RoyalBlue';
	Strings.STS.L_SPClientFormSubmitGeneralError='The server was unable to save the form at this time.  Please try again.';
	Strings.STS.L_TasksListShortcut_Indent='Indent - Alt+Shift+Right';
	Strings.STS.L_DaysLabelForCallout='{0} days||{0} day||{0} days';
	Strings.STS.L_DGpreview_SuiteLink2='Second Item';
	Strings.STS.L_DGpreview_CATableDescription='You are looking at an example of how the colors will be used in this theme for your content. This is an example of a {0}hyperlink{1}. This is how a {2}visited hyperlink{3} will look like. For text editing, you will have the following 6 colors to play with:';
	Strings.STS.L_InsertColumnToolTip_TEXT='Insert Column';
	Strings.STS.L_Salmon_TEXT='Salmon';
	Strings.STS.L_Edit_Text='Edit';
	Strings.STS.L_PromoSites_EditTileCaption='edit';
	Strings.STS.L_DocMoveErrorSourceTargetConflictMessage='The following items were not moved because the source and destination were the same or moving a parent folder to a child folder:';
	Strings.STS.L_MediumTurquoise_TEXT='MediumTurquoise';
	Strings.STS.L_CornflowerBlue_TEXT='CornflowerBlue';
	Strings.STS.L_RecurPatternWeekly_Text='Weekly';
	Strings.STS.L_DocMoveResultShowErrors='Show errors.';
	Strings.STS.L_ManageAppPerms_Text='Manage Permissions';
	Strings.STS.L_Thursday_Text='Thursday';
	Strings.STS.L_TextFieldMax_Text='^1 can have no more than ^2 characters.';
	Strings.STS.L_rgMonths9_Text='October';
	Strings.STS.L_DocMoveUnexpectedError='An unexpected error occurred.';
	Strings.STS.L_ViewInBrowser_Text='View in Browser';
	Strings.STS.L_SPClientPeoplePicker_AutoFillFooterIntervals='1||2-29||30-';
	Strings.STS.L_SitesFollowLimitReachedDialog_Button='Take me to my followed sites';
	Strings.STS.L_StylesLabel_TEXT='Styles';
	Strings.STS.L_strCollapse_Text='Collapse';
	Strings.STS.L_AccReqResendingInv='Resending invitation';
	Strings.STS.L_DocMoveLoadingDestinationFolders='Loading destination document libraries and folders for selection...';
	Strings.STS.L_InsertCellLeftLabel_TEXT='Insert Cell Left (Ctrl+Alt+L)';
	Strings.STS.L_FontNameToolTip_TEXT='Font (Ctrl+Shift+F)';
	Strings.STS.L_DlgAddLinkTitle='Add a link';
	Strings.STS.L_DarkSlateGray_TEXT='DarkSlateGray';
	Strings.STS.L_Version_RecycleAllMinor_Confirm_Text='Are you sure you want to send all previous draft versions of this file to the site Recycle Bin?';
	Strings.STS.L_CreateExcelSurveyErrorTitle='Sorry, you can\'t create surveys here';
	Strings.STS.L_IMNIdle_Text='May be away';
	Strings.STS.L_WeekFrequency_Text='1';
	Strings.STS.L_ConflictApplyRestWithCountCheckBox='Do this for the next {0} conflicts';
	Strings.STS.L_DateRange_Text='Date Range';
	Strings.STS.L_CalloutFollowAction_Tooltip='Follow this document and get updates in your newsfeed.';
	Strings.STS.L_MtgDeleteConfirm_Text='This meeting date and the content associated with it will be deleted from the workspace.';
	Strings.STS.L_GhostWhite_TEXT='GhostWhite';
	Strings.STS.L_DeletePartialResponse2_text='A partial survey response has been saved.  Click OK to delete the partial survey response. If you want to continue this survey later click Cancel.  Your partial response can be found in the All Responses survey view.\n\nDo you want to delete the partial response?';
	Strings.STS.L_PromoSites_StartAdminModeTitle='Manage promoted sites';
	Strings.STS.L_SiteSettings_Text='Change Site Settings';
	Strings.STS.L_DGpreview_CARight_2='Share this site';
	Strings.STS.L_CancelledMessageMultiple='Upload cancelled. Some of your files may have been uploaded.';
	Strings.STS.L_STSDelConfirmParentTask='Deleting a summary task will also delete its subtasks.';
	Strings.STS.L_AccRqAMmtAgo='Less than a minute ago';
	Strings.STS.L_ContentEditorSaveFailed_ERR='Cannot save your changes.';
	Strings.STS.L_SaveViewDlgPublicOpt='Make it public so everyone can see it.';
	Strings.STS.L_SelectFontNameAltKey_TEXT='false';
	Strings.STS.L_DeleteVersion_Text='Delete';
	Strings.STS.L_DaysAgoLabelForCalloutIntervals='0||1||2-';
	Strings.STS.L_EditLinksText='Edit Links';
	Strings.STS.L_RoamingOffice_AppNameFirstRun='First Run';
	Strings.STS.L_CheckMarkCompleteNoPerms_Tooltip='This task is complete.';
	Strings.STS.L_SPDiscNewPost='new post';
	Strings.STS.L_SPCategoryLastPost='Last post {0}';
	Strings.STS.L_Whereabouts_In_Text='In';
	Strings.STS.L_DateOrderDay_Text='D';
	Strings.STS.L_DGpreview_CATable_Doc4='Fourth Document';
	Strings.STS.L_CancelPublish_Text='Cancel Approval';
	Strings.STS.L_DocMoveInvalidDestinationError401Unauthorized='Sorry, you do not have access to the destination location at this time. Please ask your administrator for assistance.';
	Strings.STS.L_DevDashAnimation_Max='Max';
	Strings.STS.L_InsertImageShiftKey_TEXT='true';
	Strings.STS.L_Completed_Text='Completed';
	Strings.STS.L_Whereabouts_Home_Text='Home';
	Strings.STS.L_DGpreview_Welcome='User Name';
	Strings.STS.L_HideAllSharingRequests='Hide history';
	Strings.STS.L_ItalicToolTip_TEXT='Italic (Ctrl+I)';
	Strings.STS.L_InsertCellLeftKey_TEXT='L';
	Strings.STS.L_Review_Text='Send for Review';
	Strings.STS.L_BingMapsControl='Bing Maps Control';
	Strings.STS.L_UploadInProgress='There is an upload in progress. Please wait until the current upload has finished.';
	Strings.STS.L_STSRecycleConfirm2_Text='Are you sure you want to send this Document Collection and all its contents to the site Recycle Bin?';
	Strings.STS.L_SelectForeColorKey_TEXT='C';
	Strings.STS.L_DocMoveFolderCreationDialogMessage='You have entered a folder that does not exist in the library you chose. Would you like to create the folder ^1 before moving your documents?';
	Strings.STS.L_SlideShowPauseButton_Text='Pause';
	Strings.STS.L_DGpreview_TN3='Navigation 3';
	Strings.STS.L_FontSizeLabel_TEXT='Size';
	Strings.STS.L_MyDocsCalloutFollow='Follow';
	Strings.STS.L_NoOverwriteView='You cannot change this view because it\'s ^1. Try a different name to create a new ^2 view.';
	Strings.STS.L_SubMenu_Text='Submenu';
	Strings.STS.L_DETACHEDSINGLENOWSERIES_Text='This meeting was changed in your calendar and scheduling program from a nonrecurring meeting to a recurring meeting. The current workspace does not support a recurring meeting. In your scheduling program, unlink the meeting from the workspace, and then link the meeting again to a new workspace. The new workspace will automatically support a recurring meeting.';
	Strings.STS.L_DarkViolet_TEXT='DarkViolet';
	Strings.STS.L_ToolPaneWidenToolTip_TXT='Widen';
	Strings.STS.L_Reschedule_Text='Rescheduling Options';
	Strings.STS.L_DocMoveFolderFileConflictDialogRepeatMessage='Do this for the remaining conflicts';
	Strings.STS.L_UserFieldNoUserPresenceAlt='No presence information';
	Strings.STS.L_IllegalFileNameError='File names can\'t contain the following characters: & \" ? < > # {} % ~ / \\.';
	Strings.STS.L_DeepPink_TEXT='DeepPink';
	Strings.STS.L_rgDOW4_Text='Thur';
	Strings.STS.L_UnderlineShiftKey_TEXT='false';
	Strings.STS.L_LookupFieldNoneOption='(None)';
	Strings.STS.L_Chocolate_TEXT='Chocolate';
	Strings.STS.L_NoUploadPermissionTitle='Different permissions needed';
	Strings.STS.L_DocMoveDialogContinueMove='Continue move';
	Strings.STS.L_MyDocsDateHeaderYesterday='Yesterday';
	Strings.STS.L_DocMoveDocMoved='Moved.';
	Strings.STS.L_SPClientFormSubmitDuplicateFile='There\'s already a file with that name.  Please pick another.';
	Strings.STS.L_DesignBuilderToolsDefaultFontSchemeTitle='Default';
	Strings.STS.L_Title_Text='Title';
	Strings.STS.L_InvalidFolderPath_ERR='The path to the folder is not valid for the %0 property. Check the path name and try again.';
	Strings.STS.L_DGpreview_CATable_Author3='Approved';
	Strings.STS.L_AppUpgradeCanceling='Upgrade Canceling';
	Strings.STS.L_ConflictNoUploadButton='Don\'t Upload';
	Strings.STS.L_PageNotYetSaved_ERR='page not yet saved';
	Strings.STS.L_Delete_Text='Delete';
	Strings.STS.L_rgDOWLong3_Text='Wednesday';
	Strings.STS.L_SPGanttDiscardChangesMenuItem='Discard changes';
	Strings.STS.L_CloseButtonCaption='Close';
	Strings.STS.L_DGpreview_CATable_Date2='10/22/2011';
	Strings.STS.L_SharedWithDialogEmailEveryone='Email everyone';
	Strings.STS.L_OrangeRed_TEXT='OrangeRed';
	Strings.STS.L_SaveButtonCaption='Save';
	Strings.STS.L_SeaGreen_TEXT='SeaGreen';
	Strings.STS.L_Monday_Text='Monday';
	Strings.STS.L_Tip_Text='^1: ^2';
	Strings.STS.L_RoamingOffice_NoSubscription='It seems like you don\'t have a subscription to the Office applications.';
	Strings.STS.L_EnterValidCopyDest_Text='Please enter a valid folder URL and a file name.  Folder URLs must begin with \'http:\' or \'https:\'.';
	Strings.STS.L_SaveViewDlgTitle='Save this view as...';
	Strings.STS.L_DocMoveNoDocLibMessage='(No accessible document libraries)';
	Strings.STS.L_SPGanttDiscardChangesCancelButton='Cancel';
	Strings.STS.L_MergeCellAltKey_TEXT='true';
	Strings.STS.L_BoldAltKey_TEXT='false';
	Strings.STS.L_DMY_DOW_DATE_Text='^4 ^1 ^2, ^3';
	Strings.STS.L_DarkBlue_TEXT='DarkBlue';
	Strings.STS.L_Plum_TEXT='Plum';
	Strings.STS.L_Olive_TEXT='Olive';
	Strings.STS.L_rgMonths8_Text='September';
	Strings.STS.L_AccRqCllUtCrtd='Requested on';
	Strings.STS.L_FollowingPersonalSiteNotFoundError_ButtonText='Get started';
	Strings.STS.L_DETACHEDUNLINKEDSINGLE_Text='This meeting date is no longer linked to the associated meeting in your calendar and scheduling program. To specify what you want to do with the information in the workspace, do the following: In the Meeting Series pane, point to the meeting date, and in the drop-down list, click Keep, Delete, or Move.';
	Strings.STS.L_DocMoveDestinationHelp='No available destination document libraries for selection. You can enter a SharePoint site URL and click the browse button to get your destination document libraries and folders.';
	Strings.STS.L_DiscardCheckou_Text='Discard Check Out';
	Strings.STS.L_FollowNotificationText_Person='Now following this person';
	Strings.STS.L_FillInChoiceDropdownTitle='^1: Choose Option';
	Strings.STS.L_DateOrderMonth_Text='M';
	Strings.STS.L_OrderedListToolTip_TEXT='Numbered List (Ctrl+Shift+E)';
	Strings.STS.L_UnknownProtocolUrlError_Text='Hyperlinks must begin with http://, https://, mailto:, news:, ftp://, file://, /, # or \\\\. Check the address and try again.';
	Strings.STS.L_DocMoveDialogCancel='Cancel';
	Strings.STS.L_CheckMarkNotComplete_Tooltip='Mark task complete.';
	Strings.STS.L_Sharing_ManageLink_ErrorTitle='Couldn\'t remove the link';
	Strings.STS.L_SharingNotificationExternalUsers='Shared with external users';
	Strings.STS.main_css='This form was customized and attachments will not work correctly because the HTML \'span\' element does not contain an \'id\' attribute named \'part1.\'';
	Strings.STS.L_Profile_Section_Name_Format='{0}. {1}';
	Strings.STS.L_rgDOWLong2_Text='Tuesday';
	Strings.STS.L_LightYellowLong_TEXT='Light Yellow';
	Strings.STS.L_NoUploadPermission='The documents cannot be uploaded because different permissions are needed. Request the necessary permissions.';
	Strings.STS.L_ItalicShiftKey_TEXT='false';
	Strings.STS.L_Blue_TEXT='Blue';
	Strings.STS.L_ToolPartExpandToolTip_TXT='Expand Toolpart: %0';
	Strings.STS.L_DGpreview_Accent2='Accent 2';
	Strings.STS.L_TimelineErrorInvalidElementData='Invalid timeline element data.';
	Strings.STS.L_PaleVioletRed_TEXT='PaleVioletRed';
	Strings.STS.L_MediumPurple_TEXT='MediumPurple';
	Strings.STS.L_Whereabouts_OOF_Text='OOF';
	Strings.STS.L_Pink_TEXT='Pink';
	Strings.STS.L_OrderedListKey_TEXT='E';
	Strings.STS.L_Pattern_Text='Pattern';
	Strings.STS.L_FollowingPersonalSiteNotFoundError_Text='To follow documents or sites, we need to get a couple of things set up. This can take a few minutes to complete, and once it\'s done, you\'ll need to come back to this site and try following again.';
	Strings.STS.L_NoQuestion_Text='The survey contains no questions.';
	Strings.STS.L_NewFormLibTb2_Text='This feature requires Microsoft Internet Explorer 7.0 or later and a Microsoft SharePoint Foundation-compatible XML editor such as Microsoft InfoPath.';
	Strings.STS.L_AccReqResendingInvSuccess='Invitation resent';
	Strings.STS.L_FillInChoiceFillInLabel='^1: Specify your own value:';
	Strings.STS.L_MyDocsSharedWithMeAuthorSharedWithOthersN='^1 others';
	Strings.STS.L_InsertColumnRightLabel_TEXT='Insert Column Right (Ctrl+Alt+Right)';
	Strings.STS.L_WeeklyDayChoiceDisplay_Text='the day(s) of the week on which this event occurs';
	Strings.STS.L_SPBestResponseCount='{0} best reply(s)';
	Strings.STS.L_DGpreview_CATable_Author1='Pending Review';
	Strings.STS.L_SkyBlue_TEXT='SkyBlue';
	Strings.STS.L_Weekly_Text='Recur every ^1 week(s) on:^2';
	Strings.STS.L_DATE1DATE2_Text='^1 - ^2';
	Strings.STS.L_RoamingOffice_AppNameSPD='SharePoint Designer';
	Strings.STS.L_DarkGray_TEXT='DarkGray';
	Strings.STS.L_MYDATE_Text='^1 ^2';
	Strings.STS.L_LemonChiffon_TEXT='LemonChiffon';
	Strings.STS.L_DevDashAnimation_Stddev='Standard Dev';
	Strings.STS.L_ShareApp_Text='Share';
	Strings.STS.L_IMNIdle_OOF_Text='May be away (OOF)';
	Strings.STS.L_rgDOW0_Text='Sun';
	Strings.STS.L_NewDocLibTb2_Text='\'New Document\' requires a Microsoft SharePoint Foundation-compatible application and web browser. To add a document to this document library, click the \'Upload Document\' button.';
	Strings.STS.L_SelectBackColorAltKey_TEXT='false';
	Strings.STS.L_NewFormLibTb4_Text='Select the document(s) you want to merge, and then click \'Merge Selected Documents\' on the toolbar.';
	Strings.STS.L_UrlFieldDescriptionTitle='Description';
	Strings.STS.L_rgMonths2_Text='March';
	Strings.STS.L_InvalidPageUrl_Text='Invalid page URL: ';
	Strings.STS.L_DocMoveDefaultMoveErrorMessage='Move destination does not exist. Please select or enter an existing document library or folder URL.';
	Strings.STS.L_UnderlineAltKey_TEXT='false';
	Strings.STS.L_FeedbackNotAvailable='Not Available';
	Strings.STS.L_MyDocsLwVersionDialogRestoreButtonCaption='Restore';
	Strings.STS.L_DETACHEDCANCELLEDEXCEPT_Text='This meeting date was canceled from your calendar and scheduling program. To specify what you want to do with the associated information in the workspace, do the following: In the Meeting Series pane, point to the meeting date, and in the drop-down list, click Keep, Delete, or Move.';
	Strings.STS.L_DisabledMenuItem='Disabled';
	Strings.STS.L_Whereabouts_ViewWA_Text='View Whereabouts';
	Strings.STS.L_Brown_TEXT='Brown';
	Strings.STS.L_CurrentUICulture_Name='en-us';
	Strings.STS.L_ConflictMergeFolderButton='Merge Folders';
	Strings.STS.L_LightSalmon_TEXT='LightSalmon';
	Strings.STS.L_ExistingCopies_Text='Existing Copies';
	Strings.STS.L_ConfirmRecycle_TXT='Are you sure you want to send this attachment to the site Recycle Bin?';
	Strings.STS.L_DocMoveDialogMoveKey='m';
	Strings.STS.L_DocMoveDialogSelectKey='s';
	Strings.STS.L_DocMoveDialogTitleJustSecond='Just a second...';
	Strings.STS.L_Bisque_TEXT='Bisque';
	Strings.STS.L_rgDOWDP3_Text='W';
	Strings.STS.L_FilterMode_Text='Show Filter Choices';
	Strings.STS.L_TransparentLiteral_TXT='Transparent';
	Strings.STS.L_Gainsboro_TEXT='Gainsboro';
	Strings.STS.L_OldestOnTop_Text='Oldest on Top';
	Strings.STS.L_FollowLimitReachedDialog_Title='You\'ve reached the limit';
	Strings.STS.L_Picture_Of_Text='Picture {0} of {1}';
	Strings.STS.L_BulkSelection_TooManyItems='You cannot select more than 100 items at once.';
	Strings.STS.L_DocMoveCancelMoveMessage='If you stop your current move, some documents will not be moved but will remain in their current location. Documents already moved can be found at the destination location.';
	Strings.STS.L_Red_TEXT='Red';
	Strings.STS.L_SPGanttDisposeDialogDiscardButton='Don\'t save my changes';
	Strings.STS.L_MyDocsShowMoreSharedDocuments='Show more documents shared with ^1';
	Strings.STS.L_AccReqApprovalFail='Request approval failed';
	Strings.STS.L_DeleteColumnToolTip_TEXT='Delete Column (Ctrl+Alt+BACKSLASH)';
	Strings.STS.L_SplitCellKey_TEXT='S';
	Strings.STS.L_AppInstalling='Installing';
	Strings.STS.L_ProfileSettingSave_Text='Your changes have been saved, but they may take some time to take effect. Don\'t worry if you don\'t see them right away.';
	Strings.STS.L_SPDiscReportAbuseDialogPost='{0}\'s Post';
	Strings.STS.L_GoldenRod_TEXT='GoldenRod';
	Strings.STS.L_DocMoveDialogTitleCancelMove='Cancel Move?';
	Strings.STS.L_ConfirmDelete_TXT='Are you sure you want to delete this attachment?';
	Strings.STS.AccReqList_PendReqView='Pending requests';
	Strings.STS.L_rgDOW5_Text='Fri';
	Strings.STS.L_DarkTurquoise_TEXT='DarkTurquoise';
	Strings.STS.L_DesignBuilderToolsLayoutAlt='Site layouts';
	Strings.STS.L_AccRqCllNwMsg='Sending new comment';
	Strings.STS.L_DocMoveDialogMerge='Merge folders';
	Strings.STS.L_ADDNEWDOC='Drag files here to add.';
	Strings.STS.L_Daily_Text='Recur every ^1 day(s)';
	Strings.STS.L_DocMoveLargeAmountDocsMessage='You have selected to move over ^1 items. This may take some time. Would you like to continue the move?';
	Strings.STS.L_FollowingGenericError_Title='Something went wrong';
	Strings.STS.L_DismissButtonCaption='Dismiss';
	Strings.STS.L_AsyncDeltaManager_ScriptLoadFailed='The script \'{0}\' failed to load';
	Strings.STS.L_NoInitArgs_ERR='Cannot create or modify the connection. One of the Web Parts does not have any data fields.';
	Strings.STS.L_RoamingOffice_AppNameLync='Lync';
	Strings.STS.L_AccRqSPGrp='Groups';
	Strings.STS.L_ResetPartPersonalizationDialog_TXT='Resetting this Web Part will cause you to lose any changes you made.  Are you sure you want to do this? To reset this Web Part, click OK. To keep your changes, click Cancel.';
	Strings.STS.L_SPClientPeoplePickerDefaultHelpText='Enter a name or email address...';
	Strings.STS.L_InsertTableAltKey_TEXT='true';
	Strings.STS.L_FileName_Text='Name';
	Strings.STS.L_InvalidRange_Text='^1 must be between ^2 and ^3.';
	Strings.STS.L_DocMoveFollowDocErrorTitle='Error occurred in following the document';
	Strings.STS.L_SPReplyCount='{0} reply(s)';
	Strings.STS.L_CommaSeparatorWithSpace=', ';
	Strings.STS.L_SaveDirtyParts_TXT='Changes have been made to the contents of one or more Web Parts on this page. To save the changes, press OK.  To discard the changes, press Cancel.';
	Strings.STS.L_OldLace_TEXT='OldLace';
	Strings.STS.L_OliveGreen_TEXT='Olive Green';
	Strings.STS.L_IMNBlocked_Text='Blocked';
	Strings.STS.L_Gray_TEXT='Gray';
	Strings.STS.L_CalendarUmAlQura_Text=' using Umm al-Qura Calendar';
	Strings.STS.L_DocMoveDocMoveFinished='Move finished.';
	Strings.STS.L_SPGanttDiscardChangesDialogMessage='Would you like to discard your changes to this row?';
	Strings.STS.L_IMNAway_OOF_Text='Away (OOF)';
	Strings.STS.L_MyDocsSharedWithMeAuthorSharedWithOthers='^1 shared this document with you and ^2.';
	Strings.STS.L_EditDocumentRuntimeError_Text='We\u2019re sorry, we couldn\u2019t find a program to open this document.';
	Strings.STS.L_RoamingOffice_AppNameMoorea='Moorea';
	Strings.STS.L_Aquamarine_TEXT='Aquamarine';
	Strings.STS.L_Hours_Text='Hours';
	Strings.STS.L_DesignBuilderToolsImagePickerImageAltText='Preview of page background image';
	Strings.STS.L_ThirdWeek_Text='third';
	Strings.STS.L_SharedWithDialogOtherPermission='Other';
	Strings.STS.L_CantDisplayAccessRequestPermissionField='Can\'t display permissions in this view.';
	Strings.STS.L_SharedWithDialogApply='Save changes';
	Strings.STS.L_Purple_TEXT='Purple';
	Strings.STS.L_DateRangeEndOccurrencesValue_Text='10';
	Strings.STS.L_AccReqCtlErr0='You must limit your message to 256 characters.';
	Strings.STS.L_MultipleLinkDeleteMsg='Remove this link and all links under it ?';
	Strings.STS.L_CreateView='Create a new view';
	Strings.STS.L_ViewPermission='Can view';
	Strings.STS.L_Send_Text='Send To';
	Strings.STS.L_CalloutEditAction='Edit';
	Strings.STS.L_CalloutLastEdited='Last edited by ^1: ^2';
	Strings.STS.L_ServerBusyError='The server is busy.  Please try again later.';
	Strings.STS.L_DevDashAnimation_Avg='Average';
	Strings.STS.L_DGpreview_QL1='First menu item';
	Strings.STS.L_FollowedItemNotFound_Title='We hit a snag';
	Strings.STS.L_DGpreview_CARight_7='Team Calendar';
	Strings.STS.L_SharedWithDialogViewAccessRequests='View requests';
	Strings.STS.L_ModifyView='Modify this view';
	Strings.STS.L_SubmitFileMoveWarning_Text='Are you sure you want to move this document to ^1?';
	Strings.STS.L_CannotEditPropertyCheckout_Text='You cannot edit the properties of this document while it is checked out or locked for editing by another user.';
	Strings.STS.L_PaleGoldenRod_TEXT='PaleGoldenRod';
	Strings.STS.L_Friday_Text='Friday';
	Strings.STS.L_InsertTableShiftKey_TEXT='false';
	Strings.STS.L_AccReqSendingApproval='Sending approval';
	Strings.STS.L_RecycleMultipleItems_Text='Are you sure you want to send these items to the site Recycle Bin?';
	Strings.STS.L_DocMoveFileConflictDialogMessage='A file named ^1 already exists. What would you like to do?';
	Strings.STS.L_StopFollowingCommand='Stop following';
	Strings.STS.L_DateOrderDesc_Text='Enter date in ^2 format^1.';
	Strings.STS.L_InsertCellLeftAltKey_TEXT='true';
	Strings.STS.L_Versions_Text='Version History';
	Strings.STS.L_MyDocsLwVersionDialogDescription='Undo changes made by others and restore the copy with ^1my last edits^2.';
	Strings.STS.L_InsertColumnRightKeyCode_TEXT='39';
	Strings.STS.L_Linen_TEXT='Linen';
	Strings.STS.L_SPGanttDiscardChangesDialogTitle='Discard changes?';
	Strings.STS.L_SelectAll_Text='Select|Unselect all';
	Strings.STS.L_ErrorDialog_Title='Sorry, something went wrong';
	Strings.STS.L_DocMoveLinkToMoveDestination='Click this link to go to the move destination.';
	Strings.STS.L_SeaShell_TEXT='SeaShell';
	Strings.STS.L_DocMoveErrorNotDocLibraryMessage='The following items were not moved because the source or destination was not a document library:';
	Strings.STS.L_LightGoldenRodYellow_TEXT='LightGoldenRodYellow';
	Strings.STS.L_rgMonths3_Text='April';
	Strings.STS.L_AccReqRevokingInvSuccess='Invitation withdrawn';
	Strings.STS.L_Monthly1DayDisplay_Text='The date each month that this event occurs';
	Strings.STS.L_InsertCellRightShiftKey_TEXT='false';
	Strings.STS.L_ShowTZ_Text='Show time zone';
	Strings.STS.L_SelectForeColorShiftKey_TEXT='true';
	Strings.STS.L_DarkRed_TEXT='DarkRed';
	Strings.STS.L_DesignBuilderToolsImagePickerNoDragDropPlaceholderText='Click change to add an image';
	Strings.STS.L_MediumSpringGreen_TEXT='MediumSpringGreen';
	Strings.STS.L_AsyncDeltaManager_ServerError='An error occurred while processing the request on the server. The status code returned from the server was: {0}';
	Strings.STS.L_DeleteTableElementToolTip_TEXT='Delete Table Element';
	Strings.STS.L_DocMoveDialogSkip='Skip it';
	Strings.STS.L_ConflictFolderMessage='A folder named \'{0}\' already exists in this library. What would you like to do?';
	Strings.STS.L_SPClientPeoplePickerMultipleUserError='You can only enter one name.';
	Strings.STS.L_Workflows_Text='Workflows';
	Strings.STS.L_Choose_Text='Choose Option';
	Strings.STS.L_FloralWhite_TEXT='FloralWhite';
	Strings.STS.L_FollowingCannotCreatePersonalSiteError_Title='Sorry, you\'re not set up to follow';
	Strings.STS.L_Version_RecycleAll_Confirm_Text='Are you sure you want to send all previous versions associated with this file to the site Recycle Bin?';
	Strings.STS.L_InvalidDate_Text='^1 is not a valid date.';
	Strings.STS.L_DocMoveVerifyingMoveDestination='Verifying move destination... ';
	Strings.STS.L_AppCanceling='Cancelling';
	Strings.STS.L_DocMoveDialogReplace='Replace it';
	Strings.STS.L_rgDOWDP6_Text='S';
	Strings.STS.L_DETACHEDSINGLEEXCEPT_Text='This meeting date is no longer associated with a meeting in your calendar and scheduling program. Either this meeting date was canceled, or the link to the workspace was removed from the scheduled meeting.';
	Strings.STS.L_AutohosteAppLicensing_SeatsAvailable='{0} out of {1} app hosting licenses used';
	Strings.STS.L_ShowLinkTooltip='Show this link in navigation';
	Strings.STS.L_TooManyDefers_Text='Too many arguments passed to DeferCall';
	Strings.STS.L_DocMoveResultAllCancelledMessage='Move cancelled. No items were moved.';
	Strings.STS.L_DocumentsFollowLimitReachedDialog_Button='Take me to my followed documents';
	Strings.STS.L_SPClientPeoplePickerNoPermission='The control is not available because you do not have the correct permissions.';
	Strings.STS.L_OutdentKey_TEXT='M';
	Strings.STS.L_DETACHEDUNLINKEDSERIES_Text='This meeting series is no longer linked to the associated meeting series in your calendar and scheduling program. You can keep or delete the workspace. If you keep the workspace, you will not be able to link it to another scheduled meeting.';
	Strings.STS.L_TimelineErrorInvalidFormattingData='Invalid timeline formatting data.';
	Strings.STS.L_AddColumnDefaultName_PersonOrGroup='Person or Group';
	Strings.STS.L_NavEditAsyncOperationFailedMsg='This operation has timed out. Please try again.';
	Strings.STS.L_NewFormLibTb3_Text='The document(s) could not be merged.\nThe required application may not be installed properly, or the template for this document library cannot be opened.\n\nPlease try the following:\n1. Check the General Settings for this document library for the name of the template, and install the application necessary for opening the template. If the application was set to install on first use, run the application and then try creating a new document again.\n\n2.  If you have permission to modify this document library, go to General Settings for the library and configure a new template.';
	Strings.STS.L_UrlFieldTypeDescription='Type the description:';
	Strings.STS.L_OutdentAltKey_TEXT='false';
	Strings.STS.L_IMNBusy_OOF_Text='Busy (OOF)';
	Strings.STS.L_MergeCellKey_TEXT='M';
	Strings.STS.L_DragDropSnagErrorTitle='We\'ve hit a snag...';
	Strings.STS.L_PromoSites_NewLinkCommand='Add a promoted site';
	Strings.STS.L_DocMoveProgressStatus='Moved ^1 of ^2';
	Strings.STS.L_Geolocation_setLocation='{0}Specify location{1} Or {2}Use my location{3}';
	Strings.STS.L_Sharing_ManageLink_ConfirmButtonCancel='Keep It';
	Strings.STS.L_NewFormClickOnce1_Text='Create a new folder';
	Strings.STS.L_NoWSSClient_Text='To export a list, you must have a Microsoft SharePoint Foundation-compatible application and Microsoft Internet Explorer 7.0 or greater.';
	Strings.STS.L_DesignBuilderToolsFontSchemeToolTipTitle='Font Scheme';
	Strings.STS.L_PublishBack_Text='Publish to Source Location';
	Strings.STS.L_EditLinkTooltip='Edit a link';
	Strings.STS.L_DatePickerAlt_Text='Choose date from calendar';
	Strings.STS.L_DocMoveCancelMove='Cancel move.';
	Strings.STS.L_TasksListShortcut_MoveDown='Move Down - Alt+Shift+Down';
	Strings.STS.L_DGpreview_CATable_Doc3='Third Document Title';
	Strings.STS.L_RecurPatternYearly_Text='Yearly';
	Strings.STS.L_FireBrick_TEXT='FireBrick';
	Strings.STS.L_Version_Restore_Confirm_Text='You are about to replace the current version with the selected version.';
	Strings.STS.L_Sunday_Text='Sunday';
	Strings.STS.L_DragDropClientRequestError='Error with request to the server: {0},  StackTrace: {1}';
	Strings.STS.L_StrAM_Text='am';
	Strings.STS.L_Navy_TEXT='Navy';
	Strings.STS.L_DesignBuilderToolsFontLabel='Fonts';
	Strings.STS.L_DocMoveFollowDocErrorMessage='The document was moved, but will not be in your followed documents list.';
	Strings.STS.L_NotSortable_Text='This column type cannot be sorted';
	Strings.STS.L_LastWeek_Text='last';
	Strings.STS.L_CalendarHijri_Text=' using Hijri Calendar';
	Strings.STS.L_GotoFolder_Text='Click here to go to the folder.';
	Strings.STS.L_Err_Position_Unavailable='Unable to locate your position.';
	Strings.STS.L_TaskNotifyFirstDateHeader='The first one is on us';
	Strings.STS.L_FollowingCannotCreatePersonalSiteError_Text='Unfortunately, it looks like your account hasn\'t been set up to follow documents or sites.';
	Strings.STS.L_Whereabouts_PhoneCallMemo_Text='Memo';
	Strings.STS.L_RecurPatternMonthly_Text='Monthly';
	Strings.STS.L_MyDocsCalloutUndoChanges='Undo changes';
	Strings.STS.L_AccReqApprovalSuccess='Request approved';
	Strings.STS.L_rgMonths11_Text='December';
	Strings.STS.L_InsertCellLabel_TEXT='';
	Strings.STS.L_IndentKey_TEXT='M';
	Strings.STS.L_SlideShowStopButton_Text='Stop';
	Strings.STS.L_FollowNotificationText_Document='Now following this document';
	Strings.STS.L_Font3_TEXT='Tahoma';
	Strings.STS.L_LightPink_TEXT='LightPink';
	Strings.STS.L_Beige_TEXT='Beige';
	Strings.STS.L_MyDocsLwVersionDialogTitle='Undo Document Changes';
	Strings.STS.L_Monthly1DayValue_Text='1';
	Strings.STS.L_Reply_Text='Reply';
	Strings.STS.L_ViewVersion_Text='View';
	Strings.STS.L_DocMoveResultMovedNoneMessage='No items were moved.';
	Strings.STS.L_FailedMessageWithCheckout='Upload completed with {2} checked out ({0} added, {1} failed)';
	Strings.STS.L_DarkTeal_TEXT='Dark Teal';
	Strings.STS.L_DocMoveDialogCancelKey='a';
	Strings.STS.L_AppUpgrading='Upgrading';
	Strings.STS.L_SharedWithDialogManyMessage='There are more people than we can show here. If you are an administrator, you can see all of them on the advanced permissions page.';
	Strings.STS.L_InsertRowToolTip_TEXT='Insert Row';
	Strings.STS.L_STSDelConfirm1_Text='Are you sure you want to permanently delete this folder and all its contents?';
	Strings.STS.L_RTLToolTip_TEXT='Right-to-Left (Ctrl+Shift+<)';
	Strings.STS.L_DGpreview_CARight_5='Project';
	Strings.STS.L_SPClientMaxLengthFieldError='The value of this field may not contain more than ^1 characters';
	Strings.STS.L_SaveFailedMsg='Save failed.';
	Strings.STS.L_ViewOnMap='View On Bing Maps';
	Strings.STS.L_AliceBlue_TEXT='AliceBlue';
	Strings.STS.L_Mybrary_Branding_TextWithName2='{0} @ {1}';
	Strings.STS.L_DocMoveDialogCancelMove='Cancel move';
	Strings.STS.L_InsertTableToolTip_TEXT='Open a new window to Insert Table (Ctrl+Alt+T)';
	Strings.STS.L_DeleteResponse_Text='Delete Response';
	Strings.STS.L_LightBlue_TEXT='LightBlue';
	Strings.STS.L_FollowingGenericError_Site_Text='Sorry, we couldn\'t follow the site.';
	Strings.STS.L_Lookup_AutoIndexForRelationships_Confirm_Text='To enable relationship behaviors on this column, it needs to be indexed. Do you want this column to be indexed?';
	Strings.STS.L_DarkGoldenRod_TEXT='DarkGoldenRod';
	Strings.STS.L_InvalidMerge_TEXT='Cannot merge cell because the adjacent cells do not have the same height or width of the selected cell. Change the size of the adjacent cells to match the selected cell before attempting to merge the cell again.';
	Strings.STS.L_AutoHostedLicensing_BuyMoreInBeta='We\'re sorry, we can\'t make any more app hosting licenses available. While this feature is in Beta we recommend using autohosted apps for evaluation and testing. Once this feature is generally available, you can buy as many hosting licenses as you need.{0}Click {1}here{2} to read more about Beta limitations of this feature.';
	Strings.STS.L_IMNInPresentation_Text='Presenting';
	Strings.STS.L_ModerateItem_Text='Approve/Reject';
	Strings.STS.L_FollowNotificationText_Site='Now following this site';
	Strings.STS.L_STSRecycleConfirm1_Text='Are you sure you want to send this folder and all its contents to the site Recycle Bin?';
	Strings.STS.L_SPGanttDisposeErrorDialogBody='You need to fix some problems before we can save your changes.';
	Strings.STS.L_DGpreview_CATable_H3='Status';
	Strings.STS.L_LightRed_TEXT='LightRed';
	Strings.STS.L_DGpreview_QL3='Third menu item';
	Strings.STS.L_JustifyCenterToolTip_TEXT='Center (Ctrl+E)';
	Strings.STS.L_InsertImageToolTip_TEXT='Open a new window to Insert Image (Ctrl+Shift+G)';
	Strings.STS.L_SortNotAllowed='These results are shown sorted by relevance. To sort or filter, first cancel the search.';
	Strings.STS.L_DGpreview_QLADD='Command link';
	Strings.STS.L_JustifyRightAltKey_TEXT='false';
	Strings.STS.L_AccRqCllUtActRvk='Withdraw';
	Strings.STS.L_SaveViewOverwriteDlgMsg='Your changes will update the existing view \'^1\'.';
	Strings.STS.L_SandyBrown_TEXT='SandyBrown';
	Strings.STS.L_Font7_TEXT='';
	Strings.STS.L_SharedWithGuest='Open to anyone with ^1a guest link^2';
	Strings.STS.L_Gray50_TEXT='Gray 50%';
	Strings.STS.L_SpecifyYourOwn_Text='Specify your own value:';
	Strings.STS.L_DocMoveErrorInvalidUrlMessage='The following items were not moved because of an invalid URL:';
	Strings.STS.L_DocMoveInvalidDestinationError403Forbidden='Unfortunately the destination is blocked. Please contact your administrator if the problem persists.';
	Strings.STS.L_Timeline_PleaseAddDates='Make sure your tasks have dates to add them to the timeline';
	Strings.STS.L_TasksListShortcut_Outdent='Outdent - Alt+Shift+Left';
	Strings.STS.L_Whereabouts_EditWA_Text='Edit Whereabouts';
	Strings.STS.L_AccRqCllUtActApprv='Approve';
	Strings.STS.L_rgMonths6_Text='July';
	Strings.STS.L_PromoSites_StopAdminModeCommand='Click on a tile below to edit. Once you are done, {0}click here{1} to stop editing.';
	Strings.STS.L_DeleteLinkTooltip='Remove this link from navigation';
	Strings.STS.L_DGpreview_Accent4='Accent 4';
	Strings.STS.L_FailedMessage='Upload completed ({0} added, {1} failed)';
	Strings.STS.L_FailedMessageLinkWithCheckout='Upload completed with {4} checked out ({0} added, {1} {2}failed{3})';
	Strings.STS.L_BlanksOnTop_Text='Blanks on Top';
	Strings.STS.L_DefaultDropMessage='Drop link here';
	Strings.STS.L_FieldRequired_Text='You must specify a non-blank value for ^1.';
	Strings.STS.L_Teal_TEXT='Teal';
	Strings.STS.L_Azure_TEXT='Azure';
	Strings.STS.L_UnderlineToolTip_TEXT='Underline (Ctrl+U)';
	Strings.STS.L_LinkToAfter_Text='';
	Strings.STS.L_RequiredField_Tooltip='This is a required field.';
	Strings.STS.L_Coral_TEXT='Coral';
	Strings.STS.L_DarkMagenta_TEXT='DarkMagenta';
	Strings.STS.L_PromoSites_DeleteButton='Remove link';
	Strings.STS.L_SplitCellAltKey_TEXT='true';
	Strings.STS.L_AccessibleMenu_Text='Menu';
	Strings.STS.L_DocMoveUnableToCompleteNotification='Move ended due to errors.';
	Strings.STS.L_ValueRequired_Text='You must specify a value for ^1.';
	Strings.STS.L_Descending_Text='Descending';
	Strings.STS.L_FillChoice_TXT='Choice Drop Down';
	Strings.STS.L_NewDocLibTb1_Text='The document could not be created. \nThe required application may not be installed properly, or the template for this document library cannot be opened.\n\nPlease try the following:\n1. Check the General Settings for this document library for the name of the template, and install the application necessary for opening the template. If the application was set to install on first use, run the application and then try creating a new document again.\n\n2.  If you have permission to modify this document library, go to General Settings for the library and configure a new template.';
	Strings.STS.L_SharedWithDialogInvitePeople='Invite people';
	Strings.STS.L_AutoHostedAppLicensesNotApplicable='N/A';
	Strings.STS.L_EmptyFileError='This file is empty and needs content to be uploaded.';
	Strings.STS.L_RangeTypeCount_Text='End after: ';
	Strings.STS.L_EditResponse_Text='Edit Response';
	Strings.STS.L_AccRqMsgGtFl='Sorry, we can\'t show past messages right now.';
	Strings.STS.L_EditProperties_Text='Edit Properties';
	Strings.STS.L_ExportDBFail_Text='Export to database failed. To export a list, you must have a Microsoft SharePoint Foundation-compatible application.';
	Strings.STS.L_AlreadyFollowingNotificationText_Document='You\'re already following this document.';
	Strings.STS.L_ExceedSelectionLimit_Text='You have selected the maximum number of items.  Switch to the Selected Pictures view to review your selections.';
	Strings.STS.L_LightSteelBlue_TEXT='LightSteelBlue';
	Strings.STS.L_NotOurView_Text='This operation cannot be completed within current view. Please select another view and try again.';
	Strings.STS.L_DevDashAnimation_AllFrames='All Frames:';
	Strings.STS.L_Keep_Text='Keep';
	Strings.STS.L_NavEditErrorDialogTitle='Something went wrong';
	Strings.STS.L_MyDocsDateHeaderThisWeek='This Week';
	Strings.STS.L_EditIn_Text='Edit in ^1';
	Strings.STS.L_Green_TEXT='Green';
	Strings.STS.L_DragDropInvalidFile='Folders and invalid files can\'t be dragged to upload.';
	Strings.STS.L_StopFollowingTitle='Stop Following: {0}';
	Strings.STS.L_DesignBuilderToolsLayoutLabel='Site layout';
	Strings.STS.L_Version_deny_Confirm_Text='Are you sure you want to deny this version of the document?';
	Strings.STS.L_PromoSites_SaveButton='Save changes';
	Strings.STS.L_SmallestOnTop_Text='Smallest on Top';
	Strings.STS.L_rgMonths7_Text='August';
	Strings.STS.L_Version_NoDelete_Current_ERR='You cannot delete the current checked in version, major version, or approved version.';
	Strings.STS.L_CreateLinkKey_TEXT='K';
	Strings.STS.L_MonitorAppActionText='View Logs';
	Strings.STS.L_RichTextHelpLink='Click for help about adding basic HTML formatting.';
	Strings.STS.L_User_Delete_Confirm_Text='You are about to delete this user.';
	Strings.STS.L_RoamingOffice_AppNameProject='Project';
	Strings.STS.L_UnorderedListAltKey_TEXT='false';
	Strings.STS.L_DocMoveSelectMoveDestination='Choose a move destination (or enter a SharePoint site URL and click Browse for new destinations):';
	Strings.STS.L_UploadMaxFileSize='Files need to be less than {0} megabyte(s).';
	Strings.STS.L_StssyncTooLong_Text='The title of the site or list is too long. Shorten the title and try again.';
	Strings.STS.L_UploadDialogTitle='Drag and Drop Upload';
	Strings.STS.L_SharingNotificationAccessRequestsMode='Sharing request sent to site owner for approval';
	Strings.STS.L_DETACHEDNONGREGORIANCAL_Text='This meeting was created using a calendar and scheduling program that only supports series updates to the Meeting Workspace. Changes you make to individual occurrences of meetings in that program will not appear in the workspace.';
	Strings.STS.L_DialogFollowButton_Text='Follow';
	Strings.STS.L_EditItem_Text='Edit Item';
	Strings.STS.L_WeeklyRecurDisplay_Text='The number of weeks between recurrences of this event';
	Strings.STS.L_DragDropErrorTitle='Error';
	Strings.STS.L_DocMoveErrorInvalidArgMessage='The following items were not moved because source or destination were invalid:';
	Strings.STS.L_AccReqRevokingInvFail='Withdrawing invitation failed';
	Strings.STS.L_DGpreview_CATable_Doc2='Second Document Title';
	Strings.STS.L_Err_Timeout='Unable to locate your position. The call to Location Services timed out.';
	Strings.STS.L_rgDOWDP4_Text='Th';
	Strings.STS.L_DeactivateSolution_Text='Deactivate';
	Strings.STS.L_Geolocation_BingMapsUserWarning='Location data will be sent to Bing Maps. {0}Learn More{1}';
	Strings.STS.L_MonthFrequency_Text='1';
	Strings.STS.L_FollowingGenericError_Document_Text='Sorry, we couldn\'t follow the document.';
	Strings.STS.L_CalloutClose='Close';
	Strings.STS.L_LTRToolTip_TEXT='Left-to-Right (Ctrl+Shift+>)';
	Strings.STS.L_NewFormLibTb5_Text='Select the document(s) you want to relink, and then click the \'Relink\' button on the toolbar.';
	Strings.STS.L_HideLinkTooltip='Hide this link from navigation';
	Strings.STS.L_EndDateRange_Text='^1 occurrence(s)';
	Strings.STS.L_WarnkOnce_text='This item contains a custom recurrence pattern.  If you save your changes you will not be able to revert to the previous pattern.';
	Strings.STS.L_MyDocsSharedWithMeAuthorSharedWithOneOther='1 other';
	Strings.STS.L_NoVoteAllowed_Text='You are not allowed to respond again to this survey.';
	Strings.STS.L_ImageSize_Text='Picture Size';
	Strings.STS.L_IMNAway_Text='Away';
	Strings.STS.L_AntiqueWhite_TEXT='AntiqueWhite';
	Strings.STS.L_JustifyRightToolTip_TEXT='Align Right (Ctrl+R)';
	Strings.STS.L_AutohosteAppLicensing_SeatsRequired='{0} more app hosting licenses needed';
	Strings.STS.L_DocMoveResultMessage='^1 of ^2 moved.';
	Strings.STS.L_LookupFieldPickerAltText='Display lookup values';
	Strings.STS.L_DailyDisplay_Text='The number of days between recurrences of this event';
	Strings.STS.L_DeleteColumnAltKey_TEXT='true';
	Strings.STS.L_STSDelConfirm_Text='Are you sure you want to permanently delete the item(s)?';
	Strings.STS.L_AsyncDeltaManager_ParseError='Invalid server response.';
	Strings.STS.L_TaskNotifyFirstDateLineOne='We added your task to the timeline. You can add other tasks through this menu.';
	Strings.STS.L_SharingNotificationPrefixText='Shared with: ^1';
	Strings.STS.L_SpringGreen_TEXT='SpringGreen';
	Strings.STS.L_MyDocsLwVersionDialogRevertToYourVersionWarning='Are you sure you want to replace the latest version? Press OK to continue.';
	Strings.STS.L_SelectFontNameKey_TEXT='F';
	Strings.STS.L_DiscardCheckoutConfirm='You are about to discard any changes made to the selected checked out file(s).';
	Strings.STS.L_DGpreview_Ribbon2='Tab 2';
	Strings.STS.L_CheckMarkNotCompleteNoPerms_Tooltip='This task is not complete.';
	Strings.STS.L_Tomato_TEXT='Tomato';
	Strings.STS.L_DMYDATE_Text='^1 ^2, ^3';
	Strings.STS.L_DarkKhaki_TEXT='DarkKhaki';
	Strings.STS.L_Description_Text='Description';
	Strings.STS.L_UnorderedListShiftKey_TEXT='true';
	Strings.STS.L_MergeCellToolTip_TEXT='Merge Cell (Ctrl+Alt+M)';
	Strings.STS.L_PaleGreen_TEXT='PaleGreen';
	Strings.STS.L_DGpreview_SiteTitle='Site Title';
	Strings.STS.L_RangeTypeEndDate_Text='End by: ';
	Strings.STS.L_UploadInProgressTitle='Upload in progress';
	Strings.STS.L_FollowSite='Follow sites to easily access them from the list of sites you\u2019re following.';
	Strings.STS.L_MyDocsCalloutMoveAction='Move';
	Strings.STS.L_rgDOWDP5_Text='F';
	Strings.STS.L_Black_TEXT='Black';
	Strings.STS.L_Sharing_External_Sharing_Warning='Files shared with external users may be accessible outside your country.';
	Strings.STS.L_NotAvailableOnWebPart_Text='This operation cannot be completed from a web part. Please go to the Picture Library and try again.';
	Strings.STS.L_Indigo_TEXT='Indigo';
	Strings.STS.L_SharingNotificationGuestLink='Shared using a guest link';
	Strings.STS.L_MDY_DOW_DATE_Text='^4 ^1 ^2, ^3';
	Strings.STS.L_Monthly2DayDisplay_Text='The day of the week on which this event occurs';
	Strings.STS.L_DGpreview_BrandString='Brand';
	Strings.STS.L_LightSlateGray_TEXT='LightSlateGray';
	Strings.STS.L_DeleteColumnKeyCode_TEXT='220';
	Strings.STS.L_DGpreview_SuiteLink1='First Item';
	Strings.STS.L_ConflictReplaceTitle='A file with the same name already exists';
	Strings.STS.L_PaleBlue_TEXT='Pale Blue';
	Strings.STS.L_LightCyan_TEXT='LightCyan';
	Strings.STS.L_TotalFileSizeLimitTitle='Upload too large';
	Strings.STS.L_SharedWithDialogUserInfoListFailure='Attempting to obtain Shared With list failed.';
	Strings.STS.L_DiagramLaunchFail_Text='Unable to create diagram.';
	Strings.STS.L_AutoHostedLicensing_BuyMoreInBetaTitle='Additional app hosting licenses are not available';
	Strings.STS.L_SubmitFileLinkWarning_Text='Are you sure you want to move this document to ^1? A link will be created to the destination document.';
	Strings.STS.L_AccReqSendingDenial='Declining request';
	Strings.STS.L_SelectForeColorAltKey_TEXT='false';
	Strings.STS.L_DownloadACopy_Text='Download a Copy';
	Strings.STS.L_SecondWeek_Text='second';
	Strings.STS.L_RoamingOffice_InstallExtensionDialogTitle='Waiting for you...';
	Strings.STS.L_DGpreview_CATable_H2='Modified';
	Strings.STS.L_AccRqWrnPerm='Please select a group or permission level to approve this request.';
	Strings.STS.L_DesignBuilderToolsImagePickerRemoveConfirm='Are you sure you want to remove the image?';
	Strings.STS.L_MyDocsDateHeaderTwoWeeksAgo='2 Weeks Ago';
	Strings.STS.L_FilterThrottled_Text='Cannot show the value of the filter. The field may not be filterable, or the number of items returned exceeds the list view threshold enforced by the administrator.';
	Strings.STS.L_IMNDoNotDisturb_Text='Do not disturb';
	Strings.STS.L_GroupingEnabled_MapView='This view has grouping enabled, so it cannot be displayed in a map view.';
	Strings.STS.L_FeedbackCalloutTitle='App Feedback';
	Strings.STS.L_TasksListShortcut_MoveUp='Move Up - Alt+Shift+Up';
	Strings.STS.L_DGpreview_Accent6='Accent 6';
	Strings.STS.L_HoneyDew_TEXT='HoneyDew';
	Strings.STS.L_Silver_TEXT='Silver';
	Strings.STS.L_Whereabouts_GoFromHome_Text='NC';
	Strings.STS.L_SlideShowPlayButton_Text='Play';
	Strings.STS.L_ExampleText_TEXT='Example Text';
	Strings.STS.L_Sharing_ManageLink_EditLabel='Edit';
	Strings.STS.L_OutdentShiftKey_TEXT='true';
	Strings.STS.L_SeaGreenLong_TEXT='Sea Green';
	Strings.STS.L_SaddleBrown_TEXT='SaddleBrown';
	Strings.STS.L_DocMoveEnterValidBrowseDestinationSite='Please enter a valid SharePoint site URL to browse destination document libraries.';
	Strings.STS.L_AccRqCllUtPst='Type your message here.';
	Strings.STS.L_DocMoveDialogYesKey='y';
	Strings.STS.L_AccessRequestStatusPending='Pending';
	Strings.STS.L_Open_Text='Open';
	Strings.STS.L_BlanchedAlmond_TEXT='BlanchedAlmond';
	Strings.STS.L_WebFoldersError_Text='Your client does not support opening this list with Windows Explorer.';
	Strings.STS.L_DateSeparatorEx_Text=' -\u200e ';
	Strings.STS.L_FirstWeek_Text='first';
	Strings.STS.L_Monthly1MonthDisplay_Text='The number of months between recurrences';
	Strings.STS.L_DocMoveDestinationFolders='Move destination folders for selection.';
	Strings.STS.L_LookupMultiFieldAddButtonText='Add';
	Strings.STS.L_MngPerms_Text='Manage Permissions';
	Strings.STS.L_DocMoveErrorInvalidSourceMessage='The following items were not moved because the source was invalid:';
	Strings.STS.L_DatePickerDateTimePleaseSelect='Please select a date.';
	Strings.STS.L_rgDOWDP0_Text='S';
	Strings.STS.L_AppModifiedByText='Last modified by {0}';
	Strings.STS.L_Font2_TEXT='Courier';
	Strings.STS.L_TimelineAddToTimeline='Add to Timeline';
	Strings.STS.L_ThumbnailStyle_Text=' Thumbnails';
	Strings.STS.L_DragDropUploadFolderError='There is error uploading content of this folder. See {0}details{1}';
	Strings.STS.L_MDYDATE_Text='^1 ^2, ^3';
	Strings.STS.L_DocMoveErrorBlockedFileTypeMessage='The following items were not moved because they are blocked file types at the destination:';
	Strings.STS.L_Wednesday_Text='Wednesday';
	Strings.STS.L_Sharing_ManageLink_ViewOnlyLabel='View Only';
	Strings.STS.L_FollowedSites_Title='Sites I\'m following';
	Strings.STS.L_AOnTop_Text='A on Top';
	Strings.STS.L_DesignBuilderToolsImagePickerFileTooLarge='Sorry, uploads for PNG and GIF type images are limited to 150KB. Got something smaller?';
	Strings.STS.L_DocMoveErrorDialogTitle='Error';
	Strings.STS.L_DGpreview_CATable_Author2='Pending Review';
	Strings.STS.L_ConfirmCheckout_Text='You must check out this item before making changes.  Do you want to check out this item now?';
	Strings.STS.L_DocMoveMoveStatus='Move status: ';
	Strings.STS.L_InsertCellRightKey_TEXT='R';
	Strings.STS.L_FileNameRequired_TXT='You must specify a non-blank value for File Name.';
	Strings.STS.L_ManageUsers_Text='Manage Users';
	Strings.STS.L_DocMoveDialogTitle='Move selected items';
	Strings.STS.L_JustifyLeftKey_TEXT='L';
	Strings.STS.L_DateTimeFieldDateHoursLabel='^1 Hours';
	Strings.STS.L_TimelineRemoveFromTimeline='Remove from Timeline';
	Strings.STS.L_DocMoveErrorFileTooLargeMessage='The following items were not moved because they are too large:';
	Strings.STS.L_DGpreview_Ribbon1='Tab 1';
	Strings.STS.L_URLDescriptionTooltip_Text='Description';
	Strings.STS.L_JustifyLeftShiftKey_TEXT='false';
	Strings.STS.L_NotFilterable_Text='This column type cannot be filtered';
	Strings.STS.L_DateRangeTypeDisplay_Text='The date this event ends';
	Strings.STS.L_DGpreview_CATable_Date1='10/21/2011';
	Strings.STS.L_Settings_Text='Settings';
	Strings.STS.L_DocMoveDialogSkipKey='s';
	Strings.STS.L_HtmlSourceKey_TEXT='S';
	Strings.STS.L_ToolPartCollapseToolTip_TXT='Collapse Toolpart: %0';
	Strings.STS.L_DesignBuilderToolsPaletteToolTipTitle='Colors';
	Strings.STS.L_LawnGreen_TEXT='LawnGreen';
	Strings.STS.L_DateTimeFieldDateLabel='^1 Date';
	Strings.STS.L_DocMoveErrorConflictsMessage='The following items were skipped during the move because of naming conflicts at the destination location:';
	Strings.STS.L_DarkSalmon_TEXT='DarkSalmon';
	Strings.STS.L_UserFieldRemoveText='Remove';
	Strings.STS.L_ErrorReadFileToUpload='Error reading file {0}: {1}';
	Strings.STS.L_UnPublishVersion_Text='Unpublish this version';
	Strings.STS.L_FourthWeek_Text='fourth';
	Strings.STS.L_SiteStorage_Text='Manage Site Storage';
	Strings.STS.L_DocMoveEnterValidMoveDestinationSite='Please select or enter an existing document library or folder as the move destination location.';
	Strings.STS.L_InsertCellToolTip_TEXT='Insert Cell';
	Strings.STS.L_MyDocsCalloutVersionError='Error retrieving data';
	Strings.STS.L_Saturday_Text='Saturday';
	Strings.STS.L_AccessRequestStatusDenied='Declined';
	Strings.STS.L_ForeColorToolTip_TEXT='Text Color (Ctrl+Shift+C)';
	Strings.STS.L_DateRangeOccurrencesDisplay_Text='The number of times this event recurs';
	Strings.STS.L_TotalFileSizeLimit='Total file size exceeded limit of 150MB';
	Strings.STS.L_SPGanttDiscardChangesDiscardButton='Discard';
	Strings.STS.L_EditVersion_Text='Edit';
	Strings.STS.L_DaysAgoLabelForCallout='{0} days ago||{0} day ago||{0} days ago';
	Strings.STS.L_AddColumnDefaultName_MoreColumnTypes='More Column Types...';
	Strings.STS.L_AddToMyLinks_Text='Add to My Links';
	Strings.STS.L_DGpreview_Title='Page Title';
	Strings.STS.L_CannotEditPropertyForLocalCopy_Text='You cannot edit the properties of a document while it is checked out and being modified offline.';
	Strings.STS.L_CadetBlue_TEXT='CadetBlue';
	Strings.STS.L_DGpreview_CARight_3='Change site theme';
	Strings.STS.L_DocMoveDialogNoKey='n';
	Strings.STS.L_DocMoveFolderConflictDialogMessage='A folder named ^1 already exists. What would you like to do?';
	Strings.STS.L_DesignBuilderToolsLayoutToolTipTitle='Site layouts';
	Strings.STS.L_JustifyCenterAltKey_TEXT='false';
	Strings.STS.L_DocMoveDocMoveSkipped='Move skipped.';
	Strings.STS.L_Monthly2_Text='The ^1^2 of every ^3 month(s)';
	Strings.STS.L_Version_NoDeleteAll_None_ERR='There are no previous versions to delete.';
	Strings.STS.L_DocMoveErrorAccessDeniedMessage='The following items were not moved because you do not have the proper permissions to the destination location. Request permissions and try again:';
	Strings.STS.L_Whereabouts_PeriodSeparator_Text='-';
	Strings.STS.L_InvalidFillIn_Text='Fill in value can\'t contain string ;#.';
	Strings.STS.L_MyDocsDateHeaderToday='Today';
	Strings.STS.L_StrPM_Text='pm';
	Strings.STS.L_SharedWithManyNoPrefix='Lots of people';
	Strings.STS.L_DGpreview_CARight_11='Get more apps...';
	Strings.STS.L_AsyncDeltaManager_UnknownToken='The server returned an unknown token: \'{0}\'.';
	Strings.STS.L_DeleteColumnShiftKey_TEXT='false';
	Strings.STS.L_RichTextHiddenLabelText='Rich text editor';
	Strings.STS.L_ErrorDetailsTitle='Error details';
	Strings.STS.L_PrepareUpload='Uploading...';
	Strings.STS.L_ViewAllSharingRequests='Show history';
	Strings.STS.L_DocMoveDialogMove='Move';
	Strings.STS.L_BlueViolet_TEXT='BlueViolet';
	Strings.STS.L_Gray25_TEXT='Gray 25%';
	Strings.STS.L_DownloadOriginal_Text='Download Picture';
	Strings.STS.L_RoamingOffice_AppNameOneNote='OneNote';
	Strings.STS.L_AddColumnDefaultName_DateAndTime='Date and Time';
	Strings.STS.L_DGpreview_Searchbox='Search text';
	Strings.STS.L_BlueGray_TEXT='Blue Gray';
	Strings.STS.L_RoamingOffice_AppNameVisio='Visio';
	Strings.STS.L_SelectAllKey_TEXT='A';
	Strings.STS.L_InvalidInteger_Text='^1 must be an integer.';
	Strings.STS.L_DarkRedLong_TEXT='Dark Red';
	Strings.STS.L_UpgradeSolution_Text='Upgrade';
	Strings.STS.L_BoldShiftKey_TEXT='false';
	Strings.STS.L_CalendarThai_Text=' using Buddhist Calendar';
	Strings.STS.L_Whereabouts_GoingHome_Text='NR';
	Strings.STS.L_MediumOrchid_TEXT='MediumOrchid';
	Strings.STS.L_InsertRowBelowShiftKey_TEXT='false';
	Strings.STS.L_UninstallApp_Text='Uninstall';
	Strings.STS.L_PromoSites_EditDialogTitle='Edit promoted site';
	Strings.STS.L_TodaysDate_Text='Today\'s date is ^1';
	Strings.STS.L_AddLinkTooltip='Add a link';
	Strings.STS.L_ItemGone='This item is no longer available.  It may have been deleted by another user.  Click \'OK\' to refresh the page.';
	Strings.STS.L_DisallowFUrlUnderSimpleNodeMessage='Sorry, you can\'t put \"{0}\" beneath \"{1}\"';
	Strings.STS.L_CopyingOfflineVersionWarning_Text='You currently have this document checked out locally.  Only versions stored on the server can be copied.  To copy the most recent minor version, click OK.  To copy the currently checked out version, click Cancel, check in the document and then retry the copy operation.';
	Strings.STS.L_UrlTooLongError_Text='The URL for the location must be no longer than 256 characters without the query parameters. The query parameters start at the question mark (?).';
	Strings.STS.L_HtmlSourceToolTip_TEXT='Edit HTML Source';
	Strings.STS.L_AddLinkText='link';
	Strings.STS.L_DlgEditLinkTitle='Edit link';
	Strings.STS.L_CopyToolTip_TEXT='Copy (Ctrl+C)';
	Strings.STS.L_ExportListSpreadsheet_Text='To export a list, you must have a Microsoft SharePoint Foundation-compatible application.';
	Strings.STS.L_DETACHEDPASTEXCPMODIFIED_Text='This past meeting was modified or canceled from your calendar and scheduling program. To keep, delete or move this meeting in the workspace, use the drop-down menu next to its date in the Meeting Series pane. To update the scheduling information for this meeting in the workspace, use your scheduling program to update this specific meeting occurrence.';
	Strings.STS.L_OpenItem_Text='Open item';
	Strings.STS.L_SharingNotificationEmptyText='Sharing updated';
	Strings.STS.L_UploadMaxFileCountTitle='Too many files';
	Strings.STS.L_RoamingOffice_AppNamePowerpoint='PowerPoint';
	Strings.STS.L_rgMonths10_Text='November';
	Strings.STS.L_ConflictReplaceButton='Replace It';
	Strings.STS.L_Maroon_TEXT='Maroon';
	Strings.STS.L_MidnightBlue_TEXT='MidnightBlue';
	Strings.STS.L_Link_TXT='Link';
	Strings.STS.L_LightOrange_TEXT='Light Orange';
	Strings.STS.L_BackColorToolTip_TEXT='Text Highlight Color (Ctrl+Shift+W)';
	Strings.STS.L_InsertTableElementToolTip_TEXT='Insert Table Element';
	Strings.STS.L_Enter_Text='Please enter one or more search words.';
	Strings.STS.L_Mybrary_Branding_TextWithName='SkyDrive @ {0}';
	Strings.STS.L_Font5_TEXT='Verdana';
	Strings.STS.L_RangeTypeNone_Text='No end date';
	Strings.STS.L_InvalidMin_Text='^1 must be greater than or equal to ^2.';
	Strings.STS.L_PromoSites_TitleField='Title';
	Strings.STS.L_CreateExcelSurveyError='Your administrator needs to allow users to share survey links.';
	Strings.STS.L_DocMoveBrowseTitle='Browse document libraries and folders at the location you entered.';
	Strings.STS.L_rgDOW2_Text='Tue';
	Strings.STS.L_BingMap_NoInternetAccess='Sorry, Bing Maps isn\'t available because you do not have access to the internet or something went wrong.';
	Strings.STS.L_RecycleSingleItem_Text='Are you sure you want to send this item to the site Recycle Bin?';
	Strings.STS.L_JustifyCenterShiftKey_TEXT='false';
	Strings.STS.L_InsertCellRightLabel_TEXT='Insert Cell Right (Ctrl+Alt+R)';
	Strings.STS.L_OutdentToolTip_TEXT='Decrease Indent (Ctrl+Shift+M)';
	Strings.STS.L_RoamingOffice_AppNameExcel='Excel';
	Strings.STS.L_DGpreview_CARight_9='Announcements';
	Strings.STS.L_DocMoveErrorNoMoveRightsMessage='The following items were not moved because you do not have permissions to move the items. Request permissions and try again:';
	Strings.STS.L_Sharing_ManageLink_ConfirmButtonOK='Disable Link';
	Strings.STS.L_DisallowAddChildrenMessage='Sorry, you can\'t put links below \"{0}\".';
	Strings.STS.L_DocMoveErrorInvalidTargetMessage='The following items were not moved because the destination was invalid:';
	Strings.STS.L_VS_DownArrow_Text='Select a View';
	Strings.STS.L_YMDDATESameYear_Text='^1, ^2 ^3';
	Strings.STS.L_SavePartialResponse1_text='The current survey response will be saved.  Your response can be found in the All Responses survey view.';
	Strings.STS.L_FollowedItemNotFound_Text='This link doesn\'t work anymore, likely because the item was moved or deleted. You might have luck searching for it and following it in its new location.';
	Strings.STS.L_AccRqCllSndPst='Send';
	Strings.STS.L_ViewProperties_Text='View Properties';
	Strings.STS.L_rgDOW6_Text='Sat';
	Strings.STS.L_Notification_CheckIn='Checking In...';
	Strings.STS.L_DGpreview_CAList_Header='Example of a simple list:';
	Strings.STS.L_Font8_TEXT='';
	Strings.STS.L_NavajoWhite_TEXT='NavajoWhite';
	Strings.STS.L_UnPublishItem_Text='Unpublish this version';
	Strings.STS.L_PromoSites_URLField='Link Location';
	Strings.STS.L_DGpreview_TN2='Navigation 2';
	Strings.STS.L_DragDropDocItemMoveText='Move';
	Strings.STS.L_MyDocsDateHeaderLastMonth='Last Month';
	Strings.STS.L_LimeGreen_TEXT='LimeGreen';
	Strings.STS.L_ItalicAltKey_TEXT='false';
	Strings.STS.L_CreateLinkAltKey_TEXT='false';
	Strings.STS.L_LookupFieldRequiredLookupThrottleMessage='This is a lookup column that displays data from another list that currently exceeds the List View Threshold defined by the administrator (^1). To add items to the current list, please ask the list owner to remove this column.';
	Strings.STS.L_SharedWithDialogPendingAccessRequests='There are pending access requests.';
	Strings.STS.L_InsertColumnRightShiftKey_TEXT='false';
	Strings.STS.L_AllDayWidth_Text='54';
	Strings.STS.L_InvalidMax_Text='^1 must be less than or equal to ^2.';
	Strings.STS.L_SlateGray_TEXT='SlateGray';
	Strings.STS.L_PromoSites_StartAdminModeCommand='{0}Manage{1} the promoted sites below';
	Strings.STS.L_InsertColumnRightAltKey_TEXT='true';
	Strings.STS.L_TransparentTooltip_TXT='Transparent Web Part Background Color';
	Strings.STS.L_ActivateSolution_Text='Activate';
	Strings.STS.L_OliveDrab_TEXT='OliveDrab';
	Strings.STS.L_AccessRequestStatusExpired='Expired';
	Strings.STS.L_InvalidURLPath_ERR='The URL is not valid for the %0 property. Check the URL spelling and path and try again.';
	Strings.STS.L_FontSizeToolTip_TEXT='Font Size (Ctrl+Shift+P)';
	Strings.STS.L_SPDiscCategoryLabel='Category: {0}';
	Strings.STS.L_Time_Text=':';
	Strings.STS.L_DeleteRowAltKey_TEXT='true';
	Strings.STS.L_SPDesignerDownloadWindow_Text='Microsoft SharePoint Designer';
	Strings.STS.L_Wheat_TEXT='Wheat';
	Strings.STS.L_Nav_Geolocation_Undefined='Your browser does not support the Geolocation API.';
	Strings.STS.L_SelectBackColorShiftKey_TEXT='true';
	Strings.STS.L_DevDashAnimation_Header='Animation';
	Strings.STS.L_RosyBrown_TEXT='RosyBrown';
	Strings.STS.L_BoldToolTip_TEXT='Bold (Ctrl+B)';
	Strings.STS.L_Version_NoOffline_NonCurrent_ERR='You can only take offline the current published or approved version';
	Strings.STS.L_RefreshButtonCaption='Refresh';
	Strings.STS.L_PowderBlue_TEXT='PowderBlue';
	Strings.STS.L_DGpreview_Current='Current';
	Strings.STS.L_IMNOffline_OOF_Text='Offline (OOF)';
	Strings.STS.L_Ascending_Text='Ascending';
	Strings.STS.L_SPClientRequiredValidatorError='You can\'t leave this blank.';
	Strings.STS.L_RemoveConnection_TXT='Are you sure you want to remove the connection between the %0 Web Part and the %1 Web Part? To remove the connection, click OK. To keep the connection, click Cancel.';
	Strings.STS.L_FollowingException_FollowFailed='Something went wrong in your attempt to follow this item. If you try again and it still fails, you may want to contact your administrator.';
	Strings.STS.L_ConflictMergeTitle='A folder with the same name already exists';
	Strings.STS.L_DocMoveErrorInvalidTargetListMessage='The following items were not moved because the destination document library was invalid:';
	Strings.STS.L_CheckMarkComplete_Tooltip='Mark task incomplete.';
	Strings.STS.L_AccReqRevokingInv='Withdrawing invitation';
	Strings.STS.L_CalloutFollowAction='Follow';
	Strings.STS.L_Gray40_TEXT='Gray 40%';
	Strings.STS.L_SPClientPeoplePickerWaitImgAlt='This animation indicates the operation is in progress. Click to remove this animated image.';
	Strings.STS.L_Peru_TEXT='Peru';
	Strings.STS.L_UndoToolTip_TEXT='Undo (Ctrl+Z)';
	Strings.STS.L_rgDOW3_Text='Wed';
	Strings.STS.L_JustifyRightShiftKey_TEXT='false';
	Strings.STS.L_DateTimeFieldSelectTitle='Select a date from the calendar.';
	Strings.STS.L_DocumentFolderColHrefDescription='Documents';
	Strings.STS.L_PageExitCancelUpload='Leaving this page will cancel your current upload, and pending documents will not be uploaded.';
	Strings.STS.L_AddColumnDefaultName_Text='Text';
	Strings.STS.L_JustifyLeftToolTip_TEXT='Align Left (Ctrl+L)';
	Strings.STS.L_UnorderedListToolTip_TEXT='Bulleted List (Ctrl+Shift+L)';
	Strings.STS.L_SPDiscReportAbuseDialogReply='{0}\'s Reply';
	Strings.STS.L_ReplyLimitMsg_Text='Cannot reply to this thread. The reply limit has been reached.';
	Strings.STS.L_DMYDATESameYear_Text='^1 ^2';
	Strings.STS.L_DocMoveNoItemsToMove='No items selected to move.';
	Strings.STS.L_ExportEvent_Text='Export Event';
	Strings.STS.L_SelectedViewError_Text='Selected Images View requires Internet Explorer 7.0 or greater for Windows.';
	Strings.STS.L_PromoSites_ImageURLField='Background Image Location';
	Strings.STS.L_DarkBlueLong_TEXT='Dark Blue';
	Strings.STS.L_MistyRose_TEXT='MistyRose';
	Strings.STS.L_AppMonDetails_AjaxFailed='Unable to retrieve error details: ';
	Strings.STS.L_DarkOliveGreen_TEXT='DarkOliveGreen';
	Strings.STS.L_Lavender_TEXT='Lavender';
	Strings.STS.L_DocMoveNavigatingAwayWarning='Leaving this page will cancel your current move, and pending items will not be moved.';
	Strings.STS.L_LightYellow_TEXT='LightYellow';
	Strings.STS.L_rgMonths1_Text='February';
	Strings.STS.L_InsertRowBelowAltKey_TEXT='true';
	Strings.STS.L_SelectFontNameShiftKey_TEXT='true';
	Strings.STS.L_MintCream_TEXT='MintCream';
	Strings.STS.L_ChoiceFillInDisplayText='Specify your own value:';
	Strings.STS.L_Lime_TEXT='Lime';
	Strings.STS.L_InsertRowAboveShiftKey_TEXT='false';
	Strings.STS.L_ListStyle_Text=' Details';
	Strings.STS.L_SucceedMessage='Upload completed ({0} added)';
	Strings.STS.L_DragDropUploadGenericError='Sorry, for some reason this document couldn\'t upload. Try again later or contact your administrator.';
	Strings.STS.L_strRichTextSupport_Text='You may add HTML formatting. Click <a href=\'javascript:HelpWindowKey(\"WSSEndUser_nsrichtext\")\'>here</a> for more information.';
	Strings.STS.L_DocMoveDialogRefreshKey='r';
	Strings.STS.L_FinishValidation='Finished validation, ready for upload...';
	Strings.STS.L_LookupMultiFieldRemoveButtonText='Remove';
	Strings.STS.L_WebFoldersRequired_Text='Please wait while Explorer View is loaded. If Explorer View does not appear, your browser may not support it.';
	Strings.STS.L_Move_Text='Move';
	Strings.STS.L_Sharing_ManageLink_ConfirmText='Once this link is disabled, it will never work again. You can always create a new one to share.';
	Strings.STS.L_Cornsilk_TEXT='Cornsilk';
	Strings.STS.L_Version_Delete_Confirm_Text='Are you sure you want to delete this version?';
	Strings.STS.L_URLHeading_Text='Type the Web address:';
	Strings.STS.L_DarkYellow_TEXT='Dark Yellow';
	Strings.STS.L_DocMoveDialogMoveErrorSummary='Move error summary';
	Strings.STS.L_AccRqCllUtPermTtl='Permission';
	Strings.STS.L_DGpreview_CATable_Date3='10/22/2010';
	Strings.STS.L_FeedbackCalloutViewAllActionText='Feedback';
	Strings.STS.L_IMNBusy_Text='Busy';
	Strings.STS.L_Font1_TEXT='Arial';
	Strings.STS.L_Checkin_Text='Check In';
	Strings.STS.L_SharedWithDialogCancel='Close';
	Strings.STS.L_DGpreview_CATable_Doc5='Fifth Document';
	Strings.STS.L_LargestOnTop_Text='Largest on Top';
	Strings.STS.L_JustifyLeftAltKey_TEXT='false';
	Strings.STS.L_DocMoveDialogTitleMergFolders='Merge folders?';
	Strings.STS.L_DGpreview_CATableHeader='Welcome to the preview of your theme!';
	Strings.STS.L_DeleteMultipleItems_Text='Are you sure you want to delete these items?';
	Strings.STS.L_DocMoveCancellationMessage='Stopping move...  Move will be cancelled after current move of in progress item finishes.';
	Strings.STS.L_AppUninstalling='Uninstalling';
	Strings.STS.L_CreateLinkToolTip_TEXT='Open a new window to Insert Hyperlink (Ctrl+K)';
	Strings.STS.L_LinkToBefore_Text='Connect to ';
	Strings.STS.L_EditSeriesItem_Text='Edit Series';
	Strings.STS.L_EditModeLeaveMsg='You haven\'t saved your changes to the site navigation. If you leave this page, you\'ll lose the changes.';
	Strings.STS.L_TaskCallout_Breadcrumb='In {0} {1} {2}';
	Strings.STS.L_YMD_DOW_DATE_Text='^4 ^1, ^2 ^3';
	Strings.STS.L_DocMoveErrorGeneralMessage='The following items were not moved due to errors:';
	Strings.STS.L_OrderedListAltKey_TEXT='false';
	Strings.STS.L_CancelButtonCaption='Cancel';
	Strings.STS.L_GoToSourceItem_Text='Go to Source Item';
	Strings.STS.L_MustCheckout_Text='You must check out this item before making changes.';
	Strings.STS.L_NewFormLibTb1_Text='The document could not be created.\nThe required application may not be installed properly, or the template for this document library cannot be opened.\n\nPlease try the following:\n1. Check the General Settings for this document library for the name of the template, and install the application necessary for opening the template. If the application was set to install on first use, run the application and then try creating a new document again.\n\n2.  If you have permission to modify this document library, go to General Settings for the library and configure a new template.';
	Strings.STS.L_CustomizeNewButton_Text='Change New Button Order';
	Strings.STS.L_SPClientPeoplePickerNoResults='No results found';
	Strings.STS.L_Infobar_Send_Error_Text='Failed to send JavaScript error report. Please see original error details below.';
	Strings.STS.L_AppRegistering='Registering';
	Strings.STS.L_DeleteRowToolTip_TEXT='Delete Row (Ctrl+Alt+MINUS SIGN)';
	Strings.STS.L_RoamingOffice_AppNameAccess='Access';
	Strings.STS.L_TasksListShortcut_Insert='Insert - Insert';
	Strings.STS.L_EditDocumentProgIDError_Text='\'Edit Document\' requires a Microsoft SharePoint Foundation-compatible application and web browser.';
	Strings.STS.L_SPDiscAllRepliesHeaderFormat='{0} to {1}';
	Strings.STS.L_SitesFollowLimitReachedDialog_Text='You\'re only allowed to follow a certain number of sites and you\'re currently at that limit.';
	Strings.STS.L_BurlyWood_TEXT='BurlyWood';
	Strings.STS.L_SharedWithDialogAdvanced='Advanced';
	Strings.STS.L_DesignBuilderToolsImagePickerTooManyFilesError='Sorry, you can only upload one file at a time.';
	Strings.STS.L_DGpreview_CARight_1='GETTING STARTED';
	Strings.STS.L_DarkSlateBlue_TEXT='DarkSlateBlue';
	Strings.STS.L_DocMoveDocMoveCancelled='Move cancelled.';
	Strings.STS.L_Fuchsia_TEXT='Fuchsia';
	Strings.STS.L_InsertRowAboveLabel_TEXT='Insert Row Above (Ctrl+Alt+Up)';
	Strings.STS.L_DocMoveDialogNo='No';
	Strings.STS.L_DocMoveDialogClose='Close';
	Strings.STS.L_SplitCellShiftKey_TEXT='false';
	Strings.STS.L_AsyncDeltaManager_ScriptLoadFailedNoHead='The start page is missing the expected <head> element.';
	Strings.STS.L_ConflictMessage='A file named \'{0}\' already exists in this library. What would you like to do?';
	Strings.STS.L_FillInValue_Text='Fill-in Value';
	Strings.STS.L_JustifyRightKey_TEXT='R';
	Strings.STS.L_MediumSlateBlue_TEXT='MediumSlateBlue';
	Strings.STS.L_SharedWithDialogApplySuccessText='Success';
	Strings.STS.L_AccessRequestStatusExpiresInHours='(Expires in {0} hours)';
	Strings.STS.L_DocMoveMoving='Moving...';
	Strings.STS.L_Minutes_Text='Minutes';
	Strings.STS.L_ZOnTop_Text='Z on Top';
	Strings.STS.L_ImageCreateDate_Text='Date Picture Taken';
	Strings.STS.L_DocMoveDialogCloseKey='l';
	Strings.STS.L_Crimson_TEXT='Crimson';
	Strings.STS.L_ConflictApplyRestForOneCheckBox='Do this for the next conflict';
	Strings.STS.L_OpenDocumentLocalError_Text='This document was being edited offline, but there is no application configured to open the document from SharePoint.  The document can only be opened for reading.';
	Strings.STS.L_Rose_TEXT='Rose';
	Strings.STS.L_SPClientPeoplePickerServerTimeOutError='Sorry, we\'re having trouble reaching the server.';
	Strings.STS.L_SaveViewDlgPersonalOpt='Keep it personal so only you can use it.';
	Strings.STS.L_Sienna_TEXT='Sienna';
	Strings.STS.L_UnknownFileTypeError='Folders and unsupported file types can\'t be uploaded.';
	Strings.STS.L_ClientPivotControlOverflowMenuAlt='Click for additional options';
	Strings.STS.L_DarkSeaGreen_TEXT='DarkSeaGreen';
	Strings.STS.L_DGpreview_TN1='Navigation 1';
	Strings.STS.L_AddColumnDefaultName_Number='Number';
	Strings.STS.L_InsertRowAboveKeyCode_TEXT='38';
	Strings.STS.L_ErrorMessage_PluginNotLoadedError='Could not download the Silverlight application or the Silverlight Plugin did not load.';
	Strings.STS.L_URLTest_Text='Click here to test';
	Strings.STS.L_RoamingOffice_EntitlementCheck='Please wait while we check which Office programs you can stream...';
	Strings.STS.L_DesignBuilderToolsPaletteLabel='Colors';
	Strings.STS.L_Notification_DiscardCheckOut='Discarding Check Out...';
	Strings.STS.L_IE5upRequired_Text='\'Discuss\' requires a Microsoft SharePoint Foundation-compatible application and Microsoft Internet Explorer 7.0 or greater.';
	Strings.STS.L_FileOrFolderUnsupported_ERR='The current browser does not support links to files or folders. To specify a link to a file or folder, you must use Microsoft Internet Explorer 5.0 or later';
	Strings.STS.L_HideErrButtonCaption='Hide';
	Strings.STS.L_DarkGreenLong_TEXT='Dark Green';
	Strings.STS.L_InsertColumnLabel_TEXT='';
	Strings.STS.L_InsertRowBelowKeyCode_TEXT='40';
	Strings.STS.L_DeepSkyBlue_TEXT='DeepSkyBlue';
	Strings.STS.L_RichTextDir='ltr';
	Strings.STS.L_Version_RestoreVersioningOff_Confirm_Text='Versioning is currently disabled. As a result, you are about to overwrite the current version. All changes to this version will be lost.';
	Strings.STS.L_DesignBuilderToolsPaletteToolTipDescription='Change the colors used on the site.';
	Strings.STS.L_DeleteGlobalConfirm_Text='This page will be deleted from all meetings associated with this workspace.  ';
	Strings.STS.L_InsertRowAboveAltKey_TEXT='true';
	Strings.STS.L_DocMoveCreateFolderFailed='Failed to create the destination folder.';
	Strings.STS.L_SaveViewDlgMsg='Keep the current sorting order and filters so you can get back to them again.';
	Strings.STS.L_IMNOffline_Text='Offline';
	Strings.STS.L_DevDashAnimation_FPS='FPS';
	Strings.STS.L_StopFollowingSite='Stop following.';
	Strings.STS.L_Font6_TEXT='';
	Strings.STS.L_NoOverwrite='User selected not to overwrite existing file';
	Strings.STS.L_AccReqCtlGettingMessages='Getting messages...';
	Strings.STS.L_CheckoutConfirm='You are about to check out the selected file(s).';
	Strings.STS.L_DateRangeStartDisplay_Text='When this event begins';
	Strings.STS.L_AccRqCllUtActDcl='Decline';
	Strings.STS.L_Clippy_Tooltip='Click to view geolocation on a map.';
	Strings.STS.L_ResetPagePersonalizationDialog_TXT='You are about to reset all personalized Web Parts to their shared values and delete any private Web Parts. Click OK to complete this operation. Click Cancel to keep your personalized Web Part settings and private Web Parts.';
	Strings.STS.L_Gray80_TEXT='Gray 80%';
	Strings.STS.L_Sharing_ManageLink_Title='Guest links to {0}';
	Strings.STS.L_ShowErrButtonCaption='Show';
	Strings.STS.L_MDYDATESameYear_Text='^1 ^2';
	Strings.STS.L_DraftAppUploadDialogTitle='Upload App';
	Strings.STS.L_MediumAquaMarine_TEXT='MediumAquaMarine';
	Strings.STS.L_rgDOWDP2_Text='T';
	Strings.STS.L_DodgerBlue_TEXT='DodgerBlue';
	Strings.STS.L_Font4_TEXT='Times';
	Strings.STS.L_InvalidFilePath_ERR='The path to the file or folder is not valid. Check the path and try again.';
	Strings.STS.L_Version_DeleteAllMinor_Confirm_Text='Are you sure you want to delete all previous draft versions of this file?';
	Strings.STS.L_DocMoveDialogTitleReplaceDocument='Replace existing document?';
	Strings.STS.L_AutohosteAppLicensing_BuyMore='Buy more';
	Strings.STS.L_InvalidNumber_Text='^1 is not a valid number.';
	Strings.STS.L_RoamingOffice_AppNameGroove='Groove';
	Strings.STS.L_DesignBuilderToolsLayoutToolTipDescription='Change the layout of the site.';
	Strings.STS.L_Aqua_TEXT='Aqua';
	Strings.STS.L_AccessRequestPermissionFieldDisplayError='Select a group or permission level';
	Strings.STS.L_RemoveFormatToolTip_TEXT='Clear Format (Ctrl+Space)';
	Strings.STS.L_YellowGreen_TEXT='YellowGreen';
	Strings.STS.L_EditInOIS_Text='Edit Picture';
	Strings.STS.L_RestoreVersion_Text='Restore';
	Strings.STS.L_CalendarHebrew_Text=' using Hebrew Lunar Calendar';
	Strings.STS.L_BoldKey_TEXT='B';
	Strings.STS.L_DateSeparator_Text=' - ';
	Strings.STS.L_Ivory_TEXT='Ivory';
	Strings.STS.L_DueDate_Overdue_Tooltip='This task is late.';
	Strings.STS.L_DeleteConfirm_Text='Are you sure you want to delete this page?';
	Strings.STS.L_WikiWebPartNoClosedOrUploaded='Closed Web Parts and Uploaded Web Parts are not supported.';
	Strings.STS.L_EditPermission='Can edit';
	Strings.STS.L_DocumentsFollowLimitReachedDialog_Text='You\'re only allowed to follow a certain number of documents and you\'re currently at that limit.';
	Strings.STS.L_DesignBuilderToolsImagePickerInvalidFileType='Sorry, uploads are limited to JPEG, BMP, PNG, or GIF type images.';
	Strings.STS.L_MyDocsSharedWithMeAuthorShared='^1 shared this document with you.';
	Strings.STS.L_DocMoveErrorNotSupportedMessage='The following items were not moved because the types of documents are not supported in move operations:';
	Strings.STS.L_MergeCellShiftKey_TEXT='false';
	Strings.STS.L_RecurPatternCustom_Text='Custom';
	Strings.STS.L_LightSeaGreen_TEXT='LightSeaGreen';
	Strings.STS.L_SPGanttDisposeErrorDialogTitle='Just a second...';
	Strings.STS.L_LightGrey_TEXT='LightGrey';
	Strings.STS.L_AccRqNwMsgFl='Sorry, your message could not be saved. Please refresh the page and try again.';
	Strings.STS.L_Notification_Moderate='Changing approval status...';
	Strings.STS.L_UrlFieldClickText='Click here to test';
	Strings.STS.L_Err_Permission_Denied='Your browser supports geolocation, but permission for your location information was denied.';
	Strings.STS.L_JustifyCenterKey_TEXT='E';
	Strings.STS.L_DGpreview_Ribbon3='Tab 3';
	Strings.STS.L_CutToolTip_TEXT='Cut (Ctrl+X)';
	Strings.STS.L_rgDOWLong5_Text='Friday';
	Strings.STS.L_IndentAltKey_TEXT='false';
	Strings.STS.L_DarkCyan_TEXT='DarkCyan';
	Strings.STS.L_STSRecycleConfirm_Text='Are you sure you want to send the item(s) to the site Recycle Bin?';
	Strings.STS.L_LookupMultiFieldCandidateAltText='^1 possible values';
	Strings.STS.L_DETACHEDSERIESNOWSINGLE_Text='This meeting was changed in your calendar and scheduling program from a recurring meeting to a nonrecurring meeting. You can keep or delete the workspace. If you keep the workspace, you will not be able to link it to another scheduled meeting.';
	Strings.STS.L_LightGreenLong_TEXT='Light Green';
	Strings.STS.L_SPClientPeoplePickerUnresolvedUserError='We couldn\'t find an exact match.';
	Strings.STS.L_AccReqDenialSuccess='Request declined';
	Strings.STS.L_DocMoveDialogInputKey='i';
	Strings.STS.L_MyDocsLwVersionDialogError='Operation failed: ^1 Please try again later. ';
	Strings.STS.L_Moccasin_TEXT='Moccasin';
	Strings.STS.L_ErrorMessage_InitializeError='Could not download the Silverlight application.';
	Strings.STS.L_DGpreview_Accent1='Accent 1';
	Strings.STS.L_YMDDATE_Text='^1, ^2 ^3';
	Strings.STS.L_AppInvalidStatus='Invalid Status';
	Strings.STS.L_IMNDoNotDisturb_OOF_Text='Do not disturb (OOF)';
	Strings.STS.L_SPGanttDisposeDialogLeaveButton='Leave anyway';
	Strings.STS.L_SelectFontSizeKey_TEXT='P';
	Strings.STS.L_Yellow_TEXT='Yellow';
	Strings.STS.L_DeleteSingleItem_Text='Are you sure you want to delete this item?';
	Strings.STS.L_ExportPersonalization_TXT='This Web Part Page has been personalized. As a result, one or more Web Part properties may contain confidential information. Make sure the properties contain information that is safe for others to read. After exporting this Web Part, view properties in the Web Part description file (.webpart or .dwp) by using a text editor, such as Microsoft Notepad.';
	Strings.STS.L_DGpreview_QL2='Second menu item';
	Strings.STS.L_DragDropNotWorkingErrorTitle='Sorry, that didn\'t work';
	Strings.STS.L_ContainIllegalString_Text='^1 uses characters or words that aren\'t allowed.';
	Strings.STS.L_LTRKey_VALUE='190';
	Strings.STS.L_DocMoveDialogBrowseKey='b';
	Strings.STS.L_DisallowChangeParentMessage='Sorry, {0} has to stay beneath {1}. You can change its order, though.';
	Strings.STS.L_MediumVioletRed_TEXT='MediumVioletRed';
	Strings.STS.L_LookupFieldLookupThrottleMessage='This is a lookup column that displays data from another list that currently exceeds the List View Threshold defined by the administrator (^1).';
	Strings.STS.L_strAllDay_Text='All Day';
	Strings.STS.L_PromoSites_DescriptionField='Description';
	Strings.STS.L_rgMonths5_Text='June';
	Strings.STS.L_DGpreview_CARight_8='Share and track all of your team events in a single location.';
	Strings.STS.L_SharedWithMany='Shared with ^1lots of people^2';
	Strings.STS.L_DimGray_TEXT='DimGray';
	Strings.STS.L_Tuesday_Text='Tuesday';
	Strings.STS.L_BingMap_Blocked='Sorry, Bing Maps isn\'t available in your region. Please contact your administrator.';
	Strings.STS.L_DevSite_AppErrorMsg='There were some errors. Please click on View Logs for more details.';
	Strings.STS.L_AddToCategory_Text='Submit to Portal Area';
	Strings.STS.L_AccessDenied_ERR='Access Denied saving Web Part properties: either the Web Part is embedded directly in the page, or you do not have sufficient permissions to save properties.';
	Strings.STS.L_DocMoveResultCancelledMessage='^1 cancelled.';
	Strings.STS.L_DocMoveDialogMergeKey='m';
	Strings.STS.L_DocMoveRefreshView='Refresh view';
	Strings.STS.L_InsertRowLabel_TEXT='';
	Strings.STS.L_AccRqSPRlDf='Individual Roles';
	Strings.STS.L_AsyncDeltaManager_NonScriptManager='Your control doesn\'t output the script using the ASP 4.0 ScriptManager infrastructure.';
	Strings.STS.L_DocumentAlt_Text='Document';
	Strings.STS.L_PaleTurquoise_TEXT='PaleTurquoise';
	Strings.STS.L_AutoHostedAppLicensesRequired='You need an app hosting license for each user of this app.';
	Strings.STS.L_AccRqCllNwMsgScc='Comment posted';
	Strings.STS.L_MyDocsSharedWithMeAuthorSharedWithManyOthers='many others';
	Strings.STS.L_InsertCellRightAltKey_TEXT='true';
	Strings.STS.L_Turquoise_TEXT='Turquoise';
	Strings.STS.L_MyDocsDateHeaderThreeWeeksAgo='3 Weeks Ago';
	Strings.STS.L_UserFieldPictureAlt1='Picture Placeholder: ^1';
	Strings.STS.L_Cyan_TEXT='Cyan';
	Strings.STS.L_RecurrenceType_Text='Recurrence Type';
	Strings.STS.L_DocMoveDialogYes='Yes';
	Strings.STS.L_AccessRequestStatusExpiresInAnyMinNow='(Expires in less than an hour)';
	Strings.STS.L_RecurPatternDaily_Text='Daily';
	Strings.STS.L_SelectFontSizeAltKey_TEXT='false';
	Strings.STS.L_rgMonths4_Text='May';
	Strings.STS.L_DocMoveInvalidDestinationError500Server='Destination server error. Please try move again later.';
	Strings.STS.L_URLHeadingDesc_Text='Type the description:';
	Strings.STS.L_MoveItemErrorTitle='Oops, the files weren\'t moved';
	Strings.STS.L_DaysLabelForCalloutIntervals='0||1||2-';
	Strings.STS.L_NoImageSelected_Text='There are no pictures selected. Select one or more pictures and try again.';
	Strings.STS.L_DocMoveErrorMeetingWSMessage='The following items were not moved because the destination was a Meeting Workspace, which does not support move:';
	Strings.STS.L_InsertTableKey_TEXT='T';
	Strings.STS.L_StylesToolTip_TEXT='Styles';
	Strings.STS.L_SPDiscReplyOptionsLink='Reply options';
	Strings.STS.L_SPClientPeoplePickerMultiUserDefaultHelpText='Enter names or email addresses...';
	Strings.STS.L_PromoSites_CancelButton='Cancel';
	Strings.STS.L_MyDocsDateHeaderLastWeek='Last Week';
	Strings.STS.L_DocMoveErrorFolderMoveMessage='The following items were not moved because a single move operation doesn\'t support moving multiple documents or subfolders in a folder:';
	Strings.STS.L_Tan_TEXT='Tan';
	Strings.STS.L_AsyncDeltaManager_MissingTarget='Could not find the AjaxDelta element with ID \'{0}\'.';
	Strings.STS.L_rgDOWLong4_Text='Thursday';
	Strings.STS.L_Snow_TEXT='Snow';
	Strings.STS.L_SharedWithNoneNoPrefix='No one';
	Strings.STS.L_Version_DeleteAll_Confirm_Text='Are you sure you want to delete all previous versions associated with this file?';
	Strings.STS.L_FollowingPersonalSiteNotFoundError_Title='Wait a minute';
	Strings.STS.L_ConflictApplyRestCheckBox='Do this for the rest of the conflicts';
	Strings.STS.L_MyDocsDateHeaderEarlierThisMonth='Earlier This Month';
	Strings.STS.L_PromoSites_NewDialogTitle='Add a promoted site';
	Strings.STS.L_DocMoveDialogFollowKey='f';
	Strings.STS.L_WarningChangingFUrlMessage='Moving \"{0}\" will change its URL from {1} to {2}. This will break hyperlinks that point to the old address.';
	Strings.STS.L_RoamingOffice_AppNameInfopath='InfoPath';
	Strings.STS.L_DocMoveResultAllFailedMessage='Unfortunately move failed. No items were moved.';
	Strings.STS.L_StartDateRange_Text='Start Date';
	Strings.STS.L_Sharing_ManageLink_DisabledText='Disabled';
	Strings.STS.L_ViewResponse_Text='View Response';
	Strings.STS.L_PreviousPicture_Text='Previous picture';
	Strings.STS.L_WebPartBackgroundColor_TXT='Web Part Background Color';
	Strings.STS.L_InsertImageKey_TEXT='G';
	Strings.STS.L_rgDOWLong6_Text='Saturday';
	Strings.STS.L_Version_unpublish_Confirm_Text='Are you sure you want to unpublish this version of the document?';
	Strings.STS.L_ToolPaneShrinkToolTip_TXT='Narrow';
	Strings.STS.L_MyDocsCalloutStartFollowing='Start following ^1';
	Strings.STS.L_Orchid_TEXT='Orchid';
	Strings.STS.L_LightCoral_TEXT='LightCoral';
	Strings.STS.L_DeleteRowKeyCode_TEXT='189';
	Strings.STS.L_SPClientDeleteProcessedUserAltText='Remove person or group ^1';
	Strings.STS.L_DayFrequency_Text='1';
	Strings.STS.L_AccRqCllUtRqBy='Requested By';
	Strings.STS.L_DateTimeFieldDateMinutesLabel='^1 Minutes';
	Strings.STS.L_strExpand_Text='Expand';
	Strings.STS.L_InsertColumnLeftKeyCode_TEXT='37';
	Strings.STS.L_DGpreview_CATable_R1='Drag files here or click to <a>add</a> new';
	Strings.STS.L_DocTran_Text='Convert Document';
	Strings.STS.L_DisallowDeleteChildMessage='Sorry, you can\'t delete \"{0}\" because \"{1}\" is protected from deletion. You might be able to move \"{1}\" somewhere else.';
	Strings.STS.L_DevDashAnimation_Millisec='ms';
	Strings.STS.L_AlreadyFollowingNotificationText_Site='You\'re already following this site.';
	Strings.STS.L_CheckOutRetry_Text='Check out failed, do you want to retry to check out from server?';
	Strings.STS.L_DocMoveDialogErrorKey='e';
	Strings.STS.L_LightGreen_TEXT='LightGreen';
	Strings.STS.L_Sharing_ManageLink_ConfirmTitle='Closing the door?';
	Strings.STS.L_DGpreview_CARight_10='Keep everyone in the loop with a central place for news.';
	Strings.STS.L_YMDATE_Text='^1 ^2';
	Strings.STS.L_RTLKey_VALUE='188';
	Strings.STS.L_MtgKeepConfirm_Text='The information for this meeting date does not match the information in your calendar and scheduling program. If you keep this meeting date, it will continue to appear in the Meeting Series list in the workspace.';
	Strings.STS.L_PasteToolTip_TEXT='Paste (Ctrl+V)';
	Strings.STS.L_NotificationsAndNMore='and ^1 more...';
	Strings.STS.L_InsertColumnLeftLabel_TEXT='Insert Column Left (Ctrl+Alt+Left)';
	Strings.STS.L_UserFieldMultiDescription='Enter users separated with semicolons.';
	Strings.STS.L_UrlFieldTypeText='Type the Web address:';
	Strings.STS.L_SPDiscussionCount='{0} discussion(s)';
	Strings.STS.L_CancleApproval_TEXT=' Are you sure that you want to cancel the approval of this document?';
	Strings.STS.L_FontNameLabel_TEXT='Font';
	Strings.STS.L_NoPresenceInformation='No presence information';
	Strings.STS.L_DGpreview_CATable_Doc1='First Document Title';
	Strings.STS.L_DesignBuilderToolsPaletteAlt='Colors';
	Strings.STS.L_ClearLocation='Clear';
	Strings.STS.L_SubmitFileCopyWarning_Text='Are you sure you want to copy this document to ^1?';
	Strings.STS.L_EditorIFrameTitle_TEXT='Rich Text Editor';
	Strings.STS.L_Sharing_ManageLink_ProgressTooltip='Deleting link in progress, click to not see this image';
	Strings.STS.L_SPGanttDisposeSavingDialogTitle='Working on it...';
	Strings.STS.L_FilenameFieldMax_Text='^1 can have no more than ^2 characters.';
	Strings.STS.L_NoTitle_Text='(No Title)';
	Strings.STS.L_ItalicKey_TEXT='I';
	Strings.STS.L_MyDocsNoDocsSharedWithUserRecently='You have not shared any documents recently with ^1';
	Strings.STS.L_HtmlSourceAltKey_TEXT='false';
	Strings.STS.L_GeolocationField_Deleted_MapView='This view no longer has a geolocation field, so it cannot be displayed in a map view.';
	Strings.STS.L_PromoSites_DeleteConfirmation='Don\'t want this site to be promoted?\n\nNot a problem! We can remove the link to the site from here.\nDon\'t worry, the site will still be there...';
	Strings.STS.L_PapayaWhip_TEXT='PapayaWhip';
	Strings.STS.L_DarkOrchid_TEXT='DarkOrchid';
	Strings.STS.L_AccessRequestStatusAccepted='Accepted by {0}';
	Strings.STS.L_AttachmentsUploadDescription='Use this page to add attachments to an item.';
	Strings.STS.L_SharedWithTooltip='View the people ^1 is shared with';
	Strings.STS.L_rgDOWDP1_Text='M';
	Strings.STS.L_White_TEXT='White';
	Strings.STS.L_DateRequired_Text='You must specify a date for ^1.';
	Strings.STS.L_UploadingProgress='{0} of {1} complete';
	Strings.STS.L_DlgSecondLineCaption='Address';
	Strings.STS.L_RoamingOffice_AppNameWord='Word';
	Strings.STS.L_FileUploadToolTip_text='Name';
	Strings.STS.L_STSDelConfirm2_Text='Are you sure you want to permanently delete this Document Collection and all its contents?';
	Strings.STS.L_HideTZ_Text='Hide time zone';
	Strings.STS.L_MyDocsCalloutStopFollowing='Stop following ^1';
	Strings.STS.L_DateRangeOrdering_Text='The start date and time are after the end date and time.';
	Strings.STS.L_NotAnImageFile='{0} is not an image file.';
	Strings.STS.L_PeachPuff_TEXT='PeachPuff';
	Strings.STS.L_DGpreview_TN4='More';
	Strings.STS.L_AccessRequestStatusApproved='Approved by {0}';
	Strings.STS.L_SPClientPeoplePicker_AutoFillFooter='Showing ^1 result||Showing ^1 results||Showing the top ^1 results';
	Strings.STS.L_TasksListShortcut_Header='Shortcuts';
	Strings.STS.L_strMore_Text='more...';
	Strings.STS.L_AccessRequestStatusRevoked='Withdrawn';
	Strings.STS.L_LightSkyBlue_TEXT='LightSkyBlue';
	Strings.STS.L_AttachmentsOnTop_Text='Attachments on Top';
	Strings.STS.L_DialogFollowSiteAction_Content='When you follow this site, you\'ll get updates in your newsfeed.';
	Strings.STS.L_NewestOnTop_Text='Newest on Top';
	Strings.STS.L_ContentFollowingPrivacyIcon_Tooltip='This list is private and won\'t be visible to anyone visiting your profile.';
	Strings.STS.L_Monthly2WhichWeekDisplay_Text='The week each month that this event occurs';
	Strings.STS.L_EditInGrid_Text='The list cannot be displayed in Datasheet view for one or more of the following reasons:\n\n- A datasheet component compatible with Microsoft SharePoint Foundation is not installed.\n- Your Web browser does not support ActiveX controls.\n- A component is not properly configured for 32-bit or 64-bit support.';
	Strings.STS.L_SharedWithDialogApplyUpdatedPermissionsFailed='Attempting to update permissions failed.';
	Strings.STS.L_AsyncDeltaManager_ParserError='The message received from the server could not be parsed.';
	Strings.STS.L_DGpreview_CARight_6='Share and track to do\'s and milestones with coworkers.';
	Strings.STS.L_DocMoveBrowse='Browse';
	Strings.STS.L_StartFollowingTitle='Start Following: {0}';
	Strings.STS.L_FormMissingPart1_Text='This form was customized and attachments will not work correctly because the HTML \'span\' element does not contain an \'id\' attribute named \'part1.\'';
	Strings.STS.L_FilmstripStyle_Text=' Filmstrip';
	Strings.STS.L_DocMoveDestinationInputTitle='Enter a SharePoint document library or folder URL for the move destination:';
	Strings.STS.L_FailedMessageLink='Upload completed ({0} added, {1} {2}failed{3})';
	Strings.STS.L_DialogFollowAction_Title='Follow \'{0}\'';
	Strings.STS.L_GetPropertiesFailure_ERR='Cannot retrieve properties at this time.';
	Strings.STS.L_DenyVersion_Text='Reject this version';
	Strings.STS.L_Inplview_PageNotYetSaved='page not yet saved';
	Strings.STS.L_NavEditConfirmationDialogTitle='Just checking...';
	Strings.STS.L_UnorderedListKey_TEXT='L';
	Strings.STS.L_DevDashAnimation_Min='Min';
	Strings.STS.L_DGpreview_QL4='Menu item with a really long name';
	Strings.STS.L_Darkorange_TEXT='Darkorange';
	Strings.STS.L_SlateBlue_TEXT='SlateBlue';
	Strings.STS.L_MyDocsDateHeaderOlder='Older';
	Strings.STS.L_FolderAlt_Text='Folder';
	Strings.STS.L_Violet_TEXT='Violet';
	Strings.STS.L_AccessRequestStatusExpiresInDays='(Expires in {0} days)';
	Strings.STS.L_DocMoveDialogCheckboxKey='x';
	Strings.STS.L_Checkout_Text='Check Out';
	Strings.STS.L_Orange_TEXT='Orange';
	Strings.STS.L_UploadMaxFileCount='Uploads are limited to {0} files. Please try again with fewer documents.';
	Strings.STS.L_InsertColumnLeftAltKey_TEXT='true';
	Strings.STS.L_NotifyThisIsCopy_Text='This item was copied from another location and may be receiving updates from there.  You should make sure that the source stops sending updates or this item may get recreated.\n\n';
	Strings.STS.L_WorkOffline_Text='Outlook';
	Strings.STS.L_Notification_Delete='Deleting...';
	Strings.STS.L_OtherLocation_Text='Other Location';
	Strings.STS.L_IMNOnline_OOF_Text='Available (OOF)';
	Strings.STS.L_AccRqCllUtRqFor='Request for';
	Strings.STS.L_DateRangeEndDisplay_Text='When this event ends';
	Strings.STS.L_DETACHEDCANCELLEDSERIES_Text='This meeting series was canceled from your calendar and scheduling program.';
	Strings.STS.L_Gold_TEXT='Gold';
	Strings.STS.L_GreenYellow_TEXT='GreenYellow';
	Strings.STS.L_Sharing_ManageLink_ProgressText='Processing';
	Strings.STS.L_rgDOWLong0_Text='Sunday';
	Strings.STS.L_LookupMultiFieldResultAltText='^1 selected values';
	Strings.STS.L_BrightGreen_TEXT='Bright Green';
	Strings.STS.AccReqList_PendInvView='External user invitations';
	Strings.STS.L_CreateLinkShiftKey_TEXT='false';
	Strings.STS.L_DGpreview_Accent3='Accent 3';
	Strings.STS.L_HtmlSourceShiftKey_TEXT='true';
	Strings.STS.L_Sharing_ManageLink_DefaultError='Sorry, for some reason we couldn\'t remove the link. Try again later or contact your server administrator.';
	Strings.STS.L_DGpreview_CATable_H1='Name';
	Strings.STS.L_NewTab='New tab';
	Strings.STS.L_CalloutLastEditedNameAndDate='Changed by ^1 on ^2';
	Strings.STS.L_CalloutSourceUrlHeader='Location';
	Strings.STS.L_SPDiscBestUndo='Remove best reply';
	Strings.STS.L_SPAddNewWiki='new Wiki page';
	Strings.STS.L_SPCategorySortRecent='Recent';
	Strings.STS.L_ViewSelectorTitle='Change View';
	Strings.STS.L_SPDiscNumberOfLikes='{0} likes||{0} like||{0} likes';
	Strings.STS.L_Timeline_DfltViewName='Timeline';
	Strings.STS.L_TimelineToday='Today';
	Strings.STS.L_SPDiscNoPreviewAvailable='No preview available for this reply';
	Strings.STS.L_NODOCView='There are no documents in this view.';
	Strings.STS.L_SPBlogPostAuthorCategories='by {0} in {1}';
	Strings.STS.L_SPBlogsNoItemsInCategory='There are no posts in this category.';
	Strings.STS.L_RelativeDateTime_Yesterday='Yesterday';
	Strings.STS.L_SPSelected='Selected';
	Strings.STS.L_Status_Text=' Status';
	Strings.STS.L_SPBlogPostOn='posted on {0} at {1}';
	Strings.STS.L_NewDocumentFolderImgAlt='Create a new folder';
	Strings.STS.L_SPDiscSaveChangesButton='Save Changes';
	Strings.STS.L_SPDiscDeleteConfirm='Are you sure you want to delete this post?';
	Strings.STS.L_BusinessDataField_ActionMenuAltText='Actions Menu';
	Strings.STS.L_SPMax='Maximum';
	Strings.STS.L_GSCallout='The Getting Started tasks are available from the Settings menu at any time.';
	Strings.STS.L_Timeline_BlankTLHelpfulText='Add tasks with dates to the timeline';
	Strings.STS.L_UserFieldInlineMore='^1, ^2, ^3, and ^4^5 more^6';
	Strings.STS.L_SPStdev='Std Deviation';
	Strings.STS.L_SPDiscNumberOfRepliesIntervals='0||1||2-';
	Strings.STS.L_SPDiscSubmitReplyButton='Reply';
	Strings.STS.L_ShowFewerItems='Show fewer';
	Strings.STS.L_SPAddNewDocument='new document';
	Strings.STS.L_AccRqEmptyView='You are all up to date! There are no requests pending.';
	Strings.STS.L_RelativeDateTime_Format_DateTimeFormattingString_Override='';
	Strings.STS.L_Mybrary_Branding_Text='SkyDrive Pro';
	Strings.STS.L_SPCategorySortPopular='What\'s hot';
	Strings.STS.L_SPDiscReportAbuseDialogTitle='Report offensive content';
	Strings.STS.L_BlogPostFolder='Posts';
	Strings.STS.L_SPDiscLike='Like';
	Strings.STS.L_viewedit_onetidSortAsc='Sort Ascending';
	Strings.STS.L_NewDocumentFolder='New folder';
	Strings.STS.L_SPDiscSortNewest='Newest';
	Strings.STS.L_SPDiscMetaLineCategory='In {0}';
	Strings.STS.L_SPReputationScore='reputation score';
	Strings.STS.L_Prev='Previous';
	Strings.STS.L_CalloutCreateSubtask='Create Subtask';
	Strings.STS.L_SPDiscCategoryPage='Category';
	Strings.STS.L_NewDocumentUploadFile='Upload existing file';
	Strings.STS.L_StatusBarYellow_Text='Important';
	Strings.STS.L_TimelineDisplaySummaryInfoOneDate='<strong>Title: </strong>{0}<br><strong> Date: </strong>{1}<br>';
	Strings.STS.L_SPCommentsAddButton='Post';
	Strings.STS.L_SPAddNewDevApp='new app to deploy';
	Strings.STS.L_SPDiscMarkAsFeaturedTooltip='Mark the selected discussions as Featured. Featured discussions show up at the top of their category.';
	Strings.STS.L_BusinessDataField_ActionMenuLoadingMessage='Loading...';
	Strings.STS.L_RelativeDateTime_XMinutesFuture='In {0} minute||In {0} minutes';
	Strings.STS.L_Dialog='Dialog';
	Strings.STS.L_SPDiscTopicPage='Topic';
	Strings.STS.L_SPBlogsShareCommand='Email a link';
	Strings.STS.L_SPSelection_Checkbox='Selection Checkbox';
	Strings.STS.L_SPCategorySortAlphaRev='Z-A';
	Strings.STS.L_OkButtonCaption='OK';
	Strings.STS.L_SPDiscUnmarkAsFeaturedTooltip='Remove this discussion from featured discussions.';
	Strings.STS.L_SPAvg='Average';
	Strings.STS.L_SPClientNoComments='There are no comments for this post.';
	Strings.STS.L_Next='Next';
	Strings.STS.L_TimelineDisplaySummaryInfoTwoDates='<strong>Title: </strong>{0}<br><strong> Start Date: </strong>{1}<br><strong> End Date: </strong> {2}<br>';
	Strings.STS.L_SPRatingsCountAltText='{0} people rated this.||{0} person rated this.||{0} people rated this.';
	Strings.STS.L_SPDiscSortMostLiked='Most liked';
	Strings.STS.L_SPBlogPostAuthorTimeCategories='by {0} at {1} in {2}';
	Strings.STS.L_SPDiscEdit='Edit';
	Strings.STS.L_SPClientEdit='edit';
	Strings.STS.L_SharedWithDialogTitle='Shared With';
	Strings.STS.L_SlideShowPrevButton_Text='Previous';
	Strings.STS.L_SPDiscReportAbuseDialogText2='Let us know what the problem is and we\'ll look into it.';
	Strings.STS.L_SPDiscHomePage='Community Home';
	Strings.STS.L_SPClientNumComments='Number of Comment(s)';
	Strings.STS.L_select_deselect_all='Select or deselect all items';
	Strings.STS.L_SPDiscSortDatePosted='Oldest';
	Strings.STS.L_SPDiscFilterFeatured='Featured';
	Strings.STS.L_SPDiscReported='Reported';
	Strings.STS.L_RelativeDateTime_AboutAMinute='About a minute ago';
	Strings.STS.L_SPDiscNumberOfBestResponsesIntervals='0||1||2-';
	Strings.STS.L_SPBlogsNoItemsInMonth='There are no posts in this month.';
	Strings.STS.L_SPDiscSubmitReportButton='Report';
	Strings.STS.L_NewDocumentWordImgAlt='Create a new Word document';
	Strings.STS.L_RelativeDateTime_XHoursFuture='In {0} hour||In {0} hours';
	Strings.STS.L_RelativeDateTime_AFewSecondsFuture='In a few seconds';
	Strings.STS.L_RelativeDateTime_Today='Today';
	Strings.STS.L_Subscribe_Text='Alert me';
	Strings.STS.L_SPMemberNotActive='This user is no longer a member of this community';
	Strings.STS.L_RelativeDateTime_AboutAMinuteFuture='In about a minute';
	Strings.STS.L_SPMembersNewHeader='New members';
	Strings.STS.L_SPMin='Minimum';
	Strings.STS.L_SPDiscPopularityBestResponse='best reply';
	Strings.STS.L_SPDiscSortMyPosts='My discussions';
	Strings.STS.L_MyDocsSharedWithMeNoDocuments='No one is sharing a document with you at this time.';
	Strings.STS.L_SPClientNew='new';
	Strings.STS.L_SaveThisViewButton='Save This View';
	Strings.STS.L_Loading_Text='Working on it...';
	Strings.STS.L_RelativeDateTime_XMinutesFutureIntervals='1||2-';
	Strings.STS.L_CalloutDeleteAction='Delete';
	Strings.STS.L_NODOCSEARCH='Your search returned no results.';
	Strings.STS.L_RelativeDateTime_XHoursFutureIntervals='1||2-';
	Strings.STS.L_SPView_Response='View Response';
	Strings.STS.L_SPGroupBoardTimeCardSettingsNotFlex='Normal';
	Strings.STS.L_SPDiscPostTimestampEdited='{0}, edited {1}';
	Strings.STS.L_SPDiscNumberOfRatings='{0} ratings||{0} rating||{0} ratings';
	Strings.STS.L_TimelineStart='Start';
	Strings.STS.L_SPDiscCancelReplyButton='Cancel';
	Strings.STS.L_SPDiscUnmarkAsFeatured='Unmark as featured';
	Strings.STS.L_NewDocumentExcel='Excel workbook';
	Strings.STS.L_AddCategory='Add Category';
	Strings.STS.L_idPresEnabled='Presence enabled for this column';
	Strings.STS.L_CalloutLastEditedHeader='Last edited by';
	Strings.STS.L_SPAddNewItem='new item';
	Strings.STS.L_DocLibCalloutSize='300';
	Strings.STS.L_SPStopEditingTitle='Stop editing and save changes.';
	Strings.STS.L_NODOC='There are no files in the view \"%0\".';
	Strings.STS.L_RequiredField_Text='Required Field';
	Strings.STS.L_BlogCategoriesFolder='Categories';
	Strings.STS.L_SPAddNewAndDrag='{0} or drag files here';
	Strings.STS.L_SlideShowNextButton_Text='Next';
	Strings.STS.L_SPMembersReputedHeader='Top contributors';
	Strings.STS.L_SPMemberSince='Joined {0}';
	Strings.STS.L_SPBlogsEditCommand='Edit';
	Strings.STS.L_SPDiscReplyPlaceholder='Add a reply';
	Strings.STS.L_SPAddNewEvent='new event';
	Strings.STS.L_HideThisTooltip='Remove these tiles from the page and access them later from the Site menu.';
	Strings.STS.L_NewBlogPostFailed_Text='Unable to connect to the blog program because it may be busy or missing. Check the program, and then try again.';
	Strings.STS.L_Categories='Categories';
	Strings.STS.L_SPRepliesToReachNextLevelIntervals='0||1||2-';
	Strings.STS.L_SPDiscDelete='Delete';
	Strings.STS.L_SPClientNext='Next';
	Strings.STS.L_SPDiscNumberOfReplies='{0} replies||{0} reply||{0} replies';
	Strings.STS.L_RelativeDateTime_XHours='{0} hour ago||{0} hours ago';
	Strings.STS.L_SPClientNumCommentsTemplate='{0} comments||{0} comment||{0} comments';
	Strings.STS.L_SPDiscNumberOfDiscussionsIntervals='0||1||2-';
	Strings.STS.L_SPAddNewLink='new link';
	Strings.STS.L_RelativeDateTime_XMinutesIntervals='1||2-';
	Strings.STS.L_CalloutTargetAltTag='Callout';
	Strings.STS.L_CSR_NoSortFilter='This column type can\'t be sorted or filtered.';
	Strings.STS.L_SPDiscBestHeader='Best reply';
	Strings.STS.L_SharingHintShared='Shared with some people';
	Strings.STS.L_SPDiscBest='Best reply';
	Strings.STS.L_SPDiscFeaturedHeader='Featured discussions';
	Strings.STS.L_SPDiscReportAbuseSuccessNotification='Thank you! Administrators will soon look into your report.';
	Strings.STS.L_CalloutDispBarsAction='Display as bar';
	Strings.STS.L_RelativeDateTime_DayAndTime='{0} at {1}';
	Strings.STS.L_NewDocumentPowerPoint='PowerPoint presentation';
	Strings.STS.L_SPDiscNumberOfLikesIntervals='0||1||2-';
	Strings.STS.L_SPDiscInitialPost='By {0}';
	Strings.STS.L_CalloutOpenAction='Open';
	Strings.STS.L_SPClientNoTitle='No Title';
	Strings.STS.L_SPDiscSubmitEditButton='Save';
	Strings.STS.L_SPCollapse='collapse';
	Strings.STS.L_SPVar='Variance';
	Strings.STS.L_ImgAlt_Text='Picture';
	Strings.STS.L_SPRepliesToReachNextLevel='Earn {0} more points to move to the next level||Earn {0} more point to move to the next level||Earn {0} more points to move to the next level';
	Strings.STS.L_SPRatingsRatedAltText='You rated this as {0} stars. To modify, click on the stars.||You rated this as {0} star. To modify, click on the stars.||You rated this as {0} stars. To modify, click on the stars.';
	Strings.STS.L_SPClientNumCommentsTemplateIntervals='0||1||2-';
	Strings.STS.L_SPDiscSortMostRecent='Recent';
	Strings.STS.L_OpenInWebViewer_Text='Open in web viewer: ^1';
	Strings.STS.L_SPDiscSortUnanswered='Unanswered questions';
	Strings.STS.L_OpenMenu='Open Menu';
	Strings.STS.L_SPEmailPostLink='Email Post Link';
	Strings.STS.L_SPDiscMembersPage='Members';
	Strings.STS.L_SPDiscLastReply='Latest reply by {0}';
	Strings.STS.L_UserFieldInlineThree='^1, ^2, and ^3';
	Strings.STS.L_NewDocumentCalloutSize='280';
	Strings.STS.L_MyDocsSharedWithMeAuthorColumnTitle='Shared By';
	Strings.STS.L_ShowMoreItems='Show more';
	Strings.STS.L_NewBlogPost_Text='Unable to find a SharePoint compatible application.';
	Strings.STS.L_SPRatingsNotRatedAltTextIntervals='0||1||2-';
	Strings.STS.L_ListsFolder='Lists';
	Strings.STS.L_SPDiscLastActivity='Last active on {0}';
	Strings.STS.L_RelativeDateTime_TomorrowAndTime='Tomorrow at {0}';
	Strings.STS.L_SPBlogsEnumSeparator=', ';
	Strings.STS.L_ViewSelectorCurrentView='Current View';
	Strings.STS.L_SPBlogsCommentCommand='Comment';
	Strings.STS.L_SPDiscMarkAsFeatured='Mark as featured';
	Strings.STS.L_StatusBarBlue_Text='Information';
	Strings.STS.L_SPAddNewAndEdit='{0} or {1}edit{2} this list';
	Strings.STS.L_BusinessDataField_Blank='(Blank)';
	Strings.STS.L_Mybrary_Branding_Text2='{0} for Business';
	Strings.STS.L_MruDocs_WebpartTitle='Recent Documents';
	Strings.STS.L_viewedit_onetidSortDesc='Sort Descending';
	Strings.STS.L_CalloutEditDatesAction='Edit date range';
	Strings.STS.L_RelativeDateTime_XHoursIntervals='1||2-';
	Strings.STS.L_SPDiscReportAbuse='Report to moderator';
	Strings.STS.L_SPAddNewAnnouncement='new announcement';
	Strings.STS.L_RelativeDateTime_AFewSeconds='A few seconds ago';
	Strings.STS.L_SPDiscRepliedToLink='{0}\'s post';
	Strings.STS.L_SPRatingsCountAltTextIntervals='0||1||2-';
	Strings.STS.L_NewDocumentExcelImgAlt='Create a new Excel workbook';
	Strings.STS.L_RelativeDateTime_XDaysFutureIntervals='1||2-';
	Strings.STS.L_NoTitle='No Title';
	Strings.STS.L_SPDiscExpandPostAltText='Expand post';
	Strings.STS.L_SPDiscPostImageIndicatorAltText='This post contains an image.';
	Strings.STS.L_SPCategoryEmptyFillerText='What do you want to talk about? Add some {0}.';
	Strings.STS.L_SPMeetingWorkSpace='Meeting Workspace';
	Strings.STS.L_AddColumnMenuTitle='Add Column';
	Strings.STS.L_RelativeDateTime_Tomorrow='Tomorrow';
	Strings.STS.L_CalloutShareAction='Share';
	Strings.STS.L_SharedWithNone='Only shared with you';
	Strings.STS.L_SPCategorySortAlpha='A-Z';
	Strings.STS.L_SPEllipsis='...';
	Strings.STS.L_BusinessDataField_UpdateImageAlt='Refresh External Data';
	Strings.STS.L_RelativeDateTime_XDaysFuture='{0} day from now||{0} days from now';
	Strings.STS.L_SPDiscHeroLinkFormat='new discussion';
	Strings.STS.L_SPNo='No';
	Strings.STS.L_SPBlogPostAuthor='by {0}';
	Strings.STS.L_SPBlogsNoItems='There are no posts in this blog.';
	Strings.STS.L_TimelineDateRangeFormat='{0} - {1}';
	Strings.STS.L_SPDiscCollapsePostAltText='Collapse post';
	Strings.STS.L_SPStopEditingList='{0}Stop{1} editing this list';
	Strings.STS.L_EmptyList='The list is empty. Add tiles from the {0} view.';
	Strings.STS.L_NewDocumentExcelFormImgAlt='Create a new Excel survey';
	Strings.STS.L_NewDocumentPowerPointImgAlt='Create a new PowerPoint presentation';
	Strings.STS.L_UserFieldInlineTwo='^1 and ^2';
	Strings.STS.L_SPDiscUnlike='Unlike';
	Strings.STS.L_SPAddNewItemTitle='Add a new item to this list or library.';
	Strings.STS.L_SPDiscRepliedToLabel='In response to {0}';
	Strings.STS.L_NewDocumentExcelForm='Excel survey';
	Strings.STS.L_OpenMenuKeyAccessible='Click to sort column';
	Strings.STS.L_SPAddNewPicture='new picture';
	Strings.STS.L_NewDocumentCalloutTitle='Create a new file';
	Strings.STS.L_Copy_Text='Copy';
	Strings.STS.L_SPDiscAllRepliesLabel='All replies';
	Strings.STS.L_SPMembersTopContributorsHeader='Top contributors';
	Strings.STS.L_SPDiscHeroLinkAltText='add new discussion';
	Strings.STS.L_SPClientPrevious='Previous';
	Strings.STS.L_StatusBarGreen_Text='Success';
	Strings.STS.L_SPYes='Yes';
	Strings.STS.L_HideThis='Remove this';
	Strings.STS.L_RelativeDateTime_Format_DateTimeFormattingString='{0}, {1}';
	Strings.STS.L_OpenMenu_Text='Open Menu';
	Strings.STS.L_SPMerge='Merge';
	Strings.STS.L_SPRelink='Relink';
	Strings.STS.L_SPDiscBestUndoTooltip='Remove as best reply';
	Strings.STS.L_RelativeDateTime_AboutAnHourFuture='In about an hour';
	Strings.STS.L_NewDocumentWord='Word document';
	Strings.STS.L_RelativeDateTime_AboutAnHour='About an hour ago';
	Strings.STS.L_SPAddNewApp='new app';
	Strings.STS.L_MruDocs_ErrorMessage='We couldn\'t find any recently used documents for you.';
	Strings.STS.L_All_PromotedLinks='All Promoted Links';
	Strings.STS.L_RelativeDateTime_XDaysIntervals='1||2-';
	Strings.STS.L_SPDiscSortAnswered='Answered questions';
	Strings.STS.L_NewDocumentOneNoteImgAlt='Create a new OneNote notebook';
	Strings.STS.L_OpenInClientApp_Text='Open in ^1: ^2';
	Strings.STS.L_RelativeDateTime_YesterdayAndTime='Yesterday at {0}';
	Strings.STS.L_SPRatingsRatedAltTextIntervals='0||1||2-';
	Strings.STS.L_SPDiscReportAbuseDialogText1='How can we help? We hear you have an issue with this post:';
	Strings.STS.L_AddLink='Add Link';
	Strings.STS.L_SPCount='Count';
	Strings.STS.L_SPDiscNumberOfDiscussions='{0} discussions||{0} discussion||{0} discussions';
	Strings.STS.L_ProfileSettingSave_Title='Profile Changes';
	Strings.STS.L_SelectBackColorKey_TEXT='W';
	Strings.STS.L_SPDiscRefresh='Refresh';
	Strings.STS.L_SPDiscNumberOfRatingsIntervals='0||1||2-';
	Strings.STS.L_SPCategoryEmptyFillerTextCategory='categories';
	Strings.STS.L_RelativeDateTime_XDays='{0} day ago||{0} days ago';
	Strings.STS.L_StatusBarRed_Text='Very Important';
	Strings.STS.L_NewDocumentOneNote='OneNote notebook';
	Strings.STS.L_SPDiscReply='Reply';
	Strings.STS.L_CalloutLastEditedNameAndDate2='Changed by you on ^1';
	Strings.STS.L_SPAddNewTask='new task';
	Strings.STS.L_SPSum='Sum';
	Strings.STS.L_CalloutLastEditedYou='you';
	Strings.STS.L_SPDiscNumberOfBestResponses='{0} best replies||{0} best reply||{0} best replies';
	Strings.STS.L_SPCommentsAdd='Add a comment';
	Strings.STS.L_SPBlogPostAuthorTime='by {0} at {1}';
	Strings.STS.L_TimelineFinish='Finish';
	Strings.STS.L_SPExpand='expand';
	Strings.STS.L_SPEditListTitle='Edit this list using Quick Edit mode.';
	Strings.STS.L_RelativeDateTime_XMinutes='{0} minute ago||{0} minutes ago';
	Strings.STS.L_SPDiscSortWhatsHot='What\'s hot';
	Strings.STS.L_InPageNavigation='In page navigation';
	Strings.STS.L_SPDiscBestTooltip='Set as best reply';
	Strings.STS.L_SPCheckedoutto='Checked Out To';
	Strings.STS.L_SPRatingsNotRatedAltText='Click to apply your rating as {0} stars.||Click to apply your rating as {0} star.||Click to apply your rating as {0} stars.';
}