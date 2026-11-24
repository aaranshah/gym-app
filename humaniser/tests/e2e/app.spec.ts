import { expect, test, type Page } from "@playwright/test";

const SAMPLE = `It is important to note that remote work has transformed the workplace in a myriad of ways. Furthermore, studies suggest that employees who work from home may be up to 13% more productive (Bloom et al., 2015). Moreover, companies can utilize the savings in order to invest in technology.

However, remote work is not without its challenges. Many workers report feelings of isolation.`;

async function humanise(page: Page, text = SAMPLE) {
  await page.getByTestId("input-text").fill(text);
  await page.getByTestId("humanise-button").click();
  await expect(page.getByTestId("output-text")).toBeVisible();
}

const consoleErrors: string[] = [];
test.beforeEach(async ({ page }) => {
  consoleErrors.length = 0;
  page.on("console", (m) => m.type() === "error" && !m.text().includes("status of 4") && !m.text().includes("status of 5") && consoleErrors.push(m.text()));
  page.on("pageerror", (e) => consoleErrors.push(e.message));
  await page.goto("/");
});
test.afterEach(() => {
  // No CSP violations or runtime errors in any flow.
  expect(consoleErrors).toEqual([]);
});

test("empty state and input validation", async ({ page }) => {
  await expect(page.getByText("Your rewrite will appear here.")).toBeVisible();
  const btn = page.getByTestId("humanise-button");
  await expect(btn).toBeDisabled();
  await page.getByTestId("input-text").fill("Too short");
  await expect(btn).toBeDisabled();
  await expect(page.getByTestId("input-counts")).toContainText("Add a little more text");
  await page.getByTestId("input-text").fill("x".repeat(20_050));
  await expect(btn).toBeDisabled();
  await expect(page.getByTestId("input-counts")).toContainText("Too long");
  await page.getByTestId("input-text").fill(SAMPLE);
  await expect(btn).toBeEnabled();
  await expect(page.getByTestId("input-counts")).toContainText("words");
});

test("humanise: streaming, stages, result, counts and meaning report", async ({ page }) => {
  await page.getByTestId("input-text").fill(SAMPLE);
  await page.getByTestId("humanise-button").click();
  // Loading state: button busy and disabled (prevents duplicate submission), stages visible.
  await expect(page.getByTestId("humanise-button")).toBeDisabled();
  await expect(page.getByTestId("stage-indicator")).toBeVisible();
  await expect(page.getByTestId("output-text")).toBeVisible();
  const out = await page.getByTestId("output-text").innerText();
  expect(out).not.toContain("It is important to note");
  expect(out).toContain("13%");
  expect(out).toContain("(Bloom et al., 2015)");
  await expect(page.getByTestId("output-counts")).toContainText("words");
  await expect(page.getByTestId("fidelity-badge")).toContainText("key points kept");
  await page.getByTestId("fidelity-badge").click();
  const sheet = page.getByTestId("report-sheet");
  await expect(sheet).toBeVisible();
  await expect(sheet).toContainText("Key points");
  await expect(sheet).toContainText("Automated checks");
  await expect(sheet).toContainText("not an “AI detection” score");
  await page.getByLabel("Close report").click();
  await expect(sheet).toBeHidden();
});

test("keyboard: Ctrl+Enter submits from the editor", async ({ page }) => {
  await page.getByTestId("input-text").fill(SAMPLE);
  await page.getByTestId("input-text").press("Control+Enter");
  await expect(page.getByTestId("output-text")).toBeVisible();
});

test("settings are sent with the request and persist across reloads", async ({ page }) => {
  await page.getByRole("radio", { name: "Deep" }).click();
  await page.getByLabel("Tone").selectOption("academic");
  await page.getByTestId("options-button").click();
  await page.getByLabel("Spelling").selectOption("british");
  await page.getByLabel("Length").selectOption("target");
  await page.getByLabel("Target word count").fill("120");
  await page.getByPlaceholder("e.g. Customer Success Programme").fill("Bloom et al.");
  await page.getByRole("button", { name: "Add", exact: true }).click();
  await expect(page.getByLabel("Protected phrases")).toContainText("Bloom et al.");
  await page.getByRole("button", { name: "Improve the flow" }).click();
  await page.keyboard.press("Escape");
  await expect(page.getByTestId("options-button")).toContainText("4");

  const reqPromise = page.waitForRequest("/api/humanise");
  await page.getByTestId("input-text").fill(SAMPLE);
  await page.getByTestId("humanise-button").click();
  const body = (await reqPromise).postDataJSON();
  expect(body.settings).toMatchObject({
    intensity: "deep",
    tone: "academic",
    englishVariant: "british",
    lengthMode: "target",
    targetWords: 120,
    protectedPhrases: ["Bloom et al."],
  });
  expect(body.settings.customInstructions).toContain("Improve the flow");

  await page.reload();
  await expect(page.getByRole("radio", { name: "Deep" })).toHaveAttribute("aria-checked", "true");
  await expect(page.getByLabel("Tone")).toHaveValue("academic");
});

