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
            this.model.trigger('update-node');
            this.model.trigger('requestRun');
        }

        return BaseNodeView.extend({

        template: _.template( $('#node-boolean-template').html() ),

        initialize: function(args) {
            BaseNodeView.prototype.initialize.apply(this, arguments);

            this.listenTo(this.model, 'change:extra', extraChanged);
            this.$el.on('click', '.true-flag', clickFunc.bind(this, true));
            this.$el.on('click', '.false-flag', clickFunc.bind(this, false));
        },

        render: function(){
            var ex = this.model.get('extra'),
                lock = ex.lock || false;

            BaseNodeView.prototype.render.apply(this, arguments);

            this.lockInput = this.$el.find('.lock-input');
            this.lockInput.val( lock );
            this.lockInput.change( function(e){ this.lockChanged.call(this, e); e.stopPropagation(); }.bind(this));
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
        },

        lockChanged: function(e){
            var ex = JSON.parse(JSON.stringify(this.model.get('extra')));

            ex.lock = this.lockInput.is(':checked');

            this.model.trigger('request-set-node-prop', { property: 'extra', _id: this.model.get('_id'), newValue: ex });
        }
    });
});
