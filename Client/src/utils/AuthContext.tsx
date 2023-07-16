import { createContext, useState, ReactNode } from "react";

export interface AuthContextType {
    authorized: boolean;
    login: () => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
    children: ReactNode;
  }

  export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [authorized, setAuthorized] = useState(false);

    const login = () => {
        setAuthorized(true);
        // Additional logic for handling login
      };
    
      const logout = () => {
        setAuthorized(false);
        // Additional logic for handling logout
      };
    
    const AuthContextValue: AuthContextType = {
        authorized,
        login,
        logout
    }

    return <AuthContext.Provider value={AuthContextValue}>{ children }</AuthContext.Provider>
}
export const AuthConsumer = AuthContext.Consumer;

export default AuthContext;