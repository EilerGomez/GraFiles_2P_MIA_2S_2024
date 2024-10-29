use sistemaarchivos ; -- aca crea la base de datos 
db.createUser({ 
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
db.ficheros.insertOne({nombre: 'raiz', fechamod: new Date(),id_usuario:'0', idUnic:0});

-- ingresar por medio de la consola, con el contenedor ya instalado:
--  docker exec -it mongodb mongosh
-- desplegar los contenedores del proyecto:
-- docker-compose up --build o docker-compose

-- reconstruir el contenedor con cambios realizados

-- docker-compose up --build -d
