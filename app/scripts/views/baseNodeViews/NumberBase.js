define(['backbone', 'underscore', 'jquery'],
    function (Backbone, _, $) {

    return {

        extraChanged: function () {
            var ex = this.model.get('extra');

            this.silentSyncUI(ex);

            this.model.trigger('updateRunner');
            this.model.workspace.trigger('requestRun');
        },

        currentValue: function () {
            return this.slider.slider("option", "value");
        },

        setSliderValue: function (val) {
            return this.slider.slider("option", "value", val);
        },

        valChanged: function () {
            var val = parseFloat(this.currentValueInput.val());
            if (isNaN(val)) return;
            return this.setSliderValue(val);
        },

        minChanged: function (e) {
            var val = parseFloat(this.minInput.val());
            if (isNaN(val)) return;
            if (this.currentValue < val) this.setSliderValue(val);
            this.slider.slider("option", "min", val);
        },

        maxChanged: function (e) {
            var val = parseFloat(this.maxInput.val());
            if (isNaN(val)) return;
            if (this.currentValue > val) this.setSliderValue(val);
            this.slider.slider("option", "max", val);
        },

        stepChanged: function (e) {
            var val = parseFloat(this.stepInput.val());
            if (isNaN(val)) return;
            this.slider.slider("option", "step", val);
        },

        inputChanged: function (e, ui) {
            var val = ui.value;
            this.$el.find('.currentValue').html(val);
        },

        baseRender: function () {

            // make the slider
            this.slider = this.$el.find('.slider');
            if (!this.slider) return;

            var extra = this.model.get('extra');
            var min = extra.min != undefined ? extra.min : -150;
            var max = extra.max != undefined ? extra.max : 150;
            var step = extra.step != undefined ? extra.step : 0.1;
            var value = extra.value != undefined ? extra.value : 0;
            if (value === undefined) value = this.model.get('lastValue');

            this.slider.slider({
                min: min,
                max: max,
                step: step,
                value: value,
                change: function (e, ui) { this.inputSet(e, ui); }.bind(this),
                slide: function (e, ui) { this.inputChanged(e, ui); }.bind(this)
            });

            this.currentValueInput = this.$el.find('.currentValue');
            this.currentValueInput.val(value);
            this.currentValueInput.change(function (e) { this.valChanged(e); e.stopPropagation(); }.bind(this));

            this.minInput = this.$el.find('.num-min');
            this.minInput.val(min);
            this.minInput.change(function (e) { this.minChanged(e); e.stopPropagation(); }.bind(this));

            this.maxInput = this.$el.find('.num-max');
            this.maxInput.val(max);
            this.maxInput.change(function (e) { this.maxChanged(e); e.stopPropagation(); }.bind(this));

            this.stepInput = this.$el.find('.num-step');
            this.stepInput.val(step);
            this.stepInput.change(function (e) { this.stepChanged(e); e.stopPropagation(); }.bind(this));

            // adjust settings dropdown so that it stays open while editing
            // doesn't select the node when you're editing
            $('.dropdown.keep-open').on({
                "shown.bs.dropdown": function () {
                    that.selectable = false;
                    that.model.set('selected', false);
                    $(this).data('closable', false);
                },
                "mouseleave": function () {
                    $(this).data('closable', true);
                },
                "click": function () {
                    $(this).data('closable', false);
                },
                "hide.bs.dropdown": function () {
                    if ($(this).data('closable')) that.selectable = true;
                    return $(this).data('closable');
                }
            });

            return this;
        }
    };

});