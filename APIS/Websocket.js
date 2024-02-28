// server.js
import express from "express";
import { createServer } from "http";
import { WebSocketServer } from "ws";
import { SerialPort } from "serialport";
import { ReadlineParser } from "@serialport/parser-readline";
import cors from "cors";

const app = express();
const httpServer = createServer(app);
const wss = new WebSocketServer({ server: httpServer });

app.use(express.json());
app.use(cors());

app.get('/api/sensors', (req, res) => {
  res.json({ message: "Datos de sensores" });
});

const PORT_SERIAL = '/dev/cu.usbserial-1420'; // Asegúrate de cambiar esto por tu puerto correcto
const serialPort = new SerialPort({ path: PORT_SERIAL, baudRate: 9600 });
const parser = serialPort.pipe(new ReadlineParser({ delimiter: '\r\n' }));

wss.on('connection', (ws) => {
  console.log('Cliente WebSocket conectado');

  ws.on('message', (data) => {
    console.log('Mensaje recibido: ${data}');
    serialPort.write(data);
  });

  parser.on('data', (line) => {
    console.log('Datos desde Arduino: ${line}');
    ws.send(line);
  });

  ws.on('close', () => console.log('Cliente WebSocket desconectado'));
});

httpServer.listen(8082, () => {
  console.log('Servidor escuchando en http://localhost:8082');
});