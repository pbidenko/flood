define(function() {
    function SaveFileMessage(guid, path) {
        this.type = 'SaveFileMessage';
        this.guid = guid;
        if (path)
            this.filePath = path;
    }

    return SaveFileMessage;
});