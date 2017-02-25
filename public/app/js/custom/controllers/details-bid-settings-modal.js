app.controller('detailsBidSettingsModalCtrl', function($scope, $rootScope, $uibModalInstance, data) {

  var _data = data; // data passed in from header module
  function init() {

    createScopeProperties()
    loadData();
    setBroadcastHandlers();
    setEmitHandlers();
  }

  function createScopeProperties() {
    // need to create shared scope property that will be used by encapsulated widgets
    $scope.sharedData = {};
    $scope.sharedData.readOnly = {};
    var params = $scope.sharedData.params = {};

    // create a property for each widget
    params.dates = {};
    params.dates.commitmentStart = {};
    params.dates.commitmentEnd = {};
    params.dates.dueDate = {};
    params.bidType = {};
    params.priority = {};
    params.dueTime = {};
  }

  function setBroadcastHandlers() {

    $scope.$on('setup-data-submitted-successfully', function(event, data) {
      var action = data.action;

      switch(action) {

        case 'DISPLAY_DATA':
          break;
        case 'START_WAIT' :
          break;
        case 'STOP_WAIT' :
          $scope.$emit('get_details_header',{
            broadcastId: 'do_get_details_header_only'
          });
          $uibModalInstance.close();
          break;
        default : 
          console.log('ERROR: bad action: ' + action);
      }
    });
  }

  function setEmitHandlers() {
    $scope.$on('set_min_date', function(event, data) { //emitted
      var emitId = 'set_min_date_' + data.target;
      $scope.$broadcast(emitId, {
        datePicked: data.datePicked
      });
    });

    $scope.$on('set_max_date', function(event, data) { //emitted
      var emitId = 'set_max_date_' + data.target;
      $scope.$broadcast(emitId, {
        datePicked: data.datePicked
      });
    });

  }

  function createOriginalDataObject() {
    var object = {
      bidTypeId: _data.bidType && _data.bidType.id ? _data.bidType.id : null,
      priorityId: _data.bidPriority && _data.bidPriority.id ?  _data.bidPriority.id : null,
      commitmentDateStartUnixMs: _data.commitmentDateStart || null,
      commitmentDateEndUnixMs:  _data.commitmentDateEnd || null,
      dueDateAndTimeUnixMs: _data.dueDateTime || null
    };
    return object;
  }

  function getSetDueDateAndTimeMs() {
    var params = $scope.sharedData.params;
    var dateOnly = params.dates.dueDate.selected ? params.dates.dueDate.selected : null;

    if(dateOnly === null) { // do not send only a time
      return null;
    }
    var hours = params.dueTime && params.dueTime.selected && params.dueTime.selected.value ? params.dueTime.selected.value : null;
    var fullDate = new Date(dateOnly.getFullYear(), dateOnly.getMonth(), dateOnly.getDate(), hours);
    return fullDate.getTime();
  }

  function createFinalDataObject() {
    var params = $scope.sharedData.params;
    var object = {
      bidTypeId: params.bidType.selected && params.bidType.selected.id ? params.bidType.selected.id : null,
      priorityId: params.priority.selected && params.priority.selected.id ? params.priority.selected.id : null,
      commitmentDateStartUnixMs: params.dates.commitmentStart.selected ? params.dates.commitmentStart.selected.getTime() : null,
      commitmentDateEndUnixMs: params.dates.commitmentEnd.selected ? params.dates.commitmentEnd.selected.getTime() : null,
      dueDateAndTimeUnixMs: (getSetDueDateAndTimeMs)()
    };
    return object;
  }

  function loadData() {

    var sharedData = $scope.sharedData;
    var params = sharedData.params;
    var readOnly = sharedData.readOnly;

    readOnly.bidTypeOptions = _data.bidTypeOptions;
    params.bidType.selected = _data.bidType;
    readOnly.priorityOptions = _data.bidPriorityOptions;
    params.priority.selected = _data.bidPriority;

    params.dates.commitmentStart.selected = 
      _data.commitmentDateStart ? new Date(_data.commitmentDateStart) : null; 
    params.dates.commitmentEnd.selected = 
      _data.commitmentDateEnd ? new Date(_data.commitmentDateEnd) : null;

    var dueDateTimeUnixMs =  _data.dueDateTime; 
    var dueDateTime = dueDateTimeUnixMs ? new Date(dueDateTimeUnixMs) : null;
    if(dueDateTime) {
      var dateNoHours = new Date(dueDateTime.getFullYear(), dueDateTime.getMonth(), dueDateTime.getDate());
      var fullDate = new Date(dueDateTime.getFullYear(), dueDateTime.getMonth(), dueDateTime.getDate(), dueDateTime.getHours());

      params.dates.dueDate.selected = dateNoHours; 
      params.dueTime.hours = fullDate.getHours();
    }
  }

  function getPostBodyObjectSegment(dataObject) {
    var object = {
      bidType: dataObject.bidTypeId,
      priority: dataObject.priorityId,
      dueDateTime: dataObject.dueDateAndTimeUnixMs,
      commitmentDate: {
        start: dataObject.commitmentDateStartUnixMs,
        end: dataObject.commitmentDateEndUnixMs
      }
    }
    return object;
  }

  function createPostBodyObject(bidId, originalDataObject, finalDataObject) {
    var object = {
      bidId: bidId,
      oldValues:  getPostBodyObjectSegment(originalDataObject),
      newValues:  getPostBodyObjectSegment(finalDataObject)
    }
    return object;
  }

  function onlyOneCommitmentDatePicked() {
    var params = $scope.sharedData.params;
    var startDate = params.dates.commitmentStart.selected;
    var endDate = params.dates.commitmentEnd.selected;
    return (startDate && !endDate) || (!startDate && endDate);
  }

  $scope.save = function () {

     $scope.onlyOneCommitmentDatePicked = false;
    if(onlyOneCommitmentDatePicked()) {
      $scope.onlyOneCommitmentDatePicked = true;
    } else {

      var originalDataObject = createOriginalDataObject();
      var finalDataObject = createFinalDataObject();
      var postBodyObject = createPostBodyObject( _data.bidId, originalDataObject, finalDataObject);

      $scope.$emit('submit-bid-setup-data', { 
          broadcastId: 'setup-data-submitted-successfully',
          postBodyObject: postBodyObject
      });
    }
  };

  $scope.cancel = function () {
    $uibModalInstance.dismiss('cancel');
  };

  init();
});

