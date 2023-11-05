import {
  Box,
  Button,
  IconButton,
  ListItem,
  Typography,
} from '@mui/material';
import React, { useMemo } from 'react';
import Draggable from 'react-draggable';
import classNames from 'classnames';
import { Vector3 } from 'three';
import List from '@mui/material/List';
import ListItemText from '@mui/material/ListItemText';
import FollowTheSignsIcon from '@mui/icons-material/FollowTheSigns';
import RefreshIcon from '@mui/icons-material/Refresh';
import HikingIcon from '@mui/icons-material/Hiking';
import DeleteIcon from '@mui/icons-material/Delete';
import InfoIcon from '@mui/icons-material/Info';
import Tooltip from '@mui/material/Tooltip';

import { usePersistentUiLoc } from '../hooks/usePersistentUiLoc';

import { useWindowDimensions } from '../../../hooks/useWindowDimensions';
import { useUiContext } from '../component';

import './component.scss';


export const SocketClient = ({ rootNode, }) => {
  const { height } = useWindowDimensions();
  const { embedded, parseInfo, socketConnected, socket, setZone, setParseInfo } = useUiContext();
  const { onStop, x, y, show } = usePersistentUiLoc('socketClients', rootNode);

  const socketClients = useMemo(() => Object.values(parseInfo), [parseInfo]);
  const clampedMacroNumber = Math.min(socketClients.length, 6);

  return show ? (
    <Draggable onStop={onStop} position={embedded ? { x: 15, y: height - 150 - (clampedMacroNumber * 32) } : { x, y }} handle=".chat-handle">
      <div className="ui-element ui-element-macro-box">
        <div className="chat-handle">
          <Typography sx={{ fontSize: 13, padding: 0, margin: 0 }} gutterBottom>
            Advanced Map Parser Clients
          </Typography>
        </div>

        <List className="macro-list">
          {socketClients.map((socketClient) => {
            const { x, y, z } = socketClient.locations?.[0] ?? { x: 0, y: 0, z: 0 };
            const info = `X: ${y * -1}, Y: ${z}, Z: ${x}. ${(new Date().valueOf() - socketClient.lastUpdated.valueOf()) / 1000} seconds since last update.`;

            const name = <Tooltip title={info}><Typography
              sx={{ fontSize: 14, padding: 0, margin: 0 }}
            >{socketClient.fullName} - {socketClient.zone} 
  
      
            </Typography></Tooltip>;
            return <ListItem
              key={`socketclient-${socketClient.displayedName}`}
              secondaryAction={
                <div className="macro-sec-actions">
                 
                  <Tooltip title="Jump To Player">
                    <IconButton
                      onClick={() => {
                        if (socketClient.zone) {
                          setZone(socketClient.zone);
                        }
                        if (socketClient.locations.length) {
                          const [{ x, y, z }] = socketClient.locations;
                          const lookVector = new Vector3(y * -1, z, x);
                          window.currentCamera.position.set((y * -1), z + 50, x);
                          window.currentCamera.lookAt(lookVector);
                        }
                      }}
                      edge="end"
                      aria-label="jumpto"
                    >
                      <FollowTheSignsIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Toggle Follow">
                    <IconButton
                      className={classNames({ 'client-follow': socketClient.follow })}
                      onClick={() => {
                        setParseInfo(p => {
                          for (const key of Object.keys(p)) {
                            if (key === socketClient.displayedName) {
                              p[key].follow = !p[key].follow;
                            } else {
                              p[key].follow = false;
                            }
                          }
                          return { ...p };
                        });
                      }}
                      edge="end"
                      aria-label="follow"
                    >
                      <HikingIcon />
                    </IconButton>
                  </Tooltip>

                  <Tooltip title="Remove Entry">
                    <IconButton
                      onClick={() => {
                        setParseInfo(p => {
                          for (const key of Object.keys(p)) {
                            if (key === socketClient.displayedName) {
                              delete p[socketClient.displayedName];
                            }
                          }
                          return { ...p };
                        });
                      }}
                      edge="end"
                      aria-label="follow"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </div>
              }
            >
              <ListItemText primary={name} />
            </ListItem>;
          }
          )}
        </List>

        <Box
          sx={{
            display       : 'flex',
            justifyContent: 'space-between',
            alignContent  : 'center',
            height        : 35,
          }}
        >
          {socketConnected ? (
            <Box sx={{ display: 'flex', alignContent: 'center' }}>

              <Typography
                sx={{ fontSize: 14, lineHeight: '30px' }}
                color="text.secondary"
                gutterBottom
              >
                Client is Connected :: {socketClients.length} Log(s) Active
              </Typography>
          
            </Box>
          ) : (
            <Box sx={{ display: 'flex', alignContent: 'center', justifyContent: 'center', textAlign: 'center' }}>
              <Typography
                sx={{ fontSize: 14, lineHeight: '30px' }}
                color="text.secondary"
                gutterBottom
              >
              Parser is Not Connected
              </Typography>
              <Tooltip title="Connect">
                <Button onClick={() => socket.connect()}>
                  <RefreshIcon sx={{ color: 'whitesmoke' }} onClick={() => {}} />
                  <Typography
                    sx={{ fontSize: 14, marginLeft: 1, color: 'whitesmoke' }}
                  >
                Reconnect
                  </Typography>
                </Button>
              </Tooltip>
            </Box>
          )
          }
        </Box>
      </div>
    </Draggable>
  ) : null;
};
