import { PrebidCommunicator } from '../../../src/PrebidCommunicator';

describe('PrebidCommunicator unit test', () => {
    let communicatorObj;
    let options;
    let interval;

    beforeEach(() => {
        options = {
            biddersSpec: {
                code: 'my-video-tag',
                sizes: [640, 480],
                mediaTypes: {
                    video: {
                        context: 'instream',
                        mimes: ['video/mp4', 'application/javascript'],
                        // add 7 and 8 to include vast 4
                        protocols: [1, 2, 3, 4, 5, 6, 7, 8],
                        playbackmethod: [1, 2],
                        api: [1, 2]
                    }
                },
                bids: [
                    {
                        bidder: 'appnexus',
                        params: {
                            video: {
                                skippable: true,
                                playback_method: ['auto_play_sound_off']
                            }
                        }
                    }
                ]
            },
            prebidConfigOptions: {
                cache: {
                    url: 'https://prebid.cache'
                },
                enableSendAllBids: true
            },
            dfpParameters: {
                params: {
                    iu: '/999999/test_prebid_demo_adunit',
                    output: 'vast'
                },
                url: 'http://dfrParamsUrl',
                bid: {k1: 'v1'}
            },
            prebidTimeout: 700,
            enablePrebidCache: true
        };
        window.pbjs = {
            aliasBidder: () => {},
            addAdUnits: () => {},
            setConfig: () => {},
            removeAdUnit: () => {},
            requestBids: (obj) => {
                obj.bidsBackHandler({
                    'my-video-tag': {
                        bids: [
                            {
                                cpm: 1,
                                vastUrl: 'http://vastUrl1',
                                videoCacheKey: 'key1'
                            },
                            {
                                cpm: 2,
                                vastUrl: 'http://vastUrl2',
                                videoCacheKey: 'key2'
                            }
                        ]
                    }
                });
            },
            adServers: {
                dfp: {
                    buildVideoUrl: (opts) => {
                        return 'http://dfpUrl';
                    }
                }
            }
        };
        interval = setInterval(() => {
            if (window.pbjs && window.pbjs.que && window.pbjs.que.length > 0) {
                const func = window.pbjs.que.shift();
                func();
            }
        }, 100);
    });

    afterEach(() => {
        clearInterval(interval);
    });

	it('PrebidCommunicator getVastUrl test - timeout to load prebid.js', function (done) {
        this.timeout(3000);
        console.log(this.test.title);
        communicatorObj = new PrebidCommunicator(options);
        const testObj = communicatorObj.test();
        testObj.setPbjsBusy(true);
        communicatorObj.getVastUrl(2000, (creative) => {
            assert.isNull(creative);
            done();
        });
    });

	it('PrebidCommunicator getVastUrl test - missing bidderSpec', function (done) {
        console.log(this.test.title);
        delete options.biddersSpec;
        communicatorObj = new PrebidCommunicator(options);
        const testObj = communicatorObj.test();
        testObj.setPbjsBusy(false);
        communicatorObj.getVastUrl(1000, (creative) => {
            assert.isNull(creative);
            done();
        });
    });

	it('PrebidCommunicator getVastUrl test - prebid request for DFP', function (done) {
        console.log(this.test.title);
        communicatorObj = new PrebidCommunicator(options);
        const testObj = communicatorObj.test();
        testObj.setPbjsBusy(false);
        communicatorObj.getVastUrl(2000, (creative) => {
            assert.equal(creative, 'http://dfpUrl');
            done();
        });
    });

	it('PrebidCommunicator getVastUrl test - prebid request for NON-DFP', function (done) {
        console.log(this.test.title);
        delete options.dfpParameters;
        communicatorObj = new PrebidCommunicator(options);
        const testObj = communicatorObj.test();
        testObj.setPbjsBusy(false);
        communicatorObj.getVastUrl(2000, (creative) => {
            assert.equal(creative, 'https://prebid.cache?uuid=key2');
            done();
        });
    });
});
