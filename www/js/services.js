angular.module('services', [])
.factory("$data",function () {
    return{
        letter:["A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z"],
        week:function(){
            return [{id:0, name:"日", select:false},{id:1, name:"一", select:false},{id:2, name:"二", select:false},{id:3, name:"三", select:false},{id:4, name:"四", select:false},{id:5, name:"五", select:false},{id:6, name:"六", select:false}];
        },
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
        sort:function (arr,reverse) {
            if(reverse){
                return arr.sort(function(a,b){
                    return b-a;
                });
            }else{
                return arr.sort();
            }
        }
      };
})
.factory("$calculateTime",function ($convert) {
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
        },
        sortWeek:function (clock) {
            var leftArr=[],rightArr=[],date=new Date(),today=date.getDay(),flag=false;
            for(var i=0,len=clock.week.length;i<len;i++){
                if(clock.week[i]>today){
                    leftArr.push(clock.week[i]);
                }else if(clock.week[i]<today){
                    rightArr.push(clock.week[i]);
                }
            }
            if(date.getHours()>clock.hour){
                flag=true;
            }else if(date.getHours()==clock.hour){
                if(date.getMinutes()>=clock.minute){
                    flag=true;
                }
            }
            if(clock.week.indexOf(today)!=-1){
                if(flag){
                    clock.week=$convert.sort(leftArr).concat($convert.sort(rightArr),today);
                }else{
                    clock.week=[today].concat($convert.sort(leftArr)).concat($convert.sort(rightArr));
                }
            }else{
                clock.week=$convert.sort(leftArr).concat($convert.sort(rightArr));
            }
        },
        setDate:function(clock,myDate){
            var setDay,today=new Date(),day=today.getDay();
            if(clock.week.length>0){
                if(clock.week[0]<day){
                    setDay=clock.week[0]+7-day;
                }else if(clock.week[0]>day){
                    setDay=clock.week[0]-day;
                }else{
                    var newdate=new Date();
                    newdate.setHours(clock.hour);
                    newdate.setMinutes(clock.minute);
                    newdate.setSeconds(clock.second);
                    if(newdate.getTime()<today.getTime()){
                        setDay=7;
                    }else {
                        setDay=0;
                    }
                }
                myDate.setDate(today.getDate()+setDay);
            }else {
                myDate.setDate(today.getDate());
                if(myDate.getTime()-today.getTime()<0){
                    myDate.setDate(today.getDate()+1);
                }
            }
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


