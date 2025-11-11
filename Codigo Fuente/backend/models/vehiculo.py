# backend/models/vehiculo.py
# Representación de la tabla 'vehiculo' (alineada con bd_carros.sql)

class Vehiculo:
    def __init__(self, id_vehiculo, placa, tipo, color, id_persona):
        """
        Clase que representa un Vehículo.
        """
        self.id_vehiculo = id_vehiculo
        self.placa = placa.upper()
        self.tipo = tipo          # 'Automovil', 'Motocicleta'
        self.color = color
        self.id_persona = id_persona  # Clave foránea a Persona

    def to_dict(self):
        """
        Convierte el objeto en un diccionario para serialización (JSON).
        """
        return {
            "id_vehiculo": self.id_vehiculo,
            "placa": self.placa,
            "tipo": self.tipo,
            "color": self.color,
            "id_persona": self.id_persona
        }

    @staticmethod
    def from_dict(data):
        """
        Crea una instancia de Vehiculo desde un diccionario (útil para POST/PUT).
        """
        return Vehiculo(
            id_vehiculo=data.get("id_vehiculo"),
            placa=data.get("placa", "").upper(),
            tipo=data.get("tipo"),
            color=data.get("color"),
            id_persona=data.get("id_persona")
        )