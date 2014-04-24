World.Controller = atom.Class({
        Implements: [LibCanvas.Invoker.AutoChoose],


	initialize: function (libcanvas) {
          this.libcanvas = libcanvas;
          this.stuff = [];
          this.addStuff = this.addStuff.bind(this);
          this.start();
	},

	start: function () {
          this.invoker.addFunction(10, this.update.bind(this));

          this.lera = new World.Lera([325, 350]);
          this.libcanvas.addElement( this.lera  );
          var i = World.config.posts.random;

          this.createStuff();          
	},

	update: function (time) {
          if(this.lera.level < 17) {
            var deadStuff = 3 + this.lera.level - this.stuff.length;

            if(deadStuff > 0)
              this.createStuff(deadStuff);

            this.stuff.invoke('update', time);
            this.lera.update(time);

            this.checkCollisions();

            this.libcanvas.update();
          }
          else {
            $('#canvas').hide();
            $('#ehb').fadeIn();
          }

	},

        createStuff: function () {
          for (var i = 3; i--;)
            this.addStuff( new World.Stuff( this.lera ) );

          return this;
	},
        
	addStuff: function (stuff) {
          this.stuff.push(stuff);
          this.libcanvas.addElement(stuff);
	},

        checkCollisions: function () {
          var lera = this.lera.rect;

          for (var i = this.stuff.length; i--;) {
            if (lera.intersect(this.stuff[i].rect))
              this.touchStuff(this.stuff[i]);
            
            if(this.stuff[i].rect.to.y >= 400 && !this.stuff[i].behavior)
              this.landingStuff(this.stuff[i]);

            if(this.stuff[i].rect.center.x < 0 || this.stuff[i].rect.center.x > 650)
              this.destroyStuff(this.stuff[i]);


          }
          return this;
	},

        touchStuff: function(stuff) {
          var destroy = true;

          if(stuff.id == 'post' && this.lera.posts.length > 0)
            this.showPost();

          this.checkScore(stuff)

          if(stuff.id == 'slipper')
            this.lera.increaseSpeed(10);
          else if(stuff.id == 'pb')
            this.lera.decreaseSpeed(1, 1, 0, 10);
            

          if(destroy && !stuff.behavior) this.destroyStuff(stuff);
        },

        landingStuff: function(stuff) {
          if(stuff.id == 'pb')
            stuff.angryStuff(this.lera);
          else if(stuff.id == 'troll')
            this.checkScore(stuff.score * 2).destroyStuff(stuff)
          else if(stuff.id == 'food') {
            var t = this;
            setTimeout(function() { t.destroyStuff(stuff) }, 2000);
          }
          else
            this.destroyStuff(stuff);
        },

	destroyStuff: function (stuff) {
          this.stuff.erase(stuff);
          this.libcanvas.rmElement(stuff);
          return this;
	},

        showPost: function () {
          var post = this.lera.posts.random;
          this.lera.posts.erase(post);
          $('#posts').prepend('<div class="post"><b>' + post[0] +
                              ' : </b>' + post[1] + '</div>');
        },

        checkScore: function (s) {
          this.lera.updateStat(s.id);

          var sc = s.id == 'troll' ? Number.random(-1, 1) * s.score : s.score;
          var score = this.lera.countScore(sc);        
          
          if(score >= 0)
            this.lera.newLevel(1);

          return this;
	}

});