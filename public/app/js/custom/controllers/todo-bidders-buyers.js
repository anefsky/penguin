app.controller("todoBiddersBuyersCtrl", function($scope, $element, cfgBidderBuyerPanels) {

	var _panelType = $scope.type; // set by ng-init 
	var _cfgPanel = cfgBidderBuyerPanels[_panelType];
	var _personsMap = {};

	function setPanelProperties() {
		$scope.panelProps = {};
		$scope.panelProps.panelClass = _cfgPanel.className;
		$scope.panelProps.fieldHeadings = _cfgPanel.fieldHeadings;
	}

	function setHandleDataBroadcast() {
		var broadcastId = _cfgPanel.broadcastId;

		$scope.$on(broadcastId, function(event, data) {

			var action = data.action;

			switch(action) {
				case 'DISPLAY_DATA':
					displayData(data.data.data);
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


		$scope.$on('go_to_buyers_top', function() {
		//	console.log('...');
		//	console.log('********* in on: go_to_buyers_top');
			// TODO: make scroll on buyer panel
		});
	}

	function clearAll() {
		var container = angular.element($element);
		var inputs = container.find('input');

		angular.forEach(inputs, function(input) {
			input.checked = false;
		});
	}

	$scope.$on('do-uncheck-buyer-bidder-lists', function() {
		clearAll();
	});

	function displayData(dataObj) {
		$scope.data = {};
		$scope.data.total = dataObj.total;

		$scope.data.persons = [];
		dataObj.list.forEach(function(item, index) {
			var person = {};
			var buyerCodes = null;  // only for buyers
			var pageDisplayMode = null;

			switch(_panelType) {
				case 'bidder': 
					person.name = item.bidder.name;
					person.user_id = item.bidder.userId;
					person.stage_1_qty = item.stage1Count;
					person.stage_3_qty = item.stage3Count;
					person.total = item.totalCount;
					$scope.data.persons.push(person);
					pageDisplayMode = "SELECTED_BIDDER";
					break;
				case 'buyer': 
					person.name = item.buyer.name;
					person.user_id = item.buyer.userId;
					person.total = item.bidCount;
					$scope.data.persons.push(person);
					buyerCodes = item.buyer.buyerCodes;
					pageDisplayMode = "SELECTED_BUYER";
					break;
				default: 
					console.log('ERROR: bad panelType: ' + _panelType);
			}
			_personsMap[person.user_id] = {
				name: person.name,
				buyerCodes: buyerCodes,
				pageDisplayMode: pageDisplayMode
			};
		});
	}

	$scope.updatePageSubjectTag = function() { // TODO: rename to something more general
		var selectedUserId = $scope.data[$scope.modelKey];

		$scope.$emit('update-page-subject-and-mode', {
			selectedUserId: selectedUserId,
			userFullName: _personsMap[selectedUserId].name,
			buyerCodes: _personsMap[selectedUserId].buyerCodes,
			userType: _panelType,
			pageDisplayMode: _personsMap[selectedUserId].pageDisplayMode
		});

		$scope.$emit('bids_go_to_first_page');

		switch(_panelType) {
			case 'buyer': 
				$scope.$emit('get-todo-bids-single-buyer', {
					broadcastId: 'do-update-pagination-and-bids'}
				);
				break;
			case 'bidder':
				$scope.$emit('get-todo-bids-single-bidder', { 
					broadcastId: 'do-update-pagination-and-bids'}
				);
				break;
			default:
				console.log('ERROR: unrecognized _panelType: ' + _panelType);
		}
	}

	function init() {
		setPanelProperties();
		setHandleDataBroadcast();
	}

	init();
});
