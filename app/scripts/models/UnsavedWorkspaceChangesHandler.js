/**
 * Created by Masha on 11/14/2014.
 */
define(['backbone', 'HasUnsavedChangesMessage'], function(Backbone, HasUnsavedChangesMessage) {
    var actions = {
            clearHomeWS: 'Clear home workspace',
            closeTab: 'Close workspace tab',
            waitForRequest: 'Wait for request'
        },
        currentAction;

    return Backbone.Model.extend({

        initialize: function(attrs) {
            this.app = attrs.app;

            this.app.get('workspaces').each(this.setWorkspaceProperty.bind(this));
            this.listenTo( this.app.get('workspaces'), 'add', this.setWorkspaceProperty);

            this.listenTo( this.app.get('workspaces'), 'closing-request', this.closingRequest);
            this.listenTo( attrs.saveUploader, 'clear-home-request', this.clearHomeRequest );

            this.listenTo( attrs.saveUploader, 'saving-is-done', this.continueAction );

            this.resetAction();
        },

        continueAction: function () {
            if (currentAction === actions.clearHomeWS) {
                this.clearHomeWorkspace(this.savingData);
            }
            else if (currentAction === actions.closeTab) {
                this.closeWorkspaceTab(this.savingData);
            }

            // reset
            this.resetAction();
        },

        resetAction: function () {
            currentAction = actions.waitForRequest;
        },

        closeWorkspaceTab: function (data) {
            var saveUploader = this.app.saveUploader;
            var ws = saveUploader.getWorkspaceByGuid(data.guid);
            if (ws.get('isCustomNode')) {
                this.app.get('workspaces').trigger('hide', ws);
            }
            else {
                this.app.get('workspaces').remove(ws);
            }
        },

        clearHomeWorkspace: function (data) {
            var saveUploader = this.app.saveUploader;
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

        canProcessNextAction: function () {
            var saveUploader = this.app.saveUploader;
            // it can be true only if a user closed
            // save dialog without saving (Cancel or X)
            if (saveUploader.savingWasStarted) {
                saveUploader.savingWasStarted = false;
                this.resetAction();
            }

            var canProcess = (currentAction === actions.waitForRequest);
            return canProcess;
        },

        closingRequest: function (ws) {
            // if previous action is in progress
            if (!this.canProcessNextAction())
                return;

            currentAction = actions.closeTab;
            var guid = ws.get('isCustomNode') ? ws.get('guid') : '';
            this.app.saveUploader.sendStringMessage(new HasUnsavedChangesMessage(guid));
        },

        clearHomeRequest: function () {
            // if previous action is in progress
            if (!this.canProcessNextAction())
                return;

            currentAction = actions.clearHomeWS;
            // pass no guid into the message that means it's home workspace
            this.app.saveUploader.sendStringMessage(new HasUnsavedChangesMessage());
        }
    });

});
