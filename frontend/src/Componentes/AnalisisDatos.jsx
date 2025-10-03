import { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Cell,
  LabelList
} from "recharts";

function AnalisisDatos() {
  const [fechas, setFechas] = useState({ desde: "", hasta: "" });
  const [metrica, setMetricas] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFechas({ ...fechas, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(
        `http://localhost:3000/api/GenerarMetricas?desde=${fechas.desde}&hasta=${fechas.hasta}`
      );
      const data = await res.json();
      setMetricas(data);
    } catch (err) {
      console.error("Error al obtener las métricas:", err);
    }
  };

  // Mantengo los nombres de las keys tal como tú los devolvías (TareasPendintes)
  const dataGrafica = metrica
    ? [
        { name: "Solicitadas", value: Number(metrica.totalAsignaciones ?? 0) },
        { name: "Terminadas", value: Number(metrica.TareasTerminadas ?? 0) },
        { name: "Pendientes", value: Number(metrica.TareasPendintes ?? metrica.TareasPendientes ?? 0) }
      ]
    : [];

  return (
    <div>
      <h3>Generar Estadísticas</h3>
      <form className="row g-2" onSubmit={handleSubmit}>
        <div className="col-md-2">
          <label className="form-label">Fecha desde</label>
          <input
            type="date"
            name="desde"
            className="form-control form-control-sm"
            value={fechas.desde}
            onChange={handleChange}
            required
          />
        </div>

        <div className="col-md-2">
          <label className="form-label">Fecha hasta</label>
          <input
            type="date"
            name="hasta"
            className="form-control form-control-sm"
            value={fechas.hasta}
            onChange={handleChange}
            required
          />
        </div>

        <div className="col-md-2 d-flex align-items-end">
          <button type="submit" className="btn btn-primary btn-sm w-100">
            Consultar
          </button>
        </div>
      </form>

      <hr />

      <div id="GraficaDatos" style={{ width: "100%", height: 420, padding: "20px 0" }}>
        {metrica ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={dataGrafica}
              margin={{ top: 40, right: 30, left: 20, bottom: 20 }}
              barCategoryGap="40%"
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" isAnimationActive={true}>
                <Cell key="c-asign" fill="#0d6efd" /> {/* Azul */}
                <Cell key="c-term" fill="#28a745" />   {/* Verde */}
                <Cell key="c-pend" fill="#dc3545" />   {/* Rojo */}
                <LabelList dataKey="value" position="top" />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-muted text-center">Digite un rango de fechas.</p>
        )}
      </div>
    </div>
  );
}

export default AnalisisDatos;
