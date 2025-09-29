import React, { createContext, useContext, useState } from 'react';

// Definimos o tipo da filial
type Usuario = {
  cd_usu: string;
  nome: string;
};

type UsuarioContextType = {
  usuarioSelecionada: Usuario | null;
  setUsuarioSelecionada: (usuario: Usuario) => void;
};

const UsuarioContext = createContext<UsuarioContextType | undefined>(undefined);

export const UsuarioProvider = ({ children }: { children: React.ReactNode }) => {
  const [usuarioSelecionada, setUsuarioSelecionada] = useState<Usuario | null>(null);

  return (
    <UsuarioContext.Provider value={{ usuarioSelecionada, setUsuarioSelecionada }}>
      {children}
    </UsuarioContext.Provider>
  );
};

export const useUsuario= () => {
  const context = useContext(UsuarioContext);
  if (!context) throw new Error('useUsuario deve ser usado dentro do UsuarioProvider');
  return context;
};
