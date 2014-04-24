new function () {
    LibCanvas.extract();

    window.World = {
        config: {
            fps: 25,
            boundsDistance: 30,
            showShapes: false,
            canvasSize: {
                width: 1024,
                height: 600
            },
            wind: {
                speed: 5,
                current: 0,
                vector: {x: 0, y: 0},
                list: [
                    1 << 1,
                    1 << 2,
                    1 << 3,
                    1 << 4,
                    1 << 1 | 1 << 2,
                    1 << 1 | 1 << 4,
                    1 << 3 | 1 << 2,
                    1 << 3 | 1 << 4
                ]
            },
            clouds: {
                common: {
                    mins: 3,
                    maxs: 6,
                    score: 2
                },
                storm: {
                    mins: 1,
                    maxs: 5,
                    score: 3
                },
                rain: {
                    mins: 2,
                    maxs: 3,
                    score: -1
                }
            }
        }
    };

    window.config = World.config;

    World.start = function (canvas) {
        var files = '';

        var world = new LibCanvas(canvas, {
            fps: World.config.fps,
            clear: true,
            preloadImages: {
                girl: files + 'images/girl.png',
                cloud: files + 'images/cloud.png'
            }
        })
            .size(World.config.canvasSize, true)
            .listenKeyboard([
                'aup', 'adown', 'aleft', 'aright', 'space'
            ])
            .addEvent('ready', function () {
                new World.Controller(this);
            })
            .start();
    };

    World.end = function (canvas) {
    };
};
