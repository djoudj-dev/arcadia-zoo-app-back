import { Controller, Get } from '@nestjs/common';
import { ServicesService } from '../services/services.service';
import { Service } from '../../admin-dashboard/service-management/models/service.model';

@Controller('/api/services')
export class ServicesController {
  /**
   * Injection du service ServicesService pour la gestion des services.
   * @param servicesService Service de gestion des services.
   */

  constructor(private servicesService: ServicesService) {}

  @Get()
  async getAllServices(): Promise<Service[]> {
    return this.servicesService.getAllServices();
  }
}
