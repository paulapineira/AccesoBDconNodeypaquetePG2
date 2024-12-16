const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");

const app = express();

const port = 3000;

app.use(cors());
app.use(express.json());

// Configuracion de la conexión a postgres (Estas son las credenciales que tengo en pgadmin se deben colocar los datos dependiendo de como esta configurado el usuario)
const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "likeme",
  password: "postgres",
  port: 5432,
});

// Ruta para get donde obtengo todos los dats
app.get("/posts", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM posts");
    res.json(result.rows); // se devuelven los registros como json
  } catch (err) {
    console.error(err);
    res.status(500).send("Error al obtener los posts :C");
  }
});

// Ruta para post donde agrego un nuevo post
app.post("/posts", async (req, res) => {
    const { titulo, url, descripcion } = req.body;  // recordatorio: la url viene del proyecto de React en el apoyo desafio  
  
    const img = url;  // en la base de datos no se llama url si no img, asi que igualo para que coincida con la columna de la bd
  
    console.log("Datos recibidos:", { titulo, img, descripcion });
  
    try {
      const result = await pool.query(
        "INSERT INTO posts (titulo, img, descripcion, likes) VALUES ($1, $2, $3, $4) RETURNING *",
        [titulo, img, descripcion, 0]  // inserta img en vez de url para que coincida con la bd
      );
      res.status(201).json(result.rows[0]);
    } catch (err) {
      console.error(err);
      res.status(500).send("Error al agregar el post X.X");
    }
  });


  // Ruta para put donde aumento el like de un post
app.put("/posts/like/:id", async (req, res) => {
  const { id } = req.params;

  try { // Actualizo los likes del post
    const result = await pool.query(
      "UPDATE posts SET likes = likes + 1 WHERE id = $1 RETURNING *",
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).send("Post no encontrado :/");
    }

    res.json(result.rows[0]); // Devuelvo el post actualizado
  } catch (err) {
    console.error(err);
    res.status(500).send("Error al dar like al post :O");
  }
});


// Ruta para delete donde elimino un post
app.delete("/posts/:id", async (req, res) => {
  const { id } = req.params;

  try {// Elimino el post con el id dado
    const result = await pool.query("DELETE FROM posts WHERE id = $1 RETURNING *", [id]);

    if (result.rows.length === 0) {
      return res.status(404).send("Post no encontrado :/");
    }

    res.status(204).send(); // Responde con codigo 204 para mostrar que el post se elinino bien
  } catch (err) {
    console.error(err);
    res.status(500).send("Error al eliminar el post :O");
  }
});

  

// Iniciar el servidor
app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});
