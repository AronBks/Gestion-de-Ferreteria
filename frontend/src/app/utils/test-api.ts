// test-api.ts - Usado para validar que los endpoints backend funcionan correctamente
// Ejecutar en la consola del navegador (F12 -> Console)

const API_URL = 'http://localhost:3000/api';

// Test 1: Obtener productos
export async function testObtenerProductos() {
  try {
    console.log('🔄 Obteniendo productos...');
    const token = localStorage.getItem('auth_token');
    
    const response = await fetch(`${API_URL}/productos?page=1&limit=10`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('✅ Productos obtenidos:', data);
    return data;
  } catch (error) {
    console.error('❌ Error al obtener productos:', error);
  }
}

// Test 2: Login
export async function testLogin() {
  try {
    console.log('🔄 Intentando login...');
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'admin@ferreteria.com',
        password: 'Admin123'
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('✅ Login exitoso:', data);
    localStorage.setItem('auth_token', data.access_token);
    return data;
  } catch (error) {
    console.error('❌ Error en login:', error);
  }
}

// Ejecutar en consola:
// import { testObtenerProductos, testLogin } from './test-api';
// await testLogin();
// await testObtenerProductos();
