// 闭包，避免影响外层代码
void function(window){
    // 声明 webview 方法作用域
    window.wandoujia = window.wandoujia || {};
    window.wandoujia.audio = window.wandoujia.audio || {};
    // 向 Native 发送数据的接口 Object
    var NativeCallback = window.NativeCallback || {};
    // 该处 native 创建的方法必须直接调用，不能赋值给一个变量
    NativeCallback.sendToNative = NativeCallback.sendToNative || function() {};
    // 全局的 audio dom 对象
    var audioDom;
    // 尝试 audioDom 是否创建成功
    var MAX_TIME = 10000;
    // onready 的计时器
    var timer = 0;
    // 是否通过 native 控制已经播放一次
    var firstPlay = false;
    // 标记是否是用户触发
    var isUserFlag = true;

    function extend(source, extendObj) {
        if (!source) {
            source = {};
        }
        for (var k in extendObj) {
            source[k] = extendObj[k];
        }
    }

    // 播放相关方法，暴露给 native
    extend(window.wandoujia.audio, {
        audioDom: audioDom,
        hasAudio: function() {
            return !!audioDom;
        },
        play: function() {
            if (!firstPlay) {
                firstPlay = true;
            }
            isUserFlag = false;
            audioDom.play();
        },
        pause: function() {
            isUserFlag = false;
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
                NativeCallback.sendToNative('progress', JSON.stringify({
                    progress: audioDom.currentTime
                }));
            }
        },
        duration: function() {
            var length = 50;
            if (audioDom.currentTime) {
                var old = audioDom.currentTime + length;
                audioDom.currentTime += length;
                if (audioDom.duration && old > audioDom.currentTime) {
                    NativeCallback.sendToNative('duration', JSON.stringify({
                        duration: Math.max(audioDom.currentTime, audioDom.duration)
                    }));
                    audioDom.currentTime = 0;
                } else {
                    wandoujia.audio.duration();
                }
            } else {
                setTimeout(function() {
                    wandoujia.audio.duration();
                }, 100); 
            }
        }
    });

    function bindEvent() {

        // 需要的回调
        // audioDom.addEventListener('loadedmetadata', function() {
        //     wandoujia.audio.duration();
        // });

        audioDom.addEventListener('play', function() {
            NativeCallback.sendToNative('onplay', JSON.stringify({
                isUser: isUserFlag
            }));
            isUserFlag = true;
        });

        audioDom.addEventListener('ended', function() {
            NativeCallback.sendToNative('onended', '');
        });
        
        audioDom.addEventListener('pause', function() {
            if (firstPlay) {
                NativeCallback.sendToNative('onpause', JSON.stringify({
                    isUser: isUserFlag
                }));
                isUserFlag = true;
            }
        });

        audioDom.addEventListener('error', function(data) {
            NativeCallback.sendToNative('onerror', JSON.stringify(data));
        });
    }

    function getAudioDom() {
        audioDom = document.documentElement.getElementsByTagName('audio')[0];
        if (!audioDom && timer < MAX_TIME) {
            setTimeout(function() {
                getAudioDom();
                timer += 50;
            }, 50);
        }
        if (!audioDom && timer >= MAX_TIME) {
            NativeCallback.sendToNative('onerror', JSON.stringify({
                error: 'timeout'
            }));
        }
        if (audioDom) {
            NativeCallback.sendToNative('onready', JSON.stringify({
                source: getSource()
            }));
            simulatedClick();
            loopPlayStatus();
            wandoujia.audio.duration();
            bindEvent();
        }
    }

    function loopPlayStatus() {
        if (!firstPlay) {
            audioDom.pause();
            setTimeout(loopPlayStatus, 50);
        }
    }

    // 模拟用户点击
    function simulatedClick() {
        if (!audioDom.src) {
            var mayBeEle = document.querySelector('a');
            var customEvent = document.createEvent('MouseEvents'); 
            customEvent.initEvent('click', false, false);
            mayBeEle.dispatchEvent(customEvent);
            setTimeout(simulatedClick, 50);
        }
    }

    // 获取来源信息
    function getSource() {
        var obj = {
            'kugou.com': 'kugou',
            'duomi.com': 'duomi',
            '163.com': '163',
            'xiami.com': 'xiami',
            'qq.com': 'qq',
            'baidu.com': 'baidu',
            'dongting.com': 'dongting'       
        };
        for (var k in obj) {
            if (location.host.indexOf(k) !== -1) {
                return obj[k];
            }
        }
    }
    getAudioDom();

}(window);

// 相关替换
// var str = 'return function() {this.dG();this.co = new Audio;this.fh = ["play", "pause", "ended", "playing", "progress", "loadeddata", "timeupdate", "error", "emptied"];bl.cz(this.fh, qV, this);this.pm = 0;this.jG = 0 }';
// var result = str.match(/(([\w|.]*)\s*?=\s*?new\s*?Audio.*?)[;|,]/, 'g');
// str.replace(result[1], result[1] + ',' + result[2] + '.style.opcity = 0,'+ result[2] +'.autoplay = false,'+ result[2] +'.preload="none",document.body.appendChild(' + result[2] +')');
