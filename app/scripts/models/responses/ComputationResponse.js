define(['backbone'], function (Backbone) {
    function ComputationResponse(data) {
        this.result = JSON.parse(data.nodesInJson);

        Backbone.trigger('computation-completed:event', this);
    }

    return ComputationResponse;
});