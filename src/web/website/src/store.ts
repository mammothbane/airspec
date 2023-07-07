import {
  configureStore,
  createSerializableStateInvariantMiddleware,
  isPlain,
} from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import { reducer as bluetoothReducer } from './bluetooth/buttons/slice';

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
