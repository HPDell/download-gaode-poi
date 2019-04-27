import * as WebRequest from "web-request";
import { delay } from "./delay";
import { GaodeApiKey } from "./gaodeconfig";
import { escape } from "querystring";
import ProgressBar = require("progress");
import { IGaodeGeocodeResult, GaodeGeocode, GaodeGeocodeResult } from "./models/GaodeGeocode";
import * as json2csv from "json2csv";
import * as fs from "fs-extra";
import { GaodeGeocodeTarget, GeocodeAddress } from "./targets/GaodeGeocodeTarget";

export enum GaodePoiOutput {
    JSON, XML
}

interface IGaodeGeocodeApiBaseInfo {
    city?: string;
    batch?: boolean;
    sig?: string;
    output?: GaodePoiOutput;
    callback?: string;
}

export interface IGaodeGeocodeApiInfo extends IGaodeGeocodeApiBaseInfo {
    address: string;
}

export class GaodeGeocodeApi {
    baseurl: string;
    key: GaodeApiKey[];
    private keyIndex: number;

    constructor(key: GaodeApiKey | GaodeApiKey[]) {
        this.baseurl = "https://restapi.amap.com/v3/geocode/geo"
        if (key instanceof Array) {
            this.key = key;
        } else {
            this.key = [key];
        }
        this.keyIndex = 0;
    }

    /**
     * 获取下一个 key
     */
    nextKey() {
        return this.key[(this.keyIndex++) % this.key.length];
    }

    /**
     * 获取参数指定的POI
     * @param parameters 请求参数
     */
    toUrl(parameters: IGaodeGeocodeApiInfo): string {
        let currentKey = this.nextKey().key;
        let url = `${this.baseurl}?key=${currentKey}`;
        for (const key in parameters) {
            if (parameters.hasOwnProperty(key) && parameters[key] != undefined) {
                switch (key) {
                    case "address":
                        if (parameters.address && parameters.address !== "") {
                            url += `&${key}=`;
                            url += escape(parameters.address);
                        }
                        break;
                    case "output":
                        url += `&${key}=`;
                        switch (parameters.output) {
                            case GaodePoiOutput.XML:
                                url += "XML";
                                break;
                            default:
                                url += "JSON";
                        }
                    case "city":
                        url += `&${key}=${escape(parameters.city)}`;
                        break;
                    case "addresses":
                        break;
                    default:
                        url += `&${key}=`;
                        url += `${parameters[key]}`;
                        break;
                }
            }
        }
        return url;
    }
}

interface IGetGaodeGeocodeDataConfig extends IGaodeGeocodeApiBaseInfo {
    addresses: GeocodeAddress[];
    fieldOid: string;
}

/**
 * 爬取高德POI数据
 * @param params 参数
 */
export async function getGaodeGeocodeData(
    ak: GaodeApiKey | GaodeApiKey[],
    config: IGetGaodeGeocodeDataConfig,
    timeout: 100
): Promise<Array<GaodeGeocode>> {
    let geocodeList = new Array<GaodeGeocode>();
    let api = new GaodeGeocodeApi(ak);
    let bar = new ProgressBar(`GeoCode [:bar] :current/:total Pages`, {
        total: config.addresses.length,
        curr: 0,
        complete: "=",
        head: ">",
        incomplete: " ",
        clear: true
    })
    for (const address of config.addresses) {
        try {
            let geocodeResultInfo = await WebRequest.json<IGaodeGeocodeResult>(api.toUrl({
                ...(config as IGaodeGeocodeApiBaseInfo),
                address: address.address,
                city: address.city
            }));
            let geocodeResult = new GaodeGeocodeResult(geocodeResultInfo, address.id, address.address);
            if (geocodeResult.geocodes && geocodeResult.geocodes.length > 0) {
                geocodeList.push(geocodeResult.geocodes[0]);
            }
            bar.tick();
            await delay(timeout);
        } catch (error) {
            console.error(error);
        }
    }
    return geocodeList;
}

export default async function gaodeGeocode(
    config: GaodeApiKey[],
    targetList: GaodeGeocodeTarget
) {
    // 读取ak
    if (config.length > 0) {
        // 爬取数据
        let geocodeList = await getGaodeGeocodeData(config, {
            addresses: targetList.addresses,
            fieldOid: targetList.fieldOid
        }, 100);
        return geocodeList;
    } else {
        throw "No config file";
    }
}

export function saveToCsv(geocodeList: GaodeGeocode[], fieldOid: string, fieldAddress: string, type: string, outputroot: string) {
    let poiCsv = json2csv({
        data: geocodeList.map(item => ({
            [fieldOid]: item.id,
            [fieldAddress]: item.address,
            ...item
        })),
        fields: [fieldOid, fieldAddress].concat(GaodeGeocode.getFields())
    })
    let outputFile = `${outputroot}/${type}.csv`;
    fs.ensureFile(outputFile, (err) => {
        if (err) console.error(err);
        else {
            fs.writeFile(outputFile, poiCsv, function (err: NodeJS.ErrnoException) {
                if (err) console.error(err)
                else console.log(`Write to file ${outputFile}.`)
            })
        }
    })
}