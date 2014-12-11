define(['views/AppView', 'SaveUploaderView'], 
    function(AppView, SaveUploaderView) {

    return AppView.extend({

        events: _.extend(AppView.prototype.events, {
            'click #save-button' : 'saveClick'
        }),

        initialize: function() { 
            AppView.prototype.initialize.call(this);
            this.saveUploaderView = new SaveUploaderView({ model: this.model.saveUploader, appView: this });
        },

        saveClick: function(e){
            this.model.sync("update", this.model);
        },

        newNodeWorkspace: function() {
            var customNodeName = prompt('Provide a name for the Custom Node', 'New custom node');
            if (!customNodeName || !customNodeName.trim().length)
                return;

            customNodeName = customNodeName.trim();

            this.model.newNodeWorkspace(null, false, customNodeName);
            this.hideAddWorkspaceSelect();
        },

        newHomeClick: function () {
            this.saveUploaderView.clearHomeWorkspace();
        }

    });
});

