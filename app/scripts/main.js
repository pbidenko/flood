require(["config"], function() {

  require(['backbone', 'App', 'AppView', 'FLOODCSG', 'bootstrap', 'augment'], function (Backbone, App, AppView) {

    var app = new App();

    app.fetch({
      error: function(result) {
        console.error('error');
        console.error(result);
      },
      success: function(){
        app.enableAutosave();
      }
    });

    var appView = new AppView({model: app});

  });

});
