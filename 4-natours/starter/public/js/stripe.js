import axios from 'axios'
const stripe = Stripe('pk_test_uiHjWkjZHWknKF2OXZy0d8r700WAhDMhuH')
import { showAlert } from './alert'

export const bookTour = async tourId => {
  try {
    // 1) get checkout session from our API
    const session = await axios(
      // `http://localhost:3000/api/v1/booking/checkout-session/${tourId}`
      `/api/v1/booking/checkout-session/${tourId}`
    )
    // console.log(session)

    // 2) create checkout form + charge credit card
    await stripe.redirectToCheckout({ sessionId: session.data.session.id })
  } catch (err) {
    showAlert('error', 'could not process payment')
    // TODO: don't leak it in production:
    // console.error(err)
  }
}
