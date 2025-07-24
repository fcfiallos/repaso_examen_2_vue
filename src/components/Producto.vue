<template>
  <div class="container-producto">
    <div class="mensaje" v-if="mensajeMostrar">
      <p>{{ mensaje }}</p>
    </div>
    <div class="formulario-producto">
      <label for="id_cod">Codigo de Barras</label>
      <input type="text" id="id_cod" v-model="codigoBarras" />
      <label for="id_nombre">Nombre</label>
      <input type="text" id="id_nombre" v-model="nombre" />
      <label for="id_cate">Categoria</label>
      <input type="text" id="id_cate" v-model="categoria" />
      <label for="id_stock">Stock</label>
      <input type="number" id="id_stock" v-model="stock" step="1" min="0" />
      <label for="id_precio">Precio</label>
      <input
        type="number"
        id="id_precio"
        v-model="precio"
        step="0.01"
        min="0"
      />
      <button @click="guardarProducto">Guardar</button>
    </div>
  </div>
</template>

<script>
import { crearProductoFach } from "@/client/ProductoClient";
export default {
  data() {
    return {
      codigoBarras: "",
      nombre: "",
      categoria: "",
      stock: 0,
      precio: 0.0,
      mensaje: "",
      mensajeMostrar: false,
    };
  },
  methods: {
    async guardarProducto() {
      if (
        !this.codigoBarras ||
        !this.nombre ||
        !this.categoria ||
        this.stock < 0 ||
        !Number.isInteger(Number(this.stock)) || // Validar que sea entero
        this.precio < 0 ||
        isNaN(this.precio) // Validar que sea número válido
      ) {
        this.mensaje =
          "Por favor, complete todos los campos correctamente. Stock debe ser un número entero.";
        this.mensajeMostrar = true;
        return;
      }

      try {
        this.mensajeMostrar = false;
        const producto = {
          codigoBarras: this.codigoBarras,
          nombre: this.nombre,
          categoria: this.categoria,
          stock: parseInt(this.stock), // Convertir a entero
          precio: parseFloat(this.precio), // Convertir a decimal
        };
        
        console.log('Producto a enviar:', producto);
        console.log('Tipos de datos:', {
          codigoBarras: typeof producto.codigoBarras,
          nombre: typeof producto.nombre, 
          categoria: typeof producto.categoria,
          stock: typeof producto.stock,
          precio: typeof producto.precio
        });
        
        await crearProductoFach(producto);
        this.mensaje = "Producto guardado exitosamente.";
        this.mensajeMostrar = true;
        this.limpiarFormulario();
      } catch (error) {
        this.mensaje =
          "Error al guardar el producto: " +
          (error.response?.data?.message || error.message);
        this.mensajeMostrar = true;
      }
    },
    limpiarFormulario() {
      this.codigoBarras = "";
      this.nombre = "";
      this.categoria = "";
      this.stock = 0;
      this.precio = 0.0;
      this.mensajeMostrar = false;
    },
  },
};
</script>

<style scoped>
.container-producto {
  padding: 20px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: #007bff;
}
.formulario-producto {
  display: flex;
  flex-direction: column;
  width: 30%;
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  padding: 20px;
}
.mensaje {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background: #fff;
  border-radius: 10px;
  padding: 5px 10px;
  margin-bottom: 10px;
  color: #ff3535;
}
label {
  margin: 10px 5px;
  text-align: left;
  color: #333;
}
input {
  padding: 8px;
  margin: 10px 5px;
  border: 1px solid #007bff;
  border-radius: 4px;
  color: #666;
}
input:focus {
  outline: none;
}
button {
  margin-top: 10px;
  padding: 10px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 18px;
}
</style>