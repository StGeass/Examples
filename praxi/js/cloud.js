new function () {
    World.Cloud = atom.Class({
        Implements:[ Drawable, Animatable ],
        zIndex:61,
        hlimit:50,
        wlimit:50,
        icfg:[],
        speed:1,
        finished:0,

        initialize:function (enemy) {
            this.enemy = enemy;

            this.sides = {
                2:new Point(config.canvasSize.width / 2, config.canvasSize.height * 1.5),
                4:new Point(-config.canvasSize.width / 2, config.canvasSize.height / 2),
                8:new Point(config.canvasSize.width / 2, -config.canvasSize.height / 2),
                16:new Point(config.canvasSize.width * 1.5, config.canvasSize.height / 2)
            }
            this.sides[6] = new Line(this.sides[2], this.sides[4]);
            this.sides[18] = new Line(this.sides[16], this.sides[2]);
            this.sides[12] = new Line(this.sides[4], this.sides[8]);
            this.sides[24] = new Line(this.sides[8], this.sides[16]);

            this.defineCloud(1)
                .drawEngines()
                .respown();
        },
        update:function (time) {
            this.libcanvas.update();
        },
        respown:function () {
            var cloud = this;
            var width = config.canvasSize.width;
            var height = config.canvasSize.height;
            var point = {x:0, y:0};
            var finish = {x:0, y:0};

            if (this.animation)
                this.animation.stop();

            if (config.wind.current & (config.wind.list[1] | config.wind.list[3])) {
                if (config.wind.current & config.wind.list[1])
                    point.x = Number.random(width / 2, width * 1.5);
                else
                    point.x = Number.random(-width / 2, width / 2);
            }
            else {
                point.x = Number.random(this.wlimit, width - this.wlimit);

                finish = {
                    x:point.x,
                    y:((config.wind.current & config.wind.list[2]) ? this.sides[8] : this.sides[2]).y
                }
            }

            if (config.wind.current & (config.wind.list[0] | config.wind.list[2])) {
                if (config.wind.current & config.wind.list[2])
                    point.y = Number.random(point.x > 0 && point.x < width ? height : height / 2, height * 1.5);
                else
                    point.y = Number.random(-height / 2, point.x > 0 && point.x < width ? 0 : height / 2);
            }
            else {
                point = {
                    y:Number.random(15, config.canvasSize.height - 15),
                    x:((config.wind.current & config.wind.list[1]) ? this.sides[16] : this.sides[4]).x
                }

                finish = {
                    x:((config.wind.current & config.wind.list[1]) ? this.sides[4] : this.sides[16]).x,
                    y:point.y
                }
            }

            if (!finish.x && !finish.y)
                finish = this.sides[config.wind.current].perpendicular(new Point(point)).toObject();

            this.rect.moveTo(new Rectangle(new Point(point), new Point(point).move({x:40, y:40})));

            this.animation = new Animatable(this.rect).animate({
                props:finish,
                time:100000 / config.wind.speed,
                onFinish:function () {
                    cloud.respown();
                }
            });
        },
        draw:function () {
            if (this.image)
                this.libcanvas.ctx.drawImage({
                    image:this.image,
                    center:this.rect.center
                });
        },
        drawEngines:function () {
            this.rect = new Rectangle(new Point(0, 0), new Point(0, 0));

            this.addEvent('libcanvasSet', function () {
                if (this.id == 'common')
                    this.image = this.libcanvas.getImage('cloud');
                if (this.id == 'storm')
                    this.image = this.libcanvas.getImage('storm_cloud');
            });

            return this;
        },

        defineCloud:function (n) {
            if (1 === n)
                this.id = 'common';

            return this;
        }

    });
}