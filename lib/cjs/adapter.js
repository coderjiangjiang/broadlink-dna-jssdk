"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const call_native_js_1 = require("./call-native.js");
const utils_js_1 = require("./utils.js");
const taskV2_js_1 = __importDefault(require("./taskV2.js"));
const navbar_js_1 = __importDefault(require("./navbar.js"));
const _getDeviceInfo = function () {
    return (0, call_native_js_1.callNative)('deviceinfo');
};
const _controlStatus = function (status, action) {
    let act = 'get', params = [], vals = [];
    if (Array.isArray(status)) {
        act = 'get';
        params = status;
    }
    else if (typeof status === 'object') {
        act = action;
        ({ params, vals } = (0, utils_js_1.split)(status));
    }
    return (0, call_native_js_1.dnaControl)({ act, params, vals }).then((response) => ({
        status: (0, utils_js_1.combine)(response.data)
    }));
};
const setDeviceStatus = function (status) {
    return _controlStatus(status, 'set');
};
const getDeviceStatus = function (params) {
    return _getDeviceInfo().then(function (info) {
        const deviceStatus = info.deviceStatus + '';
        if (deviceStatus !== '3' && deviceStatus !== '0') {
            return _controlStatus(params, 'get').then(function (result) {
                result['online'] = deviceStatus;
                result['name'] = info.deviceName;
                return result;
            });
        }
        else {
            return { online: deviceStatus, name: info.deviceName };
        }
    }).catch(function (e) {
        console.error(e);
        throw e || new Error('getDeviceStatus failed');
    });
};
const platformSDK = (() => {
    const closeWebView = function () {
        return (0, call_native_js_1.callNative)("closeWebView", []);
    };
    const openDevicePropertyPage = function () {
        return call_native_js_1.deviceInfoPromise.then((info) => (0, call_native_js_1.callNative)("openDevicePropertyPage", [{ did: info.deviceID }]));
    };
    return {
        taskV2: taskV2_js_1.default,
        navbar: navbar_js_1.default,
        closeWebView,
        openDevicePropertyPage,
        getDevice: () => call_native_js_1.deviceInfoPromise.then(device => device),
        callNative: call_native_js_1.callNative
    };
})();
const ready = (readyType = 'device') => readyType === 'online' ? call_native_js_1.cordovaReadyOnlinePromise : call_native_js_1.deviceInfoPromise;
const adapter = {
    platform: 'dna',
    ready,
    setDeviceStatus,
    getDeviceStatus,
    platformSDK,
};
exports.default = adapter;
