"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const url_1 = require("url");
const invalid_argument_error_1 = require("../errors/invalid-argument-error");
class CodeResponseType {
    constructor(code) {
        if (!code) {
            throw new invalid_argument_error_1.InvalidArgumentError('Missing parameter: `code`');
        }
        this.code = code;
    }
    buildRedirectUri(redirectUri) {
        if (!redirectUri) {
            throw new invalid_argument_error_1.InvalidArgumentError('Missing parameter: `redirectUri`');
        }
        const uri = url_1.parse(redirectUri, true);
        uri.query.code = this.code;
        uri.search = undefined;
        return uri;
    }
}
exports.CodeResponseType = CodeResponseType;
//# sourceMappingURL=code-response-type.js.map