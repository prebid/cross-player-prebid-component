/**
 * Prebid.js Communication module.
 * @module PrebidCommunicator
 */

import Logger from './Logging';
const _prefix = 'PrebidPlugin->PrebidCommunicator->';

let _lpbjsIsBusy = false;
const DEFAULT_PREBID_CACHE_URL = '//prebid.adnxs.com/pbc/v1/cache';

export class PrebidCommunicator {
	constructor (options) {
		this.options = options;

        this.dispatchMessageEvent = (text) => {
            const ev = new CustomEvent('prebidMessage', {detail: text});
            document.dispatchEvent(ev);
        };

		this.invokePrebidJs = (callback) => {
			let loaclPBJS = pbjs;
			if (loaclPBJS && this.options.biddersSpec) {
				// loaclPBJS.adUnits = [];
				loaclPBJS.bidderSettings = {};
				loaclPBJS.medianetGlobals = {};

				loaclPBJS.que = loaclPBJS.que || [];

				// This function enumerates all aliases for bidder adapters and defines them in prebid.js.
				// bidderAliases is array of object each of them defines pair of alias/bidder.
				// bc_pbjs is prebid.js instance.
				const specifyBidderAliases = (bidderAliases, cp_pbjs) => {
					if (bidderAliases && Array.isArray(bidderAliases) && bidderAliases.length > 0) {
						for (let i = 0; i < bidderAliases.length; i++) {
							if (bidderAliases[i].bidderName && bidderAliases[i].name) {
								// defines alias for bidder adapter in prebid.js
								cp_pbjs.aliasBidder(bidderAliases[i].bidderName, bidderAliases[i].name);
							}
						}
					}
				}

				// This function converts 'val' properties in bidderSettings represented as string array to inline functions.
				// We recommend to use string array in bidderSettings only when options are defined for Brightcove player
				// in Brightcove studio.
				const prepareBidderSettings = (options) => {
					if (options.bidderSettings) {
						const subtituteToEval = (arr, obj) => {
							if (arr.length > 1 && arr[0] === 'valueIsFunction') {
								arr.shift();
								const str = arr.join('');
								// eslint-disable-next-line no-eval
								eval('obj.val = ' + str); // jshint ignore:line
							}
						};
						const findValProperty = (obj) => {
							for (let name in obj) {
								if (name.toLowerCase() === 'val') {
									if (Array.isArray(obj.val)) {
										subtituteToEval(obj.val, obj);
									}
								}
								else if (obj[name] instanceof Object) {
									findValProperty(obj[name]);
								}
							}
						};
						if (options.bidderSettings) {
							findValProperty(options.bidderSettings);
						}
					}
				}

				//
				// Prebid Video adUnit
				//
				const logBids = (bids) => {
					Logger.log(_prefix, 'MESSAGE: got bids back: ', bids);
					const arrBids = (this.options.biddersSpec && bids && typeof bids !== 'string' && bids[this.options.biddersSpec.code]) ? bids[this.options.biddersSpec.code].bids : [];
					this.dispatchMessageEvent(`Prebid.js got ${arrBids.length} bids`);
				};

				loaclPBJS.que.push(() => {
					// loaclPBJS.removeAdUnit(this.options.biddersSpec.code);
					specifyBidderAliases(this.options.bidderAliases, loaclPBJS);
					prepareBidderSettings(this.options);
					if (this.options.bidderSettings) {
						loaclPBJS.bidderSettings = this.options.bidderSettings;
					}
					if (this.options.hasOwnProperty('numberOfPods') && this.options.numberOfPods > 0) {
						let adUnits = [];
						for (let i = 0; i < this.options.numberOfPods; i++) {
							let spec = Object.assign({}, this.options.biddersSpec);
							spec.code = `${this.options.code}_${i + 1}`;
							adUnits.push(spec);
						}
						loaclPBJS.addAdUnits(adUnits);
					}
					else {
						// let spec = Object.assign({}, this.options.biddersSpec);
						// spec.code += `${Date.now()}`;
						loaclPBJS.addAdUnits(this.options.biddersSpec); // add your ad units to the bid request
						// loaclPBJS.addAdUnits(spec); // add your ad units to the bid request
					}

					if (this.options.prebidConfigOptions) {
						// Enable Prebid Cache by default
						if (this.options.enablePrebidCache !== false) {
							this.options.enablePrebidCache = true;
							// If no Prebid Cache url is set, use AppNexus' Prebid Cache by default
							if (!this.options.prebidConfigOptions.cache) {
								this.options.prebidConfigOptions.cache = {};
							}
							if (!this.options.prebidConfigOptions.cache.url) {
								const defaultCacheURL = DEFAULT_PREBID_CACHE_URL;
								this.options.prebidConfigOptions.cache.url = defaultCacheURL;
								Logger.log(_prefix, `No Prebid Cache url set - using default: ${defaultCacheURL}`);
							}
						} else {
							// DFP requires Prebid Cache, but otherwise remove the unused cache object if present
							if (this.options.prebidConfigOptions.cache && !this.options.dfpParameters) {
								delete this.options.prebidConfigOptions.cache;
							}
						}
						loaclPBJS.setConfig(this.options.prebidConfigOptions);
					}

					this.dispatchMessageEvent('Prebid.js requests bids');
					// for (let i = 0; i < this.options.numberOfPods; i++) {
						loaclPBJS.requestBids({
							// adUnitCodes: [`my-video-tag_${i + 1}`],
							timeout: (this.options.prebidTimeout && this.options.prebidTimeout > 0) ? this.options.prebidTimeout : 700,
							bidsBackHandler: function (bids) { // this function will be called once bids are returned
								logBids(bids);
								// callback(bids);
							}
						});
					// }
				});
			}
			else {
				callback(null);
			}
		};

		this.doPrebid = (callback) => {
			_lpbjsIsBusy = true;
			// call bidding
			if (this.options.biddersSpec) {
				this.invokePrebidJs((bids) => {
					const selectWinnerByCPM = (arrBids) => {
						let cpm = 0.0;
						let creative;
						let cacheKey;
						for (let i = 0; i < arrBids.length; i++) {
							if (arrBids[i].cpm > cpm) {
								cpm = arrBids[i].cpm;
								creative = arrBids[i].vastUrl;
								cacheKey = arrBids[i].videoCacheKey;
							}
						}
						// get prebid cache url for winner
						if (cacheKey && cacheKey.length > 0 && this.options.prebidConfigOptions &&
							this.options.prebidConfigOptions.cache && this.options.prebidConfigOptions.cache.url) {
							creative = this.options.prebidConfigOptions.cache.url + '?uuid=' + cacheKey;
						}
						Logger.log(_prefix, 'Selected VAST url: ' + creative);
						this.dispatchMessageEvent(`Prebid Plugin selects ad with higher CPM. Higher CPM is ${cpm}.`);
						return creative;
					}
					const arrBids = (this.options.biddersSpec && bids && typeof bids !== 'string' && bids[this.options.biddersSpec.code]) ? bids[this.options.biddersSpec.code].bids : [];
					Logger.log(_prefix, 'bids for bidding: ', arrBids);
					let loaclPBJS = pbjs;
					if (arrBids && Array.isArray(arrBids)) {
						let creative;
						if (this.options.dfpParameters) {
							// use DFP server if DFP settings are present in options
							Logger.log(_prefix, 'Use DFP');
							if (arrBids.length === 0 && typeof bids === 'string') {
								// bids is a dfp vast url
								creative = bids;
							}
							else {
								let dfpOpts = {adUnit: this.options.biddersSpec};
								if (this.options.dfpParameters.url && this.options.dfpParameters.url.length > 0) {
									dfpOpts.url = this.options.dfpParameters.url;
								}
								if (this.options.dfpParameters.params && this.options.dfpParameters.params.hasOwnProperty('iu')) {
									dfpOpts.params = this.options.dfpParameters.params;
								}
								if (this.options.dfpParameters.bid && Object.keys(this.options.dfpParameters.bid).length > 0) {
									dfpOpts.bid = this.options.dfpParameters.bid;
								}
								this.dispatchMessageEvent(`Prebid.js makes request GAM for VAST url`);
								if (this.options.hasOwnProperty('numberOfPods')) {
									if (this.options.numberOfPods > 0) {
										// let creatives = [];
										dfpOpts.code = this.options.biddersSpec.code;
										dfpOpts.callback = (err, tag) => {
											if (err) {
												callback(null);
												// creatives.push(null);
											}
											else {
												// add custom parameters
												if (dfpOpts.params && dfpOpts.params.cust_params) {
													Object.keys(dfpOpts.params.cust_params).forEach(key => {
														const value = dfpOpts.params.cust_params[key];
														const kvp = `&${key}=${value}`;
														tag += encodeURIComponent(kvp);
													});
												}
												callback(tag);
												// creatives.push(null);
											}
											/* if (creatives.length === this.options.numberOfPods) {
												callback(creatives);
											} */
										};
										// for (let i = 0; i < this.options.numberOfPods; i++) {
										//	dfpOpts.code = `${this.options.code}_${i + 1}`;
											loaclPBJS.adServers.dfp.buildAdpodVideoUrl(dfpOpts);
										// }
									}
									else {
										Logger.log(_prefix, 'Invalid numberOfPods setting');
										callback(null);
									}
								}
								else {
									Logger.log(_prefix, 'DFP buildVideoUrl options: ', dfpOpts);
									creative = loaclPBJS.adServers.dfp.buildVideoUrl(dfpOpts);
								}
							}
						}
						else {
							// select vast url from bid with higher cpm
							Logger.log(_prefix, 'Select winner by CPM');
							creative = selectWinnerByCPM(arrBids);
							callback(creative);
						}
					}
					else {
						Logger.log(_prefix, 'Selected VAST url: null');
						callback(null);
					}
					_lpbjsIsBusy = false;
				});
			}
			else {
				callback(null);
				_lpbjsIsBusy = false;
			}
		};

		this.doPrebidForPod = (creatives, podCount) => {
			this.doPrebid((creative) => {
				creatives.push(creative);
				// if (creatives.length < podCount) {
				// 	this.doPrebidForPod(creatives, podCount);
				// }
			});
		}

		this.prepareDoPrebid = (callback) => {
			this.options.code = this.options.biddersSpec.code;
			if (this.options.hasOwnProperty('numberOfPods') && this.options.numberOfPods > 0) {
				let creatives = [];
				this.doPrebidForPod(creatives, this.options.numberOfPods);
				callback(creatives);
			}
			else {
				this.doPrebid(callback);
			}
		}
	}

	getVastUrl (timeout, callback) {
		const stopTime = Date.now() + timeout;
		const waitPbjs = setInterval(() => {
			if (Date.now() >= stopTime) {
				clearInterval(waitPbjs);
				callback(null);
			}
			if (!_lpbjsIsBusy) {
				clearInterval(waitPbjs);
				this.dispatchMessageEvent('Prebid.js is ready for bidding');
				this.prepareDoPrebid(callback);
			}
		}, 50);
	}

    // @exclude
    // Method exposed only for unit Testing Purpose
    // Gets stripped off in the actual build artifact
	test () {
		return {
			setPbjsBusy: (val) => { _lpbjsIsBusy = val; }
		};
	};
	// @endexclude
}
