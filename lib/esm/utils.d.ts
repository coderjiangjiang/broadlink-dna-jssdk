import { Command, CmdValOriginTypes, CmdOriginType } from './types.js';
export declare const combine: ({ params, vals }: CmdOriginType) => Command;
export declare const split: (status: Command) => {
    params: string[];
    vals: CmdValOriginTypes;
};
export declare const isFunction: (func: any) => boolean;
//# sourceMappingURL=utils.d.ts.map