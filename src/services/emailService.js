import nodemailer from 'nodemailer';

const createTransporter = () =>
  nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_APP_PASSWORD
    }
  });

export const sendExpirySummaryEmail = async ({ expiredProducts, expiringProducts }) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_APP_PASSWORD || !process.env.OWNER_EMAIL) {
    console.warn('Expiry email skipped because email environment variables are missing');
    return;
  }

  if (expiredProducts.length === 0 && expiringProducts.length === 0) {
    return;
  }

  const transporter = createTransporter();
  const formatRows = (products) =>
    products
      .map(
        (product) =>
          `<li><strong>${product.name}</strong> (${product.category}) - Qty: ${product.quantity}, Expiry: ${new Date(
            product.expiryDate
          ).toLocaleDateString()}</li>`
      )
      .join('');

  await transporter.sendMail({
    from: `"ShelfWatch" <${process.env.EMAIL_USER}>`,
    to: process.env.OWNER_EMAIL,
    subject: 'ShelfWatch daily expiry alert',
    html: `
      <h2>ShelfWatch daily expiry summary</h2>
      <h3>Expired products</h3>
      <ul>${formatRows(expiredProducts) || '<li>None</li>'}</ul>
      <h3>Products expiring within 7 days</h3>
      <ul>${formatRows(expiringProducts) || '<li>None</li>'}</ul>
    `
  });
};
