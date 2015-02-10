define(['backbone', 'underscore', 'jquery', 'BaseWidgetView', 'NumberBase', 'jqueryuislider'],
    function (Backbone, _, $, BaseWidgetView, NumberBase) {

    return BaseWidgetView.extend(NumberBase).extend({

        template: _.template($('#widget-number-template').html()),

        initialize: function (args) {

            BaseWidgetView.prototype.initialize.apply(this, arguments);

            this.listenTo(this.model, 'change:extra', this.extraChanged);
        },

        render: function () {

            BaseWidgetView.prototype.render.apply(this, arguments);

            this.baseRender();

            return this;
        },

        inputSet: function () {

            if (this.silent) return;

            var newValue = {
                value: this.slider.slider("option", "value"),
                min: this.slider.slider("option", "min"),
                step: this.slider.slider("option", "step"),
                max: this.slider.slider("option", "max")
            };

            var cmd = { property: 'extra',
                _id: this.model.get('_id'),
                newValue: newValue
            };

            this.model.trigger('request-set-node-prop', cmd);
        },

        silentSyncUI: function (data) {

            this.silent = true;
            this.currentValueInput.val(data.value);
            this.setSliderValue(data.value);
            this.minInput.html(data.min);
            this.maxInput.html(data.max);
            this.stepInput.html(data.step);
            this.silent = false;
        }

    });

});