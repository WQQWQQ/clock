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


angular.module('controllers', [])
.controller('IndexCtrl',function($scope,$icu,$ionicPlatform,$alarm){
    $ionicPlatform.ready(function(){

    });
})
.controller('ClockCtrl', function($scope,$icu,$storage,$ionicActionSheet,$rootScope,$data,$ionicPopup) {
    $scope.today=new Date().getSeconds();
    $scope.week=$data.week;
    $icu.timeout(function () {
        $icu.showTab(true);
        $rootScope.hideTabs = '';
    },20);
    if($storage.get("qq-clock-clockArr")){
        $scope.clockList=$storage.get("qq-clock-clockArr");
    }
    $scope.$on('$ionicView.beforeLeave', function(e) {
        $rootScope.hideTabs = 'tabs-item-hide';
        $icu.showTab(false);
    });
    $scope.showActionSheet=function (index,list) {
        var sheet = $ionicActionSheet.show({
            buttons: [
                { text: '编辑' }
            ],
            destructiveText: '删除',
            titleText: '编辑闹钟',
            cancelText: '取消',
            destructiveButtonClicked:function () {
                sheet();
                $icu.popup("确定要删除该闹钟吗","",function () {
                    $scope.clockList.splice(index,1);
                    $storage.set("qq-clock-clockArr",JSON.stringify($scope.clockList));
                });
            },
            buttonClicked: function(i) {
                switch (i){
                    case 0:
                        $icu.go("tab.new-clock",{list:list,index:index});
                        break;
                }
            }
        });
        $icu.timeout(function () {
            sheet();
        },2000);
    };
})
.controller('NewClockCtrl', function($scope,$icu,$convert,$ionicModal,$calculateTime,$storage,$stateParams,$data,$location){
    console.log($location.$$path);
    $scope.goBack=function () {
        $icu.go("tab.clock");
    };
    $scope.clockType=["旋律","震动","旋律和震动"];
    $scope.musicType=["铃声1","铃声2"];
    var interval;
    interval=$icu.interval(function () {
        checkTime();
    },2000);
    $scope.mydate=new Date();
    $scope.mydate.setDate(new Date().getDate()+1);
    $scope.isNight=true;
    if($stateParams.list){
        $scope.title="编辑闹钟";
        $scope.param=$stateParams.list;
    }else{
        $scope.day=1;
        $scope.title="新建闹钟";
        $scope.param={
            clockName:"闹钟" ,
            hour:$convert.convert(new Date().getHours()),
            minute:$convert.convert(new Date().getMinutes()),
            repeat:false,
            week:[],
            type:$scope.clockType[0],
            music:$scope.musicType[0],
            volume:50,
            on:true
        };
    }
    $scope.week=$data.week;
    for(var i=0,len=$scope.param.week.length;i<len;i++){
        $scope.week[$scope.param.week[i]].select=true;
    }
    $scope.addHour=function (num) {
        if($convert.convert(Number(num)+1)==24){
            $scope.param.hour="00";
            $scope.mydate.setHours(0);
        }else{
            $scope.param.hour=$convert.convert(Number(num)+1);
            $scope.mydate.setHours(Number(num)+1);
        }
        checkTime();
    };
    $scope.minusHour=function (num) {
        if($convert.convert(Number(num)-1)==-1 || Number(num)==-1){
            $scope.param.hour="23";
            $scope.mydate.setHours(23);
        }else{
            $scope.param.hour=$convert.convert(Number(num)-1);
            $scope.mydate.setHours(Number(num)-1);
        }
        checkTime();
    };
    $scope.addMinute=function (num) {
        if($convert.convert(Number(num)+1)==60){
            $scope.param.minute="00";
            $scope.mydate.setMinutes(0);
        }else{
            $scope.param.minute=$convert.convert(Number(num)+1);
            $scope.mydate.setMinutes(Number(num)+1);
        }
        checkTime();
    };
    $scope.minusMinute=function (num) {
        if($convert.convert(Number(num)-1)==-1 || Number(num)==-1){
            $scope.param.minute="59";
            $scope.mydate.setMinutes(59);
        }else{
            $scope.param.minute=$convert.convert(Number(num)-1);
            $scope.mydate.setMinutes(Number(num)-1);
        }
        checkTime();
    };
    $scope.timeKeyDown=function ($event,num,type) {
        if(!((($event.keyCode>47 && 58>$event.keyCode  && num.toString().length<2 ) || $event.keyCode==8 || $event.keyCode==46) )){
            $event.preventDefault();
        }else{
            if(type=='hour'){
                if(num>2){
                    if($event.keyCode!=8 && $event.keyCode!=46){
                        $event.preventDefault();
                    }
                }else if(num==2){
                    if($event.keyCode>51){
                        $event.preventDefault();
                    }
                }
            }else {
                if(num>5){
                    if($event.keyCode!=8 && $event.keyCode!=46){
                        $event.preventDefault();
                    }
                }
            }
        }
    };
    $scope.timeKeyUp=function () {
        checkTime();
    };
    $scope.timeBlur=function (num,type) {
        if(!num){
            if(type=='hour'){
                $scope.param.hour=$convert.convert(new Date().getHours());
                $scope.mydate.setHours(Number($scope.param.hour));
            }else{
                $scope.param.minute=$convert.convert(new Date().getMinutes());
                $scope.mydate.setMinutes(Number($scope.param.minute));
            }
            checkTime();
        }
    };
    $scope.weekDayClick=function (day) {
        day.select=!day.select;
        if(day.select){
            $scope.param.week.push(day.id);
        }else {
            $scope.param.week.splice($scope.param.week.indexOf(day.id),1);
        }
        var leftArr=[],rightArr=[],today=new Date().getDay();
        for(var i=0,len=$scope.param.week.length;i<len;i++){
            if($scope.param.week[i]>today){
                leftArr.push($scope.param.week[i]);
            }else if($scope.param.week[i]<today){
                rightArr.push($scope.param.week[i]);
            }
        }
        $scope.param.week=$scope.param.week.indexOf(today)!=-1?$convert.sort(leftArr).concat($convert.sort(rightArr),today):$convert.sort(leftArr).concat($convert.sort(rightArr));
        checkTime();
    };
    $scope.goListModal=function (type) {
        $ionicModal.fromTemplateUrl('templates/list-modal.html', {
            scope: $scope,
            animation: 'slide-in-up'
        }).then(function(modal) {
            $scope.modal = modal;
            $scope.modal.show();
            if(type=="type"){
                $scope.modalTitle="闹钟类型";
                $scope.modalList=$scope.clockType;
            }else{
                $scope.modalTitle="闹钟铃声";
                $scope.modalList=$scope.musicType;
            }
        });
    };
    $scope.closeModal=function () {
        $scope.modal.remove();
    };
    $scope.saveClock=function () {
        if($scope.param.week.length==0){
            $scope.param.week.push($scope.mydate.getDay());
        }
        if($storage.get("qq-clock-clockArr")){
            var clockArr=$storage.get("qq-clock-clockArr");
            if($stateParams.index){
                clockArr[$stateParams.index]=$scope.param;
            }else {
                clockArr.unshift($scope.param);
            }
            $storage.set("qq-clock-clockArr",clockArr);
        }else{
            var arr=[];
            arr.unshift($scope.param);
            $storage.set("qq-clock-clockArr",arr);
        }
        console.log($storage.get("qq-clock-clockArr"));
        $icu.goBack();
    };
    function checkTime() {
        if($scope.param.week.length>0){
            var setDay,today=new Date().getDay();
            if($scope.param.week[0]<today){
                setDay=$scope.param.week[0]+7-today;
            }else if($scope.param.week[0]>today){
                setDay=$scope.param.week[0]-today;
            }else{
                $scope.mydate.setDate(new Date().getDate());
                if($scope.mydate.getTime()-new Date().getTime()<60000){
                    setDay=7;
                }else {
                    setDay=0;
                }
            }
            $scope.mydate.setDate(new Date().getDate()+setDay);
        }else {
            $scope.mydate.setDate(new Date().getDate());
            if($scope.mydate.getTime()-new Date().getTime()<0){
                $scope.mydate.setDate(new Date().getDate()+1);
            }
        }
        var obj=$calculateTime.minus(new Date(), $scope.mydate);
        $scope.day=obj.day;
        $scope.hour=obj.hour;
        $scope.minute=obj.minute;
    }
    $scope.$on("$ionicView.beforeLeave",function () {
        $icu.showTab(true);
        $icu.clearInterval(interval);
    });
})

