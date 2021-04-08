import AWS from 'aws-sdk';
import mime from 'mime-types';

type AwsParam = { [key: string]: any };

export type Privacy = 'private' | 'public-read';
export type Credentials = {
  endpoint: string;
  accessKey: string;
  secret: string;
  bucket: string;
};

export type ListFiles = {
  maxFiles?: number;
  path: string;
  nextMarker?: string;
  awsParams?: AwsParam;
};

export type UploadFile = {
  pathname: string;
  privacy: Privacy;
  file: Blob | BinaryType | string | Buffer;
  awsParams?: AwsParam;
};

export type CopyFile = {
  pathname: string;
  copiedPathname: string;
  privacy: Privacy;
  fromBucket?: string;
  awsParams?: AwsParam;
};

export type FolderParam = {
  path: string;
  awsParams?: AwsParam;
};

export type FileParam = {
  pathname: string;
  awsParams?: AwsParam;
};

export type DeleteFolder = {
  path: string;
  awsListParams?: AwsParam;
  awsDeleteParams?: AwsParam;
};

export class Spaces {
  s3: any;
  bucket: string;
  endpoint: string;

  constructor({ endpoint, accessKey, secret, bucket }: Credentials) {
    const spacesEndpoint = new AWS.Endpoint(endpoint);
    const s3 = new AWS.S3({
      endpoint: spacesEndpoint,
      accessKeyId: accessKey,
      secretAccessKey: secret,
    });

    this.endpoint = endpoint;
    this.bucket = bucket;
    this.s3 = s3;
  }
  private _getContentTypeFromExtension(pathname: string) {
    const _split = pathname.split('.');
    const extension = _split[_split.length - 1];
    return mime.lookup(extension) || 'application/octet-stream';
  }
  public async createFolder({ path, awsParams }: FolderParam) {
    if (path[path.length - 1] !== '/') {
      throw new Error("do-spaces ~ createFolder - path must end with '/'");
    }

    const params = {
      Bucket: this.bucket,
      Key: path,
      ...awsParams,
    };

    return await this.s3.putObject(params).promise();
  }
  /**
   * Removed all files inside folder
   */
  public async deleteFolder({
    path,
    awsListParams,
    awsDeleteParams,
  }: DeleteFolder) {
    if (path[path.length - 1] !== '/') {
      throw new Error("do-spaces ~ deleteFolder - path must end with '/'");
    }

    const that = this;

    // @ts-ignore
    async function _delete({
      path,
      nextMarker,
    }: {
      path: string;
      nextMarker?: string;
    }) {
      const { Contents, NextMarker } = await that.listFiles({
        maxFiles: 1000,
        path,
        nextMarker,
        ...awsListParams,
      });

      if (Contents && Contents.length) {
        const _filesToDelete = Contents.map((item: any) => {
          return { Key: item.Key };
        });

        const params = {
          Bucket: that.bucket,
          Delete: { Objects: _filesToDelete },
          ...awsDeleteParams,
        };

        if (NextMarker) {
          await that.s3.deleteObjects(params).promise();
          return await _delete({ path, nextMarker });
        } else {
          return await that.s3.deleteObjects(params).promise();
        }
      } else {
        console.info(
          `do-spaces ~ removeFolder - nothing to remove for path ${path}`
        );
        return null;
      }
    }

    return await _delete({ path });
  }

  public async downloadFile({ pathname, awsParams }: FileParam) {
    let _pathname = pathname;
    const _fullUrl = `https://${this.bucket}.${this.endpoint}`;

    if (_pathname.indexOf(_fullUrl) === 0) {
      _pathname = _pathname.replace(_fullUrl, '');
    }

    if (_pathname[0] === '/') {
      _pathname = _pathname.replace('/', '');
    }

    const params = {
      Bucket: this.bucket,
      Key: _pathname,
      ...awsParams,
    };

    return this.s3.getObject(params).promise();
  }

  public async listFiles({
    maxFiles = 1000,
    path,
    nextMarker,
    awsParams,
  }: ListFiles) {
    if (path[path.length - 1] !== '/') {
      throw new Error("do-spaces ~ deleteFolder - path must end with '/'");
    }

    const params = {
      Bucket: this.bucket,
      MaxKeys: maxFiles,
      Prefix: path,
      Marker: nextMarker,
      ...awsParams,
    };

    return await this.s3.listObjects(params).promise();
  }

  public async uploadFile({ pathname, privacy, file, awsParams }: UploadFile) {
    const params = {
      Bucket: this.bucket,
      Key: pathname,
      Body: file,
      ACL: privacy,
      ContentType: this._getContentTypeFromExtension(pathname),
      ...awsParams,
    };

    return await this.s3.putObject(params).promise();
  }
  public async copyFile({
    pathname,
    copiedPathname,
    privacy,
    fromBucket,
    awsParams,
  }: CopyFile) {
    if (copiedPathname[0] === '/') {
      throw new Error(
        'do-spaces ~ copyFile - copyPathname must not start with /'
      );
    }

    const _copyPathname = `/${fromBucket || this.bucket}/${copiedPathname}`;

    const params = {
      Bucket: this.bucket,
      Key: pathname,
      CopySource: _copyPathname,
      ACL: privacy,
      ...awsParams,
    };

    return await this.s3.copyObject(params).promise();
  }

  public async deleteFile({ pathname, awsParams }: FileParam) {
    const params = {
      Bucket: this.bucket,
      Key: pathname,
      ...awsParams,
    };

    return await this.s3.deleteObject(params).promise();
  }
}

export default Spaces;
