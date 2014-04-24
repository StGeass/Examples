World.Controller = atom.Class({
    Implements:[LibCanvas.Invoker.AutoChoose],

    initialize:function (libcanvas) {
        this.libcanvas = libcanvas;

        this.cloud = [];
        this.count = 16;
        this.addCloud = this.addCloud.bind(this);

        this.start();
    },

    start:function () {
        this.invoker.addFunction(10, this.update.bind(this));

        this.lera = new World.Lera([World.config.canvasSize.width / 2, World.config.canvasSize.height / 2]);

        this.libcanvas.addElement(this.lera);

        this.defineWind().createCloud();
    },

    update:function (time) {
        if (this.lera.level < 18) {
            this.cloud.invoke('update', time);

            this.lera.update(time);

            this.checkCollisions();

            this.libcanvas.update();
        }
        else {
            $('#canvas').hide();
            $('#ehb').fadeIn();
        }

    },

    createCloud:function () {
        this.addCloud(new World.Cloud(this.lera));
        var controller = this;

        if (this.count > 1) {
            this.count--;

            setTimeout(function () {
                controller.createCloud();
            }, 1000);
        }

        return this;
    },

    addCloud:function (cloud) {
        this.cloud.push(cloud);
        this.libcanvas.addElement(cloud);
    },

    defineWind:function () {
        config.wind.current = config.wind.list.random;

        if (config.wind.current & (config.wind.list[1] | config.wind.list[3])) {
            if (config.wind.current & config.wind.list[1])
                config.wind.vector.x -= config.wind.speed;
            else
                config.wind.vector.x += config.wind.speed;
        }

        if (config.wind.current & (config.wind.list[0] | config.wind.list[2])) {
            if (config.wind.current & config.wind.list[2])
                config.wind.vector.y -= config.wind.speed;
            else
                config.wind.vector.y += config.wind.speed;
        }

        return this;
    },

    checkCollisions:function () {
        var lera = this.lera.rect;

        for (var i = this.cloud.length; i--;) {
            if (lera.intersect(this.cloud[i].rect)) {
                if (this.libcanvas.getKey('space'))
                    this.touchCloud(this.cloud[i]);
            }
            else {

            }
        }
        return this;
    },

    touchCloud:function (cloud) {
        var destroy = true;

        this.checkScore(cloud)

        if (cloud.id == 'rain')
            this.lera.increaseSpeed(10);
        else if (cloud.id == 'storm')
            this.lera.decreaseSpeed(1, 1, 0, 10);

        if (destroy && !cloud.behavior) this.destroyCloud(cloud);
    },

    destroyCloud:function (cloud) {
        cloud.animation.stop();
        this.cloud.erase(cloud);
        this.libcanvas.rmElement(cloud);
        return this;
    },

    checkScore:function (s) {
        this.lera.updateStat(s.id);

        var sc = s.id == 'troll' ? Number.random(-1, 1) * s.score : s.score;
        var score = this.lera.countScore(sc);

        if (score >= 0)
            this.lera.newLevel(1);

        return this;
    }

});