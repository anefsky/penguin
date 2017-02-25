app.controller('itemCtrl', function($scope, $timeout, utils) {

	var _itemIndex;
	var _itemId;
	$scope.data = {};
	var _broadcastIdPrefixes = [
		'save-item-price-update',
		'update-require-buyers-review'
	];

	function init() {
		_itemIndex = $scope.$index;
		_itemId = $scope.itemData.items[_itemIndex].itemNumber;
		setEmitHandlers();
		setBroadcastHandlers();
	}

	function setEmitHandlers() {

		_broadcastIdPrefixes.forEach(function(prefix) {
			$scope.$on(prefix, function(event, data) {
		     	var postBodyObject = createPostBodyObject( _itemId, data.newValue, data.oldValue);
		     	$scope.$emit(prefix + '-request', { 
		          	broadcastId: prefix + '-result' + '_' + _itemIndex,
		          	postBodyObject: postBodyObject
		      	});
		     });
		})
	}

	function setBroadcastHandlers() {

		_broadcastIdPrefixes.forEach(function(prefix) {
			$scope.$on(prefix + '-result' + '_' + _itemIndex, function(event, data) {
				handleResponse(prefix, data);
			});
		});	
	}

	function createPostBodyObject(itemId, newValue, oldValue) {
		return {
			bidItemNumber: itemId,

			oldValue: oldValue,
			newValue: newValue
		}
	}


	function handleResponse(prefix, data) {
		var action = data.action;

		switch(action) {
			case 'DISPLAY_DATA':
				break;
			case 'START_WAIT' :
				break;
			case 'STOP_WAIT':
				$timeout(function() { // add slight delay for effect
					$scope.$broadcast(prefix + '-successful');		
				}, 250);
				break;
			case 'REQUEST_FAILED':
				$scope.$broadcast(prefix + '-failed');
				break;
			default : 
				console.log('ERROR: bad action: ' + action);

		}
	}

	$scope.getTotalPrice = function() {
		if($scope.item.price != null) {
			return $scope.item.quantity * parseFloat(utils.removeCommas($scope.item.price));
		} else {
			return null;
		}
	};

	$scope.getTotalDollars = function() {
		if($scope.getTotalPrice()) {
			return Math.floor($scope.getTotalPrice());
		}
		return '0';
	};

	init();
});

