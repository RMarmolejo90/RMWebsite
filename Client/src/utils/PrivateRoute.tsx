import axios from 'axios';
import { Route, Navigate } from 'react-router-dom';
import { AuthConsumer, AuthContextType } from './AuthContext';

interface PrivateRouteProps {
  path: string;
  element: React.ReactNode;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ path, element }) => {
  const checkTokenValidity = async () => {
    try {
      // Send a request to the server to verify the token
      const response = await axios.get('/Auth'); // Replace with the appropriate server route

      return response.data.valid; // Return the validity status from the server response
    } catch (error) {
      console.error(error);
      return false; // Return false if an error occurs during token verification
    }
  };

  const renderRoute = (auth: AuthContextType | undefined) => {
    const isAuthenticated = auth?.authorized;
    const hasValidToken = checkTokenValidity();

    if (!isAuthenticated || !hasValidToken) {
      return <Navigate to="/PayTracker/Basic" />;
    }

    return <Route path={path} element={element} />;
  };

  return (
    <AuthConsumer>
      {(value: AuthContextType | undefined) => {
        if (!value) {
          // Handle case when AuthContext value is undefined
          return <Navigate to="/PayTracker/Basic" />;
        }

        return renderRoute(value);
      }}
    </AuthConsumer>
  );
};

export default PrivateRoute;
