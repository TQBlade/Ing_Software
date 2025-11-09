

-- Conexión a la base de datos predeterminada
\c postgres

SELECT 'Paso 01: Iniciando el Script.....'  AS paso, pg_sleep(01);

-- Borrar base de datos si existe
SELECT 'Paso 02: Eliminar la bd_carros si Existe.....'  AS paso, pg_sleep(02);
DROP DATABASE IF EXISTS bd_carros;

SELECT 'Paso 03: Crear bd_carros .....'  AS paso, pg_sleep(02);
-- Crear base de datos
CREATE DATABASE bd_carros
WITH 
    OWNER = postgres
    ENCODING = 'UTF8'
    LC_COLLATE = 'es_ES.UTF-8'
    LC_CTYPE = 'es_ES.UTF-8'
    TEMPLATE = template0;

SELECT 'Paso 04: Conectandose a bd_carros_acceso.....'  AS paso, pg_sleep(02);
\c bd_carros

-- 01.- INICIO DEL BLOQUE DE CREACIÓN DE TABLAS BASE
-----------------------------------------------------------------------------------------

-- Tabla de Status (Referencia para el campo 'estado')
SELECT 'Paso 05: Trabajando con TMStatus .....................'  AS paso, pg_sleep(02);
CREATE TABLE tmstatus (
    cods INTEGER NOT NULL PRIMARY KEY,
    dstatus VARCHAR(12) NOT NULL
);

INSERT INTO tmstatus (cods, dstatus) VALUES 
    (0, 'ELIMINADO'),
    (1, 'ACTIVO');

SELECT  * FROM  tmstatus ; 

-- 02.- INICIO DEL BLOQUE DE CREACIÓN DE TABLAS SEGÚN DIAGRAMA
-----------------------------------------------------------------------------------------

-- Tabla rol
SELECT 'Paso 06: Trabajando con rol .....................'  AS paso, pg_sleep(02);
CREATE TABLE rol (
    id_rol SERIAL PRIMARY KEY,
    nombre_rol VARCHAR(50) NOT NULL UNIQUE
);

-- Tabla persona
SELECT 'Paso 07: Trabajando con persona .....................'  AS paso, pg_sleep(02);
CREATE TABLE persona (
    id_persona SERIAL PRIMARY KEY,
    doc_identidad VARCHAR(20) UNIQUE NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    tipo_persona VARCHAR(50) NOT NULL, -- Valores: ESTUDIANTE, DOCENTE, ADMINISTRATIVO
    estado INTEGER NOT NULL DEFAULT 1,
    FOREIGN KEY (estado) REFERENCES tmstatus(cods) ON UPDATE CASCADE ON DELETE RESTRICT
);

-- Tabla vigilante
SELECT 'Paso 08: Trabajando con vigilante .....................'  AS paso, pg_sleep(02);
CREATE TABLE vigilante (
    id_vigilante SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    doc_identidad VARCHAR(20) UNIQUE NOT NULL,
    telefono VARCHAR(15),
    estado INTEGER NOT NULL DEFAULT 1,
    id_rol INTEGER,
    FOREIGN KEY (id_rol) REFERENCES rol(id_rol) ON UPDATE CASCADE ON DELETE RESTRICT,
    FOREIGN KEY (estado) REFERENCES tmstatus(cods) ON UPDATE CASCADE ON DELETE RESTRICT
);

-- Tabla parqueadero
SELECT 'Paso 09: Trabajando con parqueadero .....................'  AS paso, pg_sleep(02);
CREATE TABLE parqueadero (
    id_parqueadero SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    capacidad INTEGER NOT NULL,
    ocupados INTEGER NOT NULL DEFAULT 0
);

