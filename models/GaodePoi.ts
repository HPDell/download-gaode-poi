import * as coordtransform from "coordtransform"

/**
 * 高德POI模型
 */
export interface IGaodePoi {
    id: string;
    name: string;
    typecode: string;
    biz_type: any[];
    address: string;
    location: string;
    tel: string;
    distance: any[];
    biz_ext: any[];
    pname: string;
    cityname: string;
    adname: string;
    importance: any[];
    shopid: any[];
    shopinfo: string | number;
    poiweight: any[];
}

/**
 * 高德POI搜索建议
 */
export interface IGaodePoiSearchSuggestions {
    keywords: any[];
    cities: any[];
}

/**
 * 高德POI搜索结果模型
 */
export interface IGaodePoiSearchResult {
    status: string;
    info?: string;
    infocode?: string;
    count?: string;
    pois?: IGaodePoi[];
    suggestion?: IGaodePoiSearchSuggestions[];
}

export class GaodePoi {
    id: string;
    name: string;
    typecode: string;
    biz_type: any[];
    address: string;
    gjclng: number;
    gjclat: number;
    wgslng: number;
    wgslat: number;
    tel: string;
    distance: any[];
    biz_ext: any[];
    pname: string;
    cityname: string;
    adname: string;
    importance: any[];
    shopid: any[];
    shopinfo: string | number;
    poiweight: any[];
    constructor(parameters: IGaodePoi) {
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
        this.gjclng = parseFloat(coords[0])
        this.gjclat = parseFloat(coords[1])
        var wgs = coordtransform.gcj02towgs84(this.gjclng, this.gjclat)
        this.wgslng = wgs[0];
        this.wgslat = wgs[1];
    }
    static getFields(): string[] {
        return [ "id", "name", "typecode", "biz_type", "address",
            "gjclng", "gjclat", "wgslng", "wgslat", "tel", "distance", 
            "biz_ext", "pname", "cityname", "adname", "importance", 
            "shopid", "shopinfo", "poiweight"
        ]
    }
}

export class GaodePoiSearchResult {
    status: number;
    info: string;
    infocode: number;
    count: number;
    pois: GaodePoi[];
    suggestion?: IGaodePoiSearchSuggestions[];
    constructor(parameters: IGaodePoiSearchResult) {
        this.status = parseInt(parameters.status);
        this.info = parameters.info;
        this.infocode = parseInt(parameters.infocode);
        this.count = parseInt(parameters.count);
        this.pois = new Array<GaodePoi>();
        this.suggestion = parameters.suggestion;
        parameters.pois.forEach(poi => {
            this.pois.push(new GaodePoi(poi))
        });
    }
}