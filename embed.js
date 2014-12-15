(function() {
    var Sweet = Backbone.Model.extend({
      defaults: {
        'who': '',
        'what': 're-narration',
        'where': '',
        'how': {}
      },
      initialize: function() {
      }
    });


    var Sweets = Backbone.Collection.extend({
      model: Sweet,
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

        var url = "http://teststore.swtr.us/api/sweets/q?what=" + what + "&where=" + where;

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
      filterByLanguage: function(language) {
        var models = this.filter(function(model) {
          if(model.get('how')['language'] && model.get('how')['language'] == language) {
            return model;
          }
        });
        return models;
      }
    });

  var AlipiView = Backbone.View.extend({
    initialize: function() {
      this.listenTo(this.collection, "add", this.render);
    },

    render: function(model) {
      // based on the type of element, render the annotation.
//      console.log(model);
    }
  });

  window.Renarrations = new Sweets();
  Renarrations.getAll({"what": "re-narration",
                       "where": window.location.href,
                       "success": function(data) {

                         new AlipiView({collection: Renarrations});
                         Renarrations.add(data);
                         //                         new AppView()
                       }});

})();
