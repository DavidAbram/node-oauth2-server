"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const typeis = require("type-is");
const invalid_argument_error_1 = require("./errors/invalid-argument-error");
class Request {
    constructor(options = {}) {
        if (!options.headers) {
            throw new invalid_argument_error_1.InvalidArgumentError('Missing parameter: `headers`');
        }
        if (!options.method) {
            throw new invalid_argument_error_1.InvalidArgumentError('Missing parameter: `method`');
        }
        if (!options.query) {
            throw new invalid_argument_error_1.InvalidArgumentError('Missing parameter: `query`');
        }
        this.body = options.body || {};
        this.headers = {};
        this.method = options.method;
        this.query = options.query;
        for (const field in options.headers) {
            if (options.headers.hasOwnProperty(field)) {
                this.headers[field.toLowerCase()] = options.headers[field];
            }
        }
        for (const property in options) {
            if (options.hasOwnProperty(property) && !this[property]) {
                this[property] = options[property];
            }
        }
    }
    get(field) {
        return this.headers[field.toLowerCase()];
    }
    is(...args) {
        let types = args;
        if (Array.isArray(types[0])) {
            types = types[0];
        }
        return typeis(this, types) || false;
    }
}
exports.Request = Request;
//# sourceMappingURL=request.js.map