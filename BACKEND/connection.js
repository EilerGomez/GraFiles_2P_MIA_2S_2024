const { MongoClient } = require('mongodb');

const uri = 'mongodb://usuarioProyecto2MIA2024:up2mia@mongo:27017/sistemaarchivos?authSource=admin';
const client = new MongoClient(uri);

async function connect() {
  try {
    await client.connect();
    console.log('Conectado a MongoDB');
  } catch (err) {
    console.error('Error al conectar a MongoDB:', err.message);
  }
}

// Función para cerrar la conexión
async function close() {
  try {
    await client.close();
    console.log('Conexión a MongoDB cerrada');
  } catch (err) {
    console.error('Error al cerrar la conexión:', err.message);
  }
}

module.exports = { client, connect, close };
