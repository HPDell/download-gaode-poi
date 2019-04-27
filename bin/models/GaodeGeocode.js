"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var coordtransform = require("coordtransform");
var GaodeGeocode = /** @class */ (function () {
    function GaodeGeocode(parameters, id, address) {
        this.formatted_address = parameters.formatted_address;
        this.country = parameters.country;
        this.province = parameters.province;
        this.citycode = parameters.citycode;
        this.city = parameters.city;
        this.district = parameters.district;
        this.township = parameters.township;
        this.neighborhood = parameters.neighborhood;
        this.building = parameters.building;
        this.adcode = parameters.adcode;
        this.street = parameters.street;
        this.number = parameters.number;
        this.location = parameters.location;
        this.level = parameters.level;
        var coords = parameters.location.split(",");
        this.gcjlng = parseFloat(coords[0]);
        this.gcjlat = parseFloat(coords[1]);
        var wgs = coordtransform.gcj02towgs84(this.gcjlng, this.gcjlat);
        this.wgslng = wgs[0];
        this.wgslat = wgs[1];
        this.address = address;
        this.id = id;
    }
    GaodeGeocode.getFields = function () {
        return [
            "formatted_address", "country", "province", "citycode", "city", "district",
            "township", "neighborhood", "building", "adcode", "street", "number",
            "location", "level", "gcjlng", "gcjlat", "wgslng", "wgslat"
        ];
    };
    return GaodeGeocode;
}());
exports.GaodeGeocode = GaodeGeocode;
var GaodeGeocodeResult = /** @class */ (function () {
    function GaodeGeocodeResult(parameters, id, address) {
        var _this = this;
        this.status = parseInt(parameters.status);
        this.info = parameters.info;
        this.infocode = parseInt(parameters.infocode);
        this.count = parseInt(parameters.count);
        this.id = id;
        this.address = address;
        this.geocodes = parameters.geocodes.map(function (item) { return new GaodeGeocode(item, _this.id, _this.address); });
    }
    return GaodeGeocodeResult;
}());
exports.GaodeGeocodeResult = GaodeGeocodeResult;
//# sourceMappingURL=GaodeGeocode.js.map