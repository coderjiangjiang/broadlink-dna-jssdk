import { Info, ControlRes } from './types.js';
import isMobile from 'ismobilejs';
export const isIOS = isMobile(window.navigator).apple.device;
const BRIDGE = "BLNativeBridge";
let onlineTag: boolean = false;

const _callNative = function <T>(action: string, params: any[] = [], bridge = BRIDGE): Promise<T> {
    const uuid = Date.now().toString(36);
    return new Promise(function (resolve, reject) {
        const tag = `${uuid} ${action} ${action === 'devicecontrol' ? params[2]['act'] : ''}`;
        console.time && console.time(tag);
        console.log(`---${tag} bridge-call \n params:${JSON.stringify(params)}`);
        function onSucceed(data: string) {
            console.log(`+++${uuid} bridge-call-success :${data}`);
            console.timeEnd && console.timeEnd(tag);
            let response: T;
            try {
                response = JSON.parse(data);
            } catch (e) {
                reject(e);
                return;
            }
            resolve(response);
        }

        function onFailed(e: Error) {
            console.error(`+++${uuid} bridge-call-fail :${JSON.stringify(e)}`);
            console.timeEnd && console.timeEnd(tag);
            reject(e);
        }

        window.cordova.exec(onSucceed, onFailed, bridge, action, params);
    });
};

const _cordovaReadyPromise = new Promise(function (resolve: (val?: unknown) => void, reject) {
    console.time('cordova');
    const script = document.createElement('script');
    script.src = '../../cordova.js';
    document.getElementsByTagName('head')[0].appendChild(script);
    document.addEventListener('deviceready', () => {
        console.timeEnd('cordova');
        resolve();
    }, false);
});

const cordovaReadyOnlinePromise: Promise<void> = new Promise(function (resolve, reject) {
    console.time('cordova for online page(not device page)');

    const script = document.createElement('script');
    script.src = `./cordova/${isIOS ? 'ios' : 'android'}/cordova.min.js`;
    document.getElementsByTagName('head')[0].appendChild(script);

    document.addEventListener('deviceready', () => {
        console.timeEnd('cordova for online page(not device page)');
        onlineTag = true;
        resolve();
    }, false);

});


const deviceInfoPromise = (async function () {
    await _cordovaReadyPromise;
    let info: Info;
    if (!onlineTag) {
        info = await _callNative('deviceinfo');
    } else {
        return {}
    }
    const device = {} as Info;
    Object.defineProperty(device, "deviceID", {
        value: info.deviceID || null,
        writable: false
    });
    Object.defineProperty(device, "subDeviceID", {
        value: info.subDeviceID || null,
        writable: false
    });
    Object.defineProperty(device, "deviceName", {
        value: info.deviceName || null,
        writable: false
    });
    if (device.deviceID) {
        return {
            online: info.deviceStatus + '',
            name: info.deviceName,
            deviceID: device.deviceID,
            subDeviceID: device.subDeviceID
        };
    } else {
        throw new Error('cant get device id');
    }
})();


const [localTimeout, remoteTimeout, sendCount] = (() => {
    /*eslint-disable*/
    const profile = window.PROFILE || {};
    const [local, remote] = profile.timeout || [3, 5];
    return [local * 1000, remote * 1000, profile.sendcount || 3];
})();




const callNativeSafe = ((...arg) => _cordovaReadyPromise.then(() => _callNative(...arg))) as (typeof _callNative);


const dnaControl = async function <T>(ctrlData: T, commandStr = 'dev_ctrl') {
    //控制请求超时时间
    const time = {
        "localTimeout": localTimeout, //本地超时时间
        "remoteTimeout": remoteTimeout, //远程超时时间
        'sendCount': sendCount  //请求个数
    };

    let device, response;
    if (onlineTag) {
        response = await _callNative<ControlRes>('devicecontrol', [(ctrlData as any).did || null, null, ctrlData, commandStr, time]);
    } else {
        device = await deviceInfoPromise;
        response = await await _callNative<ControlRes>('devicecontrol', [device.deviceID, device.subDeviceID, ctrlData, commandStr, time]);
    }

    // const device = await deviceInfoPromise;
    // const response = await _callNative<ControlRes>('devicecontrol', [device.deviceID, device.subDeviceID, ctrlData, commandStr, time]);

    if (response.status === 0) {
        return response;
    } else {
        let errorMsg = `control device failed.code: ${response.status}, msg: ${response.msg}`;
        // console.error(errorMsg);

        let error = new Error(errorMsg);
        (error as any).code = response.status;
        (error as any).msg = response.msg;
        throw error;
    }
};

export {
    callNativeSafe as callNative,
    dnaControl,
    deviceInfoPromise,
    cordovaReadyOnlinePromise
}