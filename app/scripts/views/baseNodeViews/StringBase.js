define(['backbone', 'underscore', 'jquery'],
    function (Backbone, _, $) {

    return {

        extraChanged: function () {
            var ex = this.model.get('extra');

            this.syncUI(ex.value);
            this.model.trigger('updateRunner');
            this.model.workspace.trigger('requestRun');
        },

        blurInput: function () {
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
        },

        syncUI: function (value) {
            this.$el.find('.string-node-input').val(value);
        }

    };

});