'use strict';

/*
 * Код можно было бы сократить раза в полтора,
 * написание было с учётом гипотетического расширения
 * возможностей функционала виджета в будущем, как это часто бывает
 * в реальности, поэтому в некоторых частях его код намереннно избыточен
 * P.S.
 * В части кода которые касаются селектов жуткая каша: Собирался реализовать
 * интересную систему зависимостей между селектами, с бесконечной вложенностью
 * и автообновлением, но неправильно начал, а переделывать времени нету, так что что есть.
 * */



// Ограничим область видимости нашего виджета, и передадим ему window как внутренний контекст

(function () {
    // Объект для управления историей с фиксацией location.hash
    // По хорошему для этого есть HTML5 History API
    // Но ведь мы поддерживаем IE. да?
    // А зря! Пользователи IE < 9 должны страдать, заслужили :)
    var history = {
        prev: '',

        get: function () {
            return window.location.hash.replace(/#!\//, '');
        },

        push: function (state) {
            this.prev = window.location.hash;

            this.change('!/' + state)
        },

        change: function (state) {
            window.location.hash = state;
        },

        clear: function () {
            this.change('')
        },

        back: function () {
            this.change(this.prev)

            this.prev = '';
        }
    };

    // Объект-хелпер для подписки на события с поддержкой < IE 9
    var event = {
        subscribe: function (element, eventsNames, callback, context) {
            // Флаг для костылей по IE
            var isAddEventSupport = typeof(element.attachEvent) !== 'funсtion';

            var eventPrefix = isAddEventSupport ? '' : 'on';
            var eventMethod = isAddEventSupport ? 'addEventListener' : 'attachEvent';

            if ('string' === typeof eventsNames) {
                eventsNames = [eventsNames];
            }

            // Вызываем callback для каждого события, передаём ему контекст и event object
            for (var i in eventsNames) {
                element[eventMethod](eventPrefix + eventsNames[i], function (e) {
                    callback.call(context, e);
                });
            }
        },

        // Препятствуем стандартному обработчику события
        preventDefault: function (e) {
            if (e.preventDefault)
                e.preventDefault();
            else // Привет IE
                e.returnValue = false;
        }
    };

    // Объект-хелпер для работы с JSONP
    // Костыль для именования анонимной функции, лень поднимать на бекенде нормальный ответ
    var request = {
        registry: null,
        sendTo: function (url, callbackName, successCallback) {
            var currentRequestStatus = 'failed';

            if (!window.jsonpRegistry) {
                this.registry = window.jsonpRegistry = {};
            }

            var baseUrl = 'https://bitbucket.org/StGeass/examples/raw/fde12a68feb137792820275188d6a75820388943/';

            url = baseUrl + url;
            url += ~url.indexOf('?') ? '&' : '?';
            url += 'callback=jsonpRegistry.' + callbackName;

            this.registry[callbackName] = function (data) {
                currentRequestStatus = 'success';
                delete request.registry[callbackName];
                successCallback(data);
            };

            function checkCallback() {
                if ('success' === currentRequestStatus) return;
                delete request.registry[callbackName];
                throw new Error('JSONP Reuqest failed: ' + url);
            }

            var script = document.createElement('script');

            script.onreadystatechange = function () {
                if (this.readyState == 'complete' || this.readyState == 'loaded') {
                    this.onreadystatechange = null;
                    setTimeout(checkCallback, 0);
                    document.body.removeChild(script);
                }
            }

            script.onload = script.onerror = checkCallback;
            script.src = url;

            document.body.appendChild(script);
        }
    }

    function Widget (formId, tableId) {
        // Объект формы
        var form = {
            // Все элементы формы, их параметры и правила для валидации
            elements: {
                name: {type: ['input', 'text'], rule: /[а-яА-Я]/g},
                email: {type: ['input', 'email'], rule: /[a-zA-Z._\-@]/g},
                phone: {type: ['input', 'tel'], rule: /[0-9,.\(\)\-\+]/g},
                country: {
                    type: ['select', 'jsonp'],
                    selected: null,
                    jsonp: {
                        url: 'countries.json',
                        name: 'setCountries',
                        callback: function (data) {
                            this.data = data;
                            for (var id in data) {
                                this.instance.innerHTML += '<option value="' + id + '">' + data[id] + '</option>';
                            }
                            this.instance.style.display = data ? 'inline-block' : 'none';
                        },

                        // Список зависимых от нас селекторов
                        dependent: ['city']
                    }
                },
                city: {
                    type: ['select'],
                    jsonp: {
                        url: 'country.json',
                        name: 'setCities',
                        callback: function (data) {
                            for (var id in data) {
                                this.instance.innerHTML += '<option value="' + id + '">' + data[id] + '</option>';
                            }
                            this.instance.style.display = data ? 'inline-block' : 'none';
                        }
                    },
                    dependency: 'country',
                    // Специальный коллбек, вызывается при обновлении селектора от которого мы зависим
                    dependencyCallback: function (parentId) {
                        var url = this.jsonp.url.replace(/country/, parentId);
                        var element = this;

                        this.instance.innerHTML = '';

                        if (!this.data) {
                            this.data = {};
                        }

                        if (!this.data[parentId]) {
                            request.sendTo(url, this.jsonp.name, function (data) {
                                element.data[parentId] = data;

                                element.jsonp.callback.call(element, data);
                            });
                        }
                        else {
                            this.jsonp.callback.call(this, this.data[parentId]);
                        }
                    }
                },
                submit: {type: ['input', 'submit']},
                clear: {type: ['button', 'button'], callback: function () {
                    form.instance.reset();
                }}
            },

            // Создаём форму, добавляем в неё элементы
            // и подписываем их на события для проверки валидации
            initialize: function (wrapper) {
                // Обёртка для формы. куда мы её будем добавлять
                this.wrapper = document.getElementById(wrapper);

                // Непосредственно сама форма
                this.instance = document.createElement('form');

                // Добавляем таблицу в обёртку
                this.wrapper.appendChild(this.instance);

                for (var name in this.elements) {
                    (function (name) {
                        if (this.elements.hasOwnProperty(name)) {
                            // Создаём поле
                            this.elements[name].instance = this.createElement(name, this.elements[name]);

                            // Для текстовых полей
                            if ('input' === this.elements[name].type[0]) {
                                // Подписываем созданное поле на изменения, передаём как контекст объект поля
                                event.subscribe(this.elements[name].instance, ['keypress', 'keyup', 'change'], function () {
                                    // Удаляем не валидные символы
                                    var newValue = this.instance.value.match(this.rule);

                                    this.instance.value = newValue ? newValue.join("") : '';
                                }, this.elements[name]);
                            }

                            // Для кнопок с коллбеками
                            if ('button' === this.elements[name].type[0]) {
                                // Подписываем созданное поле на изменения, передаём как контекст объект поля
                                event.subscribe(this.elements[name].instance, 'click', function (e) {
                                    event.preventDefault(e);
                                    this.callback();
                                }, this.elements[name]);
                            }

                            // Для селектов
                            else if ('select' === this.elements[name].type[0]) {
                                if (this.elements[name].jsonp && this.elements[name].jsonp.dependent) {
                                    event.subscribe(this.elements[name].instance, 'change', function () {
                                        // Обновим наши зависимости
                                        for (var di = 0; di < this.elements[name].jsonp.dependent.length; di++) {
                                            var dependent = this.elements[name].jsonp.dependent[di];
                                            this.elements[dependent]
                                                .dependencyCallback
                                                .call(this.elements[dependent], this.elements[name].instance.value);
                                        }
                                    }, this);
                                }
                            }

                            this.instance.appendChild(this.elements[name].instance);
                        }
                    }).call(this, name)
                }

                // Подписываем форму на событие onSubmit,
                // с передачей контекста формы для корректной работы callback
                event.subscribe(this.instance, 'submit', function (e) {
                    event.preventDefault(e);

                    var elementsValues = this.getElementsValues();

                    request.sendTo('TakeContacts.json', 'TakeContacts', function (data) {
                        if (true === data) {
                            table.addUser(elementsValues).drawList();
                        }
                    });
                }, this);
            },

            // Метод для создания элемента формы
            createElement: function (name, params) {
                // Для селектов
                if ('select' === params.type[0]) {
                    var element = document.createElement('select');

                    // Подгрузим данные если селект асинхронный, а данных в нём нет
                    if (!params.data && 'jsonp' === params.type[1]) {
                        request.sendTo(params.jsonp.url, params.jsonp.name, function (data) {
                            params.jsonp.callback.call(params, data);
                        });
                    }

                    // Прячем, если нет данных которые можно отобразить
                    element.style.display = params.data ? 'inline-block' : 'none';
                }

                // Для кнопок
                if ('button' === params.type[0]) {
                    var element = document.createElement('button');

                    element.innerText = name;
                }

                // Для input, submit, et cetera
                else {
                    var element = document.createElement(params.type[0]);
                    element.setAttribute('placeholder', name);
                    element.setAttribute('type', params.type[1]);
                    element.setAttribute('submit' !== params.type[1] ? 'name' : 'value', name);
                }

                return element;
            },

            // Получаем значения от всех элементов форм
            getElementsValues: function () {
                var values = {};

                for (var name in this.elements) {
                    if (this.elements.hasOwnProperty(name) && 'submit' !== name) {
                        values[name] = this.elements[name].instance.value;
                    }
                }

                return values;
            }
        };

        var table = {
            // Список пользователей
            list: [],

            // Свойство используемое для сортировки
            sort: {
                // Колонки для сортировки: [имя, по убываюнию]
                columns: [
                    ['name', 'desc'],
                    ['email', 'desc']
                ],
                // Сортирующий метод
                by: function (c) {
                    return function (current, next) {
                        return c[1] == 'desc' ? current[c[0]] > next[c[0]] : current[c[0]] < next[c[0]];
                    }
                }
            },

            // Свойства кнопки "назад"
            backButton: {},

            // Инициализация таблицы, создание первичных данных и подписок на события
            initialize: function (wrapper) {
                // Обёртка для таблицы. куда мы её будем добавлять
                this.wrapper = document.getElementById(wrapper);

                // Непосредственно сама таблица
                this.instance = document.createElement('table');

                // Добавляем таблицу в обёртку
                this.wrapper.appendChild(this.instance);

                // Создадим свой объект для сортировки, и сохраним туда HTML что бы не создавать её каждый раз
                // Если этого не сделать, навешивать каждый раз новые события и не заниматься очищением объектов
                // при перерисовке - получим  плавную утечку памяти в старых IE
                this.sort.instance = document.createElement('tr');

                for (var i = 0; i < this.sort.columns.length; i++) {
                    // Обернём в анонимную функцию дабы избежать проблем с мутацией указателя при замыкании в цикле
                    (function (i) {
                        var column = document.createElement('td');

                        column.innerHTML = '<strong>' + this.sort.columns[i][0] + '</strong>';

                        // Сортируем и перерисовываем по событию
                        event.subscribe(column, 'click', function (e) {
                            var column = this.sort.columns[i];

                            column[1] = column[1] == 'desc' ? 'asc' : 'desc';

                            this.list.sort(this.sort.by(column));

                            this.drawList();
                        }, this);

                        this.sort.instance.appendChild(column);
                    }).call(this, i);
                }

                // По тому же принципу создадим на будущеее кнопку "назад" и повесим на неё обработчик
                this.backButton.instance = document.createElement('tr');

                this.backButton.instance.innerHTML = '<a href="#">Назад к списку пользователей</a>';

                event.subscribe(this.backButton.instance, 'click', function (e) {
                    event.preventDefault(e);

                    history.back();

                    this.drawList();
                }, this);

                // Подпишемся на изменения истории и backspace
                event.subscribe(window, ['popstate', 'keydown'], function (e) {
                    // Посмотрим, нет ли у нас в истории предзагруженных данных
                    // Раз есть, скорее всего было нажато "вперёд", показываем данные
                    if (history.get() === 'viewDetails') {
                        if (this.editedUser) {
                            this.drawDetails();
                        }
                    }

                    // Если же ничего подобного нет или пользователь нажал backspace
                    // то на всякий случай отрисуем таблицу заново
                    else if (history.get() !== 'viewDetails' || e.which == 8) {
                        history.back();

                        if (this.list.length) {
                            this.drawList();
                        }
                    }
                }, this);
            },

            // Добавление пользователя
            addUser: function (user) {
                this.list.push({params: user});

                return this;
            },

            // Отрисовываем список
            drawList: function () {
                this.clearAll().drawSortRow();

                for (var i = 0; i < this.list.length; i++) {
                    if (this.list[i]) {
                        if (!this.list[i].instance) {
                            this.list[i].instance = document.createElement('tr');

                            this.list[i].instance.innerHTML += '<td>' + this.list[i].params.name + '</td><td>' + this.list[i].params.email + '</td>';

                            // Подписываем строку на событие
                            event.subscribe(this.list[i].instance, 'click', function () {
                                history.push('viewDetails');

                                table.drawDetails(this);
                            }, this.list[i]);
                        }

                        this.instance.appendChild(this.list[i].instance);
                    }
                }
            },

            // Отрисовываем поля выбранного пользователя
            drawDetails: function (user) {
                this.clearAll().drawBackButton();

                if (user) {
                    this.editedUser = user;
                }

                if (this.editedUser) {
                    for (var param in this.editedUser.params) {
                        if (this.editedUser.params[param]) {
                            var row = document.createElement('tr');
                            row.innerHTML = '<tr><td><strong>' + param + '</strong></td><td>' + this.editedUser.params[param] + '</td></tr>';
                            this.instance.appendChild(row);
                        }
                    }
                }
            },

            // Очищаем таблицу
            drawSortRow: function () {
                this.instance.appendChild(this.sort.instance);

                return this;
            },

            // Очищаем таблицу
            drawBackButton: function () {
                this.instance.appendChild(this.backButton.instance);

                return this;
            },

            // Очищаем таблицу
            clearAll: function () {
                this.instance.innerHTML = '';

                return this;
            }
        };

        // Инициализируем главные объекты
        form.initialize(formId);
        table.initialize(tableId);
    }

    // Проверим не осталось ли в строке чего после предыдущей сессии
    if (history.get() == 'viewDetails') {
        history.clear();
    }

    // По хорошему стоило бы остлеживать что бы id врапперов не пересекались, но да ладно
    this.BuildForm = function (formId, tableId) {
        new Widget(formId, tableId);
    }
}.call(window));

// Подводя итог:
// Господи, что за хрень я здесь написал.