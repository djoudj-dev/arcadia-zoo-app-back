import { Controller, Get, Req, Res, HttpStatus } from '@nestjs/common';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import { Request, Response } from 'express';
import { S3Config } from '../config/s3.config';

@Controller('images')
export class ImageController {

  @Get('health')
  healthCheck() {
    return {
      status: 'ok',
      message: 'Image proxy service is running',
      s3Config: {
        bucket: process.env.S3_BUCKET || 'arcadia',
        endpoint: process.env.S3_ENDPOINT || 'https://s3.nedellec-julien.fr',
        useS3: process.env.USE_S3
      }
    };
  }

  @Get('*')
  async serveImage(@Req() req: Request, @Res() res: Response) {
    // Extraire le chemin d'image depuis l'URL et nettoyer les doublons
    let imagePath = req.params[0] || req.path.replace('/api/images/', '');

    // Normalisation agressive du chemin pour éviter les doublons
    // 1) Supprimer le préfixe éventuel /api/images/
    imagePath = imagePath.replace(/^\/?api\/images\//, '');
    // 2) Remplacer les doublons de slash
    imagePath = imagePath.replace(/\/+/, '/');
    imagePath = imagePath.replace(/\/+/, '/'); // deux passes rapides suffisent pour les cas courants
    // 3) Si le chemin contient "images/animals/" on garde la dernière occurrence
    if (imagePath.includes('images/animals/')) {
      imagePath = 'animals/' + imagePath.split('images/animals/').pop();
    }
    // 4) Si le chemin contient "uploads/animals/", on le normalise vers "animals/"
    if (imagePath.includes('uploads/animals/')) {
      imagePath = 'animals/' + imagePath.split('uploads/animals/').pop();
    }

    // 4b) Normaliser également pour services
    if (imagePath.includes('images/services/')) {
      imagePath = 'services/' + imagePath.split('images/services/').pop();
    }
    if (imagePath.includes('uploads/services/')) {
      imagePath = 'services/' + imagePath.split('uploads/services/').pop();
    }

    // 4c) Normaliser également pour habitats
    if (imagePath.includes('images/habitats/')) {
      imagePath = 'habitats/' + imagePath.split('images/habitats/').pop();
    }
    if (imagePath.includes('uploads/habitats/')) {
      imagePath = 'habitats/' + imagePath.split('uploads/habitats/').pop();
    }

    // 5) Supprimer un éventuel préfixe /images/ résiduel
    imagePath = imagePath.replace(/^\/?images\//, '');
    // 6) Supprimer les slashs de début restants
    imagePath = imagePath.replace(/^\/+/, '');

    console.log('Request path:', req.path);
    console.log('Request params:', req.params);
    console.log('Cleaned imagePath:', imagePath);

    // Vérifier que le chemin d'image est valide
    if (!imagePath || imagePath === '') {
      return res.status(HttpStatus.BAD_REQUEST).send('Chemin d\'image manquant');
    }

    const S3_BUCKET = process.env.S3_BUCKET || 'arcadia';

    try {
      console.log('Demande d\'image:', imagePath);
      console.log('Bucket:', S3_BUCKET);

      // Utiliser le SDK S3 avec authentification
      const s3Client = S3Config.getInstance();

      const command = new GetObjectCommand({
        Bucket: S3_BUCKET,
        Key: imagePath,
      });

      console.log('Récupération depuis S3:', { Bucket: S3_BUCKET, Key: imagePath });

      const s3Response = await s3Client.send(command);

      if (!s3Response.Body) {
        console.error('Image non trouvée sur S3:', imagePath);
        res.status(HttpStatus.NOT_FOUND).send('Image non trouvée');
        return;
      }

      // Convertir le stream en buffer
      const chunks: Uint8Array[] = [];
      for await (const chunk of s3Response.Body as any) {
        chunks.push(chunk);
      }
      const buffer = Buffer.concat(chunks);

      // Déterminer le Content-Type de manière fiable
      const inferMime = (key: string): string => {
        const lower = key.toLowerCase();
        if (lower.endsWith('.webp')) return 'image/webp';
        if (lower.endsWith('.jpg') || lower.endsWith('.jpeg')) return 'image/jpeg';
        if (lower.endsWith('.png')) return 'image/png';
        if (lower.endsWith('.gif')) return 'image/gif';
        if (lower.endsWith('.svg')) return 'image/svg+xml';
        if (lower.endsWith('.avif')) return 'image/avif';
        return 'application/octet-stream';
      };

      const contentType = s3Response.ContentType || inferMime(imagePath);

      console.log('Image récupérée avec succès, taille:', buffer.length, 'type:', contentType);

      // Headers CORS et cache
      res.set({
        'Content-Type': contentType,
        'Content-Length': String(buffer.length),
        'Content-Disposition': 'inline',
        'Accept-Ranges': 'bytes',
        'Timing-Allow-Origin': '*',
        'Cross-Origin-Resource-Policy': 'cross-origin',
        'Access-Control-Allow-Origin': process.env.CORS_ORIGIN || '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': '*',
        'Cache-Control': 'public, max-age=31536000', // Cache 1 an
        'X-Served-By': 'Arcadia-Backend-Image-Proxy'
      });

      res.send(buffer);

    } catch (error) {
      console.error('Erreur lors du chargement de l\'image depuis S3:', error);

      if (error.name === 'NoSuchKey') {
        console.error('Image non trouvée sur S3:', imagePath);
        res.status(HttpStatus.NOT_FOUND).send('Image non trouvée');
        return;
      }

      if (error.name === 'AbortError' || error.cause?.code === 'UND_ERR_CONNECT_TIMEOUT') {
        console.error('Timeout de connexion S3 pour:', imagePath);
        res.status(HttpStatus.GATEWAY_TIMEOUT).send('Timeout de connexion S3');
        return;
      }

      res.status(HttpStatus.INTERNAL_SERVER_ERROR).send('Erreur serveur');
      return;
    }
  }
}