import express from "express";
import mysql from "mysql";
import cors from 'cors';

const app = express();
app.use(
  express.json(),
  cors()
);



// Asegúrate de que estos son los detalles correctos para conectarte a tu base de datos MySQL
const conexion = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'sm52_arduino' // Este debe ser el nombre de tu base de datos
});

conexion.connect(function (error) {
  if (error) {
    console.error("Error al conectar a la base de datos: ", error);
    process.exit(1); // Salir del proceso si no podemos conectarnos a la base de datos
  } else {
    console.log("Conexión realizada exitosamente a la base de datos");
  }
});

app.get('/obtenermensajes', (req, res) => {
  const sql = "SELECT mensaje, dato_sensor, hora, color_led FROM detecciones ORDER BY id DESC LIMIT 100";
  conexion.query(sql, (error, resultado) => {
    if (error) {
      console.error("Error en la consulta obtenermensajes: ", error);
      return res.status(500).json({ error: "Error en la consulta obtenermensajes", details: error.message });
    }
    return res.status(200).json(resultado);
  });
});

app.get('/obtenermensajesultra', (req, res) => {
  // Asegúrate de que los nombres de las columnas coincidan con los de tu base de datos
  const sql = "SELECT mensaje, led_color, fecha, distancia FROM tb_puerto_serial ORDER BY id_puerto_serial DESC LIMIT 100";
  conexion.query(sql, (error, resultado) => {
    if (error) {
      console.error("Error en la consulta obtenermensajesultra: ", error);
      return res.status(500).json({ error: "Error en la consulta obtenermensajesultra", details: error.message });
    }
    // Envía el resultado de la consulta como JSON
    return res.status(200).json(resultado);
  });
});



app.post('/crearmensajes', (req, res) => {
  const { mensaje, dato_sensor } = req.body;
  const sql = "INSERT INTO tb_puerto_serial (mensaje, dato_sensor) VALUES (?, ?)";
  conexion.query(sql, [mensaje, dato_sensor], (error, resultado) => {
    if (error) return res.status(500).json({ error: "Error al crear el mensaje" });
    return res.status(201).json({ message: "Mensaje creado exitosamente", id: resultado.insertId });
  });
});

app.put('/actualizarmensajes/:id', (req, res) => {
  const { mensaje, dato_sensor } = req.body;
  const { id } = req.params;
  const sql = "UPDATE tb_puerto_serial SET mensaje = ?, dato_sensor = ? WHERE id = ?";
  conexion.query(sql, [mensaje, dato_sensor, id], (error, resultado) => {
    if (error) return res.status(500).json({ error: "Error al actualizar el mensaje" });
    if (resultado.affectedRows === 0) return res.status(404).json({ error: "Mensaje no encontrado" });
    return res.status(200).json({ message: "Mensaje actualizado exitosamente" });
  });
});

app.delete('/borrarmensajes/:id', (req, res) => {
  const { id } = req.params;
  const sql = "DELETE FROM tb_puerto_serial WHERE id = ?";
  conexion.query(sql, [id], (error, resultado) => {
    if (error) return res.status(500).json({ error: "Error al borrar el mensaje" });
    if (resultado.affectedRows === 0) return res.status(404).json({ error: "Mensaje no encontrado" });
    return res.status(200).json({ message: "Mensaje borrado exitosamente" });
  });
});

app.get('/obtenerDeteccionBetween', (req, res) => {
  const min = req.query.min;
  const max = req.query.max;
  const sql = "SELECT * FROM detecciones WHERE dato_sensor BETWEEN ? AND ?";
  conexion.query(sql, [min, max], (error, resultado) => {
    if (error) {
      return res.status(500).json({ error: "Error en la consulta" });
    }
    return res.status(200).json(resultado);
  });
});

app.get('/favicon.ico', (req, res) => res.status(204).end());


app.post("/api/crearestadoled", (req, res) => { // Cambia la ruta a '/api/crearestadoled'
  const { activar } = req.body;

  const sql = "INSERT INTO led_control (estatus) VALUES (?)";
  conexion.query(sql, [activar], (err, result) => {
    if (err) {
      console.error("Error al insertar el registro en la base de datos:", err);
      res.status(500).json({ error: "Error interno del servidor" });
    } else {
      console.log("Registro insertado correctamente en la base de datos");
      res.json({ success: true });
    }
  });
});


app.listen(8082, () => {
  console.log("Servidor en el puerto 8082");
});