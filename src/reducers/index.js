import { combineReducers } from 'redux'

import github from './github'

const reducers = combineReducers({
  github: github,
})

export default reducers