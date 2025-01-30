import { Octokit } from '@octokit/rest';

async function checkRateLimits(authToken: string) {
    const octokit = new Octokit({ auth: authToken });
    // Let's check I'm not at risk of getting banned for API abuse
    const resp = await octokit.rateLimit.get();
    const limit = resp.headers['x-ratelimit-limit'];
    const remaining = Number.parseInt(resp.headers['x-ratelimit-remaining'] || "0");
    const used = resp.headers['x-ratelimit-used'];
    const resetTime = new Date(Number.parseInt(resp.headers['x-ratelimit-reset'] || "") * 1000);
    const secondsUntilReset = Math.floor((resetTime.getTime() - Date.now()) / 1000);
    console.log(`${remaining} requests left, used ${used}/${limit}. Reset at ${resetTime} (${secondsUntilReset}s)`)
    if (remaining === 0) {
        throw Error("Rate limit exceeded");
    }
    
}

export interface CopilotUsageBreakdown {
    language: string;
    editor: string;
    suggestions_count: number;
    acceptances_count: number;
    lines_suggested: number;
    lines_accepted: number;
    active_users: number;
}

export interface CopilotUsageMetrics {
    day: string;
    total_suggestions_count?: number;
    total_acceptances_count?: number;
    total_lines_suggested?: number;
    total_lines_accepted?: number;
    total_active_users?: number;
    total_chat_acceptances?: number;
    total_chat_turns?: number;
    total_active_chat_users?: number;
    breakdown: CopilotUsageBreakdown[] | null;
}

export interface GithubTeam {
    id: number;
    node_id: string;
    url: string;
    html_url: string;
    name: string;
    slug: string;
    description: string;
    privacy: string;
    notification_setting: string;
    permission: string;
    members_url: string;
    repositories_url: string;
    parent: null | GithubTeam;
}

export async function getCopilotUsageMetrics(
    authToken: string,
    org: string
): Promise<CopilotUsageMetrics[]> {
    const octokit = new Octokit({ auth: authToken });
    const result = await octokit.request('GET /orgs/{org}/copilot/usage', {
        org,
        headers: {
            'X-GitHub-Api-Version': '2022-11-28'
        }
    });
    
    return result.data as CopilotUsageMetrics[];
}

export async function getCopilotTeamUsageMetrics(
    authToken: string, 
    org: string,
    teamSlug: string
): Promise<CopilotUsageMetrics[]> {
    const octokit = new Octokit({ auth: authToken });
    const result = await octokit.request('GET /orgs/{org}/teams/{team_slug}/copilot/usage', {
        org,
        team_slug: teamSlug,
        headers: {
            'X-GitHub-Api-Version': '2022-11-28'
        }
    });
    
    return result.data as CopilotUsageMetrics[];
}

export async function getTeams(authToken: string, org: string): Promise<GithubTeam[]> {
    const octokit = new Octokit({ auth: authToken });
    
    const result = await octokit.request('GET /orgs/{org}/teams', {
        org,
        headers: {
            'X-GitHub-Api-Version': '2022-11-28'
        }
    });

    return result.data as GithubTeam[];
}
