import {saga, action, getIsAuthenticated} from "./branch";
import {take, put, select} from 'redux-saga/effects';
import {read, __} from '../src/index';


describe('branch testing and test for saga end', () => {
    describe('standard saga testing', () => {
        it('if(false)', () => {
            const iterator = saga();
            expect(iterator.next().value).toEqual(take('AUTHENTICATE'));
            expect(iterator.next().value).toEqual(select(getIsAuthenticated));
            expect(iterator.next(true).done).toEqual(true);
        });
        it('if(true)', () => {
            const iterator = saga();
            expect(iterator.next().value).toEqual(take('AUTHENTICATE'));
            expect(iterator.next().value).toEqual(select(getIsAuthenticated));
            expect(iterator.next(false).value).toEqual(put(action()));
        });
    });

    describe('proofreading saga', () => {
        it('if(false)', () => {
            read(saga, function* () {
                yield take('AUTHENTICATE');
                (yield select(getIsAuthenticated))(true);
                return __;
            });
        });
        it('if(true)', () => {
            read(saga, function* () {
                yield take('AUTHENTICATE');
                (yield select(getIsAuthenticated))(false);
                yield put(action());
                return undefined;
            });
        });
    });
});
