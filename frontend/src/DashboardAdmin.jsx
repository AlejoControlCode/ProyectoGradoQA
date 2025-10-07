import { useState } from "react";
import CrearUsuario from "./ComponentesAdmin/CrearUsuario";
import AsignarTareas from "./ComponentesAdmin/AsignarTareas";
import AnalisisDatos from "./ComponentesAdmin/AnalisisDatos";
import MiPerfil from "./ComponentesAdmin/MiPerfil";

function DashboardAdmin() {
  const [contenido, setContenido] = useState(<h4>Sistema QA</h4>);

  const handleLogout = async () => {
    try {
      const res = await fetch("http://localhost:3000/api/logout", {
        method: "POST",
        credentials: "include", // 👈 importante: incluye la cookie de sesión
      });

      if (res.ok) {
        // Borra cualquier dato del usuario almacenado en el frontend
        localStorage.removeItem("usuario");
        alert("Sesión cerrada correctamente");
        window.location.href = "/"; // Redirige al login
      } else {
        alert("Error al cerrar sesión");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };


  const handleMenuClick = (opcion) => {
    switch (opcion) {
      case "crearUsuario":
        setContenido(<CrearUsuario/>);
        break;
      case "analisis":
        setContenido(<AnalisisDatos/>);
        break;
      case "perfil":
        setContenido(<MiPerfil/>);
        break;
      case "tarea":
        setContenido(<AsignarTareas/>);
        break;
      default:
        setContenido(<h4>Bienvenido al sistema</h4>);
    }
  };

  return (
    <div className="container-fluid vh-100">
      <div className="row h-100">
        {/* Sidebar */}
        <div className="col-3 col-md-2 bg-dark text-white p-3">
          <h4 className="text-center mb-4 ">Sistema<rm/> QA<rm/></h4>
          <ul className="nav flex-column  position-fixed">
            <li className="nav-item mb-2">
              <button
                className="btn btn-outline-light w-100"
                onClick={() => handleMenuClick("crearUsuario")}
              >
                Crear Usuario
              </button>
            </li>
            <li className="nav-item mb-2">
              <button
                className="btn btn-outline-light w-100"
                onClick={() => handleMenuClick("analisis")}
              >
                Análisis de Datos
              </button>
            </li>
            <li className="nav-item mb-2">
              <button
                className="btn btn-outline-light w-100"
                onClick={() => handleMenuClick("perfil")}
              >
                Gestion de Usuarios
              </button>
            </li>
            <li className="nav-item mb-2">
              <button
                className="btn btn-outline-light w-100"
                onClick={() => handleMenuClick("tarea")}
              >
                Asignar Tarea
              </button>
            </li>
            <li className="nav-item mb-2">
              <button
                onClick={handleLogout}
                className="btn btn-outline-light"
              >
                Cerrar sesión
              </button>

            </li>
          </ul>
        </div>

        {/* Contenido principal */}
        <div className="col-9 col-md-10 p-4">
          <div className="card shadow-sm h-100">
            <div className="card-body">
              <div>{contenido}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardAdmin;
