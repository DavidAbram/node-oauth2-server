"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const invalid_argument_error_1 = require("../errors/invalid-argument-error");
const invalid_grant_error_1 = require("../errors/invalid-grant-error");
const invalid_request_error_1 = require("../errors/invalid-request-error");
const server_error_1 = require("../errors/server-error");
const is = require("../validator/is");
const abstract_grant_type_1 = require("./abstract-grant-type");
class AuthorizationCodeGrantType extends abstract_grant_type_1.AbstractGrantType {
    constructor(options = {}) {
        super(options);
        this.validateRedirectUri = (request, code) => {
            if (!code.redirectUri) {
                return;
            }
            const redirectUri = request.body.redirect_uri || request.query.redirect_uri;
            if (!is.uri(redirectUri)) {
                throw new invalid_request_error_1.InvalidRequestError('Invalid request: `redirect_uri` is not a valid URI');
            }
            if (redirectUri !== code.redirectUri) {
                throw new invalid_request_error_1.InvalidRequestError('Invalid request: `redirect_uri` is invalid');
            }
        };
        if (!options.model) {
            throw new invalid_argument_error_1.InvalidArgumentError('Missing parameter: `model`');
        }
        if (!options.model.getAuthorizationCode) {
            throw new invalid_argument_error_1.InvalidArgumentError('Invalid argument: model does not implement `getAuthorizationCode()`');
        }
        if (!options.model.revokeAuthorizationCode) {
            throw new invalid_argument_error_1.InvalidArgumentError('Invalid argument: model does not implement `revokeAuthorizationCode()`');
        }
        if (!options.model.saveToken) {
            throw new invalid_argument_error_1.InvalidArgumentError('Invalid argument: model does not implement `saveToken()`');
        }
    }
    async handle(request, client) {
        if (!request) {
            throw new invalid_argument_error_1.InvalidArgumentError('Missing parameter: `request`');
        }
        if (!client) {
            throw new invalid_argument_error_1.InvalidArgumentError('Missing parameter: `client`');
        }
        const code = await this.getAuthorizationCode(request, client);
        this.validateRedirectUri(request, code);
        await this.revokeAuthorizationCode(code);
        return this.saveToken(code.user, client, code.authorizationCode, code.scope);
    }
    async getAuthorizationCode(request, client) {
        if (!request.body.code) {
            throw new invalid_request_error_1.InvalidRequestError('Missing parameter: `code`');
        }
        if (!is.vschar(request.body.code)) {
            throw new invalid_request_error_1.InvalidRequestError('Invalid parameter: `code`');
        }
        const code = await this.model.getAuthorizationCode(request.body.code);
        if (!code) {
            throw new invalid_grant_error_1.InvalidGrantError('Invalid grant: authorization code is invalid');
        }
        if (!code.client) {
            throw new server_error_1.ServerError('Server error: `getAuthorizationCode()` did not return a `client` object');
        }
        if (!code.user) {
            throw new server_error_1.ServerError('Server error: `getAuthorizationCode()` did not return a `user` object');
        }
        if (code.client.id !== client.id) {
            throw new invalid_grant_error_1.InvalidGrantError('Invalid grant: authorization code is invalid');
        }
        if (!(code.expiresAt instanceof Date)) {
            throw new server_error_1.ServerError('Server error: `expiresAt` must be a Date instance');
        }
        if (code.expiresAt < new Date()) {
            throw new invalid_grant_error_1.InvalidGrantError('Invalid grant: authorization code has expired');
        }
        if (code.redirectUri && !is.uri(code.redirectUri)) {
            throw new invalid_grant_error_1.InvalidGrantError('Invalid grant: `redirect_uri` is not a valid URI');
        }
        return code;
    }
    async revokeAuthorizationCode(code) {
        const status = await this.model.revokeAuthorizationCode(code);
        if (!status) {
            throw new invalid_grant_error_1.InvalidGrantError('Invalid grant: authorization code is invalid');
        }
        return code;
    }
    async saveToken(user, client, authorizationCode, scope) {
        const fns = [
            this.validateScope(user, client, scope),
            this.generateAccessToken(client, user, scope),
            this.generateRefreshToken(client, user, scope),
            this.getAccessTokenExpiresAt(),
            this.getRefreshTokenExpiresAt(),
        ];
        const [accessScope, accessToken, refreshToken, accessTokenExpiresAt, refreshTokenExpiresAt,] = await Promise.all(fns);
        const token = {
            accessToken,
            authorizationCode,
            accessTokenExpiresAt,
            refreshToken,
            refreshTokenExpiresAt,
            scope: accessScope,
        };
        return this.model.saveToken(token, client, user);
    }
}
exports.AuthorizationCodeGrantType = AuthorizationCodeGrantType;
//# sourceMappingURL=authorization-code-grant-type.js.map