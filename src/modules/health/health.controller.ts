import { Controller, Get } from '@nestjs/common';
import { HealthCheckService, HttpHealthIndicator, HealthCheck } from '@nestjs/terminus';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private http: HttpHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  @ApiOperation({ 
    summary: 'Application health check', 
    description: 'Checks the availability of external services and overall application status' 
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Application is running normally',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'ok' },
        info: {
          type: 'object',
          properties: {
            'nestjs-docs': {
              type: 'object',
              properties: {
                status: { type: 'string', example: 'up' }
              }
            }
          }
        },
        error: { type: 'object' },
        details: {
          type: 'object',
          properties: {
            'nestjs-docs': {
              type: 'object',
              properties: {
                status: { type: 'string', example: 'up' }
              }
            }
          }
        }
      }
    }
  })
  @ApiResponse({ 
    status: 503, 
    description: 'Application is unavailable or has issues' 
  })
  check() {
    return this.health.check([
      () => this.http.pingCheck('nestjs-docs', 'https://docs.nestjs.com'),
    ]);
  }
}
