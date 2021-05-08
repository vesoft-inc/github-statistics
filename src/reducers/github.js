const INITIAL_STATE = {
  repoData: [],
  repoStats: {},

  starData: [],
  starStats: {},

  forkData: [],
  forkStats: {},

  releaseData: [],
  releaseStats: {},

  githubApiToken: 'Z2hwX29XQWdNS3gxeXNHRXBlTzV6OEdpdWZvNjc0WkhWZTN0bVlJVQ==',

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