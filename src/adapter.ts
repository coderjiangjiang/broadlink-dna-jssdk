import { callNative, deviceInfoPromise, cordovaReadyOnlinePromise, dnaControl } from "./call-native.js";
import { split, combine } from "./utils.js";
import taskV2, { Timer,Rqs } from "./taskV2.js";
import navbar from "./navbar.js";
import { ReadyType, ActTypes, Command, CmdKeyTypes, CmdValOriginTypes, ControlStatus } from './types.js';

const _getDeviceInfo: any = function () {
    return callNative('deviceinfo');
};

const _controlStatus = function <T extends ControlStatus>(status: T, action: ActTypes) {
    let act: ActTypes = 'get', params: CmdKeyTypes = [], vals: CmdValOriginTypes = [];

    if (Array.isArray(status)) {
        act = 'get';
        params = status;
    } else if (typeof status === 'object') {
        act = action;
        ({ params, vals } = split(status));
    }

    return dnaControl({ act, params, vals }).then((response) => ({
        status: combine((response as any).data)
    }));

};

const setDeviceStatus = function (status: Command) {
    return _controlStatus(status, 'set');
};


const getDeviceStatus = function (params: CmdKeyTypes) {

    return _getDeviceInfo().then(function (info: { deviceName: string, deviceStatus: string }) {
        const deviceStatus = info.deviceStatus + '';
        if (deviceStatus !== '3' && deviceStatus !== '0') {
            return _controlStatus(params, 'get').then(function (result: any) {
                result['online'] = deviceStatus;
                result['name'] = info.deviceName;
                return result;
            });
        } else {
            return { online: deviceStatus, name: info.deviceName }
        }
    }).catch(function (e: Error) {
        console.error(e);
        throw e || new Error('getDeviceStatus failed');
    });
};

const platformSDK = (() => {

    const closeWebView = function () {
        return callNative("closeWebView", []);
    };
    const openDevicePropertyPage = function () {
        return deviceInfoPromise.then((info) => callNative("openDevicePropertyPage", [{ did: info.deviceID }]));
    };

    return {
        taskV2,
        navbar,
        closeWebView,
        openDevicePropertyPage,
        getDevice: () => deviceInfoPromise.then(device => device),
        callNative
    };
})();

const ready = (readyType: ReadyType = 'device') => readyType === 'online' ? cordovaReadyOnlinePromise : deviceInfoPromise;

const adapter = {
    platform: 'dna',
    ready,
    setDeviceStatus,
    getDeviceStatus,
    platformSDK,
};
export default adapter
