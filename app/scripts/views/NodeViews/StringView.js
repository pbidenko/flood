/**
 * Created by Masha on 12/8/2014.
 */
define(['backbone', 'underscore', 'jquery', 'BaseNodeView'],
    function(Backbone, _, $, BaseNodeView) {

        function extraChanged () {
            var ex = this.model.get('extra');

            this.syncUI(ex.value);
            this.model.trigger('update-node');
            this.model.trigger('requestRun');
        }

        function focusInput (e) {
            this.selectable = false;
            this.model.set('selected', false);
            e.stopPropagation();
        }

        function blurInput () {
            this.selectable = true;

            var ex = this.model.get('extra');
            var text = this.$el.find('.string-node-input').val();

            if (ex.value === text)
                return;

            var newValue = {
                value: text
            };

            var cmd = { property: 'extra',
                _id: this.model.get('_id'),
                newValue: newValue
            };

            this.model.trigger('request-set-node-prop', cmd);
            this.model.trigger('updateRunner');
        }

        function fitSize (e) {
            var srcEl = e ? e.originalEvent.srcElement :
                this.$el.find('.string-node-input')[0];

            if (!srcEl)
                return;

            // fit the size to the content
            $(srcEl).height(0);
            $(srcEl).height(srcEl.scrollHeight);

            e && e.stopPropagation();
        }

        return BaseNodeView.extend({

            template: _.template( $('#node-string-template').html() ),

            initialize: function(args) {
                BaseNodeView.prototype.initialize.apply(this, arguments);

                this.listenTo(this.model, 'change:extra', extraChanged);
                this.$el.on('focus', '.string-node-input', focusInput.bind(this));
                this.$el.on('blur', '.string-node-input', blurInput.bind(this));
                this.$el.on('keyup', '.string-node-input', fitSize);
            },

            render : function () {
                BaseNodeView.prototype.render.apply(this, arguments);
                fitSize.call(this);
                return this;
            },

            syncUI: function(value){
                this.$el.find('.string-node-input').val(value);
            }
        });
    });
