app.directive('bhStageProgressIndicator', function() {

	function link(scope, elem, attrs) {

		var valuesArray = eval(attrs['values']); // passed as string, convert back to array. TODO: error if not array
		scope.localData = {};
		scope.localData.values = valuesArray; 
		scope.localData.model = attrs['initValue'];
	}
	return {
		link: link,
		templateUrl: 'app/html/templates/tpl-stage-progress-indicator.html'
	};

});

