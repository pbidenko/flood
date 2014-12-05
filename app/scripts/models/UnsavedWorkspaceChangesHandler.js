/**
 * Created by Masha on 11/14/2014.
 */
define(['backbone', 'HasUnsavedChangesMessage'], function(Backbone, HasUnsavedChangesMessage) {
    var actions = {
            clearHomeWS: 'Clear home workspace',
            waitForRequest: 'Wait for request'
        },
        currentAction,
        savingData;

    return Backbone.Model.extend({

        initialize: function(attrs) {
            this.app = attrs.app;

            this.app.get('workspaces').each(this.setWorkspaceProperty.bind(this));
            this.listenTo( this.app.get('workspaces'), 'add', this.setWorkspaceProperty);

            this.listenTo( attrs.saveUploader, 'clear-home-request', this.clearHomeRequest );

            this.listenTo( this.app, 'ws-unsaved-changes-presence-received:event', this.askForSaving );
            this.listenTo( attrs.saveUploader, 'saving-is-done', this.continueAction );

            currentAction = actions.waitForRequest;
        },

        continueAction: function () {
            if (currentAction == actions.clearHomeWS) {
                this.clearHomeWorkspace(savingData);
            }

            // reset
            currentAction = actions.waitForRequest;
        },

        askForSaving: function (data) {
            savingData = data;
            var path, fileName, dialogText,
                ws, saveUploader;
            if (data.hasUnsavedChanges) {
                saveUploader = this.app.saveUploader;
                ws = saveUploader.getWorkspaceByGuid(data.guid);

                path = saveUploader.getPathByGuid(data.guid);
                fileName = saveUploader.getFilename(path);
                if (!fileName)
                    fileName = ws.get('name') + ' workspace';

                dialogText = "You have unsaved changes to " + fileName +
                    ".\n\n Would you like to save your changes?";

                this.app.set('currentWorkspace', ws.get('_id'));
                if (confirm(dialogText)) {
                    // action will be continued after saving is done
                    saveUploader.trySaveFile();
                }
                else {
                    this.continueAction();
                }
            }
            else {
                this.continueAction();
            }
        },

        clearHomeWorkspace: function (data) {
            var saveUploader = this.app.saveUploader;
            var ws = saveUploader.getWorkspaceByGuid(data.guid);
            // ensure it's Home workspace
            if (!data.guid) {
                saveUploader.clearHomeWorkspace();
                // remove path for Home ws
                saveUploader.updatePathByGuid();
            }
        },

        setWorkspaceProperty: function (ws) {
            ws.set('askForUnsavedChanges', true);
        },

        clearHomeRequest: function () {
            // if previous action is in progress
            if (currentAction !== actions.waitForRequest)
                return;

            currentAction = actions.clearHomeWS;
            // pass no guid into the message that means it's home workspace
            this.app.saveUploader.sendStringMessage(new HasUnsavedChangesMessage());
        }
    });

});