-- Tabla turno
SELECT 'Paso 10: Trabajando con turno .....................'  AS paso, pg_sleep(02);
CREATE TABLE turno (
    id_turno SERIAL PRIMARY KEY,
    fecha DATE NOT NULL,
    hora_inicio TIME NOT NULL,
    hora_fin TIME NOT NULL,
    id_vigilante INTEGER NOT NULL,
    id_parqueadero INTEGER NOT NULL,
    UNIQUE (fecha, id_vigilante), -- Un vigilante solo tiene un turno por día
    FOREIGN KEY (id_vigilante) REFERENCES vigilante(id_vigilante) ON UPDATE CASCADE ON DELETE RESTRICT,
    FOREIGN KEY (id_parqueadero) REFERENCES parqueadero(id_parqueadero) ON UPDATE CASCADE ON DELETE RESTRICT
);

-- Tabla punto_de_control
SELECT 'Paso 11: Trabajando con punto_de_control .....................'  AS paso, pg_sleep(02);
CREATE TABLE punto_de_control (
    id_punto SERIAL PRIMARY KEY,
    tipo VARCHAR(50) NOT NULL, -- Entrada, Salida
    id_parqueadero INTEGER NOT NULL,
    FOREIGN KEY (id_parqueadero) REFERENCES parqueadero(id_parqueadero) ON UPDATE CASCADE ON DELETE RESTRICT
);

-- Tabla vehiculo
SELECT 'Paso 12: Trabajando con vehiculo .....................'  AS paso, pg_sleep(02);
CREATE TABLE vehiculo (
    id_vehiculo SERIAL PRIMARY KEY,
    placa VARCHAR(10) UNIQUE NOT NULL,
    tipo VARCHAR(50) NOT NULL,
    color VARCHAR(30),
    id_persona INTEGER NOT NULL,
    FOREIGN KEY (id_persona) REFERENCES persona(id_persona) ON UPDATE CASCADE ON DELETE RESTRICT
);

-- Tabla pase_temporal
SELECT 'Paso 13: Trabajando con pase_temporal .....................'  AS paso, pg_sleep(02);
CREATE TABLE pase_temporal (
    id_pase SERIAL PRIMARY KEY,
    codigo VARCHAR(50) UNIQUE NOT NULL,
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE NOT NULL,
    id_persona INTEGER NOT NULL,
    id_vehiculo INTEGER,
    FOREIGN KEY (id_persona) REFERENCES persona(id_persona) ON UPDATE CASCADE ON DELETE RESTRICT,
    FOREIGN KEY (id_vehiculo) REFERENCES vehiculo(id_vehiculo) ON UPDATE CASCADE ON DELETE RESTRICT
);

-- Tabla identificador (Relacionada con vehiculo)
SELECT 'Paso 14: Trabajando con identificador .....................'  AS paso, pg_sleep(02);
CREATE TABLE identificador (
    id_identificador SERIAL PRIMARY KEY,
    tipo VARCHAR(50) NOT NULL, -- Tag RFID, Código QR, etc.
    codigo VARCHAR(50) UNIQUE NOT NULL,
    estado INTEGER NOT NULL DEFAULT 1,
    id_vehiculo INTEGER,
    FOREIGN KEY (id_vehiculo) REFERENCES vehiculo(id_vehiculo) ON UPDATE CASCADE ON DELETE RESTRICT,
    FOREIGN KEY (estado) REFERENCES tmstatus(cods) ON UPDATE CASCADE ON DELETE RESTRICT
);

-- Tabla acceso
SELECT 'Paso 15: Trabajando con acceso .....................'  AS paso, pg_sleep(02);
CREATE TABLE acceso (
    id_acceso SERIAL PRIMARY KEY,
    fecha_hora TIMESTAMP NOT NULL DEFAULT NOW(),
    resultado VARCHAR(50) NOT NULL, -- Acceso Concedido, Denegado, Error
    observaciones TEXT,
    id_vehiculo INTEGER NOT NULL,
    id_punto INTEGER NOT NULL,
    id_vigilante INTEGER NOT NULL,
    FOREIGN KEY (id_vehiculo) REFERENCES vehiculo(id_vehiculo) ON UPDATE CASCADE ON DELETE RESTRICT,
    FOREIGN KEY (id_punto) REFERENCES punto_de_control(id_punto) ON UPDATE CASCADE ON DELETE RESTRICT,
    FOREIGN KEY (id_vigilante) REFERENCES vigilante(id_vigilante) ON UPDATE CASCADE ON DELETE RESTRICT
);

