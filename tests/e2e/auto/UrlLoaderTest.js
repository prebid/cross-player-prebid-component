import { Loader } from '../../../src/UrlLoader';

describe('UrlLoader unit test', () => {
	it('UrlLoader unit test - timeout', function(done) {
        console.log(this.test.title);
        Loader.load('http://ib.adnxs.com/ptv?id=111111', (status, data) => {
            assert.equal(status, 'Timeout');
            done();
        }, 10);
    });
});
