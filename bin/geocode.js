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
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
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
exports.saveToCsv = exports.getGaodeGeocodeData = exports.GaodeGeocodeApi = exports.GaodePoiOutput = void 0;
var WebRequest = require("web-request");
var delay_1 = require("./delay");
var querystring_1 = require("querystring");
var ProgressBar = require("progress");
var GaodeGeocode_1 = require("./models/GaodeGeocode");
var json2csv = require("json2csv");
var fs = require("fs-extra");
var GaodePoiOutput;
(function (GaodePoiOutput) {
    GaodePoiOutput[GaodePoiOutput["JSON"] = 0] = "JSON";
    GaodePoiOutput[GaodePoiOutput["XML"] = 1] = "XML";
})(GaodePoiOutput = exports.GaodePoiOutput || (exports.GaodePoiOutput = {}));
var GaodeGeocodeApi = /** @class */ (function () {
    function GaodeGeocodeApi(key) {
        this.baseurl = "https://restapi.amap.com/v3/geocode/geo";
        if (key instanceof Array) {
            this.key = key;
        }
        else {
            this.key = [key];
        }
        this.keyIndex = 0;
    }
    /**
     * 获取下一个 key
     */
    GaodeGeocodeApi.prototype.nextKey = function () {
        return this.key[(this.keyIndex++) % this.key.length];
    };
    /**
     * 获取参数指定的POI
     * @param parameters 请求参数
     */
    GaodeGeocodeApi.prototype.toUrl = function (parameters) {
        var currentKey = this.nextKey().key;
        var url = this.baseurl + "?key=" + currentKey;
        for (var key in parameters) {
            if (parameters.hasOwnProperty(key) && parameters[key] != undefined) {
                switch (key) {
                    case "address":
                        if (parameters.address && parameters.address !== "") {
                            url += "&" + key + "=";
                            url += querystring_1.escape(parameters.address);
                        }
                        break;
                    case "output":
                        url += "&" + key + "=";
                        switch (parameters.output) {
                            case GaodePoiOutput.XML:
                                url += "XML";
                                break;
                            default:
                                url += "JSON";
                        }
                    case "city":
                        url += "&" + key + "=" + querystring_1.escape(parameters.city);
                        break;
                    case "addresses":
                        break;
                    default:
                        url += "&" + key + "=";
                        url += "" + parameters[key];
                        break;
                }
            }
        }
        return url;
    };
    return GaodeGeocodeApi;
}());
exports.GaodeGeocodeApi = GaodeGeocodeApi;
/**
 * 爬取高德POI数据
 * @param params 参数
 */
function getGaodeGeocodeData(ak, config, timeout) {
    return __awaiter(this, void 0, void 0, function () {
        var geocodeList, api, bar, _i, _a, address, geocodeResultInfo, geocodeResult, error_1;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    geocodeList = new Array();
                    api = new GaodeGeocodeApi(ak);
                    bar = new ProgressBar("GeoCode [:bar] :current/:total Pages", {
                        total: config.addresses.length,
                        curr: 0,
                        complete: "=",
                        head: ">",
                        incomplete: " ",
                        clear: true
                    });
                    _i = 0, _a = config.addresses;
                    _b.label = 1;
                case 1:
                    if (!(_i < _a.length)) return [3 /*break*/, 7];
                    address = _a[_i];
                    _b.label = 2;
                case 2:
                    _b.trys.push([2, 5, , 6]);
                    return [4 /*yield*/, WebRequest.json(api.toUrl(__assign(__assign({}, config), { address: address.address, city: address.city })))];
                case 3:
                    geocodeResultInfo = _b.sent();
                    geocodeResult = new GaodeGeocode_1.GaodeGeocodeResult(geocodeResultInfo, address.id, address.address);
                    if (geocodeResult.geocodes && geocodeResult.geocodes.length > 0) {
                        geocodeList.push(geocodeResult.geocodes[0]);
                    }
                    bar.tick();
                    return [4 /*yield*/, delay_1.delay(timeout)];
                case 4:
                    _b.sent();
                    return [3 /*break*/, 6];
                case 5:
                    error_1 = _b.sent();
                    console.error(error_1);
                    return [3 /*break*/, 6];
                case 6:
                    _i++;
                    return [3 /*break*/, 1];
                case 7: return [2 /*return*/, geocodeList];
            }
        });
    });
}
exports.getGaodeGeocodeData = getGaodeGeocodeData;
function gaodeGeocode(config, targetList) {
    return __awaiter(this, void 0, void 0, function () {
        var geocodeList;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!(config.length > 0)) return [3 /*break*/, 2];
                    return [4 /*yield*/, getGaodeGeocodeData(config, {
                            addresses: targetList.addresses,
                            fieldOid: targetList.fieldOid
                        }, 100)];
                case 1:
                    geocodeList = _a.sent();
                    return [2 /*return*/, geocodeList];
                case 2: throw "No config file";
            }
        });
    });
}
exports.default = gaodeGeocode;
function saveToCsv(geocodeList, fieldOid, fieldAddress, type, outputroot) {
    var poiCsv = json2csv({
        data: geocodeList.map(function (item) {
            var _a;
            return (__assign((_a = {}, _a[fieldOid] = item.id, _a[fieldAddress] = item.address, _a), item));
        }),
        fields: [fieldOid, fieldAddress].concat(GaodeGeocode_1.GaodeGeocode.getFields())
    });
    var outputFile = outputroot + "/" + type + ".csv";
    fs.ensureFile(outputFile, function (err) {
        if (err)
            console.error(err);
        else {
            fs.writeFile(outputFile, poiCsv, function (err) {
                if (err)
                    console.error(err);
                else
                    console.log("Write to file " + outputFile + ".");
            });
        }
    });
}
exports.saveToCsv = saveToCsv;
//# sourceMappingURL=geocode.js.map