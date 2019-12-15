import { Request } from '../request';
import { Response } from '../response';
import { BearerTokenType } from '../token-types/bearer-token-type';
export declare class TokenHandler {
    accessTokenLifetime: any;
    grantTypes: any;
    model: any;
    refreshTokenLifetime: any;
    allowExtendedTokenAttributes: any;
    requireClientAuthentication: any;
    alwaysIssueNewRefreshToken: boolean;
    constructor(options?: any);
    handle(request: Request, response: Response): Promise<any>;
    getClient(request: any, response: any): Promise<any>;
    getClientCredentials(request: any): {
        clientId: any;
        clientSecret: any;
    } | {
        clientId: any;
        clientSecret?: undefined;
    };
    handleGrantType(request: Request, client: any): Promise<any>;
    getAccessTokenLifetime(client: any): any;
    getRefreshTokenLifetime(client: any): any;
    getTokenType: (model: any) => BearerTokenType;
    updateSuccessResponse: (response: any, tokenType: any) => void;
    updateErrorResponse: (response: any, error: any) => void;
    isClientAuthenticationRequired: (grantType: any) => any;
}
