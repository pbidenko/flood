define(['Prism'], function () {
    Array.prototype.equals = function(arrayToComapre) {
        if (this === arrayToComapre)
            return true;

        if (!arrayToComapre)
            return false;

        if (this.length != arrayToComapre.length)
            return false;

        for (var i = 0; i < this.length; ++i) {
            if (this[i] !== arrayToComapre[i])
                return false;
        }

        return true;
    };

    Prism.languages.designScript = {

        'string': /("|')(\\?.)*?\1/g,

        'comment': [
          {
              pattern: /(^|[^\\])\/\*[\w\W]*?\*\//g,
              lookbehind: true
          },
          {
              pattern: /(^|[^\\:])\/\/.*?(\r?\n|$)/g,
              lookbehind: true
          }
        ],

        'keyword': /\b(local|static|this|class|extends|throw|catch|try|def|function|constructor|import|from|for|in|while|break|continue|return|public|private|protected|int|double|string|bool|var|char|void|true|false|null|Associative|Imperative|Options|elseif|else|if)\b/g,

        'number': /\b-?(0x[\dA-Fa-f]+|\d*\.?\d+([Ee]-?\d+)?)\b/g
    };
});