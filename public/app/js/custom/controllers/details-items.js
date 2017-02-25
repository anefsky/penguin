app.controller('detailsItemsCtrl', function($scope, $location, $anchorScroll) {

	function init() {
		initScopeProperties();
		setLoadResponseHandler();
	}

	function initScopeProperties() {
		$scope.itemData = {};
		$scope.itemData.items = [];
	}

	function setLoadResponseHandler() {

		$scope.$on('do-update-items', function(event, data) {
			var fullRefresh = false;
			updateItemsList(data, fullRefresh);
		});

		$scope.$on('do-update-pagination-and-items', function(event, data) {
			var fullRefresh = true;
			updateItemsList(data, fullRefresh);
		});
	}

	function showBottomPaginationPanel(doShow) {
		$scope.$emit('show-bottom-pagination-panel', {doShow: doShow});
	}

	function updateItemsList(data, isFullRefresh) {
			var action = data.action;

			switch(action) {
				case 'DISPLAY_DATA':
					if(data.action === 'DISPLAY_DATA') {
						var items = data.data.data.list;
						createItemsList(items);
					}
					showBottomPaginationPanel($scope.itemData.items.length >= 10);
					break;
				case 'START_WAIT' :

					if(isFullRefresh) {
						$location.hash('top'); // go to top of page
					} else {
						$location.hash('go-here-for-subsequent-page-changes');
					}

					$anchorScroll();
					clearItems(); // clear list so spinner shows at proper height
					$scope.$emit('show-bottom-pagination-panel', { doShow: false });
					$scope.doStartWait();
					break;
				case 'STOP_WAIT' :
					$scope.doStopWait();
					break;
				default : 
					console.log('ERROR: bad action: ' + action);

			}
	}

	function clearItems() {
		$scope.itemData.items = [];
	}

	function createItemsList(items) {
		$scope.itemData.items = [];  // clear list
		
		items.forEach(function(item) {
			var itemObj = {
				itemNumber: item.bidItemNumber,
				id: item.itemCode,
				description: item.itemDescription,
				quantity: item.quantity,
				imgLink: item.imgLink,
				price: item.newPrice,
				requireBuyersReview : item.requireBuyersReview,
				lineNum: item.lineNo,
				manufacturerLogo: item.manufactureLogo,
				weight: item.weight,
				weightUnit: item.weightUnit,
				leaveAsIs: item.bestOffer,
				bidItemNumber: item.bidItemNumber,
				qtyOnHand: item.qtyOnHand,
				qtyOnPo: item.qtyOnPo,
				catalogueNumber: item.catalogNumber,

				buyerCode: (function() { // TODO: improve test for missing object
					return (item.buyer ? item.buyer.buyerCode : '');
				})()
			};
			$scope.itemData.items.push(itemObj);
		});
	}

	init();
});

