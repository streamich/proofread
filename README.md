# proofread

[![npm-img]][npm-url]

Proofread your Redux sagas. Saga testing tool.

    npm install --save-dev proofread

A convenience method to decrease boilerplate when testing you Redux sagas with Jest.
Consider you have a simple saga like this:

```js
export function* saga() {
    yield take('LOAD_USERS');
    yield put(action());
}
```

Normally you would write tests for it like this:

```js
it('standard saga testing', () => {
    const iterator = saga();
    expect(iterator.next().value).toEqual(take('LOAD_USERS'));
    expect(iterator.next().value).toEqual(put(action()));
});
````

Notice how much boilerplate each like has and that basically the first
part of each line `expect(iterator.next().value).toEqual(` is repeated.

`proofread` let's you write saga tests without this boilerplate. This
is how you write the same test using the `read` helper:

```js
import {read} from 'proofread';

it('proofreading saga', () => {
    read(saga, function* () {
        yield take('LOAD_USERS');
        yield put(action());
    });
});
```

Here we "read" the *saga* and provide an alternative *reading* of it as
a generator function. The real saga is matched step-by-step against the
alternative reading and errors are thrown if any step of the reading does not match.

See `/demo` folder for examples.


### Yielding value and specifying end

Each yield in the test generator returns a function. You can call that
function with the value you want to be returned to your original saga:

```js
(yield select(getSomething())(/* ... */);
```

Consider this saga:

```js
export function* saga() {
    yield take('AUTHENTICATE');
    const isAuthenticated = yield select(getIsAuthenticated);
    if(!isAuthenticated) {
        yield put(action());
    }
}
```

Normally you would write a test for it like this:

```js
const iterator = saga();
expect(iterator.next().value).toEqual(take('AUTHENTICATE'));
expect(iterator.next().value).toEqual(select(getIsAuthenticated));
expect(iterator.next(false).value).toEqual(put(action()));
```

Notice how on the last line we supply the `false` value for the `yield select()`
statement of the saga:

```js
iterator.next(false).value
```

When proofreading this saga, you would do it like this:

```js
read(saga, function* () {
    yield take('AUTHENTICATE');
    (yield select(getIsAuthenticated))(false);
    yield put(action());
});
```

Here we provide the yielded value of the `select` effect, like this:
`(yield select(getIsAuthenticated))(false);`.

You would also want to test the saga when the `if()` branch is failing,
conventionally you would do it like this:

```js
const iterator = saga();
expect(iterator.next().value).toEqual(take('AUTHENTICATE'));
expect(iterator.next().value).toEqual(select(getIsAuthenticated));
expect(iterator.next(true).done).toEqual(true);
```

We fail the if-statement and test for the end of saga on the last like:

```js
expect(iterator.next(true).done).toEqual(true);
```

When proofreading we would test for the branch fail like this:

```js
read(saga, function* () {
    yield take('AUTHENTICATE');
    (yield select(getIsAuthenticated))(true);
    return true;
});
```

This time the `return true;` statements checks that the saga ended.

```js
return true;
```


## Skipping steps

If you want to skip an effect in your saga, use `__`:

```js
import {__} from 'proofread';

read(saga, function* () {
    yield __;
    yield __;
    yield take('SOME_ACTION');
});
```



## Cloneable generator

The `read` method returns a generator object:

```js
let gen = read(saga, args);
```

So you can use it to test your sagas in conventional way as well, if you like:

```js
expect(gen.next().value).toEqual(/* ... */);
```

At any point in time you can clone that generator. You will receive
a new one at the same location in the saga:

```js
let gen2 = gen.clone();
```

You can also use those generators to test your saga in proofreading way:

```js
gen2.read(function* () {
    yield put(someAction());
});
```




[npm-url]: https://www.npmjs.com/package/proofread
[npm-img]: https://img.shields.io/npm/v/proofread.svg





# License

This is free and unencumbered software released into the public domain.

Anyone is free to copy, modify, publish, use, compile, sell, or
distribute this software, either in source code form or as a compiled
binary, for any purpose, commercial or non-commercial, and by any
means.

In jurisdictions that recognize copyright laws, the author or authors
of this software dedicate any and all copyright interest in the
software to the public domain. We make this dedication for the benefit
of the public at large and to the detriment of our heirs and
successors. We intend this dedication to be an overt act of
relinquishment in perpetuity of all present and future rights to this
software under copyright law.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS BE LIABLE FOR ANY CLAIM, DAMAGES OR
OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE,
ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
OTHER DEALINGS IN THE SOFTWARE.

For more information, please refer to <http://unlicense.org/>
