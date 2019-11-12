/**
 * URL Loader module.
 * @module UrlLoader
 */

import Logger from './Logging';

const _prefix = 'PrebidPlugin->URL Loader->'
function ajaxLoad(url, callback, timeout, options) {
    let httpRequest;

    let useWithCredentials = true;

	const debug = (message) => {
        Logger.log(_prefix, message);
	};

    if (options && typeof options.withCredentials !== 'undefined') {
        useWithCredentials = options.withCredentials;
    }

    httpRequest = new XMLHttpRequest();

    if (!httpRequest) {
        if (callback) {
            callback.call(this, '406', ''); // request is not acceptable
        }
        return;
    }

    httpRequest.onreadystatechange = () => {
        if (httpRequest.readyState === 4) {
            if (httpRequest.status === 200) {
                if (callback) {
                    callback.call(this, undefined, httpRequest.responseText);
                }
            }
            else {
                if (httpRequest.status >= 400 && httpRequest.status < 600) {
                    if (callback) {
                        callback.call(this, httpRequest.status, '');
                    }
                }
            }
        }
    };

    httpRequest.onerror = () => {
        // if there is an error, it might be becase we are using withCredentials
        // let's try one more time without that flag set.
        // this won't send cookies, but it's better than no ad at all
        if (useWithCredentials) {
            const newOpts = !!options ? options : {};
            newOpts.withCredentials = false;
            ajaxLoad(url, callback, timeout, newOpts);
        } else {
            if (callback) {
                var errorStatus = httpRequest.status === 0 ? '404' : httpRequest.status.toString();
                callback.call(this, errorStatus, '');
            }
        }
    };

    httpRequest.ontimeout = () => {
        debug('Server Timeout');
        if (callback) {
            callback.call(this, 'Timeout', '');
        }
    };

    httpRequest.open('GET', url);
    if (timeout) {
        httpRequest.timeout = timeout;
    }
    httpRequest.withCredentials = useWithCredentials;
    httpRequest.send();
}

// module.exports = {
export const Loader = {
        /** Load a URL.
     * @param {string} url - Target URL to load.
     * @param {Function} callback - Function to call back once loading has either completed or encountered an error.
     * @param {number} timeout - Timeout (in ms) to use for this URL Load.
     */
    load: (url, callback, timeout) => {
        ajaxLoad(url, callback, timeout, {withCredentials: true});
    }
};
