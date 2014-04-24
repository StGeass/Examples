World.Field = atom.Class({
	Implements: [ Drawable, LibCanvas.Invoker.AutoChoose ],
	zIndex   : 10,
	width : 700,
	height: 500,
        initialize: function (libcanvas) {
          this.libcanvas = libcanvas;
          this.stuff = [];
          this.addStuff = this.addStuff.bind(this);
	},

        createLera: function () {
		this.Lera = new World.Lera([350, 400])
			             .controls(['aup', 'adown','aleft','aright']);

                this.libcanvas.createLayer('Lera')
                              .addElement( this.Lera  )
                              .addFunc( this.Lera.update.bind(this.Lera) );
	},
        
        createStuff: function () {
          for (var i = 3; i--;)
            this.addStuff(new World.Stuff() );
          
          return this;
	},
	addStuff: function (stuff) {
          this.stuff.push(stuff);
          this.libcanvas.addElement(stuff);
	},
        draw: function() {console.log(123);
        },
        update: function() {
          console.log(123);
        }
});