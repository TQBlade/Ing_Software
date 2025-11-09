# backend/models/vehiculo.py
# Representación de la tabla Vehiculo

class Vehiculo:
    def __init__(self, id_vehiculo, placa, id_propietario, marca, modelo, color, tipo_vehiculo, estado=True):
        """
        Clase que representa un Vehículo.
        """
        self.id_vehiculo = id_vehiculo
        self.placa = placa.upper() # Siempre en mayúsculas para consistencia
        self.id_propietario = id_propietario # Clave foránea a Persona
        self.marca = marca
        self.modelo = modelo
        self.color = color
        self.tipo_vehiculo = tipo_vehiculo # Ej: 'Carro', 'Moto', 'Bicicleta'
        self.estado = estado  # Activo/Inactivo

    def __str__(self):
        """
        Representación en string del vehículo.
        """
        return f"Placa: {self.placa} ({self.marca} {self.modelo})"

    def to_dict(self):
        """
        Convierte el objeto en un diccionario para serialización (JSON).
        """
        return {
            "id_vehiculo": self.id_vehiculo,
            "placa": self.placa,
            "id_propietario": self.id_propietario,
            "marca": self.marca,
            "modelo": self.modelo,
            "color": self.color,
            "tipo_vehiculo": self.tipo_vehiculo,
            "estado": self.estado
        }

    @staticmethod
    def from_dict(data):
        """
        Crea una instancia de Vehiculo desde un diccionario (útil para POST/PUT).
        """
        return Vehiculo(
            id_vehiculo=data.get("id_vehiculo"),
            placa=data.get("placa", "").upper(),
            id_propietario=data.get("id_propietario"),
            marca=data.get("marca"),
            modelo=data.get("modelo"),
            color=data.get("color"),
            tipo_vehiculo=data.get("tipo_vehiculo"),
            estado=data.get("estado", True)
        )