test("alternatives, versions, undo/redo and humanise again", async ({ page }) => {
  await humanise(page);
  const nav = page.getByTestId("version-nav");
  await expect(nav).toContainText("1 / 1");
  const first = await page.getByTestId("output-text").innerText();

  const altReq = page.waitForRequest("/api/humanise");
  await page.getByTestId("alternative-button").click();
  const body = (await altReq).postDataJSON();
  expect(body.previousVersions).toEqual([first]); // alternative must differ from what was seen
  await expect(nav).toContainText("2 / 2");
  const second = await page.getByTestId("output-text").innerText();
  expect(second).not.toEqual(first);

  await page.getByTestId("version-prev").click();
  await expect(nav).toContainText("1 / 2");
  expect(await page.getByTestId("output-text").innerText()).toEqual(first);
  await page.getByTestId("version-next").click();
  await expect(nav).toContainText("2 / 2");

  const againReq = page.waitForRequest("/api/humanise");
  await page.getByTestId("again-button").click();
  expect((await againReq).postDataJSON().text).toEqual(second);
  await expect(nav).toContainText("3 / 3");
  await expect(nav).toContainText("Humanised again");
});

test("changes view highlights insertions and deletions", async ({ page }) => {
  await humanise(page);
  await page.getByRole("radio", { name: "Changes" }).click();
  const diff = page.getByTestId("diff-view");
  await expect(diff).toBeVisible();
  await expect(diff.locator("del").first()).toBeVisible();
  await expect(diff.locator("ins").first()).toBeVisible();
  await expect(diff.locator("del", { hasText: "It is important to note that" })).toHaveCount(1);
});

test("sentence-level rewrite replaces one sentence and can be undone", async ({ page }) => {
  await humanise(page);
  const before = await page.getByTestId("output-text").innerText();
  await page.locator(".sentence").nth(1).click();
  await expect(page.getByTestId("sentence-editor")).toBeVisible();
  await page.getByLabel("Instruction for this sentence").fill("make it punchier");
  const req = page.waitForRequest("/api/sentence");
  await page.getByTestId("sentence-generate").click();
  const body = (await req).postDataJSON();
  expect(body.instruction).toBe("make it punchier");
  expect(body.sourceText).toBe(SAMPLE);
  const options = page.getByTestId("sentence-options").locator("button");
  await expect(options).toHaveCount(3);
  await options.first().click();
  await expect(page.getByTestId("toast")).toContainText("Sentence replaced");
  await expect(page.getByTestId("version-nav")).toContainText("2 / 2");
  await expect(page.getByTestId("version-nav")).toContainText("Sentence edit");
  await expect(page.getByTestId("fidelity-badge")).toContainText("Edited");
  await page.getByTestId("version-prev").click();
  expect(await page.getByTestId("output-text").innerText()).toEqual(before);
});

test("copy button copies the output", async ({ page, context }) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await humanise(page);
  await page.getByTestId("copy-button").click();
  await expect(page.getByTestId("toast")).toContainText("Copied");
  const clip = await page.evaluate(() => navigator.clipboard.readText());
  expect(clip).toEqual(await page.getByTestId("output-text").innerText());
});

test("clear input and clear output", async ({ page }) => {
  await humanise(page);
  await page.getByTestId("clear-output").click();
  await expect(page.getByText("Your rewrite will appear here.")).toBeVisible();
  await page.getByTestId("clear-input").click();
  await expect(page.getByTestId("input-text")).toHaveValue("");
});

test("provider error shows a clear message and retry works", async ({ page }) => {
  await page.getByTestId("input-text").fill("This text triggers a simulated provider failure [[mock-error]].");
  await page.getByTestId("humanise-button").click();
  await expect(page.getByTestId("error-message")).toContainText("temporarily unavailable");
  await expect(page.getByTestId("humanise-button")).toBeEnabled();
  await page.getByTestId("input-text").fill(SAMPLE);
  await page.getByRole("button", { name: "Try again" }).click();
  await expect(page.getByTestId("output-text")).toBeVisible();
  await expect(page.getByTestId("error-message")).toBeHidden();
});

test("cancel stops an in-flight request", async ({ page }) => {
  await page.getByTestId("input-text").fill(SAMPLE.repeat(4));
  await page.getByTestId("humanise-button").click();
  await page.getByTestId("cancel-button").click();
  await expect(page.getByTestId("toast")).toContainText("Cancelled");
  await expect(page.getByTestId("humanise-button")).toBeEnabled();
});