app.controller('hourPickerCtrl', function( $scope ) {

  function init() {
    $scope.data = $scope.sharedData.params.dueTime;
    var dueTime = $scope.sharedData.params.dueTime.hours;
    createChoices();
    $scope.data.selected = (dueTime ?  getOption(dueTime) : getDefaultChoice());
  }

  function createChoices() {
    $scope.choices = (function() {
      var minTimeValue = 9;
      var maxTimeValue = 18;
      var choices = [];

      for(i = minTimeValue; i <= maxTimeValue; i++) {
        var item = {
          value: i,
          label: (i > 12 ? i - 12 : i) + ':00 ' + (i > 11 ? 'pm' : 'am')
        }
        choices.push(item); 
      }
      return choices;
    })();
  }

  function getOption(hours) {
    var match = null;

    $scope.choices.forEach(function( choice ) {
      if(choice.value === hours) {
        match = choice;
      }
    });
    if(match === null) {
      console.log('ERROR: no match for hours = ' + hours);
    }
    return match;
  }

  function getHours(uTimeMs) {
    return (new Date(uTimeMs)).getHours();
  };

  function getDefaultChoice() {
    return $scope.choices[$scope.choices.length - 1];
  }

  init();

});

app.controller('bidTypePickerCtrl', function($scope) {
  $scope.data = $scope.sharedData.params.bidType;
});

