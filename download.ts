import * as WebRequest from "web-request";
import { delay } from "./delay";
import { GaodePoi, GaodePoiSearchResult, IGaodePoiSearchResultModel } from "./model";

enum GaodePoiOutput {
    JSON, XML
}

interface IGaodePoiApi {
    keywords: string[];
    types: string[];
    city?: string;
    citylimit?: boolean;
    children?: number;
    offset?: number;
    page?: number;
    building?: number;
    floor?: number;
    extensions?: string;
    output?: GaodePoiOutput;
}

class GaodePoiApi {
    baseurl: string;
    key: string;
    constructor(key: string) {
        this.baseurl = "http://restapi.amap.com/v3/place/text"
        this.key = key; 
    }
    /**
     * 获取参数指定的POI
     * @param parameters 请求参数
     */
    getUrl(parameters: IGaodePoiApi): string {
        var url = `${this.baseurl}?key=${this.key}`;
        for (var key in parameters) {
            if (parameters.hasOwnProperty(key)) {
                switch (key) {
                    case "keywords":
                        if (parameters.keywords.length > 0) {
                            url += `&${key}=`;
                            url += parameters.keywords[0]
                            for (var index = 1; index < parameters.keywords.length; index++) {
                                var element = parameters.keywords[index];
                                url += `|${parameters.keywords[index]}`;
                            }
                        }
                        break;
                    case "types":
                        if (parameters.types.length > 0) {
                            url += `&${key}=`;
                            url += parameters.types[0]
                            for (var index = 1; index < parameters.keywords.length; index++) {
                                var element = parameters.keywords[index];
                                url += `|${parameters.keywords[index]}`
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
export async function getGaodePoiData(ak:string, keywords: string[], types: string[], offset: number): Promise<Array<GaodePoi>> {
    // POI列表
    let poiList = new Array<GaodePoi>();
    // 获取第一页
    let reqParams: IGaodePoiApi = {
        keywords: keywords,
        types: types,
        offset: offset,
        city: "wuhan",
        citylimit: true,
        children: 1,
        page: 1,
        extensions: "all"
    };
    let api = new GaodePoiApi(ak);
    let url = api.getUrl(reqParams);
    let firstData = await WebRequest.json<IGaodePoiSearchResultModel>(api.getUrl(reqParams));
    if (firstData.status === "1") {
        let firstPage = new GaodePoiSearchResult(firstData);
        poiList = poiList.concat(firstPage.pois);
        // 计算应获取的数量
        let totalCount = firstPage.count; // 总数
        console.log(`${types[0]} data has found ${totalCount} items, start downloading others...`);
        let pages = Math.ceil(totalCount / offset); // 总页数
        for (let i = 2; i <= Math.min(pages, 100); i++) {
            console.log(`${types[0]} Pages ${i}`);
            reqParams.page = i;
            let result = await WebRequest.json<IGaodePoiSearchResultModel>(api.getUrl(reqParams));
            if (result.status === "1") {
                let data = new GaodePoiSearchResult(result);
                poiList = poiList.concat(data.pois);
            } else {
                console.log(result.info, result.infocode);
            }
            await delay(1000)
        }
    } else {
        console.log(firstData.info, firstData.infocode)
    }
    return poiList;
}