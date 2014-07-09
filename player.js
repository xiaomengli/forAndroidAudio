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
    var MAX_TIME = 10000;
    var timer = 0;

    function getAudioDom() {
        audioDom = document.documentElement.getElementsByTagName('audio')[0];
        if (!audioDom && (timer < MAX_TIME)) {
            setTimeout(function() {
                getAudioDom();
                timer += 50;
            }, 50);
        }
        if (audioDom) {
            NativeCallback.sendToNative('onready', {
                duration: audioDom.duration,
                src: audioDom.src
            });
        }
        return audioDom;
    }

    getAudioDom();

    // 播放相关方法，暴露给 native
    wandoujia.audio = {
        audioDom: audioDom,
        hasAudio: function() {
            return !!audioDom;
        },
        play: function() {
            audioDom.play();
        },
        pause: function() {
            audioDom.pause();
        },
        stop: function() {
            audioDom.pause();
            audioDom.currentTime = 0;
        },
        progress: function(time) {
            if (arguments.length) {
                audioDom.currentTime = Number(time);
            } else {
                NativeCallback.sendToNative('progress', {
                    progress: audioDom.currentTime
                });
            }
        },
        duration: function() {
            NativeCallback.sendToNative('duration', {
                duration: audioDom.duration
            });
        }
    };

    // 需要的回调
    audioDom.addEventListener('play', function() {
        NativeCallback.sendToNative('onplay', '');
    });

    audioDom.addEventListener('ended', function() {
        NativeCallback.sendToNative('onended', '');
    });
    
    audioDom.addEventListener('pause', function() {
        NativeCallback.sendToNative('onpause', '');
    });

    audioDom.addEventListener('error', function(data) {
        NativeCallback.sendToNative('onerror', JSON.stringify(data));
    });

}(window);
