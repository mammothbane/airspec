import {
  configureStore,
  createSerializableStateInvariantMiddleware,
  isPlain,
} from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import {reducer as bluetoothReducer, SEEN_GLASSES_LOCALSTORAGE_KEY} from './pages/bluetooth/slice';
import _ from "lodash";

export const store = configureStore({
  reducer: {
    bluetooth: bluetoothReducer,
  },
  middleware: [
    createSerializableStateInvariantMiddleware({
      isSerializable: (value: any) => isPlain(value) || value instanceof Date,
    })
  ]
});

export type RootState = ReturnType<typeof store.getState>;
export type Dispatch = typeof store.dispatch;

export const useAirspecsDispatch: () => Dispatch = useDispatch
export const useAirspecsSelector: TypedUseSelectorHook<RootState> = useSelector

store.subscribe(_.throttle(() => {
  const state = store.getState();

  localStorage.setItem(SEEN_GLASSES_LOCALSTORAGE_KEY, JSON.stringify(state.bluetooth.seen_glasses));
}, 10000))

