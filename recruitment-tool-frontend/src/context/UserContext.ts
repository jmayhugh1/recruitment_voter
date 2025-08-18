import React, { createContext } from 'react';

export interface UserContextType {
  user: string | null;
  setUser: React.Dispatch<React.SetStateAction<string | null>>;
}
export const UserContext = createContext<UserContextType>({
  user: null,
  setUser: () => {},
});
