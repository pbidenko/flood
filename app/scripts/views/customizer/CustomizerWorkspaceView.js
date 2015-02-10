define(['backbone', 'BaseWidgetView', 'NumberWidgetView', 'CodeBlockWidgetView', 'StringWidgetView', 'BooleanWidgetView'], 
  function(Backbone, BaseWidgetView, NumberWidgetView, CodeBlockWidgetView, StringWidgetView, BooleanWidgetView) {

  return Backbone.View.extend({

    el: '#customizer-workspace',

    events: { 
      "click #hide-workspace" : "hideWorkspace"
     },

    initialize: function( args, atts ) {

    },

    map: {
      "Number" : NumberWidgetView,
      'Code Block': CodeBlockWidgetView,
      'Boolean': BooleanWidgetView,
      'String': StringWidgetView
    },

    hasWidgets: false,

    buildWidget: function(x) {

      if (x.get('extra') != undefined && x.get('extra').lock) return;

      var widgetView = BaseWidgetView;

      if (x.get('typeName') in this.map){
        widgetView = this.map[x.get('typeName')];
      }

      var widget = new widgetView({model: x});
      if (widget.changeVisibility) {
          widget.listenTo(this.model, 'change:current', widget.changeVisibility.bind(widget, this.model));
          widget.listenTo(widget.model, 'change:visible', widget.changeVisibility.bind(widget, this.model));
      }

      if (x.get('typeName') in this.map){
        this.$el.append( widget.render().$el );
        this.hasWidgets = true;
      }

    },

    visible: true,

    hideWorkspace: function(){

      if (this.visible){
        this.$el.addClass('workspace-contracted');
        this.$el.find('.widget').css('visibility', 'hidden');
        this.$el.find('#hide-workspace i').removeClass('fa-arrow-circle-left');
        this.$el.find('#hide-workspace i').addClass('fa-arrow-circle-right');
        this.visible = false;
      } else {
        this.$el.removeClass('workspace-contracted');
        this.$el.find('.widget').css('visibility', 'visible');
        this.$el.find('#hide-workspace i').removeClass('fa-arrow-circle-right');
        this.$el.find('#hide-workspace i').addClass('fa-arrow-circle-left');
        this.visible = true;
      }

    },

    render: function() {

      this.model.get('nodes').each(this.buildWidget.bind(this));

      if (!this.hasWidgets) this.$el.hide();

      return this;

    }

  });
});