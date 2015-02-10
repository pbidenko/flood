define(['backbone', 'underscore', 'jquery', 'VariableInputView', 'PythonEditorView'], function (Backbone, _, $, VariableInputView, PythonEditorView) {

    return VariableInputView.extend({

        events: _.extend(VariableInputView.prototype.events, {
            'dblclick': 'openPythonScriptView',
        }),

        initialize: function (args) {
            VariableInputView.prototype.initialize.apply(this, arguments);
            this.listenTo(this.model, 'change:extra', this.onChangedExtra);
        },

        onChangedExtra: function () {
            this.model.trigger('update-node');
            this.model.trigger('requestRun');
        },

        openPythonScriptView: function(){
            if (!this.pythonView){
                this.pythonView = new PythonEditorView({model: this.model});
            }
            this.pythonView.render();
            this.pythonView.$el.fadeIn();
        },

        getPortName: function(data){
            return 'IN[' + data + ']';
        },

        getPortDescription: function(data){
            return 'Input #' + data;
        }

    });
 });