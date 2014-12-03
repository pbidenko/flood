define(['Node'], function(Node){

    return Node.extend({

        initialize: function (attrs, vals) {
            Node.prototype.initialize.call(this, attrs, vals);
            this.set('replication', 'applyDisabled');
        },

        updateValue: function(){
         //Doesn't need to do anything for 'Number' type node
        }
    });

});