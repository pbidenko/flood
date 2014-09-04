define(['backbone'], function (Backbone) {
    function ComputationResponse(data) {
        this.result = data.nodes;
    }

    return ComputationResponse;
});