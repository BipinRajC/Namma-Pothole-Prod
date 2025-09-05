import ngrok from 'ngrok';
import 'dotenv/config';

const PORT = process.env.PORT || 3000;

async function setupNgrok() {
  try {
    console.log('🚀 Starting ngrok tunnel...');
    
    const url = await ngrok.connect({
      addr: PORT,
      authtoken: process.env.NGROK_AUTHTOKEN, // Optional: add your ngrok authtoken to .env
    });
    
    console.log(`✅ Ngrok tunnel established!`);
    console.log(`🌐 Public URL: ${url}`);
    console.log(`📱 WhatsApp Webhook URL: ${url}/whatsapp`);
    console.log(`🏥 Health Check URL: ${url}/health`);
    console.log('');
    console.log('📋 Copy the webhook URL to Twilio Console:');
    console.log(`   https://console.twilio.com/us1/develop/sms/try-it-out/whatsapp-learn`);
    console.log('');
    console.log('⏹️  Press Ctrl+C to stop the tunnel');
    
    // Keep the process running
    process.on('SIGINT', async () => {
      console.log('\n🛑 Stopping ngrok tunnel...');
      await ngrok.kill();
      process.exit(0);
    });
    
  } catch (error) {
    console.error('❌ Failed to start ngrok tunnel:', error);
    process.exit(1);
  }
}

setupNgrok();
