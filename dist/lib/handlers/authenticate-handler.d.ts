import { Model } from '../interfaces/model.interface';
import { Token } from '../interfaces/token.interface';
import { Request } from '../request';
import { Response } from '../response';
export declare class AuthenticateHandler {
    addAcceptedScopesHeader: any;
    addAuthorizedScopesHeader: any;
    allowBearerTokensInQueryString: any;
    model: Model;
    scope: any;
    constructor(options?: any);
    handle(request: Request, response: Response): Promise<any>;
    getTokenFromRequest(request: Request): any;
    getTokenFromRequestHeader: (request: Request) => any;
    getTokenFromRequestQuery(request: Request): any;
    getTokenFromRequestBody: (request: Request) => any;
    getAccessToken(token: string): Promise<Token>;
    validateAccessToken: (accessToken: Token) => Token;
    verifyScope(accessToken: Token): Promise<true>;
    updateResponse(response: Response, accessToken: any): void;
}
