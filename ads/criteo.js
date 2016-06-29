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

/* global Criteo: false */

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function criteo(global, data) {
  loadScript(global, 'https://static.criteo.net/js/ld/publishertag.js', () => {
    Criteo.DisplayAd({'zoneid': data.zone, 'async': true, 'containerid': 'c'});

    if (data.id) {
        Criteo.Log.Debug('DisplayAd. id - ' + data.id);
    }

    if (data.networkid) {
        computeInMasterFrame(window, 'call-rta', resultCallback => {
            params = { 'networkid': data.networkid };
            if (data.varname) {
                params['varname'] = data.varname;
            }
            if (data.cookiename) {
                params['cookiename'] = data.cookiename;
            }
            Criteo.Log.Debug('RTA called. id - ' + data.id);
            Criteo.CallRTA(params);
            resultCallback(null);
        }, result => {

        });
    }
  });
}
