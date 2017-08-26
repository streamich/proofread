'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

exports.skip = skip;
exports.ret = ret;
exports.thr = thr;

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

function compareErrors(err1, err2) {
    if (err1 instanceof Error && err2 instanceof Error) {
        compare(err1.message, err2.message);
    } else {
        compare(err1, err2);
    }
}

var sym = exports.sym = function sym(id) {
    return '@@proofread/' + id;
};

var IO = sym('IO');
var SKIP = 'SKIP';
var RETURN = 'RETURN';
var THROW = 'THROW';

var effect = exports.effect = function effect(type) {
    var _ref;

    var payload = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
    return _ref = {}, _defineProperty(_ref, IO, true), _defineProperty(_ref, type, payload), _ref;
};

function skip(number) {
    return effect(SKIP, { number: number });
}

var __ = exports.__ = skip();

function ret() {
    var value = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : __;

    if (isEffect(value, SKIP)) return value;
    return effect(RETURN, value);
}

function thr() {
    var error = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : __;

    if (isEffect(error, SKIP)) return error;
    return effect(THROW, error);
}

function isEffect(effect, type) {
    if ((typeof effect === 'undefined' ? 'undefined' : _typeof(effect)) !== 'object' || effect[IO] !== true) return false;
    if (type) {
        if (typeof effect[type] === 'undefined') return false;
    }
    return true;
}

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
            var err1 = void 0;
            var obj2 = void 0;
            var err2 = void 0;
            var yielded = void 0;

            try {
                obj2 = gen.next(function (value) {
                    return yielded = value;
                });
                err2 = undefined;
            } catch (error) {
                obj2 = undefined;
                err2 = error;
            }

            if (obj2 && obj2.done) {
                if (typeof obj2.value !== 'undefined') {
                    obj1 = this.gen.next(yielded);
                    if (obj1.done !== true) throw new Error('Expected saga to end.');
                    if (obj2.value && isEffect(obj2.value, SKIP)) return false;
                    compare(obj1.value, obj2.value);
                }
                return false;
            }

            this.history.push(yielded);

            try {
                obj1 = this.gen.next(yielded);
                err1 = undefined;
            } catch (error) {
                obj1 = undefined;
                err1 = error;
            }

            if (err2) {
                if (!err1) {
                    throw new Error('Expected saga to throw: ' + err2.message);
                } else {
                    if (isEffect(err2, SKIP)) {
                        return false;
                    } else {
                        compareErrors(err1, err2);
                    }
                }
                return false;
            }

            if (err1) {
                if (obj2 && (typeof obj2 === 'undefined' ? 'undefined' : _typeof(obj2)) === 'object' && obj2.value) {
                    var _obj = obj2,
                        value = _obj.value;

                    if (isEffect(value)) {
                        if (typeof value[SKIP] !== 'undefined') {
                            return false;
                        } else if (typeof value[THROW] !== 'undefined') {
                            compareErrors(err1, value[THROW]);
                            return false;
                        }
                    }
                }
                throw new Error('Expected an error: ' + err1.message);
            }

            if (obj1.done) {
                throw new Error('Saga ended abruptly.');
            }

            if (obj2.value && isEffect(obj2.value)) {
                var _obj2 = obj2,
                    _value = _obj2.value;

                if (typeof _value[SKIP] !== 'undefined') {
                    return true;
                } else if (typeof _value[RETURN] !== 'undefined') {
                    compare(obj1.value, _value[RETURN]);
                    if (obj1.done !== true) throw new Error('Expected saga to end.');
                } else if (typeof _value[THROW] !== 'undefined') {
                    if (err1) {
                        compareErrors(err1, yielded);
                        return false;
                    }
                    throw new Error('Expected an error');
                }
            }

            compare(obj1.value, obj2.value);
            return true;
        }
    }, {
        key: 'clone',
        value: function clone() {
            var reader = new Reader(this.saga, this.args);
            this.history.forEach(function (yielded) {
                try {
                    reader.gen.next(yielded);
                } catch (error) {}
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