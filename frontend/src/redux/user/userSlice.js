import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  currentUser: null,
  error: null,
  loading: null
}

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    signInStart: (state) => {
      state.loading = true
      state.error = null
    },
    signInSuccess: (state, action) => {
      state.currentUser = action.payload.user
      state.loading = false
      state.error = null
    },
    signInFailure: (state, action) => {
      state.loading = false
      state.error = action.payload
    },
    updateStart: (state) => {
      state.loading = true
      state.error = null
    },
    updateSuccess: (state, action) => {
      state.currentUser = action.payload.user
      state.loading = false
      state.error = null
    },
    updateFailure: (state, action) => {
      state.loading = false
      state.error = action.payload
    },
    deleteStart: (state) => {
      state.loading = true
      state.error = null
    },
    deleteSuccess: (state, action) => {
      state.currentUser = null
      state.loading = false
      state.error = null
    },
    deleteFailure: (state, action) => {
      state.loading = false
      state.error = action.payload
    },
    signOutSuccess: (state, action) => {
      state.currentUser = null
      state.loading = false
      state.error = null
    }
  }
})

export const {
  signInStart,
  signInSuccess,
  signInFailure,
  updateStart,
  updateSuccess,
  updateFailure,
  deleteStart,
  deleteSuccess,
  deleteFailure,
  signOutSuccess
} = userSlice.actions

export default userSlice.reducer
