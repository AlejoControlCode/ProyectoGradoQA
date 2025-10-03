import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import mysql from "mysql2";
import dotenv from "dotenv";
import session from "express-session";
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

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 1000 * 60 * 30 } // 30 minutos
}));

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
      const user = result[0];

      // 2️⃣ Validar si el usuario está activo
      if (user.Estado !== 1) {
        return res.status(403).json({ success: false, message: "Usuario inactivo, contacte al administrador." });
      }

      // 1️⃣ Guardar sesión
      req.session.userId = user.IDcedula;
      req.session.rol = user.Rol;

      // 3️⃣ Diferenciar vistas según el rol
      let redirectTo = user.rol === "Administrador" ? "/DashboardAdmin" : "/DashboardAgenteQA";



      // 4️⃣ Registrar ingreso en la tabla Ingreso
      const insertIngreso = `
        INSERT INTO Ingreso (IDcedulaFK, FechaIngreso, Nombres, InicioSesion)
        VALUES (?, NOW(), ?, ?)
      `;

      db.query(insertIngreso, [user.IDcedula, user.Nombres, true], (err2) => {
        if (err2) {
          console.error("Error al registrar ingreso:", err2);
          // no bloquea el login, solo lo reporta
        }
      });

      return res.json({
        success: true,
        message: "Login exitoso",
        user: { id: user.IDcedula, 
                correo: user.Correo, 
                rol: user.Rol,
                nombres: user.Nombres },
        redirectTo
      });

    } else {
      // ❌ Opción: guardar intento fallido
      const insertIngresoFail = `
        INSERT INTO Ingreso (FechaIngreso, Nombres, InicioSesion)
        VALUES (NOW(), ?, ?)
      `;
      db.query(insertIngresoFail, ["Intento fallido", false], (err3) => {
        if (err3) console.error("Error registrando intento fallido:", err3);
      });

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
app.post("/api/Crearusuarios", (req, res) => {
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

app.post("/api/CrearTarea", (req, res) => {
  const {
        Tester,
        NombreAsignacion,
        TipoAsignacion,
        FechaEstimada,
        FechaAsignacion,
        FechaFinalizacion,
        FechaActualizacion,
        BitacoraComentarios,
        Estado,
        IDcedula} = req.body;
        
  const query = `
    INSERT INTO Asignacion 
    (Tester, NombreAsignacion, TipoAsignacion, FechaEstimada, FechaAsignacion, FechaFinalizacion, FechaActualizacion, BitacoraComentarios, Estado, IDcedula) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(
    query,
    [
      Tester,
      NombreAsignacion,
      TipoAsignacion,
      FechaEstimada,
      FechaAsignacion,
      FechaFinalizacion,
      FechaActualizacion,
      BitacoraComentarios,
      Estado,
      IDcedula
    ],
    (err, result) => {
      if (err) {
        console.error("Error al insertar tarea:", err);
        return res.status(500).json({ message: "Error en el servidor" });
      }
      res.json({ success: true, message: "Tarea creada correctamente" });
    }
  );
});


// ---------------------------------------------- estas son del modulo de tareas


// Iniciar servidor
app.listen(PORT, () => {
  console.log("🚀 Servidor corriendo en http://localhost:3000");
});
