/// <reference types="node" />
export declare class CodeResponseType {
    code: any;
    constructor(code: number);
    buildRedirectUri(redirectUri: string): import("url").UrlWithParsedQuery;
}
