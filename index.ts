import * as fs from "fs-extra";
import * as json2csv from "json2csv";
import { GaodePoi } from "./model";
import { getGaodePoiData } from "./download";
import { DownloadGaodeTarget } from "./targets";
import { GaodeApiKey } from "./gaodeconfig";

export default async function downloadGaodePoi(config: GaodeApiKey[], targets: DownloadGaodeTarget[], outputroot: string) {
    // 读取ak
    if (config.length > 0) {
        // 爬取数据
        for (const target of targets) {
            var targetCity = target.city;
            for (const targetType of target.types) {
                // var poiList = await getGaodePoiData(config, targetCity, [], targetType.id, 20, 100);
                try {
                    var poiList = await getGaodePoiData(config, {
                        city: targetCity,
                        types: [targetType.id],
                        offset: 20
                    }, 100);
                    saveToCsv(poiList, targetCity, targetType.name, outputroot)
                } catch (error) {
                    console.error(error);
                }
            }
        }
    } else {
        throw "No config file";
    }
}

function saveToCsv(poiList: GaodePoi[], city: string, type: string, outputroot: string) {
    var poiCsv = json2csv({
        data: poiList,
        fields: GaodePoi.getFields()
    })
    var outputFile = `${outputroot}/${city}/${type}.csv`;
    fs.ensureFile(outputFile, (err) => {
        if (err) console.error(err);
        else {
            fs.writeFile(outputFile, poiCsv, function (err: NodeJS.ErrnoException) {
                if (err) console.error(err)
            })
        }
    })
}