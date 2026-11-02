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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
var mp_ts_1 = require("../_shared/mp.ts");
var enc = new TextEncoder();
var hex = function (b) { return __spreadArray([], new Uint8Array(b), true).map(function (x) { return x.toString(16).padStart(2, "0"); }).join(""); };
function safeEqual(a, b) {
    if (a.length !== b.length)
        return false;
    var diff = 0;
    for (var i = 0; i < a.length; i++)
        diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
    return diff === 0;
}
function validSignature(req, dataId) {
    return __awaiter(this, void 0, void 0, function () {
        var parts, manifest, key, mac, _a;
        var _b, _c;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    parts = Object.fromEntries(((_b = req.headers.get("x-signature")) !== null && _b !== void 0 ? _b : "").split(",").map(function (p) { return p.trim().split("="); }));
                    if (!parts.ts || !parts.v1)
                        return [2 /*return*/, false];
                    manifest = "id:".concat(dataId.toLowerCase(), ";request-id:").concat((_c = req.headers.get("x-request-id")) !== null && _c !== void 0 ? _c : "", ";ts:").concat(parts.ts, ";");
                    return [4 /*yield*/, crypto.subtle.importKey("raw", enc.encode(Deno.env.get("MP_WEBHOOK_SECRET")), { name: "HMAC", hash: "SHA-256" }, false, ["sign"])];
                case 1:
                    key = _d.sent();
                    _a = hex;
                    return [4 /*yield*/, crypto.subtle.sign("HMAC", key, enc.encode(manifest))];
                case 2:
                    mac = _a.apply(void 0, [_d.sent()]);
                    return [2 /*return*/, safeEqual(mac, parts.v1)];
            }
        });
    });
}
Deno.serve(function (req) { return __awaiter(void 0, void 0, void 0, function () {
    var url, body, dataId, type, _a, r;
    var _b, _c, _d, _e, _f;
    return __generator(this, function (_g) {
        switch (_g.label) {
            case 0:
                if (req.method !== "POST")
                    return [2 /*return*/, new Response("ok")];
                url = new URL(req.url);
                return [4 /*yield*/, req.json().catch(function () { return ({}); })];
            case 1:
                body = _g.sent();
                dataId = String((_d = (_b = url.searchParams.get("data.id")) !== null && _b !== void 0 ? _b : (_c = body === null || body === void 0 ? void 0 : body.data) === null || _c === void 0 ? void 0 : _c.id) !== null && _d !== void 0 ? _d : "");
                type = String((_f = (_e = body === null || body === void 0 ? void 0 : body.type) !== null && _e !== void 0 ? _e : url.searchParams.get("type")) !== null && _f !== void 0 ? _f : "");
                _a = !dataId;
                if (_a) return [3 /*break*/, 3];
                return [4 /*yield*/, validSignature(req, dataId)];
            case 2:
                _a = !(_g.sent());
                _g.label = 3;
            case 3:
                if (_a)
                    return [2 /*return*/, new Response("invalid", { status: 401 })];
                if (!(type === "subscription_preapproval")) return [3 /*break*/, 7];
                return [4 /*yield*/, (0, mp_ts_1.mp)("/preapproval/".concat(dataId))];
            case 4:
                r = _g.sent();
                if (!r.ok) return [3 /*break*/, 6];
                return [4 /*yield*/, (0, mp_ts_1.saveFromPreapproval)(r.body)];
            case 5:
                _g.sent();
                return [3 /*break*/, 7];
            case 6: return [2 /*return*/, new Response("retry", { status: 500 })]; // o Mercado Pago reenvia
            case 7: return [2 /*return*/, new Response("ok", { status: 200 })];
        }
    });
}); });
