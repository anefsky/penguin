app.filter('bhGetCentsFromDollars', function() {
	return function(dollars) {
		var decimalPart = Math.floor(dollars * 100) % 100;
		if(decimalPart.toString().length < 2) {
			decimalPart = '0' + decimalPart;
		}
		return decimalPart;
	}
});
