"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const call_native_js_1 = require("./call-native.js");
const utils_js_1 = require("./utils.js");
const custom = function (config = {}) {
    if (config.rightButtons && config.rightButtons.length) {
        for (let i = 0; i < config.rightButtons.length; i++) {
            if (config.rightButtons[i].handler && (0, utils_js_1.isFunction)(config.rightButtons[i].handler)) {
                let name = "BL_NAVBAR_RIGHT_HANDLER" + i;
                window[name] = config.rightButtons[i].handler;
                config.rightButtons[i].handler = name;
            }
        }
    }
    if (config.leftButton && config.leftButton.handler && (0, utils_js_1.isFunction)(config.leftButton.handler)) {
        let name = "BL_NAVBAR_LEFT_HANDLER";
        window[name] = config.leftButton.handler;
        config.leftButton.handler = name;
    }
    return (0, call_native_js_1.callNative)('custom', [config], 'Navbar').catch(e => console.warn(e.message));
};
const backHandler = function (handler) {
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
    });
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
    return custom(Object.assign({ titleBar: {
            backgroundColor: '#00FFFFFF',
            visibility: true,
            padding: true
        } }, options));
};
exports.default = { backHandler, custom, simple, restore, transparent, hide };
