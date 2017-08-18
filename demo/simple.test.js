import {saga, action} from "./simple";
import {take, put} from 'redux-saga/effects';
import {read} from '../src/index';


describe('simple', () => {
    it('standard saga testing', () => {
        const iterator = saga();
        expect(iterator.next().value).toEqual(take('LOAD_USERS'));
        expect(iterator.next().value).toEqual(put(action()));
    });
    it('proofreading saga', () => {
        read(saga, function* () {
            yield take('LOAD_USERS');
            yield put(action());
        });
    });
});