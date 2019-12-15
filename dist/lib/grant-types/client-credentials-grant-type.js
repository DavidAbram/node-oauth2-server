"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const invalid_argument_error_1 = require("../errors/invalid-argument-error");
const invalid_grant_error_1 = require("../errors/invalid-grant-error");
const abstract_grant_type_1 = require("./abstract-grant-type");
class ClientCredentialsGrantType extends abstract_grant_type_1.AbstractGrantType {
    constructor(options = {}) {
        super(options);
        if (!options.model) {
            throw new invalid_argument_error_1.InvalidArgumentError('Missing parameter: `model`');
        }
        if (!options.model.getUserFromClient) {
            throw new invalid_argument_error_1.InvalidArgumentError('Invalid argument: model does not implement `getUserFromClient()`');
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
        const user = await this.getUserFromClient(client);
        return this.saveToken(user, client, scope);
    }
    async getUserFromClient(client) {
        const user = await this.model.getUserFromClient(client);
        if (!user) {
            throw new invalid_grant_error_1.InvalidGrantError('Invalid grant: user credentials are invalid');
        }
        return user;
    }
    async saveToken(user, client, scope) {
        const fns = [
            this.validateScope(user, client, scope),
            this.generateAccessToken(client, user, scope),
            this.getAccessTokenExpiresAt(),
        ];
        const [accessScope, accessToken, accessTokenExpiresAt] = await Promise.all(fns);
        const token = {
            accessToken,
            accessTokenExpiresAt,
            scope: accessScope,
        };
        return this.model.saveToken(token, client, user);
    }
}
exports.ClientCredentialsGrantType = ClientCredentialsGrantType;
//# sourceMappingURL=client-credentials-grant-type.js.map