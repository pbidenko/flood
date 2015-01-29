/**
 * Created by Masha on 1/27/2015.
 */
define(['backbone'], function (Backbone) {
    function ArrayItemsDataResponse(responseData) {
        this.nodeId = responseData.nodeId;
        this.items = responseData.items;
        this.indexFrom = responseData.indexFrom;
    }

    return ArrayItemsDataResponse;
});