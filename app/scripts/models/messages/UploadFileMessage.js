/**
 * Created by Masha on 10/30/2014.
 */
define(function(){
    function UploadFileMessage(path){
        this.$type = 'DynamoWebServer.Messages.UploadFileMessage, DynamoWebServer';
        this.path = path;
    }

    return UploadFileMessage;
});