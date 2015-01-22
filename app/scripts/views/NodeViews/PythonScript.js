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
            this.model.trigger('updateRunner');
            this.model.workspace.run();
        },

        openPythonScriptView: function(){
            this.workspace.app.trigger('showPythonEditor', this.model);
        },

        getPortName: function(data){
            return 'IN[' + data + ']';
        },

        getPortDescription: function(data){
            return 'Input #' + data;
        }

    });
 });