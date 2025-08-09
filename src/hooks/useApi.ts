// src/hooks/useApi.ts

import { useState, useEffect, useCallback } from 'react';

/**
 * Un hook genérico y robusto para realizar llamadas a API.
 * Encapsula los estados de carga, datos, error y provee una función para recargar.
 * @param apiCall La función de servicio que realiza la llamada a la API.
 */
export const useApi = <T>(apiCall: () => Promise<T>) => {
    const [data, setData] = useState<T | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // useCallback para memorizar la función fetchData.
    // Solo se volverá a crear si la función 'apiCall' (que viene de fuera) cambia.
    const fetchData = useCallback(async () => {
        setLoading(true); // Siempre activar el loading al empezar a buscar datos
        setError(null);
        try {
            const result = await apiCall();
            setData(result);
        } catch (err) {
            console.error("API call failed:", err);
            setError('Could not load data. Please try again.');
        } finally {
            setLoading(false); // Siempre desactivar el loading al finalizar
        }
    }, [apiCall]); // La dependencia es la función de la API

    // El useEffect ahora depende de la función 'fetchData' memorizada.
    // Solo se ejecutará cuando el componente se monte por primera vez, o si 'fetchData' cambia.
    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Devolvemos los estados, la función 'setData' y la función 'refetch' (que es 'fetchData')
    return { data, loading, error, setData, refetch: fetchData };
};