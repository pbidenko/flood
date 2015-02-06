define(['backbone'], function(Backbone) {

	return Backbone.Model.extend({

	  defaults: {
	  	isLoggedIn : false,
	  	failed : false,
	  	failureMessage : "",
	  	showing: false,
	  	email : ""
	  },

	  initialize: function(atts, vals) {
	  	this.app = vals.app;
	  },

	  fetch : function() {
	  	this.app.context.fetchLogin().done(function (e) {
	  		this.set('showing', true);

	  		if (e.email) {
	  			this.set('email', e.email);
	  			this.set('isLoggedIn', true);
	  		}
	  		else {
	  			this.set('isLoggedIn', false);
	  		}

	  		this.trigger('loginViewRedraw');
	  	}.bind(this));

	  },

		toggle: function(){
		  return this.get('showing') ? this.hide() : this.show();
		},

		show: function() {
		  this.set('showing', true);
		},

		hide: function() {
		  this.set('showing', false);
		},

	  signup: function(data){

	  	$.post('/signup', data, function(e){

	  		if (e.length && e.length > 0 ) {
	  			this.set('failureMessage', e[0].msg);
	  			return this.set('failed', true);
	  		}

	  		this.set('failed', false);
	  		this.app.fetch();
	  	}.bind(this));

	  },

	  login: function(data){

	  	$.post('/login', data, function(e){

	  		if (e.length && e.length > 0 ) {
	  			this.set('failureMessage', e[0].msg);
	  			return this.set('failed', true);
	  		}

	  		this.set('failed', false);
	  		this.app.fetch();
	  	}.bind(this));

	  },

	  logout: function(){

	  	this.app.context.logout().done(function(e){
	  		this.app.fetch();
	  	}.bind(this));

	  }

	});
});
