import {  } from 'graphql'
import { GraphQLClient } from 'graphql-request'

class GithubRepoScript {

  constructor() {
    const endpoint = 'https://api.github.com/graphql'
    const token = 'd3142837a321306fde94c59774009c8ab9eeeaac'

    this.gqlClient = new GraphQLClient(
      endpoint, 
      {
        headers: {
          Authorization: 'bearer ' + token,
        }
      }
    )

    // Fields
    this.fetching = false
    this.previousEndCursor = null // location of start

    // Data Fields
    this.rawStargazerData = new Map()

  }

  /**
   * return the status of fetching
   */
  isFetching = () => this.fetching

  /**
   * set the status of fetching to true
   */
  startFetching = () => this.fetching = true

  /**
   * set the status of fetching to false
   */
  stopFetching = () => this.fetching = false

  /**
   * 
   */
  fetchStargazerData = async () => {
    this.startFetching()

    // define the graphql queryr
    const query = /* GraphQL */ `
      query getStargazers($previousEndCursor: String){
        # repository(owner: "CyC2018", name: "CS-Notes") {
        repository(owner: "vesoft-inc", name: "nebula") {
          name
          createdAt
          stargazers(first: 100, after: $previousEndCursor) {
            totalCount
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

    // data traversal, 100 edges/request
    do {
      const variables = {
        previousEndCursor: this.previousEndCursor
      }
      // query for data
      const data = await this.gqlClient.request(query, variables)

      // variable used for structuring data
      // const dateCreated = new Date(data.repository.createdAt.slice(0,10)).getTime()

      // destructure data from the JSON
      data.repository.stargazers.edges.forEach(edge => {
        const date = new Date(edge.starredAt.slice(0,10)).getTime() // ISO-8601 encoded UTC date string
        if (!this.rawStargazerData.has(date)) {
          this.rawStargazerData.set(date, 1)
        } else {
          this.rawStargazerData.set(date, this.rawStargazerData.get(date) + 1)
        }
      })

      // track class-level variables
      this.previousEndCursor = data.repository.stargazers.pageInfo.endCursor // pagination
    } while (this.previousEndCursor !== null)

    return this.rawStargazerData
  }
}

export default GithubRepoScript