// import 'core-js/stable'
// import 'regenerator-runtime/runtime'
import { login, logout } from './login'
import { displayMap } from './mapbox'
import { updateSettings } from './updateSettings'

// DOM Elements
const mapBox = document.getElementById('map')
const loginForm = document.querySelector('.form--login')
const userDataForm = document.querySelector('.form-user-data')
const userPasswordForm = document.querySelector('.form-user-password')
const logoutBtn = document.querySelector('.nav__el--logout')

// DELEGATION
if (mapBox) {
  const locations = JSON.parse(mapBox.dataset.locations)
  displayMap(locations)
}

if (loginForm) {
  loginForm.addEventListener('submit', e => {
    e.preventDefault()
    const email = document.getElementById('email').value
    const password = document.getElementById('password').value
    login(email, password)
  })
}

if (logoutBtn) {
  logoutBtn.addEventListener('click', logout)
}

if (userDataForm) {
  userDataForm.addEventListener('submit', e => {
    e.preventDefault()
    const name = document.getElementById('name').value
    const email = document.getElementById('email').value
    updateSettings({ name, email }, 'data')
  })
}

if (userPasswordForm) {
  userPasswordForm.addEventListener('submit', async e => {
    e.preventDefault()
    const savePasswordBtn = document.querySelector('.btn--save-password')
    savePasswordBtn.textContent = 'Saving...'

    const password = document.getElementById('password').value
    const passwordConfirm = document.getElementById('password-confirm').value
    const passwordCurrent = document.getElementById('password-current').value
    await updateSettings(
      { password, passwordConfirm, passwordCurrent },
      'password'
    )
    document.getElementById('password').value = ''
    document.getElementById('password-confirm').value = ''
    document.getElementById('password-current').value = ''
    savePasswordBtn.textContent = 'Save Password'
  })
}
