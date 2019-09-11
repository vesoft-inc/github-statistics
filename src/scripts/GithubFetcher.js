import {  } from 'graphql'
import { GraphQLClient } from 'graphql-request'

const getProgress = (c, t) => t === 0 ? 100 : Math.floor(c / t * 100)

class GithubFetcher {

  constructor(token) {
    const endpoint = 'https://api.github.com/graphql'

    this.gqlClient = new GraphQLClient(
      endpoint,
      {
        headers: {
          Authorization: 'bearer ' + token,
        }
      }
    )

    // configurations
    this.liveUpdate = false
    this.pagesPerUpdate = 20
  }

  /**
   * test if the repository exists
   * @param owner owner of the repository
   * @param name of the repository
   * @param onResult (@param result) function that will be called when test finishes
   * @return false if not exist, true otherwise
   */
  testRepository = async (owner, name, onResult) => {
    const variables = {
      owner: owner,
      name: name,
    }

    const query = /* GraphQL */ `
      query getRepository($owner: String!, $name: String!){
        repository(owner: $owner, name: $name) {
          id
        }
      }
    `

    try {
      await this.gqlClient.request(query, variables)
    } catch (error) {
      if (onResult) {
        onResult(false)
      }
      return false
    }

    if (onResult) {
      onResult(true)
    }
    return true
  }

  /**
   * fetch repository low-level data
   * @param owner owner of the repository
   * @param name name of the repository
   * @param onUpdate (data) function that will be called when a new data update is avaiable
   * @param onFinish (stats) function that will be called when fetching is finished
   * @param onProgress (progress) function that will be called when progress is updated
   * @param shouldAbort function that returns a boolean which determines whether fetching should abort
   * @returns Object that contains statistics
   */
  fetchRepositoryData = async (owner, name, onUpdate, onFinish, onProgress, shouldAbort) => {
    const variables = {
      owner: owner,
      name: name,
    }

    // define the graphql query
    const query = /* GraphQL */ `
      query getRepository($owner: String!, $name: String!){
        repository(owner: $owner, name: $name) {
          nameWithOwner
          createdAt
          primaryLanguage {
            name
          }
          pushedAt
          watchers(first: 0) {
            totalCount
          }
        }
      }
    `

    // update progress tracking
    if (onProgress) {
      onProgress(10)
    }

    const data = await this.gqlClient.request(query, variables)
    // if (shouldAbort) {
    //   if (shouldAbort()) {
    //     return
    //   }
    // }

    const formattedData = {
      name: data.repository.nameWithOwner,
      createdAt: data.repository.createdAt,
      primaryLanguage: data.repository.primaryLanguage.name,
      pushedAt: data.repository.pushedAt,
      watcherCount: data.repository.watchers.totalCount,
    }

    // update progress tracking
    if (onProgress) {
      onProgress(100)
    }

    if (onFinish) {
      onFinish(formattedData)
    }

    return formattedData
  }

