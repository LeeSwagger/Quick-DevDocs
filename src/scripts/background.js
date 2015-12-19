import 'jquery/dist/jquery.min'
import _ from 'lodash'

const log = function (msg) {
  return function (x) {
    console.log(msg)
    return x
  }
}
const getCategoriesFromCookie = function (cookie) {
  const defaultCategories = ['css', 'dom', 'dom_events', 'html', 'http', 'javascript']
  return _.get(cookie, 'value')
    ? cookie.value.split('/')
    : defaultCategories
}
const getQueryFromCategory = function (category) {
  const hosts = 'http://maxcdn-docs.devdocs.io'
  const path = '/' + category + '/index.json'
  return $.ajax(hosts + path)
}
const getQueriesFromCookie = _.compose(
  log("Fetching documents's entries..."),
  _.partial(_.map, _, getQueryFromCategory),
  getCategoriesFromCookie
)
const processPromise = function (queryWidhCategory) {
  const query = _.first(queryWidhCategory)
  const category = _.last(queryWidhCategory)
  const getExtendedEntry = function (entry) {
    return _.assign(entry, {
      category: category
    })
  }
  const getEntriesFromRes = function (res) {
    return _.map(res.entries, getExtendedEntry)
  }
  return query.then(getEntriesFromRes)
}

const getQueriesWithCategories = function (cookie) {
  return _.zip(
    getQueriesFromCookie(cookie),
    getCategoriesFromCookie(cookie)
  )
}

const getChars = function (str) {
  const words = _.trim(str).toLowerCase().match(/\w+/g)
  if (!words || words.length === 0) {
    return ''
  }
  return words.join('')
}
const getRegFromQuery = _.compose(
  _.partial(RegExp, _, 'i'),
  _.partial(_.reduce, _, function (prev, current) {
    return prev + (
    /\.|\(|\)/.test(current)
      ? ''
      : (current + '.*')
    )
  }, '.*')
)
const getEntryScore = function (entry, query) {
  const name = getChars(entry.name)
  const fullName = entry.category + name
  const testName = _.bind(RegExp.prototype.test, getRegFromQuery(query))

  if (name === query) {
    return 0
  } else if (fullName === query) {
    return 1
  } else if (_.contains(name, query)) {
    return 2
  } else if (_.contains(fullName, query)) {
    return 3
  } else if (testName(name)) {
    return 4
  } else if (testName(fullName)) {
    return 5
  } else {
    return NaN
  }
}

const getScore = _.partial(_.get, _, 'score')
const getSearcher = function (entries) {
  return _.memoize(function (query) {
    console.log('searching for ' + query)
    const addEntryScore = function (entry) {
      return _.assign(entry, {
        score: getEntryScore(entry, query)
      })
    }
    return _.compose(_.isEmpty, getChars)(query)
      ? null
      : _.sortBy(
        _.filter(
          _.map(entries, addEntryScore),
          _.compose(_.negate(_.isNaN), getScore)
        ),
        getScore
      )
  })
}

const getmsghandler = function (searcher) {
  return function (message, sender, sendResponse) {
    console.log('msg is coming')
    return _.compose(sendResponse, searcher, getChars)(message)
  }
}
const getpromises = function (cookie) {
  return _.map(getQueriesWithCategories(cookie), processPromise)
}
const startlisten = function (cookie) {
  return $.when.apply($, getpromises(cookie)).then(function () {
    const listener = _.compose(getmsghandler, getSearcher, _.flatten)(arguments)
    chrome.runtime.onMessage.addListener(listener)
    return listener
  })
}

let listenpromise

chrome.cookies.get({
  url: 'http://devdocs.io',
  name: 'docs'
}, function (cookie) {
  listenpromise = startlisten(cookie)
})

chrome.cookies.onChanged.addListener(_.debounce(function (changeInfo) {
  const cookie = changeInfo.cookie
  if (cookie.domain === 'devdocs.io' && cookie.name === 'docs') {
    console.log('Cookie is changed to ' + cookie.value + '!')
    listenpromise.then(_.bind(chrome.runtime.onMessage.removeListener, chrome.runtime.onMessage))
    listenpromise = startlisten(cookie)
  }
}, 500))

// open a welcome page after install
if (_.any([localStorage.install_time, localStorage.version], _.isUndefined)) {
  chrome.tabs.create({
    url: 'pages/build/options.html#welcome'
  })
}

_.assign(localStorage, {
  version: '0.1.0',
  install_time: _.now(),
  theme: 'light',
  width: 600,
  height: 600
})
