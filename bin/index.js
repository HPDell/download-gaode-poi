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
var fs = require("fs-extra");
var json2csv = require("json2csv");
var model_1 = require("./model");
var download_1 = require("./download");
function downloadGaodePoi(config, targets, outputroot) {
    return __awaiter(this, void 0, void 0, function () {
        var _i, targets_1, target, targetCity, _a, _b, targetType, poiList, error_1;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    if (!(config.length > 0)) return [3 /*break*/, 9];
                    _i = 0, targets_1 = targets;
                    _c.label = 1;
                case 1:
                    if (!(_i < targets_1.length)) return [3 /*break*/, 8];
                    target = targets_1[_i];
                    targetCity = target.city;
                    _a = 0, _b = target.types;
                    _c.label = 2;
                case 2:
                    if (!(_a < _b.length)) return [3 /*break*/, 7];
                    targetType = _b[_a];
                    _c.label = 3;
                case 3:
                    _c.trys.push([3, 5, , 6]);
                    return [4 /*yield*/, download_1.getGaodePoiData(config, {
                            city: targetCity,
                            types: [targetType.id],
                            offset: 20
                        }, 100)];
                case 4:
                    poiList = _c.sent();
                    saveToCsv(poiList, targetCity, targetType.name, outputroot);
                    return [3 /*break*/, 6];
                case 5:
                    error_1 = _c.sent();
                    console.error(error_1);
                    return [3 /*break*/, 6];
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
exports.default = downloadGaodePoi;
function saveToCsv(poiList, city, type, outputroot) {
    var poiCsv = json2csv({
        data: poiList,
        fields: model_1.GaodePoi.getFields()
    });
    var outputFile = outputroot + "/" + city + "/" + type + ".csv";
    fs.ensureFile(outputFile, function (err) {
        if (err)
            console.error(err);
        else {
            fs.writeFile(outputFile, poiCsv, function (err) {
                if (err)
                    console.log(err);
                else
                    console.log(city + "/" + type + " Saved!");
            });
        }
    });
}
//# sourceMappingURL=index.js.map