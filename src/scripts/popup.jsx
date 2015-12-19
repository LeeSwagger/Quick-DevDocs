import debounce from 'lodash/function/debounce'
import 'react/dist/react-with-addons.min'
import 'react-dom/dist/react-dom.min'

const Search = React.createClass({
  updateResults (results) {
    console.log(results)
  },

  search: debounce(function (e) {
    console.log(this.updateResults)
    chrome.runtime.sendMessage(e.target.value, this.updateResults)
  }, 500),

  render () {
    return (
      <div className='_header'>
       <form className='_search'>
         <input
           type='text'
           className='input _search-input'
           autoFocus='autofocus'
           placeholder='Search...'
           onChange={this.search} />
       </form>
     </div>
    )
  }
})

const Splash = React.createClass({
  render () {
    return <div className='splash _splash-title'>
             DevDocs
           </div>
  }
})

const Results = React.createClass({
  propTypes: {
    name: React.PropTypes.string.isRequired
  },
  render () {
    return (
      <div>Hello</div>
    )
  }
})

const Result = React.createClass({
  render () {
    return <div>content</div>
  }
})

ReactDOM.render((
  <div>
    <Search />
    <Splash />
    <Results />
    <Result />
  </div>
  ), document.body)
