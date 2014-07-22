// 闭包，避免影响外层代码
void function(window){

    // 声明 webview 方法作用域
    window.wandoujia = window.wandoujia || {};
    // 向 Native 发送数据的接口 Object
    var NativeCallback = window.NativeCallback || {};
    // 该处 native 创建的方法必须直接调用，不能赋值给一个变量
    NativeCallback.sendToNative = NativeCallback.sendToNative || function() {};
    // 全局的 audio dom 对象
    var audioDom;
    // 尝试 audioDom 是否创建成功
    var MAX_TIME = 50000;
    // onready 的计时器
    var timer = 0;
    // Native 控制的播放状态，默认是关闭
    var nativePaused = true;

    function getAudioDom() {
        audioDom = document.documentElement.getElementsByTagName('audio')[0];
        if (!audioDom && (timer < MAX_TIME)) {
            setTimeout(function() {
                getAudioDom();
                timer += 50;
            }, 50);
        }
        if (audioDom) {
            NativeCallback.sendToNative('onready', '');
            simulatedClick();
            // audioDom.preload = 'auto';
            loopPlayStatus();
            bindEvent();
        }
    }

    function loopPlayStatus() {
        setInterval(function() {
            if (nativePaused) {
                audioDom.pause();
            }
        }, 50);
    }

    // 模拟用户点击
    function simulatedClick() {
        if (!audioDom.src) {
            var mayBeEle = document.querySelector('a');
            var customEvent = document.createEvent("MouseEvents"); 
            customEvent.initEvent("click", false, false);
            mayBeEle.dispatchEvent(customEvent);
        }
    }

    getAudioDom();

    // 播放相关方法，暴露给 native
    wandoujia.audio = {
        audioDom: audioDom,
        hasAudio: function() {
            return !!audioDom;
        },
        play: function() {
            nativePaused = false;
            audioDom.play();
        },
        pause: function() {
            nativePaused = true;
            audioDom.pause();
        },
        stop: function() {
            nativePaused = true;
            audioDom.pause();
            audioDom.currentTime = 0;
        },
        progress: function(time) {
            if (arguments.length) {
                audioDom.currentTime = Number(time);
            } else {
                NativeCallback.sendToNative('progress', JSON.stringify({
                    progress: audioDom.currentTime
                }));
            }
        },
        duration: function() {
            if (audioDom.duration) {
                NativeCallback.sendToNative('duration', JSON.stringify({
                    duration: audioDom.duration
                }));
            } else {
                setTimeout(function() {
                    wandoujia.audio.duration();
                }, 100);
            }
        }
    };

    function bindEvent() {

        // 需要的回调
        audioDom.addEventListener('loadedmetadata', function() {
            wandoujia.audio.duration();
        });

        audioDom.addEventListener('play', function() {
            nativePaused = false;
            NativeCallback.sendToNative('onplay', '');
        });

        audioDom.addEventListener('ended', function() {
            NativeCallback.sendToNative('onended', '');
        });
        
        audioDom.addEventListener('pause', function() {
            nativePaused = true;
            NativeCallback.sendToNative('onpause', '');
        });

        audioDom.addEventListener('error', function(data) {
            NativeCallback.sendToNative('onerror', JSON.stringify(data));
        });
    }

}(window);

// 相关替换
// var str = 'return function() {this.dG();this.co = new Audio;this.fh = ["play", "pause", "ended", "playing", "progress", "loadeddata", "timeupdate", "error", "emptied"];bl.cz(this.fh, qV, this);this.pm = 0;this.jG = 0 }';
// var result = str.match(/(([\w|.]*)\s*?=\s*?new\s*?Audio.*?)[;|,]/, 'g');
// str.replace(result[1], result[1] + ',' + result[2] + '.style.opcity = 0,'+ result[2] +'.autoplay = false,'+ result[2] +'.preload="none",document.body.appendChild(' + result[2] +')');
