angular.module('meerkat.controllers', ['meerkat.services'])

	.controller('SignInCtrl', function ($rootScope, $scope, API, $window) {

		//if the user is already logged in, take him to his feed
		if ($rootScope.isSessionActive() ){
			$window.location.href = ('#/feed/list');
		}

		//define the user data
		$scope.user = {
			email: '',
			password: ''
		};

		$scope.debugging = {
			message: '',
			success: true
		}

		$scope.validateUser = function() {
			var email = this.user.email;
			var password = this.user.password;

			$scope.debugging.message = 'About to validate the user.';

			//check to see if we have enough to validate on
			if (!email || !password) {
				$scope.debugging.message += '\r\nIncorrect credentials.';
				$scope.debugging.success = false;

				$rootScope.notify('Please enter valid credentials.');
				return false;
			}

			//attempt to validate
			$rootScope.show('Please wait while we authenticate!');
			$scope.debugging.message += '\r\nPlease wait while we authenticate.';

			API.signin(email, password)
				.success( function(data) {
					//check to see if this is successful or not
					if (data.success) {
						//save the token and redirect to the home screen
						$rootScope.setToken(data.jwt);
						$rootScope.hide();

						// console.log('got token: ' + data.jwt);

						// $window.localStorage.token = data.jwt;

						$window.location.href = ('#/feed/list');
					} else {
						$scope.debugging.message += '\r\n Error: ' + data.message;	
						$scope.debugging.success = false;

						$rootScope.hide();
						$rootScope.notify(data.message);
					}
				}).error( function(error) {

					console.log(error);

					$scope.debugging.message += '\r\n Big Error: ' + JSON.stringify(error);
					$scope.debugging.success = false;

					$rootScope.hide();
					$rootScope.notify(error);
				});
		}
	})

	.controller('SignUpCtrl', function ($rootScope, $scope, API, $window) {
		$scope.user = {
			name: '',
			email: '',
			password: '',
		};

		console.log('in the signup controller');

		$scope.createUser = function() {
			var email = this.user.email;
			var password = this.user.password;
			var name = this.user.name;

			// check to see if we have enough information
			if (!email || !password || !name) {
				$rootScope.notify('Please enter all required information');
				return false;
			}

			//Now let's create a new user
			$rootScope.show('Please wait while sign you up.');
			API.signup(name, email, password)
				.success(function (data) {

					if (data.success) {
						//save the access token
						$rootScope.setToken(data.jwt);

						$window.localStorage.token = data.jwt;

						$rootScope.hide();
						$window.location.href = ('#/feed/list');
					} else {
						//problem with authenticating, so display the error message
						$rootScope.hide();
						$rootScope.notify(data.message);
					}
				})
				.error(function (error){
					//problem with authenticating, so display the error message
					$rootScope.hide();
					$rootScope.notify(data.message);
				});
		}
	})

	.controller('myFeedCtrl', function ($rootScope, $scope, API, $window, $ionicPlatform, $cordovaBeacon) {

		$scope.beacons = {};		
		$scope.token = $window.localStorage.token;
		 
	    $ionicPlatform.ready(function() {
	 
			$cordovaBeacon.requestWhenInUseAuthorization();
	 
	        $rootScope.$on("$cordovaBeacon:didRangeBeaconsInRegion", function(event, pluginResult) {
	            var uniqueBeaconKey;
	            for(var i = 0; i < pluginResult.beacons.length; i++) {
	                uniqueBeaconKey = pluginResult.beacons[i].uuid + ":" + pluginResult.beacons[i].major + ":" + pluginResult.beacons[i].minor;
	                $scope.beacons[uniqueBeaconKey] = pluginResult.beacons[i];

	            	//If we find a beacon, then we should determine which promotion it is tied to.
	                API.getPromotionByBeaconId($rootScope.getToken(), $scope.beacons)
	                	.success( function (data, status, headers, config) {
							$scope.feed = [];

							//debugging
							console.log('Got promotion data');
							console.log(data);

							//iterate through each user
							for (var count = 0; count < data.length; count ++){
								$scope.feed.push( data[count]);
							}

							//more debugging
							console.log('Feed info');
							console.log($scope.feed);

							//check if we have no data
							if (data.length == 0) {
								$scope.noData = true;
							} else {
								$scope.noData = false;
							}
	                	});
	            }	

	            $scope.$apply();
	        });
				
	        $cordovaBeacon.startRangingBeaconsInRegion($cordovaBeacon.createBeaconRegion("estimote", "b9407f30-f5f8-466e-aff9-25556b57fe6d"));

	    });
	    
		API.getPromotions($rootScope.getToken())
			.success (function (data, status, headers, config) {
				
			})
			.error (function (data, status, headers, config) {
				$rootScope.notify('Something wrong happened');
			});
	});

