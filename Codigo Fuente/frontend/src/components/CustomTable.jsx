// frontend/src/components/CustomTable.jsx
import React from 'react';

/**
 * Componente de tabla reutilizable.
 *
 * Props:
 * - columns: Array de objetos para definir las columnas.
 * Ej: [{ Header: 'Placa', accessor: 'placa' }, { Header: 'Propietario', accessor: 'propietario.nombre' }]
 * - data: Array de objetos con los datos a mostrar.
 * - onEdit: (opcional) Función que se llama al pulsar "Editar". Recibe el objeto de la fila.
 * - onDelete: (opcional) Función que se llama al pulsar "Eliminar". Recibe el objeto de la fila.
 */
function CustomTable({ columns, data, onEdit, onDelete }) {

  // Función interna para obtener el valor de un 'accessor' anidado (ej: 'propietario.nombre')
  const getSafeValue = (item, accessor) => {
    try {
      const keys = accessor.split('.');
      let value = item;
      for (const key of keys) {
        value = value[key];
      }
      return value;
    } catch (error) {
      // Pasa si 'propietario' es null o undefined
      return 'N/A';
    }
  };

  return (
    <div className="overflow-x-auto rounded-lg shadow-md border border-gray-200">
      <table className="min-w-full divide-y divide-gray-200 bg-white">
        <thead className="bg-gray-100">
          <tr>
            {columns.map((col) => (
              <th
                key={col.accessor}
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-600"
              >
                {col.Header}
              </th>
            ))}
            {(onEdit || onDelete) && (
              <th
                scope="col"
                className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-600"
              >
                Acciones
              </th>
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {data && data.length > 0 ? (
            data.map((item, rowIndex) => (
              <tr key={rowIndex} className="hover:bg-gray-50">
                {columns.map((col) => (
                  <td key={col.accessor} className="whitespace-nowrap px-6 py-4 text-sm text-gray-700">
                    {String(getSafeValue(item, col.accessor) ?? 'N/A')}
                  </td>
                ))}
                {(onEdit || onDelete) && (
                  <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                    {onEdit && (
                      <button
                        onClick={() => onEdit(item)}
                        className="mr-2 text-indigo-600 hover:text-indigo-900"
                      >
                        Editar
                      </button>
                    )}
                    {onDelete && (
                      <button
                        onClick={() => onDelete(item)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Eliminar
                      </button>
                    )}
                  </td>
                )}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={columns.length + 1} className="px-6 py-4 text-center text-gray-500">
                No hay datos para mostrar.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default CustomTable;