var odkPrebidOptions = {
    // prebidPath: '//acdn.adnxs.com/prebid/not-for-prod/1/prebid.js',
    prebidPath: 'http://video.devnxs.net/projects/git/prebid.js',
    scriptLoadTimeout: 3000,
	biddersSpec: {
        code: 'my-video-tag',
        sizes: [640, 360],
        mediaTypes: {
        	video: {
                context: 'adpod',
                playerSize: [640, 360],
                adPodDurationSec: 60,
                durationRangeSec: [15, 30]
            }
        },
        bids: [
            {
                bidder: 'appnexus',
                params: {
                    placementId: 14542875
                }
            }
		]
	},
	prebidConfigOptions: {
        debud: true,
		cache: {
			url: 'https://prebid.adnxs.com/pbc/v1/cache'
		},
        adpod: {
            brandCategoryExclusion: true
        },
		enableSendAllBids: true
	},
	dfpParameters: {
		params: {
			iu: '/114479492/odk_player',
            output: 'vast',
            ad_rule: '0',
            ciu_szs: '300x250',
            impl: 's',
            pmnd: '0',
            pmxd: '360000',
            pmad: '4',
            cust_params: {
                category: 'korean-news',
                program: 'jtbc-morning',
                episode: 'jtbc-morning-e20200221',
                partner: 'jtbc',
                platform: 'odk_web',
                lang: 'Den',
                membership: 'freeguest',
                kocowa: 'false'
            }
		}
    },
    numberOfPods: 9,
	prebidTimeout: 7000,
	enablePrebidCache: true
};
