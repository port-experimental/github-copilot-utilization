import { upsertEntity } from './src/port_client';
import { getCopilotUsageMetrics } from './src/copilot';

async function main() {
  const GITHUB_ORG_NAME = process.env.X_GITHUB_ORG;
  const AUTH_TOKEN = process.env.X_GITHUB_AUTH_TOKEN;
  const PORT_CLIENT_ID = process.env.PORT_CLIENT_ID;
  const PORT_CLIENT_SECRET = process.env.PORT_CLIENT_SECRET;

  if (!GITHUB_ORG_NAME || !AUTH_TOKEN) {
    console.log('Please provide env vars X_GITHUB_ORG and X_GITHUB_AUTH_TOKEN');
    process.exit(0);
  }

  if (!PORT_CLIENT_ID || !PORT_CLIENT_SECRET) {
    console.log('Please provide env vars PORT_CLIENT_ID and PORT_CLIENT_SECRET');
    process.exit(0);
  }

  try {
    console.log('fetching copilot')
    const metrics = await getCopilotUsageMetrics(AUTH_TOKEN, GITHUB_ORG_NAME);
    for (const metric of metrics) {
      console.log(metric);
      await upsertEntity('github_copilot_usage_record', `copilot_${GITHUB_ORG_NAME}-${metric.day}`, `${GITHUB_ORG_NAME}-${metric.day}`, 
        {
          ...metric,
          breakdown: { arr: metric.breakdown },
        }, 
        // { organization: 'the_company' }
        {});
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

main();