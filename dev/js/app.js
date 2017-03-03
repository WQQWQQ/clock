angular.module('starter', ['ionic', 'controllers', 'services','directives'])
.run(function($ionicPlatform,$location,$state) {
  $ionicPlatform.ready(function() {
    if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);
    }
    if (window.StatusBar) {
      StatusBar.styleDefault();
    }
    if ($location.$$path!='/tab/clock'){
      window.setTimeout(function (){
        $state.go('tab.clock');
      },50);
    }
  });
})
.config(function($stateProvider, $urlRouterProvider,$ionicConfigProvider,$anchorScrollProvider) {
  $ionicConfigProvider.tabs.position('bottom');
  $ionicConfigProvider.tabs.style('standard');
  $ionicConfigProvider.navBar.alignTitle('center');
  $ionicConfigProvider.views.transition('ios');
  $ionicConfigProvider.form.checkbox('ios');
  $ionicConfigProvider.form.toggle('ios');
  $ionicConfigProvider.spinner.icon('ios-small');
  $ionicConfigProvider.views.forwardCache(true);
  $ionicConfigProvider.backButton.previousTitleText(true);
  $ionicConfigProvider.backButton.text("");
  $ionicConfigProvider.templates.maxPrefetch(20);
  $ionicConfigProvider.views.swipeBackEnabled(false);
  $ionicConfigProvider.scrolling.jsScrolling(true);
  $ionicConfigProvider.backButton.icon("ion-ios-arrow-left");
  $ionicConfigProvider.backButton.previousTitleText(true);
  $anchorScrollProvider.disableAutoScrolling();

  $urlRouterProvider.otherwise('/tab/clock');
  $stateProvider
  .state('tab', {
    url: '/tab',
    abstract: true,
    templateUrl: 'templates/tabs.html'
  })
  .state('tab.clock', {
    cache: false,
    url: '/clock',
    views: {
      'tab-clock': {
        templateUrl: 'templates/tab-clock.html',
        controller: 'ClockCtrl'
      }
    }
  })
  .state('tab.new-clock', {
    cache: false,
    url: '/new-clock',
    params:{
      list:null,
      index:null
    },
    views: {
      'tab-clock': {
        templateUrl: 'templates/new-clock.html',
        controller: 'NewClockCtrl'
      }
    }
  })
  .state('tab.world', {
      cache: false,
      url: '/world',
      views: {
        'tab-world': {
          templateUrl: 'templates/tab-world.html',
          controller: 'WorldCtrl'
        }
      }
    })
  .state('tab.new-world', {
    cache: true,
    url: '/new-world',
    views: {
      'tab-world': {
        templateUrl: 'templates/new-world.html',
        controller: 'NewWorldCtrl'
      }
    }
  })
  .state('tab.hourglass', {
    cache: true,
    url: '/hourglass',
    views: {
      'tab-hourglass': {
        templateUrl: 'templates/tab-hourglass.html',
        controller: 'HourglassCtrl'
      }
    }
  })
  .state('tab.stopwatch', {
    cache: true,
    url: '/stopwatch',
    views: {
      'tab-stopwatch': {
        templateUrl: 'templates/tab-stopwatch.html',
        controller: 'StopwatchCtrl'
      }
    }
  });
});

