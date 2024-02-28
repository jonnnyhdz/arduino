$(document).ready(function () {
    // Inicializa el gráfico del sensor PIR
    function initAndUpdateChart() {
        var ctx = $("#sensorPir").get(0).getContext("2d");
        var chart = new Chart(ctx, {
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
        function fetchData() {
            $.ajax({
                url: "http://localhost:8082/obtenermensajes", // Asegúrate de que esta URL es correcta
                type: "GET",
                success: function (data) {
                    var labels = data.map(function(e) { return e.hora; });
                    var sensorData = data.map(function(e) { return e.dato_sensor; });

                    chart.data.labels = labels;
                    chart.data.datasets[0].data = sensorData;
                    chart.update();

                    updatePIRState(data.length > 0 ? data[data.length - 1].color_led : "");
                },
            });
        }

        setInterval(fetchData, 5000);
    }

    // Actualiza el estado del sensor PIR
    function updatePIRState(state) {
        $("#pirr1").attr("src", state === "movimiento" ? "img/movimiento.svg" : "img/sin_movimiento.svg");
    }

    // Inicializar el gráfico
    initAndUpdateChart();

    // Script del control del LED vía WebSocket
    const socket = new WebSocket('ws://localhost:8082');
    const controlPanel = document.getElementById('control-panel');
    const toggleBtn = document.getElementById('toggleBtn');

    socket.onopen = () => console.log("Conexión con el servidor WebSocket establecida.");
    socket.onclose = () => console.log("La conexión WebSocket se ha cerrado.");
    socket.onerror = error => console.log(`Error en la conexión WebSocket: ${error.message}`);
    socket.onmessage = event => console.log(`Mensaje del servidor: ${event.data}`);

    toggleBtn.addEventListener('change', () => {
        const ledState = toggleBtn.checked ? 1 : 0;
        const url = "http://localhost:8082/crearestadoled"; // Asegúrate de que la URL sea correcta
    
        $.ajax({
            url: url,
            type: "POST",
            contentType: "application/json",
            dataType: 'json', // Añade esta línea
            data: JSON.stringify({ activar: ledState }),
            success: function (data) {
                console.log("Estado del LED actualizado correctamente en la base de datos");
            },
            error: function (error) {
                console.error("Error al actualizar el estado del LED:", error);
            }
        });
    
        controlPanel.style.backgroundColor = toggleBtn.checked ? "#fff3cd" : "#002244";
        controlPanel.style.color = toggleBtn.checked ? "#856404" : "white";
        console.log(`Enviando estado del LED a la base de datos: ${ledState}`);
    });
    
    
    // Resto del código existente

    document.getElementById('led-on').addEventListener('click', () => {
        console.log('Enviando comando para encender el LED');
        if (socket.readyState === WebSocket.OPEN) {
            socket.send('LED_ON');
            controlPanel.style.backgroundColor = "#fff3cd"; // Amarillo pastel
            controlPanel.style.color = "#856404"; // Contraste para texto
        }
    });

    document.getElementById('led-off').addEventListener('click', () => {
        console.log('Enviando comando para apagar el LED');
        if (socket.readyState === WebSocket.OPEN) {
            socket.send('LED_OFF');
            controlPanel.style.backgroundColor = "#002244"; // Azul noche
            controlPanel.style.color = "white"; // Contraste para texto
        }
    });
});
