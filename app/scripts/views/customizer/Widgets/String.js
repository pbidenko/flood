define(['backbone', 'BaseWidgetView'], function(Backbone, BaseWidgetView) {

    function extraChanged () {
        var ex = this.model.get('extra');

        this.syncUI(ex.value);
        this.model.trigger('updateRunner');
        this.model.workspace.trigger('requestRun');
    }

    function blurInput () {
        var ex = this.model.get('extra');
        var text = this.$el.find('.string-node-input').val();

        if (ex.value === text)
            return;

        var newValue = {
            value: text
        };

        this.model.workspace.setNodeProperty({
            property: 'extra',
            _id: this.model.get('_id'),
            newValue: newValue
        });

        this.model.workspace.trigger('updateRunner');
    }

    return BaseWidgetView.extend({

        template: _.template( $('#widget-string-template').html() ),

        initialize: function(args) {
            BaseWidgetView.prototype.initialize.apply(this, arguments);

            this.listenTo(this.model, 'change:extra', extraChanged);
            this.$el.on('blur', '.string-node-input', blurInput.bind(this));
        },

        syncUI: function(value){
            this.$el.find('.string-node-input').val(value);
        }
    });
});
