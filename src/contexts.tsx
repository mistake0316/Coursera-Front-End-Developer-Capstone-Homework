import { useContext, createContext, ReactElement } from "react";

interface IFloatingPanel{
  setPanel : Function | null;
  currentPanel: any;
}
const FloatingPanelContext = createContext<IFloatingPanel>({setPanel:null, currentPanel:null});

export default FloatingPanelContext;