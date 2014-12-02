/**
 * Created by Masha on 11/20/2014.
 */
define(['backbone'], function (Backbone) {
    function CodeBlockDataResponse(responseData) {
        this.workspaceGuid = responseData.workspaceGuid;
        this.nodeId = responseData.nodeId;
        this.data = responseData.data;
    }

    return CodeBlockDataResponse;
});
