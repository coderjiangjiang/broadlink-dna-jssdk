import { Command, CmdKeyTypes, ReadyType } from './types.js';
declare const jssdk: {
    ready: (readyType?: ReadyType) => Promise<void | {
        online: string;
        name: string;
        deviceID: string;
        subDeviceID: string;
    }>;
    platformSDK: {
        taskV2: {
            add: (...tasks: any[] | import("./taskV2.js").Timer[]) => Promise<any>;
            list: ({ type, count, index, did, }?: any) => Promise<any>;
            del: (...tasks: any[] | import("./taskV2.js").Timer[]) => Promise<any>;
            sunSetting: (setting: any) => Promise<any>;
            getLimitation: ({ type }?: any) => Promise<any>;
            call: <T>(request: T) => Promise<any>;
            Timer: typeof import("./taskV2.js").Timer;
            TYPE_COMMON: string;
            TYPE_DELAY: string;
            TYPE_PERIOD: string;
            TYPE_CYCLE: string;
            TYPE_RAND: string;
            TYPE_ALL: string;
            BEFORE_SUN_SET: string;
            BEFORE_SUN_RISE: string;
            AFTER_SUN_SET: string;
            AFTER_SUN_RISE: string;
        };
        navbar: {
            backHandler: (handler: import("./types.js").Handler) => Promise<unknown>;
            custom: (config?: import("./types.js").customNavBarConfig) => Promise<unknown>;
            simple: () => Promise<unknown>;
            restore: () => Promise<unknown>;
            transparent: (options?: {}) => Promise<unknown>;
            hide: () => Promise<unknown>;
        };
        closeWebView: () => Promise<unknown>;
        openDevicePropertyPage: () => Promise<unknown>;
        getDevice: () => Promise<{
            online: string;
            name: string;
            deviceID: string;
            subDeviceID: string;
        }>;
        callNative: <T_1>(action: string, params?: any[], bridge?: string) => Promise<T_1>;
    };
    setDeviceStatus: (cmd: Command) => Promise<unknown>;
    getDeviceStatus: (params: CmdKeyTypes) => any;
    platform: string;
};
export default jssdk;
//# sourceMappingURL=index.d.ts.map