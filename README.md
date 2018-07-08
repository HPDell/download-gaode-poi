# 高德API爬虫——POI（搜索接口）

利用高德搜索Web API爬取数据。

> 注意：使用前需要申请高德开发者应用key。将`gaodeconfig-sample.json`文件重命名为`gaodeconfig.json`文件，并将申请到的 key 填入 json 文件 "key" 字段的值内。

## 依赖包

NPM包：

- `web-request`: [Simplifies making web requests with TypeScript async/await.](https://www.npmjs.com/package/web-request)
- `json2csv`: [Converts json into csv with column titles and proper line endings.](https://www.npmjs.com/package/json2csv)
- `coordtransform`: [一个提供了百度坐标（BD09）、国测局坐标（火星坐标，GCJ02）、和WGS84坐标系之间的转换的工具模块。](https://www.npmjs.com/package/coordtransform)

TypeScript安装：

```ts
npm install -g typescript
```

TypeScript支持node模块：

```ts
tsd install node --globle
```

## 使用方法

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