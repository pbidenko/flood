/**
 * Created by Masha on 1/27/2015.
 */
define(function(){
    function GetArrayItemsMessage(requestData){
        this.type = 'GetNodeArrayItemsMessage';
        this.nodeId = requestData.nodeId;
        this.indexFrom = requestData.indexFrom;
        this.length = requestData.numberToRequest;
    }

    return GetArrayItemsMessage;
});