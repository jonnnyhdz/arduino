$(document).ready(function () {
    // Inicializa el gráfico del sensor Ultrasonico
    function initAndUpdateChart1() {
        var ctx = $("#sensorUltrasonico").get(0).getContext("2d");
        var chart = new Chart(ctx, {
            type: "line",
            data: {
                labels: [],
                datasets: [{
                    label: "Distancia",
                    backgroundColor: "rgba(160, 16, 218, 0.5)",
                    borderColor: "rgb(160, 16, 218)",
                    data: [],
                }],
            },
            options: {},
        });

        // Función para obtener y actualizar los datos del sensor Ultrasonico
        function fetchData() {
            $.ajax({
                url: "http://localhost:8082/obtenermensajesultra",
                type: "GET",
                success: function (data) {
                    var labels = data.map(function(e) { return e.fecha; });
                    var sensorData = data.map(function(e) { return e.distancia; });

                    chart.data.labels = labels;
                    chart.data.datasets[0].data = sensorData;
                    chart.update();

                    updateLEDs(data.length > 0 ? data[data.length - 1].led_color : "");
                },
            });
        }

        setInterval(fetchData, 5000);
    }

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
                    var labels = data.map(function(e) { return e.hora; });
                    var sensorData = data.map(function(e) { return e.dato_sensor; });

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

    // Inicializar los gráficos
    initAndUpdateChart1();
    initAndUpdateChart2();
});