.controller('WorldCtrl', function($scope,$storage,$icu,$convert,$ionicActionSheet,$rootScope,$data) {
    var interval;
    $icu.timeout(function () {
        $icu.showTab(true);
        $rootScope.hideTabs = '';
    },20);
    if($storage.get("qq-clock-countryArr")){
        $scope.countryList=$storage.get("qq-clock-countryArr");
        getCountryTime();
    }
    interval=$icu.interval(function () {
        getCountryTime();
    },2000);
    $scope.showActionSheet=function (index,list) {
        var sheet = $ionicActionSheet.show({
            destructiveText: '删除',
            titleText: list.name,
            cancelText: '取消',
            destructiveButtonClicked:function () {
                $scope.countryList.splice(index,1);
                $storage.set("qq-clock-countryArr",JSON.stringify($scope.countryList));
                sheet();
            }
        });
        $icu.timeout(function() {
            sheet();
        }, 2000);
    };
    function getCountryTime() {
        for(var i=0,len=$scope.countryList.length;i<len;i++){
            var date=new Date();
            date.setHours(date.getUTCHours()+Number($scope.countryList[i].diff));
            $scope.countryList[i].currTime=$convert.convert(date.getHours())+":"+$convert.convert(date.getMinutes());
            $scope.countryList[i].currDate=$convert.convert(date.getMonth()+1)+"月"+$convert.convert(date.getDate())+"日 "+" 周"+$data.week[date.getDay()].name;
        }
    }
    $scope.$on("$ionicView.beforeLeave",function () {
        $rootScope.hideTabs = 'tabs-item-hide';
        $icu.showTab(false);
        $icu.clearInterval(interval);
    });
})
.controller('NewWorldCtrl', function($scope,$storage,$ionicLoading,$icu,$data) {
    $scope.goBack=function () {
        $icu.go("tab.world");
    };
    $scope.cityList=$data.getCityList($data.getCapitalList());
    $scope.order="letter";
    $scope.letterShow=false;
    $scope.currLetter="";
    $scope.letterList=$data.letter;
    $scope.select=function (list) {
        if($storage.get("qq-clock-countryArr")){
            var countryArr=$storage.get("qq-clock-countryArr");
            var exist=false;
            for(var i=0,len=countryArr.length;i<len;i++){
                if(list.id==countryArr[i].id){
                    exist=true;
                    $ionicLoading.show({
                        template: list.name+"已存在"
                    }).then(function(){
                        $icu.timeout(function () {
                            $ionicLoading.hide();
                        },1500);
                    });
                    break;
                }
            }
            if(!exist){
                countryArr.unshift(list);
                $storage.set("qq-clock-countryArr",countryArr);
                $icu.goBack();
            }
        }else{
            var arr=[];
            arr.unshift(list);
            $storage.set("qq-clock-countryArr",arr);
            $icu.goBack();
        }

    };
   $scope.$on('$ionicView.beforeEnter', function(e) {
       $icu.showTab(false);
   });
   $scope.$on("$ionicView.beforeLeave",function () {
       $icu.showTab(true);
   });
})
.controller('HourglassCtrl', function($scope,$convert,$ionicPlatform,$icu,$alarm) {
    $ionicPlatform.ready(function(){
        var interval;
        $scope.start=function ($event) {
            if($scope.isForbid){
                $event.preventDefault();
            }else{
                $icu.showTab(false);
                $scope.status=1;
                $scope.startTime=$scope.time.hour+":"+$scope.time.minute+":"+$scope.time.second;
                count();
            }
        };
        $scope.timeKeyDown=function ($event,num,type) {
            if(!((($event.keyCode>47 && 58>$event.keyCode  && num.toString().length<2 ) || $event.keyCode==8 || $event.keyCode==46) )){
                $event.preventDefault();
            }else{
                if(type=='hour'){
                    if(num>2){
                        if($event.keyCode!=8 && $event.keyCode!=46){
                            $event.preventDefault();
                        }
                    }else if(num==2){
                        if($event.keyCode>51){
                            $event.preventDefault();
                        }
                    }
                }else {
                    if(num>5){
                        if($event.keyCode!=8 && $event.keyCode!=46){
                            $event.preventDefault();
                        }
                    }
                }
            }
        };
        $scope.timeKeyUp=function () {
            checkIsForbid($scope.time);
        };
        $scope.timeBlur=function (num,type) {
            if(!num){
                $scope.time[type]="00";
            }
            $scope.time[type]=$convert.convert(num);
            checkIsForbid($scope.time);
        };
        $scope.stop=function () {
            $scope.status=2;
            $icu.clearInterval(interval);
        };
        $scope.restart=function () {
            $scope.status=1;
            count();
        };
        $scope.reset=function () {
            $scope.isForbid=true;
            $scope.status=0;
            $scope.time={
                hour:"00",
                minute:"00",
                second:"00"
            };
            $icu.clearInterval(interval);
        };
        $scope.reset();
        $scope.close=function () {
            $scope.isForbid=true;
            $icu.showTab(true);
            $scope.isTime=false;
            $alarm.stopRing();
            $icu.clearInterval(intervals);
        };
        function checkIsForbid(time) {
            $scope.isForbid=time.hour=="00" && time.minute=="00" && time.second=="00";
        }
        function count() {
            var s=Number($scope.time.second);
            var m=Number($scope.time.minute);
            var h=Number($scope.time.hour);
            interval=$icu.interval(function () {
                if(s == 0){
                    if(m>0){
                        s=60;
                        m--;
                    }else{
                        if(h>0){
                            s=60;
                            m=59;
                            h--;
                        }else {
                            $scope.isTime=true;
                            $scope.status=0;
                            $icu.clearInterval(interval);
                            $alarm.initMedia("铃声1");
                            $alarm.ring("1.0");
                            $alarm.vibrate(3000);
                            intervals=$icu.interval(function () {
                                $alarm.ring("1.0");
                                $alarm.vibrate(3000);
                            },3000);
                            $scope.isStart=false;
                            return;
                        }
                    }

                }
                s--;
                $scope.time.hour=$convert.convert(h);
                $scope.time.minute=$convert.convert(m);
                $scope.time.second=$convert.convert(s);
            },1000);
        }
    });

})
.controller('StopwatchCtrl', function($scope,$convert,$icu) {
    var startMS,timeout;
    $scope.reset=function () {
        $icu.scrollTop(true);
        $scope.status=0;
        $scope.timeList=[];
        startMS=0;
        timeout=null;
        $scope.time= {
            hour:"00",
            minute:"00",
            second:"00",
            mSecond:"00"
        };
    };
    $scope.reset();
    $scope.start=function () {
        $scope.status=1;
        count();
    };
    $scope.stop=function () {
        $scope.status=2;
        $icu.clearTimeOut(timeout);
    };
    $scope.count=function () {
        var obj={
            hour:$scope.time.hour,
            minute:$scope.time.minute,
            second:$scope.time.second,
            mSecond:$scope.time.mSecond
        };
        obj.currTime=obj.hour+":"+obj.minute+":"+obj.second+":"+obj.mSecond;
        var curr=Number(obj.hour)*360000+Number(obj.minute)*6000+Number(obj.second)*100+Number(obj.mSecond);
        var len=$scope.timeList.length;
        if(len>0){
            var lastCurr=Number($scope.timeList[0].hour)*360000+Number($scope.timeList[0].minute)*6000+Number($scope.timeList[0].second)*100+Number($scope.timeList[0].mSecond);
            var gap=curr-lastCurr;
            var hour=Math.floor(gap/360000);
            var minute=Math.floor((gap-hour*36000)/6000);
            var second=Math.floor((gap-hour*36000-minute*600)/100);
            var mSecond=gap-hour*360000-minute*6000-second*100;
            obj.gapTime=$convert.convert(hour)+":"+$convert.convert(minute)+":"+$convert.convert(second)+":"+$convert.convert(mSecond);
        }else{
            obj.gapTime=obj.currTime;
        }
        $scope.timeList.unshift(obj);
        $scope.timeList[0].index=$convert.convert($scope.timeList.length);
    };
    function count() {
        startMS++;
        $scope.time.hour=$convert.convert(Math.floor(startMS/360000));
        $scope.time.minute=$convert.convert(Math.floor(startMS/6000));
        $scope.time.second=$convert.convert(Math.floor(startMS/100));
        $scope.time.mSecond=$convert.convert(startMS%100);
        timeout=$icu.timeout(function () {
            count();
        },10);
    }
});

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
angular.module('services', [])
.factory("$data",function () {
    return{
        letter:["A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z"],
        week:[{id:0, name:"日", select:false},{id:1, name:"一", select:false},{id:2, name:"二", select:false},{id:3, name:"三", select:false},{id:4, name:"四", select:false},{id:5, name:"五", select:false},{id:6, name:"六", select:false}],
        country:[{
            id:0,
            name:"北京 / 中国",
            diff:"+8",
            letter:"Beijing"
        },{
            id:1,
            name:"纽约 / 美国",
            diff:"-5",
            letter:"New York"
        },{
            id:2,
            name:"伦敦 / 英国",
            diff:"+0",
            letter:"London"
        },{
            id:3,
            name:"悉尼 / 澳大利亚",
            diff:"+10",
            letter:"Sydney"
        },{
            id:4,
            name:"东京 / 日本",
            diff:"+9",
            letter:"Tokyo"
        },{
            id:5,
            name:"洛杉矶 / 美国",
            diff:"-8",
            letter:"Los Angels"
        },{
            id:6,
            name:"莫斯科 / 俄罗斯",
            diff:"+4",
            letter:"Moscow"
        },{
            id:7,
            name:"里约热内卢 / 巴西",
            diff:"-3",
            letter:"Rio"
        }],
        getCapitalList:function () {
            var arr=[];
            for(var i=0,len=this.country.length;i<len;i++){
                var capital=this.country[i].letter.slice(0,1).toUpperCase();
                if(arr.indexOf(capital)==-1){
                    arr.push(capital);
                }
            }
            return arr.sort();
        },
        getCityList:function () {
           var cList={};
            var countryList=this.country;
            var arr=this.getCapitalList();
            for(var i=0,len=arr.length;i<len;i++){
                for(var a=0,l=countryList.length;a<l;a++){
                    var letter=countryList[a].letter.slice(0,1).toUpperCase();
                    if(letter==arr[i]){
                        if(!cList[letter]){
                            cList[letter]=[];
                        }
                        cList[letter].push(countryList[a]);
                    }
                }
            }
            return cList;
        }
    };
})
.factory("$icu",function ($ionicScrollDelegate,$ionicHistory,$state,$ionicTabsDelegate,$timeout,$interval,$ionicPopup) {
    return{
        go:function (state,param) {
            $state.go(state,param);
        },
        goBack:function () {
            $ionicHistory.goBack();
        },
        timeout:function (fn,delay) {
           return $timeout(function () {
                fn();
            },delay);
        },
        clearTimeOut:function (timeout) {
          $timeout.cancel(timeout);
        },
        interval:function (fn, delay) {
            return $interval(function () {
                fn();
            },delay);
        },
        clearInterval:function (interval) {
            $interval.cancel(interval);
        },
        showTab:function (show) {
            $ionicTabsDelegate.showBar(show);
        },
        scrollTop: function (animate) {
            $ionicScrollDelegate.scrollTop(animate);
        },
        popup:function (tpl, css, success, error) {
            var confirmPopup = $ionicPopup.confirm({
                template: tpl,
                okText:"确定",
                cancelText:"取消",
                okType:"button-dark",
                cssClass:css
            });
            confirmPopup.then(function(res) {
                if(res) {
                    if(success){
                        success();
                    }
                }else{
                    if(error){
                        error();
                    }
                }
            });
        }
    };
})
.factory('$convert', function() {
      return {
        convert: function(num) {
            var nums=typeof num=="number"?num.toString():num;
          return nums.length==1?"0"+nums:nums;
        },
        sort:function (arr) {
            if(arr instanceof Array && arr.length>1){
                var cIndex=Math.floor(arr.length/2);
                var leftArr=[],rightArr=[];
                var cEle=arr.splice(cIndex,1)[0];
                for(var i=0,len=arr.length;i<len;i++){
                    if(arr[i]<=cEle){
                        leftArr.push(arr[i]);
                    }else {
                        rightArr.push(arr[i]);
                    }
                }
                return arguments.callee(leftArr).concat(cEle,arguments.callee(rightArr));
            }else {
                return arr;
            }
        }
      };
})
.factory("$calculateTime",function () {
    return {
        minus:function (currD, setD) {
            var times=setD.getTime()-currD.getTime();
            var totalMinutes=Math.ceil(times/60000);
            var day=Math.floor(totalMinutes/1440);
            var hour=Math.floor((totalMinutes-day*1440)/60);
            var minute=totalMinutes-day*1440-hour*60;
            return {
                day:day,
                hour:hour,
                minute:minute
            };
        }
    };
})
.factory("$storage",function () {
    return {
        s:window.localStorage,
        get:function (key) {
            return JSON.parse(this.s.getItem(key));
        },
        set:function (key, val) {
            if(typeof val=="object"){
                this.s.setItem(key,JSON.stringify(val));
            }else{
                this.s.setItem(key,val);
            }
        },
        remove:function (key) {
            this.s.removeItem(key);
        },
        clear:function () {
            this.s.clear();
        }
    };
})
.factory("$alarm",function($icu){
    var media;
    return{
        initMedia:function(music){
            var musicPath='';
            if(music=="铃声1"){
                musicPath="audio/ring1.mp3";
            }else if(music=="铃声2"){
                musicPath="audio/ring2.mp3";
            }
            media=new Media(this.getPathMedia()+musicPath);
        },
        ring:function(volume){
            media.play();
            media.setVolume(volume);
        },
        stopRing:function(){
            media.stop();
            navigator.vibrate([0]);
            media.release();
        },
        vibrate:function(time){
            navigator.vibrate(time);
        },
        getPathMedia:function(){
            var path = window.location.pathname;
            var phoneGapPath = path.substring(0, path.lastIndexOf('/') + 1);
            return 'file://' + phoneGapPath;
        }
    };
});


