import { describe, expect, it } from "vitest";
import axios from "axios";

describe("Telegram Bot", () => {
  it("should validate bot token by calling getMe", async () => {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    expect(token).toBeTruthy();
    const res = await axios.get(`https://api.telegram.org/bot${token}/getMe`);
    expect(res.data.ok).toBe(true);
    expect(res.data.result).toBeDefined();
    expect(res.data.result.is_bot).toBe(true);
  });
});
