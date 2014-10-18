(function () {

    var settings = {
        storageUrl: '',
        socketUrl: 'ws://127.0.0.1:2100'
    };

    if (typeof exports === 'object') { // Node.js
        module.exports = settings;
    } else if (typeof define === 'function' && define.amd) { // Require.JS
        define(settings);
    }

})();