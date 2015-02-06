define(['backbone', 'BaseWidgetView'], function (Backbone, BaseWidgetView) {

    return BaseWidgetView.extend({

        template: _.template($('#widget-code-block-template').html()),

        initialize: function (args) {

            BaseWidgetView.prototype.initialize.apply(this, arguments);
            this.listenTo(this.model, 'change:extra', this.onChangedExtra);
        },

        onChangedExtra: function () {
            this.render();
            this.model.trigger('update-node');
            this.model.trigger('requestRun');
        },

        render: function () {

            BaseWidgetView.prototype.render.apply(this, arguments);

            this.input = this.$el.find('.widget-code-block-input');

            this.input.blur(function () {

                var ex = JSON.parse(JSON.stringify(this.model.get('extra')));

                if (ex.code === this.input[0].innerText)
                    return;

                ex.code = this.input[0].innerText;

                var cmd = { property: 'extra', _id: this.model.get('_id'), newValue: ex };
                this.model.trigger('request-set-node-prop', cmd);

            }.bind(this));

            Prism.highlightAll();

            return this;
        }

    });

});