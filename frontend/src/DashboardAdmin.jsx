import { useState } from "react";
import CrearUsuario from "./Componentes/CrearUsuario";
import AsignarTareas from "./Componentes/AsignarTareas";

function DashboardAdmin() {
  const [contenido, setContenido] = useState(<h4>Sistema QA</h4>);

  const handleMenuClick = (opcion) => {
    switch (opcion) {
      case "crearUsuario":
        setContenido(<CrearUsuario/>);
        break;
      case "analisis":
        setContenido(<p>Aca debe de ir todo lo relacionado el analisis de datos</p>);
        break;
      case "perfil":
        setContenido(<p>Aca debe de ir todo lo relacionado al perfil</p>);
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
                Mi Perfil
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
