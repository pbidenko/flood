define(['backbone', 'underscore', 'jquery', 'VariableInputView'], function (Backbone, _, $, VariableInputView) {

    return VariableInputView.extend({

        getPortName: function(data){
            return 'index' + data;
        },

        getPortDescription: function(data){
            return 'Item Index #' + data;
        }

    });
 });