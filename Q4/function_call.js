import { input } from "@inquirer/prompts";
import { client, DEFAULT_MODEL } from "./lib/openai.js";
import { spinner } from "./utils/spinner.js";
import { toOpenAITool } from "./utils/func-tool.js";
import * as allTools from "./tools/index.js";

const toolList = Object.values(allTools);
const tools = toolList.map(toOpenAITool);
const TOOLS_BY_NAME = Object.fromEntries(toolList.map((tool) => [tool.name, tool]));
const MAX_TOOL_ROUNDS = 8;

async function main() {
  console.log("=== AI 智慧助理（支援時間與天氣查詢）已啟動 ===");
  console.log("提示：輸入問題後按 Enter，輸入 exit 可離開。\n");

  while (true) {
    const userQuery = (
      await input({ message: "請輸入您的問題：" })
    ).trim();

    if (userQuery === "") continue;
    if (userQuery.toLowerCase() === "exit") {
      console.log("再會~");
      break;
    }

    // 每次對話初始化 history，包含系統指令與使用者的提問
    const history = [
      {
        role: "system",
        content: "你是一個專業且貼心的AI助理。你擁有查詢「現在時間」與「天氣狀況」的工具。當使用者詢問時間或天氣（或兩者皆有）時，請務必主動呼叫對應的工具來取得真實數據，並將結果親切地整合後回答使用者。",
      },
      {
        role: "user",
        content: userQuery,
      },
    ];

    let completed = false;

    for (let round = 1; round <= MAX_TOOL_ROUNDS; round += 1) {
      const spin = spinner("思考中...").start();

      const response = await client.responses.create({
        model: DEFAULT_MODEL,
        input: history,
        tools,
        tool_choice: "auto",
      });

      spin.stop();

      history.push(...response.output);

      const functionCalls = response.output.filter(
        (item) => item.type === "function_call",
      );

      if (functionCalls.length === 0) {
        console.log(`\nAI 回覆：${response.output_text}\n`);
        completed = true;
        break;
      }

      for (const functionCall of functionCalls) {
        const fnName = functionCall.name;
        const tool = TOOLS_BY_NAME[fnName];
        if (!tool) {
          throw new Error(`模型要求了未註冊的工具：${fnName}`);
        }

        const args = tool.parameters.parse(JSON.parse(functionCall.arguments));
        console.log(`\n[系統自動呼叫工具] ${fnName}(${JSON.stringify(args)})`);

        const result = await tool.fn(args);

        history.push({
          type: "function_call_output",
          call_id: functionCall.call_id,
          output: JSON.stringify(result),
        });
      }
    }

    if (!completed) {
      console.error(`Tool calling 超過 ${MAX_TOOL_ROUNDS} 輪，已停止執行`);
    }
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});