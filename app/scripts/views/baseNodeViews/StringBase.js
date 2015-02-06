define(['backbone', 'underscore', 'jquery'],
    function (Backbone, _, $) {

    return {

        extraChanged: function () {
            var ex = this.model.get('extra');

            this.syncUI(ex.value);
            this.model.trigger('update-node');
            this.model.trigger('requestRun');
        },

        blurInput: function () {
            this.selectable = true;

            var ex = this.model.get('extra');
            var text = this.$el.find('.string-node-input').val();

            if (ex.value === text)
                return;

            var newValue = {
                value: text
            };

            var cmd = {
                property: 'extra',
                _id: this.model.get('_id'),
                newValue: newValue
            };

            this.model.trigger('request-set-node-prop', cmd);
            this.model.trigger('updateRunner');
        },

        syncUI: function (value) {
            this.$el.find('.string-node-input').val(value);
        }

    };

});