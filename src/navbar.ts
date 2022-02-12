import { callNative } from "./call-native.js";
import { isFunction } from "./utils.js";
import { customNavBarConfig, Handler } from './types.js'

const custom = function (config = {} as customNavBarConfig) {

    if (config.rightButtons && config.rightButtons.length) {
        for (let i = 0; i < config.rightButtons.length; i++) {
            if (config.rightButtons[i].handler && isFunction(config.rightButtons[i].handler)) {
                let name = "BL_NAVBAR_RIGHT_HANDLER" + i;
                window[name] = config.rightButtons[i].handler;
                (config.rightButtons[i].handler as any) = name;
            }
        }
    }

    if (config.leftButton && config.leftButton.handler && isFunction(config.leftButton.handler)) {
        let name = "BL_NAVBAR_LEFT_HANDLER";
        window[name] = config.leftButton.handler;
        (config.leftButton.handler as any) = name;
    }

    return callNative('custom', [config], 'Navbar').catch(e => console.warn(e.message));
};

const backHandler = function (handler: Handler) {
    return custom({
        leftButton: {
            icon: "appBackIcon",
            handler: handler
        }
    });
};

const hide = function () {
    return custom({
        "titleBar": {
            "visibility": false
        }
    })
};

const simple = function () {
    return custom();
};

const restore = function () {
    return custom({
        titleBar: {
            backgroundColor: '#000000',
            visibility: true,
            padding: false
        },
        rightButtons: [{
            icon: "appPropertyIcon",
            handler: "appProperty"
        }
        ]
    });
};

const transparent = function (options = {}) {
    return custom({
        titleBar: {
            backgroundColor: '#00FFFFFF',
            visibility: true,
            padding: true
        },
        ...options
    });
};

export default { backHandler, custom, simple, restore, transparent, hide };