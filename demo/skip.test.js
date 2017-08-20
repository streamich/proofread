import {saga} from "./skip";
import {take} from 'redux-saga/effects';
import {read, __} from '../src/index';


describe('simple', () => {
    it('standard saga testing', () => {
        const iterator = saga();
        iterator.next();
        iterator.next();
        expect(iterator.next().value).toEqual(take('LOAD_USERS3'));
    });
    it('proofreading saga', () => {
        read(saga, function* () {
            yield __;
            yield __;
            yield take('LOAD_USERS3');
        });
    });
});