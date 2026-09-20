import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service.js';
import type { Song } from '@reeltune/types';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('health')
  getHealth(): { status: string } {
    return { status: 'ok' };
  }

  @Get('test-types')
  getTestTypes(): Song[] {
    return [];
  }
}
