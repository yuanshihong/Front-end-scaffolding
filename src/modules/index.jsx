import React from 'react'
import { plusOne, asyncExample } from '../actions/home'
import { connect } from 'react-redux'

@connect((state, props) => {
   return {
     num: state.home.num,
     list: state.home.list
   }
  },
  {
    plusOne,
    asyncExample
  }
)
export default class Home extends React.Component {
  constructor (props) {
    super(props)
    this.handleClick = this.handleClick.bind(this)
    this.handleAsyncClick = this.handleAsyncClick.bind(this)
  }
  handleClick () {
   this.props.plusOne()
  }
  handleAsyncClick () {
    this.props.asyncExample()
  }
  render() {
    return (
      <div>
        <div onClick={this.handleClick}>
         please click me {this.props.num}
        </div>
        <div onClick={this.handleAsyncClick}>
           get async Data
         </div>
         {
           this.props.list.length
            ? this.props.list.map((item) => {
              return <div key={item.id}>{item.source}</div>
            })
            : null
        }
      </div>
    )
  }
}
