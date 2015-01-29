define(['backbone', 'underscore', 'jquery', 'BaseNodeView', 'jqueryuislider'], function(Backbone, _, $, BaseNodeView) {

  return BaseNodeView.extend({

    template: _.template( $('#node-num-template').html() ),

    initialize: function(args) {

        BaseNodeView.prototype.initialize.apply(this, arguments);
        this.rendered = false;

        this.listenTo(this.model, 'change:extra', function () {

            var ex = this.model.get('extra');

            this.silentSyncUI(ex);

            this.model.trigger('updateRunner');
            this.model.workspace.trigger('requestRun');
        });
    },
 
    render: function() {
      
      BaseNodeView.prototype.render.apply(this, arguments);

      if (this.rendered) return this;

      // make the slider
      this.slider = this.$el.find('.slider');
      if (!this.slider) return;

      var extra = this.model.get('extra');
      var min = extra.min != undefined ? extra.min : -150;
      var max = extra.max != undefined ? extra.max : 150;
      var step = extra.step != undefined ? extra.step : 0.1;
      var lock = extra.lock != undefined ? extra.lock : false;
      var value = extra.value != undefined ? extra.value : 0;
      if (value === undefined ) value = this.model.get('lastValue');

      this.slider.slider(
        { min: min, 
          max: max, 
          step: step, 
          value: value,
          change: function (e, ui) { this.inputSet(e, ui); }.bind(this),
          slide: function (e, ui) { this.inputChanged(e, ui); }.bind(this)
        });

      this.currentValueInput = this.$el.find('.currentValue');
      this.currentValueInput.val( value );
      this.currentValueInput.change(function (e) { this.valChanged(e); e.stopPropagation(); }.bind(this));

      this.minInput = this.$el.find('.num-min');
      this.minInput.val(min);
      this.minInput.change(function (e) { this.minChanged(e); e.stopPropagation(); }.bind(this));

      this.maxInput = this.$el.find('.num-max');
      this.maxInput.val(max);
      this.maxInput.change(function (e) { this.maxChanged(e); e.stopPropagation(); }.bind(this));

      this.stepInput = this.$el.find('.num-step');
      this.stepInput.val(step);
      this.stepInput.change(function (e) { this.stepChanged(e); e.stopPropagation(); }.bind(this));

      this.lockInput = this.$el.find('.lock-input');
      this.lockInput.val( lock );
      this.lockInput.change(function (e) { this.lockChanged(e); e.stopPropagation(); }.bind(this));

      // adjust settings dropdown so that it stays open while editing
      // doesn't select the node when you're editing
      $('.dropdown.keep-open').on({
        "shown.bs.dropdown": function() {
          this.selectable = false;
          this.model.set('selected', false);
          $('.dropdown.keep-open').data('closable', false);
        }.bind(this),
        "mouseleave": function() {
            $('.dropdown.keep-open').data('closable', true);
        },
        "click": function() {
            $('.dropdown.keep-open').data('closable', false);
        },
        "hide.bs.dropdown": function() {
            if ($('.dropdown.keep-open').data('closable')) this.selectable = true;
            return $('.dropdown.keep-open').data('closable');
        }.bind(this)
      });

      // this.rendered = true;

      return this;

    },

    silentSyncUI: function(data){

      this.silent = true;
      this.currentValueInput.val( data.value );
      this.setSliderValue( data.value );
      this.minInput.html( data.min );
      this.maxInput.html( data.max );
      this.stepInput.html( data.step );
      this.lockInput.val( data.lock );
      this.silent = false;

    },

    currentValue: function(){
      return this.slider.slider("option", "value");
    },

    setSliderValue: function(val){
      return this.slider.slider("option", "value", val);
    },

    valChanged: function(val){
      var val = parseFloat( this.currentValueInput.val() );
      if (isNaN(val)) return;
      return this.setSliderValue( val );
    },

    minChanged: function(e, u){
      var val = parseFloat( this.minInput.val() );
      if (isNaN(val)) return;
      if (this.currentValue < val) this.setSliderValue(val);
      this.slider.slider("option", "min", val);
    },

    maxChanged: function(e){
      var val = parseFloat( this.maxInput.val() );
      if (isNaN(val)) return;
      if (this.currentValue > val) this.setSliderValue(val);
      this.slider.slider("option", "max", val);
    },

    stepChanged: function(e){
      var val = parseFloat( this.stepInput.val() );
      if (isNaN(val)) return;
      this.slider.slider("option", "step", val);
    },

    lockChanged: function(e){
      this.inputSet();
    },

    inputChanged: function(e,ui) {
      var val = ui.value;
      this.$el.find('.currentValue').html(val);
    },

    inputSet: function() {

      if ( this.silent ) return;

      var newValue = {   value: this.slider.slider("option", "value"), min: this.slider.slider("option", "min"), 
        step: this.slider.slider("option", "step"), max: this.slider.slider("option", "max"), lock: this.lockInput.is(':checked') };

      this.model.workspace.setNodeProperty({property: 'extra', _id: this.model.get('_id'), newValue: newValue });      

    }

  });

});