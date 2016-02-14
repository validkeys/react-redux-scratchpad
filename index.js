import React from 'react';
import ReactDOM from 'react-dom';
import { createStore, combineReducers, bindActionCreators, applyMiddleware, compose } from 'redux';
import { Provider, connect } from 'react-redux';
import createLogger from 'redux-logger';
import thunk from 'redux-thunk';
import { createDevTools } from 'redux-devtools';
import LogMonitor from 'redux-devtools-log-monitor';
import DockMonitor from 'redux-devtools-dock-monitor';

const DevTools = createDevTools(
  <DockMonitor toggleVisibilityKey='ctrl-h'
               changePositionKey='ctrl-q'>
    <LogMonitor theme='tomorrow' />
  </DockMonitor>
);

// TYPES
const SCRATCH_CLICK = "SCRATCH_CLICK";

// ACTIONS
const actions = {
  scratchAction() {
    return {
      type:     SCRATCH_CLICK,
      payload:  {}
    }
  }
};

// REDUCERS
const scratchInitialState = {
  timesClicked: 0
};

const scratchReducer = (state = scratchInitialState, action) => {
  switch(action.type) {
    case SCRATCH_CLICK:
      return Object.assign({}, state, {
        timesClicked: state.timesClicked + 1
      });
    default:
      return state;
  }
}

// STORE
const reducers = combineReducers({
  scratch: scratchReducer
});

const loggerMiddleware          = createLogger();
// const createStoreWithMiddleware = applyMiddleware(thunk, loggerMiddleware)(createStore);

const enhancer = compose(
  applyMiddleware(thunk, loggerMiddleware),
  DevTools.instrument()
);

const configureStore = (initialState) => {
  // Note: only Redux >= 3.1.0 supports passing enhancer as third argument.
  // See https://github.com/rackt/redux/releases/tag/v3.1.0
  const store = createStore(reducers, {} , enhancer);

  // Hot reload reducers (requires Webpack or Browserify HMR to be enabled)
  if (module.hot) {
    module.hot.accept('../reducers', () =>
      store.replaceReducer(require('../reducers')/*.default if you use Babel 6+ */)
    );
  }

  return store;
}
const store = configureStore({});

// COMPONENTS
const Scratch = React.createClass({
  render() {
    return (
      <div>
        Scratch Component: Times Clicked: {this.props.state.scratch.timesClicked}
        <div>
          <button onClick={() => this.props.actions.scratchAction()}>Trigger Scratch Action</button>
        </div>
      </div>
    );
  }
});
const XScratch = connect(
  state => ({state}),
  (dispatch) => ({ actions: bindActionCreators(actions, dispatch) }),
  null,
  { withRef: false }
)(Scratch);


ReactDOM.render((
  <Provider store={store}>
    <div>
      Scratchpad
      <XScratch />
      <DevTools />
    </div>
  </Provider>
), document.getElementById("myapp"));
