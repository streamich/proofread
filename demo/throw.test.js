import {saga1, saga2} from "./throw";
import {read, __, thr} from '../src/index';
import {take} from 'redux-saga/effects';


describe('throwing', () => {
    it('skip', () => {
        read(saga1, function* () {
            yield __;
        });
    });
    it('not throw', () => {
        try {
            read(saga1, function* () {
                yield take('ACTION');
            });
            throw Error('This should not throw');
        } catch(err) {
            expect(err.message).toEqual('Expected an error: 1');
        }
    });
    it('throw anonymous', () => {
        try {
            read(saga1, function* () {
                throw {};
            });
            throw new Error('not_this');
        } catch(err) {
            expect(err.message === "not_this").toEqual(false);
        }
    });
    it('throw exact', () => {
        read(saga1, function* () {
            throw Error('1');
        });
    });
    it('throw exact incorrectly', () => {
        try {
            read(saga1, function* () {
                throw Error('2');
            });
            throw Error("not_this");
        } catch(err){
            expect(err.message === "not_this").toEqual(false);
        }
    });
    it('yield thr();', () => {
        read(saga1, function* () {
            yield thr();
        });
    });
    it('yield thr(__);', () => {
        read(saga1, function* () {
            yield thr(__);
        });
    });
    it('yield thr(Error()); incorrect', () => {
        try {
            read(saga1, function* () {
                yield thr(Error('2'));
            });
            throw Error("not_this");
        } catch(err){
            expect(err.message === "not_this").toEqual(false);
        }
    });
    it('yield thr(Error()); correct', () => {
        read(saga1, function* () {
            yield thr(Error('1'));
        });
    });
    it('throw skip', () => {
        read(saga1, function* () {
            throw __;
        });
    });
    describe('saga2 (negative)', () => {
        it('runs', () => {
            read(saga2, function* () {
            });
        });
        it('throwing is an error', () => {
            try {
                read(saga2, function* () {
                    throw __;
                });
            } catch(err) {
                expect(err.message === "not_this").toEqual(false);
            }
        });
    });
});
