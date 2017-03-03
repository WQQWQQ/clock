angular.module('controllers', [])
.controller('IndexCtrl',function($scope,$icu,$ionicPlatform,$alarm,$storage,$calculateTime){
    $ionicPlatform.ready(function(){
        if($storage.get("qq-clock-clockArr") && $storage.get("qq-clock-clockArr").length>0){
            $scope.clockList=$storage.get("qq-clock-clockArr");
            $storage.set("qq-clock-clockArr",$scope.clockList);
            $scope.hasCountdown=true;
            $scope.countDown();
        }
    });
    $scope.countDown=function(){
        var latestTime=$scope.getLatestTime($scope.clockList);
        $scope.alarmSecond=Math.round((latestTime-(new Date().getTime())))/1000;
        $scope.alarm_intervals=$icu.interval(function(){
            console.log($scope.alarmSecond);
            $scope.alarmSecond--;
            if($scope.alarmSecond==0){
                console.log(1);
                $icu.clearInterval($scope.alarm_intervals);
                $scope.countDown();
            }
        },1000);
    };
    $scope.getLatestTime=function(clockList){
        var time,now=new Date(),timeArr=[],today=now.getDay();
        for(var i=0,len=clockList.length;i<len;i++){
            if(clockList[i].on){
                $calculateTime.sortWeek(clockList[i]);
                console.log(clockList[i]);
                var tempDate=new Date();
                $calculateTime.setDate(clockList[i],tempDate);
                tempDate.setHours(clockList[i].hour);
                tempDate.setMinutes(clockList[i].minute);
                tempDate.setSeconds(clockList[i].second);
                timeArr.push(tempDate.getTime());
            }
        }
        timeArr=timeArr.sort();
        return timeArr[0];
    };
})
.controller('ClockCtrl', function($scope,$icu,$storage,$ionicActionSheet,$rootScope,$data,$ionicPopup) {
    $scope.week=$data.week();
    $icu.timeout(function () {
        $icu.showTab(true);
        $rootScope.hideTabs = '';
    },20);
    if($storage.get("qq-clock-clockArr") && $storage.get("qq-clock-clockArr").length>0){
        $scope.clockList=$storage.get("qq-clock-clockArr");
        var latestTime=$scope.getLatestTime($scope.clockList);
        $scope.alarmSecond=Math.round((latestTime-(new Date().getTime())))/1000;
        if(!$scope.hasCountdown){
            $scope.countDown();
        }
    }
    $scope.$on('$ionicView.beforeLeave', function(e) {
        $rootScope.hideTabs = 'tabs-item-hide';
        $icu.showTab(false);
    }); 
    $scope.toggleClick=function($event){
        $event.stopPropagation();
        $storage.set("qq-clock-clockArr",JSON.stringify($scope.clockList));
    };
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
                    var latestTime=$scope.getLatestTime($scope.clockList);
                    $scope.alarmSecond=Math.round((latestTime-(new Date().getTime())))/1000;
                    $icu.clearInterval($scope.alarm_intervals);
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
            second:$convert.convert(new Date().getSeconds()),
            repeat:false,
            week:[],
            type:$scope.clockType[0],
            music:$scope.musicType[0],
            volume:50,
            on:true
        };
    }
    $scope.week=$data.week();
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
        $calculateTime.sortWeek($scope.param);
        console.log($scope.param.week);
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
        $icu.goBack();
    };
    function checkTime() {
        $calculateTime.setDate($scope.param,$scope.mydate);
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
            $scope.countryList[i].currDate=$convert.convert(date.getMonth()+1)+"月"+$convert.convert(date.getDate())+"日 "+" 周"+$data.week()[date.getDay()].name;
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
   $scope.$on('$ionicView.beforeEnter', function() {
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
