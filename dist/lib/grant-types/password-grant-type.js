"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const invalid_argument_error_1 = require("../errors/invalid-argument-error");
const invalid_grant_error_1 = require("../errors/invalid-grant-error");
const invalid_request_error_1 = require("../errors/invalid-request-error");
const is = require("../validator/is");
const abstract_grant_type_1 = require("./abstract-grant-type");
class PasswordGrantType extends abstract_grant_type_1.AbstractGrantType {
    constructor(options = {}) {
        super(options);
        if (!options.model) {
            throw new invalid_argument_error_1.InvalidArgumentError('Missing parameter: `model`');
        }
        if (!options.model.getUser) {
            throw new invalid_argument_error_1.InvalidArgumentError('Invalid argument: model does not implement `getUser()`');
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
        const scope = this.getScope(request);
        const user = await this.getUser(request);
        return this.saveToken(user, client, scope);
    }
    async getUser(request) {
        if (!request.body.username) {
            throw new invalid_request_error_1.InvalidRequestError('Missing parameter: `username`');
        }
        if (!request.body.password) {
            throw new invalid_request_error_1.InvalidRequestError('Missing parameter: `password`');
        }
        if (!is.uchar(request.body.username)) {
            throw new invalid_request_error_1.InvalidRequestError('Invalid parameter: `username`');
        }
        if (!is.uchar(request.body.password)) {
            throw new invalid_request_error_1.InvalidRequestError('Invalid parameter: `password`');
        }
        const user = await this.model.getUser(request.body.username, request.body.password);
        if (!user) {
            throw new invalid_grant_error_1.InvalidGrantError('Invalid grant: user credentials are invalid');
        }
        return user;
    }
    async saveToken(user, client, scope) {
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
            accessTokenExpiresAt,
            refreshToken,
            refreshTokenExpiresAt,
            scope: accessScope,
        };
        return this.model.saveToken(token, client, user);
    }
}
exports.PasswordGrantType = PasswordGrantType;
//# sourceMappingURL=password-grant-type.js.map