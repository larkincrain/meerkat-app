angular.module('meerkat.controllers', ['meerkat.services', 'ionic', 'ngCordova'])

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
						$rootScope.setUserData(data.user);
						$rootScope.hide();

						//TODO: We need to save the user object to a globally accessible location

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
		$scope.feed = [];
		$scope.debugging = "testing"; 

	    $ionicPlatform.ready(function() {
	 
			$cordovaBeacon.requestWhenInUseAuthorization();
	 
	        $rootScope.$on("$cordovaBeacon:didRangeBeaconsInRegion", function(event, pluginResult) {
	            var uniqueBeaconKey;
	            for(var i = 0; i < pluginResult.beacons.length; i++) {
	                uniqueBeaconKey = pluginResult.beacons[i].uuid + ":" + pluginResult.beacons[i].major + ":" + pluginResult.beacons[i].minor;
	                
	                //check if we already have this beacon
	                if (! $scope.beacons[uniqueBeaconKey]) {
		                $scope.beacons[uniqueBeaconKey] = pluginResult.beacons[i];
                        getPromotion(pluginResult.beacons[i].uuid);
	                }
	            }	

	            $scope.$apply();
	        });
				
	        $cordovaBeacon.startRangingBeaconsInRegion($cordovaBeacon.createBeaconRegion("estimote", "b9407f30-f5f8-466e-aff9-25556b57fe6d"));
	    });

		$scope.sharePromotion = function(promotion) {

			$scope.debugging = "sharing!";

			// this is the complete list of currently supported params you can pass to the plugin (all optional)
			var options = {
			  message: 'share this', // not supported on some apps (Facebook, Instagram)
			  subject: 'the subject', // fi. for email
			  files: ['', ''], // an array of filenames either locally or remotely
			  url: 'https://www.website.com/foo/#bar?a=b',
			  chooserTitle: 'Pick an app' // Android only, you can override the default share sheet title
			}

			var onSuccess = function(result) {
			  console.log("Share completed? " + result.completed); // On Android apps mostly return false even while it's true
			  console.log("Shared to app: " + result.app); // On Android result.app is currently empty. On iOS it's empty when sharing is cancelled (result.completed=false)
			}

			var onError = function(msg) {
			  console.log("Sharing failed with message: " + msg);
			}

			window.plugins.socialsharing.shareWithOptions(options, onSuccess, onError);

    		//$cordovaSocialSharing.share("This is your message", "This is your subject", null, "https://www.thepolyglotdeveloper.com");
		
    	   // $cordovaSocialSharing
		   //  .share(promotion, subject, promotion, link) // Share via native share sheet
		   //  .then(function(result) {
		   //  	// Success!

		   //  }, function(err) {
		   //  	// An error occured. Show a message to the user
		   //  });
    	};

    	$scope.favoritePromotion = function (promotion) {

    		API.favoritePromotion($rootScope.getToken(), promotion)
    			.success (function (data, stats, headers, config){
    				
    			});

    		$rootScope.getUserData().favorites.push(promotion); 
    	}

	    function getPromotion (beaconId) {
			API.getPromotionByBeaconId($rootScope.getToken(), beaconId)
            	.success( function (data, status, headers, config) {
            		$scope.feed.push(data);

                        cordova.plugins.notification.local.schedule({
						    title: data.title,
						    message: data.text
						});		

					//check if we have no data
					if (data.length == 0) {
						$scope.noData = true;
					} else {
						$scope.noData = false;
					}
            	});
	    };
	});

