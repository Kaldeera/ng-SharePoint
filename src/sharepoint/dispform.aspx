

<%@ Page language="C#" MasterPageFile="~masterurl/default.master"    Inherits="Microsoft.SharePoint.WebPartPages.WebPartPage,Microsoft.SharePoint,Version=15.0.0.0,Culture=neutral,PublicKeyToken=71e9bce111e9429c" meta:webpartpageexpansion="full" meta:progid="SharePoint.WebPartPage.Document"  %>
<%@ Register Tagprefix="SharePoint" Namespace="Microsoft.SharePoint.WebControls" Assembly="Microsoft.SharePoint, Version=15.0.0.0, Culture=neutral, PublicKeyToken=71e9bce111e9429c" %>
<%@ Register Tagprefix="Utilities" Namespace="Microsoft.SharePoint.Utilities" Assembly="Microsoft.SharePoint, Version=15.0.0.0, Culture=neutral, PublicKeyToken=71e9bce111e9429c" %>
<%@ Import Namespace="Microsoft.SharePoint" %>
<%@ Assembly Name="Microsoft.Web.CommandUI, Version=15.0.0.0, Culture=neutral, PublicKeyToken=71e9bce111e9429c" %>
<%@ Register Tagprefix="WebPartPages" Namespace="Microsoft.SharePoint.WebPartPages" Assembly="Microsoft.SharePoint, Version=15.0.0.0, Culture=neutral, PublicKeyToken=71e9bce111e9429c" %>
<asp:Content ContentPlaceHolderId="PlaceHolderPageTitle" runat="server">
	<SharePoint:ListFormPageTitle runat="server"/>
</asp:Content>
<asp:Content ContentPlaceHolderId="PlaceHolderPageTitleInTitleArea" runat="server">
	<span class="die">
		<SharePoint:ListProperty Property="LinkTitle" runat="server" id="ID_LinkTitle"/>
	</span>
</asp:Content>
<asp:Content ContentPlaceHolderId="PlaceHolderPageImage" runat="server">
	<img src="/_layouts/15/images/blank.gif" width='1' height='1' alt="" />
</asp:Content>

<asp:Content ContentPlaceHolderId="PlaceHolderMain" runat="server">

	<SharePoint:UIVersionedContent UIVersion="4" runat="server">
		<ContentTemplate>
			<div style="padding-left:5px"></ContentTemplate>
		</SharePoint:UIVersionedContent>
		
		<table class="ms-core-tableNoSpace" id="onetIDListForm">
			<tr>
				<td>
					<WebPartPages:WebPartZone runat="server" FrameType="None" ID="Main" Title="loc:Main">
						<ZoneTemplate></ZoneTemplate>
					</WebPartPages:WebPartZone>
					
					
					<div data-spformpage="">

<!--							<spform-rule test=""></spform-rule>-->

						<spform item="item" mode="display"></spform>
					</div>
					
				</td>
			</tr>
		</table>
		
		<SharePoint:UIVersionedContent UIVersion="4" runat="server">
			<ContentTemplate></div>
		</ContentTemplate>
	</SharePoint:UIVersionedContent>

	<script type="text/javascript" src="https://ajax.googleapis.com/ajax/libs/angularjs/1.2.16/angular.min.js"></script>
	<script type="text/javascript" src="/app/ng-sharepoint/ng-sharepoint.sharepoint.templates.js"></script>
	<script type="text/javascript" src="/app/ng-sharepoint/ng-sharepoint.js"></script>

</asp:Content>

<asp:Content ContentPlaceHolderId="PlaceHolderAdditionalPageHead" runat="server">
	<SharePoint:UIVersionedContent UIVersion="4" runat="server">
		<ContentTemplate>
			<SharePoint:CssRegistration Name="forms.css" runat="server"/>
		</ContentTemplate>
	</SharePoint:UIVersionedContent>

	<!-- HTML5 shim, for IE6-8 support of HTML5 elements -->
	<!--[if lt IE 9]>
	<script src="http://localhost:8080/libs/html5-shiv-3.7.0.min.js"></script>
	<![endif]-->

</asp:Content>

<asp:Content ContentPlaceHolderId="PlaceHolderTitleLeftBorder" runat="server">
	<table cellpadding="0" height="100%" width="100%" cellspacing="0">
		<tr>
			<td class="ms-areaseparatorleft">
				<img src="/_layouts/15/images/blank.gif" width='1' height='1' alt="" />
			</td>
		</tr>
	</table>
</asp:Content>

<asp:Content ContentPlaceHolderId="PlaceHolderTitleAreaClass" runat="server">
	<script type="text/javascript" id="onetidPageTitleAreaFrameScript">
	if (document.getElementById("onetidPageTitleAreaFrame") != null)
	{
		document.getElementById("onetidPageTitleAreaFrame").className="ms-areaseparator";
	}
</script>
</asp:Content>
<asp:Content ContentPlaceHolderId="PlaceHolderBodyAreaClass" runat="server">
	<SharePoint:StyleBlock runat="server">
		.ms-bodyareaframe {
	padding: 8px;
	border: none;
}
	</SharePoint:StyleBlock>
</asp:Content>
<asp:Content ContentPlaceHolderId="PlaceHolderBodyLeftBorder" runat="server">
	<div class='ms-areaseparatorleft'>
		<img src="/_layouts/15/images/blank.gif" width='8' height='100%' alt="" />
	</div>
</asp:Content>
<asp:Content ContentPlaceHolderId="PlaceHolderTitleRightMargin" runat="server">
	<div class='ms-areaseparatorright'>
		<img src="/_layouts/15/images/blank.gif" width='8' height='100%' alt="" />
	</div>
</asp:Content>
<asp:Content ContentPlaceHolderId="PlaceHolderBodyRightMargin" runat="server">
	<div class='ms-areaseparatorright'>
		<img src="/_layouts/15/images/blank.gif" width='8' height='100%' alt="" />
	</div>
</asp:Content>
<asp:Content ContentPlaceHolderId="PlaceHolderTitleAreaSeparator" runat="server"/>