app.directive('bhPaginationPanel', function() {

	function link(scope, elem, attrs) {
		scope.popup = {};
		scope.popup.isOpen = false;
	}

	return {
		link: link,
		templateUrl : 'app/html/templates/tpl-pagination-panel.html'
	};

});	