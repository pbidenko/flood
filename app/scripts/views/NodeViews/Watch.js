define(['backbone', 'underscore', 'jquery', 'BaseNodeView'], function (Backbone, _, $, BaseNodeView) {

    return BaseNodeView.extend({

        template: _.template($('#node-watch-template').html()),

        initialize: function (args) {

            BaseNodeView.prototype.initialize.apply(this, arguments);
            this.model.on('change:lastValue', this.renderNode, this);
            this.model.on('disconnection', this.renderNode, this);

        },

        renderNode: function () {

            var pretty = this.model.get('lastValue') != undefined ? this.prettyPrint(this.model.get('lastValue')) : this.model.get('lastValue');

            this.model.set('prettyValue', pretty);

            var json = this.model.toJSON();

            this.$el.html(this.template(json));

            return this;

        },

        prettyPrint: function (data) {
            var val = JSON.parse(data);

            if (typeof val === 'number') {
                return val.toPrecision(4);
            }

            if (typeof val === 'string') {
                return val.replace(new RegExp('\t', 'g'), '').replace(new RegExp('\n', 'g'), '<br>');
            }

            if ($.isArray(val)) {
                return this.parseArray(val, 2);
            }

            return val;
        },

        parseArray: function (array, index) {
            var tab = Array(index).join('&#09;');
            var result = array.length ? 'List: <br>' : 'Empty List';

            for (var i = 0; i < array.length; i++) {
                result += tab + '[' + i + '] ';

                if ($.isArray(array[i])) {
                    result += this.parseArray(array[i], index + 1);
                }
                else {
                    result += array[i] + '<br>';
                }
            }

            return result;
        }

    });

});
