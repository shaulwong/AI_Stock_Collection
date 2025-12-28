import axios from "axios";
import TurndownService from "turndown";

const turndownService = new TurndownService();

// 默认使用环境变量 JIRA_BASE_URL，如果没有设置则使用 JIRA_DOMAIN 构建
// 例如: JIRA_DOMAIN=mycompany 会变成 https://mycompany.atlassian.net/rest/api/3
function getBaseURL() {
  if (process.env.JIRA_BASE_URL) {
    return process.env.JIRA_BASE_URL;
  }
  const domain = process.env.JIRA_DOMAIN || "coinmarketcap";
  return `https://${domain}.atlassian.net/rest/api/3`;
}

function request(options) {
  return axios.request({
    baseURL: getBaseURL(),
    auth: {
      username: process.env.EMAIL,
      password: process.env.TOKEN,
    },
    ...options,
  });
}

export async function getIssue(tag, options = {}) {
  const {
    fields = "summary,description,status,assignee,reporter,created,updated,issuetype,labels,customfield_10020",
    properties = null,
  } = options;

  try {
    const requestParams = {
      fields,
      expand: "renderedFields",
    };

    if (properties) {
      requestParams.properties = properties;
    }

    const data = await request({
      url: `/issue/${tag}`,
      params: requestParams,
    });
    if (data.status === 200) {
      const res = data.data;
      // console.log(JSON.stringify(res, null, 2));
      const { fields, renderedFields } = res;
      if (!fields) {
        return { id: res.id, key: res.key };
      }
      const issue = {
        id: res.id,
        key: res.key,
        summary: fields.summary,
        description: renderedFields?.description
          ? turndownService.turndown(renderedFields.description)
          : "",
        status: fields.status?.name,
        issuetype: fields.issuetype?.name,
        created: fields.created,
        updated: fields.updated,
        labels: fields.labels,
      };
      if (fields.parent) {
        issue.parent = {
          id: fields.parent.id,
          key: fields.parent.key,
          summary: fields.parent.fields.summary,
          status: fields.parent.fields.status.name,
          issuetype: fields.parent.fields.issuetype.name,
        };
      } else {
        issue.parent = null;
      }
      if (fields.assignee) {
        issue.assignee = {
          accountId: fields.assignee.accountId,
          displayName: fields.assignee.displayName,
          email: fields.assignee.emailAddress,
        };
      } else {
        issue.assignee = null;
      }
      if (fields.reporter) {
        issue.reporter = {
          accountId: fields.reporter.accountId,
          displayName: fields.reporter.displayName,
          email: fields.reporter.emailAddress,
        };
      } else {
        issue.reporter = null;
      }
      if (fields.customfield_10020) {
        issue.sprint = fields.customfield_10020;
      } else {
        issue.sprint = null;
      }
      return issue;
    }
    return {};
  } catch (error) {
    console.error(`Error fetching Jira issue ${tag}:`, error.message);
    throw error;
  }
}

/**
 * Search for Jira issues using JQL
 */
export async function jiraSearch(params) {
  try {
    const {
      jql,
      fields = "summary,description,status,assignee,reporter,created,updated,issuetype,labels,customfield_10020",
      maxResults = 50,
    } = params;

    // 构建请求数据
    const requestData = {
      jql,
      fields: fields.split(","),
      maxResults,
      expand: "renderedFields",
    };

    const response = await request({
      url: `/search/jql`,
      method: "POST",
      data: requestData,
    });

    const { issues } = response.data;
    const issuesData = issues.map((issue) => {
      const { fields, renderedFields } = issue;
      if (!fields) {
        return { id: issue.id, key: issue.key };
      }
      const data = {
        id: issue.id,
        key: issue.key,
        summary: fields.summary,
        description: renderedFields?.description
          ? turndownService.turndown(renderedFields.description)
          : "",
        status: fields.status?.name,
        created: fields.created,
        updated: fields.updated,
        issuetype: fields.issuetype?.name,
        labels: fields.labels,
      };
      if (fields.assignee) {
        data.assignee = {
          accountId: fields.assignee.accountId,
          displayName: fields.assignee.displayName,
          email: fields.assignee.emailAddress,
        };
      } else {
        data.assignee = null;
      }
      if (fields.reporter) {
        data.reporter = {
          accountId: fields.reporter.accountId,
          displayName: fields.reporter.displayName,
          email: fields.reporter.emailAddress,
        };
      } else {
        data.reporter = null;
      }
      if (fields.customfield_10020) {
        data.sprint = fields.customfield_10020;
      } else {
        data.sprint = null;
      }
      return data;
    });
    return {
      issues: issuesData,
    };
  } catch (error) {
    console.error(`Error searching Jira issues:`, error.message);
    throw error;
  }
}

export async function getProjects() {
  try {
    const response = await request({
      url: `/project`,
    });
    return response.data;
  } catch (error) {
    console.error(`Error getting Jira projects:`, error.message);
    throw error;
  }
}

/**
 * Create a new Jira issue
 */
export async function createIssue(params) {
  try {
    const {
      projectKey,
      summary,
      issueType = "Task",
      assignee = null,
      description = "",
      additionalFields = "{}",
    } = params;

    // 构建基本请求数据
    const requestData = {
      fields: {
        project: {
          key: projectKey,
        },
        summary,
        issuetype: {
          name: issueType,
        },
      },
    };

    if (description) {
      requestData.fields.description = {
        type: "doc",
        version: 1,
        content: [
          { type: "paragraph", content: [{ type: "text", text: description }] },
        ],
      };
    }

    // 添加可选字段
    if (assignee) {
      requestData.fields.assignee = { id: assignee };
    }

    // 合并额外字段
    try {
      const additionalFieldsObj = JSON.parse(additionalFields);
      Object.entries(additionalFieldsObj).forEach(([key, value]) => {
        requestData.fields[key] = value;
      });
    } catch (error) {
      console.error("Error parsing additional_fields:", error.message);
    }

    const response = await request({
      url: "/issue",
      method: "POST",
      data: requestData,
    });

    return response.data;
  } catch (error) {
    console.error(`Error creating Jira issue:`, error.message);
    throw error;
  }
}

export async function deleteIssue(params) {
  try {
    const { issueKey } = params;
    const response = await request({
      url: `/issue/${issueKey}`,
      method: "DELETE",
    });
    return response.data;
  } catch (error) {
    console.error(`Error deleting Jira issue:`, error.message);
    throw error;
  }
}
/**
 * Find users in Jira
 */
export async function findUsers(params) {
  try {
    const { query, username, startAt = 0, maxResults = 50 } = params;

    // 准备请求参数
    const requestParams = {
      query,
      startAt,
      maxResults,
    };

    // 添加用户名参数（可选）
    if (username) {
      requestParams.username = username;
    }
    // console.log("🚀 ~ findUsers ~ requestParams:", requestParams);

    const response = await request({
      url: "/user/search",
      method: "GET",
      params: requestParams,
    });

    return (response.data || []).map((item) => ({
      accountId: item.accountId,
      displayName: item.displayName,
      email: item.emailAddress,
    }));
  } catch (error) {
    console.error(`Error finding Jira users:`, error.message);
    throw error;
  }
}

// test

// getIssue("DX-4393").then((res) => {
//   console.log(JSON.stringify(res, null, 2));
// });

