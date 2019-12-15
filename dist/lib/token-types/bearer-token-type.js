"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const invalid_argument_error_1 = require("../errors/invalid-argument-error");
class BearerTokenType {
    constructor(accessToken, accessTokenLifetime, refreshToken, scope, customAttributes) {
        if (!accessToken) {
            throw new invalid_argument_error_1.InvalidArgumentError('Missing parameter: `accessToken`');
        }
        this.accessToken = accessToken;
        this.accessTokenLifetime = accessTokenLifetime;
        this.refreshToken = refreshToken;
        this.scope = scope;
        if (customAttributes) {
            this.customAttributes = customAttributes;
        }
    }
    valueOf() {
        const object = {
            access_token: this.accessToken,
            token_type: 'Bearer',
        };
        if (this.accessTokenLifetime) {
            object.expires_in = this.accessTokenLifetime;
        }
        if (this.refreshToken) {
            object.refresh_token = this.refreshToken;
        }
        if (this.scope) {
            object.scope = this.scope;
        }
        for (const key in this.customAttributes) {
            if (this.customAttributes.hasOwnProperty(key)) {
                object[key] = this.customAttributes[key];
            }
        }
        return object;
    }
}
exports.BearerTokenType = BearerTokenType;
//# sourceMappingURL=bearer-token-type.js.map