"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Response {
    constructor(options = {}) {
        this.body = options.body || {};
        this.headers = {};
        this.status = 200;
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
    redirect(url) {
        this.set('Location', url);
        this.status = 302;
    }
    set(field, value) {
        this.headers[field.toLowerCase()] = value;
    }
}
exports.Response = Response;
//# sourceMappingURL=response.js.map