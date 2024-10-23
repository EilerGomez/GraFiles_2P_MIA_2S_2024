use sistemaarchivos ; -- aca crea la base de datos 
db.createUser({ --crear usuario con permisos de usar la base de datos
    user: "usuarioProyecto2MIA2024",
    pwd: "up2mia",
    roles: [
      { role: "readWrite", db: "sistemaarchivos" }
    ]
});
  

db.createCollection("usuarios");
db.createCollection("ficheros");
db.createCollection("archivos");

/*insertando un usuario admin por defecto
//password = admin
//username = admin1*/
db.usuarios.insertOne({username:'admin1', nombre:'Usuario administrador 1', password:'21232f297a57a5a743894a0e4a801fc3',rol:1});

-- insertar las dos carpetas la raiz y la compartida
db.ficheros.insertOne({nombre: 'compartida', fechamod: new Date(),id_usuario:'0', idUnic:1});
b.ficheros.insertOne({nombre: 'raiz', fechamod: new Date(),id_usuario:'0', idUnic:0});