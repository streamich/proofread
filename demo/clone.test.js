import {saga} from "./clone";
import {take} from 'redux-saga/effects';
import {read, __} from '../src/index';


describe('simple', () => {
    it('proofreading saga', () => {
        const reader = read(saga, function* () {
            yield __;
            yield __;
            yield __;
        });

        const reader2 = reader.clone();
        reader2.read(function *() {
            yield take('LOAD_USERS4');
        });
    });
});
