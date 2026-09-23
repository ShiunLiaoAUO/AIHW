import { input } from "@inquirer/prompts";
import { searchCities } from "./lib/qdrant.js";
import { spinner } from "./utils/spinner.js";

try {
  while (true) {
    const query = (
      await input({ message: "請輸入想查詢的城市或特色問題：" })
    ).trim();

    if (query === "") continue;
    if (query.toLowerCase() === "exit") {
      console.log("再會~");
      break;
    }

    const spin = spinner("搜尋城市知識庫中...").start();
    const results = await searchCities(query, 3);
    spin.stop();

    for (const [i, r] of results.entries()) {
      console.log(`\n${i + 1}. 城市：${r.city}`);
      console.log(`   分數：${r.score.toFixed(3)}`);
      console.log(`   特色：${r.feature}`);
      console.log(`   描述：${r.description}`);
    }
    console.log();
  }
} catch (err) {
  if (err.name === "ExitPromptError") {
    console.log("\n再會~");
  } else {
    throw err;
  }
}