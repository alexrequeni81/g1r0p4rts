import React, { useEffect, useState } from 'react';
import { getUsers } from '../services/api'; // Asegúrate de importar la función

const Home = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      const data = await getUsers(); // Llama a la función para obtener usuarios
      setUsers(data);
    };
    fetchUsers();
  }, []);

  return (
    <div>
      <h1>Lista de Usuarios</h1>
      <table>
        <thead>
          <tr>
            {users.length > 0 && Object.keys(users[0]).map((key) => (
              <th key={key}>{key}</th> // Encabezados adaptados a los campos de la colección
            ))}
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user._id}>
              {Object.values(user).map((value, index) => (
                <td key={index}>{value}</td> // Muestra los valores de cada usuario
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Home;
