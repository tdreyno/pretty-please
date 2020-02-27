/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
import { Task } from "../Task/Task"

const slugify = (..._args: any[]) => "slug"

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface Request {}

interface Context {
  error: (data: { statusCode: number; message: string }) => void
  req: Request
}

interface Slice {
  slice_type: string
  items: Array<{ greenhouse_category: string; jobs: Job[] }>
}

interface PageContent {
  body: Slice[]
}

interface Job {
  id: string
  title: string
  url: string
  metadata: Array<{ name: string; value: string }>
  category: string
}

const toJob = (job: any): job is Job => {
  if (!job.title || !job.id || !job.metadata || !Array.isArray(job.metadata)) {
    throw new Error("Invalid data")
  }

  job.url = `${slugify(job.title, { lower: true })}-${job.id}}`

  job.metadata.forEach((meta: any) => {
    if (!meta.name) {
      throw new Error("Invalid data")
    }

    if (meta.name === `Discipline`) {
      job.category = meta.value
    }
  })

  return job
}

const jsonToJobs = (json: any): Job[] => {
  if (!json.data || !Array.isArray(json.data.jobs)) {
    throw new Error("Invalid data")
  }

  return json.data.jobs.map(toJob)
}

interface QueryResponse {
  results: any[]
}

const mergeJobsIntoContent = (pageContent: PageContent, jobs: Job[]) => {
  pageContent.body.forEach(slice => {
    if (slice.slice_type === "job_listing_categories") {
      slice.items.forEach(category => {
        jobs.forEach(job => {
          if (category.greenhouse_category === job.category) {
            if (category.jobs === undefined) {
              category.jobs = []
            }
            category.jobs.push(job)
          }
        })
      })
    }
  })

  return pageContent
}

interface PrismicAPI {
  query: (query: any, _options: any) => Promise<QueryResponse>
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
}

const prismicAPI = (request: Request) =>
  Task.fromLazyPromise(() =>
    Prismic.getApi(Prismic.apiEndpoint, { req: request })
  )

const query = (where: any, options: any) => (api: PrismicAPI) =>
  Task.fromLazyPromise(() => api.query(where, options))

const responseToPageContent = (response: QueryResponse): PageContent =>
  response.results[0].data

const fetch = (_url: string) =>
  Promise.resolve(
    JSON.stringify({
      data: {
        jobs: []
      }
    })
  )

export const loadData = (req: Request) =>
  Task.zipWith(
    mergeJobsIntoContent,

    prismicAPI(req)
      .chain(
        query(Prismic.Predicates.at("document.type", "careers_page"), {
          graphQuery: `{
            careers_page {
              ...careers_pageFields
            }
          }`
        })
      )
      .map(responseToPageContent),

    Task.fromLazyPromise(() =>
      fetch(`https://api.greenhouse.io/v1/boards/instrument/jobs`)
    )
      .map(JSON.parse)
      .map(jsonToJobs)
  )

const asyncData = ({ error, req }: Context) =>
  loadData(req)
    .mapError(e => error({ statusCode: 500, message: e.toString() }))
    .toPromise()

describe("Instrument.com", () => {
  test("loadData", async () => {
    const onError = jest.fn()

    const result = await asyncData({ error: onError, req: {} })

    expect(result).toBeTruthy()
  })
})
