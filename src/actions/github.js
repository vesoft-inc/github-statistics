export const updateState = (state, data) => ({
  type: 'UPDATE_STATE',
  payload: { state, data }
})

export const updateStatsField = (state, stats) => ({
  type: 'UPDATE_STATS_FIELD',
  payload: { state, stats }
})