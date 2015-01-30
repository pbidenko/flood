require(["config"], function() {

  require(['backbone', 'CustomizerApp', 'CustomizerAppView', 'FLOODCSG', 'bootstrap', 'augment' ], function (Backbone, CustomizerApp, CustomizerAppView) {

    var app = new CustomizerApp();

    app.fetch({
      error: function(result) {
        console.error('error');
        console.error(result);
      },
      success: function(){
      }
    });

    var appView = new CustomizerAppView({model: app});

  });

});

