import { Command } from 'commander';
import { getEntities, upsertEntity } from './src/port_client';
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
    const program = new Command();

    program
      .name('ai-assistant-utilization')
      .description('CLI to fetch AI assistant utilization and write data to Port');

    program
      .command('fetch-copilot')
      .description('Get utilization data from GitHub copilot')
      .action(async () => {
        console.log('fetching copilot')
        const metrics = await getCopilotUsageMetrics(AUTH_TOKEN, GITHUB_ORG_NAME);
        for (const metric of metrics) {
          console.log(metric);
          await upsertEntity('github_copilot_usage_record', `copilot_${GITHUB_ORG_NAME}-${metric.day}`, `${GITHUB_ORG_NAME}-${metric.day}`, 
            {
              ...metric,
              breakdown: { arr: metric.breakdown },
            }, { organization: 'the_company' });
        }
        // get the data
        // write the data to port 
      });

    program
      .command('fetch-codewhisperer') 
      .description('Get utilization data from AWS codewhisperer')
      .action(async () => {
        // get the data
        // write the data to port 
      });

    program
      .command('fetch-amazon-q-developer') 
      .description('Get utilization data from AWS codewhisperer')
      .action(async () => {
        // get the data
        // write the data to port 
      });

     program
      .command('fetch-cody') 
      .description('Get utilization data from AWS codewhisperer')
      .action(async () => {
        // get the data
        // write the data to port 
      });
    // IDEs
    /**
     * Cursor doesnt have a Usage API. 
     * There are two options - 
     * 1. The customer to use the Cursor Custom API keys to forward all requests through the LLM providers
     * 2. Use a proxy around the cursor backend, to log all usage... however this becomes a single POF
     */
    program
      .command('fetch-cursor') 
      .description('Get utilization data on cursor')
      .action(async () => {
        // get the data
        // write the data to port 
      });

    await program.parseAsync();

  } catch (error) {
    console.error('Error:', error);
  }
}

main();