-- Tabla alerta
SELECT 'Paso 16: Trabajando con alerta .....................'  AS paso, pg_sleep(02);
CREATE TABLE alerta (
    id_alerta SERIAL PRIMARY KEY,
    tipo VARCHAR(50) NOT NULL,
    detalle TEXT,
    severidad VARCHAR(50),
    id_acceso INTEGER NOT NULL,
    id_vigilante INTEGER NOT NULL,
    FOREIGN KEY (id_acceso) REFERENCES acceso(id_acceso) ON UPDATE CASCADE ON DELETE RESTRICT,
    FOREIGN KEY (id_vigilante) REFERENCES vigilante(id_vigilante) ON UPDATE CASCADE ON DELETE RESTRICT
);

-- Tabla tarifa
SELECT 'Paso 17: Trabajando con tarifa .....................'  AS paso, pg_sleep(02);
CREATE TABLE tarifa (
    id_tarifa SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    condiciones TEXT,
    regla VARCHAR(255),
    valor_base DECIMAL(10, 2) NOT NULL,
    unidad VARCHAR(50) NOT NULL -- Hora, Dia, Mes
);

-- Tabla pago
SELECT 'Paso 18: Trabajando con pago .....................'  AS paso, pg_sleep(02);
CREATE TABLE pago (
    id_pago SERIAL PRIMARY KEY,
    fecha_hora TIMESTAMP NOT NULL DEFAULT NOW(),
    importe DECIMAL(10, 2) NOT NULL,
    medio VARCHAR(50), -- Efectivo, Tarjeta, etc.
    ref_transaccion VARCHAR(100) UNIQUE,
    estado INTEGER NOT NULL DEFAULT 1,
    id_acceso_entrada INTEGER, -- FK a un acceso para la entrada
    id_acceso_salida INTEGER, -- FK a un acceso para la salida
    id_tarifa INTEGER NOT NULL,
    id_vigilante INTEGER NOT NULL,
    FOREIGN KEY (id_acceso_entrada) REFERENCES acceso(id_acceso) ON UPDATE CASCADE ON DELETE RESTRICT,
    FOREIGN KEY (id_acceso_salida) REFERENCES acceso(id_acceso) ON UPDATE CASCADE ON DELETE RESTRICT,
    FOREIGN KEY (id_tarifa) REFERENCES tarifa(id_tarifa) ON UPDATE CASCADE ON DELETE RESTRICT,
    FOREIGN KEY (id_vigilante) REFERENCES vigilante(id_vigilante) ON UPDATE CASCADE ON DELETE RESTRICT,
    FOREIGN KEY (estado) REFERENCES tmstatus(cods) ON UPDATE CASCADE ON DELETE RESTRICT
);

-- Tabla auditoria
SELECT 'Paso 19: Trabajando con auditoria .....................'  AS paso, pg_sleep(02);
CREATE TABLE auditoria (
    id_auditoria SERIAL PRIMARY KEY,
    fecha_hora TIMESTAMP NOT NULL DEFAULT NOW(),
    entidad VARCHAR(50) NOT NULL, -- Nombre de la tabla afectada
    id_entidad INTEGER NOT NULL, -- PK de la entidad afectada
    accion VARCHAR(50) NOT NULL, -- Insert, Update, Delete
    id_vigilante INTEGER NOT NULL, -- Vigilante que realizó la acción
    datos_previos TEXT, -- Datos antes de la modificación (JSON, XML, etc.)
    datos_nuevos TEXT,  -- Datos después de la modificación (JSON, XML, etc.)
    FOREIGN KEY (id_vigilante) REFERENCES vigilante(id_vigilante) ON UPDATE CASCADE ON DELETE RESTRICT
);

