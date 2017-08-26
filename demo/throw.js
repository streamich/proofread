import {take, put} from 'redux-saga/effects';

export function* saga1() {
    throw new Error('1');
}

export function* saga2() {
    yield take('ACTION');
}
