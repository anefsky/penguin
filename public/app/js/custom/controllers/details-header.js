app.controller('detailsHeaderCtrl', function($scope, $timeout, utils) {

	function init() {
		$scope.data = {};
		var bidId = utils.getUrlParamValue('bid_id');

		$scope.$emit('set_filter_item', {
			id: 'bidId',
			value: bidId
		});

		doSelfLoad();
	}

	$scope.openBidSettingsModal = function() {
		$scope.$emit('open-bid-settings-modal', {
			bidId: $scope.data.bidId,
			bidTypeOptions: $scope.data.bidTypeOptions,
			bidPriorityOptions: $scope.data.bidPriorityOptions,
			bidType: $scope.data.bidType,
			bidPriority: $scope.data.bidPriority,
			commitmentDateStart: $scope.data.commitmentDateStart,
			commitmentDateEnd: $scope.data.commitmentDateEnd,
			dueDateTime: $scope.data.dueDateTime
		});
	};

	function getPageOptions() {
		return [
			{
				label: 'Bid setup',
				iconCode: 'fa-cog',
				action: $scope.openBidSettingsModal
			}
		];
	}

	function doSelfLoad() {
		$scope.$emit('get_details_header',{
			broadcastId: 'do_get_details_header'
		});
	}

	$scope.$on('do_get_details_header', function(event, data) {
		handleLoadBroadcast(data, true);
	});

	$scope.$on('do_get_details_header_only', function(event, data) {
		handleLoadBroadcast(data, false);
	});

	$scope.doShowDaysRemaining = function() {
		var startShowingDaysBefore = 15;
		var timeRemaining = $scope.data.dueDateTime - (new Date()).getTime();
		var millisecondsPerDay = 24 * 60 * 60 * 1000;
		var daysRemaining = timeRemaining / millisecondsPerDay;
		$scope.data.daysRemaining =Math.round(daysRemaining);
		return daysRemaining > 0 && daysRemaining < startShowingDaysBefore;
	}

	function requestBuyersLoad() {
		$scope.$emit('get_details_buyers', {
			broadcastId: 'do_get_details_buyers'
		});
	}

	function handleLoadBroadcast(data, loadFollowupModules) {
		var action = data.action;

		switch(action) {
			case 'DISPLAY_DATA':
				if(data.action === 'DISPLAY_DATA') {
					var headerDetails = data.data.data;
					handleData(headerDetails);
					$scope.dataLoaded = true;
				}
				break;
			case 'START_WAIT' :
				$scope.doStartWait();
				break;
			case 'STOP_WAIT' :
				$scope.doStopWait();
				if (loadFollowupModules) {
					requestBuyersLoad();
				}
				break;
			default : 
				console.log('ERROR: bad action: ' + action);
		}
	}

	function handleData(data) {
		$scope.data = {
			bidId: data.id,
			bidderName: data.bidder.bidder.name,
			bidderPhoneExt: data.bidder.bidder.extension,
			customerIndustry: data.customer.industry,
			city: data.customer.shippingCity,
			state: data.customer.shippingState,
			orderDateUnixMs: data.orderDate,
			stageNumber: data.stageNumber,
			orderTotal: data.orderTotal,
			availableStages : [
              				"1",
              				"2",
              				"3"
            ],
            pageOptions: getPageOptions(),
            bidTypeOptions: data.bidOptions.bidType,
            bidType: data.bidType,
            bidPriority: data.priority,
            bidPriorityOptions: data.bidOptions.priority,
            commitmentDateStart: data.commitmentDate.start,
            commitmentDateEnd: data.commitmentDate.end,
            dueDateTime: data.dueDateTime,
            itemCount: data.itemCount,
            allOrNone: data.allOrNone,
            shipOrderComplete: data.shipOrderComplete,
            shipVia: data.shipVia
		};
	}

	init();
});

