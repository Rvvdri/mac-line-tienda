const nodemailer = require('nodemailer');

const EMAIL_USER = 'linemac910@gmail.com';
const EMAIL_PASSWORD = 'bpuowzsjsnzrdbwu';

console.log('\n🧪 PROBANDO NODEMAILER...\n');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASSWORD
    }
});

console.log('⏳ Verificando conexión...\n');

transporter.verify((error, success) => {
    if (error) {
        console.log('❌ ERROR:', error.message);
        console.log('\n🔧 SOLUCIÓN:');
        console.log('   1. Ve a: https://myaccount.google.com/apppasswords');
        console.log('   2. Genera nueva contraseña de aplicación');
        console.log('   3. Reemplázala en server.js línea 18\n');
        process.exit(1);
    } else {
        console.log('✅ CONEXIÓN EXITOSA!\n');
        console.log('🧪 Enviando email de prueba...\n');
        
        transporter.sendMail({
            from: `Mac Line <${EMAIL_USER}>`,
            to: EMAIL_USER,
            subject: '🧪 TEST - Nodemailer Funciona',
            html: `
                <div style="font-family: Arial; padding: 20px; background: #f0f4f8;">
                    <div style="max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px;">
                        <h1 style="color: #0066cc; text-align: center;">✅ Nodemailer OK!</h1>
                        <p>Email de prueba desde Mac Line</p>
                        <div style="background: #e8f0ff; padding: 15px; margin: 20px 0;">
                            <p><strong>Estado:</strong> ✓ Funcionando correctamente</p>
                        </div>
                    </div>
                </div>
            `
        }, (error, info) => {
            if (error) {
                console.log('❌ ERROR AL ENVIAR:', error.message);
            } else {
                console.log('✅ EMAIL ENVIADO!');
                console.log('   ID:', info.messageId);
                console.log('\n📬 Revisa:', EMAIL_USER, '\n');
            }
            process.exit(0);
        });
    }
});
