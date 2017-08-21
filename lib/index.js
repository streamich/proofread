'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

exports.skip = skip;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function compare(val1, val2) {
    if (typeof expect !== 'function') {
        throw new Error('expect() assertion function not present in global scope, ' + 'expected Jest\' expect().toEqual() assertion method.');
    }

    var exp = expect(val1);

    if (typeof exp.toEqual === 'function') {
        exp.toEqual(val2);
    } else if (_typeof(exp.to) === 'object') {
        exp.to.eql(val2);
    } else {
        throw new Error('Unexpected expect() method, don\'t know how to throw.');
    }
}

var sym = exports.sym = function sym(id) {
    return '@@proofread/' + id;
};

var IO = sym('IO');
var SKIP = 'SKIP';

var effect = exports.effect = function effect(type, payload) {
    var _ref;

    return _ref = {}, _defineProperty(_ref, IO, true), _defineProperty(_ref, type, payload), _ref;
};

function skip(number) {
    return effect(SKIP, { number: number });
}

var __ = exports.__ = skip();

function isIterator(iter) {
    return !iter || (typeof iter === 'undefined' ? 'undefined' : _typeof(iter)) !== 'object' || typeof iter.next !== 'function';
}

function isIteratorOrFunction(iter) {
    return typeof iter === 'function' || isIterator(iter);
}

function getIteratorOrThrow(iter, args) {
    if (typeof iter === 'function') iter = iter.apply(undefined, _toConsumableArray(args));

    if (isIterator(iter)) throw new TypeError('Expected saga to be an iterator or a generator function.');

    return iter;
}

var Reader = exports.Reader = function () {
    function Reader(saga, args) {
        _classCallCheck(this, Reader);

        this.saga = saga;
        this.gen = getIteratorOrThrow(saga, args || []);
        this.history = [];
    }

    _createClass(Reader, [{
        key: 'read',
        value: function read(genFunc, args) {
            var gen = getIteratorOrThrow(genFunc, args || []);
            while (this._step(gen)) {}
        }
    }, {
        key: '_step',
        value: function _step(gen) {
            var obj1 = void 0;
            var obj2 = void 0;
            var yielded = void 0;

            obj2 = gen.next(function (value) {
                yielded = value;
            });

            if (obj2.done) {
                if (typeof obj2.value !== 'undefined') {
                    if (obj2.done) {
                        obj1 = this.gen.next(yielded);
                        if (obj1.done !== true) {
                            throw new Error('Expected saga to end.');
                        }
                    } else {
                        obj1 = this.gen.next(yielded);
                        if (obj1.done === true) {
                            throw new Error('Expected saga to continue.');
                        }
                    }
                }
                return false;
            }

            this.history.push(yielded);

            obj1 = this.gen.next(yielded);

            if (obj1.done) {
                throw new Error('Saga ended abruptly.');
            }

            if (obj2.value && _typeof(obj2.value) === 'object' && obj2.value[IO] === true) {
                if (typeof obj2.value[SKIP] !== 'undefined') {}
            } else {
                compare(obj1.value, obj2.value);
            }

            return true;
        }
    }, {
        key: 'clone',
        value: function clone() {
            var reader = new Reader(this.saga, this.args);
            this.history.forEach(function (yielded) {
                return reader.gen.next(yielded);
            });
            reader.history = this.history.slice();
            return reader;
        }
    }, {
        key: 'next',
        value: function next(arg) {
            this.history.push(arg);
            return this.gen.next(arg);
        }
    }, {
        key: 'return',
        value: function _return(value) {
            this.gen.return(value);
        }
    }, {
        key: 'throw',
        value: function _throw(exception) {
            this.gen.throw(exception);
        }
    }]);

    return Reader;
}();

var read = exports.read = function read(saga, args, reading) {
    if (typeof args === 'function') {
        reading = args;
        args = [];
    }

    if (!(args instanceof Array)) args = [];

    var reader = new Reader(saga, args);

    if (reading) {
        if (isIteratorOrFunction(reading)) reader.read(reading);
    }

    return reader;
};