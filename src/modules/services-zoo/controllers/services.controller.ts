import { Controller, Get } from '@nestjs/common';
import { Service } from '../../dashboard/admin-dashboard/service-management/models/service.model';
import { ServicesService } from '../services/services.service';

@Controller('/services')
export class ServicesController {
  /**
   * Injection du service ServicesService pour la gestion des services.
   * @param servicesService Service de gestion des services.
   */

  constructor(private readonly servicesService: ServicesService) {}

  @Get()
  async getAllServices(): Promise<Service[]> {
    return this.servicesService.getAllServices();
  }
}
