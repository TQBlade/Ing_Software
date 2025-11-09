# backend/models/auditoria.py
# Representación de la tabla de Auditoría [cite: 26, 37]

from datetime import datetime

class Auditoria:
    def __init__(self, id_auditoria, id_vigilante, accion, tabla_afectada, id_registro_afectado, valor_anterior, valor_nuevo, fecha_hora=None):
        """
        Clase que representa un registro de auditoría.
        """
        self.id_auditoria = id_auditoria
        self.id_vigilante = id_vigilante  # Quién hizo el cambio (ID del vigilante logueado)
        self.accion = accion              # 'CREAR', 'ACTUALIZAR', 'ELIMINAR'
        self.tabla_afectada = tabla_afectada  # 'Vehiculo', 'Persona', etc.
        self.id_registro_afectado = id_registro_afectado # El ID del vehiculo/persona modificado
        self.valor_anterior = valor_anterior  # Estado JSON/Texto antes del cambio
        self.valor_nuevo = valor_nuevo      # Estado JSON/Texto después del cambio
        self.fecha_hora = fecha_hora or datetime.now()

    def __str__(self):
        """
        Representación en string del objeto de auditoría.
        """
        return f"[AUDITORIA] {self.fecha_hora} - Vigilante {self.id_vigilante} realizó {self.accion} en {self.tabla_afectada} (ID: {self.id_registro_afectado})"

    def to_dict(self):
        """
        Convierte el objeto en un diccionario para serialización (ej. JSON).
        """
        return {
            "id_auditoria": self.id_auditoria,
            "id_vigilante": self.id_vigilante,
            "accion": self.accion,
            "tabla_afectada": self.tabla_afectada,
            "id_registro_afectado": self.id_registro_afectado,
            "valor_anterior": self.valor_anterior,
            "valor_nuevo": self.valor_nuevo,
            "fecha_hora": self.fecha_hora.isoformat() if self.fecha_hora else None
        }