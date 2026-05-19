import { Client } from 'pg';

async function reactivate() {
  const client = new Client({
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    password: 'zzzz',
    database: 'ferreteria_pos',
  });

  try {
    await client.connect();
    console.log('Connected to DB');
    
    // Reactivar el admin
    const res = await client.query(
      "UPDATE usuarios SET estado = 'ACTIVO', activo = true WHERE email = 'admin@ferreteria.com'"
    );
    
    console.log('Update result:', res.rowCount, 'rows updated.');
    
    if (res.rowCount === 0) {
      console.log('Admin user not found. Checking all admins...');
      const admins = await client.query("SELECT email, estado FROM usuarios WHERE rol = 'ADMIN'");
      console.table(admins.rows);
    }
    
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.end();
  }
}

reactivate();
