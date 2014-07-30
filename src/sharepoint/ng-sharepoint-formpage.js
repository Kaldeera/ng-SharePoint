angular.module('ngSharePointFormPage', ['ngSharePoint']);


angular.module('ngSharePointFormPage').directive('spformpage', ['SharePoint', 'SPUtils', function(SharePoint, SPUtils) {
	
	return {

		restrict: 'EA',

		link: function($scope, $element, $attrs) {

			var listId = _spPageContextInfo.pageListId;
			var itemId = utils.getQueryStringParamByName('ID');

			if (listId !== void 0 && itemId !== void 0) {

				SharePoint.getWeb()
					.then(function(web) { return web.getList(listId); })
					.then(function(list) { return list.getItemById(itemId); })
					.then(function(item) {
						$scope.item = item;
					});
					
			}


			$scope.onPreSave = function(item) {
				console.log('>>>> onPreSave', item);
			};


			$scope.onPostSave = function(item) {
				console.log('>>>> onPostSave', item);
			};


			$scope.onCancel = function(item) {
				console.log('>>>> onCancel', item);
			};

		}

	};

}]);




var element = document.querySelector('[data-spformpage]');

if (element) {
	angular.bootstrap(element, ['ngSharePointFormPage']);
}