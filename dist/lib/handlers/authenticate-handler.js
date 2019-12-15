"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const insufficient_scope_error_1 = require("../errors/insufficient-scope-error");
const invalid_argument_error_1 = require("../errors/invalid-argument-error");
const invalid_request_error_1 = require("../errors/invalid-request-error");
const invalid_token_error_1 = require("../errors/invalid-token-error");
const oauth_error_1 = require("../errors/oauth-error");
const server_error_1 = require("../errors/server-error");
const unauthorized_request_error_1 = require("../errors/unauthorized-request-error");
const request_1 = require("../request");
const response_1 = require("../response");
class AuthenticateHandler {
    constructor(options = {}) {
        this.getTokenFromRequestHeader = (request) => {
            const token = request.get('Authorization');
            const matches = token.match(/Bearer\s(\S+)/);
            if (!matches) {
                throw new invalid_request_error_1.InvalidRequestError('Invalid request: malformed authorization header');
            }
            return matches[1];
        };
        this.getTokenFromRequestBody = (request) => {
            if (request.method === 'GET') {
                throw new invalid_request_error_1.InvalidRequestError('Invalid request: token may not be passed in the body when using the GET verb');
            }
            if (!request.is('application/x-www-form-urlencoded')) {
                throw new invalid_request_error_1.InvalidRequestError('Invalid request: content must be application/x-www-form-urlencoded');
            }
            return request.body.access_token;
        };
        this.validateAccessToken = (accessToken) => {
            if (!(accessToken.accessTokenExpiresAt instanceof Date)) {
                throw new server_error_1.ServerError('Server error: `accessTokenExpiresAt` must be a Date instance');
            }
            if (accessToken.accessTokenExpiresAt < new Date()) {
                throw new invalid_token_error_1.InvalidTokenError('Invalid token: access token has expired');
            }
            return accessToken;
        };
        if (!options.model) {
            throw new invalid_argument_error_1.InvalidArgumentError('Missing parameter: `model`');
        }
        if (!options.model.getAccessToken) {
            throw new invalid_argument_error_1.InvalidArgumentError('Invalid argument: model does not implement `getAccessToken()`');
        }
        if (options.scope && options.addAcceptedScopesHeader === undefined) {
            throw new invalid_argument_error_1.InvalidArgumentError('Missing parameter: `addAcceptedScopesHeader`');
        }
        if (options.scope && options.addAuthorizedScopesHeader === undefined) {
            throw new invalid_argument_error_1.InvalidArgumentError('Missing parameter: `addAuthorizedScopesHeader`');
        }
        if (options.scope && !options.model.verifyScope) {
            throw new invalid_argument_error_1.InvalidArgumentError('Invalid argument: model does not implement `verifyScope()`');
        }
        this.addAcceptedScopesHeader = options.addAcceptedScopesHeader;
        this.addAuthorizedScopesHeader = options.addAuthorizedScopesHeader;
        this.allowBearerTokensInQueryString =
            options.allowBearerTokensInQueryString;
        this.model = options.model;
        this.scope = options.scope;
    }
    async handle(request, response) {
        if (!(request instanceof request_1.Request)) {
            throw new invalid_argument_error_1.InvalidArgumentError('Invalid argument: `request` must be an instance of Request');
        }
        if (!(response instanceof response_1.Response)) {
            throw new invalid_argument_error_1.InvalidArgumentError('Invalid argument: `response` must be an instance of Response');
        }
        try {
            let token = await this.getTokenFromRequest(request);
            token = await this.getAccessToken(token);
            await this.validateAccessToken(token);
            if (this.scope) {
                await this.verifyScope(token);
            }
            await this.updateResponse(response, token);
            return token;
        }
        catch (e) {
            if (e instanceof unauthorized_request_error_1.UnauthorizedRequestError) {
                response.set('WWW-Authenticate', 'Bearer realm="Service"');
            }
            if (!(e instanceof oauth_error_1.OAuthError)) {
                throw new server_error_1.ServerError(e);
            }
            throw e;
        }
    }
    getTokenFromRequest(request) {
        const headerToken = request.get('Authorization');
        const queryToken = request.query.access_token;
        const bodyToken = request.body.access_token;
        if ((!!headerToken && 1) + (!!queryToken && 1) + (!!bodyToken && 1) > 1) {
            throw new invalid_request_error_1.InvalidRequestError('Invalid request: only one authentication method is allowed');
        }
        if (headerToken) {
            return this.getTokenFromRequestHeader(request);
        }
        if (queryToken) {
            return this.getTokenFromRequestQuery(request);
        }
        if (bodyToken) {
            return this.getTokenFromRequestBody(request);
        }
        throw new unauthorized_request_error_1.UnauthorizedRequestError('Unauthorized request: no authentication given');
    }
    getTokenFromRequestQuery(request) {
        if (!this.allowBearerTokensInQueryString) {
            throw new invalid_request_error_1.InvalidRequestError('Invalid request: do not send bearer tokens in query URLs');
        }
        return request.query.access_token;
    }
    async getAccessToken(token) {
        const accessToken = await this.model.getAccessToken(token);
        if (!accessToken) {
            throw new invalid_token_error_1.InvalidTokenError('Invalid token: access token is invalid');
        }
        if (!accessToken.user) {
            throw new server_error_1.ServerError('Server error: `getAccessToken()` did not return a `user` object');
        }
        return accessToken;
    }
    async verifyScope(accessToken) {
        const scope = await this.model.verifyScope(accessToken, this.scope);
        if (!scope) {
            throw new insufficient_scope_error_1.InsufficientScopeError('Insufficient scope: authorized scope is insufficient');
        }
        return scope;
    }
    updateResponse(response, accessToken) {
        if (this.scope && this.addAcceptedScopesHeader) {
            response.set('X-Accepted-OAuth-Scopes', this.scope);
        }
        if (this.scope && this.addAuthorizedScopesHeader) {
            response.set('X-OAuth-Scopes', accessToken.scope);
        }
    }
}
exports.AuthenticateHandler = AuthenticateHandler;
//# sourceMappingURL=authenticate-handler.js.map