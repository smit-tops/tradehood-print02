import React, { createContext, ReactElement, useEffect, useState } from 'react';
import { useCookies } from 'react-cookie';

interface ILoginContext {
  login: boolean;
  setLogin: any;
  cookies: any;
  setCookie: any;
  removeCookie: any;
  selectedPrinter: {
    boxPrinter: string;
    labelPrinter: string;
    scale: string
  };
  setSelectedPrinter: any;
  printers: any;
  setPrinters: any;
}

const initialPrinter = {
  boxPrinter: '',
  labelPrinter: '',
  scale: ""
}

const LoginContext = createContext<ILoginContext>({
  login: false,
  setLogin: () => { },
  cookies: null,
  setCookie: () => { },
  removeCookie: () => { },
  setSelectedPrinter: () => { },
  setPrinters: () => { },
  printers: [],
  selectedPrinter: initialPrinter,
});

function Context({ children }: { children: ReactElement }) {
  const [login, setLogin] = useState<boolean>(false);
  const [cookies, setCookie, removeCookie] = useCookies();
  const [printers, setPrinters] = useState([]);
  const [selectedPrinter, setSelectedPrinter] = useState(initialPrinter);

  useEffect(() => {
    if (cookies.userDetail) {
      setLogin(true);
    }
  }, []);

  return (
    <LoginContext.Provider
      value={{
        login,
        setLogin,
        cookies,
        setCookie,
        removeCookie,
        selectedPrinter,
        setSelectedPrinter,
        printers,
        setPrinters,
      }}
    >
      {children}
    </LoginContext.Provider>
  );
}

export { LoginContext };
export default Context;
