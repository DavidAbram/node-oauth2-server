"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const invalid_argument_error_1 = require("../errors/invalid-argument-error");
const invalid_grant_error_1 = require("../errors/invalid-grant-error");
const invalid_request_error_1 = require("../errors/invalid-request-error");
const server_error_1 = require("../errors/server-error");
const is = require("../validator/is");
const abstract_grant_type_1 = require("./abstract-grant-type");
class RefreshTokenGrantType extends abstract_grant_type_1.AbstractGrantType {
    constructor(options = {}) {
        super(options);
        if (!options.model) {
            throw new invalid_argument_error_1.InvalidArgumentError('Missing parameter: `model`');
        }
        if (!options.model.getRefreshToken) {
            throw new invalid_argument_error_1.InvalidArgumentError('Invalid argument: model does not implement `getRefreshToken()`');
        }
        if (!options.model.revokeToken) {
            throw new invalid_argument_error_1.InvalidArgumentError('Invalid argument: model does not implement `revokeToken()`');
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
        const token = await this.getRefreshToken(request, client);
        await this.revokeToken(token);
        return this.saveToken(token.user, client, token.scope);
    }
    async getRefreshToken(request, client) {
        if (!request.body.refresh_token) {
            throw new invalid_request_error_1.InvalidRequestError('Missing parameter: `refresh_token`');
        }
        if (!is.vschar(request.body.refresh_token)) {
            throw new invalid_request_error_1.InvalidRequestError('Invalid parameter: `refresh_token`');
        }
        const token = await this.model.getRefreshToken(request.body.refresh_token);
        if (!token) {
            throw new invalid_grant_error_1.InvalidGrantError('Invalid grant: refresh token is invalid');
        }
        if (!token.client) {
            throw new server_error_1.ServerError('Server error: `getRefreshToken()` did not return a `client` object');
        }
        if (!token.user) {
            throw new server_error_1.ServerError('Server error: `getRefreshToken()` did not return a `user` object');
        }
        if (token.client.id !== client.id) {
            throw new invalid_grant_error_1.InvalidGrantError('Invalid grant: refresh token is invalid');
        }
        if (token.refreshTokenExpiresAt &&
            !(token.refreshTokenExpiresAt instanceof Date)) {
            throw new server_error_1.ServerError('Server error: `refreshTokenExpiresAt` must be a Date instance');
        }
        if (token.refreshTokenExpiresAt &&
            token.refreshTokenExpiresAt < new Date()) {
            throw new invalid_grant_error_1.InvalidGrantError('Invalid grant: refresh token has expired');
        }
        return token;
    }
    async revokeToken(token) {
        if (this.alwaysIssueNewRefreshToken === false) {
            return token;
        }
        const status = await this.model.revokeToken(token);
        if (!status) {
            throw new invalid_grant_error_1.InvalidGrantError('Invalid grant: refresh token is invalid');
        }
        return token;
    }
    async saveToken(user, client, scope) {
        const fns = [
            this.generateAccessToken(client, user, scope),
            this.generateRefreshToken(client, user, scope),
            this.getAccessTokenExpiresAt(),
            this.getRefreshTokenExpiresAt(),
        ];
        const [accessToken, refreshToken, accessTokenExpiresAt, refreshTokenExpiresAt,] = await Promise.all(fns);
        const token = {
            accessToken,
            accessTokenExpiresAt,
            scope,
        };
        if (this.alwaysIssueNewRefreshToken !== false) {
            token.refreshToken = refreshToken;
            token.refreshTokenExpiresAt = refreshTokenExpiresAt;
        }
        const savedToken = await this.model.saveToken(token, client, user);
        return savedToken;
    }
}
exports.RefreshTokenGrantType = RefreshTokenGrantType;
//# sourceMappingURL=refresh-token-grant-type.js.map