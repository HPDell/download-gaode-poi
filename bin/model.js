"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var coordtransform = require("coordtransform");
var GaodePoi = /** @class */ (function () {
    function GaodePoi(parameters) {
        // 复制属性
        this.id = parameters.id;
        this.name = parameters.name;
        this.typecode = parameters.typecode;
        this.biz_type = parameters.biz_type;
        this.address = parameters.address;
        this.tel = parameters.tel;
        this.distance = parameters.distance;
        this.biz_ext = parameters.biz_ext;
        this.pname = parameters.pname;
        this.cityname = parameters.cityname;
        this.adname = parameters.adname;
        this.importance = parameters.importance;
        this.shopid = parameters.shopid;
        this.shopinfo = parameters.shopinfo;
        this.poiweight = parameters.poiweight;
        // 计算坐标
        var coords = parameters.location.split(",");
        this.gjclng = parseFloat(coords[0]);
        this.gjclat = parseFloat(coords[1]);
        var wgs = coordtransform.gcj02towgs84(this.gjclng, this.gjclat);
        this.wgslng = wgs[0];
        this.wgslat = wgs[1];
    }
    GaodePoi.getFields = function () {
        return ["id", "name", "typecode", "biz_type", "address", "gjclng", "gjclat", "wgslng", "wgslat", "tel", "distance", "biz_ext", "pname", "cityname", "adname", "importance", "shopid", "shopinfo", "poiweight"];
    };
    return GaodePoi;
}());
exports.GaodePoi = GaodePoi;
var GaodePoiSearchResult = /** @class */ (function () {
    function GaodePoiSearchResult(parameters) {
        var _this = this;
        this.status = parseInt(parameters.status);
        this.info = parameters.info;
        this.infocode = parseInt(parameters.infocode);
        this.count = parseInt(parameters.count);
        this.pois = new Array();
        this.suggestion = parameters.suggestion;
        parameters.pois.forEach(function (poi) {
            _this.pois.push(new GaodePoi(poi));
        });
    }
    return GaodePoiSearchResult;
}());
exports.GaodePoiSearchResult = GaodePoiSearchResult;
//# sourceMappingURL=model.js.map