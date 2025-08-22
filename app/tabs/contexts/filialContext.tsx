import React, { createContext, useContext, useState } from 'react';

// Definimos o tipo da filial
type Filial = {
  cd_fil: string;
  nm_fil: string;
};

type FilialContextType = {
  filialSelecionada: Filial | null;
  setFilialSelecionada: (filial: Filial) => void;
};

const FilialContext = createContext<FilialContextType | undefined>(undefined);

export const FilialProvider = ({ children }: { children: React.ReactNode }) => {
  const [filialSelecionada, setFilialSelecionada] = useState<Filial | null>(null);

  return (
    <FilialContext.Provider value={{ filialSelecionada, setFilialSelecionada }}>
      {children}
    </FilialContext.Provider>
  );
};

export const useFilial = () => {
  const context = useContext(FilialContext);
  if (!context) throw new Error('useFilial deve ser usado dentro do FilialProvider');
  return context;
};
