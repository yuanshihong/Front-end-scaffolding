

let initialState = {
  num: 0,
  list: []
}
export default function plusOne (state = initialState, action) {
  switch(action.type) {
  case 'PLUSONE': {
    return (
      {
        ...state,
        num: state.num + 1
      }
    )
  }
  case 'EXAMPLE_REQUEST': {
    return {...state}
  }
  case 'EXAMPLE_SUCCESS': {
    return (
      {
        ...state,
        list: action.data.data.list
      }
    )
  }
  case 'EXAMPLE_FAILURE': {
    return {...state}
  }
  default: {
    return state
  }
  }
}