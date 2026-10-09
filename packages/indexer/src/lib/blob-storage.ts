import path from 'node:path';
import { type BaseLogger } from 'pino';
import { type AzureClients } from '../plugins/azure.js';

export class BlobStorage {
  constructor(
    private logger: BaseLogger,
    private azure: AzureClients,
  ) {}

  async upload(filename: string, data: Buffer, type: string) {
    const blobContainer = this.azure.blobContainer;
    await blobContainer.createIfNotExists();

    const blobName = getBlobNameFromFile(filename);
    const blockBlobClient = blobContainer.getBlockBlobClient(blobName);

    this.logger.debug(`Uploading blob: ${blobName}...`);

    await blockBlobClient.uploadData(data, { blobHTTPHeaders: { blobContentType: type } });
  }

  async delete(filename: string) {
    if (typeof filename !== 'string' || filename.length === 0) {
      throw new TypeError('Filename is required');
    }

    const blobContainer = this.azure.blobContainer;
    if (await blobContainer.exists()) {
      const name = getBlobNameFromFile(filename);
      this.logger.debug(`Removing blob: ${name}...`);
      await blobContainer.getBlockBlobClient(name).deleteIfExists();
    }
  }

  async deleteAll() {
    const blobContainer = this.azure.blobContainer;
    if (await blobContainer.exists()) {
      const allBlobs = await blobContainer.listBlobsFlat();
      for await (const blob of allBlobs) {
        this.logger.debug(`Removing blob: ${blob.name}...`);
        await blobContainer.deleteBlob(blob.name);
      }
    }
  }
}

export function getBlobNameFromFile(filename: string): string {
  return path.basename(filename);
}
