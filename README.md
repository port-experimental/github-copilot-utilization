# GitHub Copilot Utilization

## Overview

Want to see your Github Copilot utilization breakdown in Port? Maybe you're looking to correlate your DORA metrics with copilot utilization, or look for how copilot might be contributing to your developer experience.

This integration will help you import the data into Port, from where you can integrate into your scorecards, dashboards and more.

## Setup

1. Clone repo
1. Setup the code and workflow configuration in a central repository. I'd recommend creating one `.port` repository for all of your GitHub actions for custom integrations and self-service actions
1. For your repository that will run the github actions, configure repository secrets for the following environmental variables:

        - PORT_CLIENT_ID
        - PORT_CLIENT_SECRET
        - X_GITHUB_ORG
        - X_GITHUB_AUTH_TOKEN
1. Create a blueprint in port for the blueprint below `github_copilot_usage_record`
1. Add a relation to the blueprint, to some `organization` or other higher level grouping on which you will create an aggregation property. Feel free to copy from the examples below
1. Create aggregation properties on the related entity
1. Have fun!

#### Blueprint Template
```json
{
  "identifier": "github_copilot_usage_record",
  "description": "A daily summary record of GitHub Copilot Usage",
  "title": "GitHub Copilot Usage Record",
  "icon": "Github",
  "schema": {
    "properties": {
      "total_suggestions_count": {
        "type": "number",
        "title": "Total Suggestions Count"
      },
      "record_date": {
        "type": "string",
        "title": "Record Date",
        "description": "The date for the summary record",
        "format": "date-time"
      },
      "total_acceptances_count": {
        "type": "number",
        "title": "Total Acceptances Count"
      },
      "total_lines_suggested": {
        "type": "number",
        "title": "Total Lines Suggested"
      },
      "total_lines_accepted": {
        "type": "number",
        "title": "Total Lines Accepted"
      },
      "total_active_users": {
        "type": "number",
        "title": "Total Active Users"
      },
      "total_chat_acceptances": {
        "type": "number",
        "title": "Total Chat Acceptances"
      },
      "total_chat_turns": {
        "type": "number",
        "title": "Total Chat Turns"
      },
      "total_active_chat_users": {
        "type": "number",
        "title": "Total Active Chat Users"
      },
      "git_hub_org": {
        "type": "string",
        "title": "GitHub Org"
      },
      "breakdown": {
        "type": "object",
        "title": "Breakdown"
      }
    },
    "required": []
  },
  "mirrorProperties": {},
  "calculationProperties": {},
  "aggregationProperties": {},
  "relations": {
    // "organization": {
    //   "title": "Organization",
    //   "description": "The top of the org hierarchy",
    //   "target": "organization",
    //   "required": false,
    //   "many": false
    }
  }
}
```

#### Aggregation Properties

```
{
  "identifier": "organization",
  "description": "The whole company/group/organization",
  "title": "Organization",
  "icon": "Team",
  "schema": {
    "properties": {},
    "required": []
  },
  "mirrorProperties": {},
  "calculationProperties": {},
  "aggregationProperties": {
    "total_copilot_lines_suggested": {
      "title": "Total Copilot Lines Suggested",
      "icon": "DefaultProperty",
      "type": "number",
      "target": "github_copilot_usage_record",
      "query": {
        "combinator": "and",
        "rules": [
          {
            "property": "record_date",
            "operator": "between",
            "value": {
              "preset": "today"
            }
          }
        ]
      },
      "calculationSpec": {
        "func": "max",
        "property": "total_lines_suggested",
        "calculationBy": "property"
      }
    },
    "total_copilot_lines_accepted": {
      "title": "Total Copilot Lines Accepted",
      "icon": "DefaultProperty",
      "type": "number",
      "target": "github_copilot_usage_record",
      "query": {
        "combinator": "and",
        "rules": [
          {
            "property": "record_date",
            "operator": "between",
            "value": {
              "preset": "today"
            }
          }
        ]
      },
      "calculationSpec": {
        "func": "max",
        "property": "total_lines_accepted",
        "calculationBy": "property"
      }
    },
    "total_copilot_active_users": {
      "title": "Total Active Users",
      "icon": "DefaultProperty",
      "type": "number",
      "target": "github_copilot_usage_record",
      "query": {
        "combinator": "and",
        "rules": [
          {
            "property": "record_date",
            "operator": "between",
            "value": {
              "preset": "today"
            }
          }
        ]
      },
      "calculationSpec": {
        "func": "max",
        "property": "total_active_users",
        "calculationBy": "property"
      }
    }
  },
  "relations": {}
}
```
