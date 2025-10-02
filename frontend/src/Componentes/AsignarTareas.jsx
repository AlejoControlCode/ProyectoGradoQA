import { useEffect, useState } from "react";


function AsignarTareas(){
      const [Asignacion, setAsignacion] = useState([]);

        const fetchAsignaciones = () => {
            fetch("http://localhost:3000/api/TodasAsignaciones")
            .then((res) => res.json())
            .then((data) => setAsignacion(data))
            .catch((err) => console.error("Error cargando Asignaciones:", err));
        };
    
        useEffect(() => {
        fetchAsignaciones();
        }, []);

    return (
    <div className="d-flex">
      <div className="flex-grow-1 p-3">
        {/* Botón para abrir modal */}
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

        {/* Tabla de usuarios */}
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
                            <button
                            className="btn btn-danger btn-sm"
                            onClick={() => toggleEstado(u.IDAsignacion, 0)}
                            >
                            Desactivar
                            </button>
                        ) : (
                            <button
                            className="btn btn-success btn-sm"
                            onClick={() => toggleEstado(u.IDAsignacion, 1)}
                            >
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

        {/* Modal con formulario */}
        {/* <div
          className="modal fade"
          id="ModalGenerarAsignacion"
          tabIndex="-1"
          aria-hidden="true"
        >
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <form onSubmit={handleSubmit}>
                <div className="modal-header">
                  <h5 className="modal-title">Crea un Usuario!!</h5>
                  <button
                    type="button"
                    className="btn-close"
                    data-bs-dismiss="modal"
                  ></button>
                </div>

                <div className="modal-body">
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label">Cédula</label>
                      <input
                        type="number"
                        className="form-control"
                        name="IDcedula"
                        value={formData.IDcedula}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label">Nombres</label>
                      <input
                        type="text"
                        className="form-control"
                        name="Nombres"
                        value={formData.Nombres}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label">Contraseña</label>
                      <input
                        type="password"
                        className="form-control"
                        name="Contrasenia"
                        value={formData.Contrasenia}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label">Género</label>
                      <select
                        className="form-select"
                        name="Genero"
                        value={formData.Genero}
                        onChange={handleChange}
                      >
                        <option value="">Seleccione género</option>
                        <option value="Masculino">Masculino</option>
                        <option value="Femenino">Femenino</option>
                        <option value="Otro">Otro</option>
                      </select>
                    </div>

                    <div className="col-md-6">
                      <label className="form-label">Correo</label>
                      <input
                        type="email"
                        className="form-control"
                        name="Correo"
                        value={formData.Correo}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label">Teléfono</label>
                      <input
                        type="number"
                        className="form-control"
                        name="Telefono"
                        value={formData.Telefono}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label">Ciudad</label>
                      <input
                        type="text"
                        className="form-control"
                        name="Ciudad"
                        value={formData.Ciudad}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label">Cargo</label>
                      <input
                        type="text"
                        className="form-control"
                        name="Cargo"
                        value={formData.Cargo}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label">Rol</label>
                      <select
                        className="form-select"
                        name="rol"
                        value={formData.rol}
                        onChange={handleChange}
                      >
                        <option value="">Seleccione rol</option>
                        <option value="Administrador">Administrador</option>
                        <option value="Agente QA">Agente QA</option>
                      </select>
                    </div>

                    <div className="col-md-6">
                      <label className="form-label">Fecha Registro</label>
                      <input
                        type="datetime-local"
                        className="form-control"
                        name="FechaRegistro"
                        value={formData.FechaRegistro}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label">Estado</label>
                      <select
                        className="form-select"
                        name="Estado"
                        value={formData.Estado}
                        onChange={handleChange}
                      >
                        <option value="1">Activo</option>
                        <option value="0">Inactivo</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="modal-footer">
                  <div id="alertContainer"></div>

                  <button type="submit" className="btn btn-primary">
                    Guardar Usuario
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
        </div> */}
      </div>
    </div>
    )

}

export default AsignarTareas;