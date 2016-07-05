/**
 * Copyright 2015 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {computeInMasterFrame, loadScript} from '../3p/3p';
import {doubleclick} from '../ads/google/doubleclick';

/* global Criteo: false */

// This code comes from PublisherTag, it was just translated from Typescript to 
// Javascript In the future, some refactoring will be necessary to avoid code 
// duplication
function readCookie(cookieName) {
    var cookies = document.cookie.split(";");

    for (var i = 0; i < cookies.length; i++) {
        var cookie = cookies[i];
        var currentCookieName = cookie.substr(0, cookie.indexOf("="));
        var currentCookieValue = cookie.substr(cookie.indexOf("=") + 1);
        currentCookieName = currentCookieName.replace(/^\s+|\s+$/g, "");
        if(currentCookieName === cookieName) {
            return decodeURIComponent(currentCookieValue);
        }
    }
    return "";
}

function extractKeyValuesFromCrtgContent(crtgContentName) {

    if (window[crtgContentName] === undefined || window[crtgContentName] === "")
        return {};

    var labels = window[crtgContentName].split(";");

    var keyValues = {};
    for (var i = 0; i < labels.length; i++) {
        if (labels[i] === "")
            continue;

        var tmp = labels[i].split('=');
        if (tmp.length !== 2)
            continue;

        var key = tmp[0];
        var value = tmp[1];

        keyValues[key] = value; // TODO PublisherTag supports more than one value by key,
                                // but DFP only accepts one value by key.
    }

    return keyValues;
}

function computeDFPTargetingParameter() {
    return extractKeyValuesFromCrtgContent('crtg_content');
}

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function criteo(global, data) {
  loadScript(global, 'http://demo.criteo.com/m.almeida/ptag/publishertag.js', () => {
    if (data.adserver) { // if it's a RTA call
        if (!data.varname) {
            data.varname = Criteo.PubTag.RTA.DefaultCrtgContentName;
        }
        if (!data.cookiename) {
            data.cookiename = Criteo.PubTag.RTA.DefaultCrtgRtaCookieName;
        }

        // Make sure RTA is called only once
        computeInMasterFrame(window, 'call-rta', resultCallback => {
            params = { 'networkid': data.networkid, 'varname': data.varname, 'cookiename': data.cookiename };
            Criteo.CallRTA(params);
            Criteo.Log.Debug('RTA called.');
            resultCallback(null);
        }, result => {
            // This function will be called on all ads, first we make sure that we have the cookie set 
            // so that it can be fetched by the code in readCookie that comes from PublisherTag
            window[data.varname] = readCookie(data.cookiename);
            Criteo.Log.Debug('RTA Call finished... time to call DFP');

            if (data.adserver === "DFP") {
                var dbl_params = { 'slot' : data.slot,
                                   'targeting' : computeDFPTargetingParameter(),
                                   'width' : data.width,
                                    'height': data.height,
                                   'type' : 'criteo'
                                 };
                doubleclick(global, dbl_params);
            }
        });
    } else {
        Criteo.DisplayAd({ 'zoneid': data.zone, 'containerid': 'c', 'integrationmode': 'amp' });
        Criteo.Log.Debug('DisplayAd called');
    }
  });
}


