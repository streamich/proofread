import {take, put} from 'redux-saga/effects';

export const action = () => ({
    type: 'ACTION'
});

export function* saga() {
    yield take('LOAD_USERS');
    yield put(action());
}
