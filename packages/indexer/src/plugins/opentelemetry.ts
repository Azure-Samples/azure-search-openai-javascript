import fp from 'fastify-plugin';
import { useAzureMonitor, type AzureMonitorOpenTelemetryOptions } from '@azure/monitor-opentelemetry';
import { registerInstrumentations } from '@opentelemetry/instrumentation';
import { FastifyInstrumentation } from '@opentelemetry/instrumentation-fastify';

export default fp(
  async (fastify) => {
    const { applicationInsightsConnectionString } = fastify.config;
    if (applicationInsightsConnectionString) {
      const options: AzureMonitorOpenTelemetryOptions = {
        azureMonitorExporterOptions: {
          connectionString: applicationInsightsConnectionString,
        },
      };
      useAzureMonitor(options);

      registerInstrumentations({
        instrumentations: [
          // Azure monitor already instruments HTTP layer by default,
          // so we don't need to add instrumentation for it
          new FastifyInstrumentation(),
        ],
      });
    } else {
      fastify.log.info('Application Insights configuration not found, OpenTelemetry disabled');
    }
  },
  {
    name: 'opentelemetry',
    dependencies: ['config'],
  },
);
