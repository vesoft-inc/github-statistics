const INITIAL_STATE = {
  repoData: [],
  repoStats: {},

  starData: [],
  starStats: {},

  forkData: [],
  forkStats: {},

  releaseData: [],
  releaseStats: {},

  githubApiToken: '05c1acf261f6b223411c73d8b71cb1a30ce9186a',

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