import { Client } from '../interfaces/client.interface';
import { Token } from '../interfaces/token.interface';
import { User } from '../interfaces/user.interface';
import { Request } from '../request';
import { AbstractGrantType } from './abstract-grant-type';
export declare class ClientCredentialsGrantType extends AbstractGrantType {
    constructor(options?: any);
    handle(request: Request, client: Client): Promise<Token>;
    getUserFromClient(client: Client): Promise<User>;
    saveToken(user: User, client: Client, scope: string): Promise<Token>;
}
