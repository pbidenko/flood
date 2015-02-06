define(['backbone', 'underscore', 'jquery', 'BaseWidgetView', 'BooleanBase'],
    function (Backbone, _, $, BaseWidgetView, BooleanBase) {

    return BaseWidgetView.extend(BooleanBase).extend({

        template: _.template($('#widget-boolean-template').html()),

        events: {
            'click .true-flag': 'clickTrue',
            'click .false-flag': 'clickFalse'
        },

        initialize: function (args) {

            BaseWidgetView.prototype.initialize.apply(this, arguments);

            this.listenTo(this.model, 'change:extra', this.extraChanged);
        }

    });

});