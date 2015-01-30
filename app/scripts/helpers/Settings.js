(function () {

	function getCurrentUrl(){
		if (typeof document != "object") return "127.0.0.1";
	  var domain = document.URL.match(/:\/\/(.[^/:]+)/)[1];
      return domain;
	}

    var settings = {
        storageUrl: '',
        socketUrl: 'ws://' + getCurrentUrl() +':2100'
    };

    if (typeof exports === 'object') { // Node.js
        module.exports = settings;
    } else if (typeof define === 'function' && define.amd) { // Require.JS
        define(settings);
    }

})();