import React from 'react/dist/react-with-addons.min'
import ReactDOM from 'react-dom/dist/react-dom.min'

alert(ReactDOM)
class HelloMessage extends React.Component {
  render () {
    return <div>Hello {this.props.name}</div>
  }
}

HelloMessage.propTypes = {
  name: React.PropTypes.string.isRequired
}

ReactDOM.render(<HelloMessage name='John' />, document.body)
