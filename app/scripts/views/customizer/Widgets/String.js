define(['backbone', 'underscore', 'jquery', 'BaseWidgetView', 'StringBase'],
    function (Backbone, _, $, BaseWidgetView, StringBase) {

    return BaseWidgetView.extend(StringBase).extend({

        template: _.template($('#widget-string-template').html()),

        events: {
            'blur .string-node-input': 'blurInput'
        },

        initialize: function (args) {
            BaseWidgetView.prototype.initialize.apply(this, arguments);

            this.listenTo(this.model, 'change:extra', this.extraChanged);
        }
    });
});
