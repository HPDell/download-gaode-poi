# 高德API爬虫——POI（搜索接口）
利用高德搜索Web API爬取数据。
> 注意：使用前需要申请高德开发者应用key

## 依赖包
NPM包：
- `web-request`: [Simplifies making web requests with TypeScript async/await.](https://www.npmjs.com/package/web-request)
- `json2csv`: [Converts json into csv with column titles and proper line endings.](https://www.npmjs.com/package/json2csv)
- `coordtransform`: [一个提供了百度坐标（BD09）、国测局坐标（火星坐标，GCJ02）、和WGS84坐标系之间的转换的工具模块。](https://www.npmjs.com/package/coordtransform)

TypeScript安装：
```
npm install -g typescript
```

TypeScript支持node模块：
```
tsd install node --globle
```

## TypeScript直接调试
需要开启两处`sourceMap`选项：
- 在`tsconfig.json`文件中
  ``` json
  {
      "compilerOptions": {
          "lib": [
              "es2015"
          ],
          "target": "es5",
          "sourceMap": true
      },
      "files": [
          "delay.ts",
          "model.ts",
          "download.ts",
          "index.ts"
      ]
  }
  ```
- 在`.vscode/launch.json`文件中：
  ``` json
  {
      "version": "0.2.0",
      "configurations": [
          {
              "type": "node",
              "request": "launch",
              "name": "Launch Program",
              "program": "${workspaceFolder}/index.ts",
              "sourceMaps": true,
              "outFiles": [
                  "${workspaceFolder}/**/*.js"
              ]
          }
      ]
  }
  ```