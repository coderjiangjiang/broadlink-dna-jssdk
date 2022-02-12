export declare type CmdValTypes = string | number;
export declare type CmdValOriginTypes = {
    val: CmdValTypes;
    idx: number;
}[][];
export declare type CmdKeyTypes = string | string[];
export interface CmdOriginType {
    params: CmdKeyTypes;
    vals: CmdValOriginTypes;
}
export declare type ControlStatus = Command | CmdKeyTypes;
export declare type ActTypes = 'get' | 'set' | 'timer';
export declare type apiName = '' | string;
export declare type ReadyType = 'online' | 'device';
export interface Command {
    [params: string]: CmdValTypes;
}
export interface Task {
    type: ActTypes;
    omit: boolean;
    (): Promise<any>;
}
export interface Info {
    deviceID: string;
    subDeviceID: string;
    deviceName: string;
    deviceStatus: number | string;
}
export interface ControlRes {
    status: number;
    msg: string;
}
export interface Handler {
    (): void;
}
export interface customNavBarConfig {
    titleBar?: {
        visibility?: boolean;
        backgroundColor?: string;
        padding?: boolean;
    };
    rightButtons?: {
        handler: Handler | string;
        icon: string;
    }[];
    leftButton?: {
        handler: Handler | string;
        icon: string;
    };
}
//# sourceMappingURL=types.d.ts.map