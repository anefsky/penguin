app.controller("detailsPaginationCtrl", function($scope, utils, paginationService) {

	var _sharedPaginationData;
	var _key = 'detailsListPaging';  // TODO: move to ng-init?

	function init() {
		_sharedPaginationData = new SharedPaginationData();
	}

	function SharedPaginationData() {

		var dataObj = paginationService.getData(_key);
		dataObj.itemsPerPage = getItemsPerPage();

		$scope.data = dataObj;

		function getDefaultItemsPerPage() {
			return dataObj.defaultItemsPerPage;
		};	

		function getItemsPerPageLocalStorageKey() {
			return _key;
		};
				
		function getItemsPerPage() {
			return parseInt(utils.getLocalStorage(getItemsPerPageLocalStorageKey())) || getDefaultItemsPerPage();
		};
		return {
			getItemPerPageLocalStorageKey : function() {
				return getItemsPerPageLocalStorageKey();
			},
			getItemsPerPage : function() {
				return getItemsPerPage();
			}
		};	
	}

	function updateModel(paginationData) {
		$scope.data.totalItems = paginationData.totalCount;
		$scope.data.startItem = paginationData.startItemBaseOne;
	}

	$scope.$on('do_go_to_first_page', function() {
		goToFirstPage();
	});

	$scope.updatePaginatedList = function() {
		$scope.$emit('get_details_items', 
			{broadcastId: 'do-update-items'}  
		);
	};

	$scope.refreshPaginatedList = function() {
		$scope.$emit('get_details_items', 
			{broadcastId: 'do-update-pagination-and-items'}  
		);
	};

	function goToFirstPage() {
		$scope.data.currentPage = 1;
	};

	$scope.saveItemsPerPage = function(qty) {
		utils.setLocalStorage(_sharedPaginationData.getItemPerPageLocalStorageKey(), qty);
	};

	$scope.getPaginationCaption = function() {
		var pageObj = $scope.data;
		var startRecord = (pageObj.currentPage - 1) * pageObj.itemsPerPage + 1; 
		var lastPossibleRecordOnPage = startRecord + pageObj.itemsPerPage - 1;
		var lastRecord = lastPossibleRecordOnPage < pageObj.totalItems ? lastPossibleRecordOnPage : pageObj.totalItems;

		var caption;

		if(!pageObj || lastRecord === undefined) {
			caption = '';
		} else if (lastRecord === 0) {	
			caption =  'No records found';
		} else {
			caption = "Records "  + startRecord + " - " + lastRecord + " of " + pageObj.totalItems;
		}
		return caption;
	};

	$scope.getItemsPerPage = function() {
		return _sharedPaginationData.getItemsPerPage();
	};

	$scope.$on('do-update-pagination-and-items', function(event, data) {
		var action = data.action;

		switch(action) {
			case 'DISPLAY_DATA':
				var paginationData = {};
				paginationData.totalCount = data.data.data.total;
				paginationData.returnedCount = data.data.data.count;				
				paginationData.startItemBaseOne = data.data.data.searchRequest.pageInfo.startIndex + 1;

				updateModel(paginationData);
				break;
			case 'START_WAIT' :
				$scope.doStartWait();
				break;
			case 'STOP_WAIT' :
				$scope.doStopWait();
				break;
			default : 
				console.log('ERROR: bad action: ' + action);

		}
	});


	init();
	
});
