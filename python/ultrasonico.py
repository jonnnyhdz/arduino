import serial
import mysql.connector

# Configuración de la conexión a la base de datos MySQL
db_config = {
    'host': "localhost",
    'user': "root",
    'password': "root",
    'database': "sm52_arduino"
}

try:
    # Intentar conectar a la base de datos
    db = mysql.connector.connect(**db_config)
    cursor = db.cursor()
except mysql.connector.Error as err:
    print(f"Error al conectar a MySQL: {err}")
    exit(1)

try:
    # Abrir conexión serial
    arduino = serial.Serial('/dev/cu.usbserial-14230', 9600, timeout=1)  # Ajusta esto al puerto correcto

    while True:
        data = arduino.readline().decode().strip()
        if data:
            datos_separados = data.split(',')
            if len(datos_separados) == 2:  # Asegurarse de que hay dos datos
                distancia = int(datos_separados[0])  # Convertir la distancia a entero
                dato_sensor = int(datos_separados[1])  # Convertir la PIR a entero
                mensaje = "Dato recibido"  # Definir un mensaje básico

                # Determinar el color del LED basado en la distancia
                if distancia < 10:
                    led_color = 'rojo'
                    arduino.write(b'R')  # Enviar comando para LED Rojo
                elif distancia < 20:
                    led_color = 'amarillo'
                    arduino.write(b'A')  # Enviar comando para LED Amarillo
                else:
                    led_color = 'verde'
                    arduino.write(b'V')  # Enviar comando para LED Verde

                # Determinar el estado basado en la detección de movimiento
                estado_movimiento = 'movimiento' if dato_sensor else 'sin_movimiento'
                arduino.write(b'M' if dato_sensor else b'N')

                # Insertar los datos en la base de datos MySQL para la primera tabla
                sql = "INSERT INTO tb_puerto_serial (mensaje, distancia, led_color, fecha) VALUES (%s, %s, %s, NOW())"
                cursor.execute(sql, (mensaje, distancia, led_color))

                # Insertar los datos en la base de datos MySQL para la segunda tabla
                sql2 = "INSERT INTO detecciones (mensaje, dato_sensor, hora, color_led) VALUES (%s, %s, NOW(), %s)"
                cursor.execute(sql2, (mensaje, dato_sensor, estado_movimiento))

                db.commit()

                print(f"Distancia: {distancia} cm, LED: {led_color}, Movimiento: {dato_sensor}, Estado: {estado_movimiento}")

except KeyboardInterrupt:
    print("Programa terminado por el usuario")
except serial.SerialException as e:
    print(f"Error al interactuar con el puerto serial: {e}")
except mysql.connector.Error as err:
    print(f"Error al interactuar con MySQL: {err}")
finally:
    # Cerrar conexiones
    if 'db' in locals() and db.is_connected():
        cursor.close()
        db.close()
    if 'arduino' in locals() and arduino.is_open:
        arduino.close()
