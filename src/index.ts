const AWS = require('aws-sdk');
class Spaces {
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
    privacy: 'private' | 'public-read';
    file: Blob | BinaryType | string;
  }) {
    const params = {
      Bucket: this.bucket,
      Key: pathname,
      Body: file,
      ACL: privacy,
    };

    return await this.s3.putObject(params).promise();
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
