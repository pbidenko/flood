/**
 * Created by Masha on 12/5/2014.
 */
define(['backbone'], function(Backbone) {

    return Backbone.View.extend({

        initialize: function() {
            this.listenTo( this.model.app, 'ws-unsaved-changes-presence-received:event', this.askForSaving );
        },

        askForSaving: function (data) {
            this.model.savingData = data;
            var path, fileName, dialogText,
                ws, saveUploader;
            if (data.hasUnsavedChanges) {
                saveUploader = this.model.app.saveUploader;
                ws = saveUploader.getWorkspaceByGuid(data.guid);

                path = saveUploader.getPathByGuid(data.guid);
                fileName = saveUploader.getFilename(path);
                if (!fileName) {
                    fileName = ws.get('name') + ' workspace';
                }

                dialogText = "You have unsaved changes to " + fileName +
                    ".\n\n Would you like to save your changes?";

                this.model.app.set('currentWorkspace', ws.get('_id'));
                if (confirm(dialogText)) {
                    // action will be continued after saving is done
                    saveUploader.trySaveFile();
                }
                else {
                    this.model.continueAction();
                }
            }
            else {
                this.model.continueAction();
            }
        }
    });
});