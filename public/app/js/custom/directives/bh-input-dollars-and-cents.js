app.directive('bhInputDollarsAndCents', function(utils) {
  function link(scope, elem, attrs) {
    var _oldValue, _originalValue;
    var _input = angular.element(elem)[0].querySelector('input');
    var _broadcastIdPrefix = attrs['broadcastIdPrefix'];

    function init() {
      initData();
      createBroadcastHandlers();
    }

    function initData() {
      scope.data = {};
      _oldValue = _originalValue = scope.drctvModel = (function() {
          return (scope.drctvModel ? utils.formatWithCommas(scope.drctvModel) : null);
      })();
    }

    scope.onKeyUp = function(event) {
      var newValue = scope.drctvModel;
      if (utils.isFloat2DigitsMax(newValue)) {
        _oldValue = newValue;
      } else { // regex failed, revert to previous value before last key entry
        scope.drctvModel  = _oldValue;
      }
    };

    scope.onBlurEvent = function() {
      if(scope.drctvModel === '') {
        scope.drctvModel = null;
      }
      if(didEntryChange(scope.drctvModel, _originalValue)) { // changed
        requestServerUpdate();
      }
      if (scope.drctvModel != null) { // format if number not empty
        scope.drctvModel = utils.formatWithCommas(scope.drctvModel);
      }
    };

    scope.onFocusEvent = function() {
      scope.data.isSaved = false;
      scope.data.isSaving = false;

      _originalValue = scope.drctvModel;

      if (scope.drctvModel) {
       scope.drctvModel = utils.removeCommas(scope.drctvModel);
      }
      _input.select();  // not working for numbers with commas; had to add ng-click
     };

    scope.onTextClick = function ($event) { // highlight text
      $event.target.select();
    };


    function didEntryChange(oldValue, newValue) {

      if((oldValue === null && newValue !== null) || (oldValue !== null && newValue === null)) {
        return true;
      }
      if(oldValue === null && newValue === null) {
        return false;
      }
      return utils.removeCommas(oldValue) != utils.removeCommas(newValue);
    }

    function requestServerUpdate() {

        scope.data.isSaving = true;

        scope.$emit('save-item-price-update', {
            oldValue: _originalValue ? parseFloat(_originalValue) : null,
            newValue:scope.drctvModel ? parseFloat(scope.drctvModel) : null,
        });
    }

    function createBroadcastHandlers() {
      scope.$on('save-item-price-update-successful', function() {
          scope.data.isSaving = false;
          scope.data.isSaved = true;
       });

      scope.$on('save-item-price-update-failed', function() {
          scope.data.isSaving = false;
          scope.data.saveFailed = true;
       });
    }

    scope.onKeypress = function(event) {
      if(event.key === 'Enter') {
        _input.blur();
      }
    }

    init();
  }

  return {
    link: link,
  scope: {
    drctvModel: '='
  },
    template: 
      '<div class="bh-input-dollars-and-cents"> \
        <input type="text" ng-class="{\'saving\': data.isSaving}" ng-model="drctvModel" \
        	ng-keyup="onKeyUp()" ng-blur="onBlurEvent()" ng-focus="onFocusEvent()" \
          ng-keypress="onKeypress($event)" ng-click="onTextClick($event)"/> \
        <i ng-if="data.isSaving" class="fa fa-hourglass-half"></i> \
        <i ng-if="data.isSaved" class="fa fa-check"></i> \
        <i ng-if="data.saveFailed" class="fa fa-thumbs-o-down"></i> \
      </div>'
    }
});
