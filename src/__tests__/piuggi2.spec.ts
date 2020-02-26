/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
import Task from "../Task"

// Contentful mock

const ENTRY = {
  isPublished(): boolean {
    return true
  },

  unpublish() {
    return Task.empty()
  },

  delete() {
    return Task.empty()
  }
}

const ENV = {
  getEntries(____options: any) {
    return Task.of({ items: [ENTRY] })
  },

  getAssets(____options: any) {
    return Task.of({ items: [ENTRY, ENTRY] })
  },

  getContentTypes(____options: any) {
    return Task.of({ items: [ENTRY, ENTRY, ENTRY] })
  }
}

function createClient(_options: any) {
  return {
    getSpace(__options: any) {
      return Task.of({
        getEnvironment(___options: any) {
          return Task.of(ENV)
        }
      })
    }
  }
}

// CLI mock
const ACCESS_TOKEN = "123"
const SPACE = "456"
const ENVIRONMENT = "789"
type ContentTypes = "getEntries" | "getAssets" | "getContentTypes"
const contentToQuery: ContentTypes[] = [
  "getEntries",
  "getAssets",
  "getContentTypes"
]

const unpublishAndDelete = (entry: typeof ENTRY) =>
  entry.isPublished() ? entry.unpublish() : entry.delete()

const queryContentType = (environment: typeof ENV) => (
  contentType: ContentTypes
) =>
  environment[contentType]({
    order: "sys.createdAt",
    limit: 1000
  })
    .map(response => response.items.map(unpublishAndDelete))
    .chain(Task.sequence)

describe("piugi script 2", () => {
  test("the test", () =>
    createClient({
      accessToken: ACCESS_TOKEN
    })
      .getSpace(SPACE)
      .chain(space => space.getEnvironment(ENVIRONMENT))
      .map(env => contentToQuery.map(queryContentType(env)))
      .chain(Task.sequence)

      // Make Jest happy
      .toPromise())
})
