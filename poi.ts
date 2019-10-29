import * as WebRequest from "web-request";
import { delay } from "./delay";
import { GaodePoi, GaodePoiSearchResult, IGaodePoiSearchResult } from "./models/GaodePoi";
import { GaodeApiKey } from "./gaodeconfig";
import { escape } from "querystring";
import ProgressBar = require("progress");
import * as json2csv from "json2csv";
import * as fs from "fs-extra";
import { GaodePoiTarget } from "./targets/GaodePoiTarget";

export enum GaodePoiOutput {
    JSON, XML
}

export interface GaodePoiApiInfo {
    types: string[];
    offset: number;
    keywords?: string[];
    city?: string;
    citylimit?: boolean;
    children?: number;
    page?: number;
    building?: number;
    floor?: number;
    extensions?: string;
    output?: GaodePoiOutput;
}

export class GaodePoiApi {
    baseurl: string;
    key: GaodeApiKey[];
    private keyIndex: number;

    constructor(key: GaodeApiKey | GaodeApiKey[]) {
        this.baseurl = "http://restapi.amap.com/v3/place/text"
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
    toUrl(parameters: GaodePoiApiInfo): string {
        let currentKey = this.nextKey().key;
        let url = `${this.baseurl}?key=${currentKey}`;
        for (const key in parameters) {
            if (parameters.hasOwnProperty(key)) {
                switch (key) {
                    case "keywords":
                        if (parameters.keywords && parameters.keywords.length > 0) {
                            url += `&${key}=`;
                            url += parameters.keywords.map(value => escape(value)).join("|");
                        }
                        break;
                    case "types":
                        if (parameters.types && parameters.types.length > 0) {
                            url += `&${key}=`;
                            url += parameters.types.map(value => escape(value)).join("|");
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

/**
 * 爬取高德POI数据
 * @param params 参数
 */
export default async function getGaodePoiData(
    ak: GaodeApiKey | GaodeApiKey[],
    config: GaodePoiApiInfo,
    timeout: number
): Promise<Array<GaodePoi>> {
    // POI列表
    let poiList = new Array<GaodePoi>();
    // 获取第一页
    let api = new GaodePoiApi(ak);
    let firstData = await WebRequest.json<IGaodePoiSearchResult>(api.toUrl(config));
    if (firstData.status === "1") {
        let firstPage = new GaodePoiSearchResult(firstData);
        poiList = poiList.concat(firstPage.pois);
        // 计算应获取的数量
        let totalCount = firstPage.count; // 总数
        let pages = Math.min(Math.ceil(totalCount / config.offset), 100) // 总页数
        let bar = new ProgressBar(`${config.types.join(",")} [:bar] :current/:total Pages`, {
            total: pages,
            curr: 1,
            complete: "=",
            head: ">",
            incomplete: " ",
            clear: true
        })
        for (let i = 2; i <= pages; i++) {
            config.page = i;
            let result = await WebRequest.json<IGaodePoiSearchResult>(api.toUrl(config));
            if (result.status === "1") {
                let data = new GaodePoiSearchResult(result);
                poiList = poiList.concat(data.pois);
            } else {
                console.error(result.info, result.infocode);
            }
            bar.tick();
            await delay(timeout)
        }
    } else {
        console.error(firstData.info, firstData.infocode)
    }
    return poiList;
}

export async function downloadGaodePoi(
    config: GaodeApiKey[],
    targetList: GaodePoiTarget[],
    outputDir: string,
    timeout: number
) {
    // 读取ak
    if (config.length > 0) {
        // 爬取数据
        for (const targetItem of targetList) {
            let targetCity = targetItem.city;
            for (const targetType of targetItem.types) {
                try {
                    let poiList = await getGaodePoiData(config, {
                        city: targetCity,
                        types: [targetType.id ? targetType.id : targetType.name],
                        offset: 20
                    }, timeout);
                    saveToCsv(poiList, targetCity, targetType.name, outputDir)
                } catch (error) {
                    throw error;
                }
            }
        }
    } else {
        throw "No config file";
    }
}

export function saveToCsv(poiList: GaodePoi[], city: string, type: string, outputDir: string) {
    let poiCsv = json2csv({
        data: poiList,
        fields: GaodePoi.getFields()
    })
    let outputFile = `${outputDir}/${city}/${type}.csv`;
    fs.ensureFile(outputFile, (err) => {
        if (err) throw err;
        else {
            fs.writeFile(outputFile, poiCsv, function (err: NodeJS.ErrnoException) {
                if (err) throw err;
                else console.log(`Write to file ${outputFile}.`)
            })
        }
    })
}