"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.admin = exports.json = exports.cors = void 0;
exports.getUser = getUser;
exports.mp = mp;
exports.saveFromPreapproval = saveFromPreapproval;
var supabase_js_2_1 = require("https://esm.sh/@supabase/supabase-js@2");
exports.cors = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};
var json = function (status, body) {
    return new Response(JSON.stringify(body), { status: status, headers: __assign(__assign({}, exports.cors), { "Content-Type": "application/json" }) });
};
exports.json = json;
var admin = function () {
    return (0, supabase_js_2_1.createClient)(Deno.env.get("SUPABASE_URL"), Deno.env.get("SUPABASE_SERVICE_ROLE_KEY"));
};
exports.admin = admin;
function getUser(req) {
    return __awaiter(this, void 0, void 0, function () {
        var sb, data;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    sb = (0, supabase_js_2_1.createClient)(Deno.env.get("SUPABASE_URL"), Deno.env.get("SUPABASE_ANON_KEY"), {
                        global: { headers: { Authorization: (_a = req.headers.get("Authorization")) !== null && _a !== void 0 ? _a : "" } },
                    });
                    return [4 /*yield*/, sb.auth.getUser()];
                case 1:
                    data = (_b.sent()).data;
                    return [2 /*return*/, data.user];
            }
        });
    });
}
function mp(path_1) {
    return __awaiter(this, arguments, void 0, function (path, init) {
        var res, body;
        var _a;
        if (init === void 0) { init = {}; }
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, fetch("https://api.mercadopago.com".concat(path), __assign(__assign({}, init), { headers: __assign({ Authorization: "Bearer ".concat(Deno.env.get("MP_ACCESS_TOKEN")), "Content-Type": "application/json" }, ((_a = init.headers) !== null && _a !== void 0 ? _a : {})) }))];
                case 1:
                    res = _b.sent();
                    return [4 /*yield*/, res.json().catch(function () { return ({}); })];
                case 2:
                    body = _b.sent();
                    return [2 /*return*/, { ok: res.ok, status: res.status, body: body }];
            }
        });
    });
}
// Grava o estado da assinatura a partir do objeto "preapproval" do Mercado Pago.
function saveFromPreapproval(pre) {
    return __awaiter(this, void 0, void 0, function () {
        var userId, status, next, row;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    userId = pre.external_reference;
                    if (!userId)
                        return [2 /*return*/];
                    status = ["authorized", "paused", "cancelled", "pending"].includes(pre.status) ? pre.status : "pending";
                    next = (_a = pre.next_payment_date) !== null && _a !== void 0 ? _a : null;
                    row = {
                        user_id: userId,
                        mp_preapproval_id: pre.id,
                        status: status,
                        next_payment_date: next,
                        updated_at: new Date().toISOString(),
                    };
                    // O acesso vai até o próximo vencimento já pago (vale também após cancelar).
                    if (next && status !== "pending")
                        row.access_until = next;
                    return [4 /*yield*/, (0, exports.admin)().from("subscriptions").upsert(row, { onConflict: "user_id" })];
                case 1:
                    _b.sent();
                    return [2 /*return*/];
            }
        });
    });
}
