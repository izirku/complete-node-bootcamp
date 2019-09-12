// import nodemailer = require('nodemailer')
import { createTransport, SendMailOptions } from 'nodemailer'
import { AppMailOptions } from '../interfaces'

const sendEmail = async (options: AppMailOptions): Promise<void> => {
  // 1) create transporter

  // GMail:
  // const transporter = nodemailer.createTransport({
  //   service: 'Gmail',
  //   auth: {
  //     user: process.env.EMAIL_USERNAME,
  //     pass: process.env.EMAIL_PASSWORD
  //   }
  // })
  // activate in gmail "less secure app" option

  // mailtrap.io - test email based dev stuff
  const transporter = createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT),
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD
    }
  })

  // 2) define email options
  const mailOptions: SendMailOptions = {
    from: 'Solaire Phantom <solaire.phantom.tv@gmail.com>',
    to: options.email,
    subject: options.subject,
    text: options.message
    // html:
  }

  // 3) send email
  await transporter.sendMail(mailOptions)
}

export default sendEmail
