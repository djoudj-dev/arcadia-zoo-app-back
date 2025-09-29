import { Controller, Get, Param, Res, HttpException, HttpStatus } from '@nestjs/common';
import { Response } from 'express';

@Controller('images')
export class ImageController {

  @Get('*')
  async serveImage(@Param('0') imagePath: string, @Res() res: Response) {
    try {
      console.log('Demande d\'image:', imagePath);

      const S3_BUCKET = process.env.S3_BUCKET;

      // URL S3 publique (via notre MinIO)
      const s3Url = `https://s3.nedellec-julien.fr/${S3_BUCKET}/${imagePath}`;
      console.log('URL S3 construite:', s3Url);

      // Récupérer l'image depuis S3
      const response = await fetch(s3Url);

      if (!response.ok) {
        console.error('Image non trouvée sur S3:', s3Url);
        res.status(HttpStatus.NOT_FOUND).send('Image non trouvée');
        return;
      }

      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const contentType = response.headers.get('content-type') || 'image/webp';

      console.log('Image récupérée avec succès, taille:', buffer.length);

      // Headers CORS et cache
      res.set({
        'Content-Type': contentType,
        'Access-Control-Allow-Origin': process.env.CORS_ORIGIN || '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': '*',
        'Cache-Control': 'public, max-age=31536000', // Cache 1 an
        'X-Served-By': 'Arcadia-Backend-Image-Proxy'
      });

      res.send(buffer);

    } catch (error) {
      console.error('Erreur lors du chargement de l\'image:', error);
      throw new HttpException('Image introuvable', HttpStatus.NOT_FOUND);
    }
  }

  @Get('health')
  healthCheck() {
    return {
      status: 'ok',
      message: 'Image proxy service is running',
      s3Config: {
        bucket: process.env.S3_BUCKET,
        endpoint: process.env.S3_ENDPOINT,
        useS3: process.env.USE_S3
      }
    };
  }
}