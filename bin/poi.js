"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
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
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
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
var WebRequest = require("web-request");
var delay_1 = require("./delay");
var GaodePoi_1 = require("./models/GaodePoi");
var querystring_1 = require("querystring");
var ProgressBar = require("progress");
var json2csv = require("json2csv");
var fs = require("fs-extra");
var GaodePoiOutput;
(function (GaodePoiOutput) {
    GaodePoiOutput[GaodePoiOutput["JSON"] = 0] = "JSON";
    GaodePoiOutput[GaodePoiOutput["XML"] = 1] = "XML";
})(GaodePoiOutput = exports.GaodePoiOutput || (exports.GaodePoiOutput = {}));
var GaodePoiApi = /** @class */ (function () {
    function GaodePoiApi(key) {
        this.baseurl = "http://restapi.amap.com/v3/place/text";
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
    GaodePoiApi.prototype.nextKey = function () {
        return this.key[(this.keyIndex++) % this.key.length];
    };
    /**
     * 获取参数指定的POI
     * @param parameters 请求参数
     */
    GaodePoiApi.prototype.toUrl = function (parameters) {
        var currentKey = this.nextKey().key;
        var url = this.baseurl + "?key=" + currentKey;
        for (var key in parameters) {
            if (parameters.hasOwnProperty(key)) {
                switch (key) {
                    case "keywords":
                        if (parameters.keywords && parameters.keywords.length > 0) {
                            url += "&" + key + "=";
                            url += parameters.keywords.map(function (value) { return querystring_1.escape(value); }).join("|");
                        }
                        break;
                    case "types":
                        if (parameters.types && parameters.types.length > 0) {
                            url += "&" + key + "=";
                            url += parameters.types.map(function (value) { return querystring_1.escape(value); }).join("|");
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
                    default:
                        url += "&" + key + "=";
                        url += "" + parameters[key];
                        break;
                }
            }
        }
        return url;
    };
    return GaodePoiApi;
}());
exports.GaodePoiApi = GaodePoiApi;
/**
 * 爬取高德POI数据
 * @param params 参数
 */
function getGaodePoiData(ak, config, timeout) {
    return __awaiter(this, void 0, void 0, function () {
        var poiList, api, firstData, firstPage, totalCount, pages, bar, i, result, data;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    poiList = new Array();
                    api = new GaodePoiApi(ak);
                    return [4 /*yield*/, WebRequest.json(api.toUrl(config))];
                case 1:
                    firstData = _a.sent();
                    if (!(firstData.status === "1")) return [3 /*break*/, 7];
                    firstPage = new GaodePoi_1.GaodePoiSearchResult(firstData);
                    poiList = poiList.concat(firstPage.pois);
                    totalCount = firstPage.count;
                    pages = Math.min(Math.ceil(totalCount / config.offset), 100) // 总页数
                    ;
                    bar = new ProgressBar(config.types.join(",") + " [:bar] :current/:total Pages", {
                        total: pages,
                        curr: 1,
                        complete: "=",
                        head: ">",
                        incomplete: " ",
                        clear: true
                    });
                    i = 2;
                    _a.label = 2;
                case 2:
                    if (!(i <= pages)) return [3 /*break*/, 6];
                    config.page = i;
                    return [4 /*yield*/, WebRequest.json(api.toUrl(config))];
                case 3:
                    result = _a.sent();
                    if (result.status === "1") {
                        data = new GaodePoi_1.GaodePoiSearchResult(result);
                        poiList = poiList.concat(data.pois);
                    }
                    else {
                        console.error(result.info, result.infocode);
                    }
                    bar.tick();
                    return [4 /*yield*/, delay_1.delay(timeout)];
                case 4:
                    _a.sent();
                    _a.label = 5;
                case 5:
                    i++;
                    return [3 /*break*/, 2];
                case 6: return [3 /*break*/, 8];
                case 7:
                    console.error(firstData.info, firstData.infocode);
                    _a.label = 8;
                case 8: return [2 /*return*/, poiList];
            }
        });
    });
}
exports.default = getGaodePoiData;
function downloadGaodePoi(config, targetList, outputDir, timeout) {
    return __awaiter(this, void 0, void 0, function () {
        var _i, targetList_1, targetItem, targetCity, _a, _b, targetType, poiList, error_1;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    if (!(config.length > 0)) return [3 /*break*/, 9];
                    _i = 0, targetList_1 = targetList;
                    _c.label = 1;
                case 1:
                    if (!(_i < targetList_1.length)) return [3 /*break*/, 8];
                    targetItem = targetList_1[_i];
                    targetCity = targetItem.city;
                    _a = 0, _b = targetItem.types;
                    _c.label = 2;
                case 2:
                    if (!(_a < _b.length)) return [3 /*break*/, 7];
                    targetType = _b[_a];
                    _c.label = 3;
                case 3:
                    _c.trys.push([3, 5, , 6]);
                    return [4 /*yield*/, getGaodePoiData(config, {
                            city: targetCity,
                            types: [targetType.id ? targetType.id : targetType.name],
                            offset: 20
                        }, timeout)];
                case 4:
                    poiList = _c.sent();
                    saveToCsv(poiList, targetCity, targetType.name, outputDir);
                    return [3 /*break*/, 6];
                case 5:
                    error_1 = _c.sent();
                    throw error_1;
                case 6:
                    _a++;
                    return [3 /*break*/, 2];
                case 7:
                    _i++;
                    return [3 /*break*/, 1];
                case 8: return [3 /*break*/, 10];
                case 9: throw "No config file";
                case 10: return [2 /*return*/];
            }
        });
    });
}
exports.downloadGaodePoi = downloadGaodePoi;
function saveToCsv(poiList, city, type, outputDir) {
    var poiCsv = json2csv({
        data: poiList,
        fields: GaodePoi_1.GaodePoi.getFields()
    });
    var outputFile = outputDir + "/" + city + "/" + type + ".csv";
    fs.ensureFile(outputFile, function (err) {
        if (err)
            throw err;
        else {
            fs.writeFile(outputFile, poiCsv, function (err) {
                if (err)
                    throw err;
                else
                    console.log("Write to file " + outputFile + ".");
            });
        }
    });
}
exports.saveToCsv = saveToCsv;
//# sourceMappingURL=poi.js.map