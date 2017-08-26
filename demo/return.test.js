import {saga1, saga2} from "./return";
import {read, __, thr} from '../src/index';
import {take} from 'redux-saga/effects';

describe('return', () => {
    it('doing nothing', () => {
        read(saga1, function* () {});
    });
    it('wrong effect', () => {
        try {
            read(saga1, function* () {
                yield take('ACTION');
            });
            throw new Error('This should not throw.');
        } catch(err) {
            expect(err.message).toEqual('Saga ended abruptly.');
        }
    });
    it('specify return skip', () => {
        read(saga1, function*() {
            return __;
        });
    });
    it('specify exact', () => {
        read(saga1, function*() {
            return 123;
        });
    });
    it('specify exact wrong', () => {
        try {
            read(saga1, function*() {
                return 1234;
            });
            throw new Error('not_this');
        } catch(err) {
            expect(err.message === 'not_this').toEqual(false);
        }
    });
});
