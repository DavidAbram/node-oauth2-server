import { Client } from './client.interface';
import { User } from './user.interface';
export interface Token {
    accessToken: string;
    accessTokenExpiresAt?: Date;
    refreshToken?: string;
    refreshTokenExpiresAt?: Date;
    scope?: string;
    client: Client;
    user: User;
    [key: string]: any;
}
