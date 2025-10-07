import { useEffect, useState } from "react";
import { Modal } from "bootstrap";

function MisTareas() {
  const [asignaciones, setAsignaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tareaSeleccionada, setTareaSeleccionada] = useState(null);
  const [fechaFinalizacion, setFechaFinalizacion] = useState("");
  const [idCaseActual, setIdCaseActual] = useState(null);

  useEffect(() => {
    fetchTareas();
  }, []);

  // 🔹 Cargar tareas asignadas
  const fetchTareas = async () => {
    try {
      const res = await fetch("http://localhost:3000/api/misTareas", {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Error al obtener las tareas");
      const data = await res.json();
      setAsignaciones(data);
    } catch (err) {
      console.error(err);
      setError("Error al conectar con el servidor");
    } finally {
      setLoading(false);
    }
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return "—";
    const date = new Date(fecha);
    return date.toLocaleDateString("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // ✏️ Modal editar fecha de finalización
  const handleEditar = (tarea) => {
    setTareaSeleccionada(tarea);
    setFechaFinalizacion(
      tarea.FechaFinalizacion
        ? tarea.FechaFinalizacion.slice(0, 16)
        : new Date().toISOString().slice(0, 16)
    );
    Modal.getOrCreateInstance("#ModalEditarFecha").show();
  };

  const handleGuardarFecha = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:3000/api/EditarFecha", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          IDAsignacion: tareaSeleccionada.IDAsignacion,
          FechaFinalizacion: fechaFinalizacion,
        }),
      });
      const data = await res.json();
      if (data.success) {
        fetchTareas();
        Modal.getInstance("#ModalEditarFecha").hide();
      }
    } catch (err) {
      console.error("Error al guardar fecha:", err);
    }
  };

  // 🧩 PANEL DE CASOS DE PRUEBA
  const handleAgregarCasos = async (idAsignacion) => {
    const modal = Modal.getOrCreateInstance("#ModalPanelPruebas");
    modal.show();

    const panelDiv = document.getElementById("panel-content");
    panelDiv.innerHTML = "<p class='text-center'>Cargando datos...</p>";

    const resPlan = await fetch(`http://localhost:3000/api/testplan/${idAsignacion}`);
    const plan = await resPlan.json();

    if (plan.length === 0) {
      panelDiv.innerHTML = `
        <div class="text-center">
          <p>No existe un plan de pruebas para esta asignación.</p>
          <button class="btn btn-success" id="btnCrearPlan">🧾 Crear Plan de Pruebas</button>
        </div>
      `;
      document.getElementById("btnCrearPlan").onclick = async () => {
        const nuevoPlan = {
          IDAsignacionFK: idAsignacion,
          Desarrollador: "Backend QA",
          Version: 1,
          Usuario: "Tester",
          Descripcion: "Plan inicial de pruebas",
        };
        await fetch("http://localhost:3000/api/testplan", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(nuevoPlan),
        });
        handleAgregarCasos(idAsignacion);
      };
    } else {
      const idPlan = plan[0].IDPlan;
      const resCases = await fetch(`http://localhost:3000/api/testcases/${idPlan}`);
      const cases = await resCases.json();

      panelDiv.innerHTML = `
        <h6>🧪 Casos de Prueba del Plan #${idPlan}</h6>
        <button class="btn btn-success mb-3" id="btnAgregarCaso">➕ Nuevo Caso</button>
        <table class="table table-bordered table-striped text-center align-middle">
          <thead class="table-dark">
            <tr>
              <th>ID</th><th>Tester</th><th>Descripción</th><th>Comentario</th><th>Estado</th><th>Acción</th>
            </tr>
          </thead>
          <tbody>
          ${cases
            .map(
              (c) => `
              <tr>
                <td>${c.IDCase}</td>
                <td>${c.Tester}</td>
                <td>${c.Descripcion || "—"}</td>
                <td>${c.Comentario || ""}</td>
                <td>${c.Estado ? "✅ Ejecutado" : "⏳ Pendiente"}</td>
                <td>
                  ${
                    c.Estado
                      ? ""
                      : `<button class='btn btn-primary btn-sm ejecutar' data-id='${c.IDCase}'>▶ Ejecutar</button>`
                  }
                </td>
              </tr>`
            )
            .join("")}
          </tbody>
        </table>
      `;

      // ➕ Crear nuevo caso
      document.getElementById("btnAgregarCaso").onclick = async () => {
        const nuevoCaso = {
          IDPlanFK: idPlan,
          Tester: "Tester QA",
          RutaEvidencia: "",
          Comentario: "Nuevo caso agregado desde panel",
          Descripcion: "Descripción pendiente...",
        };
        await fetch("http://localhost:3000/api/testcase", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(nuevoCaso),
        });
        handleAgregarCasos(idAsignacion);
      };

      // ▶ Ejecutar caso
      document.querySelectorAll(".ejecutar").forEach((btn) => {
        btn.onclick = () => {
          setIdCaseActual(btn.dataset.id);
          Modal.getOrCreateInstance("#ModalEjecucionCaso").show();
        };
      });
    }
  };

  // ▶ Guardar evidencia y ejecución
  const handleEjecucion = async (e) => {
    e.preventDefault();
    const form = e.target;
    const comentario = form.comentario.value;
    const archivo = form.evidencia.files[0];

    const formData = new FormData();
    formData.append("Comentario", comentario);
    if (archivo) formData.append("evidencia", archivo);

    const res = await fetch(
      `http://localhost:3000/api/testcase/ejecutar/${idCaseActual}`,
      {
        method: "PUT",
        body: formData,
      }
    );

    if (res.ok) {
      alert("✅ Caso ejecutado correctamente");
      Modal.getInstance("#ModalEjecucionCaso").hide();
      handleAgregarCasos(tareaSeleccionada?.IDAsignacion);
    } else {
      alert("❌ Error al ejecutar el caso");
    }
  };

  if (loading) return <p>Cargando tareas...</p>;
  if (error)
    return (
      <div className="alert alert-danger text-center my-3" role="alert">
        {error}
      </div>
    );

  return (
    <div className="container mt-4">
      <h3 className="mb-4 text-center">📋 Mis Tareas</h3>
      <table className="table table-striped table-bordered table-hover align-middle">
        <thead className="table-dark text-center">
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Asignación</th>
            <th>Estimada</th>
            <th>Finalización</th>
            <th>Estado</th>
            <th>Acción</th>
          </tr>
        </thead>
        <tbody className="text-center">
          {asignaciones.map((u) => (
            <tr key={u.IDAsignacion}>
              <td>{u.IDAsignacion}</td>
              <td>{u.NombreAsignacion}</td>
              <td>{formatearFecha(u.FechaAsignacion)}</td>
              <td>{formatearFecha(u.FechaEstimada)}</td>
              <td>{formatearFecha(u.FechaFinalizacion)}</td>
              <td>
                {u.FechaFinalizacion ? (
                  <span className="badge bg-success">Terminado</span>
                ) : (
                  <span className="badge bg-danger">Pendiente</span>
                )}
              </td>
              <td>
                <div className="d-flex justify-content-center gap-2">
                  <button
                    className="btn btn-warning btn-sm"
                    onClick={() => handleEditar(u)}
                  >
                    ✏️ Editar
                  </button>
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => {
                      setTareaSeleccionada(u);
                      handleAgregarCasos(u.IDAsignacion);
                    }}
                  >
                    🧩 Panel de Pruebas
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* ✏️ Modal Editar Fecha */}
      <div className="modal fade" id="ModalEditarFecha" tabIndex="-1">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <form onSubmit={handleGuardarFecha}>
              <div className="modal-header bg-warning">
                <h5 className="modal-title">Guardar Fecha de Terminacion</h5>
                <button
                  type="button"
                  className="btn-close"
                  data-bs-dismiss="modal"
                ></button>
              </div>
              <div className="modal-body">
                <input
                  type="datetime-local"
                  className="form-control"
                  value={fechaFinalizacion}
                  onChange={(e) => setFechaFinalizacion(e.target.value)}
                  required
                />
              </div>
              <div className="modal-footer">
                <button type="submit" className="btn btn-success">
                  💾 Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* 🧪 Modal Panel de Pruebas */}
      <div className="modal fade" id="ModalPanelPruebas" tabIndex="-1">
        <div className="modal-dialog modal-xl modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header bg-primary text-white">
              <h5 className="modal-title">🧩 Panel de Casos de Prueba</h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
              ></button>
            </div>
            <div className="modal-body" id="panel-content"></div>
          </div>
        </div>
      </div>

      {/* ▶ Modal de Ejecución */}
      <div className="modal fade" id="ModalEjecucionCaso" tabIndex="-1">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <form onSubmit={handleEjecucion}>
              <div className="modal-header bg-info text-white">
                <h5 className="modal-title">▶ Ejecutar Caso</h5>
                <button
                  type="button"
                  className="btn-close"
                  data-bs-dismiss="modal"
                ></button>
              </div>
              <div className="modal-body">
                <label>Comentario:</label>
                <textarea
                  name="comentario"
                  className="form-control mb-3"
                  required
                />
                <label>Evidencia (imagen):</label>
                <input
                  type="file"
                  name="evidencia"
                  accept="image/*"
                  className="form-control"
                />
              </div>
              <div className="modal-footer">
                <button type="submit" className="btn btn-success">
                  💾 Guardar Ejecución
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MisTareas;
