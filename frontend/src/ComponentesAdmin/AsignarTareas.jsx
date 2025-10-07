import { useEffect, useState } from "react";

function AsignarTareas() {
  const [Asignacion, setAsignacion] = useState([]);
  const [usuariosQA, setUsuariosQA] = useState([]);

  // Estado del formulario
  const [formData, setFormData] = useState({
    Tester: "",
    NombreAsignacion: "",
    TipoAsignacion: "",
    FechaEstimada: "",
    FechaAsignacion: "",
    FechaFinalizacion: "",
    FechaActualizacion: "",
    BitacoraComentarios: "",
    Estado: 0,
    IDcedula: ""
  });

  // Cargar asignaciones
  const fetchAsignaciones = () => {
    fetch("http://localhost:3000/api/TodasAsignaciones", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => setAsignacion(data))
      .catch((err) => console.error("Error cargando Asignaciones:", err));
  };

  // Cargar usuarios y filtrar solo QA activos
  const fetchUsuarios = () => {
    fetch("http://localhost:3000/api/usuarios", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => setUsuariosQA(data))
      .catch((err) => console.error("Error cargando usuarios:", err));
  };

  useEffect(() => {
    fetchAsignaciones();
    fetchUsuarios();
  }, []);

  // Manejar cambios del form
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Enviar formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:3000/api/CrearTarea", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
        credentials: "include" 
      });

      const data = await res.json();
      if (data.success) {
        const alertDiv = document.createElement("div");
        alertDiv.classList.add("alert", "alert-success", "mt-3");
        alertDiv.setAttribute("role", "alert");
        alertDiv.textContent = data.message;
        document.getElementById("alertContainer").appendChild(alertDiv);
        setTimeout(() => alertDiv.remove(), 3000);
      }
      
      console.log("Tarea creada:", data);

      // Refrescar tabla
      fetchAsignaciones();

      // Reset form
      setFormData({
        Tester: "",
        NombreAsignacion: "",
        TipoAsignacion: "",
        FechaEstimada: "",
        FechaAsignacion: "",
        FechaFinalizacion: "",
        FechaActualizacion: "",
        BitacoraComentarios: "",
        Estado: 0,
        IDcedula: ""
      });

    } catch (err) {
      console.error("Error creando tarea:", err);
    }
  };

  const IgualDatoEnInput = (e) => {
    const selectedId = e.target.value;
    const selectedUser = usuariosQA.find(u => u.IDcedula == selectedId);

    setFormData({
      ...formData,
      IDcedula: selectedId,
      Tester: selectedUser ? selectedUser.Nombres : ""
    });
  };

  return (
    <div className="d-flex">
      <div className="flex-grow-1 p-3">
        {/* Botón abrir modal */}
        <div className="mb-3">
          <button
            type="button"
            className="btn btn-primary"
            data-bs-toggle="modal"
            data-bs-target="#ModalGenerarAsignacion"
          >
            Generar Asignacion
          </button>
        </div>

        {/* Tabla */}
        <div>
          <table className="table table-striped table-bordered table-hover">
            <thead className="table-dark">
              <tr>
                <th>Id Asignacion</th>
                <th>Tester</th>
                <th>Nombre de la Asignacion</th>
                <th>Fecha de Asignacion</th>
                <th>Fecha Estimada</th>
                <th>Fecha de Finalizacion</th>
                <th className="text-center">Estado</th>
                <th className="text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {Asignacion.length > 0 ? (
                Asignacion.map((u) => (
                  <tr key={u.IDAsignacion}>
                    <td>{u.IDAsignacion}</td>
                    <td>{u.Tester}</td>
                    <td>{u.NombreAsignacion}</td>
                    <td>{u.FechaAsignacion}</td>
                    <td>{u.FechaEstimada}</td>
                    <td>{u.FechaFinalizacion}</td>
                    <td className="text-center">
                      {u.Estado ? (
                        <span className="badge bg-success">Terminado</span>
                      ) : (
                        <span className="badge bg-danger">Pendiente</span>
                      )}
                    </td>
                    <td className="text-center">
                      {u.Estado ? (
                        <button className="btn btn-danger btn-sm">
                          Desactivar
                        </button>
                      ) : (
                        <button className="btn btn-success btn-sm">
                          Activar
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="text-center">
                    No hay registros
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>


        {/* Modal */}
        <div
          className="modal fade"
          id="ModalGenerarAsignacion"
          tabIndex="-1"
          aria-hidden="true"
        >
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <form onSubmit={handleSubmit}>
                <div className="modal-header">
                  <h5 className="modal-title">Crear Asignación</h5>
                  <button
                    type="button"
                    className="btn-close"
                    data-bs-dismiss="modal"
                  ></button>
                </div>

                <div className="modal-body">
                  <div className="row g-3">

                    {/* QA select */}
                    <div className="col-md-6">
                      <label className="form-label">Asignar a (QA)</label>
                      <select
                        className="form-select"
                        name="IDcedula"
                        value={formData.IDcedula}
                        onChange={IgualDatoEnInput}
                        required
                      >
                        <option value="">Seleccione un agente QA</option>
                        {usuariosQA.map((qa) => (
                          <option key={qa.IDcedula} value={qa.IDcedula}>
                            {qa.Nombres}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Campo Tester (auto completado) */}
                    <div className="col-md-6">
                      <label className="form-label">Tester</label>
                      <input
                        type="text"
                        className="form-control"
                        name="Tester"
                        value={formData.Tester}
                        readOnly // 👈 React requiere camelCase
                      />
                    </div>

                    {/* Nombre Asignación */}
                    <div className="col-md-6">
                      <label className="form-label">Nombre Asignación</label>
                      <input
                        type="text"
                        className="form-control"
                        name="NombreAsignacion"
                        value={formData.NombreAsignacion}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    {/* Tipo Asignación */}
                    <div className="col-md-6">
                      <label className="form-label">Tipo Asignación</label>
                      <input
                        type="text"
                        className="form-control"
                        name="TipoAsignacion"
                        value={formData.TipoAsignacion}
                        onChange={handleChange}
                      />
                    </div>

                    {/* Fechas */}
                    <div className="col-md-6">
                      <label className="form-label">Fecha Estimada</label>
                      <input
                        type="datetime-local"
                        className="form-control"
                        name="FechaEstimada"
                        value={formData.FechaEstimada}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label">Fecha Asignación</label>
                      <input
                        type="datetime-local"
                        className="form-control"
                        name="FechaAsignacion"
                        value={formData.FechaAsignacion}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label">Fecha Finalización</label>
                      <input
                        type="datetime-local"
                        className="form-control"
                        name="FechaFinalizacion"
                        value={formData.FechaFinalizacion}
                        onChange={handleChange}
                      />
                    </div>

                    {/* Comentarios */}
                    <div className="col-md-6">
                      <label className="form-label">Comentarios</label>
                      <input
                        type="text"
                        className="form-control"
                        name="BitacoraComentarios"
                        value={formData.BitacoraComentarios}
                        onChange={handleChange}
                      />
                    </div>

                    {/* Estado */}
                    <div className="col-md-6">
                      <label className="form-label">Estado</label>
                      <select
                        className="form-select"
                        name="Estado"
                        value={formData.Estado}
                        onChange={handleChange}
                      >
                        <option value="1">Terminado</option>
                        <option value="0">Pendiente</option>
                      </select>
                    </div>

                  </div>
                </div>

                <div className="modal-footer">
                  <div id="alertContainer"></div>
                  <button type="submit" className="btn btn-primary">
                    Guardar
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    data-bs-dismiss="modal"
                  >
                    Cerrar
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>


      </div>
    </div>
  );
}

export default AsignarTareas;
