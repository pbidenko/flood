define(['backbone'], function (Backbone) {
    function ComputationResponse(data) {
        this.result = data.nodes;

        Backbone.trigger('computation-completed:event', this);
    }

    return ComputationResponse;
});