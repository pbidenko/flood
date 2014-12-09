/**
 * Created by Masha on 11/14/2014.
 */
define(['backbone', 'HasUnsavedChangesMessage'], function(Backbone, HasUnsavedChangesMessage) {
    var actions = {
            clearHomeWS: 'Clear home workspace',
            waitForRequest: 'Wait for request'
        },
        currentAction;

    return Backbone.Model.extend({

        initialize: function(attrs) {
            this.app = attrs.app;

            this.listenTo( attrs.saveUploader, 'clear-home-request', this.clearHomeRequest );

            this.listenTo( attrs.saveUploader, 'saving-is-done', this.continueAction );

            currentAction = actions.waitForRequest;
        },

        continueAction: function () {
            if (currentAction === actions.clearHomeWS) {
                this.clearHomeWorkspace(this.savingData);
            }

            // reset
            currentAction = actions.waitForRequest;
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
