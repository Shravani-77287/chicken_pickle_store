// backend/utils/sendWhatsApp.js
const twilio = require('twilio');

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromWhatsApp = process.env.TWILIO_WHATSAPP_NUMBER || 'whatsapp:+14155238886';

let client;
if (accountSid && authToken && !accountSid.includes('your_account')) {
  client = twilio(accountSid, authToken);
}

const sendWhatsAppMessage = async (toPhone, message) => {
  // Clean phone number: remove spaces/dashes and ensure +91 country code prefix if missing
  let cleanPhone = toPhone.toString().replace(/[\s-]/g, '');
  if (!cleanPhone.startsWith('+')) {
    cleanPhone = `+91${cleanPhone}`; // Default to India country code
  }

  // Fallback to console simulation if Twilio API keys are not provided yet
  if (!client) {
    console.log('\n==================================================');
    console.log(`📱 [SIMULATED WHATSAPP MESSAGE] To: whatsapp:${cleanPhone}`);
    console.log('--------------------------------------------------');
    console.log(message);
    console.log('==================================================\n');
    return;
  }

  try {
    const response = await client.messages.create({
      from: fromWhatsApp,
      to: `whatsapp:${cleanPhone}`,
      body: message,
    });
    console.log(`✅ WhatsApp sent to ${cleanPhone} (SID: ${response.sid})`);
  } catch (error) {
    console.error('❌ WhatsApp delivery failed:', error.message);
  }
};

module.exports = sendWhatsAppMessage;