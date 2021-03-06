
import React from 'react'
import ReactDOM from 'react-dom'
import { Route, BrowserRouter as Router } from 'react-router-dom'

import { createStore, applyMiddleware } from 'redux'
import { Provider } from 'react-redux'
import thunk from 'redux-thunk'

import 'semantic-ui-css/semantic.min.css'

import axios from 'axios'

import reducers from './reducers'
import App from './components/App'
import './index.css'

axios.defaults.xsrfCookieName = 'rendezvous_csrftoken'
axios.defaults.xsrfHeaderName = 'X-CSRFToken'

axios.defaults.withCredentials = true

const store = createStore(reducers, applyMiddleware(thunk))

ReactDOM.render(
  <Provider store={store}>
          <React.StrictMode>
              <Router>
                  <Route path='/' component={App} />
              </Router>
          </React.StrictMode>
  </Provider>
  ,
  document.getElementById('root')
)
