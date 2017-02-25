app.service('utils', function($http, $timeout, $location, cfgApp) {
	return {

		getLocalMockRequestObject: function(baseUrl, urlExtension) {
			return {
				urlNoParams: baseUrl + urlExtension,
				requestType: 'GET',
				parameters: {}
			}
		},

		getUrlParamValue: function(key) {
			 return $location.search()[key];
		},
		
		setPageTitle: function(title) {
			window.document.title = title;
		},

		getMockDataReturnTime: function(minSecs, maxSecs) {
			var minSeconds = minSecs !== undefined ? minSecs : 1;
			var maxSeconds = maxSecs !== undefined ? maxSecs : 2;
			var randSeconds = this.getIntegerInclusiveBetween(minSeconds, maxSeconds);
			var milliSeconds = Math.floor(randSeconds * 1000);
			return milliSeconds;
		},
		
		getIntegerInclusiveBetween: function(min, max) {
			return Math.floor(Math.random()*(max-min+1) + min);
		},
				
		getUrlParamString: function(objParams) {
			var paramString = '';
			var isFirstItem = true;
			for(var key in objParams) {
				isFirstItem === true ? isFirstItem = false : paramString += '&';
				paramString += encodeURIComponent(key) + '=' +  encodeURIComponent(objParams[key]);
			};
			return paramString;
		},
		
		setLocalStorage: function(key, value) {
			localStorage.setItem(key, value);
		},
		
		getLocalStorage: function(key) {
			return localStorage.getItem(key);
		},

		evaluateObjectWithFunctions: function(sourceObject) {  // evaluates functions as values in object
			var destObject = {};
			for(var key in sourceObject) {
		  	var value = sourceObject[key];
		    switch(typeof value) {
		    	case 'function':
			      	value = value(); // execute function
			        break;
		      	case 'object':
		      		if(value === null) {
		      			value = null;
		      		} else if(!angular.isArray(value)) {
			      		value = this.evaluateObjectWithFunctions(value); // recursive
			      	}		      	
			        break;
		      default: // nothing required      	
		    }
		 		destObject[key] = value;
		  }
		  return destObject;
		},

	    isFloat2DigitsMax: function(string) {
	      var pattern = new RegExp(/^\d*\.?(\d{1,2})?$/);
	      return pattern.test(string);
	    },
	    formatWithCommas: function(number) {
	      // source:  http://jsfiddle.net/hAfMM/
	      return parseFloat(number).toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, "$1,");
	    },
	    removeCommas: function(string) {
	      return string.replace(/,/g, '');
	    },
	    padTo2Decimals: function(numberAsString) {
	    	var patternNoDecimals = new RegExp(/\d$/);
	    	var patternDecimalOnly = new RegExp(/\.$/);
	    	var patternOneDecimal = new RegExp(/\.\d$/);
	    	var patternTwoDecimals = new RegExp(/\.\d\d$/);

	    	if(patternTwoDecimals.test(numberAsString)) {
	    		return numberAsString;
	    	};
	    	if(patternOneDecimal.test(numberAsString)) {
	    		return numberAsString + '0';
	    	};
	    	if(patternDecimalOnly.test(numberAsString)) {
	    		return numberAsString + '00';
	    	};
	    	if(patternNoDecimals.test(numberAsString)) {
	    		return numberAsString + '.00';
	    	};
	    },
	    
	    getBaseObjectPropertyString: function(objectPropertyString) {
	      var arrTokens = objectPropertyString.split('.');
	      return arrTokens[arrTokens.length - 1];
	    },

		doAjaxCall: function(requestObj) {
			var requestId = requestObj.requestId;
			var urlNoParams = requestObj.urlNoParams;
			var broadcastId = requestObj.broadcastId;
			var pageScope = requestObj.pageScope;
			var parameters = requestObj.parameters;
			var requestType = requestObj.requestType;
			var _pageId = requestObj.pageScope.getPageName();

			if(requestType === 'GET') {
				var paramString = this.getUrlParamString(parameters);
				var url = urlNoParams + (paramString ? '?' + paramString : '');

				$timeout(function() { // not sure why I need timeout
					pageScope.$broadcast(broadcastId, {action: "START_WAIT"});
				}, 0);
				
				$timeout(function() { // TODO: remove
					var promise = $http.get(url, {withCredentials: true}); 

					promise.success(function(response) {  
						//console.log('............. url: ' + url);
						//console.log('$$$$$$$$$$$$ parameters: ', parameters);
//						console.log(JSON.stringify(response));

						console.log('** ' + requestId + ': ', response);

						pageScope.$broadcast(broadcastId, {
							action: "DISPLAY_DATA",
							data: response
						});
						pageScope.$broadcast(broadcastId, {action: "STOP_WAIT"});
					});
					promise.error(function(response, status) {  
						console.log("The request failed with response " + response + " and status code " + status);						
						pageScope.$broadcast(broadcastId, {
							action: "REQUEST_FAILED",
							data: response
						});
					});

				}, cfgApp.page[_pageId].dataSource === 'local' ? this.getMockDataReturnTime() : 0);
			} else if (requestType === 'POST') {

				var  url = urlNoParams;
				var self = this;


				$timeout(function() { // not sure why I need timeout
					pageScope.$broadcast(broadcastId, {action: "START_WAIT"});
				}, 0);
				
				$timeout(function() { // TODO: remove

					var config = {
		                withCredentials: true
					};
					var evaluatedParameters = self.evaluateObjectWithFunctions(parameters);
					var promise = $http.post(url, evaluatedParameters);  
					promise.success(function(response) {  
						console.log('** ' + requestId + ': ', response);
						
//						console.log(JSON.stringify(response));

						pageScope.$broadcast(broadcastId, {
							action: "DISPLAY_DATA",
							data: response
						});

						pageScope.$broadcast(broadcastId, {action: "STOP_WAIT"});
					});
					promise.error(function(response, status) {  
						console.log("ERROR: The request failed with response " + response + " and status code " + status);
						pageScope.$broadcast(broadcastId, {
							action: "REQUEST_FAILED",
							data: response
						});
					});

				}, cfgApp.page[_pageId].dataSource === 'local' ? this.getMockDataReturnTime() : 0);
			} else {
				console.log('Error: requestType unrecognized: ' + requestType);
			}
		}
	}
});

app.service('paginationService', function(cfgApp) { // needs service to provide singleton across controllers

	var _collection = {};
	
	return {
		getData : function(key) {
			if(!_collection[key]) {
				 var dataObj = cfgApp.paginationDataSets[key];
				 if(!dataObj) {
				 	console.log('ERROR: pagination data object not found in cfg for key = ' + key);
				 }
				_collection[key] = dataObj;
			}
			return _collection[key];
		}
	};
});	


app.service('timeFunctions', function() { // uses moment.js, all times in unix milliseconds
	return {
		getNow: function() {
			return parseInt(moment().format('x'));
		},
		getStartOfToday: function() {
			return parseInt(moment().startOf('day').format('x'));
		},
		getEndOfToday: function() {
			return parseInt(moment().endOf('day').format('x'));
		},
		getStartOfTomorrow: function() {
			return parseInt(moment().add(1, 'days').startOf('day').format('x'));
		},
		getEndOfNextWeek: function() {
			return parseInt(moment().add(7, 'days').endOf('day').format('x'));
		}
	}
});

