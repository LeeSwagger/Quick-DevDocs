import 'react/dist/react-with-addons.min'
import 'react-dom/dist/react-dom.min'
import {isArray, merge, debounce, identity, map} from 'lodash'
import {createStore, combineReducers} from 'redux'
import {connect, Provider} from 'react-redux'

const replaceResults = function (state = {}, action) {
  switch (action.type) {
    case 'SEARCH':
      return merge(state, {
        query: action.query,
        results: isArray(action.results)
          ? action.results
          : [],
        content: null
      })
    default:
      return state
  }
}

const openContent = function (state = {}, action) {
  switch (action.type) {
    case 'OPEN':
      return {
        content: action.content
      }
    default:
      return state
  }
}

const reducer = combineReducers({
  replaceResults, openContent
})

let store = createStore(reducer)

const Search = React.createClass({
  propTypes: {
    query: React.PropTypes.string
  },

  search: debounce(function (e) {
    const query = e.target.value
    const {dispatch} = this.props

    chrome.runtime
      .sendMessage(query, function (results) {
        const searchAction = {
          type: 'SEARCH',
          results
        }

        dispatch(searchAction)
      })
  }, 500),

  render () {
    const {query} = this.props
    return (
      <div className='_header'>
       <form className='_search'>
         <input
           type='text'
           className='input _search-input'
           autoFocus='autofocus'
           placeholder='Search...'
           value={query}
           onChange={this.search} />
       </form>
     </div>
    )
  }
})

const Splash = React.createClass({
  render () {
    return (
      <div className='splash _splash-title'>DevDocs</div>
    )
  }
})

const Results = React.createClass({
  propTypes: {
    results: React.PropTypes.array
  },
  render () {
    const {results} = this.props
    console.log(results)
    return (
      <div className='results'>
        {map(results, result => (
          <div className='result _list-item'>
            {result.name}
          </div>
        ))}
      </div>
    )
  }
})

const Content = React.createClass({
  render () {
    return <div className='content'>Content</div>
  }
})

let App = React.createClass({
  propTypes: {
    query: React.PropTypes.string,
    results: React.PropTypes.array,
    content: React.PropTypes.string
  },
  render () {
    return (
      <div style={{width: 500, height: 500}}>
        <Search {...this.props} />
        <Splash {...this.props} />
        <Results {...this.props} />
        <Content {...this.props} />
      </div>
    )
  }
})

App = connect(identity)(App)

ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.body
)
