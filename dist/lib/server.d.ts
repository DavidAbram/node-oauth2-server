import { AccessDeniedError } from './errors/access-denied-error';
import { InsufficientScopeError } from './errors/insufficient-scope-error';
import { InvalidArgumentError } from './errors/invalid-argument-error';
import { InvalidClientError } from './errors/invalid-client-error';
import { InvalidGrantError } from './errors/invalid-grant-error';
import { InvalidRequestError } from './errors/invalid-request-error';
import { InvalidScopeError } from './errors/invalid-scope-error';
import { InvalidTokenError } from './errors/invalid-token-error';
import { OAuthError } from './errors/oauth-error';
import { ServerError } from './errors/server-error';
import { UnauthorizedClientError } from './errors/unauthorized-client-error';
import { UnauthorizedRequestError } from './errors/unauthorized-request-error';
import { UnsupportedGrantTypeError } from './errors/unsupported-grant-type-error';
import { UnsupportedResponseTypeError } from './errors/unsupported-response-type-error';
import { AbstractGrantType } from './grant-types/abstract-grant-type';
import { Request } from './request';
import { Response } from './response';
export declare class OAuth2Server {
    options: any;
    constructor(options?: any);
    authenticate(request: Request, response?: Response, scope?: string): any;
    authenticate(request: Request, response?: Response, options?: any): any;
    authorize(request: Request, response: Response, options?: any): Promise<import("./interfaces/authorization-code.interface").AuthorizationCode>;
    token(request: Request, response: Response, options?: any): Promise<any>;
    static Request: typeof Request;
    static Response: typeof Response;
    static AbstractGrantType: typeof AbstractGrantType;
    static AccessDeniedError: typeof AccessDeniedError;
    static InsufficientScopeError: typeof InsufficientScopeError;
    static InvalidArgumentError: typeof InvalidArgumentError;
    static InvalidClientError: typeof InvalidClientError;
    static InvalidGrantError: typeof InvalidGrantError;
    static InvalidRequestError: typeof InvalidRequestError;
    static InvalidScopeError: typeof InvalidScopeError;
    static InvalidTokenError: typeof InvalidTokenError;
    static OAuthError: typeof OAuthError;
    static ServerError: typeof ServerError;
    static UnauthorizedClientError: typeof UnauthorizedClientError;
    static UnauthorizedRequestError: typeof UnauthorizedRequestError;
    static UnsupportedGrantTypeError: typeof UnsupportedGrantTypeError;
    static UnsupportedResponseTypeError: typeof UnsupportedResponseTypeError;
}