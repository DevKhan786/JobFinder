"use client";
import { GlobalContextProvider } from "../context/globalContext";
interface Props {
  children: React.ReactNode;
}
const ContextProvider = ({ children }: Props) => {
  return <GlobalContextProvider>{children}</GlobalContextProvider>;
};

export default ContextProvider;
