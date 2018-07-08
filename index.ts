import * as fs from "fs-extra";
import * as json2csv from "json2csv";
import { GaodePoi } from "./model";
import { getGaodePoiData } from "./download";
import { DownloadGaodeTarget } from "./targets";
import { GaodeApiKey } from "./gaodeconfig";

export default async function downloadGaodePoi(
    config: GaodeApiKey[],
    targetList: DownloadGaodeTarget[],
    outputroot: string
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
    let poiCsv = json2csv({
        data: poiList,
        fields: GaodePoi.getFields()
    })
    let outputFile = `${outputroot}/${city}/${type}.csv`;
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