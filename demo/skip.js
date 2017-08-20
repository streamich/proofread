import {take} from 'redux-saga/effects';

export function* saga() {
    yield take('LOAD_USERS1');
    yield take('LOAD_USERS2');
    yield take('LOAD_USERS3');
}
