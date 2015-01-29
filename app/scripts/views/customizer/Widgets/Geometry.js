define(['backbone', 'underscore', 'jquery', 'BaseWidgetView', 'ThreeHelpers'], function(Backbone, _, $, BaseWidgetView, helpers) {

  return BaseWidgetView.extend({

    initialize: function(args) {

        BaseWidgetView.prototype.initialize.apply(this, arguments);

        this.listenTo(this.model, 'change:selected', this.colorSelected);
        this.listenTo(this.model, 'change:visible', this.changeVisibility);
        this.listenTo(this.model, 'remove', this.onRemove);
        this.listenTo(this.model, 'change:prettyLastValue', this.onEvalComplete);
        this.listenTo(this.model.workspace, 'change:current', this.changeVisibility);

        this.onEvalComplete();
    },

    setMaterials: function(partMat, meshMat, lineMat){

      this.threeGeom.traverse(function(ele) {
        if (ele instanceof THREE.Mesh) {
          ele.material = meshMat;
        } else if (ele instanceof THREE.Line) {
          ele.material = lineMat;
        } else {
          ele.material = partMat;
        }
      });

    },

    colorSelected: function(){

      BaseWidgetView.prototype.colorSelected.apply(this, arguments);

      if ( !( this.threeGeom && this.model.get('visible')) ) return this;

      if (this.model.get('selected')) {

        var meshMat = new THREE.MeshPhongMaterial({color: 0x66d6ff, side : THREE.DoubleSide });
        var partMat = new THREE.ParticleBasicMaterial({color: 0x66d6ff, size: 5, sizeAttenuation: false});
        var lineMat = new THREE.LineBasicMaterial({ color: 0x66d6ff });

      } else {

        var meshMat = new THREE.MeshPhongMaterial({color: 0x999999, side : THREE.DoubleSide});
        var partMat = new THREE.ParticleBasicMaterial({color: 0x999999, size: 5, sizeAttenuation: false});
        var lineMat = new THREE.LineBasicMaterial({ color: 0x000000 });

      }

      this.setMaterials(partMat, meshMat, lineMat);

      return this;

    }, 

    // 3D move to node subclass
    onRemove: function() {
        this.stopListening(this.model.workspace, 'change:current', this.changeVisibility);
        scene.remove(this.threeGeom);
    },

    evaluated: false,

    toThreeGeom: function( rawGeom ) {

      var threeGeom = new THREE.Geometry(), face;

      if (!rawGeom) return threeGeom;

      if (!rawGeom.vertices && !rawGeom.linestrip ) return threeGeom;

      if (rawGeom.linestrip) return this.addLineStrip( rawGeom, threeGeom );

      if (rawGeom.vertices && !rawGeom.faces) return this.addPoints( rawGeom, threeGeom );

      for ( var i = 0; i < rawGeom.vertices.length; i++ ) {
        var v = rawGeom.vertices[i];
        threeGeom.vertices.push( new THREE.Vector3( v[0], v[1], v[2] ) );
      }

      if (!rawGeom.faces) return threeGeom;

      for ( var i = 0; i < rawGeom.faces.length; i++ ) {
        var f = rawGeom.faces[i];
        face = helpers.createFace(f);

        threeGeom.faces.push( face );
      }
      
      threeGeom._floodType = 0;

      return threeGeom;

    },

    addPoints: function( rawGeom, threeGeom ){

      for ( var i = 0; i < rawGeom.vertices.length; i++ ) {
        var v = rawGeom.vertices[i];
        threeGeom.vertices.push( new THREE.Vector3( v[0], v[1], v[2] ) );
      }

      threeGeom._floodType = 1;

      return threeGeom;
    },

    addLineStrip: function( rawGeom, threeGeom ){

      for ( var i = 0; i < rawGeom.linestrip.length; i++ ) {
        var v = rawGeom.linestrip[i];
        threeGeom.vertices.push( new THREE.Vector3( v[0], v[1], v[2] ) );
      }

      threeGeom._floodType = 2;

      return threeGeom;
      
    },

    onEvalComplete: function(a, b, newValue){

      if (!newValue && this.evaluated) return;

      this.evaluated = true;

      var lastValue = this.model.get('prettyLastValue');
      var temp;

      if ( !lastValue ) return;

      if ( lastValue.vertices || lastValue.linestrip ){ 
        temp = [];
        temp.push(lastValue);
      } else {
        temp = lastValue; // extract the list
      } 

      var threeTemp = new THREE.Object3D();
      this.drawChunked( threeTemp, temp, function() { 

        if ( this.threeGeom ){
          scene.remove( this.threeGeom );
        }

        this.threeGeom = threeTemp;
        scene.add( this.threeGeom );
        this.changeVisibility();

      } );

    }, 

    // creating this data may be quite slow, we'll need to be careful
    drawChunked: function(geom, list, callback){

      var i = 0;
      var tick = function() {

        var start = new Date().getTime();
        for (; i < list.length && (new Date().getTime()) - start < 50; i++) {
        
          var g3  = this.toThreeGeom( list[i] );

          if (this.model.get('selected')){
            var color = 0x66d6ff;
          } else {
            var color = 0x999999;
          }

          switch (g3._floodType) {
            case 0:
              geom.add( new THREE.Mesh(g3, new THREE.MeshPhongMaterial({color: color, side : THREE.DoubleSide})) );
              break;
            case 1:
              geom.add( new THREE.ParticleSystem(g3, new THREE.ParticleBasicMaterial({color: color, size: 5, sizeAttenuation: false}) ));
              break;
            case 2:
              geom.add( new THREE.Line(g3, new THREE.LineBasicMaterial({ color: 0x000000 })));
              break;
          }

        }

        if (i < list.length) {
          setTimeout(tick, 25);
        } else {
          callback.call(this);
        }

      }.bind(this);

      setTimeout(tick, 0);

    },

    changeVisibility: function(){

      if ( !this.threeGeom ){
        return;
      }
        
      if (!this.model.get('visible') || !this.model.workspace.get('current') )
      {
        this.threeGeom.traverse(function(e) { e.visible = false; });
      } else if ( this.model.get('visible') )
      {
        this.threeGeom.traverse(function(e) { e.visible = true; });
      }

    },

    renderNode: function() {
      
      BaseWidgetView.prototype.renderNode.apply(this, arguments);

      return this;

    },

  });

});