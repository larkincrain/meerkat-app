angular.module('meerkat.services', [])
	.factory('API', function($rootScope, $http, $ionicLoading, $window){
		//var base = 'http://localhost:1235';
		var base = 'http://ec2-54-186-96-29.us-west-2.compute.amazonaws.com:1235';

		$rootScope.show = function (text) {
			$rootScope.loading = $ionicLoading.show({
				content: text ? text: 'Loading',
				animatino: 'fade-in',
				showBackdrop: true,
				maxWidth: 200,
				showDelay: 0
			});
		};

		$rootScope.hide = function () {
			$ionicLoading.hide();
		};

		$rootScope.logout = function () {
			$rootScope.setToken('');
			$window.location.href = '#/auth/signin';
		};

		$rootScope.notify = function (text) {
			$rootScope.show(text);
			$window.setTimeout (function () {
				$rootScope.hide();
			}, 1999);
		};

		$rootScope.doRefresh = function (tab) {
			if (tab == 1)
				$rootScope.$broadcast('fetchAll');
			else 
				$rootScope.$broadcast('fetchCompleted');

			$rootScope.broadcast('scroll.refreshComplete');
		};

		$rootScope.setToken = function (token) {
			return $window.localStorage.token = token;
		}

		$rootScope.getToken = function() {
			return $window.localStorage.token;
		}

		$rootScope.isSessionActive = function() {
			return $window.localStorage.token ? true : false;
		}

		return {
			signin: function (email, password) {
				return $http({
					url: base + '/api/authenticate',
					method: 'POST',
					data: {
						email: email,
						password: password
					}
				});
			},

			signup: function(name, email, password) {
				return $http({
					url: base + '/api/users',
					method: 'POST',
					data: {
						name: name,
						email: email,
						password: password
					}
				});
			},

			getPromotions: function(token) {
				return $http({
					url: base + '/api/promotions',
					method: 'GET',
					params: {
						token: token
					}
				});	
			},

			getUsers: function(token) {
				return $http({
					url: base + '/api/users',
					method: 'GET',
					params: {
						token: token
					}
				});	
			}
		}
	});