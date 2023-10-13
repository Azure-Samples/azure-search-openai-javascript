import path from 'path';
import { useAzureMonitor } from '@azure/monitor-opentelemetry';
import { registerInstrumentations } from '@opentelemetry/instrumentation';
import { FastifyInstrumentation } from '@opentelemetry/instrumentation-fastify';
import dotenv from 'dotenv';

// Opentelemetry setup must happens before anything else is loaded
const environmentPath = path.resolve(process.cwd(), '../../.env');
dotenv.config({ path: environmentPath });

const applicationInsightsConnectionString = process.env.APPLICATION_INSIGHTS_CONNECTION_STRING;
if (applicationInsightsConnectionString) {
  console.info('Application Insights configuration found, OpenTelemetry enabled');
  const options = {
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
  console.info('Application Insights configuration not found, OpenTelemetry disabled');
}
