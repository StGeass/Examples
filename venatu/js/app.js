'use strict';

declare('Sg.Controller', {
    settings: {
        showShapes: false,
        aimSize: 16,
        enemySize: 14,
        targetSize: 16,
        fieldSize: new Size(640, 640)
    },

    level: 0,

    shields: 0,

    score: {
        best: 0,
        current: 0,
        rabbits: 0,
        add: {
            perLevel: 5
        }
    },

    initialize: function () {
        this.settings = new Settings(this.settings);

        this.app = new LibCanvas.App({
            appendTo: '#canvas',
            size: this.settings.get('fieldSize'),
            simple: true
        });
        this.layer = this.app.createLayer({
            intersection: 'all',
            invoke: true
        });

        this.mouse = new LibCanvas.Mouse(this.app.container.bounds);
        this.mouseHandler = new LibCanvas.App.MouseHandler({ app: this.app, mouse: this.mouse });

        var imagesList = {
            aim: 'images/aim.png',
            target: 'images/rabbit.gif',
            torch: 'images/torch.png',
            fire: 'images/fire.png',
            wolf: 'images/wolf.png',
            wolf_2: 'images/wolf_2.png'};

        atom.ImagePreloader.run(imagesList, this.run, this);

        this.fpsMeter();
    },

    fpsMeter: function () {
        var fps = atom.trace(), time = [], last = Date.now();

        atom.frame.add(function () {
            if (time.length > 5) time.shift();

            time.push(Date.now() - last);
            last = Date.now();

            fps.value = Math.ceil(1000 / time.average()) + " FPS";
        });
    },

    get randomFieldPoint() {
        return this.fieldRectangle.shape.getRandomPoint(50);
    },

    run: function (images) {
        var _ = this;

        this.app.resources.set('images', images);

        this.fieldRectangle = new Sg.Field(this.layer, {
            controller: this,
            shape: new Rectangle({
                from: new Point(0, 0),
                size: this.settings.get('fieldSize')
            })
        });

        this.aim = new Sg.Aim(this.layer, {
            images: {
                aim: images.get('aim'),
                fire: images.get('fire'),
                torch: images.get('torch')
            },
            controller: this,
            shape: new Circle(new Point(-100, -100), this.settings.get('aimSize'))
        });

        this.target = new Sg.Target(this.layer, {
            image: images.get('target'),
            controller: this,
            shape: new Circle(this.randomFieldPoint, this.settings.get('aimSize'))
        });

        this.mouseHandler.subscribe(this.fieldRectangle);

        this.fieldRectangle.events.add('mousemove', function (e) {
            _.aim.moveTo({
                x: e.hasOwnProperty('offsetX') ? e.offsetX : e.layerX,
                y: e.hasOwnProperty('offsetY') ? e.offsetY : e.layerY
            });

            if (_.aim.shape.center.distanceTo(_.target.shape.center) <= _.aim.shape.radius - 4) {
                if (!_.level) {
                    _.startGame();
                }

                _.target.moveTo(_.randomFieldPoint);

                _.levelUp(1);
                _.addScore(15);
                _.addRabbit(1);
                _.addShields(1);
                _.createEnemy();

                if (_.level % 6 === 0) {
                    _.changeEnemiesVector();
                }
                if (_.level % 4 === 0) {
                    _.chargeEnemiesVector();
                }
                2

            }
        });

        this.fieldRectangle.events.add('mousedown', function (e) {
            e.preventDefault();

            switch (e.which) {
                case 1:
                    if (_.shields >= 2) {
                        _.addShields(-2);
                        _.aim.activateShield(1);
                    }
                    else {
                        _.levelUp(2);
                        _.removeScore(5);
                    }
                    break;
                default:
                    if (_.shields >= 3) {
                        _.addShields(-3);
                        _.aim.activateShield(2);
                    }
                    else {
                        _.levelUp(4);
                        _.removeScore(15);
                    }
            }
        });

        this.fieldRectangle.events.add('contextmenu', function (e) {
            e.preventDefault();
        });
    },

    levelUp: function (level) {
        this.level += level;
    },

    addShields: function (shields) {
        this.shields += shields;

        this.updateScoresInfo();
    },

    addScore: function (score) {
        this.score.current += score + this.score.add.perLevel * this.level;

        this.updateScoresInfo();
    },

    addRabbit: function (score) {
        this.score.rabbits += score;

        this.updateScoresInfo();
    },

    removeScore: function (score) {
        this.score.current -= score;

        this.score.current = this.score.current < 0 ? 0 : this.score.current;

        this.updateScoresInfo();
    },

    createEnemy: function () {
        var point = this.randomFieldPoint;

        this.enemies.push(new Sg.Enemy(this.layer, {
            images: [
                this.app.resources.items.images.get('wolf'),
                this.app.resources.items.images.get('wolf_2'),
            ],
            controller: this,
            shape: new Circle(this.randomFieldPoint, this.settings.get('enemySize'))
        }));
    },

    changeEnemiesVector: function () {
        this.enemies.forEach(function (item) {
            item.vector.x *= -1;
            item.vector.y *= -1;
        });
    },

    chargeEnemiesVector: function () {
        var _ = this;

        this.enemies.forEach(function (item, index) {
            if (index % 2 === 0) {
                var diff = item.shape.center.diff(_.aim.shape.center);

                item.vector = {
                    x: diff.x > 0 ? 1 : -1,
                    y: diff.y > 0 ? 1 : -1
                }
            }
        });
    },

    startGame: function () {
        atom.dom('.hint').css('display', 'none');

        this.level = 1;
        this.score.current = 0;

        this.enemies = [];

        this.updateScoresInfo();
    },

    stopGame: function () {
        this.enemies.forEach(function (item) {
            item.destroy();
        });

        if (this.score.current > this.score.best) {
            this.score.best = this.score.current;
        }

        this.level = 0;
        this.shields = 0;
        this.score.current = 0;

        this.updateScoresInfo();
    },

    updateScoresInfo: function () {
        atom.dom('.shields').text(this.shields);

        atom.dom('.scores').text(this.score.rabbits + ' / ' + this.score.current);
        atom.dom('.best_scores').text(this.score.best);
    }

});

