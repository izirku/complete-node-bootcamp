// import nodemailer = require('nodemailer')
import path = require('path')
import pug = require('pug')
import htmlToText = require('html-to-text')
import { createTransport, SendMailOptions } from 'nodemailer'
import { AppMailOptions } from '../interfaces'
import Mail = require('nodemailer/lib/mailer')

interface User {
  email: string
  name: string
}

export class Email {
  url: string
  to: string
  from = `Solaire Phantom <${process.env.EMAIL_FROM}>`
  firstName: string

  constructor(user: User, url: string) {
    this.url = url
    this.to = user.email
    this.firstName = user.name.split(' ')[0]
  }

  // send the actual email
  async send(template: string, subject: string): Promise<void> {
    // 1) render HTML
    const html = pug.renderFile(
      path.resolve(__dirname, `../views/email/${template}.pug`),
      { firstName: this.firstName, url: this.url, subject }
    )

    // 2) define email Options
    const mailOptions: SendMailOptions = {
      from: this.from,
      to: this.to,
      subject: subject,
      html,
      text: htmlToText.fromString(html)
    }
    // 3) create transport and send email
    await this.getTransport().sendMail(mailOptions)
  }

  async sendWelcome(): Promise<void> {
    await this.send('welcome', 'Welcome to the Natours Family!')
  }

  async sendPasswordReset(): Promise<void> {
    await this.send(
      'passwordReset',
      'Your password reset token (valid for only 10 minutes)'
    )
  }

  private getTransport(): Mail {
    // if (!this.transport) {
    if (process.env.NODE_ENV === 'production') {
      // send grid transporter
      return createTransport({
        service: 'SendGrid',
        auth: {
          user: process.env.SENDGRID_USERNAME,
          pass: process.env.SENDGRID_PASSWORD
        }
      })
    } else {
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
      //  this.transport = createTransport({
      return createTransport({
        host: process.env.EMAIL_HOST,
        port: parseInt(process.env.EMAIL_PORT),
        auth: {
          user: process.env.EMAIL_USERNAME,
          pass: process.env.EMAIL_PASSWORD
        }
      })
    }
    // }

    // return this.transport
  }

  // private transport: Mail
}

export const sendEmail = async (options: AppMailOptions): Promise<void> => {
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
