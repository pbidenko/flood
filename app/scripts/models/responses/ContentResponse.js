//Some content specific logic can be placed here
define(['backbone'], function(Backbone){
    function ContentResponse(data) {
        this.message = data.message;

        Backbone.trigger('content-received:event', this);
    }

    return ContentResponse;
});