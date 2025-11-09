# backend/models/persona.py
# Representación de la tabla Persona [cite: 26, 27]

class Persona:
    def __init__(self, id_persona, doc_identidad, nombres, apellidos, tipo_persona, email=None, telefono=None, estado=True):
        """
        Clase que representa a una Persona (Propietario, Visitante, etc.).
        """
        self.id_persona = id_persona
        self.doc_identidad = doc_identidad
        self.nombres = nombres
        self.apellidos = apellidos
        self.tipo_persona = tipo_persona  # Ej: 'Propietario', 'Visitante', 'Empleado'
        self.email = email
        self.telefono = telefono
        self.estado = estado  # Activo/Inactivo

    def __str__(self):
        """
        Representación en string de la persona.
        """
        return f"{self.nombres} {self.apellidos} (ID: {self.doc_identidad})"

    def to_dict(self):
        """
        Convierte el objeto en un diccionario para serialización (JSON).
        """
        return {
            "id_persona": self.id_persona,
            "doc_identidad": self.doc_identidad,
            "nombres": self.nombres,
            "apellidos": self.apellidos,
            "tipo_persona": self.tipo_persona,
            "email": self.email,
            "telefono": self.telefono,
            "estado": self.estado
        }

    @staticmethod
    def from_dict(data):
        """
        Crea una instancia de Persona desde un diccionario (útil para POST/PUT).
        """
        return Persona(
            id_persona=data.get("id_persona"),
            doc_identidad=data.get("doc_identidad"),
            nombres=data.get("nombres"),
            apellidos=data.get("apellidos"),
            tipo_persona=data.get("tipo_persona"),
            email=data.get("email"),
            telefono=data.get("telefono"),
            estado=data.get("estado", True)
        )