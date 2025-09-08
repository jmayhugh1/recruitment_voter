import React, { createContext } from 'react';
import type { Recruiter } from '../types';

export interface UserContextType {
  recruiter: Recruiter | null;
  setRecruiter: React.Dispatch<React.SetStateAction<Recruiter | null>>;

}
export const UserContext = createContext<UserContextType>({
  recruiter: null,
  setRecruiter: () => {},
});
