import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { server } from "./mcp.mjs";

// 解析命令行参数，支持 --KEY=value 格式
process.argv.slice(2).forEach((arg) => {
  const match = arg.match(/^--(\w+)=(.+)$/);
  if (match) {
    process.env[match[1]] = match[2];
  }
});

// 启动服务器
const transport = new StdioServerTransport();
await server.connect(transport);

