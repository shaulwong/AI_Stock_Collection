import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

import { z } from "zod";
import { getIssue, jiraSearch, createIssue, findUsers } from "./jira.mjs";
import { tabularJson } from "../utils.mjs";

// 创建 MCP 服务器
export const server = new McpServer({
  name: "jira-server",
  version: "1.0.0",
});

// 注册工具
server.tool(
  "jira_get_issue",
  "Get details of a specific Jira issue including its Epic links and relationship information",
  {
    issue_key: z.string().describe("Jira issue key (e.g., 'PROJ-123')"),
    fields: z
      .string()
      .describe(
        "Fields to return. Can be a comma-separated list (e.g., 'summary,status,customfield_10010'), '*all' for all fields (including custom fields), or omitted for essential fields only, customfield_10020 is sprint"
      )
      .default(
        "summary,description,status,assignee,reporter,created,updated,issuetype,labels,customfield_10020"
      )
      .optional(),
    properties: z
      .string()
      .describe("A comma-separated list of issue properties to return")
      .optional(),
  },
  async ({ issue_key, fields, properties }) => {
    const issue = await getIssue(issue_key, {
      fields,
      properties,
    });
    if (!issue) {
      return {
        content: [
          {
            type: "text",
            text: `Failed to get issue ${issue_key}`,
          },
        ],
        isError: true,
      };
    }
    return {
      content: [
        {
          type: "text",
          text: tabularJson(issue),
        },
      ],
    };
  }
);

server.tool(
  "jira_search",
  "Search Jira issues using JQL (Jira Query Language), you MUST first use the jira_find_users related tool to check the user's information to confirm whether the user exists when querying information about a user",
  {
    jql: z
      .string()
      .describe(
        'JQL query string (Jira Query Language). Examples: \n- Find by status: "status = \'In Progress\' AND project = PROJ"\n- Find by assignee: "assignee = xxxx (accountId)"\n- Find recently updated: "updated >= -7d AND project = PROJ"'
      ),
    fields: z
      .string()
      .describe(
        "Comma-separated fields to return in the results. It is best to include at least the summary and description fields for better understanding. The custom field `customfield_10020` indicates which sprint it belongs to"
      )
      .default(
        "summary,description,status,assignee,reporter,created,updated,issuetype,labels,customfield_10020"
      )
      .optional(),
    maxResults: z
      .number()
      .gte(1)
      .lte(100)
      .describe("Maximum number of results (1-100)")
      .default(50)
      .optional(),
  },
  async ({ jql, fields, maxResults }) => {
    const issues = await jiraSearch({
      jql,
      fields,
      maxResults,
    });
    return {
      content: [
        {
          type: "text",
          text: tabularJson(issues),
        },
      ],
    };
  }
);

console.log("APPNAME", process.env.APPNAME);
if (process.env.APPNAME !== "ccaibot") {
  server.tool(
    "jira_create_issue",
    "Create a new Jira issue with optional Epic link or parent for subtasks",
    {
      projectKey: z
        .string()
        .describe(
          "The JIRA project key (e.g. 'PROJ', 'DEV', 'SUPPORT'). This is the prefix of issue keys in your project. Never assume what it might be, always ask the user."
        ),
      summary: z.string().describe("Summary/title of the issue"),
      issueType: z
        .string()
        .describe(
          "Issue type (e.g. 'Task', 'Bug', 'Story', 'Epic', 'Subtask'). The available types depend on your project configuration. For subtasks, use 'Subtask' (not 'Sub-task') and include parent in additional_fields."
        )
        .default("Task")
        .optional(),
      assignee: z
        .string()
        .describe(
          "Assignee of the ticket (must be a valid Jira user accountID)"
        )
        .optional(),
      description: z
        .string()
        .describe("Issue description")
        .default("")
        .optional(),
      additionalFields: z
        .string()
        .describe(
          'Optional JSON string of additional fields to set. Examples:\n- Set priority: {"priority":{"name":"High"}}\n- Link to parent (for any issue type): {"parent":"PROJ-123"}\n- Set Fix Version/s: {"fixVersions":[{"id":"10020"}]}\n- Custom fields: {"customfield_10010":"value"}'
        )
        .default("{}")
        .optional(),
    },
    async ({
      projectKey,
      summary,
      issueType,
      assignee,
      description,
      additionalFields,
    }) => {
      try {
        const result = await createIssue({
          projectKey,
          summary,
          issueType,
          assignee,
          description,
          additionalFields,
        });

        return {
          content: [
            {
              type: "text",
              text: tabularJson(result),
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Failed to create issue: ${error.message}`,
            },
          ],
          isError: true,
        };
      }
    }
  );
}

server.tool(
  "jira_find_users",
  "Find Jira users that match the search criteria",
  {
    query: z
      .string()
      .describe(
        "A query string matched against user attributes (displayName and emailAddress) to find relevant users."
      ),
    username: z.string().describe("Optional username parameter").optional(),
    startAt: z
      .number()
      .describe(
        "The index of the first item to return in a page of results (page offset)."
      )
      .default(0)
      .optional(),
    maxResults: z
      .number()
      .describe("The maximum number of items to return per page (up to 50).")
      .default(50)
      .optional(),
  },
  async ({ query, username, startAt, maxResults }) => {
    try {
      const users = await findUsers({
        query,
        username,
        startAt,
        maxResults,
      });

      return {
        content: [
          {
            type: "text",
            text: tabularJson(users),
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Failed to find users: ${error.message}`,
          },
        ],
        isError: true,
      };
    }
  }
);

