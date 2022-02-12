export type CmdValTypes = string | number;
export type CmdValOriginTypes = {
    val: CmdValTypes;
    idx: number;
}[][];
export type CmdKeyTypes = string | string[];
export interface CmdOriginType {
    params: CmdKeyTypes,
    vals: CmdValOriginTypes
}
export type ControlStatus = Command | CmdKeyTypes;
export type ActTypes = 'get' | 'set' | 'timer';
export type apiName = '' | string;
export type ReadyType = 'online'|'device';
export interface Command {
    [params: string]: CmdValTypes
}
export interface Task {
    type: ActTypes,
    omit: boolean,
    (): Promise<any>
}
export interface Info {
    deviceID: string,
    subDeviceID: string,
    deviceName: string,
    deviceStatus: number | string
}
export interface ControlRes {
    status: number,
    msg: string
}

export interface Handler {
    (): void
}
export interface customNavBarConfig {
    titleBar?: { visibility?: boolean, backgroundColor?: string, padding?: boolean }
    rightButtons?: { handler: Handler | string, icon: string  }[],
    leftButton?: { handler: Handler | string, icon: string }
}