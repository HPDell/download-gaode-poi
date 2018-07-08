import * as WebRequest from "web-request";
import { delay } from "./delay";
import { GaodePoi, GaodePoiSearchResult, IGaodePoiSearchResultModel } from "./model";
import { GaodeApiKey } from "./gaodeconfig";
import { escape } from "querystring";

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
        return this.key[(++this.keyIndex) % this.key.length];
    }

    /**
     * 获取参数指定的POI
     * @param parameters 请求参数
     */
    toUrl(parameters: GaodePoiApiInfo): string {
        let currentKey = this.nextKey().key;
        let url = `${this.baseurl}?key=${currentKey}`;
        for (var key in parameters) {
            if (parameters.hasOwnProperty(key)) {
                switch (key) {
                    case "keywords":
                        if (parameters.keywords.length > 0) {
                            url += `&${key}=`;
                            url += parameters.keywords[0]
                            for (var index = 1; index < parameters.keywords.length; index++) {
                                var element = parameters.keywords[index];
                                url += `|${escape(element)}`;
                            }
                        }
                        break;
                    case "types":
                        if (parameters.types.length > 0) {
                            url += `&${key}=`;
                            url += parameters.types[0]
                            for (var index = 1; index < parameters.types.length; index++) {
                                var element = parameters.types[index];
                                url += `|${escape(element)}`
                            }
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
export async function getGaodePoiData(
    ak: GaodeApiKey | GaodeApiKey[],
    config: GaodePoiApiInfo,
    timeout: 100
): Promise<Array<GaodePoi>> {
    // POI列表
    let poiList = new Array<GaodePoi>();
    // 获取第一页
    let api = new GaodePoiApi(ak);
    let firstData = await WebRequest.json<IGaodePoiSearchResultModel>(api.toUrl(config));
    if (firstData.status === "1") {
        let firstPage = new GaodePoiSearchResult(firstData);
        poiList = poiList.concat(firstPage.pois);
        // 计算应获取的数量
        let totalCount = firstPage.count; // 总数
        let pages = Math.ceil(totalCount / config.offset); // 总页数
        for (let i = 2; i <= Math.min(pages, 100); i++) {
            config.page = i;
            let result = await WebRequest.json<IGaodePoiSearchResultModel>(api.toUrl(config));
            if (result.status === "1") {
                let data = new GaodePoiSearchResult(result);
                poiList = poiList.concat(data.pois);
            } else {
                console.error(result.info, result.infocode);
            }
            await delay(timeout)
        }
    } else {
        console.error(firstData.info, firstData.infocode)
    }
    return poiList;
}