export function tabularJson(obj) {
  // 检查数组是否可以转换为二维表结构
  function canConvertToTable(arr) {
    if (!Array.isArray(arr) || arr.length < 2) return false;

    // 检查前两项是否都是对象且字段完全一致
    const first = arr[0];
    const second = arr[1];

    if (
      !first ||
      !second ||
      typeof first !== "object" ||
      typeof second !== "object"
    ) {
      return false;
    }

    const firstKeys = Object.keys(first).sort();
    const secondKeys = Object.keys(second).sort();

    return JSON.stringify(firstKeys) === JSON.stringify(secondKeys);
  }

  // 将对象数组转换为二维表结构
  function convertToTable(arr) {
    if (!canConvertToTable(arr)) return arr;

    const headers = Object.keys(arr[0]);
    const rows = arr.map((item) => headers.map((key) => item[key]));

    return { headers, rows };
  }

  // 递归处理对象
  function processObject(data) {
    if (Array.isArray(data)) {
      return convertToTable(data);
    } else if (data && typeof data === "object") {
      const result = {};
      for (const [key, value] of Object.entries(data)) {
        result[key] = processObject(value);
      }
      return result;
    }
    return data;
  }

  // 检查key是否需要引号
  function needsQuotes(key) {
    // 如果key包含空格、特殊字符或不是有效的标识符，则需要引号
    return !/^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(key);
  }

  // 转换为JS字面量格式（紧凑形式）
  function toJSLiteral(value) {
    if (value === null) return "null";
    if (value === undefined) return "undefined";
    if (typeof value === "string") {
      const escaped = value
        .replace(/\\/g, '\\\\')     // 反斜杠
        .replace(/"/g, '\\"')       // 双引号
        .replace(/\n/g, '\\n')      // 换行符
        .replace(/\r/g, '\\r')      // 回车符
        .replace(/\t/g, '\\t')      // 制表符
        .replace(/\u0008/g, '\\b')  // 退格符 (实际的退格字符)
        .replace(/\f/g, '\\f')      // 换页符
        .replace(/\v/g, '\\v')      // 垂直制表符
        .replace(/\u0000/g, '\\0'); // 空字符
      return `"${escaped}"`;
    }
    if (typeof value === "number" || typeof value === "boolean")
      return String(value);

    if (Array.isArray(value)) {
      if (value.length === 0) return "[]";
      const items = value.map((item) => toJSLiteral(item));
      return `[${items.join(",")}]`;
    }

    if (typeof value === "object") {
      const entries = Object.entries(value);
      if (entries.length === 0) return "{}";

      const items = entries.map(([key, val]) => {
        const keyStr = needsQuotes(key) ? `"${key}"` : key;
        return `${keyStr}:${toJSLiteral(val)}`;
      });

      return `{${items.join(",")}}`;
    }

    return String(value);
  }

  const processed = processObject(obj);
  return toJSLiteral(processed);
}

