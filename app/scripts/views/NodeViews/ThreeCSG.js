define(['backbone', 'underscore', 'jquery', 'BaseNodeView'], function(Backbone, _, $, BaseNodeView) {

    return BaseNodeView.extend({

    formatPreview: function(data){

      // ugh this is terrible code

      if (data == null || data === undefined)
        return BaseNodeView.prototype.formatPreview.apply(this, arguments);

      if (data.length === undefined && !data.normal && !data.polygons && !data.vertices) 
        return BaseNodeView.prototype.formatPreview.apply(this, arguments);

      if (data.length > 0 && !data[0].normal && !data[0].polygons && !data[0].vertices) 
        return BaseNodeView.prototype.formatPreview.apply(this, arguments);

      if (data.normal) return "Plane";
      if (data.polygons) return "Solid";
      if (data.vertices) return "Polygon";

      if (data.length) {

        var solidCount = 0;
        var polyCount = 0;
        var planeCount = 0;

        for (var i = 0; i < data.length; i++) {
          if ( data[i].polygons ) solidCount++;
          if ( data[i].normal ) planeCount++;
          if ( data[i].vertices ) polyCount++;
        }

        var solidString = solidCount + " Solids";
        var polyString = polyCount + " Polygons";
        var planeString = planeCount + " Planes";

        var stringArr = [];

        if (solidCount > 0) stringArr.push(solidString);
        if (planeCount > 0) stringArr.push(planeString);
        if (polyCount > 0) stringArr.push(polyString);

        if (planeCount === 0 && solidCount === 0 && polyCount === 0) return "Nothing";

        return stringArr.join(',');

      }
      return "Nothing";

    },

    renderNode: function() {
      
      BaseNodeView.prototype.renderNode.apply(this, arguments);

      this.$toggleVis = this.$el.find('.toggle-vis');
      this.$toggleVis.show();

      var icon = this.$toggleVis.find('i');
      var label = this.$toggleVis.find('span');

      if (this.model.get('visible')){
        icon.addClass('fa-eye');
        icon.removeClass('fa-eye-slash');
        label.html('Hide geometry');
      } else {
        icon.removeClass('fa-eye');
        icon.addClass('fa-eye-slash');
        label.html('Show geometry');
      }

      return this;

    }

  });

});