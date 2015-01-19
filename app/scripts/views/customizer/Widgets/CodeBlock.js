define(['backbone', 'GeometryWidgetView'], function (Backbone, GeometryWidgetView) {

    return GeometryWidgetView.extend({

        template: _.template($('#widget-code-block-template').html()),

        initialize: function (args) {

            GeometryWidgetView.prototype.initialize.apply(this, arguments);
            this.model.on('change:extra', this.onChangedExtra, this);
        },

        onChangedExtra: function () {
            this.render();
            this.model.trigger('updateRunner');
            this.model.workspace.run();
        },

        render: function () {

            GeometryWidgetView.prototype.render.apply(this, arguments);

            this.input = this.$el.find('.widget-code-block-input');

            this.input.blur(function () {

                var ex = JSON.parse(JSON.stringify(this.model.get('extra')));

                if (ex.code === this.input[0].innerText)
                    return;

                ex.code = this.input[0].innerText;

                this.model.workspace.setNodeProperty({ property: 'extra', _id: this.model.get('_id'), newValue: ex });

            }.bind(this));

            Prism.highlightAll();

            return this;
        }

    });

});