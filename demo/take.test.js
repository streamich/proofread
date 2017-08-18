import {saga, fetch, action} from "./take";
import {take, call, put} from 'redux-saga/effects';
import {read} from '../src/index';


describe('take and yielding', () => {
    it('standard saga testing', () => {
        const iterator = saga();
        expect(iterator.next().value).toEqual(take('LOAD_USERS'));
        expect(iterator.next().value).toEqual(call(fetch, '/users'));
        const users = [{}];
        expect(iterator.next(users).value).toEqual(put(action(users)));
    });
    it('proofreading saga', () => {
        read(saga, function* () {
            yield take('LOAD_USERS');
            const users = [];
            (yield call(fetch, '/users'))(users);
            yield put(action(users));
        });
    });
});