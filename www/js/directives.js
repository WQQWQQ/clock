/**
 * Created by Quincy on 2016/7/12.
 */
angular.module('directives', ["services"])
  .directive('hideTabs', ["$rootScope", function ($rootScope) {
    return {
      restrict: 'AE',
      link: function ($scope) {
        $rootScope.hideTabs = 'tabs-item-hide';
        $scope.$on('$destroy', function () {
          $rootScope.hideTabs = '';
        })
      }
    }
  }])
  .directive("headerBack", ["$ionicNavBarDelegate", function ($ionicNavBarDelegate) {
    return {
      restrict: "ACE",
      replace: true,
      scope: {
        goBack: "&"
      },
      template: '<ion-nav-buttons side="left"><button class="button button-icon icon ion-ios-arrow-left" ng-click="goBack();"></button></ion-nav-buttons>',
      link: function (scope, ele, attr) {
        $ionicNavBarDelegate.showBackButton(false);
      }
    }
  }])
  .directive("alphabet", ["$icu", "$ionicScrollDelegate", "$location", "$anchorScroll", "$data", function ($icu, $ionicScrollDelegate, $location, $anchorScroll, $data) {
    return {
      restrict: "ACE",
      replace: true,
      template: ' <div id="alphabet"><a class="letter" ng-repeat="letter in letterList" >{{letter}}</a></div>',
      link: function (scope, ele, attr) {
        var $alphabet = $("#alphabet");
        var timeout = null, start = null, startIndex = null;
        var capitalList = $data.getCapitalList();
        $alphabet.on("touchstart", function (e) {
          e.stopPropagation();
          $(this).css({
            "background-color": "rgba(0,0,0,.5)",
            "color": "#fff"
          });
          start = e.originalEvent.targetTouches[0].clientY;
          scope.currLetter = e.target.innerHTML;
          startIndex = scope.letterList.indexOf(scope.currLetter);
          scope.letterShow = true;
          scope.$apply();
          if (capitalList.indexOf(scope.currLetter) > -1) {
            $location.hash(scope.currLetter);
            $ionicScrollDelegate.anchorScroll(false);
          }
        });
        $alphabet.on("touchmove", function (e) {
          timeout = $icu.timeout(function () {
            var distance = e.originalEvent.targetTouches[0].clientY - start;
            var count = Math.round(Math.abs(distance) / 16);
            var index;
            if (distance > 0) {
              index = startIndex + count;
              if (index > 23) {
                index = 23;
              }
            } else {
              index = startIndex - count;
              if (index < 0) {
                index = 0;
              }
            }
            scope.currLetter = scope.letterList[index];
            scope.$apply();
            if (capitalList.indexOf(scope.currLetter) > -1) {
              $location.hash(scope.currLetter);
              $ionicScrollDelegate.anchorScroll(false);
            }
          }, 500);
        });
        $alphabet.on("touchend", function () {
          $icu.clearTimeOut(timeout);
          timeout = null;
          $(this).css({
            "background-color": "transparent",
            "color": "#000"
          });
          scope.letterShow = false;
          scope.$apply();
        });
      }
    }
  }])
  .directive("timeSelector", ["$icu", function ($icu) {
    return {
      templateUrl: "templates/timeSelector.html",
      restrict: "E",
      replace: true,
      scope: {},
      link: function ($scope, $ele, $attr) {
        var $elem = $($ele),
          $leftCon = $elem.find(".leftContainer"),
          $leftSpan = $elem.find(".leftContainer").find("span"),
          $leftStage= $elem.find(".leftStage"),
          $rightStage = $elem.find(".rightStage"),
          $rightCon = $elem.find(".rightContainer"),
          $rightSpan = $elem.find(".rightContainer").find("span"),
          leftStartY,
          rigthStartY,
          leftlastDeg=0,
          rightlastDeg=0,
          leftNum=0,
          rightNum=0,
          leftLastBlue=0,
          leftLastO1=2,
          leftLastO2=3,
          leftLastO3=22,
          leftLastO4=21,
          rightLastBlue=0,
          rightLastO1=2,
          rightLastO2=3,
          rightLastO3=58,
          rightLastO4=57;

        function checkNum(num,type) {
          if(type=="minute"){
            if(num>=60){
              num=num-60;
            }else if(num<0){
              num=60+num;
            }
          }else{
            if(num>=24){
              num=num-24;
            }else if(num<0){
              num=24+num;
            }
          }

          return num;
        }

        $leftStage.on("touchstart", function (e) {
          leftStartY=e.originalEvent.changedTouches[0].clientY;
        }).on("touchmove",function (e) {
          $leftSpan.eq(leftLastBlue).removeClass("centerNum");
          $leftSpan.eq(leftLastO1).removeClass("opacityNum");
          $leftSpan.eq(leftLastO2).removeClass("opacityNum");
          $leftSpan.eq(leftLastO3).removeClass("opacityNum");
          $leftSpan.eq(leftLastO4).removeClass("opacityNum");
          var deg=leftlastDeg-(e.originalEvent.changedTouches[0].clientY-leftStartY);
          $leftCon.css({
            "transform": "rotateX(" + (deg) + "deg)"
          });
          var increasement=Math.round(deg%360/15);
          leftNum=increasement>=0?increasement:24+increasement;
          $leftSpan.eq(leftNum).addClass("centerNum");
          leftLastO1=checkNum(leftNum+2,"hour");
          leftLastO2=checkNum(leftNum+3,"hour");
          leftLastO3=checkNum(leftNum-2,"hour");
          leftLastO4=checkNum(leftNum-3,"hour");
          $leftSpan.eq(leftLastO1).addClass("opacityNum");
          $leftSpan.eq(leftLastO2).addClass("opacityNum");
          $leftSpan.eq(leftLastO3).addClass("opacityNum");
          $leftSpan.eq(leftLastO4).addClass("opacityNum");
          leftLastBlue=leftNum;
        }).on("touchend",function (e) {
          $leftSpan.eq(leftLastBlue).removeClass("centerNum");
          $leftSpan.eq(leftLastO1).removeClass("opacityNum");
          $leftSpan.eq(leftLastO2).removeClass("opacityNum");
          $leftSpan.eq(leftLastO3).removeClass("opacityNum");
          $leftSpan.eq(leftLastO4).removeClass("opacityNum");
          var y=e.originalEvent.changedTouches[0].clientY-leftStartY;
          var deg=leftlastDeg-(y-y%15);
          $leftCon.css({
            "transform": "rotateX(" + deg + "deg)",
            "transition": "transform 1s ease-out"
          });
          leftlastDeg=deg;
          var increasement=leftlastDeg%360/15;
          leftNum=increasement>=0?increasement:24+increasement;
          leftLastBlue=leftNum;
          $leftSpan.eq(leftNum).addClass("centerNum");
          leftLastO1=checkNum(leftNum+2,'hour');
          leftLastO2=checkNum(leftNum+3,'hour');
          leftLastO3=checkNum(leftNum-2,'hour');
          leftLastO4=checkNum(leftNum-3,'hour');
          $leftSpan.eq(leftLastO1).addClass("opacityNum");
          $leftSpan.eq(leftLastO2).addClass("opacityNum");
          $leftSpan.eq(leftLastO3).addClass("opacityNum");
          $leftSpan.eq(leftLastO4).addClass("opacityNum");
        });

        $rightStage.on("touchstart", function (e) {
          rigthStartY=e.originalEvent.changedTouches[0].clientY;
        }).on("touchmove",function (e) {
          $rightSpan.eq(rightLastBlue).removeClass("rightCenterNum");
          $rightSpan.eq(rightLastO1).removeClass("rightOpacityNum");
          $rightSpan.eq(rightLastO2).removeClass("rightOpacityNum");
          $rightSpan.eq(rightLastO3).removeClass("rightOpacityNum");
          $rightSpan.eq(rightLastBlue).removeClass("rightOpacityNum");
          var deg=rightlastDeg-(e.originalEvent.changedTouches[0].clientY-rigthStartY)/3;
          $rightCon.css({
            "transform": "rotateX(" + deg + "deg)"
          });
          var increasement=Math.round(deg%360/6);
          rightNum=increasement>=0?increasement:24+increasement;
          $rightSpan.eq(rightNum).addClass("rightCenterNum");
          rightLastO1=checkNum(rightNum+2,'minute');
          rightLastO2=checkNum(rightNum+3,'minute');
          rightLastO3=checkNum(rightNum-2,'minute');
          rightLastO4=checkNum(rightNum-3,'minute');
          $rightSpan.eq(rightLastO1).addClass("rightOpacityNum");
          $rightSpan.eq(rightLastO2).addClass("rightOpacityNum");
          $rightSpan.eq(rightLastO3).addClass("rightOpacityNum");
          $rightSpan.eq(rightLastO4).addClass("rightOpacityNum");
          rightLastBlue=rightNum;
        }).on("touchend",function (e) {
          $rightSpan.eq(rightLastBlue).removeClass("rightCenterNum");
          $rightSpan.eq(rightLastO1).removeClass("rightOpacityNum");
          $rightSpan.eq(rightLastO2).removeClass("rightOpacityNum");
          $rightSpan.eq(rightLastO3).removeClass("rightOpacityNum");
          $rightSpan.eq(rightLastBlue).removeClass("rightOpacityNum");
          var y=(e.originalEvent.changedTouches[0].clientY-rigthStartY)/3;
          var deg=rightlastDeg-(y-y%6);
          $rightCon.css({
            "transform": "rotateX(" + deg + "deg)",
            "transition": "transform 1s ease-out"
          });
          rightlastDeg=deg;
          var increasement=rightlastDeg%360/6;
          rightNum=increasement>=0?increasement:60+increasement;
          $rightSpan.eq(rightNum).addClass("rightCenterNum");
          rightLastO1=checkNum(rightNum+2,'minute');
          rightLastO2=checkNum(rightNum+3,'minute');
          rightLastO3=checkNum(rightNum-2,'minute');
          rightLastO4=checkNum(rightNum-3,'minute');
          $rightSpan.eq(rightLastO1).addClass("rightOpacityNum");
          $rightSpan.eq(rightLastO2).addClass("rightOpacityNum");
          $rightSpan.eq(rightLastO3).addClass("rightOpacityNum");
          $rightSpan.eq(rightLastO4).addClass("rightOpacityNum");
          rightLastBlue=rightNum;
        });
      }
    }
  }]);
