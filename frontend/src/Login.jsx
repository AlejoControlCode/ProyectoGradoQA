import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Login() {
  const [correo, setCorreo] = useState("");
  const [contrasenia, setContrasenia] = useState("");
  const [rol, setRol] = useState("Administrador");
  const [mensaje, setMensaje] = useState("");

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        "http://localhost:3000/api/login",
        { correo, contrasenia, rol },
        { withCredentials: true } // 👈 importante para manejar la sesión
      );

      if (res.data.success) {
        // Guardamos datos del usuario en el almacenamiento local
        localStorage.setItem("user", JSON.stringify(res.data.user));

        setMensaje("✅ Bienvenido " + res.data.user.nombres);

        setTimeout(() => {
          navigate(res.data.redirectTo);
        }, 1000);
      } else {
        setMensaje("❌ Credenciales incorrectas");
      }
    } catch (err) {
      setMensaje(
        err.response?.data?.message || "❌ Error al conectar con el servidor"
      );
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
      <div className="card shadow p-4" style={{ width: "22rem" }}>
        <h3 className="text-center mb-4">Inicio de Sesión</h3>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Correo</label>
            <input
              type="email"
              className="form-control"
              placeholder="correo@ejemplo.com"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Contraseña</label>
            <input
              type="password"
              className="form-control"
              placeholder="********"
              value={contrasenia}
              onChange={(e) => setContrasenia(e.target.value)}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Rol</label>
            <select
              className="form-select"
              value={rol}
              onChange={(e) => setRol(e.target.value)}
            >
              <option value="Administrador">Administrador</option>
              <option value="AgenteQA">Agente QA</option>
            </select>
          </div>

          <button type="submit" className="btn btn-primary w-100">
            Iniciar Sesión
          </button>
        </form>

        {mensaje && (
          <div className="alert alert-info mt-3 text-center">{mensaje}</div>
        )}
      </div>
    </div>
  );
}

export default Login;
