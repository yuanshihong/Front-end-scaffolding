import API from '../utils/API'

export const plusOne = () => {
  return {
    type: 'PLUSONE'
  }
}
export const asyncExample = () => {
  return {
    types: {
      REQUEST: 'EXAMPLE_REQUEST',
      SUCCESS: 'EXAMPLE_SUCCESS',
      FAILURE: 'EXAMPLE_FAILURE',
    },
    payload: {

    },
    promise: (client) =>
      client.get(API.mock, {
        params: {}
      })
  }
}