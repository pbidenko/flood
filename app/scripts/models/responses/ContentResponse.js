//Some content specific logic can be placed here
define(['backbone'], function(Backbone){
    function ContentResponse(data) {
        this.message = data.message;
    }

    return ContentResponse;
});