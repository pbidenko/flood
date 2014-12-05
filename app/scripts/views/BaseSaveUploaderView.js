/**
 * Created by Masha on 10/29/2014.
 */
define(['backbone'], function(Backbone) {

    return Backbone.View.extend({

        el: '#save-upload',

        events: {
            'click #saveas-file-button': 'saveFile',
            'change #openfile': 'loadSelectedFile',
            'click #new-file-button': 'clearHomeWorkspace'
        },

        initialize: function (attrs) {
            this.configViewElements();
        },

        configViewElements: function() {
            this.$el.addClass('no-save-button');
            this.$el.find('#savefile').hide();
            this.$el.find('#saveas-file-button div').removeClass('over-hidden-file-input');
        },

        clearHomeWorkspace: function () {
            this.model.clearHomeWorkspace();
        },

        saveFile: function () {
            this.model.saveFile();
        },

        loadSelectedFile: function (e) {
            var files = e.target.files;
            if (files && files.length == 1) {
                this.model.app.socket.send(files[0]);

                e.target.value = null;
            }
        }
    });
});
