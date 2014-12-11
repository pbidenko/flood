/**
 * Created by Masha on 11/26/2014.
 */
define(['backbone', 'models/BaseSaveUploader', 'SaveFileMessage', 'UploadFileMessage', 'UnsavedWorkspaceChangesHandler'],
    function (Backbone, BaseSaveUploader, SaveFileMessage, UploadFileMessage, UnsavedWorkspaceChangesHandler) {
        var dyn = '.dyn',
            dyf = '.dyf';

        function endsWith (str, suffix) {
            return str.indexOf(suffix, str.length - suffix.length) > -1;
        }

        return BaseSaveUploader.extend({

            pathsToSave: [],

            initialize: function (attrs) {
                BaseSaveUploader.prototype.initialize.call(this, attrs);
                // this init will be done only in NWK
                this.app.unsavedChangesHandler = new UnsavedWorkspaceChangesHandler({
                    app : this.app,
                    saveUploader: this
                });

                this.listenTo(this.app, 'ws-path-received:event', this.receiveWorkspacePathData);
            },

            receiveWorkspacePathData: function (data) {
                this.updatePathByGuid(data.guid, data.path);
            },

            saveAtPath: function (path) {
                var guid = this.getCurrentWorkspaceGuid();
                this.updatePathByGuid(guid, path);
                this.trySaveFile();
            },

            loadFromPath: function (path) {
                this.sendStringMessage(new UploadFileMessage(path));
            },

            trySaveFile: function () {
                var guid = this.getCurrentWorkspaceGuid(),
                    path = this.getPathByGuid(guid);

                // if we have FilePath
                if (path) {
                    // if it's home ws and path doesn't end with .dyn
                    if (!guid && !endsWith(path.toLowerCase(), dyn)) {
                        path = path + dyn;
                        this.updatePathByGuid(guid, path);
                    }
                    // if it's custom node ws and path doesn't end with .dyf
                    else if (guid && !endsWith(path.toLowerCase(), dyf)) {
                        path = path + dyf;
                        this.updatePathByGuid(guid, path);
                    }

                    this.synchronizeNodeCoordinates();
                    this.sendStringMessage(new SaveFileMessage(guid, path));
                    this.trigger('saving-is-done');
                }
                // ask for FilePath
                else {
                    this.trigger('no-path-to-save');
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

                if (!path && index === -1)
                    return;

                if (!path && index > -1) {
                    this.pathsToSave.remove(index, index);
                }
                else if (index > -1)
                    this.pathsToSave[index].path = path;
                else
                    this.pathsToSave.push({guid: guid, path: path});

                // ensure a needed workspace is already created
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