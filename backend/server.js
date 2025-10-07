import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import mysql from "mysql2";
import dotenv from "dotenv";
import session from "express-session";
import multer from "multer";
import path from "path";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";

dotenv.config();

// ☁️ Configuración de Cloudinary
cloudinary.config({
  cloud_name: "dgozkgepo",
  api_key: "624588943411286",
  api_secret: "_rFJFWatF0b9J4o49qH3KmajGxs",
});

// 📤 Configurar Multer con Cloudinary Storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'evidencias_testcases', // Carpeta en Cloudinary
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'pdf'], // Formatos permitidos
    transformation: [{ width: 1500, height: 1500, crop: 'limit' }] // Opcional: limitar tamaño
  },
});

const upload = multer({ storage });

const PORT = process.env.PORT || 3000;
const app = express();

app.use(express.json());
app.use("/uploads", express.static("uploads")); // Por si tienes archivos antiguos locales

// ✅ Configurar CORS
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
}));

app.use(bodyParser.json());

// 🔹 Configuración de conexión MySQL
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: "",
  database: process.env.DB_NAME,
});

// 🔹 Configurar sesiones
app.use(session({
  secret: process.env.SESSION_SECRET || "mi_clave_segura",
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: false,
    httpOnly: true,
    sameSite: "lax",
    maxAge: 1000 * 60 * 30
  },
}));

// ✅ Verificar conexión MySQL
db.connect(err => {
  if (err) {
    console.error("❌ Error de conexión a MySQL:", err);
    return;
  }
  console.log("✅ Conectado a MySQL - sistemaQA");
});


// =========================================================
// 🔐 LOGIN
// =========================================================
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

      if (user.Estado !== 1) {
        return res.status(403).json({ success: false, message: "Usuario inactivo, contacte al administrador." });
      }

      req.session.userId = user.IDcedula;
      req.session.rol = user.rol;

      const redirectTo = user.rol === "Administrador" ? "/DashboardAdmin" : "/DashboardAgenteQA";

      const insertIngreso = `
        INSERT INTO Ingreso (IDcedulaFK, FechaIngreso, Nombres, InicioSesion)
        VALUES (?, NOW(), ?, ?)
      `;
      db.query(insertIngreso, [user.IDcedula, user.Nombres, true], (err2) => {
        if (err2) console.error("Error al registrar ingreso:", err2);
      });

      return res.json({
        success: true,
        message: "Login exitoso",
        user: { 
          id: user.IDcedula,
          correo: user.Correo,
          rol: user.rol,
          nombres: user.Nombres 
        },
        redirectTo
      });
    } else {
      const insertIngresoFail = `
        INSERT INTO Ingreso (FechaIngreso, Nombres, InicioSesion)
        VALUES (NOW(), ?, ?)
      `;
      db.query(insertIngresoFail, ["Intento fallido", false]);
      return res.status(401).json({ success: false, message: "Credenciales incorrectas" });
    }
  });
});

app.post("/api/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Error al cerrar sesión:", err);
      return res.status(500).json({ message: "Error al cerrar sesión" });
    }
    res.clearCookie("connect.sid");
    res.json({ message: "Sesión cerrada correctamente" });
  });
});


// =========================================================
// 👥 USUARIOS
// =========================================================

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

