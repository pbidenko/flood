/**
 * Created by Masha on 12/8/2014.
 */
define(['backbone', 'underscore', 'jquery', 'BaseNodeView', 'StringBase'],
    function (Backbone, _, $, BaseNodeView, StringBase) {

    return BaseNodeView.extend(StringBase).extend({

        template: _.template($('#node-string-template').html()),

        events: _.extend(BaseNodeView.prototype.events, {
            'focus .string-node-input': 'focusInput',
            'blur .string-node-input': 'blurInput',
            'keyup .string-node-input': 'fitSize'
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

            this.fitSize();
            return this;
        },

        lockChanged: function (e) {
            var ex = JSON.parse(JSON.stringify(this.model.get('extra')));

            ex.lock = this.lockInput.is(':checked');

            this.model.trigger('request-set-node-prop', { property: 'extra', _id: this.model.get('_id'), newValue: ex });
        },

        focusInput: function (e) {
            this.selectable = false;
            this.model.set('selected', false);
            e.stopPropagation();
        },

        fitSize: function (e) {
            var srcEl = e ? e.originalEvent.srcElement :
                this.$el.find('.string-node-input')[0];

            if (!srcEl)
                return;

            // fit the size to the content
            $(srcEl).height(0);
            $(srcEl).height(srcEl.scrollHeight);

            e && e.stopPropagation();
        }
    });
});
