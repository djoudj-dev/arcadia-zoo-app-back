import { S3Client } from '@aws-sdk/client-s3';
import { ConfigService } from '@nestjs/config';

export class S3Config {
  private static instance: S3Client | null = null;

  static getInstance(configService?: ConfigService): S3Client {
    if (!this.instance) {
      const endpoint = process.env.S3_ENDPOINT || configService?.get('S3_ENDPOINT');
      const region = process.env.S3_REGION || configService?.get('S3_REGION') || 'us-east-1';
      const accessKeyId = process.env.S3_ACCESS_KEY || configService?.get('S3_ACCESS_KEY');
      const secretAccessKey = process.env.S3_SECRET_KEY || configService?.get('S3_SECRET_KEY');
      const bucket = process.env.S3_BUCKET || configService?.get('S3_BUCKET');

      console.log('Configuration S3:', {
        endpoint,
        region,
        bucket,
        accessKeyId: accessKeyId ? accessKeyId.substring(0, 4) + '***' : 'MISSING',
        secretAccessKey: secretAccessKey ? '***' + secretAccessKey.substring(secretAccessKey.length - 4) : 'MISSING'
      });

      if (!endpoint || !accessKeyId || !secretAccessKey) {
        throw new Error('Configuration S3 manquante. Vérifiez vos variables d\'environnement.');
      }

      this.instance = new S3Client({
        endpoint,
        region,
        credentials: {
          accessKeyId,
          secretAccessKey,
        },
        forcePathStyle: true, // Nécessaire pour les endpoints compatibles S3 comme MinIO
      });
    }

    return this.instance;
  }
}