app.post("/api/Crearusuarios", (req, res) => {
  const {
    IDcedula, Nombres, Contrasenia, Genero, Correo,
    Telefono, Ciudad, Cargo, rol, FechaRegistro, Estado
  } = req.body;

  const query = `
    INSERT INTO usuario 
    (IDcedula, Nombres, Contrasenia, Genero, Correo, Telefono, Ciudad, Cargo, rol, FechaRegistro, Estado) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(query, [
    IDcedula, Nombres, Contrasenia, Genero, Correo,
    Telefono, Ciudad, Cargo, rol, FechaRegistro, Estado
  ], (err) => {
    if (err) {
      console.error("Error al insertar usuario:", err);
      return res.status(500).json({ message: "Error en el servidor" });
    }
    res.json({ success: true, message: "Usuario creado correctamente" });
  });
});

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


// =========================================================
// 📋 ASIGNACIONES
// =========================================================

app.get("/api/TodasAsignaciones", (req, res) => {
  const query = "SELECT IDAsignacion, Tester, NombreAsignacion, FechaAsignacion, FechaEstimada, FechaFinalizacion, Estado FROM Asignacion";
  db.query(query, (err, results) => {
    if (err) {
      console.error("Error al obtener asignaciones:", err);
      return res.status(500).json({ message: "Error en el servidor" });
    }
    res.json(results);
  });
});

app.post("/api/CrearTarea", (req, res) => {
  const {
    Tester, NombreAsignacion, TipoAsignacion,
    FechaEstimada, FechaAsignacion, FechaFinalizacion,
    FechaActualizacion, BitacoraComentarios, Estado, IDcedula
  } = req.body;

  const query = `
    INSERT INTO Asignacion 
    (Tester, NombreAsignacion, TipoAsignacion, FechaEstimada, FechaAsignacion, FechaFinalizacion, FechaActualizacion, BitacoraComentarios, Estado, IDcedula) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(query, [
    Tester, NombreAsignacion, TipoAsignacion,
    FechaEstimada, FechaAsignacion, FechaFinalizacion,
    FechaActualizacion, BitacoraComentarios, Estado, IDcedula
  ], (err) => {
    if (err) {
      console.error("Error al insertar tarea:", err);
      return res.status(500).json({ message: "Error en el servidor" });
    }
    res.json({ success: true, message: "Tarea creada correctamente" });
  });
});

app.get("/api/mis-asignaciones", (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ message: "No autorizado" });
  }

  const query = "SELECT * FROM Asignacion WHERE IDcedula = ?";
  db.query(query, [req.session.userId], (err, results) => {
    if (err) {
      console.error("Error al obtener asignaciones:", err);
      return res.status(500).json({ message: "Error en el servidor" });
    }
    res.json(results);
  });
});


// =========================================================
// 📈 ANÁLISIS DE DATOS
// =========================================================
app.get("/api/GenerarMetricas", (req, res) => {
  const { desde, hasta } = req.query;

  const query = `
    SELECT
      COUNT(*) AS totalAsignaciones,
      COUNT(CASE WHEN FechaFinalizacion IS NULL THEN 1 END) AS TareasPendintes,
      COUNT(CASE WHEN FechaFinalizacion IS NOT NULL THEN 1 END) AS TareasTerminadas
    FROM Asignacion
    WHERE FechaAsignacion BETWEEN ? AND ?
  `;

  db.query(query, [desde, hasta], (err, results) => {
    if (err) {
      console.error("Error al generar métricas:", err);
      return res.status(500).json({ message: "Error en el servidor" });
    }
    res.json(results[0]);
  });
});


// =========================================================
// 🙋 PERFIL DE USUARIO
// =========================================================
app.get("/api/usuario/:cedula", (req, res) => {
  const cedula = req.params.cedula;

  const query = `
    SELECT IDcedula, Nombres, Correo, Telefono, Ciudad, Cargo, rol, Estado
    FROM Usuario WHERE IDcedula = ?
  `;

  db.query(query, [cedula], (err, results) => {
    if (err) {
      console.error("Error al obtener usuario:", err);
      return res.status(500).json({ message: "Error en el servidor" });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    res.json(results[0]);
  });
});

app.put("/api/usuario/:cedula", (req, res) => {
  const cedula = req.params.cedula;
  const { Nombres, Correo, Telefono, Ciudad, Cargo } = req.body;

  const query = `
    UPDATE Usuario 
    SET Nombres=?, Correo=?, Telefono=?, Ciudad=?, Cargo=?
    WHERE IDcedula=?
  `;

  db.query(query, [Nombres, Correo, Telefono, Ciudad, Cargo, cedula], (err, result) => {
    if (err) {
      console.error("Error al actualizar usuario:", err);
      return res.status(500).json({ message: "Error en el servidor" });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    res.json({ success: true, message: "Usuario actualizado correctamente" });
  });
});

// =========================================================
//  Mis Tareas
// =========================================================
app.get("/api/misTareas", (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ message: "No autorizado" });
  }

  const userId = req.session.userId;
  const query = "SELECT * FROM Asignacion WHERE IDcedula = ?";

  db.query(query, [userId], (err, results) => {
    if (err) {
      console.error("Error al obtener tareas:", err);
      return res.status(500).json({ message: "Error en el servidor" });
    }

    res.json(results);
  });
});


