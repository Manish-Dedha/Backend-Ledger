const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    type: 'OAuth2',
    user: process.env.EMAIL_USER,
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    refreshToken: process.env.REFRESH_TOKEN,
  },
});

// Verify the connection configuration
transporter.verify((error, success) => {
  if (error) {
    console.error('Error connecting to email server:', error);
  } else {
    console.log('Email server is ready to send messages');
  }
});

// Function to send email
const sendEmail = async (to, subject, text, html) => {
  try {
    const info = await transporter.sendMail({
      from: `"Backend Ledger" <${process.env.EMAIL_USER}>`, // sender address
      to, // list of receivers
      subject, // Subject line
      text, // plain text body
      html, // html body
    });

    console.log('Message sent: %s', info.messageId);
    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
  } catch (error) {
    console.error('Error sending email:', error);
  }
};
async function sendRegistrationEmail(userEmail,name) {
    const subject = 'Welcome to backend ledger';
    const text = `Hello ${name},\n\n Thanks for register into Backend Ledger,\n\nBest Regard\n Team Backend Ledger`;
    const html= `<p>Hello ${name},</p><p>Thanks for register into backend Ledger ,</p><p>Best Regard,<br>Team Backend Ledger</p>`;
    
    await sendEmail(userEmail,subject,text,html)
    
}

async function sendTransactionEmail(userEmail,name,amount,transactionType) {
    const subject = 'Transaction Notification';
    const text = `Hello ${name},\n\n A ${transactionType} transaction of amount ${amount} has been made in your account.\n\nBest Regards,\nTeam Backend Ledger`;
    const html= `<p>Hello ${name},</p><p>A <strong>${transactionType}</strong> transaction of amount <strong>${amount}</strong> has been made in your account.</p><p>Best Regards,<br>Team Backend Ledger</p>`;
    
    await sendEmail(userEmail,subject,text,html)
    
}
 
async function sendTransactionFailedEmail(userEmail,name,amount,transactionType) {
    const subject = 'Transaction Failed Notification';
    const text = `Hello ${name},\n\n A ${transactionType} transaction of amount ${amount} has failed in your account.\n\nBest Regards,\nTeam Backend Ledger`;
    const html= `<p>Hello ${name},</p><p>A <strong>${transactionType}</strong> transaction of amount <strong>${amount}</strong> has failed in your account.</p><p>Best Regards,<br>Team Backend Ledger</p>`;
    
    await sendEmail(userEmail,subject,text,html)
    
}

module.exports = {
  sendRegistrationEmail,
  sendTransactionEmail,
  sendTransactionFailedEmail
};