(function (window) {
    function Lyric(path) {
        return new Lyric.prototype.init(path);
    }
    Lyric.prototype = {
        constructor: Lyric,
        init: function (path) {
            this.path = path;
        },
        times: [],
        lyrics: [],
        loadLyric: function (callback) {
            var $this = this;
            $.ajax({
                url: $this.path,
                dataType: "text",
                success: function (data) {
                    $this.parseLyric(data);
                    callback();
                },
                error: function (e) {
                    console.log(e);
                }
            });
        },
        parseLyric: function (data) {
            var $this = this;
            $this.times = [];
            $this.lyrics = [];
            var array = data.split('\n');
            var timeReg = /\[(\d*:\d*\.\d*)\]/
            $.each(array, function (index, ele) {
                var lyc = ele.split('\]')[1];
                if (lyc.length <= 1)
                    return true;
                $this.lyrics.push(lyc);

                var res = timeReg.exec(ele);
                if (res == null)
                    return true;   //相当于continue
                var timeStr = res[1]  //获取括号里面匹配的内容 res[0]为匹配的[00:00.73]
                var res2 = timeStr.split(":");
                var min = parseInt(res2[0]) * 60;
                var sec = parseFloat(res2[1]);
                var time = parseFloat(Number(min + sec).toFixed(2));
                $this.times.push(time);


            });
        },
        currentIndex : function(currentTime){
            var index = -1;
            for(var i = 0; i < this.times.length; i++){
                if(currentTime < this.times[i]){
                    break;
                }else{
                    index = i;
                }
            }
            return index;
        },
    }
    Lyric.prototype.init.prototype = Lyric.prototype;
    window.Lyric = Lyric;
})(window);