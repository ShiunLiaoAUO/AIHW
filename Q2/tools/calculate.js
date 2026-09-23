import { z } from "zod";
import { defineTool } from "../utils/func-tool.js";

function calculate({ expression }) {
  try {
    // 根據作業指引，此處可以使用 eval() 來進行簡單的數學運算
    const result = eval(expression);
    return String(result);
  } catch (error) {
    return "計算錯誤，請確認傳入的數學運算式是否正確。";
  }
}

export const calculateTool = defineTool({
  name: "calculate",
  description: "當遇到任何數學計算、加減乘除或數字運算需求時，必須使用此工具來確保計算結果絕對正確，不可自行心算。",
  fn: calculate,
  parameters: z.object({
    expression: z.string().describe("要計算的數學運算式，例如 '10 + 5 * 2'"),
  }),
});