import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import mysql from "mysql2";
import dotenv from "dotenv";
dotenv.config();

const PORT = process.env.PORT || 3000;

const app = express();
app.use(cors());
app.use(bodyParser.json());

// 🔹 Configuración de conexión MySQL
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,      
  password: "",      
  database: process.env.DB_NAME
});

// Verificar conexión
db.connect(err => {
  if (err) {
    console.error("Error de conexión a MySQL:", err);
    return;
  }
  console.log("✅ Conectado a MySQL - sistemaQA");
});

// 🔹 Endpoint de Login
app.post("/api/login", (req, res) => {
  const { correo, contrasenia, rol } = req.body;

  if (!correo || !contrasenia || !rol) {
    return res.status(400).json({ message: "Faltan datos" });
  }

  const query = `
    SELECT * FROM usuario
    WHERE Correo = ? AND Contrasenia = ? AND rol = ?
  `;

  db.query(query, [correo, contrasenia, rol], (err, result) => {
    if (err) {
      console.error("Error en consulta:", err);
      return res.status(500).json({ message: "Error en el servidor" });
    }

    if (result.length > 0) {
      return res.json({ success: true, message: "Login exitoso", user: result[0] });
    } else {
      return res.status(401).json({ success: false, message: "Credenciales incorrectas" });
    }
  });
});

// enlista todos los usuarios en la opcion de usuario
app.get("/api/usuarios", (req, res) => {
  const query = "SELECT IDcedula, Nombres, rol, Estado FROM usuario";
  db.query(query, (err, results) => {
    if (err) {
      console.error("Error al obtener usuarios:", err);
      return res.status(500).json({ message: "Error en el servidor" });
    }
    res.json(results);
  });
});


// Inserta registros en la tabla usuario
app.post("/api/usuarios", (req, res) => {
  const {
    IDcedula,
    Nombres,
    Contrasenia,
    Genero,
    Correo,
    Telefono,
    Ciudad,
    Cargo,
    rol,
    FechaRegistro,
    Estado,
  } = req.body;

  const query = `
    INSERT INTO usuario 
    (IDcedula, Nombres, Contrasenia, Genero, Correo, Telefono, Ciudad, Cargo, rol, FechaRegistro, Estado) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(
    query,
    [
      IDcedula,
      Nombres,
      Contrasenia,
      Genero,
      Correo,
      Telefono,
      Ciudad,
      Cargo,
      rol,
      FechaRegistro,
      Estado,
    ],
    (err, result) => {
      if (err) {
        console.error("Error al insertar usuario:", err);
        return res.status(500).json({ message: "Error en el servidor" });
      }
      res.json({ success: true, message: "Usuario creado correctamente" });
    }
  );
});

// Cambiar estado de un usuario (activar/desactivar)
app.patch("/api/usuarios/:id/estado", (req, res) => {
  const { id } = req.params;
  const { Estado } = req.body;

  const query = "UPDATE usuario SET Estado = ? WHERE IDcedula = ?";

  db.query(query, [Estado, id], (err, result) => {
    if (err) {
      console.error("Error al actualizar estado:", err);
      return res.status(500).json({ success: false, message: "Error en el servidor" });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Usuario no encontrado" });
    }

    res.json({ success: true, message: `Usuario ${Estado == 1 ? "activado" : "desactivado"} correctamente` });
  });
});







//--------------------------------------------- estas son del modulo de asignaciones

app.get("/api/TodasAsignaciones", (req, res) => {
  const query = "SELECT IDAsignacion, Tester, NombreAsignacion, FechaAsignacion, FechaEstimada, FechaFinalizacion, Estado FROM Asignacion" 
  db.query(query, (err, results) => {
    if (err) {
      console.error("Error al obtener asignaciones:", err);
      return res.status(500).json({ message: "Error en el servidor" });
    }
    res.json(results);
  });
})




// Iniciar servidor
app.listen(PORT, () => {
  console.log("🚀 Servidor corriendo en http://localhost:3000");
});
