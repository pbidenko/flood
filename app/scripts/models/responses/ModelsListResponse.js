define(['backbone'], function(Backbone){
    function ModelsListResponse(data) {
        this.models = data.models;

        Backbone.trigger('modelsList-received:event', this);
    }

    return ModelsListResponse;
});