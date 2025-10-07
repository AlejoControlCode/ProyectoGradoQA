import { useState } from "react";

function PerfilUsuario() {
  const [cedula, setCedula] = useState("");
  const [usuario, setUsuario] = useState(null);
  const [formData, setFormData] = useState(null);

  const buscarUsuario = async () => {
    try {
      const res = await fetch(`http://localhost:3000/api/usuario/${cedula}`, { credentials: "include" });
      if (!res.ok) throw new Error("Usuario no encontrado");
      const data = await res.json();
      setUsuario(data);
      setFormData(data);
    } catch (err) {
      alert("❌ No se encontró usuario con esa cédula");
      setUsuario(null);
      setFormData(null);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`http://localhost:3000/api/usuario/${cedula}`, {
        method: "PUT",
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
      } else {
        const alertDiv = document.createElement("div");
        alertDiv.classList.add("alert", "alert-success", "mt-3");
        alertDiv.setAttribute("role", "alert");
        alertDiv.textContent = data.message;
        document.getElementById("alertContainer").appendChild(alertDiv);

        setTimeout(() => alertDiv.remove(), 3000);
      }
    } catch (err) {
      console.error("Error:", err);
    }
  };

  return (
    <div className="container mt-4">
      <h3>Gestión de Usuarios</h3>

      {/* Buscar usuario por cédula */}
      <div className="row mb-3">
        <div className="col-md-4">
          <input
            type="number"
            className="form-control"
            placeholder="Digite la cédula"
            value={cedula}
            onChange={(e) => setCedula(e.target.value)}
          />
        </div>
        <div className="col-md-2">
          <button className="btn btn-primary w-100" onClick={buscarUsuario}>
            Buscar
          </button>
        </div>
      </div>

      {/* Si encuentra el usuario, muestra el formulario */}
      {usuario && (
        <form onSubmit={handleSubmit} className="row g-3">
          <div className="col-md-6">
            <label className="form-label">Cédula</label>
            <input type="text" className="form-control" value={formData.IDcedula} disabled />
          </div>

          <div className="col-md-6">
            <label className="form-label">Nombre</label>
            <input
              type="text"
              className="form-control"
              name="Nombres"
              value={formData.Nombres}
              onChange={handleChange}
            />
          </div>

          <div className="col-md-6">
            <label className="form-label">Correo</label>
            <input
              type="email"
              className="form-control"
              name="Correo"
              value={formData.Correo}
              onChange={handleChange}
            />
          </div>

          <div className="col-md-6">
            <label className="form-label">Teléfono</label>
            <input
              type="text"
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
            <input type="text" className="form-control" value={formData.rol} disabled />
          </div>

          <div className="col-12">
            <button type="submit" className="btn btn-success">
              Guardar Cambios
            </button>

            <div className="col-8" id="alertContainer"></div>
          </div>
        </form>
      )}
    </div>
  );
}

export default PerfilUsuario;
