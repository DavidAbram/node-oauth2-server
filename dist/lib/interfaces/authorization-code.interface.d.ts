import { Client } from './client.interface';
import { User } from './user.interface';
export interface AuthorizationCode {
    authorizationCode: string;
    expiresAt: Date;
    redirectUri: string;
    scope?: string;
    client: Client;
    user: User;
    [key: string]: any;
}
