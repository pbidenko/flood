define(function(){
    return {
        guid: (function() {
            function s4() {
                return Math.floor((1 + Math.random()) * 0x10000)
                    .toString(16)
                    .substring(1);
            }
            return function() {
                return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
                    s4() + '-' + s4() + s4() + s4();
            };
        })(),

        generatePortNames: function(count){
            var names = [],
                a = 'A',
                len = 0,
                i = 0;

            len = a.charCodeAt(0) + count;
            for (i = a.charCodeAt(0); i < len; i++) {
                names.push(String.fromCharCode(i));
            }

            return names;
        }
    };
});
