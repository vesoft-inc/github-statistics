import {  } from 'graphql'
import { GraphQLClient } from 'graphql-request'

const getProgress = (c, t) => Math.floor(c / t * 100)

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
   * reset class fields to default
   */
  reset = () => {
    this.fetching = false  }

  /**
   * fetch repository low-level data
   * @param onUpdate (@param data) function that will be called when a new data update is avaiable
   * @param onFinish function that will be called when fetching is finished
   * @param onProgress function that will be called when progress is updated
   * @returns Object that contains statistics
   */
  fetchRepositoryData = async (onUpdate, onFinish, onProgress) => {
    const owner = 'vesoft-inc'
    const name = 'nebula'

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
      onProgress(77)
    }

    const data = await this.gqlClient.request(query, variables)
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
   * fetch stargazers data
   * @param onUpdate function that will be called when a new data update is avaiable
   * @param onFinish function that will be called when fetching is finished
   * @param onProgress function that will be called when progress is updated
   * @returns Object that contains statistics
   */
  fetchStargazerData = async (onUpdate, onFinish, onProgress) => {
    // const owner = 'facebook'
    // const name = 'react'
    const owner = 'vesoft-inc'
    const name = 'nebula'

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


    // data traversal, 100 edges/request
    do {
      const variables = {
        owner: owner,
        name: name,
        previousEndCursor: previousEndCursor
      }
      // query for data
      const data = await this.gqlClient.request(query, variables)

      // update variables

      // destructure data from the JSON
      data.repository.stargazers.edges.forEach(edge => {
        const date = new Date(edge.starredAt.slice(0,10)).getTime() // ISO-8601 encoded UTC date string
        if (!formattedData.has(date)) {
          formattedData.set(date, 1)
        } else {
          formattedData.set(date, formattedData.get(date) + 1)
        }
        // update progress tracking
        addNumberFetched()
      })

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
        totalStar: totalToFetch,
        createdAt,
      })
    }

    this.reset()

    return formattedData
  }

  /**
   * fetch fork data
   * @param onUpdate (@param data) function that will be called when a new data update is avaiable
   * @param onFinish function that will be called when fetching is finished
   * @param onProgress function that will be called when progress is updated
   * @returns Object that contains statistics
   */
  fetchForkData = async (onUpdate, onFinish, onProgress) => {
    // const owner = 'graphql-go'
    // const name = 'graphql'
    const owner = 'vesoft-inc'
    const name = 'nebula'

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


    // data traversal, 100 edges/request
    do {
      const variables = {
        owner: owner,
        name: name,
        previousEndCursor: previousEndCursor
      }
      // query for data
      const data = await this.gqlClient.request(query, variables)

      // update variables

      // destructure data from the JSON
      data.repository.forks.nodes.forEach(node => {
        const date = new Date(node.createdAt.slice(0,10)).getTime() // ISO-8601 encoded UTC date string
        if (!formattedData.has(date)) {
          formattedData.set(date, 1)
        } else {
          formattedData.set(date, formattedData.get(date) + 1)
        }
        // update progress tracking
        addNumberFetched()
      })

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
        totalFork: totalToFetch,
        createdAt,
      })
    }

    this.reset()

    return formattedData
  }

  /**
   * fetch release data
   * @param onUpdate (@param data) function that will be called when a new data update is avaiable
   * @param onFinish function that will be called when fetching is finished
   * @param onProgress function that will be called when progress is updated
   * @returns Object that contains statistics
   */
  fetchReleaseData = async (onUpdate, onFinish, onProgress) => {
    // const owner = 'graphql-go'
    // const name = 'graphql'
    const owner = 'vesoft-inc'
    const name = 'nebula'

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

    this.reset()

    return formattedData
  }
}

export default GithubFetcher