<template>
  <div class="container-venta">
    <div class="mensaje" v-if="mensajeMostrar">
      <p>{{ mensaje }}</p>
    </div>
    <div class="parte1">
      <div class="form-1">
        <label for="id_num_venta">N&uacute;mero Venta</label>
        <input type="text" id="id_num_venta" v-model="numeroVenta" />
        <label for="id_cel_cliente">C&eacute;lula Cliente</label>
        <input type="text" id="id_cel_cliente" v-model="celularCliente" />
      </div>
      <div class="form-1 centrar">
        <button @click="guardarVenta">Guardar</button>
      </div>
    </div>
    <div class="parte2">
      <div class="agrupar">
        <div class="form-1">
          <label for="id_cod">C&oacute;digo Barras</label>
          <input type="text" id="id_cod" v-model="producto" />
        </div>
        <div class="form-1">
          <label for="id_cantidad">Cantidad</label>
          <input type="number" id="id_cantidad" v-model="cantidad" />
        </div>
        <div class="form-1 centrar">
          <button @click="agregarProducto">Agregar</button>
        </div>
      </div>

      <div class="tabla">
        <table>
          <thead>
            <tr>
              <th>C. Barras</th>
              <th>Nombre</th>
              <th>Cantidad</th>
              <th>Precio</th>
              <th>Subtotal</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, index) in productos" :key="index">
              <td>{{ item.codigoBarras }}</td>
              <td>{{ item.nombre }}</td>
              <td>{{ item.cantidad }}</td>
              <td>${{ item.precio.toFixed(2) }}</td>
              <td>${{ item.subtotal.toFixed(2) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    <div class="parte3">
      <p>Total: ${{ total.toFixed(2) }}</p>
    </div>
  </div>
</template>

<script>
import { crearVentaFach, validarVentaFach } from "@/client/VentaClient";
export default {
  data() {
    return {
      numeroVenta: "",
      celularCliente: "",
      producto: "",
      cantidad: 0,
      productos: [],
      mensaje: "",
      mensajeMostrar: false,
      total: 0,
    };
  },
  methods: {
    async guardarVenta() {
      try {
        // Validar que se hayan ingresado los datos requeridos
        if (!this.numeroVenta || !this.celularCliente) {
          this.mostrarMensaje("Por favor ingrese el número de venta y la cédula del cliente");
          return;
        }

        if (this.productos.length === 0) {
          this.mostrarMensaje("Debe agregar al menos un producto a la venta");
          return;
        }

        // Preparar los datos para enviar al backend
        const ventaData = {
          numeroVenta: this.numeroVenta,
          cedulaCliente: this.celularCliente,
          productos: this.productos.map(item => ({
            codigoBarras: item.codigoBarras,
            cantidad: item.cantidad
          }))
        };

        // Enviar la venta al backend
        await crearVentaFach(ventaData);
        
        this.mostrarMensaje("Venta guardada exitosamente");
        this.limpiarCampos();
        this.calcularTotal();
        
      } catch (error) {
        console.error("Error al guardar la venta:", error);
        this.mostrarMensaje("Error al guardar la venta: " + (error.response?.data?.message || error.message));
      }
    },
    
    async agregarProducto() {
      try {
        // Validar que se hayan ingresado los datos del producto
        if (!this.producto || this.cantidad <= 0) {
          this.mostrarMensaje("Por favor ingrese un código de barras válido y una cantidad mayor a 0");
          return;
        }

        // Validar stock en el backend
        const validacion = await validarVentaFach(this.producto, this.cantidad);
        
        if (!validacion.stockDisponible) {
          this.mostrarMensaje(validacion.mensaje);
          return;
        }

        // Verificar si el producto ya está en la lista
        const productoExistente = this.productos.find(item => item.codigoBarras === this.producto);
        
        if (productoExistente) {
          // Si existe, actualizar la cantidad y recalcular subtotal
          const nuevaCantidad = productoExistente.cantidad + this.cantidad;
          
          // Validar stock para la nueva cantidad
          const validacionNueva = await validarVentaFach(this.producto, nuevaCantidad);
          
          if (!validacionNueva.stockDisponible) {
            this.mostrarMensaje(validacionNueva.mensaje);
            return;
          }
          
          productoExistente.cantidad = nuevaCantidad;
          productoExistente.subtotal = productoExistente.cantidad * productoExistente.precio;
        } else {
          // Si no existe, agregar nuevo producto a la lista
          const nuevoProducto = {
            codigoBarras: this.producto,
            nombre: validacion.producto.nombre,
            cantidad: this.cantidad,
            precio: validacion.producto.precio,
            subtotal: this.cantidad * validacion.producto.precio
          };
          
          this.productos.push(nuevoProducto);
        }

        // Limpiar campos del producto y recalcular total
        this.producto = "";
        this.cantidad = 0;
        this.calcularTotal();
        
        this.mostrarMensaje("Producto agregado exitosamente");
        
      } catch (error) {
        console.error("Error al agregar producto:", error);
        this.mostrarMensaje("Error al agregar producto: " + (error.response?.data?.message || error.message));
      }
    },
    
    calcularTotal() {
      this.total = this.productos.reduce((sum, item) => sum + item.subtotal, 0);
    },
    
    mostrarMensaje(texto) {
      this.mensaje = texto;
      this.mensajeMostrar = true;
      
      // Ocultar mensaje después de 5 segundos
      setTimeout(() => {
        this.mensajeMostrar = false;
      }, 5000);
    },
    
    limpiarCampos() {
      this.numeroVenta = "";
      this.celularCliente = "";
      this.producto = "";
      this.cantidad = 0;
      this.productos = [];
      this.total = 0;
    },
  },
};
</script>

<style scoped>
.container-venta {
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: #f0f0f0;
}
.mensaje {
  width: 70%;
  margin: 10px;
  padding: 15px;
  background-color: #d4edda;
  border: 1px solid #c3e6cb;
  border-radius: 5px;
  color: #155724;
  text-align: center;
  font-weight: bold;
}
.parte1 {
  width: 70%;
  margin: 10px;
  display: flex;
  flex-direction: row;
  margin: 10px;
  padding: 10px;
  border: 2px solid #0068df;
  border-radius: 15px;
}
.agrupar {
  width: 70%;
  margin: 10px;
  display: flex;
  flex-direction: row;
  margin: 10px;
  padding: 10px;
}
.parte2{
    border: 2px solid #0068df;
    border-radius: 15px;
    width: 70%;
}
.form-1 {
  display: flex;
  flex-direction: column;
  margin: 10px 20px;
}
.centrar {
  display: flex;
  justify-content: center;
  align-items: center;
}
.parte3 {
  width: 70%;
  margin: 10px;
  padding: 10px;
  display: flex;
  justify-content: right;
  align-items: right;
}
.parte3 p {
  font-size: 24px;
  font-weight: bold;
  color: #0068df;
  margin: 0;
}
.tabla{
    width: 100%;
    margin: 10px;
    padding: 10px;
}
table {
  border-collapse: collapse;
  margin: 10px;
  padding: 8px;
}
thead,tbody{
    border-top: 2px solid #0068df;
    border-bottom: 2px solid #0068df;
    padding: 8px;
}
th, td {
  padding: 8px;
  text-align: left;
}
label {
  text-align: left;
  margin-bottom: 5px;
  color: #0068df;
}
input {
  padding: 8px;
  border: 1px solid #0068df;
  margin-bottom: 10px;
}
input:focus {
  outline: none;
}
button {
  padding: 10px;
  background-color: #fff;
  color: #0068df;
  border: 2px solid #0068df;
  border-radius: 15px;
  cursor: pointer;
  font-size: 18px;
}
</style>