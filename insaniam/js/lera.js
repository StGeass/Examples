World.Lera = atom.Class({
   Implements: [ Drawable ],
   mspeed: 4,
   jspeed: 5,
   jheight: 50,
   stat: {'cake':0,'food':0,'slipper':0,'gift':0, 'post': 0},
   score: 0,
   lxp: 10,
   angle: 0,
   posts: World.config.posts,
   age: 1,
   xs: 0,
   ys: 90,
   level: 1,
   c: ['aup', 'adown','aleft','aright', 'space'],
   zIndex: 60,

  initialize: function(center) {
    if(center)
      this.center = new Point(center);

   this.drawEngines();
  },
  update: function(time) {
    var c = this.c;
    var key = this.libcanvas.getKey.bind(this.libcanvas);
    var s = key(c[2]) ? -1 : 1;

    if (key(c[2]) || key(c[3])) {
      this.rect.moveTo(this.center.move([s * this.mspeed,0]));
    }
    if(this.rect.to.x < 0)
      this.center.move([650,0])
    else if(this.rect.from.x > 650)
      this.center.move([-650,0])

    if (key(c[0]) && this.rect.to.y >= 400)
      this.jump = true;
    if(this.rect.to.y < 400 - this.jheight)
      this.jump = false

    if(key(c[0]) && key(c[2]))
      this.angle = -10;
    else if(key(c[0]) && key(c[3]))
      this.angle = 10;
    else
      this.angle = 0;

    

    if(this.jump)
      this.changeSprite('jump-up');
    else if(this.rect.to.y < 400)
      this.changeSprite('jump-down');
    else if(key(c[2]))
      this.changeSprite('run-left');
    else if(key(c[3]))
      this.changeSprite('run-right');
    else
      this.changeSprite('stay');

    if(this.jump)
      this.rect.moveTo(this.center.move([0,-this.jspeed]));
    else if(this.rect.to.y < 400)
      this.rect.moveTo(this.center.move([0,this.jspeed]));

  },
  draw: function () {
      this.libcanvas.ctx.lineWidth = 2;

      this.libcanvas.ctx.drawImage({
                          image : this.lera.sprite,
                          center: this.rect.center,
                          angle:  (this.angle).degree()
                        });
  },
  changeSprite: function (sprite) {
    if(this.currentAnimation != sprite) {
      this.currentAnimation = sprite;
      this.addEvent('libcanvasSet', function () {
        this.lera.stop(1)
                 .run(sprite);
      });
    }
  },
  drawEngines: function() {
    this.rect = new Rectangle( this.center.clone().move([0,0]),
                               this.center.clone().move([60,50]) );
    

    this.ground = new Line( new Point([0, 400]), new Point([750, 400]));

    this.addEvent('libcanvasSet', function () {
      var girl = this.libcanvas.getImage('girl');
      this.lera = new LibCanvas.Animation.Sprite()
				.addSprites({
                                              s1 : girl.sprite(  0, 0, 50, 60),
                                              s2 : girl.sprite(  50, 0, 50, 60),
                                              s3 : girl.sprite(  100, 0, 50, 60),
                                              ju1 : girl.sprite(  0, 60, 50, 60),
                                              ju2 : girl.sprite(  50, 60, 50, 60),
                                              ju3 : girl.sprite(  100, 60, 50, 60),
                                              jd1 : girl.sprite(  150, 60, 50, 60),
                                              rr1 : girl.sprite(  0, 180, 50, 60),
                                              rr2 : girl.sprite(  50, 180, 50, 60),
                                              rr3 : girl.sprite(  100, 180, 50, 60),
                                              rl1 : girl.sprite(  00, 120, 50, 60),
                                              rl2 : girl.sprite(  50, 120, 50, 60),
                                              rl3 : girl.sprite(  100, 120, 50, 60)
                                           })
                                .add({  name: 'stay',
                                        frames: [
                                           { sprite: 's2', delay:  2000 },
                                           { sprite: 's1', delay:  3000 },
                                           { sprite: 's2', delay:  2000 },
                                           { sprite: 's3', delay:  3000 }
                                        ],
					loop : true  })
                                .add({  name: 'jump-up',
                                        frames: [
                                            { sprite: 'ju3', delay:  15000 }
                                        ],
					loop : true  })
                                .add({  name: 'jump-down',
                                        frames: [
                                            { sprite: 'jd1', delay:  10000 }
                                        ],
					loop : true  })
                                .add({  name: 'run-right',
                                        frames: [
                                            { sprite: 'rr1', delay:  100 },
                                            { sprite: 'rr2', delay:  100 },
                                            { sprite: 'rr3', delay:  100 }
                                        ],
					loop : true  })
                                .add({  name: 'run-left',
                                        frames: [
                                            { sprite: 'rl1', delay:  100 },
                                            { sprite: 'rl2', delay:  100 },
                                            { sprite: 'rl3', delay:  100 }
                                        ],
					loop : true  })      ;
    });
  },
  increaseSpeed: function(s) {
    var lera = this;
    
    this.mspeed  += s;
    this.jspeed  += (s/2);
    this.jheight += (s*2);
     
    setTimeout(function() { 
      lera.mspeed  -= s;
      lera.jspeed  -= (s/2);
      lera.jheight -= (s*2);
    }, 6000)
    
  },

  decreaseSpeed: function(ms, js, jh, tl) {
    var lera = this;
    
    var ms_rest = this.mspeed  - ms <= 1 ? this.mspeed  > 1 ? this.mspeed  - 1 : 0 : ms;
    var js_rest = this.jspeed  - js <= 1 ? this.jspeed  > 1 ? this.jspeed  - 1 : 0 : js;
    var jh_rest = this.jheight - js <= 1 ? this.jheight > 1 ? this.jheight - 1 : 0 : jh;

    this.mspeed  -= ms_rest;
    this.jspeed  -= js_rest;
    this.jheight -= jh_rest;

    setTimeout(function() {
      lera.mspeed  += ms_rest;
      lera.jspeed  += js_rest;
      lera.jheight += jh_rest;
    }, 1000 * tl)

  },
  //Level engines

  newLevel: function (level, score) {
    this.level += level;
    this.newScore(0);

    $("#age").html(this.level); 
  },

  //Score engines
  countScore: function (sc) {
    this.newScore(this.score - sc < 0 && sc < 0 ? 0 : this.score + sc);

    return this.score - (this.lxp * this.level);
  },

  newScore: function (score) {
    this.score = !score ? 0 : score;

    this.drawScore();
  },

  drawScore: function () {
    var score = this.score > 0 ? (this.score / (this.lxp * this.level)) * 100 : 0;

    $("#score").progressbar({ value: Math.round(score) });
  },

  updateStat: function (name) {
    this.stat[name]++;

    $("#" + name).html(this.stat[name]);
  }

});