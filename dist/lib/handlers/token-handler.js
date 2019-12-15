"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const auth = require("basic-auth");
const lodash_1 = require("lodash");
const invalid_argument_error_1 = require("../errors/invalid-argument-error");
const invalid_client_error_1 = require("../errors/invalid-client-error");
const invalid_request_error_1 = require("../errors/invalid-request-error");
const oauth_error_1 = require("../errors/oauth-error");
const server_error_1 = require("../errors/server-error");
const unauthorized_client_error_1 = require("../errors/unauthorized-client-error");
const unsupported_grant_type_error_1 = require("../errors/unsupported-grant-type-error");
const authorization_code_grant_type_1 = require("../grant-types/authorization-code-grant-type");
const client_credentials_grant_type_1 = require("../grant-types/client-credentials-grant-type");
const password_grant_type_1 = require("../grant-types/password-grant-type");
const refresh_token_grant_type_1 = require("../grant-types/refresh-token-grant-type");
const token_model_1 = require("../models/token-model");
const request_1 = require("../request");
const response_1 = require("../response");
const bearer_token_type_1 = require("../token-types/bearer-token-type");
const is = require("../validator/is");
const grantTypes = {
    authorization_code: authorization_code_grant_type_1.AuthorizationCodeGrantType,
    client_credentials: client_credentials_grant_type_1.ClientCredentialsGrantType,
    password: password_grant_type_1.PasswordGrantType,
    refresh_token: refresh_token_grant_type_1.RefreshTokenGrantType,
};
class TokenHandler {
    constructor(options = {}) {
        this.getTokenType = model => {
            return new bearer_token_type_1.BearerTokenType(model.accessToken, model.accessTokenLifetime, model.refreshToken, model.scope, model.customAttributes);
        };
        this.updateSuccessResponse = (response, tokenType) => {
            response.body = tokenType.valueOf();
            response.set('Cache-Control', 'no-store');
            response.set('Pragma', 'no-cache');
        };
        this.updateErrorResponse = (response, error) => {
            response.body = {
                error: error.name,
                error_description: error.message,
            };
            response.status = error.code;
        };
        this.isClientAuthenticationRequired = grantType => {
            if (Object.keys(this.requireClientAuthentication).length > 0) {
                return typeof this.requireClientAuthentication[grantType] !== 'undefined'
                    ? this.requireClientAuthentication[grantType]
                    : true;
            }
            return true;
        };
        if (!options.accessTokenLifetime) {
            throw new invalid_argument_error_1.InvalidArgumentError('Missing parameter: `accessTokenLifetime`');
        }
        if (!options.model) {
            throw new invalid_argument_error_1.InvalidArgumentError('Missing parameter: `model`');
        }
        if (!options.refreshTokenLifetime) {
            throw new invalid_argument_error_1.InvalidArgumentError('Missing parameter: `refreshTokenLifetime`');
        }
        if (!options.model.getClient) {
            throw new invalid_argument_error_1.InvalidArgumentError('Invalid argument: model does not implement `getClient()`');
        }
        this.accessTokenLifetime = options.accessTokenLifetime;
        this.grantTypes = Object.assign({}, grantTypes, options.extendedGrantTypes);
        this.model = options.model;
        this.refreshTokenLifetime = options.refreshTokenLifetime;
        this.allowExtendedTokenAttributes = options.allowExtendedTokenAttributes;
        this.requireClientAuthentication =
            options.requireClientAuthentication || {};
        this.alwaysIssueNewRefreshToken =
            options.alwaysIssueNewRefreshToken !== false;
    }
    async handle(request, response) {
        if (!(request instanceof request_1.Request)) {
            throw new invalid_argument_error_1.InvalidArgumentError('Invalid argument: `request` must be an instance of Request');
        }
        if (!(response instanceof response_1.Response)) {
            throw new invalid_argument_error_1.InvalidArgumentError('Invalid argument: `response` must be an instance of Response');
        }
        if (request.method !== 'POST') {
            throw new invalid_request_error_1.InvalidRequestError('Invalid request: method must be POST');
        }
        if (!request.is('application/x-www-form-urlencoded')) {
            throw new invalid_request_error_1.InvalidRequestError('Invalid request: content must be application/x-www-form-urlencoded');
        }
        try {
            const client = await this.getClient(request, response);
            const data = await this.handleGrantType(request, client);
            const model = new token_model_1.TokenModel(data, {
                allowExtendedTokenAttributes: this.allowExtendedTokenAttributes,
            });
            const tokenType = this.getTokenType(model);
            this.updateSuccessResponse(response, tokenType);
            return data;
        }
        catch (e) {
            if (!(e instanceof oauth_error_1.OAuthError)) {
                e = new server_error_1.ServerError(e);
            }
            this.updateErrorResponse(response, e);
            throw e;
        }
    }
    async getClient(request, response) {
        const credentials = this.getClientCredentials(request);
        const grantType = request.body.grant_type;
        if (!credentials.clientId) {
            throw new invalid_request_error_1.InvalidRequestError('Missing parameter: `client_id`');
        }
        if (this.isClientAuthenticationRequired(grantType) &&
            !credentials.clientSecret) {
            throw new invalid_request_error_1.InvalidRequestError('Missing parameter: `client_secret`');
        }
        if (!is.vschar(credentials.clientId)) {
            throw new invalid_request_error_1.InvalidRequestError('Invalid parameter: `client_id`');
        }
        if (credentials.clientSecret && !is.vschar(credentials.clientSecret)) {
            throw new invalid_request_error_1.InvalidRequestError('Invalid parameter: `client_secret`');
        }
        try {
            const client = await this.model.getClient(credentials.clientId, credentials.clientSecret);
            if (!client) {
                throw new invalid_client_error_1.InvalidClientError('Invalid client: client is invalid');
            }
            if (!client.grants) {
                throw new server_error_1.ServerError('Server error: missing client `grants`');
            }
            if (!(client.grants instanceof Array)) {
                throw new server_error_1.ServerError('Server error: `grants` must be an array');
            }
            return client;
        }
        catch (e) {
            if (e instanceof invalid_client_error_1.InvalidClientError && request.get('authorization')) {
                response.set('WWW-Authenticate', 'Basic realm="Service"');
                throw new invalid_client_error_1.InvalidClientError(e, { code: 401 });
            }
            throw e;
        }
    }
    getClientCredentials(request) {
        const credentials = auth(request);
        const grantType = request.body.grant_type;
        if (credentials) {
            return {
                clientId: credentials.name,
                clientSecret: credentials.pass,
            };
        }
        if (request.body.client_id && request.body.client_secret) {
            return {
                clientId: request.body.client_id,
                clientSecret: request.body.client_secret,
            };
        }
        if (!this.isClientAuthenticationRequired(grantType)) {
            if (request.body.client_id) {
                return { clientId: request.body.client_id };
            }
        }
        throw new invalid_client_error_1.InvalidClientError('Invalid client: cannot retrieve client credentials');
    }
    async handleGrantType(request, client) {
        const grantType = request.body.grant_type;
        if (!grantType) {
            throw new invalid_request_error_1.InvalidRequestError('Missing parameter: `grant_type`');
        }
        if (!is.nchar(grantType) && !is.uri(grantType)) {
            throw new invalid_request_error_1.InvalidRequestError('Invalid parameter: `grant_type`');
        }
        if (!lodash_1.has(this.grantTypes, grantType)) {
            throw new unsupported_grant_type_error_1.UnsupportedGrantTypeError('Unsupported grant type: `grant_type` is invalid');
        }
        if (!client.grants.includes(grantType)) {
            throw new unauthorized_client_error_1.UnauthorizedClientError('Unauthorized client: `grant_type` is invalid');
        }
        const accessTokenLifetime = this.getAccessTokenLifetime(client);
        const refreshTokenLifetime = this.getRefreshTokenLifetime(client);
        const Type = this.grantTypes[grantType];
        const options = {
            accessTokenLifetime,
            model: this.model,
            refreshTokenLifetime,
            alwaysIssueNewRefreshToken: this.alwaysIssueNewRefreshToken,
        };
        return new Type(options).handle(request, client);
    }
    getAccessTokenLifetime(client) {
        return client.accessTokenLifetime || this.accessTokenLifetime;
    }
    getRefreshTokenLifetime(client) {
        return client.refreshTokenLifetime || this.refreshTokenLifetime;
    }
}
exports.TokenHandler = TokenHandler;
//# sourceMappingURL=token-handler.js.map