declare('Sg.Field', App.Element, {
    renderTo: function (ctx) {
        ctx.stroke(this.shape, 'red');
    }
});

declare('Sg.Element', App.Element, {
    moveTo: function (coords) {
        this.shape.center.x = coords.x;
        this.shape.center.y = coords.y;
        this.redraw();
    },
    renderTo: function (ctx) {
        ctx.drawImage({
            image: this.settings.values.image,
            center: this.shape.center
        });
    }
});

declare('Sg.Aim', Sg.Element, {
    shield: 0,
    shieldInstance: null,
    activateShield: function (shield) {
        var _ = this;

        _.shield = shield;

        clearTimeout(_.shieldInstance);

        _.shieldInstance = setTimeout(function () {
            _.shield = 0;
        }, shield === 1 ? 1500 : 2000)
    },
    renderTo: function (ctx) {
        if (this.shield) {
            ctx.drawImage({
                image: this.settings.values.images[this.shield == 1 ? 'torch' : 'fire'],
                center: this.shape.center
            });
        }

        ctx.drawImage({
            image: this.settings.values.images.aim,
            center: this.shape.center
        });
    }
});

declare('Sg.Target', Sg.Element, {});

declare('Sg.Enemy', App.Element, {
    frozen: false,
    frozenInstance: null,
    configure: function () {
        this.speed = {x: atom.number.random(1, 4), y: atom.number.random(1, 4)};
        this.vector = {x: atom.array.random([-1, 1]), y: atom.array.random([-1, 1])};
        this.controller = this.settings.values.controller;

        this.updateShape();
    },
    updateShape: function () {
        this.image = this.settings.values.images[(this.vector.x > 0 ? 1 : 0)];

        this.angle = atom.math.degree(45 * this.vector.y * this.vector.x);

        return this;
    },
    onUpdate: function () {
        var _ = this;

        if (this.shape.center.x + this.shape.radius >= this.controller.settings.values.fieldSize.x) {
            this.vector.x = -1;
        } else if (this.shape.center.x - this.shape.radius < 0) {
            this.vector.x = 1;
        }

        if (this.shape.center.y + this.shape.radius >= this.controller.settings.values.fieldSize.y) {
            this.vector.y = -1;
        } else if (this.shape.center.y - this.shape.radius <= 0) {
            this.vector.y = 1;
        }

        if (this.controller.aim.shield) {
            if (this.controller.aim.shape.center.distanceTo(this.shape.center) <= this.controller.aim.shape.radius * 2) {
                _.frozen = true;

                clearTimeout(_.frozenInstance);

                _.frozenInstance = setTimeout(function () {
                    _.frozen = false;
                }, 1500)
            }
        }
        else if (this.controller.aim.shape.center.distanceTo(this.shape.center) <= this.controller.aim.shape.radius) {
            this.controller.stopGame();
        }

        var speed = {
            x: Math.round((this.speed.x + this.controller.level / 3) * this.vector.x),
            y: Math.round((this.speed.y + this.controller.level / 3) * this.vector.y)
        }

        if (this.frozen) {
            speed.x = Math.round(speed.x / 3) * -1;
            speed.y = Math.round(speed.y / 3) * -1;
        }
        else if (this.controller.aim.shield == 2) {
            speed.x = Math.round(speed.x / 2);
            speed.y = Math.round(speed.y / 2);
        }


        this.shape.move(new Point(speed.x, speed.y));

        this.updateShape().redraw();
    },
    renderTo: function (ctx) {
        ctx.drawImage({
            image: this.image,
            center: this.shape.center,
            angle: this.angle
        });
    }
});
