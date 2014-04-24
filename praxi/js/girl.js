World.Lera = atom.Class({
    Implements:[ Drawable, Animatable ],
    mspeed:5,
    hlimit:10,
    wlimit:10,
    stat:{},
    score:0,
    lxp:10,
    angle:0,
    age:1,
    xs:0,
    ys:0,
    level:1,
    c:['aup', 'adown', 'aleft', 'aright', 'space'],
    zIndex:60,

    initialize:function (center) {
        if (center)
            this.respown = new Point(center);
        else
            this.respown = new Point([0, 0]);

        this.drawEngines();
    },
    update:function (time) {
        var c = this.c;
        var key = this.libcanvas.getKey.bind(this.libcanvas);
        var move_to;

        if (key(c[0]))
            this.rect.move([0, -1 * this.mspeed]);
        else if (key(c[1]))
            this.rect.move([0, 1 * this.mspeed]);
        if (key(c[2])) {
            this.rect.move([-1 * this.mspeed, 0]);
        }
        else if (key(c[3])) {
            this.rect.move([1 * this.mspeed, 0]);
        }

        if (this.rect.to.x < -this.wlimit) {
            move_to = new Point({x:config.canvasSize.width + this.wlimit, y:this.rect.from.y});

            this.rect.moveTo(move_to, move_to.clone().move({x:25, y:30}));
        }
        else if (this.rect.from.x > config.canvasSize.width + this.wlimit) {
            move_to = new Point({x:-this.wlimit, y:this.rect.from.y});

            this.rect.moveTo(move_to, move_to.clone().move({x:25, y:30}));
        }
        if (this.rect.to.y < -this.hlimit) {
            move_to = new Point({x:this.rect.from.x, y:config.canvasSize.height + this.hlimit});

            this.rect.moveTo(move_to, move_to.clone().move({x:25, y:30}));
        }
        else if (this.rect.from.y > config.canvasSize.height + this.hlimit) {
            move_to = new Point({x:this.rect.from.x, y:-this.hlimit});

            this.rect.moveTo(move_to, move_to.clone().move({x:25, y:30}));
        }

        if (key(c[0]) && key(c[2]))
            this.angle = -15;
        else if (key(c[0]) && key(c[3]))
            this.angle = 15;
        else if (key(c[1]) && key(c[2]))
            this.angle = 15;
        else if (key(c[1]) && key(c[3]))
            this.angle = -15;
        else
            this.angle = 0;


        if (key(c[0]))
            this.changeSprite('run-up');
        else if (key(c[1]))
            this.changeSprite('run-down');
        else if (key(c[2]))
            this.changeSprite('run-left');
        else if (key(c[3]))
            this.changeSprite('run-right');
        else
            this.changeSprite('stay');
    },
    draw:function () {
        this.libcanvas.ctx.lineWidth = 2;

        this.libcanvas.ctx.drawImage({
            image:this.lera.sprite,
            center:this.rect.center,
            angle:(this.angle).degree()
        });
    },
    changeSprite:function (sprite) {
        if (this.currentAnimation != sprite) {
            this.currentAnimation = sprite;
            this.addEvent('libcanvasSet', function () {
                this.lera.stop(1).run(sprite);
            });
        }
    },
    drawEngines:function () {
        this.rect = new Rectangle(this.respown.clone(), this.respown.clone().move({x:25, y:30}));

        this.addEvent('libcanvasSet', function () {
            var girl = this.libcanvas.getImage('girl');
            this.lera = new LibCanvas.Animation.Sprite()
                .addSprites({
                    mu1:girl.sprite(0, 0, 40, 40),
                    su:girl.sprite(40, 0, 40, 40),
                    mu2:girl.sprite(80, 0, 40, 40),
                    mr1:girl.sprite(0, 40, 40, 40),
                    sr:girl.sprite(40, 40, 40, 40),
                    mr2:girl.sprite(80, 40, 40, 40),
                    ml1:girl.sprite(0, 80, 40, 40),
                    sl:girl.sprite(40, 80, 40, 40),
                    ml2:girl.sprite(80, 80, 40, 40),
                    md1:girl.sprite(0, 120, 40, 40),
                    sd:girl.sprite(40, 120, 40, 40),
                    md2:girl.sprite(80, 120, 40, 40)
                })
                .add({  name:'stay',
                    frames:[
                        { sprite:'sd' }
                    ],
                    loop:true  })
                .add({  name:'run-up',
                    frames:[
                        { sprite:'mu1', delay:200 },
                        { sprite:'su', delay:100 },
                        { sprite:'mu2', delay:200 }
                    ],
                    loop:true  })
                .add({  name:'run-down',
                    frames:[
                        { sprite:'md1', delay:200 },
                        { sprite:'sd', delay:100 },
                        { sprite:'md2', delay:200 }
                    ],
                    loop:true  })
                .add({  name:'run-right',
                    frames:[
                        { sprite:'mr1', delay:200 },
                        { sprite:'sr', delay:300 }
                    ],
                    loop:true  })
                .add({  name:'run-left',
                    frames:[
                        { sprite:'ml1', delay:200 },
                        { sprite:'sl', delay:300 }
                    ],
                    loop:true  });
        });
    },
    increaseSpeed:function (s) {
        var lera = this;

        this.mspeed += s;
        this.jspeed += (s / 2);
        this.jheight += (s * 2);

        setTimeout(function () {
            lera.mspeed -= s;
            lera.jspeed -= (s / 2);
            lera.jheight -= (s * 2);
        }, 6000)

    },

    decreaseSpeed:function (ms, js, jh, tl) {
        var lera = this;

        var ms_rest = this.mspeed - ms <= 1 ? this.mspeed > 1 ? this.mspeed - 1 : 0 : ms;
        var js_rest = this.jspeed - js <= 1 ? this.jspeed > 1 ? this.jspeed - 1 : 0 : js;
        var jh_rest = this.jheight - js <= 1 ? this.jheight > 1 ? this.jheight - 1 : 0 : jh;

        this.mspeed -= ms_rest;
        this.jspeed -= js_rest;
        this.jheight -= jh_rest;

        setTimeout(function () {
            lera.mspeed += ms_rest;
            lera.jspeed += js_rest;
            lera.jheight += jh_rest;
        }, 1000 * tl)

    },

    //Level engines
    newLevel:function (level, score) {
        this.level += level;
        this.newScore(0);
    },

    //Score engines
    countScore:function (sc) {
        this.newScore(this.score - sc < 0 && sc < 0 ? 0 : this.score + sc);

        return this.score - (this.lxp * this.level);
    },

    newScore:function (score) {
        this.score = !score ? 0 : score;

        this.drawScore();
    },

    drawScore:function () {
        var score = this.score > 0 ? (this.score / (this.lxp * this.level)) * 100 : 0;
    },

    updateStat:function (name) {
        this.stat[name]++;
    }

});