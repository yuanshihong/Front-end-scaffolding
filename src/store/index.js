
import { createStore, compose, applyMiddleware  } from 'redux'
import reducer from '../reducers'
import thunk from 'redux-thunk'
import APIClient from '../utils/APIClient'

const configureStore = preloadedState => createStore(
  reducer,
  preloadedState,
  compose(
    applyMiddleware(thunk,APIClient.middleware)
  )
)
export default configureStore()
