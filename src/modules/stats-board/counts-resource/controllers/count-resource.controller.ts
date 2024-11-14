import { Controller, Get } from '@nestjs/common';
import { CountResourceService } from '../services/count-resource.service';

@Controller('stats')
export class CountResourceController {
  constructor(private readonly countResourceService: CountResourceService) {}

  /**
   * Récupère les statistiques globales du zoo
   * @returns Un objet contenant le nombre d'animaux, d'habitats, d'utilisateurs et de services
   */
  @Get('count-resource')
  async getStats() {
    return await this.countResourceService.getStats();
  }
}
