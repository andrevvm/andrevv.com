const PROJECT_INDEX_FIELDS = `
  title
  slug
  roleCollection {
    items {
      title
    }
  }
  videosCollection {
    items {
      taskData
    }
  } 
`

const PROJECT_DETAIL_FIELDS = `
  description {
    json
  }
  typeCollection {
    items {
      title
    }
  }
`

async function fetchGraphQL(query: string, preview = false): Promise<any> {
  return fetch(
    `https://graphql.contentful.com/content/v1/spaces/${process.env.CONTENTFUL_SPACE_ID}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${
          preview
            ? process.env.CONTENTFUL_PREVIEW_ACCESS_TOKEN
            : process.env.CONTENTFUL_ACCESS_TOKEN
        }`,
      },
      body: JSON.stringify({ query }),
      next: { tags: ['projects'] },
    }
  ).then((response) => response.json())
}

function extractProject(fetchResponse: any): any {
  return fetchResponse?.data?.projectCollection?.items?.[0]
}

function extractProjectEntries(fetchResponse: any): any[] {
  return fetchResponse?.data?.projectCollection?.items
}

export async function getProjectBySlug(slug: string | null, isDraftMode: boolean): Promise<any> {
  const entry = await fetchGraphQL(
    `query {
      projectCollection(where: { slug: "${slug}" }, preview: ${
        isDraftMode ? 'true' : 'false'
      }, limit: 1) {
        items {
          ${PROJECT_INDEX_FIELDS}
          ${PROJECT_DETAIL_FIELDS}
        }
      }
    }`,
    isDraftMode
  )
  return extractProject(entry)
}

export async function getAllProjects(isDraftMode: boolean): Promise<any[]> {
  const entries = await fetchGraphQL(
    `query {
      projectCollection(limit: 50,where: { title_exists: true }, order: date_DESC, preview: ${
        isDraftMode ? 'true' : 'false'
      }) {
        items {
          ${PROJECT_INDEX_FIELDS}
        }
      }
    }`,
    isDraftMode
  )
  return extractProjectEntries(entries)
}
