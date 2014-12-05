/**
 * Created by Masha on 10/30/2014.
 */
define(['backbone'], function (Backbone) {
        var dyn = '.dyn',
            dyf = '.dyf';

        return Backbone.View.extend({

            pathsToSave: [],

            el: '#save-upload',

            events: {
                'change #savefile': 'pickUpFilePath',
                'click #savefile': 'setAcceptAttribute',
                'click #save-file-button': 'saveClick',
                'change #openfile': 'loadSelectedFile',
                'click #new-file-button': 'newButtonClick'
            },

            initialize: function () {
                this.configViewElements();
                this.listenTo(this.model, 'no-path-to-save', this.performSaveAsClick);
            },

            performSaveAsClick: function () {
                this.$el.find('#savefile').trigger('click');
            },

            saveClick: function () {
                this.model.trySaveFile();
            },

            newButtonClick: function () {
                this.model.trigger('clear-home-request');
            },

            setAcceptAttribute: function () {
                var guid = this.model.getCurrentWorkspaceGuid();
                var path = this.model.getPathByGuid(guid);
                if (!path)
                    path = this.app.getCurrentWorkspace().get('name');

                if (!guid)
                    this.$el.find('#savefile').attr('accept', dyn);
                else
                    this.$el.find('#savefile').attr('accept', dyf);

                this.$el.find('#savefile').attr('nwsaveas', path);
            },

            configViewElements: function () {
                this.$el.removeClass('no-save-button');
                this.$el.find('#savefile').show();
                this.$el.find('#saveas-file-button div').addClass('over-hidden-file-input');
            },

            pickUpFilePath: function(e) {
                var files = e.target.files;
                if (files && files.length == 1) {
                    if (files[0].path) {
                        this.model.saveAtPath(files[0].path);
                    }

                    e.target.value = null;
                }
            },

            loadSelectedFile: function (e) {
                var files = e.target.files;
                if (files && files.length == 1) {
                    if (files[0].path) {
                        this.model.loadFromPath(files[0].path);
                    }

                    e.target.value = null;
                }
            }
        });
    });