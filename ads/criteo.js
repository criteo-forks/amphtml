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

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function criteo(global, data) {
  loadScript(global, 'http://demo.criteo.com/m.almeida/dpp941/publishertag.js', () => {
    console.log(data)
    if (data.tagtype === "rta") {
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
            resultCallback(null);
        }, result => {
            if (data.adserver === "DFP") {
                var dbl_params = { 'slot' : data.slot,
                                   'targeting' : Criteo.ComputeDFPTargetingForAMP(data.cookiename, data.varname),
                                   'width' : data.width,
                                   'height': data.height,
                                   'type' : 'criteo'
                                 };
                console.log("Calling DFP");
                console.log(dbl_params);
                doubleclick(global, dbl_params);
            }
        });
   } else if (!data.tagtype || data.tagtype === 'passback') {
        Criteo.DisplayAd({ 'zoneid': data.zone, 'containerid': 'c', 'integrationmode': 'amp' });
    }
  });
}