-- Tabla para autenticación en sitio web
CREATE TABLE tmusuarios (
	nu SERIAL NOT NULL PRIMARY KEY,
	nombre VARCHAR(40) NOT NULL,
	usuario VARCHAR(40) NOT NULL UNIQUE,
	clave VARCHAR(40) NOT NULL,
	nivel INTEGER NOT NULL, 
	fkcods INTEGER NOT NULL DEFAULT 1,
	FOREIGN KEY(fkcods) REFERENCES tmstatus(cods)  
			ON UPDATE CASCADE ON DELETE RESTRICT 
);


-- 03.- INSERCIÓN DE DATOS BASE Y MASIVOS
-----------------------------------------------------------------------------------------

SELECT 'Paso 20: Insertando datos de ejemplo (rol, parqueadero, vigilante) ...'  AS paso, pg_sleep(02);

-- Insertar roles
INSERT INTO rol (nombre_rol) VALUES
('Vigilante Principal'),
('Vigilante Nocturno'),
('Administrativo');

-- Insertar parqueaderos
INSERT INTO parqueadero (nombre, capacidad) VALUES
('Principal', 100),
('Visitantes', 50);

-- Insertar vigilantes
INSERT INTO vigilante (nombre, doc_identidad, telefono, id_rol) VALUES
('Carlos Rodriguez', '2000000001', '3001112233', 1),
('Ana Ramirez', '2000000002', '3104445566', 2);

-- Insertar turnos (solo un ejemplo)
INSERT INTO turno (fecha, hora_inicio, hora_fin, id_vigilante, id_parqueadero) VALUES
(CURRENT_DATE, '07:00:00', '15:00:00', 1, 1);

-- Insertar puntos de control
INSERT INTO punto_de_control (tipo, id_parqueadero) VALUES
('Entrada', 1),
('Salida', 1);

-- Insertar tarifas
INSERT INTO tarifa (nombre, condiciones, regla, valor_base, unidad) VALUES
('Visitante por hora', 'Tarifa por cada hora o fracción', 'Costo base por hora', 5.00, 'Hora'),
('Residente mensual', 'Tarifa fija mensual', 'Costo fijo', 50.00, 'Mes');

-- --------------------------------------------------------------------------------------
-- INSERCIÓN MASIVA DE PERSONAS (53 Registros) - TIPOS ACTUALIZADOS
-- --------------------------------------------------------------------------------------

SELECT 'Paso 21: Insertando 53 Personas (Base + Masivo) con Tipos ACTUALIZADOS...' AS paso, pg_sleep(02);

