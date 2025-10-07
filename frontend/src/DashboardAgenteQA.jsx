import { useState } from "react";
import MisTareas from "./CoomponentesAgenteQA/MisTareas";


function DashboardAgenteQA() {
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
      case "MisTareas":
        setContenido(<MisTareas/>);
        break;
      case "analisis":
        setContenido();
        break;
      case "perfil":
        setContenido();
        break;
      case "tarea":
        setContenido();
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
                onClick={() => handleMenuClick("MisTareas")}
              >
                Mis Tareas
              </button>
            </li>
            {/* <li className="nav-item mb-2">
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
            </li> */}
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
  )}


export default DashboardAgenteQA;