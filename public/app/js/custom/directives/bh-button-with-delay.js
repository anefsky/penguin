app.directive('bhButtonWithDelay', function($timeout, utils) {
  function link(scope, elem, attrs) {

    var _newValue, _oldValue;
    var _broadcastIdPrefix = attrs['broadcastIdPrefix'];

    function init() {
      initData();
      createBroadcastHandlers();
    }

    function initData() {
     scope.data = {
       buttonTextOn: attrs['textOn'],
       buttonTextOff: attrs['textOff'],
       isOn: scope.drctvModel,
       isSaving: false,
       updateFailed: false
     };
   }

     function createBroadcastHandlers() {
      scope.$on(_broadcastIdPrefix + '-successful', function() {
        scope.data.isSaving = false;
        scope.data.isOn = !scope.data.isOn;
      });

      scope.$on(_broadcastIdPrefix + '-failed', function() {
        scope.data.isSaving = false;
        scope.data.updateFailed = true;
      });
    }

    scope.processClick = function() {
      scope.data.isSaving = true;

      scope.$emit(_broadcastIdPrefix, {
        oldValue: scope.data.isOn,
        newValue: !scope.data.isOn,
      });
    }

    init();
  }

  return {
    link: link,
    scope: {
      drctvModel: '='
    },
    template: 
/*
    '<div class="button-container"> \
    <button type="button" \
    ng-class="{\'btn\':true, \'btn-default\':!data.isOn, \'btn-success\':data.isOn, \'waiting\':data.isSaving}" \
    ng-click="processClick()"> \
    {{ data.isOn ? data.buttonTextOn : data.buttonTextOff }} \
    </button> \
    <i ng-if="data.isOn" class="fa fa-check"></i> \
    <i ng-if="data.isSaving" class="fa fa-hourglass-half"></i> \
    <i ng-if="data.updateFailed" class="fa fa-thumbs-o-down" "></i> \
    </div>'
*/ 
    '<div class="button-container" ng-class="{\'button-container\':true, \'off\':!data.isOn, \'on\':data.isOn, \'waiting\':data.isSaving}">\
    <button type="button" \
      ng-class="{\'btn\':true, \'btn-default\':!data.isOn, \'btn-success\':data.isOn, \'waiting\':data.isSaving}" \
      ng-click="processClick()"> \
    </button> \
    <div class="button-text">{{ data.isOn ? data.buttonTextOn : data.buttonTextOff }}</div> \
      <i ng-if="data.isOn" class="fa fa-check"></i> \
      <i ng-if="data.isSaving" class="fa fa-hourglass-half"></i> \
      <i ng-if="data.updateFailed" class="fa fa-thumbs-o-down" "></i> \
    </div>'

  }
})