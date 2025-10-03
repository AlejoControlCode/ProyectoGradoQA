import { useEffect, useState } from "react";

function CrearUsuario() {
  const [usuarios, setUsuarios] = useState([]);
  const [formData, setFormData] = useState({
    IDcedula: "",
    Nombres: "",
    Contrasenia: "",
    Genero: "",
    Correo: "",
    Telefono: "",
    Ciudad: "",
    Cargo: "",
    rol: "",
    FechaRegistro: "",
    Estado: 1,
  });

  // Cargar usuarios al inicio
  const fetchUsuarios = () => {
    fetch("http://localhost:3000/api/usuarios")
      .then((res) => res.json())
      .then((data) => setUsuarios(data))
      .catch((err) => console.error("Error cargando usuarios:", err));
  };

  useEffect(() => {
    fetchUsuarios();
  }, []);

  // Manejar cambios en el formulario
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Enviar formulario (crear usuario)
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:3000/api/Crearusuarios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (data.success) {
        const alertDiv = document.createElement("div");
        alertDiv.classList.add("alert", "alert-success", "mt-3");
        alertDiv.setAttribute("role", "alert");
        alertDiv.textContent = data.message;
        document.getElementById("alertContainer").appendChild(alertDiv);

        fetchUsuarios(); // recargar tabla
        setFormData({
          IDcedula: "",
          Nombres: "",
          Contrasenia: "",
          Genero: "",
          Correo: "",
          Telefono: "",
          Ciudad: "",
          Cargo: "",
          rol: "",
          FechaRegistro: "",
          Estado: 1,
        });

        setTimeout(() => alertDiv.remove(), 3000);

        // cerrar modal
        let modal = bootstrap.Modal.getInstance(
          document.getElementById("exampleModal")
        );
        modal.hide();
      } else {
        alert("❌ Error al guardar usuario");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  // 👉 Función para activar/desactivar usuario
  const toggleEstado = async (id, nuevoEstado) => {
    try {
      const res = await fetch(`http://localhost:3000/api/usuarios/${id}/estado`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ Estado: nuevoEstado }),
      });

      const data = await res.json();
      if (data.success) {
        const alertDiv = document.createElement("div");
        alertDiv.classList.add("alert", "alert-success", "mt-3");
        alertDiv.setAttribute("role", "alert");
        alertDiv.textContent = data.message;
        document.getElementById("alertContainer").appendChild(alertDiv);

        fetchUsuarios(); // recargar tabla

        setTimeout(() => alertDiv.remove(), 3000);
      } else {
        alert("❌ Error al cambiar estado del usuario");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div className="d-flex">
      <div className="flex-grow-1 p-3">
        {/* Botón para abrir modal */}
        <div className="mb-3">
          <button
            type="button"
            className="btn btn-primary"
            data-bs-toggle="modal"
            data-bs-target="#exampleModal"
          >
            Crear Usuario
          </button>
        </div>

        {/* Tabla de usuarios */}
        <div>
          <table className="table table-striped table-bordered table-hover">
            <thead className="table-dark">
              <tr>
                <th>Id</th>
                <th>Nombre</th>
                <th>Rol</th>
                <th className="text-center">Estado</th>
                <th className="text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.length > 0 ? (
                usuarios.map((u) => (
                  <tr key={u.IDcedula}>
                    <td>{u.IDcedula}</td>
                    <td>{u.Nombres}</td>
                    <td>{u.rol}</td>
                    <td className="text-center">
                      {u.Estado ? (
                        <span className="badge bg-success">Activo</span>
                      ) : (
                        <span className="badge bg-danger">Inactivo</span>
                      )}
                    </td>
                    <td className="text-center">
                      {u.Estado ? (
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => toggleEstado(u.IDcedula, 0)}
                        >
                          Desactivar
                        </button>
                      ) : (
                        <button
                          className="btn btn-success btn-sm"
                          onClick={() => toggleEstado(u.IDcedula, 1)}
                        >
                          Activar
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center">
                    No hay usuarios
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Modal con formulario */}
        <div
          className="modal fade"
          id="exampleModal"
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
                        <option value="AgenteQA">Agente QA</option>
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
        </div>
      </div>
    </div>
  );
}

export default CrearUsuario;
