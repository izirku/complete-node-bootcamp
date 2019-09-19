import axios from 'axios'
import { showAlert } from './alert'

export const login = async (email, password) => {
  try {
    const res = await axios({
      method: 'POST',
      // url: 'http://localhost:3000/api/v1/users/login',
      url: '/api/v1/users/login',
      data: {
        email,
        password
      }
    })
    if (res.data.status === 'success') {
      showAlert('success', 'logged in succesfully')
      window.setTimeout(() => {
        location.assign('/')
      }, 1500)
    }
  } catch (err) {
    showAlert('error', err.response.data.message)
  }
}

export const logout = async () => {
  try {
    const res = await axios({
      method: 'GET',
      // url: 'http://localhost:3000/api/v1/users/logout'
      url: '/api/v1/users/logout'
    })
    // if (res.data.status === 'success') window.location.reload(true) // true means, get from server, not cache
    if (res.data.status === 'success') location.assign('/') // TODO: make sure works nicely with browser cache
  } catch (err) {
    showAlert('error', 'an error occured while logging out')
  }
}
