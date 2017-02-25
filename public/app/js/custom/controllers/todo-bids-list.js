app.controller("todoBidsListCtrl", function($scope,	utils, $location, $anchorScroll) {

	function init() {
		setEmitHandlers();
	}

	function setEmitHandlers() {
		var emitIds = [
			'do-update-bids',
			'do-update-pagination-and-bids'
		];

		$scope.$on('do-update-bids', function(event, data) {
			var fullRefresh = false;
			handleBroadcast(data, fullRefresh);
		});

		$scope.$on('do-update-pagination-and-bids', function(event, data) {
			var fullRefresh = true;
			handleBroadcast(data, fullRefresh);
		});

		$scope.$on('do-clear-bids', function() {
			clearBids();
		});
	}

	function showBottomPaginationPanel(doShow) {
		$scope.$emit('show-bottom-pagination-panel', {doShow: doShow});
	}

	function handleBroadcast(data, isFullRefresh) {
		var displayData = data.data;
		var action = data.action;

		switch(action) {
			case 'DISPLAY_DATA':
				var todoList = data.data.data.list;
				var allRecords = getModel(todoList).bids;	
				$scope.bids = allRecords;
				showBottomPaginationPanel($scope.bids.length >= 10);

				break;
			case 'START_WAIT' :
				
				if(isFullRefresh) {
					$location.hash('top'); // go to top of page
				} else {
					$location.hash('go-here-for-subsequent-page-changes');
				}
				
				$anchorScroll();
				clearBids(); // clear list so spinner shows at proper height
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


	function clearBids() {
		$scope.bids = null
	}

	function getModel(todoList) {

		var model = {};
		model.bids = [];
			
		todoList.forEach(function(todoItem) {
			var obj = {
					'bidNum' : todoItem.id,
					'customerName' : todoItem.customer.companyName,
					'parentName' : todoItem.customer.parentCustomer ? todoItem.customer.parentCustomer.companyName : "",
					'location' : todoItem.customer.shippingState,
					'amount' : todoItem.orderTotal,
            		'stages' : {
              			"values" : [
              				"1",
              				"2",
              				"3"
              			],
              			"selected" : todoItem.stageNumber
            		},
            		'priority' : 'priority_' + todoItem.priority.id.toLowerCase(),
            		'status' : 'status_' + todoItem.status.toLowerCase(),
            		'dueDateUnixMs' : todoItem.dueDateTime || null
			};
			
			obj.buyers = [];
			
			var buyers = todoItem.buyers;

			buyers.forEach(function(buyer, index) {
				
				obj.buyers.push({
					'buyerCode' : buyer.buyer.buyerCodes[0],
					'buyerName' : buyer.buyer.name,
					'buyerStatus' : buyer.reviewCount === 0 ? 'no-issues' : buyer.status
				});
			});
			
			// create two groups: has and does not have issues, sort each group alphabetically
			var arrHasIssues =  obj.buyers.filter(function(buyer) {
				return buyer.buyerStatus !== 'no-issues';
			});
			arrHasIssues.sort(function(a,b) {
				return a.buyerCode < b.buyerCode ? -1 : a.buyerCode > b.buyerCode ? 1 : 0;
			});
			
			var arrHasNoIssues =  obj.buyers.filter(function(buyer) {
				return buyer.buyerStatus === 'no-issues';
			});
			arrHasNoIssues.sort(function(a,b) {
				return a.buyerCode < b.buyerCode ? -1 : a.buyerCode > b.buyerCode ? 1 : 0;
			});
			
			arrAllBuyersSorted = arrHasIssues.concat(arrHasNoIssues);
			
			obj.buyers = arrAllBuyersSorted;
			
			model.bids.push(obj);
		});
		return model;
	};

	$scope.getBuyerStatusTooltip = function(statusString) {
		var mapStatusToTooltip = {
			'HOLD' : 'on hold',
			'DONE' : 'done'
		};
		return mapStatusToTooltip[statusString];
	};
	
	$scope.getBidStatusTooltip = function(statusString) {
		var mapStatusToTooltip = {
			'HOLD' : 'on hold',
			'ACTIVE' : 'active'
		};
		return mapStatusToTooltip[statusString];
	};
	
	function getDateInNextTwoWeeks() { // mock date
		var daysForward = Math.floor(14 * Math.random());
		var date = new Date();
		var newDate = new Date(date);
		newDate.setDate(newDate.getDate() + daysForward);
		return newDate.toLocaleDateString("en-US");
	}

	init();

});
