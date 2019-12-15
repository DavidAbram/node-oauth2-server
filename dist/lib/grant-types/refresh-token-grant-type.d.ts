import { Client } from '../interfaces/client.interface';
import { RefreshToken } from '../interfaces/refresh-token.interface';
import { User } from '../interfaces/user.interface';
import { Request } from '../request';
import { AbstractGrantType } from './abstract-grant-type';
export declare class RefreshTokenGrantType extends AbstractGrantType {
    constructor(options?: any);
    handle(request: Request, client: Client): Promise<import("../interfaces/token.interface").Token>;
    getRefreshToken(request: Request, client: Client): Promise<RefreshToken>;
    revokeToken(token: RefreshToken): Promise<RefreshToken>;
    saveToken(user: User, client: Client, scope: string): Promise<import("../interfaces/token.interface").Token>;
}
