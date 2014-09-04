define(['backbone'], function(Backbone){
    function LibraryItemsListResponse(data) {
        this.libraryItems = data.libraryItems;
    }

    return LibraryItemsListResponse;
});