INSERT INTO persona (doc_identidad, nombre, tipo_persona, estado) VALUES
('1000000001', 'Juan Perez', 'ESTUDIANTE', 1),
('1000000002', 'Maria Lopez', 'DOCENTE', 1),
('1000000003', 'Pedro Gomez', 'ADMINISTRATIVO', 1),
('1000000004', 'Ana Torres', 'ESTUDIANTE', 1),
('1000000005', 'Pablo Rojas', 'ESTUDIANTE', 1),
('1000000006', 'Sofia Castro', 'ESTUDIANTE', 1),
('1000000007', 'Miguel Rios', 'DOCENTE', 1),
('1000000008', 'Elena Vargas', 'DOCENTE', 1),
('1000000009', 'Ricardo Soto', 'ADMINISTRATIVO', 1),
('1000000010', 'Camila Ortiz', 'ESTUDIANTE', 1),
('1000000011', 'Javier Peña', 'ESTUDIANTE', 1),
('1000000012', 'Valeria Luna', 'ESTUDIANTE', 1),
('1000000013', 'Andres Mora', 'DOCENTE', 1),
('1000000014', 'Lucia Gil', 'ADMINISTRATIVO', 1),
('1000000015', 'Daniel Sierra', 'ESTUDIANTE', 1),
('1000000016', 'Marina Vega', 'ESTUDIANTE', 1),
('1000000017', 'Sergio Bravo', 'DOCENTE', 1),
('1000000018', 'Paula Ramos', 'DOCENTE', 1),
('1000000019', 'Felipe Nuñez', 'ESTUDIANTE', 1),
('1000000020', 'Gabriela Diaz', 'ESTUDIANTE', 1),
('1000000021', 'Jorge Guerrero', 'ESTUDIANTE', 1),
('1000000022', 'Natalia Marin', 'DOCENTE', 1),
('1000000023', 'Roberto Cruz', 'ADMINISTRATIVO', 1),
('1000000024', 'Laura Herrera', 'ESTUDIANTE', 1),
('1000000025', 'Diego Vidal', 'ESTUDIANTE', 1),
('1000000026', 'Isabel Flores', 'ESTUDIANTE', 1),
('1000000027', 'Héctor Cárdenas', 'DOCENTE', 1),
('1000000028', 'Marta Navarro', 'ADMINISTRATIVO', 1),
('1000000029', 'Esteban Parra', 'ESTUDIANTE', 1),
('1000000030', 'Victoria Salas', 'ESTUDIANTE', 1),
('1000000031', 'Simón Acosta', 'ESTUDIANTE', 1),
('1000000032', 'Alejandra Pardo', 'DOCENTE', 1),
('1000000033', 'Benjamín Caro', 'ADMINISTRATIVO', 1),
('1000000034', 'Lorena Rico', 'ESTUDIANTE', 1),
('1000000035', 'Gustavo Reyes', 'ESTUDIANTE', 1),
('1000000036', 'Andrea Gómez', 'ESTUDIANTE', 1),
('1000000037', 'David Quintero', 'DOCENTE', 1),
('1000000038', 'Monica Latorre', 'ADMINISTRATIVO', 1),
('1000000039', 'Cristian Blanco', 'ESTUDIANTE', 1),
('1000000040', 'Silvana Morales', 'ESTUDIANTE', 1),
('1000000041', 'Mario Zapata', 'ESTUDIANTE', 1),
('1000000042', 'Liliana Durán', 'DOCENTE', 1),
('1000000043', 'Emilio Rueda', 'ADMINISTRATIVO', 1),
('1000000044', 'Adriana Peña', 'ESTUDIANTE', 1),
('1000000045', 'Carlos Vélez', 'ESTUDIANTE', 1),
('1000000046', 'Diana Echeverri', 'ESTUDIANTE', 1),
('1000000047', 'Oscar Gil', 'DOCENTE', 1),
('1000000048', 'Jimena Hoyos', 'ADMINISTRATIVO', 1),
('1000000049', 'Raúl Torres', 'ESTUDIANTE', 1),
('1000000050', 'Teresa Soto', 'ESTUDIANTE', 1),
('1000000051', 'Víctor Castro', 'ESTUDIANTE', 1),
('1000000052', 'Yolanda Ríos', 'DOCENTE', 1),
('1000000053', 'Juancho', 'ESTUDIANTE', 1); 

SELECT  * FROM  persona;

-- --------------------------------------------------------------------------------------
-- INSERCIÓN MASIVA DE VEHÍCULOS (102 Registros)
-- --------------------------------------------------------------------------------------

SELECT 'Paso 22: Insertando 102 Vehículos (Base + Masivo) ...' AS paso, pg_sleep(02);

