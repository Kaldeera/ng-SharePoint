angular.module('ngSharePointFormpage', ['ngSharePoint']);


angular.module('ngSharePointFormpage').directive('spformpage', ['SharePoint', 'SPUtils', function(SharePoint, SPUtils) {
	
	return {

		restrict: 'EA',

		link: function($scope, $element, $attrs) {

			console.log(">>>>> SPFormPage directive");

			var listId = _spPageContextInfo.pageListId;
			var itemId = utils.getQueryStringParamByName('ID');

			SharePoint.getWeb()
				.then(function(web) { return web.getList(listId); })
				.then(function(list) { return list.getItemById(itemId); })
				.then(function(item) {
					$scope.item = item;

					SPUtils.loadScript('sp.ribbon.js', '').then(function() {
						_ribbonInitFunc1();
					});
					
				});


		}

	};

}]);




var element = document.querySelector('[data-spformpage]');

if (element) {
	angular.bootstrap(element, ['ngSharePointFormpage']);
}