app.directive('bhRadioFilters', function(cfgFilterKeys, cfgApp) {
	function link(scope, elem, attrs) {

		var storedValueName;
		var _arrSetsAndModelKeys = [];
		var _filterSetName = scope.filterSetName;
		var _cfgFilterSet = cfgApp.filterSets[_filterSetName];
		var _selfLoadBroadcastId =  _cfgFilterSet.signals.selfLoad.broadcastId;
		var _selfLoadEmitId = _cfgFilterSet.signals.selfLoad.emitId;
		var _cfgOtherPanelLoads =  _cfgFilterSet.signals.otherPanelLoads;
		var _otherPanelResetEmitId = _cfgFilterSet.signals.beforeLoad.emitId;
		var _loadOtherPanelAfterInit = _cfgFilterSet.loadOtherPanelAfterInit;

		scope.data = {};
		scope.radioSetNames = _cfgFilterSet.setNames;

		scope.$emit(_selfLoadEmitId, 
			{broadcastId: _selfLoadBroadcastId}
		);

		scope.$on(_selfLoadBroadcastId, function(event, data) {
			var action = data.action;

			switch(action) {
				case 'DISPLAY_DATA':
					scope.displayData(data.data);
					break;
				case 'START_WAIT' :
					scope.doStartWait();
				break;
				case 'STOP_WAIT' :
					scope.doStopWait();
					if(_loadOtherPanelAfterInit) {
						loadOtherPanel();
					}
					break;
				default : 
				console.log('ERROR: bad action: ' + action);
			}
		});

		scope.addSetNameAndModelKey = function(_setName, _modelKey) {
			_arrSetsAndModelKeys.push({
				setName: _setName,
				modelKey: _modelKey
			});
		};

		scope.displayData = function(data) {
			// set totals values
			var _filterQtyMap = getFilterQuantityMap(data.data);
			// totals
			var _scopeData = createScopeData(_filterQtyMap, 'total');
			scope.data.total = _scopeData.total;

			var objLastSelectedValue = {};

			_arrSetsAndModelKeys.forEach(function(objSetAndModelKey) {

				var radioSetName = objSetAndModelKey.setName;
				objLastSelectedValue[radioSetName] = null; // may change for presets

				var storedValueName = objSetAndModelKey.modelKey;

				scope.data[storedValueName] = null;
				var filterQtyMap = getFilterQuantityMap(data.data);
				var scopeData = createScopeData(filterQtyMap, radioSetName);
				scope.data[radioSetName] = scopeData[radioSetName];

				scope.handleClick = function(event, _radioSetName) {  

					if(_radioSetName !== 'clear-all') {  // reset button selected 
						var _storedValueName = scope.getModelKey(_radioSetName);

						if(objLastSelectedValue[_radioSetName] === event.target.value) { // same button selected
							event.target.checked = false; // uncheck
							objLastSelectedValue[_radioSetName] = null;

						} else {
							objLastSelectedValue[_radioSetName] = scope.data[_storedValueName];
						}

						scope.data[_storedValueName] = objLastSelectedValue[_radioSetName];
					}
					if(_cfgFilterSet.changeDisplayMode) {
						scope.$emit('uncheck-buyer-bidder-lists');
						scope.$emit('set-to-default-display-mode');
					} else {
						scope.$emit('set-to-limbo-display-mode');
					}
					loadOtherPanel();
				};
			});
			scope.clearAll = function() {

				// foreach radio set
				_arrSetsAndModelKeys.forEach(function(setAndModelKeys) {
					// set last selected value to null
					var setName = setAndModelKeys.setName;
					var storedValueName = setAndModelKeys.modelKey;
					scope.data[storedValueName] = null;
					scope.$broadcast('unset_filter', {
						'filter_id' : setName
					});
				});
				objLastSelectedValue = {}; // reset all sets
			};
		};


		function loadOtherPanel() {
			_cfgOtherPanelLoads.forEach(function(cfgOtherPanelLoad) {

				scope.$emit(_otherPanelResetEmitId);
				scope.$emit(cfgOtherPanelLoad.emitId, 
					{broadcastId: cfgOtherPanelLoad.broadcastId}
				);				
			});		
		};

		scope.getModelKey = function(radioSetName) {
			return 'value_' + radioSetName;
		};

		scope.setRadioSetName = function(_radioSetName) {
			radioSetName = _radioSetName;
		};

		function getRadioSetName() {
			return radioSetName;
		}

		scope.setStoredValueName = function(_storedValueName) {
			storedValueName = _storedValueName;
		};

		function getStoredValueName() {
			return storedValueName;
		}

		function getFilterKeys(radioSetName) {
			var mapRadioSetToKeys = cfgFilterKeys;
			filterKeys = mapRadioSetToKeys[radioSetName];

			return filterKeys;
		}

		function createScopeData(filterQtyMap, radioSetName) {
			var filterKeys = getFilterKeys(radioSetName);
			var scopeDataObj = {};
			scopeDataObj[radioSetName] = {};
			scopeDataObj[radioSetName].choices = [];
			filterKeys.forEach(function(filterKey) {
				var filterObj = {};
				filterObj.value = filterKey.key;
				filterObj.caption = filterKey.caption;
				filterObj.qty = filterQtyMap[filterKey.key];

				scopeDataObj[radioSetName].choices.push(filterObj);
			});
			return scopeDataObj;
		}

		function getFilterQuantityMap(inputData) {
			var map = {};
			var totalsObj = inputData;

			for(var singleFilter in totalsObj) {
				map[singleFilter] = totalsObj[singleFilter].total;
			}
			return map;
		}

	}
	return {
		link: link,
		scope: true,
		templateUrl : 'app/html/templates/todo-radio-set.html'
	};
});