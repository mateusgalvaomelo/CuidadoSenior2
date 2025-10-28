import React, { createContext, useContext, useEffect, useState } from 'react';

type UserCtx = { name: string; setName: (n: string) => void };

const Ctx = createContext<UserCtx>({ name: '', setName: () => {} });

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [name, setNameState] = useState('');

  useEffect(() => {
    const cached = localStorage.getItem('cs_user_name');
    if (cached) setNameState(cached);
  }, []);

  const setName = (n: string) => {
    setNameState(n);
    localStorage.setItem('cs_user_name', n);
  };

  return <Ctx.Provider value={{ name, setName }}>{children}</Ctx.Provider>;
};

export const useUser = () => useContext(Ctx);
