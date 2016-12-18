// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('meerkat', ['ionic', 'meerkat.controllers', 'meerkat.services', 'ngCordovaBeacon'])

  .run(function($ionicPlatform) {
    $ionicPlatform.ready(function() {
      if(window.cordova && window.cordova.plugins.Keyboard) {
        // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
        // for form inputs)
        cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);

        // Don't remove this line unless you know what you are doing. It stops the viewport
        // from snapping when text inputs are focused. Ionic handles this internally for
        // a much nicer keyboard experience.
        cordova.plugins.Keyboard.disableScroll(true);
      }
      if(window.StatusBar) {
        StatusBar.styleDefault();
      }
    });
  })

  .config (function ($stateProvider, $urlRouterProvider){
    $stateProvider
      .state ('auth', {
        url: '/auth',
        abstract: true,
        templateUrl: 'templates/auth.html'
      })
      .state ('auth.signin', {
        url: '/signin',
        views: {
          'auth-signin': {
            templateUrl: 'templates/auth-signin.html',
            controller: 'SignInCtrl'
          }
        }
      })
      .state ('auth.signup', {
        url: '/signup',
        views: {
          'auth-signup': {
            templateUrl: 'templates/auth-signup.html',
            controller: 'SignUpCtrl'
          }
        }
      })
      .state ('feed', {
        url: '/feed',
        abstract: true,
        templateUrl: 'templates/feed.html'
      })
      .state ('feed.list', {
        url: '/list',
        views: {
          'feed-list': {
            templateUrl: 'templates/feed-list.html',
            controller: 'myFeedCtrl'
          }
        }
      });
    $urlRouterProvider.otherwise('/auth/signin');
  });
