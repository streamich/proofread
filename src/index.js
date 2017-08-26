
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

function compareErrors(err1, err2) {
    if((err1 instanceof Error) && (err2 instanceof Error)) {
        compare(err1.message, err2.message);
    } else {
        compare(err1, err2);
    }
}


export const sym = id => `@@proofread/${id}`;

const IO = sym('IO');
const SKIP = 'SKIP';
const RETURN = 'RETURN';
const THROW = 'THROW';

export const effect = (type, payload = null) => ({[IO]: true, [type]: payload});

export function skip(number) {
    return effect(SKIP, {number});
}

export const __ = skip();

export function ret(value = __) {
    if(isEffect(value, SKIP)) return value;
    return effect(RETURN, value);
}

export function thr(error = __) {
    if(isEffect(error, SKIP)) return error;
    return effect(THROW, error);
}

function isEffect(effect, type) {
    if((typeof effect !== 'object') || (effect[IO] !== true))
        return false;
    if(type) {
        if(typeof effect[type] === 'undefined')
            return false;
    }
    return true;
}

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
        let err1;
        let obj2;
        let err2;
        let yielded;

        // Iterate alternative reading.
        try {
            obj2 = gen.next(value => yielded = value);
            err2 = undefined;
        } catch(error) {
            obj2 = undefined;
            err2 = error;
        }

        // Check if alternative reading ended.
        if(obj2 && obj2.done) {
            // Check if "return" was called.
            if(typeof obj2.value !== 'undefined') {
                obj1 = this.gen.next(yielded);
                if(obj1.done !== true)
                    throw new Error('Expected saga to end.');
                if(obj2.value && isEffect(obj2.value, SKIP))
                    return false;
                compare(obj1.value, obj2.value);
            }
            return false;
        }

        this.history.push(yielded);

        // Iterate saga.
        try {
            obj1 = this.gen.next(yielded);
            err1 = undefined;
        } catch(error) {
            obj1 = undefined;
            err1 = error;
        }

        // Check if reading "throw"ed.
        if(err2) {
            if (!err1) {
                throw new Error('Expected saga to throw: ' + err2.message);
            } else {
                if(isEffect(err2, SKIP)) {
                    return false;
                } else {
                    compareErrors(err1, err2);
                }
            }
            return false;
        }

        // Check if saga "throw"ed.
        if(err1) {
            if(obj2 && (typeof obj2 === 'object') && obj2.value) {
                const {value} = obj2;
                if(isEffect(value)) {
                    if (typeof value[SKIP] !== 'undefined') {
                        return false;
                    } else if(typeof value[THROW] !== 'undefined') {
                        compareErrors(err1, value[THROW]);
                        return false;
                    }
                }
            }
            throw new Error('Expected an error: ' + err1.message);
        }

        // Check if saga ended short.
        if(obj1.done) {
            throw new Error('Saga ended abruptly.');
        }

        // Check if we received "proofread" effect.
        if(obj2.value && isEffect(obj2.value)) {
            const {value} = obj2;
            if(typeof value[SKIP] !== 'undefined') {
                return true;
            } else if(typeof value[RETURN] !== 'undefined') {
                compare(obj1.value, value[RETURN]);
                if(obj1.done !== true)
                    throw new Error('Expected saga to end.');
            } else if(typeof value[THROW] !== 'undefined') {
                if(err1) {
                    compareErrors(err1, yielded);
                    return false;
                }
                throw new Error('Expected an error');
            }
        }

        compare(obj1.value, obj2.value);
        return true;
    }

    clone() {
        const reader = new Reader(this.saga, this.args);
        this.history.forEach(yielded => {
            try {
                reader.gen.next(yielded)
            } catch(error) {

            }
        });
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

    if(reading) {
        if(isIteratorOrFunction(reading))
            reader.read(reading);
    }

    return reader;
};
