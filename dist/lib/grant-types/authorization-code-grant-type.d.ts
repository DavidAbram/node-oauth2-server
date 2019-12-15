import { Client } from '../interfaces/client.interface';
import { Token } from '../interfaces/token.interface';
import { User } from '../interfaces/user.interface';
import { Request } from '../request';
import { AbstractGrantType } from './abstract-grant-type';
export declare class AuthorizationCodeGrantType extends AbstractGrantType {
    constructor(options?: any);
    handle(request: Request, client: any): Promise<Token>;
    getAuthorizationCode(request: Request, client: any): Promise<import("../interfaces/authorization-code.interface").AuthorizationCode>;
    validateRedirectUri: (request: Request, code: any) => void;
    revokeAuthorizationCode(code: any): Promise<any>;
    saveToken(user: User, client: Client, authorizationCode: string, scope: string): Promise<Token>;
}
