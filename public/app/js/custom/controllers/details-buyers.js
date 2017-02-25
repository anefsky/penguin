app.controller('detailsBuyersCtrl', function($scope) {

	function init() {
		initScopeProperties();
		setScopeFunctionHandlers();
	}

	function initScopeProperties() {
		$scope.data = {};
		$scope.data.allBuyers = [];
		$scope.data.selectedBuyers = [];
		$scope.data.selectedBuyerUserIds = []
	}

	function setScopeFunctionHandlers() {

		$scope.loadItemsFirstPage = function() {
			$scope.requestItemsFirstPageLoad();
		};


		$scope.requestItemsFirstPageLoad = function() {
			$scope.$emit('set_pagination_to_first_page');
			$scope.$emit('get_details_items', {
				broadcastId: 'do-update-pagination-and-items'
			});
		};


		$scope.clearAllSelected = function() {
			$scope.data.selectedBuyers = [];
			$scope.data.allBuyers.forEach(function(buyer) {
				buyer.isSelected = false;
			});
			$scope.updateSelectedBuyerUserIds();
		};

		$scope.selectBuyer = function(buyer) {
			if(buyer.isSelected === true) { // already selected
				$scope.deselectBuyer(buyer);
			} else {
				buyer.isSelected = true;
				addToSelectedBuyersList(buyer);
				$scope.updateSelectedBuyerUserIds();
			}
		};

		$scope.deselectBuyer = function(clickedBuyer) {

			$scope.data.allBuyers.forEach(function(buyer, index) {
				if(buyer.userId === clickedBuyer.userId) {
					buyer.isSelected = false;
				}
			});

			var matchedIndex;
			$scope.data.selectedBuyers.forEach(function(buyer, index) {
				if(buyer.userId === clickedBuyer.userId) {
					matchedIndex = index;
				}
			});

			$scope.data.selectedBuyers.splice(matchedIndex, 1);
			$scope.updateSelectedBuyerUserIds();
		};

		$scope.addToSelectedBuyersList = function(buyer) {
			$scope.data.selectedBuyers.push(buyer);
		};

		$scope.updateSelectedBuyerUserIds = function() {
			var selectedBuyerUserIds = [];
			$scope.data.selectedBuyers.forEach(function(buyer) {
				var buyerUserId = buyer.userId;
				selectedBuyerUserIds.push(buyerUserId);
			});
			$scope.data.selectedBuyerUserIds = selectedBuyerUserIds;
		};

	}
	init();
});

