/**
 * Cross-player Prebid Plugin
 * @module PrebidPluginCP
 */

import Logger from './Logging';
import { Loader } from './UrlLoader';
import { PrebidCommunicator } from './PrebidCommunicator';

const DEFAULT_PREBID_JS_PATH = '//acdn.adnxs.com/prebid/not-for-prod/1/prebid.js';

const POST_MESSAGE_COMMAND = {
    REQUEST: 'PPCP:prebidRequest',
    RESPONSE: 'PPCP:prebidResponse',
    SYNC_REQUEST: 'PPCP:prebidUrlRequest',
    TRACE: 'PPCP:prebidMessage'
};

const RESPONSE_STATUS = {
    NOT_READY: 'unknown',
    FAILED: 'failed'
};

export class PrebidPluginCP {
    constructor() {
        this._prefix = 'PrebidPlugin->';
        Logger.always(this._prefix, 'Version 0.2.2');
        this.Communicator = PrebidCommunicator;
        // this.defaultUrl = 'http://video.devnxs.net/raj/outstream/video_AutoPlaySoundOn.xml';
        this.defaultUrl = undefined;
        this.options = null;

        this.dispatchMessageEvent = (text) => {
            const ev = new CustomEvent('prebidMessage', {detail: text});
            document.dispatchEvent(ev);
        };

        this.loadPrebidJS = (options, callback) => {
            if (document.getElementById('prebidJsScript') || window.pbjs) {
                callback(true);
                return;
            }
            const prebidPath = options.prebidPath ? options.prebidPath : DEFAULT_PREBID_JS_PATH;
            let scr = document.createElement('script');
            scr.type = 'text/javascript';
            scr.src = prebidPath;
            scr.onload = () => {
                callback(true);
            }
            scr.onerror = () => {
                callback(false);
            }
            document.getElementsByTagName('head')[0].appendChild(scr);
        };

        this.messageHandler = (event) => {
            // Logger.log(this._prefix, 'Got message.', event);
            if (event && event.data) {
                let data;
                try {
                    data = JSON.parse(event.data);
                    Logger.log(this._prefix, 'Got message.', event);
                }
                catch (err) {
                    // Logger.log(this._prefix, 'Invalid message data');
                    return;
                }
                const frameWnd = event.source;
                Logger.log(this._prefix, 'Message data:', event.data);
                const sendResponse = (url) => {
                    // send response to source window (iframe)
                    Logger.log(this._prefix, 'Post url:', url);
                    const response = {
                        command: POST_MESSAGE_COMMAND.RESPONSE,
                        messageId: data.messageId,
                        url: url
                    };
                    const sendingData = JSON.stringify(response);
                    frameWnd.postMessage(sendingData, '*');
                };
                if (data.command === POST_MESSAGE_COMMAND.REQUEST) {
                    if (data.options) {
                        Logger.log(this._prefix, 'Prebid options:', data.options);
                        this.loadPrebidJS(data.options, (succ) => {
                            if (succ) {
                                Logger.log(this._prefix, 'prebid.js is loaded');
                                // request prebid
                                // let communicator = new PrebidCommunicator(data.options);
                                let communicator = new this.Communicator(data.options);
                                communicator.getVastUrl(2000, (url) => {
                                    sendResponse(!!url ? url : RESPONSE_STATUS.FAILED);
                                });
                            }
                            else {
                                Logger.error(this._prefix, 'Failed to load prebid.js');
                                sendResponse(RESPONSE_STATUS.FAILED);
                            }
                        });
                    }
                    else {
                        const gotDefaultUrl = (event) => {
                            document.removeEventListener('gotDefaultUrl', gotDefaultUrl);
                            if (this.defaultUrl === null) {
                                sendResponse(RESPONSE_STATUS.FAILED);
                            }
                            else {
                                sendResponse(this.defaultUrl);
                            }
                        };
                        if (this.defaultUrl !== undefined) {
                            if (this.defaultUrl === null) {
                                sendResponse(RESPONSE_STATUS.FAILED);
                            }
                            else {
                                sendResponse(this.defaultUrl);
                            }
                        }
                        else {
                            document.addEventListener('gotDefaultUrl', gotDefaultUrl);
                        }
                    }
                }
                else if (data.command === POST_MESSAGE_COMMAND.SYNC_REQUEST) {
                    if (this.defaultUrl) {
                        sendResponse(this.defaultUrl);
                    }
                    else if (this.defaultUrl === null) {
                        sendResponse(RESPONSE_STATUS.FAILED);
                    }
                    else {
                        sendResponse(RESPONSE_STATUS.NOT_READY);
                    }
                }
                else if (data.command === POST_MESSAGE_COMMAND.TRACE) {
                    this.dispatchMessageEvent(data.message);
                }
            }
        };

        this.dispatchInternalEvent = (name) => {
            var event;
            if (typeof (Event) === 'function') {
                event = new Event(name);
            } else {
                event = document.createEvent('Event');
                event.initEvent(name, true, true);
            }
            document.dispatchEvent(event);
        };

        this.continueDoPrebid = () => {
            this.loadPrebidJS(this.options, (succ) => {
                if (succ) {
                    Logger.log(this._prefix, 'prebid.js is loaded');
                    // request prebid
                    // let communicator = new PrebidCommunicator(this.options);
                    let communicator = new this.Communicator(this.options);
                    this.dispatchMessageEvent('Request Prebid for VAST url');
                    communicator.getVastUrl(2000, (url) => {
                        this.defaultUrl = !!url ? url : null;
                        communicator = null;
                        this.dispatchInternalEvent('gotDefaultUrl');
                    });
                }
                else {
                    Logger.error(this._prefix, 'Failed to load prebid.js');
                    this.defaultUrl = null;
                    this.dispatchInternalEvent('gotDefaultUrl');
                }
            });
        }

        window.addEventListener('message', this.messageHandler);

        this.dispatchMessageEvent('Prebid Plugin instantiated');
    }

