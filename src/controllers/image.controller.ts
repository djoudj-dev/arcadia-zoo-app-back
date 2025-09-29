import { Controller, Get, Req, Res, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';

@Controller('images')
export class ImageController {

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

    const S3_BUCKET = process.env.S3_BUCKET;
    const S3_ENDPOINT = process.env.S3_ENDPOINT || 'http://minio-ukskwggs4wsgw4soos8k4wwg:9000';

    // Construire l'URL avec le bon protocole
    let s3Url: string;
    if (S3_ENDPOINT.startsWith('http://') || S3_ENDPOINT.startsWith('https://')) {
      // L'endpoint contient déjà le protocole
      const baseUrl = S3_ENDPOINT.replace(/\/$/, ''); // Retirer le slash final si présent
      s3Url = `${baseUrl}/${S3_BUCKET}/${imagePath}`;
    } else {
      // Pas de protocole, ajouter https par défaut
      s3Url = `https://${S3_ENDPOINT}/${S3_BUCKET}/${imagePath}`;
    }

    try {
      console.log('Demande d\'image:', imagePath);
      console.log('URL S3 construite:', s3Url);

      // Récupérer l'image depuis S3 avec timeout et retry
      let response;
      const maxRetries = 2;

      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          console.log(`Tentative ${attempt}/${maxRetries} pour récupérer l'image`);

          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 secondes timeout

          response = await fetch(s3Url, {
            signal: controller.signal,
            headers: {
              'User-Agent': 'Arcadia-Backend-Image-Proxy',
              'Accept': 'image/*',
              'Connection': 'keep-alive'
            }
          });

          clearTimeout(timeoutId);
          break; // Succès, sortir de la boucle

        } catch (fetchError) {
          console.warn(`Échec tentative ${attempt}:`, fetchError.message);

          if (attempt === maxRetries) {
            console.warn('Échec après la dernière tentative:', fetchError);
            break; // Sortir de la boucle et gérer l'erreur plus bas sans lancer une exception locale
          }

          // Attendre 1 seconde avant le retry
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      if (!response || !response.ok) {
        console.error('Image non trouvée ou erreur lors de la récupération sur S3:', s3Url);
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

      if (error.name === 'AbortError') {
        console.error('Timeout lors de la récupération de l\'image:', s3Url);
        res.status(HttpStatus.GATEWAY_TIMEOUT).send('Timeout de connexion S3');
        return;
      }

      if (error.cause?.code === 'UND_ERR_CONNECT_TIMEOUT') {
        console.error('Timeout de connexion S3:', s3Url);
        res.status(HttpStatus.GATEWAY_TIMEOUT).send('Timeout de connexion S3');
        return;
      }

      res.status(HttpStatus.INTERNAL_SERVER_ERROR).send('Erreur serveur');
      return;
    }
  }
}