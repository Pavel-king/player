(function (window) {
    function Progress($progressBar, $progressLine, $progressDot) {
        return new Progress.prototype.init($progressBar, $progressLine, $progressDot);
    };
    Progress.prototype = {
        constructor: Progress,
        isMove : false,
        init: function ($progressBar, $progressLine, $progressDot) {
            this.$progressBar = $progressBar;
            this.$progressLine = $progressLine;
            this.$progressDot = $progressDot;
        },
        progressClick: function (callBack) {
            var $this = this;
            $this.$progressBar.click(function (e) {
                var normalLeft = $(this).offset().left;
                var mouseX = e.pageX;
                $this.$progressLine.css('width', mouseX - normalLeft);
                $this.$progressDot.css('left', mouseX - normalLeft);

                var rate = (mouseX - normalLeft) / $(this).width();
                callBack(rate);
            });
        },
        progressMove: function (callBack) {
            var $this = this;
            this.$progressBar.mousedown(function () {
                var normalLeft = $(this).offset().left;
                var mouseX;
                var barWidth = $(this).width();
                //移动
                $(document).mousemove(function (e) {
                    $this.isMove = true;
                    mouseX = e.pageX;
                    if (mouseX < normalLeft) {
                        mouseX = normalLeft;
                    }
                    else if (mouseX > barWidth + normalLeft) {
                        mouseX = barWidth + normalLeft;
                    }
                    $this.$progressLine.css('width', mouseX - normalLeft);
                    $this.$progressDot.css('left', mouseX - normalLeft);  
                });
                //抬起
                $(document).mouseup(function () {
                    $(document).off('mousemove');
                    $(document).off('mouseup');
                    $this.isMove = false;
                    var rate = (mouseX - normalLeft) / $this.$progressBar.width();
                    callBack(rate);
                });
            });
        },
        setProgressBar : function(rate){
            if(this.isMove) return;
            if(rate < 0 || rate > 100)
                return ;
            this.$progressLine.css('width', rate + '%');
            this.$progressDot.css('left', rate + '%');
        },

    };
    Progress.prototype.init.prototype = Progress.prototype;
    window.Progress = Progress;
})(window)