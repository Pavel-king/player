(function (window) {
    function Player($audio) {
        return new Player.prototype.init($audio);
    };
    Player.prototype = {
        constructor: Player,
        musicList: [],
        init: function ($audio) {
            this.$audio = $audio;
            this.audio = $audio.get(0);
        },
        currentIndex: -1,
        playMusic: function (index, music) {
            if (this.currentIndex == index) {
                if (this.audio.paused) {
                    this.audio.play();
                } else {
                    this.audio.pause();
                }
            } else {
                this.$audio.attr('src', music.link_url);
                this.audio.play();
                this.currentIndex = index;
            }
        },
        //只计算前后位置，不设置播放的歌曲位置。调用playMusic函数会自动设置
        preIndex: function () {
            if (this.currentIndex == -1)
                return 0;
            if(this.currentIndex == 0)
                return this.musicList.length - 1;
            return this.currentIndex - 1;
        },
        nextIndex: function () {
            if (this.currentIndex == -1)
                return 0;
            if (this.currentIndex == this.musicList.length - 1)
                return 0;
            return this.currentIndex + 1;
        },
        changeMusicList: function(index){
            this.musicList.splice(index, 1);
            if(index < this.currentIndex)
                this.currentIndex--;
        },
        musicTimeUpdate : function(callBack){
            var $this = this;
            this.$audio.on('timeupdate', function () {
                // var currentTime = $this.audio.currentTime;
                // var duration = $this.audio.duration;
                var currentTime = this.currentTime;
                var duration = this.duration;
                var time = $this.formatDate(currentTime, duration);
                callBack(currentTime, duration, time);
            });
        },
        formatDate : function(currentTime, duration) {
            var startMin = parseInt(currentTime / 60);
            var startSec = parseInt(currentTime % 60);
            if (startMin < 10)
                startMin = '0' + startMin;
            if (startSec < 10)
                startSec = '0' + startSec;
    
            var endMin = parseInt(duration / 60);
            var endSec = parseInt(duration % 60);
            if (Number.isNaN(endMin) || Number.isNaN(endMin)) {
                endMin = '00';
                endSec = '00';
             } else {
                if (endMin < 10)
                    endMin = '0' + endMin;
                if (endSec < 10)
                    endSec = '0' + endSec;
            }

            return startMin + ':' + startSec + " / " + endMin + ':' + endSec;
        },
        musicSeekTo : function(rate){
            if(Number.isNaN(rate)) return;
            if(rate < 0 || rate > 1) return;
            if(this.currentIndex == -1) return;
            this.audio.currentTime = this.audio.duration * rate;
        },
        musicVoiceSeekTo: function(volume){
            if(Number.isNaN(volume)) return;
            if(volume < 0 || volume > 1) return;
            if(this.currentIndex == -1) return;
            this.audio.volume = volume;
        },
        isPaused : function(){
            return this.audio.paused;
        },
    };
    Player.prototype.init.prototype = Player.prototype;
    window.Player = Player;
})(window)