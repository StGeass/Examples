new function () {
  LibCanvas.extract();

  window.World = {
                  config: {
                    fps: 25,
                    boundsDistance: 30,
    //		showShapes: false,
                    canvasSize: {
                            width : 650,
                            height: 450
                    }
                  }
                };
   World.end = function (canvas) {

   };
   World.start = function (canvas) {
          var files = '';

          var world = new LibCanvas(canvas, {
                          fps: World.config.fps,
                          clear: true,
                          preloadImages: {
                                  girl: files + 'images/girl.png',
                                  pb1: files + 'images/pb1.gif',
                                  pb2: files + 'images/pb2.gif',
                                  gift: files + 'images/gift.gif',
                                  cake: files + 'images/cake.gif',
                                  troll: files + 'images/troll.gif',
                                  slipper: files + 'images/slipper.gif',
                                  f1: files + 'images/f1.gif',
                                  f2: files + 'images/f2.gif',
                                  f3: files + 'images/f3.gif',
                                  f4: files + 'images/f4.gif',
                                  post: files + 'images/k.gif'
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

  World.config.stuff = {
            slipper: {
              mins: 3,
              maxs: 6,
              score: 2
            },
            gift: {
              mins: 1,
              maxs: 5,
              score: 3
            },
            pb: {
              mins: 2,
              maxs: 3,
              score: -1
            },
            cake: {
              mins: 5,
              maxs: 7,
              score: 1000
            },
            troll: {
              mins: 3,
              maxs: 5,
              score: -10
            },
            food: {
              mins: 1,
              maxs: 5,
              score: 1,
              mood: 1
            },
            post: {
              mins: 1,
              maxs: 2,
              score: 25,
              mood: 5
            }

          };

  World.config.posts = [
    ['Анюта Гайдуковская', 'Лерочка, поздравляю тебя с этим чудестным праздником, с Днем рождения! Пусть твоя жизнь будет наполнена только радостью, удачей, любовью! Уверенно иди к своей цели, добивайся успеха, люби и будь любимой! А главное , желаю тебе по больше верных друзей, которые в любой момент смогут помочь тебе! Чмок!=))**'],
    ['Миша Вирютин', 'С днём рожденья поздравляю, счастья радости желаю'],
    ['Stanislav Opalenko', 'Лерка, поздровляю с днюхой)) Жэлаю всего самого яркого, красочного весёлого, мягкого, пушистого, золотистого.. и так даллее.. шоб па жизни всё было неШтяк и .. отставайся собой и добейся наконец то того чтобы я отдал тебе комбарик)))) с любовю Шпакунчик))))'],
    ['Carpe Diem(Галя)', 'Вітаю тебе з днюхою,Бажаю кохання великого, шаленого незабутнього. Щоб твої гарні очі і надалі приваблювали людей, і давали лише позитив. Будь гордістю своїх батьків. Бажаю, щоб вдача тобі допомагала йти до намічених цілей! Щоб ти завжди пила дорогі вина, адже наше життя надто коротке, щоб пити дешеві вина! Так що будь надією, щастям для усіх і бери від життя сповна!!!'],
    ['Adolf Hitler','Herzlichen Glückwunsch zum Geburtstag, nur wenn Sie nicht ein Jude!'],
    ['Jonny Craig', 'I really do not know who you are, but this guy gave me a lot of money, so "Happy Birthday"!']
    ['Михаил Шавилин','С днем рожденья, дорогая Светалана, желаю тебе... Что, не Светала? Лера? Ну все равно с днем рожденья, не жалко!']
  ];
};
