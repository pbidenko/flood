define(['backbone', 'underscore', 'jquery', 'NumNodeView'],
    function (Backbone, _, $, NumNodeView) {

    return NumNodeView.extend({
        render: function () {
            NumNodeView.prototype.render.apply(this, arguments);

            var intVal = parseInt(this.slider.slider("option", "step"));
            this.slider.slider("option", "step", intVal);
        },

        valChanged: function () {
            var intVal = parseInt(this.currentValueInput.val());
            if (isNaN(intVal)){
                return;
            }
            this.currentValueInput.val(intVal);
            return this.setSliderValue(intVal);
        },

        stepChanged: function (e) {
            var intVal = parseInt(this.stepInput.val());
            if (isNaN(intVal)) {
                return;
            }
            this.stepInput.val(intVal);
            this.slider.slider("option", "step", intVal);
            this.inputSet();
        }
    });
});