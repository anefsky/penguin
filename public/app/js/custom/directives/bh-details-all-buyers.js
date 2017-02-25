app.directive('bhDetailsAllBuyers', function($timeout) {
	function link(scope, elem, attrs) {

		var _animationHandler;

		function init() {
			setLoadResponseHandler();
			setScopeFunctionHandlers();
		}


		function setLoadResponseHandler() {

			scope.$on('do_get_details_buyers', function(event, data) {
				var action = data.action;

				switch(action) {
					case 'DISPLAY_DATA':
						if(data.action === 'DISPLAY_DATA') {
							var buyers = data.data.data.list;
							createBuyersList(buyers);
							_animationHandler = new AnimationHandler();
						}
						break;
					case 'START_WAIT' :
						scope.doStartWait();
						break;
					case 'STOP_WAIT' :
						scope.doStopWait();
						scope.requestItemsFirstPageLoad();
						break;
					default : 
						console.log('ERROR: bad action: ' + action);
				}
			});
		}

		function createBuyersList(buyers) {
			buyers.forEach(function(buyer) {
				var buyerObj = {
					name: buyer.buyer.name,
					userId: buyer.buyer.userId,
					// buyerCodes: buyer.buyer.buyerCodes,
					itemCount: buyer.itemCount,
					isSelected: false			
				};
				scope.data.allBuyers.push(buyerObj);
			});
		}

		function setScopeFunctionHandlers() {
			scope.selectBuyer = function(buyer) {
				if(buyer.isSelected === true) { // already selected
					scope.deselectBuyer(buyer);
				} else {
					buyer.isSelected = true;
					scope.addToSelectedBuyersList(buyer);
					//scope.updateSelectedBuyerCodes();
					scope.updateSelectedBuyerUserIds();
				}
			};
		}

		scope.moveToRight = function() {
			_animationHandler.moveToRight();
		}

		scope.moveToLeft = function() {
			_animationHandler.moveToLeft();
		}

		function AnimationHandler() {
			var  _container, _moveable, _oneFramePx, _displacement, _arrowLeft, _arrowRight,
				_leftEdgeContainer, _rightEdgeContainer, _leftEdgeMoveable, _widthMoveable, _mainContainer;

			function init() {
				var rawElem = elem[0];
				_mainContainer = rawElem.querySelector('.main-container');
				_container = _mainContainer.querySelector('.set-container');
				_moveable = _mainContainer.querySelector('.set');
				_arrowLeft = _mainContainer.querySelector('.move-right');
				_arrowRight = _mainContainer.querySelector('.move-left');
				_leftEdgeContainer = getLeftEdgeXPosition(_container);
				_rightEdgeContainer = getRightEdgeXPosition(_container);
				_leftEdgeMoveable = getLeftEdgeXPosition(_moveable);

				var maxPctToMoveStillViewAll = 85; // full section viewable at some 
				widthContainer = _rightEdgeContainer - _leftEdgeContainer;
				_oneFramePx = maxPctToMoveStillViewAll/100 * widthContainer;

				_displacement = 0;
				
				$timeout(function() { // needs to render first
					_widthMoveable = getRightEdgeXPosition(_moveable) - _leftEdgeMoveable;
					enableOrDisableArrows();
					disableHighlighting();
				}, 100);
			}

			function getLeftEdgeXPosition(element) {
			  return element.getBoundingClientRect().left;
			}

			function getRightEdgeXPosition(element) {
			  return element.getBoundingClientRect().right;
			}

			function moveX(element, pixels) {
				_displacement += pixels;	
				element.style.transform = 'translateX(' + _displacement  + 'px)';
				_leftEdgeMoveable += pixels;
			}

			function moveToRight() {
				var amountToMove = Math.min(_oneFramePx,  Math.abs(_leftEdgeContainer - _leftEdgeMoveable));
				moveX(_moveable, amountToMove);
				enableOrDisableArrows();
			};

			function moveToLeft() {
				var rightEdgeMoveable = _leftEdgeMoveable + _widthMoveable;
				if(rightEdgeMoveable > _rightEdgeContainer) {
					var amountToMove = -1 * Math.min(_oneFramePx,  Math.abs(_rightEdgeContainer - rightEdgeMoveable));
					moveX(_moveable, amountToMove);
					enableOrDisableArrows();
				}
			}; 

			function enableOrDisableArrows() {
				rightEdgeMoveable = _leftEdgeMoveable + _widthMoveable;

				var toMaxLeft = _leftEdgeMoveable >= _leftEdgeContainer;
				var toMaxRight = rightEdgeMoveable <= _rightEdgeContainer;
				var leftArrow = angular.element(_arrowLeft);
				var rightArrow = angular.element(_arrowRight);

				var className = "disabled";
				toMaxRight? rightArrow.addClass(className) : rightArrow.removeClass(className);
				toMaxLeft ? leftArrow.addClass(className) : leftArrow.removeClass(className);
			}

			function disableHighlighting() { // prevents inadvertent text highlighting
				_mainContainer.addEventListener('mousedown', function(e){
					 	e.preventDefault(); 
					}, false);
			}

			init();

			return {
				moveToRight: function() {
					moveToRight();
				},
				moveToLeft: function() {
					moveToLeft();
				}
			}
		}

		init();
	}

	return {
		link: link,
		templateUrl : 'app/html/templates/tpl-details-all-buyers.html'
	};
});