  /**
   * fetch repository low-level data
   * @param owner owner of the repository
   * @param name name of the repository
   * @param onUpdate (data) function that will be called when a new data update is avaiable
   * @param onFinish (stats) function that will be called when fetching is finished
   * @param onProgress (progress) function that will be called when progress is updated
   * @param shouldAbort function that returns a boolean which determines whether fetching should abort
   * @returns Object that contains statistics
   */
  fetchStargazerData = async (owner, name, onUpdate, onFinish, onProgress, shouldAbort) => {
    const preparationVariables = {
      owner: owner,
      name: name,
    }

    // define the graphql query
    const preparationQuery = /* GraphQL */ `
      query prepareStargazers($owner: String!, $name: String!){
        repository(owner: $owner, name: $name) {
          createdAt
          stargazers(first: 0) {
            totalCount
          }
        }
      }
    `
    const query = /* GraphQL */ `
      query getStargazers($owner: String!, $name: String!, $previousEndCursor: String){
        repository(owner: $owner, name: $name) {
          stargazers(first: 100, after: $previousEndCursor) {
            pageInfo {
              endCursor
              startCursor
            }
            edges {
              starredAt
            }
          }
        }
      }
    `

    // local variables
    const formattedData = new Map()
    let pageIndex = 0
    let totalToFetch = 0
    let numberFetched = 0
    let previousEndCursor = null
    const addNumberFetched = () => numberFetched += 1

    // Preparation query
    const preparationData = await this.gqlClient.request(preparationQuery, preparationVariables)

    // Statistics variables
    totalToFetch = preparationData.repository.stargazers.totalCount
    const createdAt = preparationData.repository.createdAt
    let maxIncrement = 0

    const handleEdge = edge => {
      const date = new Date(edge.starredAt.slice(0,10)).getTime() // ISO-8601 encoded UTC date string
      if (!formattedData.has(date)) {
        formattedData.set(date, 1)
      } else {
        formattedData.set(date, formattedData.get(date) + 1)
      }
      if (formattedData.get(date) > maxIncrement) maxIncrement = formattedData.get(date)
      // update progress tracking
      addNumberFetched()
    }

    // data traversal, 100 edges/request
    do {
      if (shouldAbort) {
        if (shouldAbort()) {
          return
        }
      }

      const variables = {
        owner: owner,
        name: name,
        previousEndCursor: previousEndCursor
      }
      // query for data
      const data = await this.gqlClient.request(query, variables)

      // update variables

      // destructure data from the JSON
      data.repository.stargazers.edges.forEach(handleEdge)

      // update progress tracking
      if (onProgress) {
        onProgress(getProgress(numberFetched, totalToFetch))
      }

      // track class-level variables
      previousEndCursor = data.repository.stargazers.pageInfo.endCursor // pagination

      // update pageIndex
      pageIndex += 1

      // onUpdate callback if existed
      if (this.liveUpdate && onUpdate && pageIndex % this.pagesPerUpdate === 0) {
        onUpdate(formattedData)
      }
    } while (previousEndCursor !== null)

    if (onUpdate) {
      onUpdate(formattedData)
    }
    if (onFinish) {
      onFinish({
        total: totalToFetch,
        maxIncrement,
        createdAt,
      })
    }

    return formattedData
  }

  /**
   * fetch fork data
   * @param owner owner of the repository
   * @param name name of the repository
   * @param onUpdate (data) function that will be called when a new data update is avaiable
   * @param onFinish (stats) function that will be called when fetching is finished
   * @param onProgress (progress) function that will be called when progress is updated
   * @param shouldAbort function that returns a boolean which determines whether fetching should abort
   * @returns Object that contains statistics
   */
  fetchForkData = async (owner, name, onUpdate, onFinish, onProgress, shouldAbort) => {
    const preparationVariables = {
      owner: owner,
      name: name,
    }

    // define the graphql query
    const preparationQuery = /* GraphQL */ `
      query prepareForks($owner: String!, $name: String!){
        repository(owner: $owner, name: $name) {
          createdAt
          forkCount
          forks(first: 0) {
            totalCount
          }
        }
      }
    `
    const query = /* GraphQL */ `
      query getForks($owner: String!, $name: String!, $previousEndCursor: String){
        repository(owner: $owner, name: $name) {
          forks(first: 100, after: $previousEndCursor) {
            pageInfo {
              endCursor
              startCursor
            }
            nodes {
              createdAt
            }
          }
        }
      }
    `

    // local variables
    const formattedData = new Map()
    let pageIndex = 0
    let totalToFetch = 0
    let numberFetched = 0
    let previousEndCursor = null
    const addNumberFetched = () => numberFetched += 1

    // Preparation query
    const preparationData = await this.gqlClient.request(preparationQuery, preparationVariables)

    // Statistics variables
    totalToFetch = preparationData.repository.forks.totalCount
    const createdAt = preparationData.repository.createdAt
    let maxIncrement = 0

    const handleNode = node => {
      const date = new Date(node.createdAt.slice(0,10)).getTime() // ISO-8601 encoded UTC date string
      if (!formattedData.has(date)) {
        formattedData.set(date, 1)
      } else {
        formattedData.set(date, formattedData.get(date) + 1)
      }
      if (formattedData.get(date) > maxIncrement) maxIncrement = formattedData.get(date)
      // update progress tracking
      addNumberFetched()
    }

    // data traversal, 100 edges/request
    do {
      if (shouldAbort) {
        if (shouldAbort()) {
          return
        }
      }
      const variables = {
        owner: owner,
        name: name,
        previousEndCursor: previousEndCursor
      }
      // query for data
      const data = await this.gqlClient.request(query, variables)

      // update variables

      // destructure data from the JSON
      data.repository.forks.nodes.forEach(handleNode)

      // update progress tracking
      if (onProgress) {
        onProgress(getProgress(numberFetched, totalToFetch))
      }

      // track class-level variables
      previousEndCursor = data.repository.forks.pageInfo.endCursor // pagination

      // update pageIndex
      pageIndex += 1

      // onUpdate callback if existed
      if (this.liveUpdate && onUpdate && pageIndex % this.pagesPerUpdate === 0) {
        onUpdate(formattedData)
      }
    } while (previousEndCursor !== null)

    if (onUpdate) {
      onUpdate(formattedData)
    }
    if (onFinish) {
      onFinish({
        total: totalToFetch,
        maxIncrement,
        createdAt,
      })
    }

    return formattedData
  }

