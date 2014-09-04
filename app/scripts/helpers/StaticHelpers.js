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
        },

        getArrayFromBase64string: function(base64){
            var byteCharacters = atob(base64);
            var byteNumbers = new Uint8Array(byteCharacters.length);
            for (var i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
            }

            return byteNumbers;
        },

        getByteArray: function (base64){
            return this.getArrayFromBase64string(base64);
        },

        getIntArray: function (base64){
            var buffer = this.getArrayFromBase64string(base64).buffer;
            return Array.apply([], new Int32Array(buffer));
        },

        getFloatArray: function (base64){
            var buffer = this.getArrayFromBase64string(base64).buffer;
            return Array.apply([], new Float32Array(buffer));
        }
    };
});
