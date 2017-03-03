/**
 * Created by Quincy on 2016/7/12.
 */
angular.module('directives', ["services"])
.directive('hideTabs',function($rootScope){
    return {
        restrict:'AE',
        link:function($scope){
            $rootScope.hideTabs = 'tabs-item-hide';
            $scope.$on('$destroy',function(){
                $rootScope.hideTabs = '';
            })
        }
    }
})
.directive("headerBack",function ($ionicNavBarDelegate) {
    return{
        restrict:"ACE",
        replace: true,
        scope:{
            goBack:"&"
        },
        template:'<ion-nav-buttons side="left"><button class="button button-icon icon ion-ios-arrow-left" ng-click="goBack();"></button></ion-nav-buttons>',
        link:function (scope,ele,attr) {
            $ionicNavBarDelegate.showBackButton(false);
        }
    }
})
.directive("alphabet",function ($icu,$ionicScrollDelegate,$location,$anchorScroll,$data) {
    return{
        restrict:"ACE",
        replace:true,
        template:' <div id="alphabet"> <a class="letter" ng-repeat="letter in letterList" >{{letter}}</a></div>',
        link:function (scope,ele,attr) {
            var $alphabet=$("#alphabet");
            var timeout=null,start=null,startIndex=null;
            var capitalList=$data.getCapitalList();
            console.log(capitalList);
            $alphabet.on("touchstart",function (e) {
                e.stopPropagation();
                $(this).css({
                    "background-color":"rgba(0,0,0,.5)",
                    "color":"#fff"
                });
                start=e.originalEvent.targetTouches[0].clientY;
                scope.currLetter=e.target.innerHTML;
                startIndex=scope.letterList.indexOf(scope.currLetter);
                scope.letterShow=true;
                scope.$apply();
                if(capitalList.indexOf(scope.currLetter)>-1){
                    $location.hash(scope.currLetter);
                    $ionicScrollDelegate.anchorScroll(false);
                }
            });
            $alphabet.on("touchmove",function (e) {
                timeout=$icu.timeout(function () {
                    var distance=e.originalEvent.targetTouches[0].clientY-start;
                    var count=Math.round(Math.abs(distance)/16);
                    var index;
                    if(distance>0){
                        index=startIndex+count;
                        if(index>23){
                            index=23;
                        }
                    }else{
                        index=startIndex-count;
                        if(index<0){
                            index=0;
                        }
                    }
                    scope.currLetter=scope.letterList[index];
                    scope.$apply();
                    if(capitalList.indexOf(scope.currLetter)>-1){
                        $location.hash(scope.currLetter);
                        $ionicScrollDelegate.anchorScroll(false);
                    }
                },500);
            });
            $alphabet.on("touchend",function () {
                $icu.clearTimeOut(timeout);
                timeout=null;
                $(this).css({
                    "background-color":"transparent",
                    "color":"#000"
                });
                scope.letterShow=false;
                scope.$apply();
            });
        }
    }
});