var app = angular.module("bidsApp", [ 'ngAnimate', 'ui.bootstrap', 'highcharts-ng', 'ui.router' ]);

app.config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider) {
	$urlRouterProvider.otherwise('/todo');
	
	$stateProvider
	.state('todo', {
		url: '/todo',
		templateUrl: 'app/html/todo-page.html'
	})
	.state('details', {
		url: "/details?{bid_id}",
		templateUrl: 'app/html/details-page.html'
	})
}]); 

app.value('cfgApp',
	{
		baseServerUrl: '../rest/bids',
		baseLocalUrl: 'assets/testdata',
		
		page: {
			todo: {
				dataSource: 'local'  //	dataSource:  'local' or 'server'
			},
			details: {
				dataSource: 'local'
			}
		},
		
		filterSets: {
			mainFilterSet: {
				setNames: [
					'dueDate', 
					'specialStatus'
				],
				signals: {

					selfLoad : {
						emitId: 'get-todo-filtered-quantities',
						broadcastId: 'do-update-filter-panel'
					},
					otherPanelLoads: [{ // load after selfload completed, or filter selection
						emitId: 'get-todo-bids',
						broadcastId: 'do-update-pagination-and-bids'
					}],
					beforeLoad: {
						emitId: 'bids_go_to_first_page'
					}
				},
				loadOtherPanelAfterInit: true,
				changeDisplayMode: true
			},
			snapshotFilterSet: {
				setNames: [
					'snapshotDueDate', 
					'snapshotSpecialStatus'
				],
				signals: {
					selfLoad: {
						emitId: 'get-todo-snapshot-filtered-quantities',
						broadcastId: 'do-update-snapshot-filter-panel'
					},
					otherPanelLoads: [
						{
							emitId: 'get-todo-buyers',
							broadcastId: 'set-todo-buyers'
						}, 
						{
							emitId: 'get-todo-bidders',
							broadcastId: 'set-todo-bidders'
						}
					],
					beforeLoad: {
						emitId: 'buyers_go_to_top' // TODO: not working
					}
				},
				loadOtherPanelAfterInit: true,
				changeDisplayMode: false
			}
		},

		defaultBidStatuses:  [
			'ACTIVE',
			'HOLD'
		],
		allStageNumbers: [
			1,
			2,
			3
		],
		bidderStageNumbers: [
			1,
			3
		],
		buyerStageNumbers: [
			2
		],

		paginationDataSets: {
			todoListPaging: {
				maxSize : 3,
				currentPage: 1,
				defaultItemsPerPage: 10,
				optionsItemsPerPage: [
					10,
					25,
					50
				]		
			},
			detailsListPaging: {
				maxSize : 3,
				currentPage: 1,
				defaultItemsPerPage: 10,
				optionsItemsPerPage: [
					10,
					25,
					50,
					100
				]		
			}
		}
	}

);

app.value('cfgFilterKeys',
{
	total: [
	{
		key: 'total',
		caption: 'Bids todo'
	}		
	],
	dueDate: [
	{
		key: 'dueToday',
		caption: 'Today'
	},
	{
		key: 'dueNextWeek',
		caption: 'Next Week'
	},
	{
		key: 'pastDue',
		caption: 'Past Due'
	}
	],
	specialStatus: [
	{
		key: 'highPriority',
		caption: 'High Priority'
	},
	{
		key: 'onHold',
		caption: 'On Hold'
	}
	],
	snapshotDueDate: [
	{
		key: 'dueToday',
		caption: 'Today'
	},
	{
		key: 'dueNextWeek',
		caption: 'Next Week'
	},
	{
		key: 'pastDue',
		caption: 'Past Due'
	}
	],
	snapshotSpecialStatus: [
	{
		key: 'highPriority',
		caption: 'High Priority'
	},
	{
		key: 'onHold',
		caption: 'On Hold'
	}
	]
}
);

app.value('cfgBidderBuyerPanels',
{
	
	buyer: {
		emitId: 'get-todo-buyers',
		broadcastId: 'set-todo-buyers',
		fieldHeadings: [
			"BUYER",
			"",
			""			
		],
		className: "panel-buyers"		
	},

	bidder: {
		emitId: 'get-todo-bidders',
		broadcastId: 'set-todo-bidders',
		fieldHeadings: [
			"BIDDER",
			"STAGE 1",
			"STAGE 3"
		],
		className: "panel-bidders"
	}
});



