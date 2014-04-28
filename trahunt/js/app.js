'use strict';

var application = {};

// Event
(function () {
    this.event = {
        /**
         * @param {Object} element the DOM Object
         * @param {Array, String} eventsNames list
         * @param {Function} callback for event
         * @param {Object} context for callback
         */

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
                    console.log(eventPrefix + eventsNames[i]);
                    callback.call(context, e);
                });
            }
        },

        /**
         * @param {Object} e the Event Object
         */

        fix: function (e) {
            e = e || window.event;

            if (!e.target) e.target = e.srcElement;

            if (e.pageX == null && e.clientX != null) {
                var html = document.documentElement;
                var body = document.body;

                e.pageX = e.clientX + (html.scrollLeft || body && body.scrollLeft || 0);
                e.pageX -= html.clientLeft || 0;

                e.pageY = e.clientY + (html.scrollTop || body && body.scrollTop || 0);
                e.pageY -= html.clientTop || 0;
            }

            if (!e.which && e.button) {
                e.which = e.button & 1 ? 1 : ( e.button & 2 ? 3 : ( e.button & 4 ? 2 : 0 ) )
            }

            return e;
        },

        /**
         * @param {Object} e the Event Object
         */

        touchHandler: function (e) {
            var touch = e.changedTouches[0];

            var fakeEvent = document.createEvent("MouseEvent");

            fakeEvent.initMouseEvent({
                touchstart: "mousedown",
                touchmove: "mousemove",
                touchend: "mouseup"
            }[e.type], true, true, window, 1,
                touch.screenX, touch.screenY,
                touch.clientX, touch.clientY, false,
                false, false, false, 0, null);

            touch.target.dispatchEvent(fakeEvent);

            this.preventDefault(e);
        },

        /**
         * @param {Object} e the Event Object
         */

        preventDefault: function (e) {
            if (e.preventDefault)
                e.preventDefault();
            else // Привет IE
                e.returnValue = false;
        }
    };
}).call(application);

// Drag and drop
(function (event) {
    /**
     * @param {Object} element the DOM Object
     */

    function getCoords(element) {
        var box = element.getBoundingClientRect();

        var body = document.body;
        var docElem = document.documentElement;

        var scrollTop = window.pageYOffset || docElem.scrollTop || body.scrollTop;
        var scrollLeft = window.pageXOffset || docElem.scrollLeft || body.scrollLeft;

        var clientTop = docElem.clientTop || body.clientTop || 0;
        var clientLeft = docElem.clientLeft || body.clientLeft || 0;

        var top = box.top + scrollTop - clientTop;
        var left = box.left + scrollLeft - clientLeft;

        return { top: Math.round(top), left: Math.round(left) };
    }

    /**
     * @param {Object} element the DOM Object
     * @param {Number} clientX
     * @param {Number} clientY
     */

    function getElementUnderClientXY(element, clientX, clientY) {
        var display = element.style.display || '';
        element.style.display = 'none';

        var target = document.elementFromPoint(clientX, clientY);

        element.style.display = display;

        return target;
    }

    this.dragAndDrop = function dragAndDrop() {
        var dragTarget = {};

        var self = this;

        this.onDown = function (e) {
            e = event.fix(e);

            if (e.which != 1) return;

            var elem = self.getDraggable(e);
            if (!elem) return;

            dragTarget.elem = elem;

            dragTarget.downX = e.pageX;
            dragTarget.downY = e.pageY;

            return false;
        }

        this.onMove = function (e) {
            if (!dragTarget.elem) return;

            e = event.fix(e);
            console.log(e);
            if (!dragTarget.copy) {
                var moveX = e.pageX - dragTarget.downX;
                var moveY = e.pageY - dragTarget.downY;

                if (Math.abs(moveX) < 3 && Math.abs(moveY) < 3) {
                    return;
                }

                dragTarget.copy = self.createCopy(e);
                if (!dragTarget.copy) {
                    dragTarget = {};
                    return;
                }

                var coords = getCoords(dragTarget.copy);
                dragTarget.shiftX = dragTarget.downX - coords.left;
                dragTarget.shiftY = dragTarget.downY - coords.top;

                self.startDrag(e);
            }

            dragTarget.copy.style.left = e.pageX - dragTarget.shiftX + 'px';
            dragTarget.copy.style.top = e.pageY - dragTarget.shiftY + 'px';

            return false;
        }

        this.onUp = function (e) {
            if (dragTarget.copy) {
                e = event.fix(e);
                self.finishDrag(e);
            }

            dragTarget = {};
        }

        this.finishDrag = function (e) {
            var dropElem = self.getDroppable(e);

            if (!dropElem) {
                self.onDragCancel(dragTarget);
            } else {
                self.onDragEnd(dragTarget, dropElem);
            }
        }

        this.createCopy = function (e) {
            var copy = dragTarget.elem;
            var old = {
                parent: copy.parentNode,
                nextSibling: copy.nextSibling,
                position: copy.position || '',
                left: copy.left || '',
                top: copy.top || '',
                zIndex: copy.zIndex || ''
            };

            copy.backPosition = function () {
                old.parent.insertBefore(copy, old.nextSibling);
            };

            copy.backStyles = function () {
                copy.style.position = old.position;
                copy.style.left = old.left;
                copy.style.top = old.top;
                copy.style.zIndex = old.zIndex
            };

            return copy;
        }

        this.startDrag = function (e) {
            var copy = dragTarget.copy;

            copy.style.zIndex = 9999;
            copy.style.position = 'absolute';

            document.body.appendChild(copy);
        }

        this.getDraggable = function (e) {
            var elem = e.target;
            while (elem != document && elem.getAttribute('draggable') == null) {
                elem = elem.parentNode;
            }
            return elem == document ? null : elem;
        }

        this.getDroppable = function (e) {

            var elem = getElementUnderClientXY(dragTarget.copy, e.clientX, e.clientY);

            while (elem != document && elem.getAttribute('droppable') == null) {
                elem = elem.parentNode;
            }

            return elem == document ? null : elem;
        }

        this.onDragEnd = function (dragTarget, dropElem) {
            console.log(dragTarget, dropElem);

            dragTarget.copy.backStyles();

            dropElem.appendChild(dragTarget.elem);
        };

        this.onDragCancel = function (dragTarget) {
            dragTarget.copy.backStyles();
            dragTarget.copy.backPosition();
        };
    };
}).call(application, application.event);

