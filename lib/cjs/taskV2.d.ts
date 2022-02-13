import { Moment, Duration } from 'moment';
import { QueryList } from './types.js';
declare class Time {
    sun: string;
    duration: Duration;
    repeat: number[];
    moment: Moment;
    str: string;
    constructor(str?: string);
    isRepeated(): boolean;
    parse(str: string): void;
    clone(): any;
    toString(): string;
}
export declare class Timer {
    type: string | undefined;
    id: any;
    en: boolean | undefined;
    name: string | undefined;
    cmd: {} | undefined;
    time: Time;
    stime: Time;
    etime: Time;
    time1: Duration;
    time2: Duration;
    constructor(task: object | string);
    setRepeat(repeat: number[]): void;
    getRepeat(): number[];
    isRepeated(): boolean;
    _override<T>(fn: (argu: T) => any, ...fields: string[]): this;
    clone(): any;
    toOriginal(): {} & this;
}
export interface Rqs {
    timerlist: Timer[];
    did?: string;
    act?: number;
}
declare const taskV2: {
    add: (...tasks: Timer[] | [Rqs]) => Promise<any>;
    list: ({ type, count, index, did, }?: QueryList) => Promise<any>;
    del: (...tasks: Timer[] | [Rqs]) => Promise<any>;
    sunSetting: (setting: any) => Promise<any>;
    getLimitation: ({ type }?: any) => Promise<any>;
    call: <T>(request: T) => Promise<any>;
    Timer: typeof Timer;
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
export default taskV2;
//# sourceMappingURL=taskV2.d.ts.map