
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

export const read = (iterator1, iterator2) => {
    let obj1;
    let obj2;
    let yielded;

    if (typeof iterator1 === 'function') {
        iterator1 = iterator1();
    }

    if (typeof iterator2 === 'function') {
        iterator2 = iterator2();
    }

    const iterate = () => {
        obj2 = iterator2.next((value) => {
            yielded = value;
        });
        return !obj2.done;
    };

    while (iterate()) {
        obj1 = iterator1.next(yielded);
        compare(obj1.value, obj2.value);
    }

    // `return` was called?
    if (typeof obj2.value !== 'undefined') {
        obj1 = iterator1.next(yielded);
        if (obj1.done !== true) {
            throw new Error('Expected saga to end.');
        }
    }
};


function getIteratorOrThrow(iter) {
    if(typeof iter === 'function') iter = iter();

    if(!iter || (typeof iter !== 'object') || (typeof iter.next !== 'function'))
        throw new TypeError('Expected saga to be an iterator or a generator function.');

    return iter;
}

// export const cloneableGenerator = generatorFunc => (...args) => {
//     const history = []
//     const gen = generatorFunc(...args)
//     return {
//         next: arg => {
//             history.push(arg)
//             return gen.next(arg)
//         },
//         clone: () => {
//             const clonedGen = cloneableGenerator(generatorFunc)(...args)
//             history.forEach(arg => clonedGen.next(arg))
//             return clonedGen
//         },
//         return: value => gen.return(value),
//         throw: exception => gen.throw(exception),
//     }
// }


export class Reader {
    constructor(saga, args) {
        this.saga = saga;
        this.gen = getIteratorOrThrow(saga)(...args);
    }

    read(iter) {
        iter = getIteratorOrThrow(iter);
        while(this.step(iter));
    }

    step(iter) {
        let yielded;

        obj2 = iter.next(value => {
            yielded = value;
        });

        if(obj2.done) {
            if(typeof obj2.value !== 'undefined') {
                // Return was called.
                obj1 = iterator1.next(yielded);
                if(obj1.done !== true) {
                    throw new Error('Expected saga to end.');
                }
            }
            return false;
        }

        obj1 = this.saga.next(yielded);

        if(obj1.done) {
            throw new Error('Saga ended abruptly.');
        }

        compare(obj1.value, obj2.value);
    }
}


