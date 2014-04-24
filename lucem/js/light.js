var width = 869;
var height = 350;

LibCanvas.extract();

atom.dom(function () {
    var lightsApp = new App({
        size: new Size(width, height),
        invoke: true,
        appendTo: '#lightsApp'
    });

    var omniLayer = lightsApp.createLayer({ intersection: 'full', name: 'omni', zIndex: 2});
    var lightsLayer = lightsApp.createLayer({ intersection: 'full', name: 'light', zIndex: 1});

    omniLayer.dom.size = new Size(834, 311);


    var startPoint = 50;

    atom.ImagePreloader.run({
            s_light: 'images/s_light.png',
            m_light: 'images/m_light.png',
            h_light: 'images/h_light.png',
            omni: 'images/omni.png',
            reflection: 'images/reflection.png'
        },
        function (images) {

            var cursor = new Point([0, 0]);
            var mouse = new LibCanvas.Mouse(lightsLayer.dom.container.bounds);
            var globalOpacity;

            mouse.events.add({
                move: function () {
                    cursor.set(this.point);

                    globalOpacity = true;
                },
                out: function () {

                    globalOpacity = false;
                    console.log('out');
                },
                over: function () {
                    console.log('out');
                }
            });

            var Light = atom.declare(App.Element, {
                configure: function () {
                    this.status = 'o';
                    this.i = this.settings.values.i;
                    this.point = this.settings.values.point;
                    this.oPos = this.point.clone();
                    if (this.i == 0) {
                        this.reversePoint = new LibCanvas.Point([0, 0]);
                    }
                    this.gI = this.settings.values.gI;
                    this.oOpacity = this.settings.values.opacity;
                    this.opacity = this.settings.values.opacity;
                    this.angle = this.i === 0 ? atom.math.degree(atom.number.random(0, 360)) : 0
                },
                checkDistance: function (point, distance) {
                    return ((point < distance && point) || (point > -distance && point < 0));
                },
                onUpdate: function (time) {
                    var x, y, ratio;
                    var distance = this.oPos.distanceTo(this.settings.values.cursor);

                    if (globalOpacity) {
                        if (distance < 190) {
                            var diff = this.oPos.diff(this.settings.values.cursor);

                            if (this.i > 0) {
                                var moveTo = [0, 0];
                                var lightStep;

                                if (distance < 31) {
                                    lightStep = ((this.i * 3.3 ) / 30) * distance;
                                }
                                else {
                                    lightStep = this.i * 3.3;
                                }

                                if (diff.x > diff.y && diff.y != 0 && diff.x != 0) {
                                    ratio = diff.x / diff.y;

                                    x = lightStep;
                                    y = lightStep / ratio;
                                }
                                else if (diff.x < diff.y && diff.x != 0 && diff.y != 0) {
                                    ratio = diff.y / diff.x;

                                    y = lightStep;
                                    x = lightStep / ratio;
                                }
                                else {
                                    x = diff.x ? lightStep : 0;
                                    y = diff.y ? lightStep : 0;
                                }

                                if ((x > 0 && x > lightStep) || (x < 0 && x < lightStep * -1)) {
                                    ratio = -diff.x / -diff.y;

                                    x = lightStep;
                                    y = lightStep / ratio;
                                }
                                else if ((y > 0 && y > lightStep) || (y < 0 && y < lightStep * -1)) {
                                    ratio = -diff.y / -diff.x;

                                    y = lightStep;
                                    x = lightStep / ratio;
                                }
                                else {
                                    x *= -1;
                                    y *= -1;
                                }

                                if (ratio === undefined && ((diff.x <= 0 || diff.y <= 0) && diff.x === diff.y) || diff.x == 0 && diff.y <= 0 || diff.y == 0 && diff.x <= 0) {
                                    x *= -1;
                                    y *= -1;
                                }

                                moveTo[0] = Math.round(this.oPos.x + x);
                                moveTo[1] = Math.round(this.oPos.y + y);

                                this.point.moveTo([
                                    moveTo[0], moveTo[1]
                                ]);

                                if (distance < 130) {
                                    var lightPower = -(distance - 160);
                                    this.opacity = (this.oOpacity / 100) * (lightPower > 100 ? 100 : lightPower);
                                }
                                else {
                                    this.opacity = 0;
                                }
                            }
                            else if (this.i < 0) {
                                if (distance < 260) {
                                    var lightPower = -(distance - 210);
                                    this.opacity = (0.7 / 200) * (lightPower > 200 ? 200 : lightPower);
                                }
                                else {
                                    this.opacity = 0;
                                }
                            }

                            this.redraw();
                        }
                        else if (this.i !== 0 && this.opacity) {
                            this.opacity = 0;

                            this.redraw();
                        }
                    }
                    else if (this.i !== 0 && this.opacity) {
                        this.opacity = 0;

                        this.redraw();
                    }
                },
                renderTo: function (ctx, resources) {
                    ctx.drawImage({
                        image: this.settings.values.image,
                        from: this.point,
                        angle: this.angle
                    });
                }
            });

            var LightController = atom.declare(App.Element, {
                configure: function () {
                },
                onUpdate: function (time) {
                    this.redraw();
                },
                renderTo: function (ctx, resources) {
                    ctx.drawImage({
                        image: this.settings.values.image,
                        center: this.settings.values.point,
                        angle: this.angle
                    });
                }
            });

            var LightReflection = atom.declare(App.Element, {
                configure: function () {
                    this.point = new Point(this.getCoords());

                    this.angle = this.getAngle();
                },
                getAngle: function () {
                    if (this.settings.values.side === 'bottom') {
                        return atom.math.degree(0);
                    }
                    else if (this.settings.values.side === 'top') {
                        return atom.math.degree(180);
                    }
                    else if (this.settings.values.side === 'left') {
                        return atom.math.degree(90);
                    }
                    else if (this.settings.values.side === 'right') {
                        return atom.math.degree(-90);
                    }
                },
                getCoords: function () {
                    if (this.settings.values.side === 'bottom') {
                        return[
                            cursor.x - 20, 280.5
                        ];
                    }
                    else if (this.settings.values.side === 'top') {
                        return[
                            cursor.x - 20, 30.5
                        ];
                    }
                    else if (this.settings.values.side === 'left') {
                        return[
                            30.5, cursor.y - 20
                        ];
                    }
                    else if (this.settings.values.side === 'right') {
                        return[
                            803.5, cursor.y - 20
                        ];
                    }
                },
                onUpdate: function (time) {
                    if (globalOpacity) {
                        this.point.moveTo(this.getCoords())

                        var distance = this.point.distanceTo(cursor);

                        if (distance < 170) {
                            var lightPower = -(distance - 170);
                            this.opacity = (0.8 / 100) * (lightPower > 100 ? 100 : lightPower);

                            this.redraw();
                        }
                        else if (this.opacity) {
                            this.opacity = 0;

                            this.redraw();
                        }
                    }
                    else if (this.opacity) {
                        this.opacity = 0;

                        this.redraw();
                    }
                },
                renderTo: function (ctx, resources) {
                    ctx.drawImage({
                        image: this.settings.values.image,
                        center: this.point,
                        angle: this.angle
                    });
                }
            });

            var omni = new LightController(omniLayer, {
                point: cursor,
                image: images.get('omni'),
                opacity: 1
            });

            var bottomReflection = new LightReflection(omniLayer, {
                side: 'bottom',
                image: images.get('reflection'),
                opacity: 1
            });

            var topReflection = new LightReflection(omniLayer, {
                side: 'top',
                image: images.get('reflection'),
                opacity: 1
            });

            var leftReflection = new LightReflection(omniLayer, {
                side: 'left',
                image: images.get('reflection'),
                opacity: 1
            });

            var rightReflection = new LightReflection(omniLayer, {
                side: 'right',
                image: images.get('reflection'),
                opacity: 1
            });


            for (var ci in coords) {
                var x = coords[ci][0];
                var y = coords[ci][1];

                if (x && y && (x > 250 && x < 500)) {
                    for (var i = -1; i <= 15; i++) {
                        new Light(lightsLayer, {
                            cursor: cursor,
                            i: i,
                            zIndex: i + 1,
                            gI: x + '-' + y + '-' + i,
                            image: images.get(i < 1 ? i < 0 ? 'm_light' : 'h_light' : 's_light'),
                            point: new Point([x + startPoint, y + startPoint]),
                            opacity: i > 0 ? (1 / (i + 3 / (60 / 100) - 1) * 100) / 100 : i < 0 ? 0 : 1
                        });
                    }
                }
            }
        });
});