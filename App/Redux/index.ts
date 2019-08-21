import { AnyAction, combineReducers, Reducer } from 'redux'
import { PersistConfig, persistReducer } from 'redux-persist'

import ReduxPersist from 'appSrc/Config/ReduxPersist'

import rootSaga from '../Sagas/'
import configureStore from './CreateStore'

import { reducer as catReducer } from './CatRedux'
import { reducer as counterReducer } from './CounterRedux'
import { reducer as navReducer } from './NavigationRedux'

function _persistReducer<T>(c: PersistConfig, r: Reducer<T, AnyAction>) {
  const _reducer: any = persistReducer(c, r)
  const reducer: Reducer<T, AnyAction> = _reducer
  return reducer
}
/* ------------- Assemble The Reducers ------------- */
export const reducers = combineReducers({
  nav: navReducer,
  counter: counterReducer,
  cat: catReducer
})

export default () => {
  let finalReducers = reducers
  // If rehydration is on use persistReducer otherwise default combineReducers
  if (ReduxPersist.active) {
    const persistConfig = ReduxPersist.storeConfig
    finalReducers = _persistReducer(persistConfig, reducers)
  }

  let { store, sagasManager, sagaMiddleware } = configureStore(
    finalReducers,
    rootSaga
  )

  if (module.hot) {
    module.hot.accept(() => {
      const nextRootReducer = require('./').reducers
      store.replaceReducer(nextRootReducer)

      const newYieldedSagas = require('../Sagas').default
      sagasManager.cancel()
      sagasManager.done.then(() => {
        sagasManager = sagaMiddleware(newYieldedSagas)
      })
    })
  }
  return store
}
