# 高德API

利用高德搜索Web API爬取数据。

## 依赖包

NPM包：

- `web-request`: [Simplifies making web requests with TypeScript async/await.](https://www.npmjs.com/package/web-request)
- `json2csv`: [Converts json into csv with column titles and proper line endings.](https://www.npmjs.com/package/json2csv)
- `csv-parser`: [CSV Parse for Node.js](https://csv.js.org/parse/options/)
- `coordtransform`: [一个提供了百度坐标（BD09）、国测局坐标（火星坐标，GCJ02）、和WGS84坐标系之间的转换的工具模块。](https://www.npmjs.com/package/coordtransform)

TypeScript安装：

```bash
npm install -g typescript
```

TypeScript支持node模块：

```bash
npm install @types/node
```

## 命令行工具

### 安装

使用如下命令安装：

```bash
npm install -g amap-clawer
```

### 使用方法

#### Key 配置文件编写

`key-config` 参数值即 Target 配置文件，该文件为 JSON 格式，
是一个 `GaodeApiKey` 接口的数组，`GaodeApiKey` 定义为：

```ts
interface GaodeApiKey {
    key: string;
}
```

> 例如：
> 
> ```json
> [{
>     "key": "您的key1"
> },{
>     "key": "您的key2"
> }]
> ```

#### POI 爬虫

使用格式说明如下：

```
gaode-poi [options]

Required options:

-t, --target-config [string]    Set download targets.
-k, --key-config [string]       Set amap keys.
-o, --output-dir [string]       Set output root dir.
```

例如：

```bash
gaode-poi -t targets.json -k keys.json -o .
```

其中，`targets.json` 是 Target 配置文件，
`keys.json` 是 Key 配置文件。

`target-config` 参数值即 Target 配置文件，该文件为 JSON 格式，
是一个 `DownloadGaodeTarget` 接口的数组，`DownloadGaodeTarget` 定义为：

```ts
interface DownloadGaodeTarget {
    city: string;
    types: TargetType[]
}

interface TargetType {
    name?: string;
    id?: string;
}
```

> 例如：
> 
> ```json
> [{
>     "city": "wuhan",
>     "types": [{
>         "name": "高等院校",
>         "id": "141201"
>     }]
> }]
> ```

#### 地理编码爬虫

使用高德地图地理编码 API 进行对地址的批量地理编码。目前仅支持 CSV 格式文件。

使用格式说明如下：

```
download-gaode-poi [options]

Required options:

-c, --input-csv [string]           Set input targets from csv file.
-k, --key-config [string]          Set amap keys.
-o, --output-dir [string]          Set output root dir.
-i, --field-oid [string]           Set unique id field. Default to "id".
-a, --field-address [string]       Set output address field name. Default to "address".
```

例如：

```bash
gaode-poi -k keys.json  -o . -c geocode.csv -a "PLACE" -i "OID"
```

其中：

- `-c` 参数表示需要被地理编码的地址的集合文件
- `-a` 表示输入文件中表示地址的字段
- `-i` 表示输入文件中表示主键的字段

## 与代码集成

### 调用

在 test 文件夹中，建立一个 main.ts 文件，在里面编写如下代码：

```ts
import downloadGaodePoi from "../index";
import { GaodeApiKey } from "../gaodeconfig";
import { DownloadGaodeTarget } from "../targets";

// 该 key 的数量可以根据申请到的 key 的数量进行调整
const keys: GaodeApiKey[] = [{
    key: "您的key"
},{
    key: "您的key"
}];

// 这里填写所有需要爬取的城市和类型
// 城市和分类编码表参考请参考
// https://lbs.amap.com/api/webservice/download
const targets: DownloadGaodeTarget[] = [{
    city: "wuhan",
    types: [{
        name: "高等院校",
        id: "141201"
    }]
}]

// 第三个参数是输出路径，可以根据需要进行调整
downloadGaodePoi(keys, targets, "./results")
```

### 编译

编写完成后，使用如下指令进行编译：

```bash
npm install
tsc
```

### 运行

键入以下命令来启动爬虫：

```bash
node bin/test/main.ts
```