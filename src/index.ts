const AWS = require('aws-sdk');
const mime = require('mime-types');

export type Privacy = 'private' | 'public-read';
export class Spaces {
  s3: any;
  bucket: string;

  constructor({
    endpoint,
    accessKey,
    secret,
    bucket,
  }: {
    endpoint: string;
    accessKey: string;
    secret: string;
    bucket: string;
  }) {
    const spacesEndpoint = new AWS.Endpoint(endpoint);
    const s3 = new AWS.S3({
      endpoint: spacesEndpoint,
      accessKeyId: accessKey,
      secretAccessKey: secret,
    });

    this.bucket = bucket;
    this.s3 = s3;
  }
  _getContentTypeFromExtension(pathname: string) {
    const _split = pathname.split('.');
    const extension = _split[_split.length - 1];
    return mime.lookup(extension) || 'application/octet-stream';
  }
  async createFolder({ path }: { path: string }) {
    if (path[path.length - 1] !== '/') {
      throw new Error("do-spaces ~ createFolder - path must end with '/'");
    }

    const params = {
      Bucket: this.bucket,
      Key: path,
    };

    return await this.s3.putObject(params).promise();
  }
  async deleteFolder({ path }: { path: string }) {
    // TODO: delete whole content including sub directiries
    if (path[path.length - 1] !== '/') {
      throw new Error("do-spaces ~ deleteFolder - path must end with '/'");
    }

    const params = {
      Bucket: this.bucket,
      Key: path,
    };

    return await this.s3.deleteObject(params).promise();
  }

  async uploadFile({
    pathname,
    privacy,
    file,
  }: {
    pathname: string;
    privacy: Privacy;
    file: Blob | BinaryType | string | Buffer;
  }) {
    const params = {
      Bucket: this.bucket,
      Key: pathname,
      Body: file,
      ACL: privacy,
      ContentType: this._getContentTypeFromExtension(pathname),
    };

    return await this.s3.putObject(params).promise();
  }
  async copyFile({
    pathname,
    copyPathname,
    privacy,
    fromBucket,
  }: {
    pathname: string;
    copyPathname: string;
    privacy: Privacy;
    fromBucket?: string;
  }) {
    if (copyPathname[0] === '/') {
      throw new Error(
        'do-spaces ~ copyFile - copyPathname must not start with /'
      );
    }

    const _copyPathname = `/${fromBucket || this.bucket}/${copyPathname}`;

    const params = {
      Bucket: this.bucket,
      Key: pathname,
      CopySource: _copyPathname,
      ACL: privacy,
    };

    return await this.s3.copyObject(params).promise();
  }

  async deleteFile({ pathname }: { pathname: string }) {
    const params = {
      Bucket: this.bucket,
      Key: pathname,
    };

    return await this.s3.deleteObject(params).promise();
  }
}

export default Spaces;
