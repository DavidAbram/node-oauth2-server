import { Client } from '../interfaces/client.interface';
import { Token } from '../interfaces/token.interface';
import { User } from '../interfaces/user.interface';
export declare class TokenModel implements Token {
    accessToken: string;
    accessTokenExpiresAt?: Date;
    refreshToken?: string;
    refreshTokenExpiresAt?: Date;
    scope?: string;
    client: Client;
    user: User;
    customAttributes: {};
    accessTokenLifetime: number;
    constructor(data?: any, options?: any);
}
