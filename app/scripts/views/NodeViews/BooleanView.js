/**
 * Created by Masha on 12/1/2014.
 */
define(['backbone', 'underscore', 'jquery', 'BaseNodeView', 'BooleanBase'],
    function (Backbone, _, $, BaseNodeView, BooleanBase) {

    return BaseNodeView.extend(BooleanBase).extend({

        template: _.template($('#node-boolean-template').html()),

        events: _.extend(BaseNodeView.prototype.events, {
            'click .true-flag': 'clickTrue',
            'click .false-flag': 'clickFalse'
        }),

        initialize: function (args) {
            BaseNodeView.prototype.initialize.apply(this, arguments);

            this.listenTo(this.model, 'change:extra', this.extraChanged);
        },

        render: function () {
            var ex = this.model.get('extra'),
                lock = ex.lock || false;

            BaseNodeView.prototype.render.apply(this, arguments);

            this.lockInput = this.$el.find('.lock-input');
            this.lockInput.val(lock);
            this.lockInput.change(function (e) { this.lockChanged.call(this, e); e.stopPropagation(); }.bind(this));
        },

        lockChanged: function (e) {
            var ex = JSON.parse(JSON.stringify(this.model.get('extra')));

            ex.lock = this.lockInput.is(':checked');

            this.model.workspace.setNodeProperty({ property: 'extra', _id: this.model.get('_id'), newValue: ex });
        }
    });
});
