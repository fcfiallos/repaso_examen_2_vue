import axios from "axios";

const API_URL_VENTA = "http://localhost:8081/api/facturacion/v1/ventas";

const crearVenta = async (venta) => {
    const response = await axios.post(`${API_URL_VENTA}`, venta);
    return response.data;
}

const validarStock = async (codigoBarras, cantidad) => {
    const response = await axios.post(`${API_URL_VENTA}/validar-stock?codigoBarras=${codigoBarras}&cantidad=${cantidad}`);
    return response.data;
}

export const crearVentaFach = async (venta) => {
    return await crearVenta(venta);
}

export const validarVentaFach = async (codigoBarras, cantidad) => {
    return await validarStock(codigoBarras, cantidad);
}
