import {take, call, put} from 'redux-saga/effects';


export function fetch() {}
export function action(users) {
    return {
        type: 'SET_USERS',
        users,
    }
}

export function* saga() {
    while(true) {
        yield take('LOAD_USERS');
        const users = yield call(fetch, '/users');
        yield put(action(users));
    }
}