    doPrebid(options) {
        if (options) {
            if (typeof options === 'string') {
                // options url
                Loader.load(options,
                    (errorCode, data) => {
                        if (errorCode) {
                            Logger.error(this._prefix, `Failed to get default prebid options. Error status: ${errorCode}`);
                            this.defaultUrl = null;
                            this.dispatchInternalEvent('gotDefaultUrl');
                        }
                        else {
                            this.options = JSON.parse(data);
                            Logger.log(this._prefix, 'Prebid options:', this.options);
                            this.continueDoPrebid();
                        }
                    }, 2000);
            }
            else {
                // options object
                this.options = options;
                this.continueDoPrebid();
            }
        }
    }

    // @exclude
    // Method exposed only for unit Testing Purpose
    // Gets stripped off in the actual build artifact
	test() {
		return {
			setCommunicator: (val) => {
                this.Communicator = val;
            }
		};
	};
	// @endexclude
}

// module.exports = PrebidPluginCP;

// pollyfill for IE 11 support
if (navigator.userAgent.indexOf('Trident/7.0') > -1) {
    (function () {
        if (typeof window.CustomEvent === 'function') return false;

        function CustomEvent (event, params) {
            params = params || { bubbles: false, cancelable: false, detail: undefined };
            let evt = document.createEvent('CustomEvent');
            evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);
            return evt;
        }

        CustomEvent.prototype = window.Event.prototype;

        window.CustomEvent = CustomEvent;
   })();
}

if (typeof Object.assign !== 'function') {
    // Must be writable: true, enumerable: false, configurable: true
    Object.defineProperty(Object, 'assign', {
      value: function assign(target, varArgs) { // .length of function is 2
        'use strict';
        if (target === null || target === undefined) {
          throw new TypeError('Cannot convert undefined or null to object');
        }

        var to = Object(target);

        for (var index = 1; index < arguments.length; index++) {
          var nextSource = arguments[index];

          if (nextSource !== null && nextSource !== undefined) {
            for (var nextKey in nextSource) {
              // Avoid bugs when hasOwnProperty is shadowed
              if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
                to[nextKey] = nextSource[nextKey];
              }
            }
          }
        }
        return to;
      },
      writable: true,
      configurable: true
    });
}

window.prebidPluginCP = new PrebidPluginCP();
