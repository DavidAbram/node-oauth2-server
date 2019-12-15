import { Client } from '../interfaces/client.interface';
import { Token } from '../interfaces/token.interface';
import { User } from '../interfaces/user.interface';
import { Request } from '../request';
import { AbstractGrantType } from './abstract-grant-type';
export declare class PasswordGrantType extends AbstractGrantType {
    constructor(options?: any);
    handle(request: any, client: any): Promise<Token>;
    getUser(request: Request): Promise<User>;
    saveToken(user: User, client: Client, scope: string): Promise<Token>;
}
