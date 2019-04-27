import * as coordtransform from "coordtransform"

export interface IGaodeGeocodeResult {
  status: string;
  info: string;
  infocode: string;
  count: string;
  geocodes: IGaodeGeocode[];
}

export interface IGaodeGeocode {
  formatted_address: string;
  country: string;
  province: string;
  citycode: string;
  city: string;
  district: string;
  township: any[];
  neighborhood: Neighborhood;
  building: Neighborhood;
  adcode: string;
  street: any[];
  number: any[];
  location: string;
  level: string;
}

export interface Neighborhood {
  name: any[];
  type: any[];
}

export class GaodeGeocode {
    formatted_address: string;
    country: string;
    province: string;
    citycode: string;
    city: string;
    district: string;
    township: any[];
    neighborhood: Neighborhood;
    building: Neighborhood;
    adcode: string;
    street: any[];
    number: any[];
    location: string;
    level: string;
    gcjlng: number;
    gcjlat: number;
    wgslng: number;
    wgslat: number;
    address: string;
    id: string;
    constructor(parameters: IGaodeGeocode, id: string, address: string) {
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
        this.gcjlng = parseFloat(coords[0])
        this.gcjlat = parseFloat(coords[1])
        var wgs = coordtransform.gcj02towgs84(this.gcjlng, this.gcjlat)
        this.wgslng = wgs[0];
        this.wgslat = wgs[1];
        this.address = address;
        this.id = id;
    }

    static getFields(): string[] {
        return [ 
            "formatted_address", "country", "province", "citycode", "city", "district",
            "township", "neighborhood", "building", "adcode", "street", "number",
            "location", "level", "gcjlng", "gcjlat", "wgslng", "wgslat"
        ]
    }
}

export class GaodeGeocodeResult {
    status: number;
    info: string;
    infocode: number;
    count: number;
    geocodes: GaodeGeocode[];
    address: string;
    id: string;
    constructor(parameters: IGaodeGeocodeResult, id: string, address: string) {
        this.status = parseInt(parameters.status);
        this.info = parameters.info;
        this.infocode = parseInt(parameters.infocode);
        this.count = parseInt(parameters.count);
        this.id = id;
        this.address = address;
        this.geocodes = parameters.geocodes.map(item => new GaodeGeocode(item, this.id, this.address));
    }
}