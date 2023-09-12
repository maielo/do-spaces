# do-spaces

Unofficial package for simple managing file operations hosted on "Digital Ocean Spaces" written in Typescript

![do-spaces unnoficial package readme banner](https://user-images.githubusercontent.com/8983870/239910462-a037cf98-6bce-4c8b-9399-a4382f6a41c2.png)

### Motivation

I've created this package to ease working with [spaces](https://www.digitalocean.com/products/spaces/). Be more expressive then `aws-sdk`. And to solve "quirks" `aws-sdk` have (like uploading with mime-types, delete whole folder...)

### Install

```
npm i do-spaces
```

### Usage

```js
// commonJS
const Spaces = require('do-spaces').default;
// ES6 modules
import Spaces from 'do-spaces';

const spaces = new Spaces({
  // under settings of bucket in digital ocean (e.g. nyc3.digitaloceanspaces.com)
  endpoint: `<endpoint>`,
  // in GLOBAL settings of digital ocean
  accessKey: `<access_key>`,
  // in GLOBAL settings of digital ocean
  secret: `<secret>`,
  // `https://<name_of_the_bucket>.<urlOfDigitalOcean>` (e.g. hello-world.nyc3.digitaloceanspaces.com so bucket is: hello-world );
  bucket: `<name_of_the_bucket>`,
});
```

### Methods

- every method takes **optional** `awsParams` to enhance/replace it's default configuration for underlying method. Configuration docs can be found [here](https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html)
- `path` - **string**, path folder like (ending with `/`)
- `pathname` -- **string**, full path to file (e.g `/test/image.png`)
- all methods returns `Promise`

```js
const spaces = new Spaces({
    endpoint: `<endpoint>`, // under settings of bucket in digital ocean
    accessKey: `<access_key>`, // in GLOBAL settings of digital ocean
    secret: `<secret>`, // in GLOBAL settings of digital ocean
    bucket: `<name_of_the_bucket>`,
});

// ....

// `s3.putObject`
await spaces.createFolder({
    path: `/some/test/path/`,
    awsParams // optional - `s3.putObject`
});

// ....

// recursively removes all files in specified folder
await spaces.deleteFolder({
  path: `/some/test/path/`,
  awsListParams, //optional - used to list items before deleting - `s3.listObjects`
  awsDeleteParams, // optional - used to delete `s3.deleteObjects`
});

// folders are automatically created, no need to create folders beforehand
// automatically determines mime-type
await spaces.uploadFile({
    pathname: `/some/test/path/myfile.txt`,
    privacy: "public-read", // 'private' | 'public-read' (DO supports only those)
    file,// Blob, string...
    awsParams  // optional - `s3.putObject`
});

await spaces.downloadFile({
    pathname: "/some/test/path/myfile.txt", // or link https://<bucket>.<endpoint>/path/to/file
    awsParams // optional -  `s3.getObject`
});

// if there are more then 1000 files you will receive in response `nextMarker`,
// to continue with listing
await spaces.listFiles({
    maxFiles = 1000, // optional - default is 1000 (max allowed in DO/AWS)
    path: `/some/test/path/` ,
    nextMarker, // optional - from which path it should start listing (supplied)
    awsParams, // optional - `s3.getObjects`
});

await spaces.copyFile({
    pathname: "/test/newFile.txt",
    copiedPathname: "/test/copied.txt",
    privacy: "public-read", // 'private' | 'public-read'
    fromBucket, // optional - different bucket name if copied from elsewhere
    awsParams, // optional -`s3.copyObject`
});

await spaces.deleteFile({
    pathname: "/test/remove_me.txt",
    awsParams // optional `s3.deleteObject`
});
```
