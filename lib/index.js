'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

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

var read = exports.read = function read(iterator1, iterator2) {
    var obj1 = void 0;
    var obj2 = void 0;
    var yielded = void 0;

    if (typeof iterator1 === 'function') {
        iterator1 = iterator1();
    }

    if (typeof iterator2 === 'function') {
        iterator2 = iterator2();
    }

    var iterate = function iterate() {
        obj2 = iterator2.next(function (value) {
            yielded = value;
        });
        return !obj2.done;
    };

    while (iterate()) {
        obj1 = iterator1.next(yielded);
        compare(obj1.value, obj2.value);
    }

    if (typeof obj2.value !== 'undefined') {
        obj1 = iterator1.next(yielded);
        if (obj1.done !== true) {
            throw new Error('Expected saga to end.');
        }
    }
};