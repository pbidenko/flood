/**
 * Created by Masha on 10/30/2014.
 */
define(['backbone', 'views/BaseSaveUploader', 'SaveFileMessage', 'UploadFileMessage'],
    function (Backbone, BaseSaveUploader, SaveFileMessage, UploadFileMessage) {
        var dyn = '.dyn',
            dyf = '.dyf';

        function endsWith (str, suffix) {
            return str.indexOf(suffix, str.length - suffix.length) > -1;
        }

        return BaseSaveUploader.extend({

            pathsToSave: [],

            events: {
                'change #savefile': 'pickUpFilePath',
                'click #savefile': 'setAcceptAttribute',
                'click #save-file-button': 'trySaveFile',
                'change #openfile': 'loadSelectedFile'
            },

            initialize: function (attrs) {
                BaseSaveUploader.prototype.initialize.call(this, attrs);
                this.listenTo( this.appView.model, 'ws-path-received:event', this.receiveWorkspacePathData );
            },

            receiveWorkspacePathData: function (data) {
                this.updatePathByGuid(data.guid, data.path);
            },
            
            setAcceptAttribute: function () {
                var guid = this.getCurrentWorkspaceGuid();
                var path = this.getPathByGuid(guid);
                if (!path)
                    path = this.appView.model.getCurrentWorkspace().get('name');

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
                        var guid = this.getCurrentWorkspaceGuid();
                        this.updatePathByGuid(guid, files[0].path);
                        this.trySaveFile();
                    }

                    e.target.value = null;
                }
            },

            loadSelectedFile: function (e) {
                var files = e.target.files;
                if (files && files.length == 1) {
                    if (files[0].path)
                        this.sendStringMessage(new UploadFileMessage(files[0].path));

                    e.target.value = null;
                }
            },

            trySaveFile: function() {
                var guid = this.getCurrentWorkspaceGuid(),
                    path = this.getPathByGuid(guid);

                // if we have FilePath
                if (path) {
                    // if it's home ws and path doesn't end with .dyn
                    if (!guid && !endsWith(path, dyn)) {
                        path = path + dyn;
                        this.updatePathByGuid(guid, path);
                    }
                    // if it's custom node ws and path doesn't end with .dyf
                    else if (guid && !endsWith(path, dyf)) {
                        path = path + dyf;
                        this.updatePathByGuid(guid, path);
                    }

                    this.synchronizeNodeCoordinates();
                    this.sendStringMessage(new SaveFileMessage(guid, path));
                }
                // ask for FilePath
                else {
                    this.$el.find('#savefile').trigger('click');
                }
            },

            getPathByGuid: function(guid) {
                var index = this.pathsToSave.map(function (pair) {
                    return pair.guid;
                }).indexOf(guid);

                if (index > -1)
                    return this.pathsToSave[index].path;
                return null;
            },

            updatePathByGuid: function (guid, path) {
                // set empty string as key for saving Home path
                if (!guid)
                    guid = '';

                var index = this.pathsToSave.map(function (pair) {
                    return pair.guid;
                }).indexOf(guid);

                if (!path && index == -1)
                    return;

                if (!path && index > -1) {
                    this.pathsToSave.remove(index, index);
                }
                else if (index > -1)
                    this.pathsToSave[index].path = path;
                else
                    this.pathsToSave.push({guid: guid, path: path});

                setTimeout(function () {
                    var fileName, wsName;
                    var workspace = this.getWorkspaceByGuid(guid);
                    if (workspace) {
                        if (path) {
                            fileName = this.getFilename(path);
                            workspace.set('tabName', fileName);
                        }
                        // in case of no path reset tab name
                        // by setting it to workspace name
                        else {
                            wsName = workspace.get('name');
                            workspace.set('tabName', wsName);
                        }
                    }
                }.bind(this), 0);
            },

            getFilename: function (path) {
                if (!path)
                    return null;

                var start = path.lastIndexOf('\\') + 1;
                // get file name and show on the tab
                // if no '\' we'll get whole string
                return path.substring(start);
            }
        });
    });