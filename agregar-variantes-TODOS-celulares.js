const { MongoClient } = require('mongodb');

const MONGODB_URI = 'mongodb+srv://rvvdri:9j8rdlLqR4ACotdY@cluster0.vptvpzv.mongodb.net/macline';

/**
 * VARIANTES PARA TODOS LOS CELULARES
 * ===================================
 * Este script agrega colores y capacidades a TODOS los 62 celulares
 */

const celularesConVariantes = [
    // ========== IPHONES (13 modelos) ==========
    {
        nombre: 'iPhone 17 Pro Max',
        precioBase: 1549990,
        colores: [
            { nombre: 'Titanio Natural', hex: '#8A8A8D' },
            { nombre: 'Titanio Azul', hex: '#2F4F72' },
            { nombre: 'Titanio Blanco', hex: '#E3E4E5' },
            { nombre: 'Titanio Negro', hex: '#3B3B3B' }
        ],
        capacidades: [
            { capacidad: '128GB', incremento: 0 },
            { capacidad: '256GB', incremento: 150000 },
            { capacidad: '512GB', incremento: 300000 },
            { capacidad: '1TB', incremento: 500000 }
        ]
    },
    {
        nombre: 'iPhone 17 Pro',
        precioBase: 1349990,
        colores: [
            { nombre: 'Titanio Natural', hex: '#8A8A8D' },
            { nombre: 'Titanio Azul', hex: '#2F4F72' },
            { nombre: 'Titanio Blanco', hex: '#E3E4E5' },
            { nombre: 'Titanio Negro', hex: '#3B3B3B' }
        ],
        capacidades: [
            { capacidad: '128GB', incremento: 0 },
            { capacidad: '256GB', incremento: 150000 },
            { capacidad: '512GB', incremento: 300000 },
            { capacidad: '1TB', incremento: 500000 }
        ]
    },
    {
        nombre: 'iPhone 17 Plus',
        precioBase: 1199990,
        colores: [
            { nombre: 'Ultramarino', hex: '#2F4F72' },
            { nombre: 'Verde Azulado', hex: '#4A8B8B' },
            { nombre: 'Rosa', hex: '#E8A0A0' },
            { nombre: 'Blanco', hex: '#F5F5F5' },
            { nombre: 'Negro', hex: '#2C2C2C' }
        ],
        capacidades: [
            { capacidad: '128GB', incremento: 0 },
            { capacidad: '256GB', incremento: 130000 },
            { capacidad: '512GB', incremento: 260000 }
        ]
    },
    {
        nombre: 'iPhone 17',
        precioBase: 999990,
        colores: [
            { nombre: 'Ultramarino', hex: '#2F4F72' },
            { nombre: 'Verde Azulado', hex: '#4A8B8B' },
            { nombre: 'Rosa', hex: '#E8A0A0' },
            { nombre: 'Blanco', hex: '#F5F5F5' },
            { nombre: 'Negro', hex: '#2C2C2C' }
        ],
        capacidades: [
            { capacidad: '128GB', incremento: 0 },
            { capacidad: '256GB', incremento: 130000 },
            { capacidad: '512GB', incremento: 260000 }
        ]
    },
    {
        nombre: 'iPhone 16 Pro Max',
        precioBase: 1449990,
        colores: [
            { nombre: 'Titanio Natural', hex: '#8A8A8D' },
            { nombre: 'Titanio Azul', hex: '#2F4F72' },
            { nombre: 'Titanio Blanco', hex: '#E3E4E5' },
            { nombre: 'Titanio Negro', hex: '#3B3B3B' },
            { nombre: 'Titanio Desierto', hex: '#C9B18F' }
        ],
        capacidades: [
            { capacidad: '256GB', incremento: 0 },
            { capacidad: '512GB', incremento: 200000 },
            { capacidad: '1TB', incremento: 400000 }
        ]
    },
    {
        nombre: 'iPhone 16 Pro',
        precioBase: 1249990,
        colores: [
            { nombre: 'Titanio Natural', hex: '#8A8A8D' },
            { nombre: 'Titanio Azul', hex: '#2F4F72' },
            { nombre: 'Titanio Blanco', hex: '#E3E4E5' },
            { nombre: 'Titanio Negro', hex: '#3B3B3B' },
            { nombre: 'Titanio Desierto', hex: '#C9B18F' }
        ],
        capacidades: [
            { capacidad: '128GB', incremento: 0 },
            { capacidad: '256GB', incremento: 150000 },
            { capacidad: '512GB', incremento: 300000 },
            { capacidad: '1TB', incremento: 500000 }
        ]
    },
    {
        nombre: 'iPhone 16 Plus',
        precioBase: 1099990,
        colores: [
            { nombre: 'Ultramarino', hex: '#2F4F72' },
            { nombre: 'Verde Azulado', hex: '#4A8B8B' },
            { nombre: 'Rosa', hex: '#E8A0A0' },
            { nombre: 'Blanco', hex: '#F5F5F5' },
            { nombre: 'Negro', hex: '#2C2C2C' }
        ],
        capacidades: [
            { capacidad: '128GB', incremento: 0 },
            { capacidad: '256GB', incremento: 130000 },
            { capacidad: '512GB', incremento: 260000 }
        ]
    },
    {
        nombre: 'iPhone 16',
        precioBase: 899990,
        colores: [
            { nombre: 'Ultramarino', hex: '#2F4F72' },
            { nombre: 'Verde Azulado', hex: '#4A8B8B' },
            { nombre: 'Rosa', hex: '#E8A0A0' },
            { nombre: 'Blanco', hex: '#F5F5F5' },
            { nombre: 'Negro', hex: '#2C2C2C' }
        ],
        capacidades: [
            { capacidad: '128GB', incremento: 0 },
            { capacidad: '256GB', incremento: 130000 },
            { capacidad: '512GB', incremento: 260000 }
        ]
    },
    {
        nombre: 'iPhone 15 Pro Max',
        precioBase: 1349990,
        colores: [
            { nombre: 'Titanio Azul', hex: '#2F4F72' },
            { nombre: 'Titanio Natural', hex: '#8A8A8D' },
            { nombre: 'Titanio Blanco', hex: '#E3E4E5' },
            { nombre: 'Titanio Negro', hex: '#3B3B3B' }
        ],
        capacidades: [
            { capacidad: '256GB', incremento: 0 },
            { capacidad: '512GB', incremento: 200000 },
            { capacidad: '1TB', incremento: 400000 }
        ]
    },
    {
        nombre: 'iPhone 15 Pro',
        precioBase: 1149990,
        colores: [
            { nombre: 'Titanio Azul', hex: '#2F4F72' },
            { nombre: 'Titanio Natural', hex: '#8A8A8D' },
            { nombre: 'Titanio Blanco', hex: '#E3E4E5' },
            { nombre: 'Titanio Negro', hex: '#3B3B3B' }
        ],
        capacidades: [
            { capacidad: '128GB', incremento: 0 },
            { capacidad: '256GB', incremento: 140000 },
            { capacidad: '512GB', incremento: 280000 },
            { capacidad: '1TB', incremento: 450000 }
        ]
    },
    {
        nombre: 'iPhone 15 Plus',
        precioBase: 999990,
        colores: [
            { nombre: 'Amarillo', hex: '#F8E08E' },
            { nombre: 'Rosa', hex: '#E8A0A0' },
            { nombre: 'Azul', hex: '#6B9BCF' },
            { nombre: 'Verde', hex: '#85B09A' },
            { nombre: 'Negro', hex: '#2C2C2C' }
        ],
        capacidades: [
            { capacidad: '128GB', incremento: 0 },
            { capacidad: '256GB', incremento: 120000 },
            { capacidad: '512GB', incremento: 240000 }
        ]
    },
    {
        nombre: 'iPhone 15',
        precioBase: 799990,
        colores: [
            { nombre: 'Rosa', hex: '#E8A0A0' },
            { nombre: 'Azul', hex: '#6B9BCF' },
            { nombre: 'Amarillo', hex: '#F8E08E' },
            { nombre: 'Verde', hex: '#85B09A' },
            { nombre: 'Negro', hex: '#2C2C2C' }
        ],
        capacidades: [
            { capacidad: '128GB', incremento: 0 },
            { capacidad: '256GB', incremento: 120000 },
            { capacidad: '512GB', incremento: 240000 }
        ]
    },
    {
        nombre: 'iPhone 14 Pro Max',
        precioBase: 1249990,
        colores: [
            { nombre: 'Morado Oscuro', hex: '#5F4B66' },
            { nombre: 'Dorado', hex: '#F4DCA5' },
            { nombre: 'Plateado', hex: '#D4D4D4' },
            { nombre: 'Negro Espacial', hex: '#2C2C2C' }
        ],
        capacidades: [
            { capacidad: '128GB', incremento: 0 },
            { capacidad: '256GB', incremento: 140000 },
            { capacidad: '512GB', incremento: 280000 },
            { capacidad: '1TB', incremento: 450000 }
        ]
    },
    {
        nombre: 'iPhone 14 Pro',
        precioBase: 1049990,
        colores: [
            { nombre: 'Negro Espacial', hex: '#2C2C2C' },
            { nombre: 'Dorado', hex: '#F4DCA5' },
            { nombre: 'Plateado', hex: '#D4D4D4' },
            { nombre: 'Morado Oscuro', hex: '#5F4B66' }
        ],
        capacidades: [
            { capacidad: '128GB', incremento: 0 },
            { capacidad: '256GB', incremento: 140000 },
            { capacidad: '512GB', incremento: 280000 },
            { capacidad: '1TB', incremento: 450000 }
        ]
    },

    // ========== SAMSUNG GALAXY S SERIES (6 modelos) ==========
    {
        nombre: 'Samsung Galaxy S25 Ultra',
        precioBase: 1299990,
        colores: [
            { nombre: 'Titanio Negro', hex: '#2C2C2C' },
            { nombre: 'Titanio Gris', hex: '#8A8A8D' },
            { nombre: 'Titanio Violeta', hex: '#8B7FA8' },
            { nombre: 'Titanio Amarillo', hex: '#E8D08F' }
        ],
        capacidades: [
            { capacidad: '256GB', incremento: 0 },
            { capacidad: '512GB', incremento: 200000 },
            { capacidad: '1TB', incremento: 400000 }
        ]
    },
    {
        nombre: 'Samsung Galaxy S25+',
        precioBase: 1099990,
        colores: [
            { nombre: 'Negro', hex: '#2C2C2C' },
            { nombre: 'Gris', hex: '#8A8A8D' },
            { nombre: 'Violeta', hex: '#8B7FA8' },
            { nombre: 'Crema', hex: '#F5E6D3' }
        ],
        capacidades: [
            { capacidad: '256GB', incremento: 0 },
            { capacidad: '512GB', incremento: 180000 }
        ]
    },
    {
        nombre: 'Samsung Galaxy S25',
        precioBase: 899990,
        colores: [
            { nombre: 'Negro', hex: '#2C2C2C' },
            { nombre: 'Azul', hex: '#4A6FA5' },
            { nombre: 'Violeta', hex: '#8B7FA8' },
            { nombre: 'Plateado', hex: '#C0C0C0' }
        ],
        capacidades: [
            { capacidad: '128GB', incremento: 0 },
            { capacidad: '256GB', incremento: 150000 },
            { capacidad: '512GB', incremento: 280000 }
        ]
    },
    {
        nombre: 'Samsung Galaxy S24 Ultra',
        precioBase: 1199990,
        colores: [
            { nombre: 'Titanio Negro', hex: '#2C2C2C' },
            { nombre: 'Titanio Gris', hex: '#8A8A8D' },
            { nombre: 'Titanio Violeta', hex: '#8B7FA8' },
            { nombre: 'Titanio Amarillo', hex: '#E8D08F' }
        ],
        capacidades: [
            { capacidad: '256GB', incremento: 0 },
            { capacidad: '512GB', incremento: 200000 },
            { capacidad: '1TB', incremento: 400000 }
        ]
    },
    {
        nombre: 'Samsung Galaxy S24+',
        precioBase: 999990,
        colores: [
            { nombre: 'Negro', hex: '#2C2C2C' },
            { nombre: 'Gris', hex: '#8A8A8D' },
            { nombre: 'Violeta', hex: '#8B7FA8' },
            { nombre: 'Amarillo', hex: '#E8D08F' }
        ],
        capacidades: [
            { capacidad: '256GB', incremento: 0 },
            { capacidad: '512GB', incremento: 180000 }
        ]
    },
    {
        nombre: 'Samsung Galaxy S24',
        precioBase: 799990,
        colores: [
            { nombre: 'Negro', hex: '#2C2C2C' },
            { nombre: 'Gris', hex: '#8A8A8D' },
            { nombre: 'Violeta', hex: '#8B7FA8' },
            { nombre: 'Amarillo', hex: '#E8D08F' }
        ],
        capacidades: [
            { capacidad: '128GB', incremento: 0 },
            { capacidad: '256GB', incremento: 150000 },
            { capacidad: '512GB', incremento: 280000 }
        ]
    },

    // ========== SAMSUNG Z SERIES (6 modelos) ==========
    {
        nombre: 'Samsung Galaxy Z Fold 6',
        precioBase: 1899990,
        colores: [
            { nombre: 'Azul Marino', hex: '#1C3A52' },
            { nombre: 'Rosa', hex: '#E8A0A0' },
            { nombre: 'Plata', hex: '#C0C0C0' }
        ],
        capacidades: [
            { capacidad: '256GB', incremento: 0 },
            { capacidad: '512GB', incremento: 200000 },
            { capacidad: '1TB', incremento: 400000 }
        ]
    },
    {
        nombre: 'Samsung Galaxy Z Flip 6',
        precioBase: 1099990,
        colores: [
            { nombre: 'Azul', hex: '#4A6FA5' },
            { nombre: 'Amarillo', hex: '#F4E4A6' },
            { nombre: 'Verde Menta', hex: '#A8D5BA' },
            { nombre: 'Plata', hex: '#C0C0C0' }
        ],
        capacidades: [
            { capacidad: '256GB', incremento: 0 },
            { capacidad: '512GB', incremento: 150000 }
        ]
    },
    {
        nombre: 'Samsung Galaxy Z Fold 5',
        precioBase: 1699990,
        colores: [
            { nombre: 'Crema', hex: '#F5E6D3' },
            { nombre: 'Negro Fantasma', hex: '#2C2C2C' },
            { nombre: 'Azul Helado', hex: '#A8C5E0' }
        ],
        capacidades: [
            { capacidad: '256GB', incremento: 0 },
            { capacidad: '512GB', incremento: 200000 },
            { capacidad: '1TB', incremento: 400000 }
        ]
    },
    {
        nombre: 'Samsung Galaxy Z Flip 5',
        precioBase: 999990,
        colores: [
            { nombre: 'Lavanda', hex: '#C8B8DB' },
            { nombre: 'Crema', hex: '#F5E6D3' },
            { nombre: 'Verde Menta', hex: '#A8D5BA' },
            { nombre: 'Grafito', hex: '#5A5A5A' }
        ],
        capacidades: [
            { capacidad: '256GB', incremento: 0 },
            { capacidad: '512GB', incremento: 150000 }
        ]
    },
    {
        nombre: 'Samsung Galaxy Z Fold 4',
        precioBase: 1499990,
        colores: [
            { nombre: 'Beige', hex: '#D4C5B0' },
            { nombre: 'Negro Fantasma', hex: '#2C2C2C' },
            { nombre: 'Gris Verde', hex: '#7A8B8B' }
        ],
        capacidades: [
            { capacidad: '256GB', incremento: 0 },
            { capacidad: '512GB', incremento: 200000 }
        ]
    },
    {
        nombre: 'Samsung Galaxy Z Flip 4',
        precioBase: 899990,
        colores: [
            { nombre: 'Púrpura Bora', hex: '#A07CBF' },
            { nombre: 'Grafito', hex: '#5A5A5A' },
            { nombre: 'Rosa Dorado', hex: '#E8B4A0' },
            { nombre: 'Azul', hex: '#6B9BCF' }
        ],
        capacidades: [
            { capacidad: '128GB', incremento: 0 },
            { capacidad: '256GB', incremento: 130000 },
            { capacidad: '512GB', incremento: 250000 }
        ]
    },

    // ========== SAMSUNG A SERIES (6 modelos) ==========
    {
        nombre: 'Samsung Galaxy A55',
        precioBase: 399990,
        colores: [
            { nombre: 'Azul Marino', hex: '#1C3A52' },
            { nombre: 'Violeta Claro', hex: '#C8B8DB' },
            { nombre: 'Negro', hex: '#2C2C2C' }
        ],
        capacidades: [
            { capacidad: '128GB', incremento: 0 },
            { capacidad: '256GB', incremento: 80000 }
        ]
    },
    {
        nombre: 'Samsung Galaxy A35',
        precioBase: 299990,
        colores: [
            { nombre: 'Azul', hex: '#4A6FA5' },
            { nombre: 'Lavanda', hex: '#C8B8DB' },
            { nombre: 'Negro', hex: '#2C2C2C' }
        ],
        capacidades: [
            { capacidad: '128GB', incremento: 0 },
            { capacidad: '256GB', incremento: 70000 }
        ]
    },
    {
        nombre: 'Samsung Galaxy A25',
        precioBase: 249990,
        colores: [
            { nombre: 'Azul Claro', hex: '#A8C5E0' },
            { nombre: 'Amarillo', hex: '#F4E4A6' },
            { nombre: 'Negro', hex: '#2C2C2C' }
        ],
        capacidades: [
            { capacidad: '128GB', incremento: 0 },
            { capacidad: '256GB', incremento: 60000 }
        ]
    },
    {
        nombre: 'Samsung Galaxy A15',
        precioBase: 179990,
        colores: [
            { nombre: 'Azul', hex: '#4A6FA5' },
            { nombre: 'Negro', hex: '#2C2C2C' },
            { nombre: 'Amarillo Claro', hex: '#F4E4A6' }
        ],
        capacidades: [
            { capacidad: '128GB', incremento: 0 },
            { capacidad: '256GB', incremento: 50000 }
        ]
    },
    {
        nombre: 'Samsung Galaxy A54',
        precioBase: 369990,
        colores: [
            { nombre: 'Verde Limón', hex: '#B5D99C' },
            { nombre: 'Violeta', hex: '#8B7FA8' },
            { nombre: 'Negro', hex: '#2C2C2C' },
            { nombre: 'Blanco', hex: '#F5F5F5' }
        ],
        capacidades: [
            { capacidad: '128GB', incremento: 0 },
            { capacidad: '256GB', incremento: 80000 }
        ]
    },
    {
        nombre: 'Samsung Galaxy A34',
        precioBase: 289990,
        colores: [
            { nombre: 'Verde Limón', hex: '#B5D99C' },
            { nombre: 'Violeta', hex: '#8B7FA8' },
            { nombre: 'Negro', hex: '#2C2C2C' },
            { nombre: 'Plata', hex: '#C0C0C0' }
        ],
        capacidades: [
            { capacidad: '128GB', incremento: 0 },
            { capacidad: '256GB', incremento: 70000 }
        ]
    },

    // ========== XIAOMI (16 modelos) ==========
    {
        nombre: 'Xiaomi 15 Ultra',
        precioBase: 899990,
        colores: [
            { nombre: 'Negro', hex: '#2C2C2C' },
            { nombre: 'Blanco', hex: '#F5F5F5' },
            { nombre: 'Azul', hex: '#4A6FA5' }
        ],
        capacidades: [
            { capacidad: '256GB', incremento: 0 },
            { capacidad: '512GB', incremento: 150000 },
            { capacidad: '1TB', incremento: 300000 }
        ]
    },
    {
        nombre: 'Xiaomi 15 Pro',
        precioBase: 749990,
        colores: [
            { nombre: 'Negro', hex: '#2C2C2C' },
            { nombre: 'Blanco', hex: '#F5F5F5' },
            { nombre: 'Verde', hex: '#85B09A' }
        ],
        capacidades: [
            { capacidad: '256GB', incremento: 0 },
            { capacidad: '512GB', incremento: 130000 }
        ]
    },
    {
        nombre: 'Xiaomi 15',
        precioBase: 649990,
        colores: [
            { nombre: 'Negro', hex: '#2C2C2C' },
            { nombre: 'Blanco', hex: '#F5F5F5' },
            { nombre: 'Azul', hex: '#4A6FA5' }
        ],
        capacidades: [
            { capacidad: '128GB', incremento: 0 },
            { capacidad: '256GB', incremento: 100000 },
            { capacidad: '512GB', incremento: 200000 }
        ]
    },
    {
        nombre: 'Xiaomi 14 Ultra',
        precioBase: 799990,
        colores: [
            { nombre: 'Negro', hex: '#2C2C2C' },
            { nombre: 'Blanco', hex: '#F5F5F5' }
        ],
        capacidades: [
            { capacidad: '512GB', incremento: 0 },
            { capacidad: '1TB', incremento: 200000 }
        ]
    },
    {
        nombre: 'Xiaomi 14 Pro',
        precioBase: 699990,
        colores: [
            { nombre: 'Negro', hex: '#2C2C2C' },
            { nombre: 'Blanco', hex: '#F5F5F5' },
            { nombre: 'Verde', hex: '#85B09A' }
        ],
        capacidades: [
            { capacidad: '256GB', incremento: 0 },
            { capacidad: '512GB', incremento: 130000 }
        ]
    },
    {
        nombre: 'Xiaomi 14',
        precioBase: 599990,
        colores: [
            { nombre: 'Negro', hex: '#2C2C2C' },
            { nombre: 'Blanco', hex: '#F5F5F5' },
            { nombre: 'Verde', hex: '#85B09A' }
        ],
        capacidades: [
            { capacidad: '256GB', incremento: 0 },
            { capacidad: '512GB', incremento: 120000 }
        ]
    },
    {
        nombre: 'Xiaomi 13T Pro',
        precioBase: 599990,
        colores: [
            { nombre: 'Negro', hex: '#2C2C2C' },
            { nombre: 'Azul', hex: '#4A6FA5' },
            { nombre: 'Verde', hex: '#85B09A' }
        ],
        capacidades: [
            { capacidad: '256GB', incremento: 0 },
            { capacidad: '512GB', incremento: 100000 }
        ]
    },
    {
        nombre: 'Xiaomi 13T',
        precioBase: 499990,
        colores: [
            { nombre: 'Negro', hex: '#2C2C2C' },
            { nombre: 'Azul', hex: '#4A6FA5' },
            { nombre: 'Verde', hex: '#85B09A' }
        ],
        capacidades: [
            { capacidad: '256GB', incremento: 0 },
            { capacidad: '512GB', incremento: 90000 }
        ]
    },
    {
        nombre: 'Xiaomi 13 Pro',
        precioBase: 749990,
        colores: [
            { nombre: 'Negro', hex: '#2C2C2C' },
            { nombre: 'Blanco', hex: '#F5F5F5' },
            { nombre: 'Verde', hex: '#85B09A' }
        ],
        capacidades: [
            { capacidad: '256GB', incremento: 0 },
            { capacidad: '512GB', incremento: 120000 }
        ]
    },
    {
        nombre: 'Xiaomi 13',
        precioBase: 649990,
        colores: [
            { nombre: 'Negro', hex: '#2C2C2C' },
            { nombre: 'Blanco', hex: '#F5F5F5' },
            { nombre: 'Azul', hex: '#4A6FA5' }
        ],
        capacidades: [
            { capacidad: '256GB', incremento: 0 },
            { capacidad: '512GB', incremento: 110000 }
        ]
    },
    {
        nombre: 'Xiaomi Redmi Note 13 Pro+',
        precioBase: 359990,
        colores: [
            { nombre: 'Negro', hex: '#2C2C2C' },
            { nombre: 'Azul', hex: '#4A6FA5' },
            { nombre: 'Morado', hex: '#8B7FA8' }
        ],
        capacidades: [
            { capacidad: '256GB', incremento: 0 },
            { capacidad: '512GB', incremento: 70000 }
        ]
    },
    {
        nombre: 'Xiaomi Redmi Note 13 Pro',
        precioBase: 299990,
        colores: [
            { nombre: 'Negro', hex: '#2C2C2C' },
            { nombre: 'Azul', hex: '#4A6FA5' },
            { nombre: 'Morado', hex: '#8B7FA8' }
        ],
        capacidades: [
            { capacidad: '128GB', incremento: 0 },
            { capacidad: '256GB', incremento: 60000 }
        ]
    },
    {
        nombre: 'Xiaomi Redmi Note 13',
        precioBase: 229990,
        colores: [
            { nombre: 'Negro', hex: '#2C2C2C' },
            { nombre: 'Azul', hex: '#4A6FA5' },
            { nombre: 'Verde', hex: '#85B09A' }
        ],
        capacidades: [
            { capacidad: '128GB', incremento: 0 },
            { capacidad: '256GB', incremento: 50000 }
        ]
    },
    {
        nombre: 'Xiaomi Poco X6 Pro',
        precioBase: 379990,
        colores: [
            { nombre: 'Negro', hex: '#2C2C2C' },
            { nombre: 'Amarillo', hex: '#F4E4A6' },
            { nombre: 'Gris', hex: '#8A8A8D' }
        ],
        capacidades: [
            { capacidad: '256GB', incremento: 0 },
            { capacidad: '512GB', incremento: 70000 }
        ]
    },
    {
        nombre: 'Xiaomi Poco X6',
        precioBase: 299990,
        colores: [
            { nombre: 'Negro', hex: '#2C2C2C' },
            { nombre: 'Azul', hex: '#4A6FA5' },
            { nombre: 'Amarillo', hex: '#F4E4A6' }
        ],
        capacidades: [
            { capacidad: '256GB', incremento: 0 },
            { capacidad: '512GB', incremento: 60000 }
        ]
    },
    {
        nombre: 'Xiaomi Poco F6 Pro',
        precioBase: 499990,
        colores: [
            { nombre: 'Negro', hex: '#2C2C2C' },
            { nombre: 'Blanco', hex: '#F5F5F5' },
            { nombre: 'Verde', hex: '#85B09A' }
        ],
        capacidades: [
            { capacidad: '256GB', incremento: 0 },
            { capacidad: '512GB', incremento: 80000 }
        ]
    },

    // ========== HUAWEI (8 modelos) ==========
    {
        nombre: 'Huawei Pura 70 Ultra',
        precioBase: 1199990,
        colores: [
            { nombre: 'Negro', hex: '#2C2C2C' },
            { nombre: 'Verde', hex: '#85B09A' },
            { nombre: 'Blanco', hex: '#F5F5F5' }
        ],
        capacidades: [
            { capacidad: '512GB', incremento: 0 },
            { capacidad: '1TB', incremento: 200000 }
        ]
    },
    {
        nombre: 'Huawei Pura 70 Pro',
        precioBase: 999990,
        colores: [
            { nombre: 'Negro', hex: '#2C2C2C' },
            { nombre: 'Blanco', hex: '#F5F5F5' },
            { nombre: 'Rosa', hex: '#E8A0A0' }
        ],
        capacidades: [
            { capacidad: '512GB', incremento: 0 }
        ]
    },
    {
        nombre: 'Huawei Pura 70',
        precioBase: 799990,
        colores: [
            { nombre: 'Negro', hex: '#2C2C2C' },
            { nombre: 'Blanco', hex: '#F5F5F5' },
            { nombre: 'Verde', hex: '#85B09A' }
        ],
        capacidades: [
            { capacidad: '256GB', incremento: 0 },
            { capacidad: '512GB', incremento: 150000 }
        ]
    },
    {
        nombre: 'Huawei Mate 60 Pro+',
        precioBase: 1399990,
        colores: [
            { nombre: 'Negro', hex: '#2C2C2C' },
            { nombre: 'Blanco', hex: '#F5F5F5' }
        ],
        capacidades: [
            { capacidad: '512GB', incremento: 0 },
            { capacidad: '1TB', incremento: 250000 }
        ]
    },
    {
        nombre: 'Huawei Mate 60 Pro',
        precioBase: 1199990,
        colores: [
            { nombre: 'Negro', hex: '#2C2C2C' },
            { nombre: 'Morado', hex: '#8B7FA8' },
            { nombre: 'Blanco', hex: '#F5F5F5' }
        ],
        capacidades: [
            { capacidad: '512GB', incremento: 0 }
        ]
    },
    {
        nombre: 'Huawei P60 Pro',
        precioBase: 899990,
        colores: [
            { nombre: 'Negro', hex: '#2C2C2C' },
            { nombre: 'Dorado', hex: '#D4AF37' },
            { nombre: 'Blanco', hex: '#F5F5F5' }
        ],
        capacidades: [
            { capacidad: '256GB', incremento: 0 },
            { capacidad: '512GB', incremento: 150000 }
        ]
    },
    {
        nombre: 'Huawei P60',
        precioBase: 699990,
        colores: [
            { nombre: 'Negro', hex: '#2C2C2C' },
            { nombre: 'Azul', hex: '#4A6FA5' },
            { nombre: 'Blanco', hex: '#F5F5F5' }
        ],
        capacidades: [
            { capacidad: '256GB', incremento: 0 },
            { capacidad: '512GB', incremento: 130000 }
        ]
    },
    {
        nombre: 'Huawei Nova 12 Pro',
        precioBase: 549990,
        colores: [
            { nombre: 'Negro', hex: '#2C2C2C' },
            { nombre: 'Verde', hex: '#85B09A' },
            { nombre: 'Morado', hex: '#8B7FA8' }
        ],
        capacidades: [
            { capacidad: '256GB', incremento: 0 },
            { capacidad: '512GB', incremento: 100000 }
        ]
    },

    // ========== HONOR (7 modelos) ==========
    {
        nombre: 'Honor Magic 6 Pro',
        precioBase: 899990,
        colores: [
            { nombre: 'Negro', hex: '#2C2C2C' },
            { nombre: 'Verde', hex: '#85B09A' },
            { nombre: 'Blanco', hex: '#F5F5F5' }
        ],
        capacidades: [
            { capacidad: '512GB', incremento: 0 },
            { capacidad: '1TB', incremento: 200000 }
        ]
    },
    {
        nombre: 'Honor Magic 6',
        precioBase: 749990,
        colores: [
            { nombre: 'Negro', hex: '#2C2C2C' },
            { nombre: 'Azul', hex: '#4A6FA5' },
            { nombre: 'Blanco', hex: '#F5F5F5' }
        ],
        capacidades: [
            { capacidad: '256GB', incremento: 0 },
            { capacidad: '512GB', incremento: 130000 }
        ]
    },
    {
        nombre: 'Honor Magic 5 Pro',
        precioBase: 799990,
        colores: [
            { nombre: 'Negro', hex: '#2C2C2C' },
            { nombre: 'Verde', hex: '#85B09A' },
            { nombre: 'Blanco', hex: '#F5F5F5' }
        ],
        capacidades: [
            { capacidad: '256GB', incremento: 0 },
            { capacidad: '512GB', incremento: 120000 }
        ]
    },
    {
        nombre: 'Honor 90 Pro',
        precioBase: 549990,
        colores: [
            { nombre: 'Negro', hex: '#2C2C2C' },
            { nombre: 'Azul', hex: '#4A6FA5' },
            { nombre: 'Verde', hex: '#85B09A' }
        ],
        capacidades: [
            { capacidad: '256GB', incremento: 0 },
            { capacidad: '512GB', incremento: 100000 }
        ]
    },
    {
        nombre: 'Honor 90',
        precioBase: 449990,
        colores: [
            { nombre: 'Negro', hex: '#2C2C2C' },
            { nombre: 'Plateado', hex: '#C0C0C0' },
            { nombre: 'Verde', hex: '#85B09A' }
        ],
        capacidades: [
            { capacidad: '256GB', incremento: 0 },
            { capacidad: '512GB', incremento: 80000 }
        ]
    },
    {
        nombre: 'Honor X9b',
        precioBase: 349990,
        colores: [
            { nombre: 'Negro', hex: '#2C2C2C' },
            { nombre: 'Naranja', hex: '#FF8C42' },
            { nombre: 'Verde', hex: '#85B09A' }
        ],
        capacidades: [
            { capacidad: '256GB', incremento: 0 },
            { capacidad: '512GB', incremento: 70000 }
        ]
    },
    {
        nombre: 'Honor X8b',
        precioBase: 279990,
        colores: [
            { nombre: 'Negro', hex: '#2C2C2C' },
            { nombre: 'Plateado', hex: '#C0C0C0' },
            { nombre: 'Verde', hex: '#85B09A' }
        ],
        capacidades: [
            { capacidad: '256GB', incremento: 0 },
            { capacidad: '512GB', incremento: 60000 }
        ]
    }
];

