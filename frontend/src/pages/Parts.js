import React, { useEffect, useState } from 'react';
import { getParts } from '../services/api';

const Parts = () => {
  const [parts, setParts] = useState([]);

  useEffect(() => {
    const fetchParts = async () => {
      const data = await getParts();
      setParts(data);
    };
    fetchParts();
  }, []);

  return (
    <div>
      <h1>Lista de Repuestos</h1>
      <ul>
        {parts.map(part => (
          <li key={part._id}>{part.name} - ${part.price}</li>
        ))}
      </ul>
    </div>
  );
};

export default Parts;
