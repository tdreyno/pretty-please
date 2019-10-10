import mockAxios, { AxiosResponse } from "axios";
import { get, toJSON } from "../HTTP";
import { fromPromise, of, Task } from "../Task";

function slugify(..._args: any[]): string {
  return "slug";
}

// tslint:disable-next-line: no-empty-interface
interface Request {}

interface Context {
  error: (data: { statusCode: number; message: string }) => void;
  req: Request;
}

interface Slice {
  slice_type: string;
  items: Array<{ greenhouse_category: string; jobs: Job[] }>;
}

interface PageContent {
  body: Slice[];
}

interface Job {
  id: string;
  title: string;
  url: string;
  metadata: Array<{ name: string; value: string }>;
  category: string;
}

function expandJob(job: Job): Job {
  job.url = `${slugify(job.title, { lower: true })}-${job.id}}`;

  job.metadata.forEach(meta => {
    if (meta.name === `Discipline`) {
      job.category = meta.value;
    }
  });

  return job;
}

interface QueryResponse {
  results: any[];
}

const mergeJobsIntoContent = (pageContent: PageContent) => (jobs: Job[]) => {
  pageContent.body.forEach(slice => {
    if (slice.slice_type === "job_listing_categories") {
      slice.items.forEach(category => {
        jobs.forEach(job => {
          if (category.greenhouse_category === job.category) {
            if (category.jobs === undefined) {
              category.jobs = [];
            }
            category.jobs.push(job);
          }
        });
      });
    }
  });

  return pageContent;
};

interface PrismicAPI {
  query: (query: any, _options: any) => Promise<QueryResponse>;
}

const Prismic = {
  apiEndpoint: "/somewhere",
  getApi: (_endpoint: string, _options: any): Promise<PrismicAPI> =>
    Promise.resolve({
      query: () =>
        Promise.resolve({
          results: [{ data: { body: [] } }]
        })
    } as PrismicAPI),
  Predicates: {
    at: (_a: string, _b: string): any => void 0
  }
};

function prismicAPI(request: Request): Task<never, PrismicAPI> {
  return fromPromise(Prismic.getApi(Prismic.apiEndpoint, { req: request }));
}

function query(
  where: any,
  options: any
): (api: PrismicAPI) => Task<never, QueryResponse> {
  return (api: PrismicAPI) => fromPromise(api.query(where, options));
}

export function loadData(req: Request): Task<Error, PageContent> {
  const jobsTask = get(`https://api.greenhouse.io/v1/boards/instrument/jobs`)
    .andThen(toJSON)
    .map((json: any) => json.data.jobs as Job[])
    .map(jobs => jobs.map(expandJob));

  const pageContentTask = prismicAPI(req)
    .andThen(
      query(Prismic.Predicates.at("document.type", "careers_page"), {
        graphQuery: `{
            careers_page {
              ...careers_pageFields
            }
          }`
      })
    )
    .map(response => response.results[0].data as PageContent);

  return of(mergeJobsIntoContent)
    .ap(pageContentTask)
    .ap(jobsTask);
}

function asyncData({ error, req }: Context): Promise<PageContent> {
  return loadData(req)
    .mapError(e => error({ statusCode: 500, message: e.toString() }))
    .toPromise();
}

describe("Instrument.com", () => {
  test("loadData", async () => {
    (mockAxios.get as any).mockImplementation(async () => {
      return {
        data: JSON.stringify({
          data: {
            jobs: []
          }
        }),
        config: {
          responseType: "text"
        }
      } as AxiosResponse<string>;
    });

    const onError = jest.fn();

    const result = await asyncData({ error: onError, req: {} });

    expect(result).toBeTruthy();
  });
});
