// tslint:disable: no-console no-var-requires
import {
  Browser,
  devices,
  DirectNavigationOptions,
  EmulateOptions,
  launch as realLaunch,
  LaunchOptions,
  Page,
  PageCloseOptions,
  ScreenshotOptions
} from "puppeteer";
import Task from "../Task";

// Puppeteer mock
const launch: typeof realLaunch = async (
  _options?: LaunchOptions
): Promise<Browser> => {
  return ({
    async newPage(): Promise<Page> {
      return ({
        async emulate(__options: EmulateOptions): Promise<void> {
          return void 0;
        },

        async goto(
          _url: string,
          __options?: DirectNavigationOptions
        ): Promise<Response | null> {
          return null;
        },

        async evaluate(_pageFunction: any, ..._args: any[]): Promise<any> {
          return [];
        },

        async screenshot(
          __options?: ScreenshotOptions
        ): Promise<string | Buffer> {
          return "url";
        },

        async close(__options?: PageCloseOptions): Promise<void> {
          return void 0;
        }
      } as any) as Page;
    },

    async close(): Promise<void> {
      return void 0;
    }
  } as any) as Browser;
};

const SITE_URL = `https://www.marriott.com`;
const iPhone = devices["iPhone 8"];
const iPad = devices.iPad;
const Android = devices["Pixel 2"];
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
};
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
};

const headless = false;
const ignoreHTTPSErrors = true;
const executablePath =
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const args = ["--enable-features=NetworkService"];
const fullPage = true;
const omitBackground = false;
const rootpath = `assets/screenshots`;
const type = "png";
const devicesToScreenshot = [
  iPhone,
  iPad,
  Android,
  desktopSmall,
  desktopMedium
];

const getLinkData = (elem: HTMLAnchorElement) => {
  const attrObj: any = {};

  elem.getAttributeNames().forEach((name: string) => {
    attrObj[name] = elem.getAttribute(name);
  });

  attrObj.text = elem.innerHTML;

  return attrObj;
};

const cleanLink = (link: any) => {
  if (
    link.href !== "#" &&
    link.href !== "" &&
    link.href !== " " &&
    link.href !== undefined &&
    link.href !== "undefined"
  ) {
    if (link.href[0] === "/") {
      return `https://marriott.com${link.href}`;
    }

    return link.href;
  }

  return null;
};

const cleanLinks = (links: any[]) =>
  Array.from(new Set(links.map(cleanLink).filter(link => link)));

const iterateDevices = (browser: Browser, url: string) => (
  device: devices.Device
) => {
  const cleanURL = url.replace(/(^\w+:|^)\/\//, "").replace(/\//g, "-");
  const cleanDeviceName = device.name.replace(/ /g, "-");
  const path = `${rootpath}/${cleanURL}-${cleanDeviceName}.${type}`;

  return Task.fromLazyPromise(() => browser.newPage()).chain(page =>
    Task.fromLazyPromise(() => page.emulate(device))
      .chain(() => page.goto(url, { waitUntil: "networkidle2", timeout: 0 }))
      .chain(() => page.screenshot({ path, fullPage, type, omitBackground }))
      .chain(() => page.close())
  );
};

const executeScreenshots = (url: string) =>
  // Launch a browser
  Task.fromLazyPromise(() =>
    launch({
      headless,
      ignoreHTTPSErrors,
      executablePath,
      args
    })
  )

    // Take screenshots in sequence
    .chain(browser =>
      Task.sequence(devicesToScreenshot.map(iterateDevices(browser, url))) // Close browser
        .chain(() => browser.close())
    );

const setupEnvironment = (page: Page, url: string) =>
  // Setup viewport
  Task.fromLazyPromise(() => page.emulate(desktopMedium))

    // Visit URL
    .chain(() => page.goto(url));

const evaluateScript = (page: Page) => () =>
  page.evaluate(() =>
    Array.from(document.querySelectorAll("a")).map(getLinkData)
  );

const closeSession = (browser: Browser, page: Page) =>
  Task.fromLazyPromise(() => page.close()).chain(() => browser.close());

const execute = ({ browser, page }: { browser: Browser; page: Page }) =>
  // Setup the environment
  setupEnvironment(page, `${SITE_URL}/sitemap.mi`)
    // Evaluate the script
    .chain(evaluateScript(page))

    // Close out the session
    .chain(selectors => closeSession(browser, page).forward(selectors))

    // Clean link and remove duplicates
    .map(cleanLinks)

    // Screenshot each link
    .map(links => links.map(executeScreenshots))

    // Run screenshotting serially
    .chain(Task.sequence);

describe("piugi script", () => {
  test("the test", () =>
    // Launch a browser
    Task.fromLazyPromise(() => launch({ headless, executablePath, args }))

      // Load a page
      .chain(browser => browser.newPage().then(page => ({ browser, page })))

      // Hold on to browser/page vars
      .chain(execute)

      // Make Jest happy
      .toPromise());
});
