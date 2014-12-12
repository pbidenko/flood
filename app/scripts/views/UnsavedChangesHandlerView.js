/**
 * Created by Masha on 12/5/2014.
 */
define(['backbone', 'jqueryuidialog'], function(Backbone, jqueryuidialog) {

    return Backbone.View.extend({

        initialize: function() {
            this.listenTo( this.model.app, 'ws-unsaved-changes-presence-received:event', this.askForSaving );
        },

        askForSaving: function (data) {
            var path, fileName, dialogText,
                ws, saveUploader,
                model = this.model;
            model.savingData = data;
            if (data.hasUnsavedChanges) {
                saveUploader = model.app.saveUploader;
                ws = saveUploader.getWorkspaceByGuid(data.guid);

                path = saveUploader.getPathByGuid(data.guid);
                fileName = saveUploader.getFilename(path);
                if (!fileName) {
                    fileName = ws.get('name') + ' workspace';
                }

                dialogText = "You have unsaved changes to " + fileName +
                    ".\n\n Would you like to save your changes?";

                model.app.set('currentWorkspace', ws.get('_id'));

                $('#dialog-confirm-text').html(dialogText);
                var dialog = $( '#dialog-confirm' ).dialog({
                    buttons: {
                        "Yes": function() {
                            dialog.dialog('close');
                            // action will be continued after saving is done
                            saveUploader.trySaveFile();
                        },
                        "No":  function() {
                            dialog.dialog('close');
                            model.continueAction();
                        },
                        "Cancel":  function() {
                            dialog.dialog('close');
                            model.resetAction();
                        }
                    }
                });
            }
            else {
                model.continueAction();
            }
        }
    });
});