test("file import: text files load, unsupported files are rejected", async ({ page }) => {
  await page.getByTestId("file-input").setInputFiles({ name: "essay.txt", mimeType: "text/plain", buffer: Buffer.from("Imported paragraph one.\r\n\r\n\r\nImported paragraph two.") });
  await expect(page.getByTestId("input-text")).toHaveValue("Imported paragraph one.\n\nImported paragraph two.");
  await expect(page.getByTestId("toast")).toContainText("Imported essay.txt");
  await page.getByTestId("file-input").setInputFiles("tests/e2e/fixtures/sample.docx");
  await expect(page.getByTestId("input-text")).toHaveValue("Word paragraph one about quarterly results.\n\nWord paragraph two with 42% growth.");
  await page.getByTestId("file-input").setInputFiles({ name: "photo.png", mimeType: "image/png", buffer: Buffer.from([137, 80, 78, 71]) });
  await expect(page.getByTestId("toast")).toContainText("Unsupported file type");
});

test("history drawer restores an earlier session entry", async ({ page }) => {
  await humanise(page);
  await humanise(page, "A completely different second text that needs some rewriting in order to read better.");
  await page.getByTestId("history-button").click();
  const drawer = page.getByTestId("history-drawer");
  await expect(drawer.getByRole("button")).toHaveCount(3); // close + 2 entries
  await drawer.getByRole("button", { name: /Remote work/ }).click();
  await expect(drawer).toBeHidden();
  await expect(page.getByTestId("input-text")).toHaveValue(SAMPLE);
});

test("theme toggle switches light/dark and persists", async ({ page }) => {
  const toggle = page.getByTestId("theme-toggle");
  await toggle.click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await toggle.click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  const bg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
  expect(bg).toBe("rgb(18, 18, 17)");
});

test("keyboard accessibility: controls are reachable and operable", async ({ page }) => {
  await page.getByTestId("input-text").fill(SAMPLE);
  // Intensity radiogroup supports arrow keys.
  await page.getByRole("radio", { name: "Balanced" }).focus();
  await page.keyboard.press("ArrowRight");
  await expect(page.getByRole("radio", { name: "Deep" })).toHaveAttribute("aria-checked", "true");
  await expect(page.getByRole("radio", { name: "Deep" })).toBeFocused();
  // Humanise reachable by Tab from the editor and operable with Enter.
  await page.getByTestId("input-text").focus();
  let reached = false;
  for (let i = 0; i < 6 && !reached; i++) {
    await page.keyboard.press("Tab");
    reached = await page.getByTestId("humanise-button").evaluate((el) => el === document.activeElement);
  }
  expect(reached).toBe(true);
  await page.keyboard.press("Enter");
  await expect(page.getByTestId("output-text")).toBeVisible();
  // Sentences are focusable and open the editor with Enter; Escape closes it.
  await page.locator(".sentence").first().focus();
  await page.keyboard.press("Enter");
  await expect(page.getByTestId("sentence-editor")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByTestId("sentence-editor")).toBeHidden();
});

test("security headers are set", async ({ request }) => {
  const r = await request.get("/");
  expect(r.headers()["content-security-policy"]).toContain("frame-ancestors 'none'");
  expect(r.headers()["x-frame-options"]).toBe("DENY");
  expect(r.headers()["x-powered-by"]).toBeUndefined();
});

test("demo engine is always visibly labelled", async ({ page }) => {
  await expect(page.getByTestId("demo-badge")).toBeVisible();
});

test("API rejects bad input and oversize bodies", async ({ request }) => {
  const r1 = await request.post("/api/humanise", { data: { text: "" } });
  expect(r1.status()).toBe(400);
  const r2 = await request.post("/api/humanise", { data: { text: "Valid enough text here.", settings: { tone: "pirate" } } });
  expect(r2.status()).toBe(400);
  const r3 = await request.post("/api/humanise", { data: { text: "y".repeat(250_000) } });
  expect(r3.status()).toBe(413);
  const r4 = await request.post("/api/sentence", { data: { sentence: "" } });
  expect(r4.status()).toBe(400);
});

test("unconfigured server shows setup guidance and refuses to pretend", async ({ page, request }) => {
  await page.goto("http://localhost:3201/");
  await expect(page.getByTestId("not-configured")).toContainText("ANTHROPIC_API_KEY");
  await page.getByTestId("input-text").fill(SAMPLE);
  await expect(page.getByTestId("humanise-button")).toBeDisabled();
  await expect(page.getByTestId("demo-badge")).toHaveCount(0);
  const r = await request.post("http://localhost:3201/api/humanise", { data: { text: SAMPLE } });
  expect(r.status()).toBe(503);
  expect((await r.json()).error.code).toBe("not_configured");
});
