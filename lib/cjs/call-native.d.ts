import { ControlRes } from './types.js';
export declare const isIOS: boolean;
declare const cordovaReadyOnline: () => Promise<void>;
declare const deviceInfoPromise: Promise<{
    online?: undefined;
    name?: undefined;
    deviceID?: undefined;
    subDeviceID?: undefined;
} | {
    online: string;
    name: string;
    deviceID: string;
    subDeviceID: string;
}>;
declare const callNativeSafe: <T>(action: string, params?: any[], bridge?: string) => Promise<T>;
declare const dnaControl: <T>(ctrlData: T, commandStr?: string) => Promise<ControlRes>;
export { callNativeSafe as callNative, dnaControl, deviceInfoPromise, cordovaReadyOnline };
//# sourceMappingURL=call-native.d.ts.map