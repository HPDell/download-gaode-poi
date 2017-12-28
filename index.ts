import * as fs from "fs";
import * as json2csv from "json2csv";
import { GaodePoi } from "./model";
import { getGaodePoiData } from "./download";

var CONFIG_FILE_PAHT = "gaodeconfig.json"

async function main(outputroot: string, types: Array<{name:string, id: string}>) {
    // 读取ak
    try {
        var config:{key:string} = JSON.parse((await new Promise<Buffer>((resolve, rejection) => {
            fs.readFile(CONFIG_FILE_PAHT, (err, data) => { if (err) rejection(err); else resolve(data); })
        })).toString());
        if (config.key && config.key.length > 0) {
            // 爬取数据
            var fields = GaodePoi.getFields();
            for (var index = 0; index < types.length; index++) {
                var poitype = types[index];
                var poiList = await getGaodePoiData(config.key, new Array<string>(), [poitype.id], 20);
                var poiCsv = json2csv({
                    data: poiList,
                    fields: fields
                })
                fs.writeFile(`${outputroot}/${poitype.name}.csv`, poiCsv, function (err: NodeJS.ErrnoException) {
                    if (err) {
                        console.log(err)
                    } else {
                        console.log(`${poitype.name} Saved!`)
                    }
                })
            }
        }
    } catch (error) {
        throw "No config file";
    }
}

main("./results", JSON.parse(fs.readFileSync("targets.json").toString()))