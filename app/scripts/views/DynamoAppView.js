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
            this.model.sync('update', this.model);
        },

        newHomeClick: function () {
            this.saveUploaderView.clearHomeWorkspace();
        }

    });
});

