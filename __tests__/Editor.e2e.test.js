import puppeteer from "puppeteer"
import { t } from "../src/utils/languages"

const sleep = (milliseconds) =>
  new Promise((resolve) => setTimeout(resolve, milliseconds))

describe("Editor End-To-End", () => {
  let browser
  let page

  beforeAll(async () => {
    browser = await puppeteer.launch({ headless: "new" })
    page = await browser.newPage()
    page.setUserAgent("test-agent")
    page.evaluateOnNewDocument(() => {
      Object.defineProperty(navigator, "language", {
        get: function () {
          return "en-US"
        },
      })
    })
    try {
      await page.goto("http://localhost:3000")
    } catch (err) {
      throw Error("Please run 'npm run start' first.")
    }
  })

  test("Checking if the Code Editor is mounted and working", async () => {
    await page.waitForSelector(".ace_search")

    await sleep(500)

    const bodyContent = await page.$eval(
      ".ace_search_field",
      (el) => el.placeholder
    )

    await sleep(200)

    expect(bodyContent).toContain(t("SEARCH_FOR"))
  })

  afterAll(() => browser.close())
})
