app.controller('todoPageCtrl', function($scope, utils, cfgApp, timeFunctions) {

	utils.setPageTitle('Bids todo');

	$scope.getPageName = function() {
		return 'todo';
	};

	// create object and function for storing http params data
	var _baseServerUrl = cfgApp.baseServerUrl;
	var _baseLocalUrl = cfgApp.baseLocalUrl;
	var _dataSrc = cfgApp.page[$scope.getPageName()].dataSource;
	var _defaultDisplayMode = 'ALL_BIDDERS';
	var _buyerCodes = null;  // TODO: improve scope
	
	$scope.pagedata = {};

	function setGeneralEmitReceptors() {

		$scope.$on('set_filter_item', function(event, dataFilter) {
			$scope.pagedata[dataFilter.id] = dataFilter.value;
		});
		
		$scope.$on('bids_go_to_first_page', function() {
			$scope.$broadcast('do_go_to_first_page');
		});

		$scope.$on('buyers_go_to_top', function() {
			$scope.$broadcast('go_to_buyers_top'); // TODO: not doing anything now
		});

		$scope.$on('uncheck-buyer-bidder-lists', function() {
			$scope.$broadcast('do-uncheck-buyer-bidder-lists');
		});

		$scope.$on('show-bottom-pagination-panel', function(event, data) {
			$scope.showBottomPaginationPanel = data.doShow;
		});

		$scope.$on('update-page-subject-and-mode', function(event, data) {
			$scope.$broadcast('do-update-page-subject-tag', {
				selectedUserId: data.selectedUserId,
				userType: data.userType,
				userFullName: data.userFullName
			});

			setPageDisplayMode(data.pageDisplayMode);
			_buyerCodes = data.buyerCodes;
		});

		$scope.$on('set-to-default-display-mode', function() {
			setDefaultDisplayMode();
			$scope.$broadcast('do-set-to-default-display-mode')
		});

		$scope.$on('set-to-limbo-display-mode', function() {
			setPageDisplayMode(null);
		});
	}

	function setPageDisplayMode(mode) {
		$scope.pagedata.displayMode = mode;
	};

	function getPageDisplayMode() {
		return $scope.pagedata.displayMode;
	};

	function setDefaultDisplayMode() {
		setPageDisplayMode(_defaultDisplayMode);
	}
	
	function getFilterValue(filterId) {
		return $scope.pagedata[filterId];
	}

	function getDefaultBidStatuses() {
		return cfgApp.defaultBidStatuses;
	}

	function getBidderStageNumbers() { // only for bidders stages
		return cfgApp.bidderStageNumbers;
	}

	function getAllStageNumbers() {
		return cfgApp.allStageNumbers;
	}

	function getBuyerStageNumbers() {
		return cfgApp.buyerStageNumbers;
	}

	function getListRequestParameterObject(options) {

		var obj = 
		{
			filters: {

				status: function() {

					var statusValue = getFilterValue(options.specialStatusFilterName);

					switch(statusValue) {
						case 'highPriority':
						case null:
							return getDefaultBidStatuses();
							break;
						case 'onHold': 
							return ['HOLD'];
							break;
						default: 
							console.log('Error: bad status value: ', statusValue);
					}
				},

				priority: function() {
					if(getFilterValue(options.specialStatusFilterName) === 'highPriority') {
						return ['HIGH'];
					} else {
						return null;
					}
				},

				stageNumber: options.stageNumbers,

				dueDate: function() {

					var startTime; // unix milliseconds
					var endTime;

					var filterValue = getFilterValue(options.dueDateFilterName);

					switch(filterValue) {
						case null:
							return null;
							break;
						case 'dueToday':
							startTime = timeFunctions.getStartOfToday();
							endTime = timeFunctions.getEndOfToday();
							break;
						case 'dueNextWeek':
							startTime = timeFunctions.getStartOfTomorrow();
							endTime = timeFunctions.getEndOfNextWeek();
							break;
						case 'pastDue':
							startTime = 0;
							endTime = timeFunctions.getNow();
							break;
						default:
							console.log('Error: bad filterValue: ' + filterValue);
					}
					return [
						{
							start: startTime,
							end: endTime
						}
					];
				},

				userId: function() {
					return (getPageDisplayMode() === 'SELECTED_BIDDER' ? getFilterValue('bidderOrBuyer') :  null);
				},
/*
				buyerCodes: function() {
					return (getPageDisplayMode() === 'SELECTED_BUYER' ?  _buyerCodes : null);
				},
*/		

				buyerUserIds: function() {
					return (getPageDisplayMode() === 'SELECTED_BUYER' ?  [getFilterValue('bidderOrBuyer')] : null);
				},

				requiresAction: function() {
					return ((getPageDisplayMode() === 'SELECTED_BUYER') || options.includeRequiresAction ? true : false);
				}

			},
			pageInfo: {
				startIndex: function() {
					return (getFilterValue('pageNumber') - 1) * getFilterValue('maxNumberRecords');
				},
				maxNumberRecords: function() {
					return getFilterValue('maxNumberRecords');
				}
			},
			sortBy: "DUE_DATE_ASC"
		};

		var includedProperties = options.includedProperties;
		var returnObj = {};
		includedProperties.forEach(function(prop){
			returnObj[prop] = obj[prop];  // only include top-level properties on includedProperties list
		});

		return returnObj;
	}

	function getDefaultTodoListRequestParameterObject() {
		return getListRequestParameterObject({
			specialStatusFilterName: 'specialStatus',
			dueDateFilterName: 'dueDate',
			stageNumbers: getAllStageNumbers(),
			includedProperties: [
				'filters',
				'pageInfo',
				'sortBy'
			]
		});
	}

	function getBuyerTodoListRequestParameterObject() {
		return getListRequestParameterObject({
			specialStatusFilterName: 'snapshotSpecialStatus',
			dueDateFilterName: 'snapshotDueDate',
			stageNumbers: getBuyerStageNumbers(),
			includeRequiresAction: true,
			includedProperties: [
				'filters',
				'pageInfo',
				'sortBy'
			]
		});
	}

	function getBidderTodoListRequestParameterObject() {
		return getListRequestParameterObject({
			specialStatusFilterName: 'snapshotSpecialStatus',
			dueDateFilterName: 'snapshotDueDate',
			stageNumbers: getBidderStageNumbers(),
			includedProperties: [
				'filters',
				'pageInfo',
				'sortBy'
			]
		});
	}

	function getBuyerListRequestParameterObject() {
		return getListRequestParameterObject({
			specialStatusFilterName: 'snapshotSpecialStatus',
			dueDateFilterName: 'snapshotDueDate',
			stageNumbers: getBuyerStageNumbers(),
			includeRequiresAction: true,
			includedProperties: [
				'filters'
			]
		});
	}

	function getBidderListRequestParameterObject() {
		return getListRequestParameterObject({
			specialStatusFilterName: 'snapshotSpecialStatus',
			dueDateFilterName: 'snapshotDueDate',
			stageNumbers: getBidderStageNumbers(),
			includedProperties: [
				'filters'
			]
		});
	}

	function setPanelLoadEmitReceptors() {

		var broadcastReceptors = [ // define http requests for page
			{
				emitedId: 'get_todo_header_info', // signal to trigger call
				dataSrc: {
					server: {
						urlNoParams: _baseServerUrl + '/user',
						requestType: 'GET',
						parameters: {}
					},
					local: utils.getLocalMockRequestObject(_baseLocalUrl, '/todo-header.json')
				}
			},
			{

				emitedId: 'get-todo-filtered-quantities',
				dataSrc: {
					server: {
						urlNoParams: _baseServerUrl + '/search/totals', 
						requestType: 'POST',
						parameters: {
							filters: {
								status: getDefaultBidStatuses(),
								stageNumber: getAllStageNumbers()
							}
						} ,
					},
					local: utils.getLocalMockRequestObject(_baseLocalUrl, '/todo-filter-main.json') 
				}
			},
			{
				emitedId: 'get-todo-snapshot-filtered-quantities',
				dataSrc: {
					server: {
						urlNoParams: _baseServerUrl + '/search/totals', 
						requestType: 'POST',
						parameters: {
							filters: {
								status: getDefaultBidStatuses(),
								stageNumber: getAllStageNumbers()
							}
						}	
					},
					local: utils.getLocalMockRequestObject(_baseLocalUrl, '/todo-filter-snapshot.json') 
				}
			},

			{
				emitedId: 'get-todo-bids',
				dataSrc: {
					server: {
						urlNoParams: _baseServerUrl + '/search/list',
						requestType: 'POST', 
						parameters: getDefaultTodoListRequestParameterObject()
					},
					local: utils.getLocalMockRequestObject(_baseLocalUrl, '/todo-bids.json') 
				}
			},

			{
				emitedId: 'get-todo-bids-single-buyer',
				dataSrc: {
					server: {
						urlNoParams: _baseServerUrl + '/search/list',
						requestType: 'POST', 
						parameters: getBuyerTodoListRequestParameterObject()
					},
					local: utils.getLocalMockRequestObject(_baseLocalUrl, '/todo-bids.json') 
				}
			},

			{
				emitedId: 'get-todo-bids-single-bidder',
				dataSrc: {
					server: {
						urlNoParams: _baseServerUrl + '/search/list',
						requestType: 'POST', 
						parameters: getBidderTodoListRequestParameterObject()
					},
					local: utils.getLocalMockRequestObject(_baseLocalUrl, '/todo-bids.json') 
				}
			},

			{
				emitedId: 'get-todo-bidders',
				dataSrc: {
					server: {
						urlNoParams: _baseServerUrl + '/search/bidders',
						requestType: 'POST', 
						parameters: getBidderListRequestParameterObject()
					},
					local: utils.getLocalMockRequestObject(_baseLocalUrl, '/todo-bidders.json') 
				}
			},

			{
				emitedId: 'get-todo-buyers',
				dataSrc: {
					server: {
						urlNoParams: _baseServerUrl + '/search/buyers',
						requestType: 'POST', 
						parameters: getBuyerListRequestParameterObject()
					},
					local: utils.getLocalMockRequestObject(_baseLocalUrl, '/todo-buyers.json') 
				}
			}

		];

		broadcastReceptors.forEach(function(receptor) {
			$scope.$on(receptor.emitedId, function(event, data) {
				var requestObj = {
					requestId: receptor.emitedId,
					urlNoParams: receptor.dataSrc[_dataSrc].urlNoParams,
					broadcastId: data.broadcastId,
					pageScope: $scope,
					requestType: receptor.dataSrc[_dataSrc].requestType,
					parameters: receptor.dataSrc[_dataSrc].parameters
				};
				utils.doAjaxCall(requestObj);	
			});
		});
	}

	function init() {

		setPageDisplayMode(_defaultDisplayMode);

		setPanelLoadEmitReceptors();

		setGeneralEmitReceptors()
	}

	init();

});


