$(document).ready(function () {

  // Inicializa el gráfico del sensor PIR
  function initAndUpdateChart2() {
      var ctx2 = $("#sensorPir").get(0).getContext("2d");
      var chart2 = new Chart(ctx2, {
          type: "line",
          data: {
              labels: [],
              datasets: [{
                  label: "PIR",
                  backgroundColor: "rgba(51, 141, 255, 0.5)",
                  borderColor: "rgb(51, 141, 255)",
                  data: [],
              }],
          },
          options: {},
      });

      // Función para obtener y actualizar los datos del sensor PIR
      function fetchData2() {
          $.ajax({
              url: "http://localhost:8082/obtenermensajes", // Asegúrate de que esta URL es correcta
              type: "GET",
              success: function (data) {
                  var labels = data.map(function (e) { return e.hora; });
                  var sensorData = data.map(function (e) { return e.dato_sensor; });

                  chart2.data.labels = labels;
                  chart2.data.datasets[0].data = sensorData;
                  chart2.update();

                  updatePIRState(data.length > 0 ? data[data.length - 1].color_led : "");
              },
          });
      }

      setInterval(fetchData2, 5000);
  }

  // Actualiza el estado de los LEDs
  function updateLEDs(color) {
      $("#led1").attr("src", "img/VERDE-OFF.svg");
      $("#led2").attr("src", "img/AMARILLO-OFF.svg");
      $("#led3").attr("src", "img/ROJO-OFF.svg");

      switch (color) {
          case "rojo":
              $("#led3").attr("src", "img/ROJO-ON.svg");
              break;
          case "amarillo":
              $("#led2").attr("src", "img/AMARILLO-ON.svg");
              break;
          case "verde":
              $("#led1").attr("src", "img/VERDE-ON.svg");
              break;
      }
  }

  // Actualiza el estado del sensor PIR
  function updatePIRState(state) {
      $("#pirr1").attr("src", state === "movimiento" ? "img/movimiento.svg" : "img/sin_movimiento.svg");
  }

  // Inicializar el gráfico del sensor PIR
  initAndUpdateChart2();

  // WebSocket
  const websocket = new WebSocket("ws://localhost:8766");

  websocket.onopen = () => console.log("Conectado al servidor WebSocket");

  // Manejar mensajes recibidos del servidor
  websocket.onmessage = (event) => {
      const message = event.data;
      console.log("Mensaje recibido:", message);

      // Actualiza la interfaz de usuario según el estado del LED
      const toggleBtn = document.getElementById("toggleBtn");

      if (message === "1") {
          toggleBtn.checked = true;
      } else if (message === "0") {
          toggleBtn.checked = false;
      }
  };

  document.getElementById("toggleBtn").addEventListener("change", function () {
      const command = this.checked ? "1" : "0";
      websocket.send(command);
      console.log("Enviado:", command);
  });
});
