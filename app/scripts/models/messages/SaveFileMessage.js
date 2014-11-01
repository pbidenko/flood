define(function() {
    function SaveFileMessage(guid, path) {
        this.$type = 'DynamoWebServer.Messages.SaveFileMessage, DynamoWebServer';
        this.guid = guid;
        if (path)
            this.filePath = path;
    }

    return SaveFileMessage;
});