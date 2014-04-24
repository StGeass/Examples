var width = 750;
var height = 360;

LibCanvas.extract();

atom.dom(function () {
    var density = 9;
    var colors = ["#1bb0e1", "#88ebfd", "#1bb0e1", "#1bb0e1"];

    LibCanvas.extract();

    var app = new App({ size: new Size(width, height), appendTo: '#bubblesApp', simple: true, invoke: false});
    var mainLayer = app.createLayer({ name: 'main'});
    var mouse = new Mouse(app.container.bounds);
    var mouseHandler = new App.MouseHandler({ app: app, mouse: mouse });

    var Bubble = atom.declare(App.Element, {
        status: 'waiting',
        originalShape: [],
        configure: function () {
            var self = this;

            this.color = atom.array.random(colors);
            this.animate = new atom.Animatable(this).animate;

            mouseHandler.subscribe(this);

            this.events.add('mouseover', function (e) {
                if (self.status == 'waiting') {
                    self.start();
                }
            });
        },
        start: function () {
            var self = this;

            this.status = 'started';

            this.originalShape = [this.shape.center.x, this.shape.center.y, this.shape.radius];

            this.animate({
                props: {
                    'shape.center.x': this.shape.center.x + atom.number.random(-30, 30),
                    'shape.center.y': -15,
                    'shape.radius': 10,
                    'opacity': 0
                },
                time: 1000,
                onTick: this.redraw,
                onComplete: function () {
                    setTimeout(function () {
                        self.shape.center.x = self.originalShape[0];
                        self.shape.center.y = self.originalShape[1];
                        self.shape.radius = self.originalShape[2];
                        self.status = 'waiting';

                        self.animate({
                            props: {
                                'opacity': 1
                            },
                            time: 2000,
                            onTick: self.redraw
                        });
                    }, atom.number.random(60, 70) * 1000);
                }

            });
        },
        renderTo: function (ctx, resources) {
            ctx.fill(this.shape, this.color);
        }
    });

    for (var key in coords) {
        if (coords[key][0] > 250 && coords[key][0] < 500) {
            new Bubble(mainLayer, {
                shape: new Circle(new Point(coords[key][0], coords[key][1]), atom.number.random(2.7, 3.2))
            });
        }
    }
});