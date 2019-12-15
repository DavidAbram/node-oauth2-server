/// <reference types="node" />
import { UrlWithParsedQuery } from 'url';
import { AuthorizationCode } from '../interfaces/authorization-code.interface';
import { Client } from '../interfaces/client.interface';
import { Model } from '../interfaces/model.interface';
import { User } from '../interfaces/user.interface';
import { Request } from '../request';
import { Response } from '../response';
import { CodeResponseType } from '../response-types/code-response-type';
export declare class AuthorizeHandler {
    allowEmptyState: boolean;
    authenticateHandler: any;
    authorizationCodeLifetime: number;
    model: Model;
    constructor(options?: any);
    handle(request: Request, response: Response): Promise<AuthorizationCode>;
    generateAuthorizationCode(client: any, user: any, scope: any): Promise<string>;
    getAuthorizationCodeLifetime(): Date;
    getClient(request: Request): Promise<Client>;
    getScope: (request: Request) => any;
    getState(request: any): any;
    getUser(request: Request, response: Response): Promise<any>;
    getRedirectUri: (request: Request, client: any) => any;
    saveAuthorizationCode(authorizationCode: string, expiresAt: Date, scope: string, client: Client, redirectUri: string, user: User): Promise<AuthorizationCode>;
    getResponseType: (request: Request) => any;
    buildSuccessRedirectUri: (redirectUri: string, responseType: CodeResponseType) => UrlWithParsedQuery;
    buildErrorRedirectUri: (redirectUri: string, error: Error) => UrlWithParsedQuery;
    updateResponse: (response: Response, redirectUri: UrlWithParsedQuery, state: string) => void;
}