async function agregarVariantesTodosLosCelulares() {
    const client = new MongoClient(MONGODB_URI);
    
    try {
        console.log('🔌 Conectando a MongoDB...');
        await client.connect();
        console.log('✅ Conectado\n');
        
        const db = client.db('macline');
        const productosCollection = db.collection('productos');
        
        let actualizados = 0;
        let noEncontrados = [];
        
        console.log('📝 Agregando variantes a TODOS los celulares...\n');
        
        for (const prod of celularesConVariantes) {
            const result = await productosCollection.updateOne(
                { nombre: prod.nombre },
                { 
                    $set: { 
                        precioBase: prod.precioBase,
                        colores: prod.colores,
                        capacidades: prod.capacidades,
                        precio: prod.precioBase
                    } 
                }
            );
            
            if (result.matchedCount > 0) {
                console.log(`✅ ${prod.nombre} (${prod.colores.length} colores, ${prod.capacidades.length} capacidades)`);
                actualizados++;
            } else {
                console.log(`⚠️  ${prod.nombre} - NO ENCONTRADO`);
                noEncontrados.push(prod.nombre);
            }
        }
        
        console.log('\n' + '═'.repeat(80));
        console.log('📊 RESUMEN FINAL:');
        console.log('═'.repeat(80));
        console.log(`✅ Actualizados: ${actualizados} celulares`);
        console.log(`⚠️  No encontrados: ${noEncontrados.length}`);
        console.log('═'.repeat(80));
        
        if (noEncontrados.length > 0) {
            console.log('\n⚠️  PRODUCTOS NO ENCONTRADOS:');
            noEncontrados.forEach(nombre => console.log(`   - ${nombre}`));
        }
        
        console.log('\n💡 Los celulares ahora tienen:');
        console.log('   - precioBase: precio de la capacidad mínima');
        console.log('   - colores: array de colores disponibles con hex');
        console.log('   - capacidades: array de opciones con incrementos de precio');
        
    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await client.close();
        console.log('\n🔌 Desconectado');
    }
}

agregarVariantesTodosLosCelulares();
