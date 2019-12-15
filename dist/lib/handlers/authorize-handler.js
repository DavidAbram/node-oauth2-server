"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = require("lodash");
const url_1 = require("url");
const access_denied_error_1 = require("../errors/access-denied-error");
const invalid_argument_error_1 = require("../errors/invalid-argument-error");
const invalid_client_error_1 = require("../errors/invalid-client-error");
const invalid_request_error_1 = require("../errors/invalid-request-error");
const invalid_scope_error_1 = require("../errors/invalid-scope-error");
const oauth_error_1 = require("../errors/oauth-error");
const server_error_1 = require("../errors/server-error");
const unauthorized_client_error_1 = require("../errors/unauthorized-client-error");
const unsupported_response_type_error_1 = require("../errors/unsupported-response-type-error");
const authenticate_handler_1 = require("../handlers/authenticate-handler");
const request_1 = require("../request");
const response_1 = require("../response");
const code_response_type_1 = require("../response-types/code-response-type");
const tokenUtil = require("../utils/token-util");
const is = require("../validator/is");
const responseTypes = {
    code: code_response_type_1.CodeResponseType,
};
class AuthorizeHandler {
    constructor(options = {}) {
        this.getScope = (request) => {
            const scope = request.body.scope || request.query.scope;
            if (!is.nqschar(scope)) {
                throw new invalid_scope_error_1.InvalidScopeError('Invalid parameter: `scope`');
            }
            return scope;
        };
        this.getRedirectUri = (request, client) => {
            return (request.body.redirect_uri ||
                request.query.redirect_uri ||
                client.redirectUris[0]);
        };
        this.getResponseType = (request) => {
            const responseType = request.body.response_type || request.query.response_type;
            if (!responseType) {
                throw new invalid_request_error_1.InvalidRequestError('Missing parameter: `response_type`');
            }
            if (!lodash_1.has(responseTypes, responseType)) {
                throw new unsupported_response_type_error_1.UnsupportedResponseTypeError('Unsupported response type: `response_type` is not supported');
            }
            return responseTypes[responseType];
        };
        this.buildSuccessRedirectUri = (redirectUri, responseType) => {
            return responseType.buildRedirectUri(redirectUri);
        };
        this.buildErrorRedirectUri = (redirectUri, error) => {
            const uri = url_1.parse(redirectUri, true);
            uri.query = {
                error: error.name,
            };
            if (error.message) {
                uri.query.error_description = error.message;
            }
            return uri;
        };
        this.updateResponse = (response, redirectUri, state) => {
            redirectUri.query = redirectUri.query || {};
            if (state) {
                redirectUri.query.state = state;
            }
            response.redirect(url_1.format(redirectUri));
        };
        if (options.authenticateHandler && !options.authenticateHandler.handle) {
            throw new invalid_argument_error_1.InvalidArgumentError('Invalid argument: authenticateHandler does not implement `handle()`');
        }
        if (!options.authorizationCodeLifetime) {
            throw new invalid_argument_error_1.InvalidArgumentError('Missing parameter: `authorizationCodeLifetime`');
        }
        if (!options.model) {
            throw new invalid_argument_error_1.InvalidArgumentError('Missing parameter: `model`');
        }
        if (!options.model.getClient) {
            throw new invalid_argument_error_1.InvalidArgumentError('Invalid argument: model does not implement `getClient()`');
        }
        if (!options.model.saveAuthorizationCode) {
            throw new invalid_argument_error_1.InvalidArgumentError('Invalid argument: model does not implement `saveAuthorizationCode()`');
        }
        this.allowEmptyState = options.allowEmptyState;
        this.authenticateHandler =
            options.authenticateHandler || new authenticate_handler_1.AuthenticateHandler(options);
        this.authorizationCodeLifetime = options.authorizationCodeLifetime;
        this.model = options.model;
    }
    async handle(request, response) {
        if (!(request instanceof request_1.Request)) {
            throw new invalid_argument_error_1.InvalidArgumentError('Invalid argument: `request` must be an instance of Request');
        }
        if (!(response instanceof response_1.Response)) {
            throw new invalid_argument_error_1.InvalidArgumentError('Invalid argument: `response` must be an instance of Response');
        }
        if (request.query.allowed === 'false') {
            throw new access_denied_error_1.AccessDeniedError('Access denied: user denied access to application');
        }
        const fns = [
            this.getAuthorizationCodeLifetime(),
            this.getClient(request),
            this.getUser(request, response),
        ];
        const [expiresAt, client, user] = await Promise.all(fns);
        const uri = this.getRedirectUri(request, client);
        let scope;
        let state;
        let ResponseType;
        try {
            scope = this.getScope(request);
            const authorizationCode = await this.generateAuthorizationCode(client, user, scope);
            state = this.getState(request);
            ResponseType = this.getResponseType(request);
            const code = await this.saveAuthorizationCode(authorizationCode, expiresAt, scope, client, uri, user);
            const responseType = new ResponseType(code.authorizationCode);
            const redirectUri = this.buildSuccessRedirectUri(uri, responseType);
            this.updateResponse(response, redirectUri, state);
            return code;
        }
        catch (e) {
            if (!(e instanceof oauth_error_1.OAuthError)) {
                e = new server_error_1.ServerError(e);
            }
            const redirectUri = this.buildErrorRedirectUri(uri, e);
            this.updateResponse(response, redirectUri, state);
            throw e;
        }
    }
    generateAuthorizationCode(client, user, scope) {
        if (this.model.generateAuthorizationCode) {
            return this.model.generateAuthorizationCode(client, user, scope);
        }
        return tokenUtil.GenerateRandomToken();
    }
    getAuthorizationCodeLifetime() {
        const expires = new Date();
        expires.setSeconds(expires.getSeconds() + this.authorizationCodeLifetime);
        return expires;
    }
    async getClient(request) {
        const clientId = request.body.client_id || request.query.client_id;
        if (!clientId) {
            throw new invalid_request_error_1.InvalidRequestError('Missing parameter: `client_id`');
        }
        if (!is.vschar(clientId)) {
            throw new invalid_request_error_1.InvalidRequestError('Invalid parameter: `client_id`');
        }
        const redirectUri = request.body.redirect_uri || request.query.redirect_uri;
        if (redirectUri && !is.uri(redirectUri)) {
            throw new invalid_request_error_1.InvalidRequestError('Invalid request: `redirect_uri` is not a valid URI');
        }
        const client = await this.model.getClient(clientId);
        if (!client) {
            throw new invalid_client_error_1.InvalidClientError('Invalid client: client credentials are invalid');
        }
        if (!client.grants) {
            throw new invalid_client_error_1.InvalidClientError('Invalid client: missing client `grants`');
        }
        if (!client.grants.includes('authorization_code')) {
            throw new unauthorized_client_error_1.UnauthorizedClientError('Unauthorized client: `grant_type` is invalid');
        }
        if (!client.redirectUris || client.redirectUris.length === 0) {
            throw new invalid_client_error_1.InvalidClientError('Invalid client: missing client `redirectUri`');
        }
        if (redirectUri && !client.redirectUris.includes(redirectUri)) {
            throw new invalid_client_error_1.InvalidClientError('Invalid client: `redirect_uri` does not match client value');
        }
        return client;
    }
    getState(request) {
        const state = request.body.state || request.query.state;
        if (!this.allowEmptyState && !state) {
            throw new invalid_request_error_1.InvalidRequestError('Missing parameter: `state`');
        }
        if (!is.vschar(state)) {
            throw new invalid_request_error_1.InvalidRequestError('Invalid parameter: `state`');
        }
        return state;
    }
    async getUser(request, response) {
        if (this.authenticateHandler instanceof authenticate_handler_1.AuthenticateHandler) {
            const data = await this.authenticateHandler.handle(request, response);
            return data.user;
        }
        const user = await this.authenticateHandler.handle(request, response);
        if (!user) {
            throw new server_error_1.ServerError('Server error: `handle()` did not return a `user` object');
        }
        return user;
    }
    async saveAuthorizationCode(authorizationCode, expiresAt, scope, client, redirectUri, user) {
        const code = {
            authorizationCode,
            expiresAt,
            redirectUri,
            scope,
        };
        return this.model.saveAuthorizationCode(code, client, user);
    }
}
exports.AuthorizeHandler = AuthorizeHandler;
//# sourceMappingURL=authorize-handler.js.map