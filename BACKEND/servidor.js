const express = require('express');
const cors = require('cors');
const { client, connect, close } = require('./connection'); // Importa el cliente y las funciones
const crypto = require('crypto');
const usuariosRouter = require('./usuarios');
const carpetasRouter = require('./carpetas');
const archivosRouter = require('./archivos');
const app = express();
const port = 3010;

app.use(cors());
app.use(express.json()); 


app.use('/usuarios', usuariosRouter(client)); 
app.use('/carpetas',carpetasRouter(client));
app.use('/archivos',archivosRouter(client));
// Ruta para autenticar usuario
app.post('/connect', async (req, res) => {
  connect();
  const { username, password } = req.body;
  const hashedPassword = crypto.createHash('md5').update(password).digest('hex');


  const db = client.db('sistemaarchivos');
  const usuariosCollection = db.collection('usuarios');

  try {
    // Busca al usuario en la colección 'usuarios'
    const usuario = await usuariosCollection.findOne({ username, password: hashedPassword });

    if (usuario) {
      console.log('Usuario autenticado');
      res.status(200).json(usuario);
    } else {
      res.status(404).send('Usuario no encontrado');
    }
  } catch (err) {
    res.status(500).send('Error al conectar a MongoDB: ' + err.message);
  }
});

// Función para cerrar todas las conexiones
async function closeAllConnections() {
  await close(); // Cierra la conexión de MongoDB
}

// Ruta para desconectar todos los clientes
app.post('/disconnect', async (req, res) => {
  try {
    await closeAllConnections();
    res.status(200).send('Conexión a MongoDB cerrada');
  } catch (err) {
    res.status(500).send('Error al cerrar conexiones: ' + err.message);
  }
});

// Maneja el cierre de la conexión al detener el servidor
process.on('SIGINT', async () => {
  await closeAllConnections();
  process.exit(0); // Salir de manera segura cuando se interrumpa el servidor
});

app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});
