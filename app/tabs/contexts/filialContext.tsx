import React, { createContext, useContext, useState } from 'react';

type FilialContextType = {
  filialSelecionada: string | null;
  setFilialSelecionada: (filial: string) => void;
};

const FilialContext = createContext<FilialContextType | undefined>(undefined);

export const FilialProvider = ({ children }: { children: React.ReactNode }) => {
  const [filialSelecionada, setFilialSelecionada] = useState<string | null>(null);

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
