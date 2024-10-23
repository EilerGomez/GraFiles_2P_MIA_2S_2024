const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const crypto = require('crypto');

function carpetasRouter(client) {
    const router = express.Router();
    const db = client.db('sistemaarchivos');
    const collection = db.collection('ficheros');

    // AGREGAR NUEVA CARPETA
    router.post('/', async (req, res) => {
        const { nombre, idU, ficheroMadre } = req.body;
    
        if (!nombre || !idU || !ficheroMadre) {
            return res.status(400).send('Todos los campos son obligatorios');
        }
        try {
            const carpetaAnt = await collection.findOne({ nombre: nombre, id_fichero_madre: ficheroMadre });
            if (carpetaAnt) {
                return res.status(400).send("No se permiten nombres duplicados en un mismo directorio");
            }
    
            const result = await collection.insertOne({ nombre: nombre, fechamod: new Date(), id_usuario: idU, id_fichero_madre: ficheroMadre });
            const nuevaCarpeta = await collection.findOne({ _id: result.insertedId });
            res.status(201).json(nuevaCarpeta);
    
        } catch (err) {
            res.status(500).send('Error al insertar la carpeta: ' + err.message);
        }
    });
    

    // OBTENER LA CARPETA RAIZ
    router.get('/carpeta-raiz', async (req, res) => {
        try {
            const carpeta = await collection.findOne({idUnic:0});
            res.status(200).json(carpeta);
        } catch (err) {
            res.status(500).send('Error al obtener la carpeta raiz: ' + err.message);
        }
    });

    // OBTENER LA CARPETA COMPARTIDA
    router.get('/carpeta-compartida', async (req, res) => {
        try {
            const carpeta = await collection.find({idUnic:1});
            res.status(200).json(carpeta);
        } catch (err) {
            res.status(500).send('Error al obtener la carpeta compartida: ' + err.message);
        }
    });

    // OBTENER CARPETAS O FICHEROS DE una carpeta
    router.get('/:idU/:idC', async (req, res) => {
        const { idU,idC } = req.params;
        try {
            const carpetas = await collection.find({ id_fichero_madre:idC, id_usuario:idU}).toArray();
            res.status(200).json(carpetas);
        } catch (err) {
            res.status(500).send('Error al obtener el carpetas: ' + err.message);
        }
    });

    // ACTUALIZAR UN USUARIO
    router.put('/:id', async (req, res) => {
        const { id } = req.params;
        const { username, nombre, password, rol } = req.body;

        if (!username || !nombre || !password || !rol) {
            return res.status(400).send('Todos los campos son obligatorios');
        }
        const passwordEncriptada = crypto.createHash('md5').update(password).digest('hex');

        try {
            const result = await collection.updateOne(
                { _id: new ObjectId(id) },
                { $set: { username, nombre, password:passwordEncriptada, rol } }
            );

            if (result.matchedCount === 0) {
                return res.status(404).send('Usuario no encontrado');
            }

            res.status(200).json(id);
        } catch (err) {
            res.status(500).send('Error al actualizar el usuario: ' + err.message);
        }
    });

    // ELIMINAR UN USUARIO
    router.delete('/:id', async (req, res) => {
        const { id } = req.params;

        try {
            const result = await collection.deleteOne({ _id: new ObjectId(id) });
            if (result.deletedCount === 0) {
                return res.status(404).send('Usuario no encontrado');
            }
            res.status(200).send('Usuario eliminado correctamente');
        } catch (err) {
            res.status(500).send('Error al eliminar el usuario: ' + err.message);
        }
    });

    // Ruta para actualizar la contraseña
    router.put('/update-password/:id', async (req, res) => {
        const { id } = req.params;
        const { oldPassword, newPassword } = req.body;

        if (!oldPassword || !newPassword) {
            return res.status(400).send('Ambos campos son obligatorios');
        }

        // Encriptar la contraseña anterior
        const oldPasswordEncrypted = crypto.createHash('md5').update(oldPassword).digest('hex');
        // Encriptar la nueva contraseña
        const newPasswordEncrypted = crypto.createHash('md5').update(newPassword).digest('hex');

        try {
        // Actualizar la contraseña si la contraseña anterior es correcta
          const result = await collection.updateOne(
            {
                _id: new ObjectId(id),
                password: oldPasswordEncrypted // Verifica la contraseña anterior
            },
            {
                $set: { password: newPasswordEncrypted } // Actualiza la nueva contraseña
            }
        );

        if (result.matchedCount === 0) {
            return res.status(401).send('Contraseña anterior incorrecta o usuario no encontrado');
        }

        res.status(200).json(newPassword);
        } catch (err) {
        res.status(500).send('Error al actualizar la contraseña: ' + err.message);
        }
    });

    return router;

    
}

module.exports = carpetasRouter;
