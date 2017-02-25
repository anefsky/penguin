app.controller("todoSubjectSelectCtrl", function($scope) {

	function init() {
		$scope.userType = 'no-user-type';
		$scope.radioModel = 'Left';
	}

	$scope.$on('do-update-page-subject-tag', function(event, data) {
		//$scope.selectedUserId = data.selectedUserId;
		$scope.userFullName = data.userFullName;

		$scope.userType = data.userType;

		$scope.radioModel = 'Right';

	});


	$scope.$on('do-set-to-default-display-mode', function() {

		$scope.radioModel = 'Left';

		$scope.userType = 'no-user-type';
	});

	$scope.setToAllBidders = function() {
		$scope.$emit('uncheck-buyer-bidder-lists');
		$scope.$emit('set-to-default-display-mode');


		$scope.$emit('bids_go_to_first_page');
		$scope.$emit('get-todo-bids', 
			{broadcastId: 'do-update-pagination-and-bids'}
		);				

	};

	init();
});
