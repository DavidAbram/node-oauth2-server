export declare class OAuthError extends Error {
    code: any;
    status: any;
    statusCode: any;
    constructor(messageOrError: string | Error, properties?: any);
}
