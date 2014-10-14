define(['backbone'], function(Backbone){
    function SavedFileResponse(data) {
        this.fileContent = data.fileContent.$value;
        this.fileName = data.fileName;
    }

    return SavedFileResponse;
});
