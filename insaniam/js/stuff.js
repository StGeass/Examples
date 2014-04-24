new function () {
  var cfg = World.config.stuff;
  
  World.Stuff = atom.Class({
     Implements: [ Drawable ],
     zIndex: 60,
     xs: 0,
     ys: 0,
     icfg: [],
     speed: Number.random(1, 5),

    initialize: function(enemy) {
     this.enemy = enemy;
     this.position = new Point([Number.random(10, 690), -Number.random(30, 160)]);

     this.defineStuff(Number.random(1, 30));
     this.drawEngines();
    },
    update: function(time) {
      var side = this.position.diff(this.enemy.rect.center).x < 0 ? -3 : 3;

      if(this.id == 'pb')
        if(this.behavior == 'angry')
          this.image = this.pb_r.sprite;
        else
          this.image = this.icfg['pb1']

      
      if(this.behavior == 'angry')
        this.rect.moveTo(this.position.move([this.side,0]));

      if(this.id == 'troll')
        this.xs = side;
      
      if(this.position.y < 380 && !this.behavior)
        this.rect.moveTo(this.position.move([this.xs, this.ys]));

      this.libcanvas.update();
    },
    draw: function () {
        this.libcanvas.ctx.lineWidth = 2;

        this.libcanvas.ctx.drawImage({
                          image : this.image,
                          center: this.rect.center
                        });
                      
     },
    drawEngines: function() {
      this.rect = new Rectangle(this.position.clone().move([10,10]),
                                this.position.clone().move([30,30]));
      this.addEvent('libcanvasSet', function () {
        if(this.id == 'pb') {
          this.icfg['pb1'] = this.libcanvas.getImage('pb1');
          this.icfg['pb2'] = this.libcanvas.getImage('pb2');

          this.pb_r = new LibCanvas.Animation.Sprite()
                                    .addSprites({
                                      rr1 : this.icfg['pb2'].sprite(  0, 0, 25, 48),
                                      rr2 : this.icfg['pb2'].sprite(  25, 0, 25, 48),
                                      rl1 : this.icfg['pb2'].sprite(  50, 0, 25, 48),
                                      rl2 : this.icfg['pb2'].sprite(  75, 0, 25, 48)
                                    })
                                    .add({  name: 'rr',
                                            frames: [
                                                { sprite: 'rr1', delay:  100 },
                                                { sprite: 'rr2', delay:  100 }
                                            ],loop : true  })
                                    .add({  name: 'rl',
                                            frames: [
                                                { sprite: 'rl1', delay:  100 },
                                                { sprite: 'rl2', delay:  100 }
                                            ],loop : true  });
        }
        else if(this.id == 'gift')
          this.image = this.libcanvas.getImage('gift');
        else if(this.id == 'troll')
          this.image = this.libcanvas.getImage('troll');
        else if(this.id == 'cake')
          this.image = this.libcanvas.getImage('cake');
        else if(this.id == 'slipper')
          this.image = this.libcanvas.getImage('slipper');
        else if(this.id == 'food')
          this.image = this.libcanvas.getImage('f' + Number.random(1, 4));
        else if(this.id == 'post')
          this.image = this.libcanvas.getImage('post');
      });
        
    },
    
    defineStuff: function(n) {
      if(n > 10 && n <= 15)
        this.id = 'slipper';
      else if(n > 15 && n <= 17)
        this.id = 'pb';
      else if(n == 25 && this.enemy.posts.length > 0)
        this.id = 'post';
      else if(n == 30)
        this.id = 'cake';
      else if(n > 8 && n <= 10)
        this.id = 'troll';
      else if(n > 0 && n <= 4)
        this.id = 'food';
      else
        this.id = 'gift';

//      this.id = 'gift';

      this.stuff = cfg[this.id];
      this.score = this.stuff.score;

      this.ys = Number.random(this.stuff.mins,
                              this.stuff.maxs)
    },
    angryStuff: function(enemy) {
      this.side = this.position.diff(enemy.rect.center).x < 0 ? -3 : 3;
      this.behavior = 'angry';

      this.addEvent('libcanvasSet', function () {
        var sprite = this.position.diff(this.enemy.rect.center).x < 0 ? 'rl' : 'rr';

        this.pb_r.run(sprite);
      });
    }

  });
}