// Test module
(function (event, dragAndDrop) {

    /**
     * @param {String} path
     * @param {Function} callback
     */

    function getJSON(path, callback) {
        var xhr = new XMLHttpRequest();

        xhr.open('GET', path, true);

        xhr.onreadystatechange = function () {
            if (xhr.readyState != 4) return;

            if (xhr.status != 200)
                throw new Error('Error ' + xhr.status + ': ' + xhr.statusText);

            callback(JSON.parse(xhr.responseText));
        };

        xhr.send(null);
    }

    /**
     * @param {String} path to JSON file
     * @param {String} title (id for test title container)
     * @param {String} dropTo (id for drop container)
     * @param {String} dragFrom (id for drag container)
     * @param {String} button (id for checking button)
     */

    this.test = function Test(path, title, dropTo, dragFrom, button) {
        if (Test.length !== arguments.length)
            throw new Error('Invalid number of parameters');

        if (!(this instanceof  Test))
            return new Test(path, title, dropTo, dragFrom, button);

        var self = this;

        this.title = {
            _: '',
            set: function (text) {
                this.element.innerHTML = text;
            },
            element: document.getElementById(title)
        };

        this.questions = {
            _: [],
            set: function (questions) {
                for (var i = 0; i < questions.length; i++) {
                    var title = document.createElement('div');
                    var dragHint = document.createElement('div');
                    var element = document.createElement('div');
                    var droppable = document.createElement('div');

                    title.innerHTML = questions[i];
                    title.className = 'title';
                    dragHint.innerHTML = 'Перетащить сюда';
                    dragHint.className = 'drag-hint';
                    droppable.className = 'droppable-area';
                    droppable.setAttribute('droppable', i);
                    element.className = 'question';

                    this.hint = dragHint;

                    this._.push(droppable);

                    element.appendChild(title);
                    element.appendChild(droppable);
                    droppable.appendChild(dragHint);

                    this.element.appendChild(element);
                }
            },
            element: document.getElementById(dropTo)
        };

        this.answers = {
            _: [],
            set: function (answers) {
                for (var i = 0; i < answers.length; i++) {
                    var element = document.createElement('div');

                    element.innerHTML = answers[i];
                    element.className = 'draggable-answer';
                    element.setAttribute('draggable', i);

                    this._.push(element);

                    this.element.appendChild(element);
                }
            },
            element: document.getElementById(dragFrom)
        };

        this.correct = {
            get: function () {
                return this._ || false;
            },
            set: function (correct) {
                this._ = correct;

                return this;
            },
            compare: function () {
                for (var qi = 0; qi < self.questions._.length; qi++) {
                    var selectedAnswers = self.questions._[qi].getElementsByTagName('div');

                    for (var ai = 0; ai < selectedAnswers.length; ai++) {
                        if (selectedAnswers[ai].hasAttribute('draggable')) {
                            var answerId = selectedAnswers[ai].getAttribute('draggable');

                            var color = (this._.indexOf(qi + '' + answerId) !== -1) ? '21, 237, 50' : '255, 92, 0';

                            selectedAnswers[ai].style.backgroundColor = 'rgba(' + color + ', 0.9)';
                        }
                    }
                }
            }
        }

        getJSON(path, function (question) {
            self.title.set(question.text);
            self.answers.set(question.answers);
            self.questions.set(question.questions);
        });

        event.subscribe(document.getElementById(button), ['click', 'touchend'], function (e) {
            event.preventDefault(e);

            if (self.correct.get()) {
                self.correct.compare();
            }
            else {
                getJSON('json/answers.json', function (correct) {
                    self.correct.set(correct).compare();
                });
            }
        }, this);
    }

    // Subscribe on mouse events
    event.subscribe(document, 'mousedown', function (e) {
        event.preventDefault(e);

        dragAndDrop.onDown();
    }, window);

    event.subscribe(document, 'mousemove', function (e) {
        event.preventDefault(e);

        dragAndDrop.onMove();
    }, window);

    event.subscribe(document, 'mouseup', function (e) {
        event.preventDefault(e);

        dragAndDrop.onUp();
    }, window);

    // Subscribe on touch events
    event.subscribe(document, 'touchstart', event.touchHandler, event);
    event.subscribe(document, 'touchmove', event.touchHandler, event);
    event.subscribe(document, 'touchend', event.touchHandler, event);
    event.subscribe(document, 'touchcancel', event.touchHandler, event);

}).apply(application, [application.event, new application.dragAndDrop]);