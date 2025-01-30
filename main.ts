import { upsertEntity } from './src/port_client';
import { getCopilotTeamUsageMetrics, getCopilotUsageMetrics, getTeams } from './src/github';

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
    // First, let's get the org level usage metrics
    console.log('fetching org level copilot metrics');
    const metrics = await getCopilotUsageMetrics(AUTH_TOKEN, GITHUB_ORG_NAME);
    for (const metric of metrics) {
      console.log(metric);
      await upsertEntity('github_copilot_usage_record', `copilot_${GITHUB_ORG_NAME}-${metric.day}`, `${GITHUB_ORG_NAME}-${metric.day}`, 
        {
          ...metric,
          record_date: new Date(metric.day),
          breakdown: { arr: metric.breakdown },
        }, 
        // { organization: 'the_company' }
        {});
    }

    // Second, let's get the usage metrics per team
    // But we need the teams

    console.log('fetching github teams');
    const teams = await getTeams(AUTH_TOKEN, GITHUB_ORG_NAME);
    for (const team of teams) {
      console.log(`fetching usage metrics for team ${team.slug}`);
      const teamMetrics = await getCopilotTeamUsageMetrics(AUTH_TOKEN, GITHUB_ORG_NAME, team.slug);
      for (const metric of teamMetrics) {
        console.log(metric);
        await upsertEntity('github_copilot_team_usage_record', `copilot_${GITHUB_ORG_NAME}_${team.slug}-${metric.day}`, `${GITHUB_ORG_NAME}_${team.slug}-${metric.day}`,
          {
            ...metric,
            record_date: new Date(metric.day),
            breakdown: { arr: metric.breakdown },
            team: team.slug
          },
          // { organization: GITHUB_ORG_NAME }
          {}
          );
      }
    }

  } catch (error) {
    console.error('Error:', error);
  }
}

main();