INSERT INTO vehiculo (placa, tipo, color, id_persona) VALUES
('ABC1234', 'Automovil', 'Rojo', 1),
('XYZ5678', 'Motocicleta', 'Blanco', 2),
('ABC4D32', 'Automovil', 'Gris', 4),  
('EFG5H61', 'Automovil', 'Negro', 5),
('HIJ6K70', 'Motocicleta', 'Blanco', 6),
('LMN7P89', 'Automovil', 'Azul', 7),
('QRS8T98', 'Camioneta', 'Rojo', 8),
('UVW9X07', 'Automovil', 'Verde', 9),
('YZA0B16', 'Motocicleta', 'Amarillo', 10),
('CDE1F25', 'Automovil', 'Plateado', 11),
('FGH2I34', 'Automovil', 'Dorado', 12),
('JKL3M43', 'Motocicleta', 'Gris', 13),
('NOP4Q52', 'Automovil', 'Negro', 14),
('RST5U61', 'Camioneta', 'Blanco', 15),
('VXY6Z70', 'Automovil', 'Azul', 16),
('ZAB7C89', 'Motocicleta', 'Rojo', 17),
('CDE8F98', 'Automovil', 'Verde', 18),
('FGH9I07', 'Automovil', 'Amarillo', 19),
('JKL0M16', 'Motocicleta', 'Plateado', 20),
('NOP1Q25', 'Automovil', 'Dorado', 21),
('RST2U34', 'Camioneta', 'Gris', 22),
('VXY3Z43', 'Automovil', 'Negro', 23),
('ZAB4C52', 'Motocicleta', 'Blanco', 24),
('CDE5F61', 'Automovil', 'Azul', 25),
('FGH6I70', 'Automovil', 'Rojo', 26),
('JKL7M89', 'Motocicleta', 'Verde', 27),
('NOP8Q98', 'Automovil', 'Amarillo', 28),
('RST9U07', 'Camioneta', 'Plateado', 29),
('VXY0Z16', 'Automovil', 'Dorado', 30),
('ZAB1C25', 'Motocicleta', 'Gris', 31),
('CDE2F34', 'Automovil', 'Negro', 32),
('FGH3I43', 'Automovil', 'Blanco', 33),
('JKL4M52', 'Motocicleta', 'Azul', 34),
('NOP5Q61', 'Automovil', 'Rojo', 35),
('RST6U70', 'Camioneta', 'Verde', 36),
('VXY7Z89', 'Automovil', 'Amarillo', 37),
('ZAB8C98', 'Motocicleta', 'Plateado', 38),
('CDE9F07', 'Automovil', 'Dorado', 39),
('FGH0I16', 'Automovil', 'Gris', 40),
('JKL1M25', 'Motocicleta', 'Negro', 41),
('NOP2Q34', 'Automovil', 'Blanco', 42),
('RST3U43', 'Camioneta', 'Azul', 43),
('VXY4Z52', 'Automovil', 'Rojo', 44),
('ZAB5C61', 'Motocicleta', 'Verde', 45),
('CDE6F70', 'Automovil', 'Amarillo', 46),
('FGH7I89', 'Automovil', 'Plateado', 47),
('JKL8M98', 'Motocicleta', 'Dorado', 48),
('NOP9Q07', 'Automovil', 'Gris', 49),
('RST0U16', 'Camioneta', 'Negro', 50),
('VXY1Z25', 'Automovil', 'Blanco', 51),
('ZAB2C34', 'Motocicleta', 'Azul', 52),
('CDE3F43', 'Automovil', 'Rojo', 53), 
('XYZ9876', 'Automovil', 'Gris', 1),  
('DEF123A', 'Motocicleta', 'Negro', 2),
('GHI456B', 'Automovil', 'Blanco', 3),
('JKL789C', 'Automovil', 'Azul', 4),
('MNO012D', 'Camioneta', 'Rojo', 5),
('PQR345E', 'Automovil', 'Verde', 6),
('STU678F', 'Motocicleta', 'Amarillo', 7),
('VWX901G', 'Automovil', 'Plateado', 8),
('YZA234H', 'Automovil', 'Dorado', 9),
('BCD567I', 'Motocicleta', 'Gris', 10),
('EFG890J', 'Automovil', 'Negro', 11),
('HIJ123K', 'Camioneta', 'Blanco', 12),
('LMN456L', 'Automovil', 'Azul', 13),
('OPQ789M', 'Motocicleta', 'Rojo', 14),
('RST012N', 'Automovil', 'Verde', 15),
('UVW345O', 'Automovil', 'Amarillo', 16),
('XYZ678P', 'Motocicleta', 'Plateado', 17),
('A1B901Q', 'Automovil', 'Dorado', 18),
('C2D234R', 'Camioneta', 'Gris', 19),
('E3F567S', 'Automovil', 'Negro', 20),
('G4H890T', 'Motocicleta', 'Blanco', 21),
('I5J123U', 'Automovil', 'Azul', 22),
('K6L456V', 'Automovil', 'Rojo', 23),
('M7N789W', 'Motocicleta', 'Verde', 24),
('O8P012X', 'Automovil', 'Amarillo', 25),
('Q9R345Y', 'Camioneta', 'Plateado', 26),
('S0T678Z', 'Automovil', 'Dorado', 27),
('U1V901A', 'Motocicleta', 'Gris', 28),
('W2X234B', 'Automovil', 'Negro', 29),
('Y3Z567C', 'Automovil', 'Blanco', 30),
('A4B890D', 'Motocicleta', 'Azul', 31),
('C5D123E', 'Automovil', 'Rojo', 32),
('E6F456F', 'Camioneta', 'Verde', 33),
('G7H789G', 'Automovil', 'Amarillo', 34),
('I8J012H', 'Motocicleta', 'Plateado', 35),
('K9L345I', 'Automovil', 'Dorado', 36),
('M0N678J', 'Automovil', 'Gris', 37),
('O1P901K', 'Motocicleta', 'Negro', 38),
('Q2R234L', 'Automovil', 'Blanco', 39),
('S3T567M', 'Camioneta', 'Azul', 40),
('U4V890N', 'Automovil', 'Rojo', 41),
('W5X123O', 'Motocicleta', 'Verde', 42),
('Y6Z456P', 'Automovil', 'Amarillo', 43),
('A7B789Q', 'Automovil', 'Plateado', 44),
('C8D012R', 'Motocicleta', 'Dorado', 45),
('E9F345S', 'Automovil', 'Gris', 46),
('G0H678T', 'Camioneta', 'Negro', 47),
('I1J901U', 'Automovil', 'Blanco', 48),
('K2L234V', 'Motocicleta', 'Azul', 49),
('M3N567W', 'Automovil', 'Rojo', 50);

