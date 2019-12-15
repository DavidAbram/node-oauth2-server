"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const access_denied_error_1 = require("./errors/access-denied-error");
const insufficient_scope_error_1 = require("./errors/insufficient-scope-error");
const invalid_argument_error_1 = require("./errors/invalid-argument-error");
const invalid_client_error_1 = require("./errors/invalid-client-error");
const invalid_grant_error_1 = require("./errors/invalid-grant-error");
const invalid_request_error_1 = require("./errors/invalid-request-error");
const invalid_scope_error_1 = require("./errors/invalid-scope-error");
const invalid_token_error_1 = require("./errors/invalid-token-error");
const oauth_error_1 = require("./errors/oauth-error");
const server_error_1 = require("./errors/server-error");
const unauthorized_client_error_1 = require("./errors/unauthorized-client-error");
const unauthorized_request_error_1 = require("./errors/unauthorized-request-error");
const unsupported_grant_type_error_1 = require("./errors/unsupported-grant-type-error");
const unsupported_response_type_error_1 = require("./errors/unsupported-response-type-error");
const abstract_grant_type_1 = require("./grant-types/abstract-grant-type");
const authenticate_handler_1 = require("./handlers/authenticate-handler");
const authorize_handler_1 = require("./handlers/authorize-handler");
const token_handler_1 = require("./handlers/token-handler");
const request_1 = require("./request");
const response_1 = require("./response");
class OAuth2Server {
    constructor(options = {}) {
        if (!options.model) {
            throw new invalid_argument_error_1.InvalidArgumentError('Missing parameter: `model`');
        }
        this.options = options;
    }
    async authenticate(request, response, options) {
        let opt = options;
        if (typeof opt === 'string') {
            opt = { scope: opt };
        }
        opt = Object.assign({ addAcceptedScopesHeader: true, addAuthorizedScopesHeader: true, allowBearerTokensInQueryString: false }, this.options, opt);
        return new authenticate_handler_1.AuthenticateHandler(opt).handle(request, response);
    }
    async authorize(request, response, options) {
        const defaultLifeTime = 300;
        const opts = Object.assign({ allowEmptyState: false, authorizationCodeLifetime: defaultLifeTime }, this.options, options);
        return new authorize_handler_1.AuthorizeHandler(opts).handle(request, response);
    }
    async token(request, response, options) {
        const opts = Object.assign({ accessTokenLifetime: 60 * 60, refreshTokenLifetime: 60 * 60 * 24 * 14, allowExtendedTokenAttributes: false, requireClientAuthentication: {} }, this.options, options);
        return new token_handler_1.TokenHandler(opts).handle(request, response);
    }
}
OAuth2Server.Request = request_1.Request;
OAuth2Server.Response = response_1.Response;
OAuth2Server.AbstractGrantType = abstract_grant_type_1.AbstractGrantType;
OAuth2Server.AccessDeniedError = access_denied_error_1.AccessDeniedError;
OAuth2Server.InsufficientScopeError = insufficient_scope_error_1.InsufficientScopeError;
OAuth2Server.InvalidArgumentError = invalid_argument_error_1.InvalidArgumentError;
OAuth2Server.InvalidClientError = invalid_client_error_1.InvalidClientError;
OAuth2Server.InvalidGrantError = invalid_grant_error_1.InvalidGrantError;
OAuth2Server.InvalidRequestError = invalid_request_error_1.InvalidRequestError;
OAuth2Server.InvalidScopeError = invalid_scope_error_1.InvalidScopeError;
OAuth2Server.InvalidTokenError = invalid_token_error_1.InvalidTokenError;
OAuth2Server.OAuthError = oauth_error_1.OAuthError;
OAuth2Server.ServerError = server_error_1.ServerError;
OAuth2Server.UnauthorizedClientError = unauthorized_client_error_1.UnauthorizedClientError;
OAuth2Server.UnauthorizedRequestError = unauthorized_request_error_1.UnauthorizedRequestError;
OAuth2Server.UnsupportedGrantTypeError = unsupported_grant_type_error_1.UnsupportedGrantTypeError;
OAuth2Server.UnsupportedResponseTypeError = unsupported_response_type_error_1.UnsupportedResponseTypeError;
exports.OAuth2Server = OAuth2Server;
//# sourceMappingURL=server.js.map