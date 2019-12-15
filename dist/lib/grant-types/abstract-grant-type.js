"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const invalid_argument_error_1 = require("../errors/invalid-argument-error");
const invalid_scope_error_1 = require("../errors/invalid-scope-error");
const tokenUtil = require("../utils/token-util");
const is = require("../validator/is");
class AbstractGrantType {
    constructor(options = {}) {
        this.getScope = (request) => {
            if (!is.nqschar(request.body.scope)) {
                throw new invalid_argument_error_1.InvalidArgumentError('Invalid parameter: `scope`');
            }
            return request.body.scope;
        };
        if (!options.accessTokenLifetime) {
            throw new invalid_argument_error_1.InvalidArgumentError('Missing parameter: `accessTokenLifetime`');
        }
        if (!options.model) {
            throw new invalid_argument_error_1.InvalidArgumentError('Missing parameter: `model`');
        }
        this.accessTokenLifetime = options.accessTokenLifetime;
        this.model = options.model;
        this.refreshTokenLifetime = options.refreshTokenLifetime;
        this.alwaysIssueNewRefreshToken = options.alwaysIssueNewRefreshToken;
    }
    async generateAccessToken(client, user, scope) {
        if (this.model.generateAccessToken) {
            const token = await this.model.generateAccessToken(client, user, scope);
            return token || tokenUtil.GenerateRandomToken();
        }
        return tokenUtil.GenerateRandomToken();
    }
    async generateRefreshToken(client, user, scope) {
        if (this.model.generateRefreshToken) {
            const token = await this.model.generateRefreshToken(client, user, scope);
            return token || tokenUtil.GenerateRandomToken();
        }
        return tokenUtil.GenerateRandomToken();
    }
    getAccessTokenExpiresAt() {
        const expires = new Date();
        expires.setSeconds(expires.getSeconds() + this.accessTokenLifetime);
        return expires;
    }
    getRefreshTokenExpiresAt() {
        const expires = new Date();
        expires.setSeconds(expires.getSeconds() + this.refreshTokenLifetime);
        return expires;
    }
    async validateScope(user, client, scope) {
        if (this.model.validateScope) {
            const sc = await this.model.validateScope(user, client, scope);
            if (!sc) {
                throw new invalid_scope_error_1.InvalidScopeError('Invalid scope: Requested scope is invalid');
            }
            return sc;
        }
        return scope;
    }
}
exports.AbstractGrantType = AbstractGrantType;
//# sourceMappingURL=abstract-grant-type.js.map