app.put("/api/EditarFecha", (req, res) => {
  const { IDAsignacion, FechaFinalizacion } = req.body;

  const query = `
    UPDATE Asignacion
    SET FechaFinalizacion = ?
    WHERE IDAsignacion = ?
  `;

  db.query(query, [FechaFinalizacion, IDAsignacion], (err, result) => {
    if (err) {
      console.error("Error al actualizar fecha:", err);
      return res.json({ success: false });
    }
    res.json({ success: true, message: "💾 Guardado " });
  });
});


// 🔹 Obtener test plan por asignación
app.get("/api/testplan/:idAsignacion", (req, res) => {
  const { idAsignacion } = req.params;
  const query = "SELECT * FROM TestPLan WHERE IDAsignacionFK = ?";
  db.query(query, [idAsignacion], (err, result) => {
    if (err) return res.status(500).json({ message: "Error de servidor" });
    res.json(result);
  });
});

// 🔹 Crear test plan
app.post("/api/testplan", (req, res) => {
  const { IDAsignacionFK, Desarrollador, Version, Usuario, Descripcion } = req.body;
  const query = `INSERT INTO TestPLan (IDAsignacionFK, Desarrollador, Version, Usuario, Descripcion, Estado, Ejecucion)
                 VALUES (?, ?, ?, ?, ?, 0, 0)`;
  db.query(query, [IDAsignacionFK, Desarrollador, Version, Usuario, Descripcion], (err) => {
    if (err) return res.status(500).json({ message: "Error al crear el plan" });
    res.json({ success: true, message: "Plan de pruebas creado correctamente" });
  });
});

// 🔹 Obtener casos de prueba
app.get("/api/usuarios/testers", (req, res) => {
  const query = "SELECT IDcedula, Nombres FROM Usuario WHERE rol = 'Tester'";
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ message: "Error al obtener testers" });
    res.json(results);
  });
});

// 🧩 Obtener casos de prueba por plan
app.get("/api/testcases/:idPlan", (req, res) => {
  const { idPlan } = req.params;
  const query = "SELECT * FROM TestCase WHERE IDPlanFK = ?";
  db.query(query, [idPlan], (err, result) => {
    if (err) return res.status(500).json({ message: "Error al obtener casos" });
    res.json(result);
  });
});

// ➕ Crear nuevo caso de prueba
app.post("/api/testcase", (req, res) => {
  const { IDPlanFK, Tester, RutaEvidencia, Comentario, Descripcion } = req.body;

  console.log("🧩 Datos recibidos en /api/testcase:", req.body);

  if (!IDPlanFK || !Tester) {
    return res.status(400).json({ message: "Faltan campos obligatorios" });
  }

  const query = `
    INSERT INTO TestCase (IDPlanFK, Tester, RutaEvidencia, Comentario, Descripcion, Estado)
    VALUES (?, ?, ?, ?, ?, 0)
  `;

  db.query(query, [IDPlanFK, Tester, RutaEvidencia, Comentario, Descripcion], (err, result) => {
    if (err) {
      console.error("❌ Error al insertar caso:", err.sqlMessage);
      return res.status(500).json({ message: "Error al insertar el caso", error: err.sqlMessage });
    }

    console.log("✅ Caso agregado correctamente con ID:", result.insertId);
    res.json({ success: true, IDCase: result.insertId });
  });
});


// 🧩 Ejecutar caso con imagen subida a Cloudinary
app.put("/api/testcase/ejecutar/:id", upload.single("evidencia"), (req, res) => {
  const { id } = req.params;
  const { Comentario, FechaInicio, FechaFinal } = req.body;
  
  // 📤 Cloudinary ya subió el archivo automáticamente
  // La URL está en req.file.path (no req.file.filename como antes)
  const RutaEvidencia = req.file ? req.file.path : null;

  console.log("📤 Imagen subida a Cloudinary:", RutaEvidencia);

  const query = `
    UPDATE TestCase 
    SET Estado = 1,
        Comentario = ?,
        FechaInicio = ?,
        FechaFinal = ?,
        RutaEvidencia = ?
    WHERE IDCase = ?
  `;
  
  db.query(query, [Comentario, FechaInicio, FechaFinal, RutaEvidencia, id], (err) => {
    if (err) {
      console.error("❌ Error al ejecutar el caso:", err);
      return res.status(500).json({ message: "Error al ejecutar el caso" });
    }
    res.json({ 
      success: true, 
      message: "Ejecución guardada correctamente",
      imageUrl: RutaEvidencia 
    });
  });
});


// =========================================================
// 🚀 Iniciar servidor
// =========================================================
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});