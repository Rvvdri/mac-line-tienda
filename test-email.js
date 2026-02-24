// test-email.js - Probar que nodemailer funciona

const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'linemac910@gmail.com',
        pass: 'kqlxbwylmztcipco'
    }
});

console.log('📧 Probando envío de email...');

const mailOptions = {
    from: '"MAC LINE" <linemac910@gmail.com>',
    to: 'linemac910@gmail.com',
    subject: '🧪 Test de Email - MAC LINE',
    html: `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px; }
                .content { background: white; padding: 30px; border: 1px solid #eee; margin-top: 20px; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🖥️ MAC LINE</h1>
                    <h2>✅ ¡Test Exitoso!</h2>
                </div>
                <div class="content">
                    <p>Si estás viendo este email, significa que:</p>
                    <ul>
                        <li>✅ Nodemailer está instalado correctamente</li>
                        <li>✅ Las credenciales de Gmail funcionan</li>
                        <li>✅ Los emails se enviarán automáticamente cuando haya ventas</li>
                    </ul>
                    <p><strong>¡Todo listo para recibir notificaciones de ventas!</strong></p>
                    <p style="color: #666; margin-top: 30px;">
                        <small>Fecha de prueba: ${new Date().toLocaleString('es-CL')}</small>
                    </p>
                </div>
            </div>
        </body>
        </html>
    `
};

transporter.sendMail(mailOptions)
    .then(() => {
        console.log('✅ Email enviado correctamente a: linemac910@gmail.com');
        console.log('📬 Revisa tu bandeja de entrada (o spam)');
        process.exit(0);
    })
    .catch(error => {
        console.error('❌ Error al enviar email:');
        console.error('   Error:', error.message);
        console.error('   Código:', error.code);
        console.error('');
        console.error('💡 Posibles soluciones:');
        console.error('   1. Verificar que la contraseña de aplicación sea correcta');
        console.error('   2. Activar verificación en 2 pasos en Google');
        console.error('   3. Crear nueva contraseña de aplicación en:');
        console.error('      https://myaccount.google.com/apppasswords');
        process.exit(1);
    });
