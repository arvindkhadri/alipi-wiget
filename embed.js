(function() {
  var $ = require('jquery');
  var Backbone = require('backbone');
  var _ = require('underscore');

  Backbone.$ = $; // Set this, or else Backbone.$ is not found.

  var Sweets = Backbone.Collection.extend({
    // initialize: function(options) {
    //   this.getAll(options);
    // },
    getAll: function(options) {
      // error checking
      if(!options.where) {
        throw Error('"where" option must be passed to get sweets of a URI');
        return false;
      }
      if(!options.what) {
        throw Error('"what" option must be passed to get sweets of a URI');
        return false;
      }

      // setting up params
      var where = options.where,
          what = options.what;
      var who = options.who || null;

      var url = "http://y.a11y.in/web/replace?lang=" + what +
            "&url=" + where + "&type=re-narration";

      if(who) {
        url += '&who=' + who;
      }
      // get them!
      this.sync('read', this, {
        url: url,
        success: function() {
          if(typeof options.success === 'function') {
            options.success.apply(this, arguments);
          }
        },
        error: function() {
          if(typeof options.error === 'function') {
            options.error.apply(this, arguments);
          }
        }
      });
    },
    filterByOption: function(options) {
      var keys = _.keys(options);
      var values = _.values(options);
      if(keys.length > 1 || keys.length == 0) {
        throw Error("Too many parameters. Filter by one attribute.");
      }
      var models = this.filter(function(model) {
        if(model.get([keys[0]]) == values[0]) {
          return model;
        }
      });
      return models;
    }
  });

    var Languages = Backbone.Collection.extend({
    getAll: function(options) {
      // error checking
      if(!options.where) {
        throw Error('"where" option must be passed.');
        return false;
      }
      // setting up params
      var where = options.where;
      var url = "http://y.a11y.in/web/menu?&url=" + where;

      // get them!
      this.sync('read', this, {
        url: url,
        success: function() {
          if(typeof options.success === 'function') {
            options.success.apply(this, arguments);
          }
        },
        error: function() {
          if(typeof options.error === 'function') {
            options.error.apply(this, arguments);
          }
        }
      });
    }
    });


  Renarrations = new Sweets();
  /*  Renarrations.getAll({"what": "English",
                       "where": encodeURIComponent("http://a11y.in/"),
                       "success": function(data) {
                         _.each(data['r'], function(item) {
                           _.each(item['narration'], function(narration) {
                             Renarrations.add(narration);
                           });
                         });
                       }});
   */

  var evalAndReplace = function(swt) {
    try{
	    var nodes = document.evaluate(swt.get('xpath'), document,
                                    null, XPathResult.ANY_TYPE,null);

		}
		catch(e)
		{
	    console.log(e);
		}
    try{
			var result = nodes.iterateNext();
			while (result)
			{
				if (swt.get('elementtype') == 'image')
				{
					if(swt.get('data') != '')
					{
						result.setAttribute('src',swt.get('data').split(',')[1]);
						var width = swt.get('data').split(',')[0].split('x')[0];
						var height = swt.get('data').split(',')[0].split('x')[1];
						result.setAttribute('width',width);
						result.setAttribute('height', height);
					}
					else
						$(result).hide();
        }
				else if(swt.get('elementtype') == 'audio/ogg')
				{
					var data = decodeURIComponent(swt.get('data'));
					var audio = '<audio controls="controls" src="'+
                data +'" style="display:table;"></audio>';
					$(result).before(audio);
				}
        else{
					result.innerHTML = swt.get('data');
        }
        result=nodes.iterateNext();
      }
    }
    catch (e)
    {
			// throw Error( 'error: Document tree modified during iteration ' + e );
    }

  };

  Renarrate = function(swts) {
    if(!swts) {
      throw Error("No swts were passed as argument to the function!");
    }
    if(swts.length <= 0) {
      console.log('No renarrations available!');
    }
    swts.each(evalAndReplace);
  };

  var AlipiWidgetView = Backbone.View.extend({
    initialize: function() {
      this.collection = new Languages();
      var LanguageCollection = this.collection;
      this.collection.getAll({"where": encodeURIComponent(window.location.href),
                        "success": function(data) {
                          _.each(data, function(item) {
                            LanguageCollection.add(item);
                          });
                        }});
    }
  });
  //AWV = new AlipiWidgetView;
})();
