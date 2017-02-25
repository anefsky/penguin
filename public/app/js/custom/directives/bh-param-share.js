app.directive('bhParamShare', function() {
	function link(scope, elem, attrs) {
		
		var parameterName;

		function init() {
			parameterName = attrs.paramName;
			var defaultValue = attrs.defaultValue;
			var defaultType = attrs.defaultType;

			switch(defaultType) {  // params are always strings, need to convert to proper type
				case "integer":
					defaultValue = parseInt(defaultValue);
					break;
				case "boolean":
					defaultValue = (defaultValue === "true");
					break;
				case "null":
					defaultValue = null;
					break;
				case "array":
					defaultValue = [];
					break;
				default: 
					// do nothing - keep as string
			}

			if(defaultValue !== undefined) {
				setFilter(parameterName, defaultValue);
			}
		}
		
		scope.handleChange = function() {
			var value = scope.data[scope.modelKey];
			setFilter(parameterName, value);
		};
				
		scope.$on('unset_filter', function(event, args) {
			setFilter(args.filter_id, null);
		});

		scope.$on('do_go_to_first_page', function(event, args) { // TODO: improve
			setFilter('pageNumber', 1);
		});	
		
		function setFilter(id, value) {
			scope.$emit('set_filter_item', { // send to page
				'id' : id,
				'value' : value
			});
		}

		init();
	}
	return {
		link: link,
		scope: true
	};
});