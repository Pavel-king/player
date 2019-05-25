jQuery.event.special.touchstart = {
    setup: function (_, ns, handle) {
        if (ns.includes("noPreventDefault")) {
            this.addEventListener("touchstart", handle, { passive: false });
        } else {
            this.addEventListener("touchstart", handle, { passive: true });
        }
    }
};
$(function () {
    //自定义滚动条
    $(".content_list").mCustomScrollbar();

    //创建对象
    var $audio = $('audio');
    var player = new Player($audio);
    var progress;
    var voiceProgress;
    var lyric;


    //从source文件夹加载歌曲
    getPlayerList();
    function getPlayerList() {
        $.ajax({
            url: "./source/musiclist.json",
            dataType: "json",
            success: function (data) {
                player.musicList = data;
                var $ul = $(".content_list ul");
                $.each(data, function (index, value) {
                    var $item = createMusicItem(index, value);
                    $ul.append($item);
                });
                initMusicInfo(data[0]);
                initMusicLyric(data[0]);
            },
            error: function (e) {
                console.log(e);
            },
        });
    };
    //初始化进度条
    intiProgress();
    function intiProgress() {
        var $progressBar = $('.music_progress_bar');
        var $progressLine = $('.music_progress_line');
        var $progressDot = $('.music_progress_dot');
        progress = new Progress($progressBar, $progressLine, $progressDot);
        //监听progress点击
        progress.progressClick(function (rate) {
            player.musicSeekTo(rate);
        });
        progress.progressMove(function (rate) {
            player.musicSeekTo(rate);
        });


        var $voiceBar = $('.music_voice_bar');
        var $voiceLine = $('.music_voice_line');
        var $voiceDot = $('.music_voice_dot');
        voiceProgress = new Progress($voiceBar, $voiceLine, $voiceDot);
        //监听progress点击
        voiceProgress.progressClick(function (rate) {
            player.musicVoiceSeekTo(rate);
        });
        voiceProgress.progressMove(function (rate) {
            player.musicVoiceSeekTo(rate);
        });
    }

    //初始化歌曲信息
    function initMusicInfo(music) {
        var $MusicImg = $('.song_info .song_info_pic img');
        var $musicName = $('.song_info_name a');
        var $musicSinger = $('.song_info_singer a');
        var $musicAblum = $('.song_info_ablum a');
        var $musicProgressName = $('.music_progress_name');
        var $musicProgressTime = $('.music_progress_time');
        var $musicbg = $('.mask_bg');

        $MusicImg.attr('src', music.cover);
        $musicName.text(music.name);
        $musicSinger.text(music.singer);
        $musicAblum.text(music.album);
        $musicProgressName.text(music.name + " / " + music.singer);
        $musicProgressTime.text("00:00 / " + music.time);
        $musicbg.css('background', "url('" + music.cover + "') 0 0 no-repeat");
    };
    //初始化歌曲信息
    function initMusicLyric(music) {
        lyric = new Lyric(music.link_lrc);
        var $lyricContainer = $('.song_lyric');
        $lyricContainer.html('');
        lyric.loadLyric(function () {
            $.each(lyric.lyrics, function (index, value) {
                var $item = $('<li>' + value + '</li>')
                $lyricContainer.append($item);
            });
        });
    }
    //事件监听
    initEvents();
    function initEvents() {
        //歌曲的hover
        $('.content_list').delegate(".list_music", "mouseenter", function () {
            $(".list_menu", this).stop().fadeIn(100);
            $(".list_time a", this).stop().fadeIn(100);
            $(".list_time span", this).stop().fadeOut(0);
        });
        $('.content_list').delegate(".list_music", "mouseleave", function () {
            $(".list_menu", this).stop().fadeOut(100);
            $(".list_time a", this).stop().fadeOut(0);
            $(".list_time span", this).stop().fadeIn(100);
        });
        //歌曲前面的勾勾选中
        $('.content_list').delegate(".list_check", 'click', function () {
            $(this).toggleClass("list_checked");
        });
        //子菜单播放按钮的监听与播放按钮的同步
        var $musicPlay = $('.music_play');
        $('.content_list').delegate(".list_menu a:nth-child(1)", 'click', function () {
            var $item = $(this).parents(".list_music");
            $(this).toggleClass("list_menu_play");
            $item.siblings().find(".list_menu a:nth-child(1)").removeClass("list_menu_play");
            $item.siblings().find('div').css("color", "");
            $item.find('div').css("color", "");
            if ($(this).attr('class').indexOf('list_menu_play') >= 0) {
                $musicPlay.addClass('music_play2');
                $item.find('div').css("color", "rgba(255, 255, 255, 1)");
            } else {
                $musicPlay.removeClass('music_play2');
            }
            //切换序号状态
            $item.find(".list_number").toggleClass("list_number2");
            $item.siblings().find(".list_number").removeClass("list_number2");

            //播放音乐
            player.playMusic($item.get(0).index, $item.get(0).music);
            initMusicInfo($item.get(0).music);
            initMusicLyric($item.get(0).music);
        });

        //底部按钮监听
        $('.music_play').click(function () {
            if (player.currentIndex == -1) {
                $('.list_music').eq(0).find(".list_menu a:nth-child(1)").trigger('click');
            } else {
                $('.list_music').eq(player.currentIndex).find(".list_menu a:nth-child(1)").trigger('click');
            }
        });
        $('.music_pre').click(function () {
            $('.list_music').eq(player.preIndex()).find(".list_menu a:nth-child(1)").trigger('click');
        });
        $('.music_next').click(function () {
            $('.list_music').eq(player.nextIndex()).find(".list_menu a:nth-child(1)").trigger('click');
        });

        //删除按钮的监听
        $(".content_list").delegate(".list_menu_del", "click", function () {
            var $item = $(this).parents('.list_music');
            if ($item.get(0).index == player.currentIndex) {
                $('.music_next').trigger('click');
            }
            player.changeMusicList($item.get(0).index);
            $item.remove();

            $('.list_music').each(function (index, value) {
                value.index = index;
                $(value).find('.list_number').text((index + 1));
            });
        });
        //播放的时间事件同步
        player.musicTimeUpdate(function (currentTime, duration, time) {
            $('.music_progress_time').text(time);
            var rate = currentTime / duration * 100;
            progress.setProgressBar(rate);
            //播放结束
            if(!Number.isNaN(currentTime) && !Number.isNaN(duration)){
                if(Math.abs(currentTime - duration) < 0.5 && !player.isPaused()){
                    console.log('some');
                    $('.music_play').trigger('click');
                    player.musicSeekTo(0);
                    $(".song_lyric").css('marginTop', 0);
                }
            }

            //歌词同步
            var index = lyric.currentIndex(currentTime);
            if (index < 0)
                return;
            var $item = $('.song_lyric li').eq(index);
            $item.addClass('cur');
            $item.siblings().removeClass('cur');
            if (index <= 2)
                return;
            $(".song_lyric").css('marginTop', (-index + 2) * 30);


        });
        //声音按钮监听
        $('.music_voice_icon').click(function () {
            $(this).toggleClass('music_voice_icon2');
            if ($(this).attr('class').indexOf('music_voice_icon2') != -1) {
                player.musicVoiceSeekTo(0);
            } else {
                player.musicVoiceSeekTo(1);
            }
        });
    }



    function createMusicItem(index, music) {
        var item = $('<li class="list_music">\
        <div class="list_check"><i></i></div>\
        <div class="list_number">'+ (index + 1) + '</div>\
        <div class="list_name">'+ music.name + '\
            <div class="list_menu">\
                <a href="javascript:;" title="播放"></a>\
                <a href="javascript:;" title="添加"></a>\
                <a href="javascript:;" title="下载"></a>\
                <a href="javascript:;" title="分享"></a>\
            </div>\
        </div>\
        <div class="list_singer">'+ music.singer + '</div>\
        <div class="list_time">\
            <span>'+ music.time + '</span>\
            <a href="javascript:;" title="删除" class="list_menu_del"></a>\
        </div>\
    </li>');
        item.get(0).index = index;
        item.get(0).music = music;
        return item;
    };


});