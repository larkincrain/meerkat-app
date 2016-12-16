angular.module('meerkat.controllers', ['meerkat.services'])

	.controllers('SignInCtrl', function ($rootScope, $scope, API, $window) {

		//if the user is already logged in, take him to his feed
		if ($rootScope.isSessionActive() ){
			$window.location.href = ('#/feed/list');
		}

		//define the user data
		$scope.user = {
			email: '',
			password: ''
		};

		$scope.validateUser = function() {
			var email = this.user.email;
			var password = this.user.password;

			//check to see if we have enough to validate on
			if (!email || !password) {
				$rootScope.notify('Please enter valid credentials.');
				return false;
			}

			//attempt to validate
			$rootScope.show('Please wait while we authenticate!');
			API.signin(email, password)
				.success( function(data) {
					//check to see if this is successful or not
					if (data.success) {
						//save the token and redirect to the home screen
						$rootScope.setToken(data.token);
						$rootScope.hide();
						$window.location.href = ('#/feed/list');
					} else {
						$rootScope.hide();
						$rootScope.notify(data.message);
					}
				}).error( function(error) {
					$rootScope.hide();
					$rootScope.notify(data.message);
				});
		}
	})

	.controller('SingUpCtrl', function ($rootScope, $scope, API, $window) {
		$scope.user = {
			name: '',
			email: '',
			password: '',
		};

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
						$rootScope.setToken(data.token);
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

	.controller('myFeedCtrl', function ($rootScope, $scope, API, $ionicModal, $window) {

		$rootScope.$on('fetchCompleted', function() {
			API.getUsers($rootScope.getToken())
				.success (function (data, status, headers, config) {
					$scope.feed = [];

					//iterate through each user
					for (var count = 0; count < data.length; count ++){
						$scope.feed.push( data[count]);
					}

					//check if we have no data
					if (data.length == 0) {
						$scope.noData = true;
					} else {
						$scope.noData = false;
					}
				})
				.error (function (data, status, headers, config) {
					$rootScope.notify('Something wrong happened');
				});
		});

		$rootScope.$broadcast('fetchCompleted');
	});