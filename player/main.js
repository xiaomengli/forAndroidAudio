void function() {
    window.wandoujia = window.wandoujia || {};
    window.wandoujia.audio = window.wandoujia.audio || {};
    var audio = new Audio();

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
            audio.src = opts.src;
            audio.style.opcity = 0;
            document.body.appendChild(audio);
        }
    });
}();