void function() {
    window.wandoujia = window.wandoujia || {};
    window.wandoujia.audio = window.wandoujia.audio || {};
    var cover = document.querySelector('#player-cover');
    var audio = document.querySelector('#player-audio');

    function extend(source, extendObj) {
        if (!source) {
            source = {};
        }
        for (var k in extendObj) {
            source[k] = extendObj[k];
        }
    }

    extend(window.wandoujia.audio, {
        playerInit: function(opts) {
            audio.src = opts.audioSrc;
            cover.src = opts.imageSrc;
        }
    });
}();