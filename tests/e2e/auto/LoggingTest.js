import Logging from '../../../src/Logging';

describe('Logging unit test', () => {
    beforeEach(() => {
        Logging.setDebugLevel(Logging.TRACE_LEVEL_VERBOSE);
    });

	it('Logging unit test - log always', function() {
        console.log(this.test.title);
        let stub = sinon.stub(console, 'log', (arg1, arg2) => {
            stub.restore();
            assert.isString(arg1);
            assert.equal(arg2, 'log always');
        });
        Logging.always('log always');
    });

	it('Logging unit test - log error', function() {
        console.log(this.test.title);
        let stub = sinon.stub(console, 'error', (arg1, arg2) => {
            stub.restore();
            assert.isString(arg1);
            assert.equal(arg2, 'log error');
        });
        Logging.error('log error');
    });

	it('Logging unit test - log warn', function() {
        console.log(this.test.title);
        let stub = sinon.stub(console, 'warn', (arg1, arg2) => {
            stub.restore();
            assert.isString(arg1);
            assert.equal(arg2, 'log warn');
        });
        Logging.warn('log warn');
    });

	it('Logging unit test - log info', function() {
        console.log(this.test.title);
        let stub = sinon.stub(console, 'info', (arg1, arg2) => {
            stub.restore();
            assert.isString(arg1);
            assert.equal(arg2, 'log info');
        });
        Logging.info('log info');
    });

	it('Logging unit test - log log', function() {
        console.log(this.test.title);
        let stub = sinon.stub(console, 'log', (arg1, arg2) => {
            stub.restore();
            assert.isString(arg1);
            assert.equal(arg2, 'log log');
        });
        Logging.log('log log');
    });

	it('Logging unit test - log debug', function() {
        console.log(this.test.title);
        let stub = sinon.stub(console, 'debug', (arg1, arg2) => {
            stub.restore();
            assert.isString(arg1);
            assert.equal(arg2, 'log debug');
        });
        Logging.debug('log debug');
    });

	it('Logging unit test - log verbose', function() {
        console.log(this.test.title);
        let stub = sinon.stub(console, 'debug', (arg1, arg2) => {
            stub.restore();
            assert.isString(arg1);
            assert.equal(arg2, 'log verbose');
        });
        Logging.verbose('log verbose');
    });
});
