import React from 'react';
import { useAuth0 } from '@auth0/auth0-react';

function Login() {
  const { loginWithRedirect, isAuthenticated, user, logout } = useAuth0();

  if (isAuthenticated) {
    return (
      <div>
        <p>Bienvenido, {user.name}!</p>
        <button onClick={() => logout({ returnTo: window.location.origin })}>
          Cerrar sesión
        </button>
      </div>
    );
  }

  return <button onClick={() => loginWithRedirect()}>Iniciar sesión</button>;
}

export default Login;