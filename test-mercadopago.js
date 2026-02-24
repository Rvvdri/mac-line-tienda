// test-mercadopago.js - Probar que Mercado Pago funciona

const { MercadoPagoConfig, Preference } = require('mercadopago');

const client = new MercadoPagoConfig({ 
    accessToken: 'APP_USR-1539674871672378-021917-5d3634d0ef2f478d31ea2f5db8abeb5d-3208244091'
});

console.log('🔧 Probando Mercado Pago...');

const preference = new Preference(client);

const body = {
    items: [
        {
            title: 'Test Product',
            unit_price: 10000,
            quantity: 1,
            currency_id: 'CLP'
        }
    ],
    payer: {
        name: 'Test User',
        email: 'test@test.com',
        phone: {
            number: '123456789'
        },
        address: {
            street_name: 'Test 123'
        }
    },
    back_urls: {
        success: 'http://localhost:3000/pago-exitoso',
        failure: 'http://localhost:3000/pago-fallido',
        pending: 'http://localhost:3000/pago-pendiente'
    }
};

preference.create({ body })
    .then(response => {
        console.log('✅ ¡FUNCIONA! Preferencia creada:', response.id);
        console.log('🔗 URL de pago:', response.init_point);
        process.exit(0);
    })
    .catch(error => {
        console.error('❌ ERROR:', error.message);
        console.error('❌ Detalles:', error);
        process.exit(1);
    });
