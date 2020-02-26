/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
import {
  devices,
  DirectNavigationOptions,
  EmulateOptions,
  LaunchOptions,
  PageCloseOptions,
  ScreenshotOptions
} from "puppeteer"
import Task from "../Task"

const uniq = <T>(a: T[]): T[] => Array.from(new Set<T>(a))
const compact = <T>(a: Array<null | undefined | T>): T[] =>
  a.filter(link => !!link) as T[]

class Page {
  public emulate(__options: EmulateOptions) {
    return Task.empty()
  }

  public goto(_url: string, __options?: DirectNavigationOptions) {
    return Task.of(null)
  }

  public evaluate(_pageFunction: any, ..._args: any[]): Task<any, any[]> {
    return Task.of([])
  }

  public screenshot(__options?: ScreenshotOptions) {
    return Task.of("url")
  }

  public close(__options?: PageCloseOptions) {
    return Task.empty()
  }
}

class Browser {
  public newPage() {
    return Task.of(new Page())
  }

  public close() {
    return Task.empty()
  }
}

const launch = (_options?: LaunchOptions) => Task.of(new Browser())

const SITE_URL = `https://www.marriott.com`
const iPhone = devices["iPhone 8"]
const iPad = devices.iPad
const Android = devices["Pixel 2"]
const desktopSmall = {
  name: "Desktop Small",
  userAgent:
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/76.0.3809.100 Safari/537.36",
  viewport: {
    width: 1024,
    height: 768,
    deviceScaleFactor: 1,
    isMobile: false,
    hasTouch: false,
    isLandscape: true
  }
}
const desktopMedium = {
  name: "Desktop Medium",
  userAgent:
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/76.0.3809.100 Safari/537.36",
  viewport: {
    width: 1440,
    height: 900,
    deviceScaleFactor: 1,
    isMobile: false,
    hasTouch: false,
    isLandscape: true
  }
}

const headless = false
const ignoreHTTPSErrors = true
const executablePath =
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
const args = ["--enable-features=NetworkService"]
const fullPage = true
const omitBackground = false
const rootpath = `assets/screenshots`
const type = "png"
const devicesToScreenshot = [iPhone, iPad, Android, desktopSmall, desktopMedium]

const getLinkData = (elem: HTMLAnchorElement) => {
  const attrObj: any = {}

  elem.getAttributeNames().forEach((name: string) => {
    attrObj[name] = elem.getAttribute(name)
  })

  attrObj.text = elem.innerHTML

  return attrObj
}

const cleanLink = (link: any): string | null => {
  if (
    link.href !== "#" &&
    link.href !== "" &&
    link.href !== " " &&
    link.href !== undefined &&
    link.href !== "undefined"
  ) {
    if (link.href[0] === "/") {
      return `https://marriott.com${link.href}`
    }

    return link.href
  }

  return null
}

const iterateDevices = (browser: Browser, url: string) => (
  device: devices.Device
) => {
  const cleanURL = url.replace(/(^\w+:|^)\/\//, "").replace(/\//g, "-")
  const cleanDeviceName = device.name.replace(/ /g, "-")
  const path = `${rootpath}/${cleanURL}-${cleanDeviceName}.${type}`

  return browser.newPage().chain(page =>
    page
      .emulate(device)
      .chain(() => page.goto(url, { waitUntil: "networkidle2", timeout: 0 }))
      .chain(() => page.screenshot({ path, fullPage, type, omitBackground }))
      .chain(() => page.close())
  )
}

const execute = (browser: Browser, page: Page) =>
  // Setup viewport
  page
    .emulate(desktopMedium)

    // Visit URL
    .chain(() => page.goto(`${SITE_URL}/sitemap.mi`))

    // Evaluate the script
    .chain(() =>
      page.evaluate(() => Array.from(document.querySelectorAll("a")))
    )

    // Convert element to data
    .map(links => links.map(getLinkData))

    // Clean link and remove duplicates.
    .map(links => uniq(compact(links.map(cleanLink))))

    // Screenshot each link
    .map(links =>
      links.map(url =>
        // Launch a browser
        launch({
          headless,
          ignoreHTTPSErrors,
          executablePath,
          args
        })
          // Take screenshots in sequence
          .chain(browser2 =>
            Task.sequence(
              devicesToScreenshot.map(iterateDevices(browser2, url))
            ).tapChain(() => browser2.close())
          )
      )
    )

    // Run screenshotting serially
    .chain(Task.sequence)

    // Close out the session
    .tapChain(() => Task.sequence([page.close(), browser.close()]))

describe("piugi script", () => {
  test("the test", () =>
    // Launch a browser
    launch({ headless, executablePath, args })
      // Load a page
      .chain(browser => browser.newPage().chain(page => execute(browser, page)))

      // Make Jest happy
      .toPromise())
})
