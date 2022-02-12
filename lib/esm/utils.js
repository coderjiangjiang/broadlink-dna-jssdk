export const combine = function ({ params = [], vals = [] }) {
    if (Array.isArray(params) && Array.isArray(vals)) {
        return params.reduce((acc, cur, idx) => {
            if (vals[idx].length > 1) {
                acc[cur] = vals[idx].map(item => item.val);
            }
            else {
                acc[cur] = vals[idx][0].val;
            }
            return acc;
        }, {});
    }
    else {
        console.error('_combine error !');
        return {};
    }
};
/*
*{            => params:[..]
* key:value
* }           => vals:[..]
* */
export const split = function (status) {
    const params = [], vals = [];
    let keys = Object.keys(status);
    for (let i = 0; i < keys.length; ++i) {
        let key = keys[i];
        let val = status[key];
        params.push(key);
        if (Array.isArray(val)) {
            vals.push(val.map(item => ({ 'val': item, 'idx': 1 })));
        }
        else {
            vals.push([{ 'val': val, 'idx': 1 }]);
        }
    }
    return { params, vals };
};
export const isFunction = function (func) {
    return Object.prototype.toString.call(func).slice(8, -1) === 'Function';
};
