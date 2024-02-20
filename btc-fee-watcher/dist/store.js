"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PgStore = void 0;
const pg_1 = require("pg");
class PgStore {
    constructor() {
        // Use the provided database connection object
        this.client = new pg_1.Client({
            host: process.env.DB_HOST,
            port: parseInt(process.env.DB_PORT || "5432"),
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_DATABASE,
        });
    }
    execQuery(query, values) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.client.connect();
                const res = yield this.client.query(query, values);
                yield this.client.end();
                return res;
            }
            catch (e) {
                return e;
            }
        });
    }
}
exports.PgStore = PgStore;
//# sourceMappingURL=store.js.map