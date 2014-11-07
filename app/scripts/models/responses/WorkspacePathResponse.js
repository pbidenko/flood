define(['backbone'], function (Backbone) {
    function WorkspacePathResponse(data) {
        this.guid = data.guid;
        this.path = data.path;
    }

    return WorkspacePathResponse;
});
