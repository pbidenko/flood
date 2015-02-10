define(['backbone', 'underscore', 'jquery', 'BaseNodeView'], function (Backbone, _, $, BaseNodeView) {

    return BaseNodeView.extend({

        template: _.template( $('#node-watch-template').html() ),

        initialize: function(args) {
            BaseNodeView.prototype.initialize.apply(this, arguments);

            this.$el.on('blur', 'input.shown-items', this.renderNode.bind(this));
        },

        renderNode: function(){

            var arrayItems = this.model.get('arrayItems') || [];
            for(var i = 0; i < arrayItems.length; i++){
              try{
                var val = JSON.parse(arrayItems[i]);
                arrayItems[i] = val;
              }catch(e){}
            }
            if(this.itemsToShow <= arrayItems.length)
                arrayItems = arrayItems.slice(0, this.itemsToShow);

            var prettyValue = arrayItems.length ? this.format(arrayItems) : this.model.get('lastValue');
            this.model.set('prettyValue', prettyValue);

            var json = this.model.toJSON();
            this.$el.html(this.template(json));

            return BaseNodeView.prototype.renderNode.apply(this, arguments);

        },

        format: function (data) {

            if (typeof data === 'number') {
                return data.toPrecision(4);
            }

            if (typeof data === 'string') {
                return data.replace(new RegExp('\t', 'g'), '').replace(new RegExp('\n', 'g'), '<br>');
            }

            if ($.isArray(data)) {
                var text = this.parseArray(data, 2);
                if (this.maxItemsNumber > this.itemsToShow) {
                    text += '...';
                }
                return text;
            }

            return data;
        },

        parseArray: function (array, index) {
            var tab = Array(index).join('&#09;');
            var result = array.length ? 'List: <br>' : 'Nothing';

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
