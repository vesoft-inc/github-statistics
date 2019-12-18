const INITIAL_STATE = {
  repoData: [],
  repoStats: {},

  starData: [],
  starStats: {},

  forkData: [],
  forkStats: {},

  releaseData: [],
  releaseStats: {},

  githubApiToken: '57e59912e2d247e54c8d1c8ec735cab134d1a206',

}

const github = (state = INITIAL_STATE, action) => {
  const { type, payload } = action
  switch (type) {
    case 'UPDATE_STATE':
      return {
        ...state,
        ...{[payload.state]: payload.data}
      }
    case 'UPDATE_STATS_FIELD':
      return Object.assign({}, state, {
        [payload.state] : {
          ...state[payload.state],
          ...payload.stats
        }
      })
    default:
      return state
  }
}

export default github