app.controller('priorityPickerCtrl', function( $scope ) {
  var _selectedIndex;
  $scope.data = $scope.sharedData.params.priority;

  function init() {
    _selectedIndex = getIndexFromId($scope.data.selected.id);
  }

  function getIndexFromId(id) {
    var counter = 0;
    var matchedIndex = null;
    $scope.sharedData.readOnly.priorityOptions.forEach(function(option) {
      if(id === option.id) {
        matchedIndex = counter;
      }
      counter++;
    });
    return matchedIndex;
  }

  function setBidPriorityFromIndex(index) {
    $scope.data.selected =  $scope.sharedData.readOnly.priorityOptions[index];
  }

  $scope.selectNextPriority = function() {
    var newIndex = (_selectedIndex + 1) %  $scope.sharedData.readOnly.priorityOptions.length;
    _selectedIndex = newIndex;
    setBidPriorityFromIndex( _selectedIndex);
  }

  init();

});

app.directive('datePickerDirective', function() {
 function link(scope, elem, attrs) {
    var _widgetId, _setsMinOnId, _setsMaxOnId;
    var _dateFarInFuture = new Date(2050, 11, 31);

    function init() {
      _widgetId = attrs['widgetId'];
      _setsMinOnId = attrs['setsMinOn']
      _setsMaxOnId = attrs['setsMaxOn']

      scope.data = scope.sharedData.params.dates[_widgetId]
      scope.format = "M/dd/yy";
      scope.sharedData.dateOptions = {};
      scope.sharedData.dateOptions[_widgetId] = {};
      setDateOptions();
      scope.popup = {};

      setBroadcastHandlers();
      doEmitToAdjustSiblingWidgetAllowedDate();

    }

    // Disable weekend selection
    function disabled(data) {
      var date = data.date,
      mode = data.mode;
      return mode === 'day' && (date.getDay() === 0 || date.getDay() === 6);
    }

    scope.open = function() {
      scope.popup.opened = true;
    };

    function setDateOptions() {
      scope.dateOptions = {
        dateDisabled: disabled,
        startingDay: 0, // Sunday
        showWeeks: false,
        minDate: new Date(),
        maxDate: _dateFarInFuture
      };
    }

    function doEmitToAdjustSiblingWidgetAllowedDate() {

      var datePicked = scope.sharedData.params.dates[_widgetId].selected;
        if(_setsMinOnId) {
          scope.$emit('set_min_date', {
            target: _setsMinOnId,
            datePicked: datePicked
          });
        }
        if(_setsMaxOnId) {
          scope.$emit('set_max_date', {
            target: _setsMaxOnId,
            datePicked: datePicked
          });          
        }
    }

    scope.$watch('popup.opened', function() {
      value = scope.popup.opened;
     if(value === false) { // just closed
        doEmitToAdjustSiblingWidgetAllowedDate()
      }
    });

    function setBroadcastHandlers() {

      var minDateBroadcastId = 'set_min_date_' + _widgetId;
      var maxDateBroadcastId = 'set_max_date_' + _widgetId;

      scope.$on(minDateBroadcastId, function(event, data) { // sets min date based on another widget value
        scope.dateOptions.minDate = data.datePicked;
        // if no date picked on this widget, go to month of date picked on other widget
        var datePickedOnThisWidget = scope.sharedData.params.dates[_widgetId].selected;
        if(!datePickedOnThisWidget) {
          scope.dateOptions.initDate = data.datePicked;
        }
        if(!data.datePicked) { // other date cleared
          scope.dateOptions.minDate = new Date(); // today
        }
      });

      scope.$on(maxDateBroadcastId, function(event, data) {
       scope.dateOptions.maxDate = data.datePicked;
        // if no date picked on this widget, go to month of date picked on other widget
        var datePickedOnThisWidget = scope.sharedData.params.dates[_widgetId].selected;
        if(!datePickedOnThisWidget) {
          scope.dateOptions.initDate = data.datePicked;
        }
        if(!data.datePicked) { // other date cleared
          scope.dateOptions.maxDate =  _dateFarInFuture; 
        }
      });
    }

    init();
  }

  return {
    link: link,
    templateUrl: 'tpl-date-picker.html',
    scope: true
  }
});
