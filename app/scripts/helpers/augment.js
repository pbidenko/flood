define(function() {
  Array.prototype.equals = function(arrayToComapre) {
    if (this === arrayToComapre)
      return true;

    if (this == null || arrayToComapre == null)
      return false;

    if (this.length != arrayToComapre.length)
      return false;

    for (var i = 0; i < this.length; ++i) {
      if (this[i] !== arrayToComapre[i])
        return false;
    }

    return true;
  }
});