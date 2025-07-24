import axios from "axios";

const API_URL_PRODUCTO = "http://localhost:8081/api/facturacion/v1/productos";

const crearProducto = async (producto) => {
    return axios.post(`${API_URL_PRODUCTO}`, producto)
        .then(response => response.data)
}

export const crearProductoFach = async (producto) => {
    return await crearProducto(producto);
}