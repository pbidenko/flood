require(["config"], function() {

  require(['backbone', 'CustomizerApp', 'CustomizerAppView', 'Three', 'FLOODCSG', 'bootstrap', 'augment' ], function (Backbone, CustomizerApp, CustomizerAppView, THREE) {

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

