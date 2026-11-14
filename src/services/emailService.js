import nodemailer from 'nodemailer';

const createTransporter = () =>
  nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_APP_PASSWORD
    }
  });

const escapeHtml = (value) =>
  String(value).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);

export const sendExpirySummaryEmail = async ({ to, expiredProducts, expiringProducts }) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_APP_PASSWORD || !to) {
    console.warn('Expiry email skipped because email settings or recipient are missing');
    return false;
  }

  if (expiredProducts.length === 0 && expiringProducts.length === 0) {
    return false;
  }

  const transporter = createTransporter();
  const formatRows = (products) =>
    products
      .map(
        (product) =>
          `<li><strong>${escapeHtml(product.name)}</strong> (${escapeHtml(product.category)}) - Qty: ${product.quantity}, Expiry: ${new Date(
            product.expiryDate
          ).toLocaleDateString('en-IN')}</li>`
      )
      .join('');

  await transporter.sendMail({
    from: `"ShelfWatch" <${process.env.EMAIL_USER}>`,
    to,
    subject: 'ShelfWatch daily expiry alert',
    html: `
      <h2>ShelfWatch daily expiry summary</h2>
      <h3>Expired products</h3>
      <ul>${formatRows(expiredProducts) || '<li>None</li>'}</ul>
      <h3>Products expiring within 7 days</h3>
      <ul>${formatRows(expiringProducts) || '<li>None</li>'}</ul>
    `
  });

  return true;
};
