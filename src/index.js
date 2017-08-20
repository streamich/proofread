
function compare(val1, val2) {
    if(typeof expect !== 'function') {
        throw new Error('expect() assertion function not present in global scope, ' +
            'expected Jest\' expect().toEqual() assertion method.');
    }

    const exp = expect(val1);

    if(typeof exp.toEqual === 'function') {
        exp.toEqual(val2);
    } else if (typeof exp.to === 'object') {
        exp.to.eql(val2);
    } else {
        throw new Error('Unexpected expect() method, don\'t know how to throw.');
    }
}


export const sym = id => `@@proofread/${id}`;

const IO = sym('IO');
const SKIP = 'SKIP';

export const effect = (type, payload) => ({[IO]: true, [type]: payload});

export function skip(number) {
    return effect(SKIP, {number});
}

export const __ = skip();


function isIterator(iter) {
    return !iter || (typeof iter !== 'object') || (typeof iter.next !== 'function');
}

function isIteratorOrFunction(iter) {
    return (typeof iter === 'function') || isIterator(iter);
}

function getIteratorOrThrow(iter, args) {
    if(typeof iter === 'function') iter = iter(...args);

    if(isIterator(iter))
        throw new TypeError('Expected saga to be an iterator or a generator function.');

    return iter;
}


export class Reader {

    constructor(saga, args) {
        this.saga = saga;
        this.gen = getIteratorOrThrow(saga, args || []);
        this.history = [];
    }

    read(genFunc, args) {
        const gen = getIteratorOrThrow(genFunc, args || []);
        while(this._step(gen));
    }

    _step(gen) {
        let obj1;
        let obj2;
        let yielded;

        obj2 = gen.next(value => {
            yielded = value;
        });

        if(obj2.done) {
            if(typeof obj2.value !== 'undefined') {
                // Return was called.
                obj1 = this.gen.next(yielded);
                if(obj1.done !== true) {
                    throw new Error('Expected saga to end.');
                }
            }
            return false;
        }

        this.history.push(yielded);

        obj1 = this.gen.next(yielded);

        if(obj1.done) {
            throw new Error('Saga ended abruptly.');
        }

        if(obj2.value && (typeof obj2.value === 'object') && (obj2.value[IO] === true)) {
            if(typeof obj2.value[SKIP] !== 'undefined') {

            }
        } else {
            compare(obj1.value, obj2.value);
        }

        return true;
    }

    clone() {
        const reader = new Reader(this.saga, this.args);
        this.history.forEach(yielded => reader.gen.next(yielded));
        reader.history = this.history.slice();
        return reader;
    }

    next(arg) {
        this.history.push(arg);
        return this.gen.next(arg);
    }

    'return'(value) {
        this.gen.return(value);
    }

    'throw'(exception) {
        this.gen.throw(exception);
    }
}


export const read = (saga, args, reading) => {
    if(typeof args === 'function') {
        reading = args;
        args = [];
    }

    if(!(args instanceof Array)) args = [];

    const reader = new Reader(saga, args);

    if(isIteratorOrFunction(reading))
        reader.read(reading);

    return reader;
};