  /**
   * fetch release data
   * @param owner owner of the repository
   * @param name name of the repository
   * @param onUpdate (data) function that will be called when a new data update is avaiable
   * @param onFinish (stats) function that will be called when fetching is finished
   * @param onProgress (progress) function that will be called when progress is updated
   * @param shouldAbort function that returns a boolean which determines whether fetching should abort
   * @returns Object that contains statistics
   */
  fetchReleaseData = async (owner, name, onUpdate, onFinish, onProgress, shouldAbort) => {
    const variables = {
      owner: owner,
      name: name,
    }

    // define the graphql query
    const query = /* GraphQL */ `
      query getRelease($owner: String!, $name: String!){
        repository(owner: $owner, name: $name) {
          releases(first: 1, orderBy:{field:CREATED_AT,direction: DESC}) {
            totalCount
            nodes {
              name
              tagName
              createdAt
              releaseAssets (first: 20) {
                totalCount
                nodes {
                  id
                  name
                  updatedAt
                  contentType
                  createdAt
                  downloadCount
                  
                }
              }
            }
          }
        }
      }
    `

    // local variables
    const formattedData = []
    let totalToFetch = 0
    let numberFetched = 0
    const addNumberFetched = () => numberFetched += 1

    // Preparation query
    const data = await this.gqlClient.request(query, variables)
    // if (shouldAbort) {
    //   if (shouldAbort()) {
    //     return
    //   }
    // }

    // Statistics variables
    totalToFetch = data.repository.releases.nodes[0].releaseAssets.totalCount
    let totalDownloads = 0

    // get stats of each asset
    data.repository.releases.nodes[0].releaseAssets.nodes.forEach(asset => {
      formattedData.push({
        id: asset.id,
        name: asset.name,
        updatedAt: asset.updatedAt,
        contentType: asset.contentType,
        createdAt: asset.createdAt,
        downloadCount: asset.downloadCount,
      })

      totalDownloads += asset.downloadCount

      addNumberFetched()
      if (onProgress) {
        onProgress(getProgress(numberFetched, totalToFetch))
      }
    })

    if (onUpdate) {
      onUpdate(formattedData)
    }

    if (onFinish) {
      onFinish({
        totalAssets: totalToFetch,
        totalDownloads: totalDownloads,
        name: data.repository.releases.nodes[0].name,
        tagName: data.repository.releases.nodes[0].tagName,
        createdAt: data.repository.releases.nodes[0].createdAt
      })
    }

    return formattedData
  }
}

export default GithubFetcher