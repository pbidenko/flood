/**
 * Created by Masha on 8/21/2014.
 */
define(['backbone'], function (Backbone) {
    function UpdateProxyNodesResponse(data) {
        this.workspaceId = data.workspaceId;
        this.nodesIds = data.nodesIds;
        this.customNodeId = data.customNodeId;
    }

    return UpdateProxyNodesResponse;
});
