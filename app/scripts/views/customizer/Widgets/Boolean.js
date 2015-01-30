define(['backbone', 'BaseWidgetView'], function(Backbone, BaseWidgetView) {

    var booleanWidget = BaseWidgetView.extend({

        template: _.template($('#widget-boolean-template').html()),

        initialize: function (args) {

            BaseWidgetView.prototype.initialize.apply(this, arguments);

            this.listenTo(this.model, 'change:extra', extraChanged);
            this.$el.on('click', '.true-flag', clickFunc.bind(this, true));
            this.$el.on('click', '.false-flag', clickFunc.bind(this, false));
        },

        onChangedExtra: function () {
            this.render();
            this.model.trigger('update-node');
            this.model.trigger('requestRun');
        },

        valueChanged: function(value) {
            var newValue = {
                value: value
            };

            var cmd = {
                property: 'extra',
                _id: this.model.get('_id'),
                newValue: newValue
            };

            this.model.trigger('request-set-node-prop', cmd);
            this.model.trigger('updateRunner');
        },

        syncUI: function(value){
            if (value) {
                this.$el.find('.true-flag').prop('checked', true);
            }
            else {
                this.$el.find('.false-flag').prop('checked', true);
            }
        }

    });

    function clickFunc (newValue, e) {
        if (!!this.model.get('extra').value === newValue)
            return;

        this.valueChanged.call(this, newValue);
        e.stopPropagation();
    }

    function extraChanged () {
        var ex = this.model.get('extra');
        var value = !!ex.value;

        this.syncUI(value);
        this.model.trigger('update-node');
        this.model.trigger('requestRun');
    }

    return booleanWidget;

});