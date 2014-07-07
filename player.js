// 闭包，避免影响外层代码
void function(window){

    // 声明 webview 方法作用域
    window.wandoujia = window.wandoujia || {};
    // 向 Native 发送数据的接口 Object
    var NativeCallback = window.wandoujia.NativeCallback || {};
    // 为了调试方便，在浏览器上面没有这个方法
    var sendToNative = NativeCallback.sendToNative || function() {};
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
            sendToNative('onready');
        }
        return audioDom;
    }

    getAudioDom();

    // 播放相关方法，暴露给 native
    wandoujia.audio = {
        audioDom: audioDom,
        hasVideo: function() {
            return !!audioDom;
        },
        play: function() {
            audioDom.play();
        },
        pause: function() {
            audioDom.pause();
        }
    };

    // 需要的回调
    videoDom.addEventListener('play', function() {
        sendToNative('onplay');
    });

    videoDom.addEventListener('ended', function() {
        sendToNative('onended');
    });
    
    videoDom.addEventListener('pause', function() {
        sendToNative('onpause');
    });
}(window);
