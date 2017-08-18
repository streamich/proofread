import {take, put, select} from 'redux-saga/effects';

export const action = () => ({
    type: 'ACTION'
});

export const getIsAuthenticated = state => {};

export function* saga() {
    yield take('AUTHENTICATE');
    const isAuthenticated = yield select(getIsAuthenticated);
    if(!isAuthenticated) {
        yield put(action());
    }
}
