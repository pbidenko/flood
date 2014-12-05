/**
 * Created by Masha on 12/1/2014.
 */
define(['backbone', 'underscore', 'jquery', 'BaseNodeView'],
    function(Backbone, _, $, BaseNodeView) {

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
            this.model.trigger('updateRunner');
            this.model.workspace.trigger('requestRun');
        }

        return BaseNodeView.extend({

        template: _.template( $('#node-boolean-template').html() ),

        initialize: function(args) {
            BaseNodeView.prototype.initialize.apply(this, arguments);

            this.listenTo(this.model, 'change:extra', extraChanged);
            this.$el.on('click', '.true-flag', clickFunc.bind(this, true));
            this.$el.on('click', '.false-flag', clickFunc.bind(this, false));
        },

        valueChanged: function(value) {
            var newValue = {
                value: value
            };

            this.model.workspace.setNodeProperty({
                property: 'extra',
                _id: this.model.get('_id'),
                newValue: newValue
            });

            this.model.workspace.trigger('updateRunner');
        },

        syncUI: function(value){
            if (value)
                this.$el.find('.true-flag').prop('checked', true);
            else
                this.$el.find('.false-flag').prop('checked', true);
        }
    });
});
