app.directive('bhWaitingDiv',function($timeout) {
	function link(scope, elem, attrs) {
		function addSpinnerElement() {
			var spinner = angular
					.element('<i class="bh-centered-icon fa fa-spinner fa-spin"></i>');
			if(attrs.showSpinner === 'false') {
				spinner.addClass('hidden');
			}
			elem.prepend(spinner);
		}
		function removeSpinnerElement() {
			var spinnerElem = elem[0]
					.getElementsByClassName('bh-centered-icon');
			angular.element(spinnerElem).remove();
		}

		scope.doStartWait = function() {
			elem.removeClass('hidden');
			addSpinnerElement();
		};

		scope.doStopWait = function() {
			removeSpinnerElement();
		};		

		function init() {
			elem.addClass('hidden');
			elem.addClass('bh-loader-container');
		}
		
		init();
	}
	return {
		templateUrl : function(elem, attrs) {
			return attrs['includedPartial'];
		},
		link : link,
		scope: true
	};
});
