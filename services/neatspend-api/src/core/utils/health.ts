import { HealthCheck } from '../../interfaces';

/**
 * Checks the health of a microservice
 * @param serviceName Name of the service
 * @param serviceUrl URL of the service
 * @returns Health check result
 */
export const checkServiceHealth = async (
  serviceName: string,
  serviceUrl: string
): Promise<HealthCheck> => {
  try {
    const healthUrl = `${serviceUrl}/health`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);

    const response = await fetch(healthUrl, {
      signal: controller.signal,
      headers: { Accept: 'application/json' },
    });

    clearTimeout(timeoutId);
    
    return {
      service: serviceName,
      status: response.ok ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      responseTime: response.headers.get('x-response-time')
        ? parseInt(response.headers.get('x-response-time')!)
        : undefined,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return {
      service: serviceName,
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: errorMessage,
    };
  }
};