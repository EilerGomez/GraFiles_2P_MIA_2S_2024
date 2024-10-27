// Ajustes en el archivo de rutas
const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadsDir = path.join(__dirname, 'uploads');

if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
}

function archivosRouter(client) {
    const router = express.Router();
    const db = client.db('sistemaarchivos');
    const collection = db.collection('archivos');

    // Configuración de multer
    const storage = multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, uploadsDir); // Ruta donde se guardarán las imágenes
        },
        filename: (req, file, cb) => {
            cb(null, file.originalname); // Utiliza el nombre original del archivo
        }
    });

    const upload = multer({ storage: storage });

    // AGREGAR NUEVO ARCHIVO
    router.post('/', async (req, res) => {
        const { extension, nombre, contenido, idFM, idU } = req.body;

        if (!extension || !nombre || !contenido || !idFM||!idU) {
            return res.status(400).send('Todos los campos son obligatorios');
        }

        try {
            const archant = await collection.findOne({ nombre, extension, id_fichero_madre: idFM,id_usuario:idU, eliminado: false });
            if (archant) {
                return res.status(400).send("No se permiten archivos con el mismo nombre en la misma carpeta");
            }

            const result = await collection.insertOne({
                nombre,
                extension,
                contenido, // Para otros tipos de archivos
                id_fichero_madre: idFM,
                fechamod: new Date(),
                eliminado: false,
                id_usuario:idU
            });

            const nuevoArchivo = await collection.findOne({ _id: result.insertedId });
            res.status(201).json(nuevoArchivo);
        } catch (err) {
            res.status(500).send('Error al insertar el archivo: ' + err.message);
        }
    });

    //COPIAR UN ARCHIVO
    router.post('/copiar', async (req, res) => {
        const { idArchivo, idFM } = req.body;

        if (!idArchivo || !idFM) {
            return res.status(400).send('ID de archivo y ID de carpeta madre son obligatorios');
        }

        try {
            // Obtener el archivo original
            const archivoOriginal = await collection.findOne({ _id: new ObjectId(idArchivo) });
            if (!archivoOriginal) {
                return res.status(404).send('Archivo no encontrado');
            }

            // Crear el nuevo nombre para el archivo
            let nuevoNombre = archivoOriginal.nombre;
            let nuevoExtension = archivoOriginal.extension;
            let contador = 1;

            // Verificar si ya existe un archivo con el mismo nombre en la carpeta
            while (await collection.findOne({ nombre: nuevoNombre, extension: nuevoExtension, id_fichero_madre: idFM, eliminado: false })) {
                nuevoNombre = `${archivoOriginal.nombre}_${contador}`;
                contador++;
            }

            // Insertar el nuevo archivo en la base de datos
            const resultado = await collection.insertOne({
                nombre: nuevoNombre,
                extension: nuevoExtension,
                contenido: archivoOriginal.contenido, // Se puede ajustar si se desea copiar el contenido
                id_fichero_madre: idFM,
                fechamod: new Date(),
                eliminado: false,
                id_usuario:archivoOriginal.id_usuario
            });

            const nuevoArchivo = await collection.findOne({ _id: resultado.insertedId });
            res.status(201).json(nuevoArchivo);
        } catch (err) {
            res.status(500).send('Error al copiar el archivo: ' + err.message);
        }
    });

    // Ruta para subir imágenes
    router.post('/upload', upload.single('imagen'), async (req, res) => {
        const { idFM, nombreArchivo, extensionArchivo, idU } = req.body;
        if (!req.file || !idFM || !nombreArchivo || !extensionArchivo||!idU) {
            return res.status(400).send('Imagen y id de la carpeta madre son obligatorios');
        }


        const nombre = nombreArchivo; // Mantener el nombre original del archivo
        const extension = path.extname(req.file.originalname);

        try {
            const archant = await collection.findOne({ nombre: nombre, extension: extension, id_fichero_madre: idFM, id_usuario:idU, eliminado:false});
            if (archant) {
                // Eliminar la imagen si el archivo ya existe en la base de datos
                fs.unlinkSync(req.file.path); // Elimina el archivo subido
                return res.status(400).send("No se permiten archivos con el mismo nombre en la misma carpeta");
            }

            // Guardar la ruta relativa de la imagen en la base de datos
            const relativePath = path.join(req.file.filename); // Ruta relativa
            const result = await collection.insertOne({
                nombre: nombreArchivo,
                extension: extensionArchivo,
                contenido: relativePath, // Usar la ruta relativa
                id_fichero_madre: idFM,
                fechamod: new Date(),
                eliminado: false,
                id_usuario:idU
            });

            const nuevoArchivo = await collection.findOne({ _id: result.insertedId });
            res.status(201).json(nuevoArchivo);
        } catch (err) {
            // Eliminar el archivo en caso de error
            if (req.file) {
                fs.unlinkSync(req.file.path);
            }
            res.status(500).send('Error al insertar la imagen: ' + err.message);
        }
    });

    // Ruta para obtener una imagen por nombre
    router.get('/imagen/:nombre', (req, res) => {
        const { nombre } = req.params;
        const imagenPath = path.join(__dirname, 'uploads', nombre);

        res.sendFile(imagenPath, (err) => {
            if (err) {
                res.status(404).send('Imagen no encontrada');
            }
        });
    });

    // OBTENER TODOS LOS ARCHIVOS
    router.get('/:idC/:idU', async (req, res) => {
        const { idC,idU } = req.params;
        try {
            const archivos = await collection.find({ id_fichero_madre: idC, eliminado: false, id_usuario:idU }).sort({ nombre: 1 }).toArray();
            res.status(200).json(archivos);
        } catch (err) {
            res.status(500).send('Error al obtener los archivos: ' + err.message);
        }
    });

    // OBTENER TODOS LOS ARCHIVOS ELIMINADOS
    router.get('/:idC', async (req, res) => {
        const { idC } = req.params;
        
            console.log("hhhhhhhh"+idC);
        
        try {
            const archivos = await collection.find({ id_fichero_madre: idC, eliminado: true }).sort({ nombre: 1 }).toArray();
            res.status(200).json(archivos);
        } catch (err) {
            res.status(500).send('Error al obtener los archivos eliminados: ' + err.message);
        }
    });

    // OBTENER TODOS LOS ARCHIVOS DE UN USUARIO DE LA CARPETA COMPARTIDA
    router.get('/archivos-compartidos/:idC/:idU', async (req, res) => {
        const { idC,idU } = req.params;
        if(!idC||!idU){
            console.log("Campos obligatorios")
        }
        try {
            const archivos = await collection.find({ id_fichero_madre: idC, id_usuario:idU, compartido:true}).sort({ nombre: 1 }).toArray();
            res.status(200).json(archivos);
        } catch (err) {
            res.status(500).send('Error al obtener los archivos de la carpeta compartida: ' + err.message);
        }
    });

    router.delete('/:id', async (req, res) => {
        const { id } = req.params;

        try {
            // Iniciar la eliminación lógica marcando el archivo como eliminado
            const result = await collection.updateOne(
                { _id: new ObjectId(id) }, // Asegúrate de instanciar ObjectId
                { $set: { eliminado: true } } // Usa $set para actualizar el campo
            );

            if (result.modifiedCount === 0) {
                return res.status(404).json({ message: 'Archivo no encontrado o ya eliminado' });
            }

            res.status(200).json({ message: 'Archivo movido a la papelera', id });
        } catch (err) {
            res.status(500).send('Error al mover a la papelera el archivo: ' + err.message);
        }
    });

    // Mover un archivo
    router.put('/mover/:idA', async (req, res) => {
        const { idA } = req.params;
        const { idFM, nombre, extension } = req.body;

        if (!idFM || !nombre || !extension) {
            return res.status(400).send('ID de carpeta madre, nombre y extensión son obligatorios');
        }

        try {
            // Obtener el archivo original
            const archivoOriginal = await collection.findOne({ _id: new ObjectId(idA) });
            if (!archivoOriginal) {
                return res.status(404).send('Archivo no encontrado');
            }

            let nuevoNombre = nombre;
            let contador = 1;

            // Solo verificar si el archivo original está en una carpeta diferente
            if (archivoOriginal.id_fichero_madre !== idFM) {
                // Verificar si ya existe un archivo con el mismo nombre en la carpeta de destino
                while (await collection.findOne({ nombre: nuevoNombre, extension: extension, id_fichero_madre: idFM, eliminado: false })) {
                    nuevoNombre = `${nombre}_${contador}`;
                    contador++;
                }
            }

            // Actualizar el archivo con el nuevo nombre y el nuevo id_fichero_madre
            const result = await collection.updateOne(
                { _id: new ObjectId(idA) }, // Asegúrate de instanciar ObjectId
                { $set: { nombre: nuevoNombre, id_fichero_madre: idFM, fechamod: new Date() } } // Usa $set para actualizar el campo
            );

            if (result.modifiedCount === 0) {
                return res.status(404).json({ message: 'Archivo no movido' });
            }

            res.status(200).json({ message: 'Archivo movido a una nueva carpeta', idFM });
        } catch (err) {
            res.status(500).send('Error al mover a nueva carpeta el archivo: ' + err.message);
        }
    });


    // EDITAR UN ARCHIVO
    router.put('/editar', async (req, res) => {
        const { extension, nombre, contenido, idArchivo, idFM } = req.body;

        if (!extension || !nombre || !contenido || !idArchivo || !idFM) {
            return res.status(400).send('Todos los campos son obligatorios');
        }

        try {
            const result = await collection.updateOne(
                { _id: new ObjectId(idArchivo) }, // Asegúrate de instanciar ObjectId
                { $set: { nombre: nombre, extension: extension, contenido: contenido, fechamod: new Date() } }
            );

            res.status(201).json({ message: "se ha actualizado el archivo con exito", idArchivo });
        } catch (err) {
            res.status(500).send('Error al insertar el archivo: ' + err.message);
        }
    });

    router.put('/editararchivoimagen', upload.single('imagen'), async (req, res) => {
        const { extension, nombre, idArchivo } = req.body;

        if (!extension || !nombre || !idArchivo) {
            return res.status(400).send('Todos los campos son obligatorios');
        }

        try {
            let relativePath = '';
            const archant = await collection.findOne({ _id: new ObjectId(idArchivo) });

            if (!archant) {
                return res.status(404).send('Archivo no encontrado');
            }

            if (!req.file) {
                // Si no se envía un nuevo archivo, se mantiene el contenido actual
                relativePath = archant.contenido;
            } else {
                // Si se envía un archivo, se actualiza el contenido con la nueva ruta
                relativePath = path.join(req.file.filename); // Ruta relativa al nuevo archivo
            }

            // Actualiza el documento en la base de datos
            const result = await collection.updateOne(
                { _id: new ObjectId(idArchivo) },
                { $set: { nombre: nombre, extension: extension, contenido: relativePath, fechamod: new Date() } }
            );

            if (result.modifiedCount === 0) {
                return res.status(500).send('No se pudo actualizar el archivo');
            }

            // Obtén el archivo actualizado
            const nuevoArchivo = await collection.findOne({ _id: new ObjectId(idArchivo) });
            res.status(200).json(nuevoArchivo);
        } catch (err) {
            // Eliminar el archivo en caso de error
            if (req.file) {
                fs.unlinkSync(req.file.path);
            }
            res.status(500).send('Error al editar la imagen: ' + err.message);
        }
    });


    //COMPARTIR UN ARCHIVO
    router.post('/compartir', async (req, res) => {
        const { idFM, idU, idUC, idA } = req.body;

        if (!idU || !idA || !idFM || !idUC) {
            return res.status(400).send('Todos los campos son obligatorios');
        }

        try {
            const archivoOriginal = await collection.findOne({ _id: new ObjectId(idA) });
            let nuevoNombre = archivoOriginal.nombre;
            let nuevoExtension = archivoOriginal.extension;
            let contador = 1;

            // Verificar si ya existe un archivo con el mismo nombre en la carpeta
            while (await collection.findOne({ nombre: nuevoNombre, extension: nuevoExtension, id_fichero_madre: idFM, id_usuario: idU })) {
                nuevoNombre = `${archivoOriginal.nombre}_${contador}`;
                contador++;
            }

            const result = await collection.insertOne({
                nombre: archivoOriginal.nombre,
                extension: archivoOriginal.extension,
                contenido: archivoOriginal.contenido, // Para otros tipos de archivos
                id_fichero_madre: idFM,
                fechamod: archivoOriginal.fechamod,
                compartido: true,
                fecha_compartido: new Date(),
                usuario_que_compartio: idUC,
                id_usuario: idU
            });

            const nuevoArchivo = await collection.findOne({ _id: result.insertedId });
            res.status(201).json(nuevoArchivo);
        } catch (err) {
            res.status(500).send('Error al compartir el archivo: ' + err.message);
        }
    });

    router.delete('/eliminar-del-sistema/:id', async (req, res) => {
        const { id } = req.params;
    
        try {
            const result = await collection.deleteOne({ _id: new ObjectId(id) });
    
            if (result.deletedCount === 0) {
                return res.status(404).json({ message: 'Archivo no encontrado o ya eliminado' });
            }
    
            res.status(200).json({ message: 'Archivo eliminado correctamente', id });
        } catch (err) {
            res.status(500).send('Error al eliminar el archivo: ' + err.message);
        }
    });

    return router;
}

module.exports = archivosRouter;
