(function () {

	function getCurrentUrl(){
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