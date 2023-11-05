
import React, { createContext, useContext } from 'react';
import './component.scss';
import { SocketClient } from './socket-clients';

const embedded = new URLSearchParams(window.location.search).get('embedded') === 'true';
export const UiContext = createContext(null);
export const useUiContext = () => useContext(UiContext);
export const UiOverlay = ({ rootNode, parseInfo, socket, socketConnected, setZone, setParseInfo }) => {
  return rootNode ? (
    <UiContext.Provider value={{ rootNode, embedded, parseInfo, socket, socketConnected, setZone, setParseInfo }}>
      createPortal(
      <div className="ui-overlay">
        {<SocketClient rootNode={rootNode}/>}
      </div>
      , rootNode)
    </UiContext.Provider>
  ) : null;
};

export default UiOverlay;
