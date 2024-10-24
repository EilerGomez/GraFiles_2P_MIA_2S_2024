const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const crypto = require('crypto');

function usuariosRouter(client) {
    const router = express.Router();
    const db = client.db('sistemaarchivos');
    const collection = db.collection('usuarios');

    // AGREGAR NUEVO USUARIO
    router.post('/', async (req, res) => {
        const { username, nombre, password, rol } = req.body;

        if (!username || !nombre || !password || !rol) {
            return res.status(400).send('Todos los campos son obligatorios');
        }
        const passwordEncriptada = crypto.createHash('md5').update(password).digest('hex');

        try {
            const usuarioAnt = await collection.findOne({ username: username });
            if (usuarioAnt) {
                return res.status(400).send("No se permiten usuarios con el mismo username");
            }
            const result = await collection.insertOne({ username, nombre, password:passwordEncriptada, rol });
            const nuevoUsuario = await collection.findOne({ _id: result.insertedId });
            res.status(201).json(nuevoUsuario);
        } catch (err) {
            res.status(500).send('Error al insertar el usuario: ' + err.message);
        }
    });

    // OBTENER TODOS LOS USUARIOS
    router.get('/', async (req, res) => {
        try {
            const usuarios = await collection.find().toArray();
            res.status(200).json(usuarios);
        } catch (err) {
            res.status(500).send('Error al obtener los usuarios: ' + err.message);
        }
    });

    // OBTENER UN USUARIO POR ID
    router.get('/:id', async (req, res) => {
        const { id } = req.params;

        try {
            const usuario = await collection.findOne({ _id: new ObjectId(id) });
            if (!usuario) {
                return res.status(404).send('Usuario no encontrado');
            }
            res.status(200).json(usuario);
        } catch (err) {
            res.status(500).send('Error al obtener el usuario: ' + err.message);
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

module.exports = usuariosRouter;
