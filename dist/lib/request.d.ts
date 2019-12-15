export declare class Request {
    body: any;
    headers: any;
    method: any;
    query: any;
    constructor(options?: any);
    get(field: any): any;
    is(args: string[]): string | false;
    is(...args: string[]): string | false;
}
