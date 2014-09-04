efine(['backbone'], function (Backbone) {

    return Backbone.Model.extend({
        
        initialize: function (args, options) {
            this.descendants = options.descendants || {};
            this.elements = options.elements || [];
        }
    });

});