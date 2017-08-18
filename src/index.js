
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
