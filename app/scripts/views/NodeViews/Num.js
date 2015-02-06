define(['backbone', 'underscore', 'jquery', 'BaseNodeView', 'NumberBase', 'jqueryuislider'],
    function (Backbone, _, $, BaseNodeView, NumberBase) {

    return BaseNodeView.extend(NumberBase).extend({

        template: _.template($('#node-num-template').html()),

        initialize: function (args) {

            BaseNodeView.prototype.initialize.apply(this, arguments);

            this.listenTo(this.model, 'change:extra', this.extraChanged);
        },

        render: function () {

            BaseNodeView.prototype.render.apply(this, arguments);

            var extra = this.model.get('extra');
            var lock = extra.lock != undefined ? extra.lock : false;

            this.lockInput = this.$el.find('.lock-input');
            this.lockInput.val(lock);
            this.lockInput.change(function (e) { this.lockChanged(e); e.stopPropagation(); }.bind(this));

            this.baseRender();

            return this;
        },

        inputSet: function () {

            if (this.silent) return;

            var newValue = {
                value: this.slider.slider("option", "value"),
                min: this.slider.slider("option", "min"),
                step: this.slider.slider("option", "step"),
                max: this.slider.slider("option", "max"),
                lock: this.lockInput.is(':checked')
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
            this.lockInput.val(data.lock);
            this.silent = false;

        },

        lockChanged: function (e) {
            this.inputSet();
        }

    });

});