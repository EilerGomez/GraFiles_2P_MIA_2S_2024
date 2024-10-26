const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const crypto = require('crypto');

function carpetasRouter(client) {
    const router = express.Router();
    const db = client.db('sistemaarchivos');
    const collection = db.collection('ficheros');
    const collectionArchivos = db.collection('archivos');
    // AGREGAR NUEVA CARPETA
    router.post('/', async (req, res) => {
        const { nombre, idU, ficheroMadre } = req.body;

        if (!nombre || !idU || !ficheroMadre) {
            return res.status(400).send('Todos los campos son obligatorios');
        }
        try {
            const carpetaAnt = await collection.findOne({ nombre: nombre, id_fichero_madre: ficheroMadre, eliminada: false });
            if (carpetaAnt) {
                return res.status(400).send("No se permiten nombres duplicados en un mismo directorio");
            }

            const result = await collection.insertOne({ nombre: nombre, fechamod: new Date(), id_usuario: idU, id_fichero_madre: ficheroMadre, eliminada: false });
            const nuevaCarpeta = await collection.findOne({ _id: result.insertedId });
            res.status(201).json(nuevaCarpeta);

        } catch (err) {
            res.status(500).send('Error al insertar la carpeta: ' + err.message);
        }
    });

    //COPIAR UNA CARPETA A OTRA CARPETA INCLUYENDO SUS ARCHIVOS
    // Función recursiva para copiar una carpeta y sus contenidos
    async function copiarCarpetaRecursivamente(idCarpetaOrigen, idCarpetaDestino, idU) {
        // Obtener la carpeta origen
        const carpetaOrigen = await collection.findOne({ _id: new ObjectId(idCarpetaOrigen), eliminada: false });
        if (!carpetaOrigen) {
            throw new Error('Carpeta de origen no encontrada');
        }

        // Generar un nuevo nombre si existe una carpeta con el mismo nombre en la carpeta destino
        let nuevoNombre = carpetaOrigen.nombre;
        let contador = 1;
        let carpetaAnt = await collection.findOne({ nombre: nuevoNombre, id_fichero_madre: idCarpetaDestino, eliminada: false });


        while (carpetaAnt) {
            nuevoNombre = `${carpetaOrigen.nombre}_${contador}`;
            contador++;
            carpetaAnt = await collection.findOne({ nombre: nuevoNombre, id_fichero_madre: idCarpetaDestino, eliminada: false });
        }



        // Insertar la nueva carpeta en el destino
        const nuevaCarpetaResult = await collection.insertOne({
            nombre: nuevoNombre,
            fechamod: new Date(),
            id_usuario: idU,
            id_fichero_madre: idCarpetaDestino, // La carpeta destino será el nuevo id_fichero_madre
            eliminada: false
        });

        const nuevaCarpeta = nuevaCarpetaResult.insertedId.toString();

        // Copiar los archivos de la carpeta origen a la nueva carpeta
        const archivos = await collectionArchivos.find({ id_fichero_madre: idCarpetaOrigen, eliminado: false }).toArray();
        const nuevasCopiasArchivos = archivos.map(archivo => ({ // aqui aun falta logica para los archivos, no es la informacion de archivos oficial
            nombre: archivo.nombre,
            extension: archivo.extension,
            contenido: archivo.contenido,
            eliminado: archivo.eliminado,
            fechamod: new Date(),
            id_fichero_madre: nuevaCarpeta
        }));

        if (nuevasCopiasArchivos.length > 0) {
            await collectionArchivos.insertMany(nuevasCopiasArchivos);
        }

        // Obtener las subcarpetas de la carpeta origen
        const subcarpetas = await collection.find({ id_fichero_madre: idCarpetaOrigen, eliminada: false }).toArray();

        // Copiar recursivamente las subcarpetas
        for (const subcarpeta of subcarpetas) {
            await copiarCarpetaRecursivamente(subcarpeta._id.toString(), nuevaCarpeta, idU);
        }

        return nuevaCarpeta;
    }

    router.post('/copiar-carpeta/:idFM', async (req, res) => {
        const { idFM } = req.params;
        const { nombre, idU, ficheroMadre } = req.body;

        if (!nombre || !idU || !ficheroMadre) {
            return res.status(400).send('Todos los campos son obligatorios');
        }

        try {
            // Copiar la carpeta recursivamente
            const nuevaCarpetaId = await copiarCarpetaRecursivamente(ficheroMadre, idFM, idU);

            // Obtener la nueva carpeta creada
            const nuevaCarpeta = await collection.findOne({ _id: new ObjectId(nuevaCarpetaId) });

            res.status(201).json(nuevaCarpeta);
        } catch (err) {
            res.status(500).send('Error al copiar la carpeta: ' + err.message);
        }
    });



    // OBTENER LA CARPETA RAIZ
    router.get('/carpeta-raiz', async (req, res) => {
        try {
            const carpeta = await collection.findOne({ idUnic: 0 });
            res.status(200).json(carpeta);
        } catch (err) {
            res.status(500).send('Error al obtener la carpeta raiz: ' + err.message);
        }
    });

    // OBTENER LA CARPETA COMPARTIDA
    router.get('/carpeta-compartida', async (req, res) => {
        try {
            const carpeta = await collection.findOne({ idUnic: 1 });
            res.status(200).json(carpeta);
        } catch (err) {
            res.status(500).send('Error al obtener la carpeta compartida: ' + err.message);
        }
    });

    // OBTENER CARPETAS O FICHEROS DE una carpeta
    router.get('/:idU/:idC', async (req, res) => {
        const { idU, idC } = req.params;
        try {
            const carpetas = await collection.find({ id_fichero_madre: idC, id_usuario: idU, eliminada: false }).sort({ nombre: 1 }).toArray();
            res.status(200).json(carpetas);
        } catch (err) {
            res.status(500).send('Error al obtener el carpetas: ' + err.message);
        }
    });

    // Actualizar el nombre de una carpeta
    router.put('/nombre-actualizar/:id', async (req, res) => {
        const { id } = req.params;
        const { nombre, ficheroMadre } = req.body; // Solo necesitas el nuevo nombre

        if (!nombre || !ficheroMadre) {
            return res.status(400).send('El nombre y fichero madre es obligatorio');
        }

        try {
            const carpetaAnt = await collection.findOne({ nombre: nombre, id_fichero_madre: ficheroMadre, eliminada: false });
            if (carpetaAnt) {
                return res.status(400).send("No se permiten nombres duplicados en un mismo directorio");
            }
            const result = await collection.updateOne(
                { _id: new ObjectId(id) },
                { $set: { nombre } } // Actualiza solo el campo nombre
            );

            if (result.matchedCount === 0) {
                return res.status(404).send('Carpeta no encontrada');
            }

            res.status(200).json({ message: 'Nombre de carpeta actualizado', id });
        } catch (err) {
            res.status(500).send('Error al actualizar la carpeta: ' + err.message);
        }
    });

    //MOVER UNA CARPETA
    router.put('/mover_carpeta/:id', async (req, res) => {
        const { id } = req.params;
        const { nombre, nuevoFicheroMadre } = req.body;

        if (!nombre || !nuevoFicheroMadre) {
            return res.status(400).send('El nombre y fichero madre son obligatorios');
        }

        try {
            // Generar un nuevo nombre si existe una carpeta con el mismo nombre en el nuevo fichero madre
            let nuevoNombre = nombre;
            let contador = 1;
            let carpetaAnt = await collection.findOne({ nombre: nuevoNombre, id_fichero_madre: nuevoFicheroMadre, eliminada: false });
            const carpOriginal = await collection.findOne({ _id: new ObjectId(id) });
            if (carpOriginal.id_fichero_madre !== nuevoFicheroMadre) {
                while (carpetaAnt) {
                    nuevoNombre = `${nombre}_${contador}`;
                    contador++;
                    carpetaAnt = await collection.findOne({ nombre: nuevoNombre, id_fichero_madre: nuevoFicheroMadre, eliminada: false });
                }
            }


            // Actualizar el fichero madre y el nombre de la carpeta
            const result = await collection.updateOne(
                { _id: new ObjectId(id) },
                { $set: { id_fichero_madre: nuevoFicheroMadre, nombre: nuevoNombre } }
            );

            if (result.matchedCount === 0) {
                return res.status(404).send('Carpeta no encontrada');
            }

            res.status(200).json({ message: 'Carpeta movida exitosamente', id, nuevoNombre });
        } catch (err) {
            res.status(500).send('Error al mover la carpeta: ' + err.message);
        }
    });


    // Función para eliminar recursivamente una carpeta y sus archivos
    async function eliminarCarpetaRecursivamente(idCarpeta) {
        // Marcar los archivos de la carpeta actual como eliminados
        await collectionArchivos.updateMany({ id_fichero_madre: idCarpeta }, { $set: { eliminado: true } });

        // Obtener las subcarpetas de la carpeta actual
        const subcarpetas = await collection.find({ id_fichero_madre: idCarpeta, eliminada: false }).toArray();

        // Recorrer las subcarpetas y eliminarlas recursivamente
        for (const subcarpeta of subcarpetas) {
            await eliminarCarpetaRecursivamente(subcarpeta._id.toString());
        }

        // Marcar la carpeta actual como eliminada
        await collection.updateOne({ _id: new ObjectId(idCarpeta) }, { $set: { eliminada: true } });
    }

    router.delete('/:id', async (req, res) => {
        const { id } = req.params;

        try {
            // Iniciar la eliminación recursiva desde la carpeta especificada
            await eliminarCarpetaRecursivamente(id);

            res.status(200).json({ message: 'Carpeta y sus contenidos movidos a la papelera', id });
        } catch (err) {
            res.status(500).send('Error al eliminar la carpeta y archivos: ' + err.message);
        }
    });

    // OBTENER CARPETAS O FICHEROS DE una carpeta ELIMINADA
    router.get('/eliminadas/:idU/:idC', async (req, res) => {
        const { idC } = req.params;
        try {
            const carpetas = await collection.find({ id_fichero_madre: idC, eliminada: true }).sort({ nombre: 1 }).toArray();
            res.status(200).json(carpetas);
        } catch (err) {
            res.status(500).send('Error al obtener el carpetas: ' + err.message);
        }
    });

    // OBTENER CARPETAS ELIMINADAS
    router.get('/eliminadas', async (req, res) => {
        try {
            const carpetas = await collection.find({ eliminada: true }).sort({ nombre: 1 }).toArray();
            res.status(200).json(carpetas);
        } catch (err) {
            res.status(500).send('Error al obtener el carpetas: ' + err.message);
        }
    });

    async function eliminarCarpetaCompletamenteDelSistemaRecursivamente(idCarpeta) {
        // Marcar los archivos de la carpeta actual como eliminados
        await collectionArchivos.deletemany({ id_fichero_madre: idCarpeta });

        // Obtener las subcarpetas de la carpeta actual
        const subcarpetas = await collection.find({ id_fichero_madre: idCarpeta}).toArray();

        // Recorrer las subcarpetas y eliminarlas recursivamente
        for (const subcarpeta of subcarpetas) {
            await eliminarCarpetaRecursivamente(subcarpeta._id.toString());
        }

        // Marcar la carpeta actual como eliminada
        await collection.deleteOne({ _id: new ObjectId(idCarpeta)});
    }

    router.delete('/eliminar-sistema/:id', async (req, res) => {
        const { id } = req.params;

        try {
            // Iniciar la eliminación recursiva desde la carpeta especificada
            await eliminarCarpetaCompletamenteDelSistemaRecursivamente(id);

            res.status(200).json({ message: 'Carpeta y sus contenidos movidos a la papelera', id });
        } catch (err) {
            res.status(500).send('Error al eliminar la carpeta y archivos: ' + err.message);
        }
    });

    return router;


}

module.exports = carpetasRouter;
