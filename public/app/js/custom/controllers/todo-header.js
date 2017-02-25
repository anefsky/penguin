app.controller("todoHeaderCtrl", function($scope) {

	var broadcastId =  'do-update-header-panel';

	$scope.$emit('get_todo_header_info', 
		{broadcastId: broadcastId}
	);


	$scope.$on(broadcastId, function(event, data) {

		var displayData = data.data;
		var action = data.action;
		$scope.data = {};

		switch(action) {
			case 'DISPLAY_DATA':
				$scope.details = {};
				$scope.details.name = displayData.data.name;
				$scope.details.title = displayData.data.userType.type;

				$scope.$emit('set_filter_item', {
					id: 'loggedinUserId',
					value: displayData.data.userId
				});

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
});
