import nodemailer from 'nodemailer'
import env from '../config/env.js'

export default class Email {
  newTransport() {
    const transport = nodemailer.createTransport(env.email.smtp)

    if (env.build_mode == 'dev') {
      transport
        .verify()
        .then(() => console.log('Connected to email server'))
        .catch(() =>
          console.log(
            'Unable to connect to email server. Make sure you have configured the SMTP options in .env'
          )
        )
    }

    return transport
  }

  async send(to, subject, html) {
    const mailOptions = {
      from: `<${env.email.from}>`,
      to,
      subject,
      html
    }

    await this.newTransport().sendMail(mailOptions)
  }

  async sendPasswordReset(name, email, token, origin) {
    const subject = 'Reset Password'
    const resetPasswordlUrl = `${origin}/reset-password?token=${token}&email=${email}`
    const html = `<h4>Hello ${name}</h4><p>Please reset your password by clicking on the following link: <a href='${resetPasswordlUrl}'>Reset Password</a></p>`

    await this.send(email, subject, html)
  }
}
