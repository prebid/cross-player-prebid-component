// eslint-disable-next-line no-unused-vars
import PrebidPluginCP from '../../../src/PrebidPluginCP';

describe('PrebidPluginCP unit test', () => {
    let pluginObj;
    let communicatorSucc;
    let communicatorFailed;
    let messageId = 100;
    let options;
	const requestUrl = (msg, opts) => {
        let message = {
            command: msg,
            messageId: ++messageId
        };
        if (opts) {
            message.options = opts;
        }
        window.postMessage(JSON.stringify(message), '*');
	};

    beforeEach(() => {
        pluginObj = window.prebidPluginCP;
        communicatorSucc = (opts) => {
            return {
                getVastUrl: (timeout, callback) => {
                    callback('http://vastUrl');
                }
            }
        };
        communicatorFailed = (opts) => {
            return {
                getVastUrl: (timeout, callback) => {
                    callback(null);
                }
            }
        };
        options = {
            prebidPath: 'http://acdn.adnxs.com/prebid/not-for-prod/1/prebid.js'
        };
    });

	it('PrebidPliginCP doPrebid test - failed to load options by url', function (done) {
        console.log(this.test.title);
        this.timeout(3000);
        const responseHandler = (event) => {
            if (event && event.data) {
                var data = JSON.parse(event.data);
                if (data.command === 'PPCP:prebidResponse' && data.messageId === messageId) {
                    window.removeEventListener('message', responseHandler);
                    assert.equal(data.url, 'failed');
                    done();
                }
            }
        };
        window.addEventListener('message', responseHandler);
        pluginObj.doPrebid('http://fake.com');
        setTimeout(() => {
            requestUrl('PPCP:prebidUrlRequest');
        }, 1000);
    });

	it('PrebidPliginCP doPrebid test - failed to load prebid.js', function (done) {
        console.log(this.test.title);
        // this.timeout(3000);
        const responseHandler = (event) => {
            if (event && event.data) {
                var data = JSON.parse(event.data);
                if (data.command === 'PPCP:prebidResponse' && data.messageId === messageId) {
                    window.removeEventListener('message', responseHandler);
                    assert.equal(data.url, 'failed');
                    done();
                }
            }
        };
        window.addEventListener('message', responseHandler);
        options.prebidPath = 'http://fakePtrbid.js'
        pluginObj.doPrebid(options);
        setTimeout(() => {
            requestUrl('PPCP:prebidUrlRequest');
        }, 1000);
    });

	it('PrebidPliginCP doPrebid test - request url by communicator failed', function (done) {
        console.log(this.test.title);
        const responseHandler = (event) => {
            if (event && event.data) {
                var data = JSON.parse(event.data);
                if (data.command === 'PPCP:prebidResponse' && data.messageId === messageId) {
                    window.removeEventListener('message', responseHandler);
                    assert.equal(data.url, 'failed');
                    done();
                }
            }
        };
        window.addEventListener('message', responseHandler);
        const testObj = pluginObj.test();
        testObj.setCommunicator(communicatorFailed);
        pluginObj.doPrebid(options);
        setTimeout(() => {
            requestUrl('PPCP:prebidUrlRequest');
        }, 1000);
    });

	it('PrebidPliginCP doPrebid test - request url by communicator succeed', function (done) {
        console.log(this.test.title);
        const responseHandler = (event) => {
            if (event && event.data) {
                var data = JSON.parse(event.data);
                if (data.command === 'PPCP:prebidResponse' && data.messageId === messageId) {
                    window.removeEventListener('message', responseHandler);
                    assert.equal(data.url, 'http://vastUrl');
                    done();
                }
            }
        };
        window.addEventListener('message', responseHandler);
        const testObj = pluginObj.test();
        testObj.setCommunicator(communicatorSucc);
        pluginObj.doPrebid(options);
        setTimeout(() => {
            requestUrl('PPCP:prebidUrlRequest');
        }, 1000);
    });

	it('PrebidPliginCP doPrebid test - request url by communicator async succeed', function (done) {
        console.log(this.test.title);
        const responseHandler = (event) => {
            if (event && event.data) {
                var data = JSON.parse(event.data);
                if (data.command === 'PPCP:prebidResponse' && data.messageId === messageId) {
                    window.removeEventListener('message', responseHandler);
                    assert.equal(data.url, 'http://vastUrl');
                    done();
                }
            }
        };
        window.addEventListener('message', responseHandler);
        const testObj = pluginObj.test();
        testObj.setCommunicator(communicatorSucc);
        pluginObj.doPrebid(options);
        setTimeout(() => {
            requestUrl('PPCP:prebidRequest');
        }, 1000);
    });

	it('PrebidPliginCP doPrebid test - request url by communicator async with options succeed', function (done) {
        console.log(this.test.title);
        const responseHandler = (event) => {
            if (event && event.data) {
                var data = JSON.parse(event.data);
                if (data.command === 'PPCP:prebidResponse' && data.messageId === messageId) {
                    window.removeEventListener('message', responseHandler);
                    assert.equal(data.url, 'http://vastUrl');
                    done();
                }
            }
        };
        window.addEventListener('message', responseHandler);
        const testObj = pluginObj.test();
        testObj.setCommunicator(communicatorSucc);
        setTimeout(() => {
            requestUrl('PPCP:prebidRequest', options);
        }, 1000);
    });
});
