# qcloud-upload

基于 `nodejs` 腾讯云上传插件，支持自定义文件前缀、覆盖及非覆盖上传方式

## Install

```
npm install --save-dev qcloud-upload
```

## Usage

Step 1. 创建文件 `upload.js`

```js
const uploadQcloud = require('qcloud-upload');

const options = {
  AppId: 'STRING_VALUE',
  Region: 'STRING_VALUE',
  SecretId: 'STRING_VALUE',
  SecretKey: 'STRING_VALUE',
  Bucket: 'STRING_VALUE',
  prefix: 'test',
  src: './examples',
  overWrite: 1
};

uploadQcloud(options);
```

Step 2. 执行上传操作 `node upload.js`

## API

### uploadQcloud([options])

#### options

Type: Object

##### There are 8 options:

* `AppId`(string): 注册或登录 [腾讯云](https://cloud.tencent.com/login) 获取您的AppId，可参考下方说明。
* `SecretId`(string): 到 [腾讯云控制台密钥管理](https://console.cloud.tencent.com/capi) 获取您的项目 SecretId 和 SecretKey。
* `SecretKey`(string): 同 SecretId。
* `Bucket`(string): 到 [COS 对象存储控制台](https://console.cloud.tencent.com/cos4) 创建存储桶，得到 Bucket（存储桶名称） 和 Region（地域名称）。
* `Region`(string): Bucket 所在区域。枚举值请见：[Bucket 地域信息](https://cloud.tencent.com/document/product/436/6224)。
* `prefix`(string): 自定义文件前缀，例如本地文件路径 img.png ，设置了 `Prefix: 'demo'`，最终腾讯云路径为 `demo/img.png`，默认为空。
* `overWrite`(string): 是否覆盖同名文件，默认 false。
* `src`(string): 上传文件夹相 **相对路径** ，是相对于执行 node 命令的路径。以本项目 examples 文件夹为例，设置 `src: './examples'`，上传腾讯云后文件路径为 `https://static.demo.com/your-options.prefix/img.png`。(**v1.3.0以上版本支持**)

以下 API 在 v1.3.0+ 版本中废弃：
* `dirPath`(string): 上传文件夹的 **绝对路径** ，以本项目 examples 文件夹为例，应设置 `path.resolve(__dirname, './examples')`。
* `distDirName`(string): 截取文件路径参考项，以本项目 examples 文件夹为例，不设置该项，上传腾讯云后文件路径为 `https://static.demo.com/your-options.prefix/Users/yingye/Desktop/qcloud-upload/examples/img.png`。若设置该项 `distDirName: 'examples'` 后，文件URL为 `https://static.demo.com/your-options.prefix/examples/img.png`，相当于对 `dirPath` 绝对路径做了截取操作。

##### ! `AppId` 和 `Bucket` 的说明：

腾讯云官方 api 修改，去掉 `AppId` 概念，`Bucket` 需要传入这样的格式 `test-1250000000`。本插件，兼容两种配置方式，示例如下：

```js
// old api options
const options = {
  AppId: 'your AppId',
  Bucket: 'old Bucket',
  ...
};
```

```js
// new api options
const options = {
  Bucket: 'AppId-Bucket',
  ...
};
```

## TIPS

该插件基于 [腾讯云 COS Nodejs SDK V5](https://github.com/tencentyun/cos-nodejs-sdk-v5) 构建，可参考腾讯云官方文档 [Node.js SDK](https://cloud.tencent.com/document/product/436/8629)。

如果项目中使用构建工具 `gulp`，建议使用 [gulp-upload-qcloud](https://github.com/yingye/gulp-upload-qcloud)。
