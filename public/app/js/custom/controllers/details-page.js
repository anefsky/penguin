app.controller('detailsPageCtrl', function($scope, $timeout, utils, cfgApp, $uibModal) {

	$scope.getPageName = function() {
		return 'details';
	};

	var _baseServerUrl = cfgApp.baseServerUrl;
	var _baseLocalUrl = cfgApp.baseLocalUrl;
	var _dataSrc = cfgApp.page[$scope.getPageName()].dataSource;

	function init() {

		$scope.pagedata = {};

		var bidId = utils.getUrlParamValue('bid_id');
		utils.setPageTitle('Bids detail - ' + bidId);

		setPanelLoadEmitReceptors();
		setGeneralEmitReceptors();
	}

	function getFilterValue(filterId) {
		return $scope.pagedata[filterId];
	}

	function getListRequestParameterObject(options) {

		var obj = {
			filters: {
				bidId: function() {
					return getFilterValue('bidId')
				},
				
				buyerUserIds: function() { // TODO: will be replaced with buyer id
					return getFilterValue('buyerUserIds')
				}
			},
			pageInfo: {
				startIndex: function() {
					return (getFilterValue('pageNumber') - 1) * getFilterValue('maxNumberRecords');
				},
				maxNumberRecords: function() {
					return getFilterValue('maxNumberRecords');
				}
			}
		};

		var includedProperties = options.includedProperties;
		var returnObj = {};
		includedProperties.forEach(function(prop){
			returnObj[prop] = obj[prop];  // only include top-level properties on includedProperties list
		});

		return returnObj;
	}

	function getDefaultItemListRequestParameterObject() {
		return getListRequestParameterObject({
			includedProperties: [
				'filters',
				'pageInfo'			
			]
		});
	}

	function setGeneralEmitReceptors() {

		$scope.$on('set_filter_item', function(event, dataFilter) {
			$scope.pagedata[dataFilter.id] = dataFilter.value;
		});

		$scope.$on('set_pagination_to_first_page', function() {
			$scope.$broadcast('do_go_to_first_page');
		});

		$scope.$on('show-bottom-pagination-panel', function(event, data) {
			$scope.showBottomPaginationPanel = data.doShow;
		});

		$scope.$on('open-bid-settings-modal', function(event, headerData) {
			openBidSettingsModal(headerData);
		});
	}

	function openBidSettingsModal(headerData) {

	    var modalInstance = $uibModal.open({
	      animation: true,
	      size: '',
	      templateUrl: 'app/html/templates/tpl-details-bid-settings-modal.html',
	      controller: 'detailsBidSettingsModalCtrl',
	      resolve: {
	      	data: headerData
	      },
	      backdrop: 'static', // prevent closing when clicking outside
	      keyboard: false,  // prevent close with escape key
	      scope: $scope // allows emits and broadcasts to and from modal
	    });
	}

	function setPanelLoadEmitReceptors() {

		var broadcastReceptors = [ // define http requests for page
			{
				emitedId: 'get_details_buyers', // signal to trigger call
				dataSrc: {
					server: {
						urlNoParams: _baseServerUrl + '/bid/buyers',
						requestType: 'POST',
						parameters: {
							filters: 
								function() {
									return {
										bidId: getFilterValue('bidId')
									}								
								}
						}
					},
					local: utils.getLocalMockRequestObject(_baseLocalUrl, '/details-buyers.json')
				}
			},		
			{
				emitedId: 'get_details_items', // signal to trigger call
				dataSrc: {
					server: {
						urlNoParams: _baseServerUrl + '/bid/items',
						requestType: 'POST',
						 parameters: getDefaultItemListRequestParameterObject()
						//parameters: {}
					},
					local: utils.getLocalMockRequestObject(_baseLocalUrl, '/details-items.json')
				}
			},		
			{
				emitedId: 'get_details_header', // signal to trigger call
				dataSrc: {
					server: {
						urlNoParams: _baseServerUrl + '/bid/header',
						requestType: 'POST',
						parameters: {
							filters: 
								function() {
									return {
										bidId: getFilterValue('bidId')
									}								
								}
						}
					},
					local: utils.getLocalMockRequestObject(_baseLocalUrl, '/details-header.json')
				}
			},		
			{
				emitedId: 'submit-bid-setup-data', // signal to trigger call
				dataSrc: {
					server: {
						urlNoParams: _baseServerUrl + '/bid/action/updateBidSetup',
						requestType: 'POST',
						parameters: null
					},
					local: utils.getLocalMockRequestObject(_baseLocalUrl, '/details-header.json')  // just need an okay return
				}
			},		
			{
				emitedId: 'save-item-price-update-request', // signal to trigger call
				dataSrc: {
					server: {
						urlNoParams: _baseServerUrl + '/bid/item/action/updatePrice',
						requestType: 'POST',
						parameters: null
					},
					local: utils.getLocalMockRequestObject(_baseLocalUrl, '')  // TODO: use copy of actual return json
				}
			},	

			{
				emitedId: 'update-require-buyers-review-request', // signal to trigger call
				dataSrc: {
					server: {
						urlNoParams: _baseServerUrl + '/bid/item/action/updateRequiresReview',
						requestType: 'POST',
						parameters: null
					},
					local: utils.getLocalMockRequestObject(_baseLocalUrl, '')  // TODO: use copy of actual return json
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
					parameters: receptor.dataSrc[_dataSrc].parameters || data.postBodyObject // TODO: improve
				};

				utils.doAjaxCall(requestObj);	
			});
		});
	}

	init();
});