SELECT  * FROM  vehiculo;

-- Insertar datos de acceso y pagos base (Se recomienda generar más datos para llenar las tablas)
-- Entrada de Vehiculo 1
INSERT INTO acceso (fecha_hora, resultado, id_vehiculo, id_punto, id_vigilante) VALUES
(NOW() - INTERVAL '1 hour', 'Concedido', 1, 1, 1);
-- Salida de Vehiculo 1
INSERT INTO acceso (fecha_hora, resultado, id_vehiculo, id_punto, id_vigilante) VALUES
(NOW(), 'Concedido', 1, 2, 1);
-- Pago asociado
INSERT INTO pago (importe, medio, ref_transaccion, id_acceso_entrada, id_acceso_salida, id_tarifa, id_vigilante) VALUES
(5.00, 'Efectivo', 'REF123456', 1, 2, 1, 1);


-- --------------------------------------------------------------------------------------
-- INSERCIÓN DE USUARIOS PARA LOGIN (5 Registros)
-- --------------------------------------------------------------------------------------

SELECT 'Paso 23: Insertando 5 Usuarios para Login ....................'  AS paso, pg_sleep(02);

INSERT INTO tmusuarios (nombre, usuario, clave, nivel) VALUES
('ANGIE', 'ADMIN@CARROS.COM', '12345', 1), -- Administrador
('LAURA', 'LAURAVIGI@ACCESO.COM', '54321', 0),  -- Administrador
('FERNANDO', 'FERNVIGI@ACCESO.COM', 'fer123', 0),   -- Vigilante
('DIEGO', 'VIGILANTE2@ACCESO.COM', 'vigi456',0), -- Vigilante
('IVALDO', 'IVALDO@ADMIN.COM', 'res001', 1); 
SELECT  * FROM  tmusuarios;