import React, {
  useState,
  useRef,
  Suspense,
  useCallback,
  useEffect,
  useContext,
  createContext,
} from 'react';
import ReactDOM from 'react-dom';

import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import { DataGrid } from '@mui/x-data-grid';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Paper from '@mui/material/Paper';
import SettingsIcon from '@mui/icons-material/Settings';
import PowerIcon from '@mui/icons-material/Power';
import { JSONTree } from 'react-json-tree';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
  InputLabel,
  Autocomplete,
  TextField,
  Typography,
  IconButton,
} from '@mui/material';

import { Canvas } from '@react-three/fiber';

import { CameraControls } from './camera-controls';
import { RenderedZone, PaperComponent, classes } from './rendered-zone';
import { Loader } from './loader';
import './component.scss';
import { useMemo } from 'react';
import { useToasts } from 'react-toast-notifications';
import { SocketHandler } from './socketHandler';
import { SettingsContext } from '../Context/settings';
import supportedZones from './supportedZones';
import { ConnectionDialog } from './connection';
import raceData from '../../common/raceData.json';
import UiOverlay from '../Ui/component';
import { MacroEditorDialog } from '../Dialogs/macro-editor';
import { useDrawerContext } from '../LeftDrawer/component';

const processMode =
  new URLSearchParams(window.location.search).get('mode') === 'process';

const embedded =
  new URLSearchParams(window.location.search).get('embedded') === 'true';

let initialZone = new URLSearchParams(window.location.search).get('zone');
if (!supportedZones.some(({ shortName }) => shortName === initialZone)) {
  initialZone = 'airplane';
}
const supportedZoneOptions = supportedZones.map(
  ({ shortName, longName }, id) => ({
    label: `${longName} (${shortName})`,
    shortName,
    id,
  }),
);
// https://192.168.2.102:4500

const theme = {
  scheme: 'twilight',
  base00: '#1e1e1e',
  base01: '#323537',
  base02: '#464b50',
  base03: '#5f5a60',
  base04: '#838184',
  base05: '#a7a7a7',
  base06: '#c3c3c3',
  base07: '#ffffff',
  base08: '#cf6a4c',
  base09: '#cda869',
  base0A: '#f9ee98',
  base0B: '#8f9d6a',
  base0C: '#afc4db',
  base0D: '#7587a6',
  base0E: '#9b859d',
  base0F: '#9b703f',
};

const zoneViewer = { zoneViewer: true };

export const ZoneContext = createContext();

export const Zone = () => {
  const zoneRef = useRef();
  const canvasRef = useRef(null);
  const threeRef = useRef(null);

  // Search Dialog
  const [searchOpen, setSearchOpen] = useState(false);
  const handleSearchOpen = () => setSearchOpen(true);
  const handleSearchClose = () => setSearchOpen(false);

  // Spawn Dialog
  const [spawnOpen, setSpawnOpen] = useState(false);
  const [detailedSpawn, setDetailedSpawn] = useState({});
  const handleSpawnOpen = useCallback(() => setSpawnOpen(true), [setSpawnOpen]);
  const handleSpawnClose = useCallback(() => setSpawnOpen(false), [
    setSpawnOpen,
  ]);

  // Active popover dialog

  // Macro Editor Dialog
  const [macroEditorOpen, setMacroEditorOpen] = useState(false);

  // Connection Dialog
  const [connectionOptionsOpen, setConnectionOptionsOpen] = useState(false);
  const handleConnectionOptionsOpen = () => setConnectionOptionsOpen(true);

  // Options
  const [spawnFilter, setSpawnFilter] = useState('');
  const [staticSpawnFilter, setStaticSpawnFilter] = useState('');
  const [poiFilter, setPoiFilter] = useState('');
  const options = useContext(SettingsContext);
  const {
    showNpcs,
    showGroup,
    showPcs,
    showPoi,
    showStaticSpawns = true,
    showStaticSpawnFilter = true,
    address,
    showPoiFilter,
    cameraType,
    flySpeed,
    setOption,
    autoConnect,
  } = options;

  const [socket, setSocket] = useState(null);
  const [socketConnected, setSocketConnected] = useState(false);
  const [selectedProcess, setSelectedProcess] = useState(zoneViewer);
  const selectedProcessRef = useRef(null);
  const [zone, setZone] = useState(null);
  const [zoneDetails, setZoneDetails] = useState([]);
  const [spawns, setSpawns] = useState([]);
  const [staticSpawns, setStaticSpawns] = useState([]);
  const [selectedZone, setSelectedZone] = useState(initialZone);
  const [character, setCharacter] = useState(null);
  const [parseInfo, setParseInfo] = useState({});
  const [groupMembers, setGroupMembers] = useState([]);
  const [myTarget, setMyTarget] = useState('');
  const [chatLines, setChatLines] = useState([]);
  const [macroRunning, setMacroRunning] = useState(false);
  const [showParserUi, setShowParserUi] = useState(false);
  const cameraControls = useRef();
  const zoneViewerRef = useRef(true);
  const { addToast } = useToasts();

  useEffect(() => {
    selectedProcessRef.current = selectedProcess;
  }, [selectedProcess]);

  const { handleDrawerOpen, handleDrawerClose, drawerOpen } = useDrawerContext();
  const doConnect = async () => {
    if (socket) {
      socket.close();
    }
    setSocket(null);
    let newSocket;
    try {
      newSocket = new SocketHandler(address, addToast, setSocketConnected);
      newSocket.on('parseInfo', (parseInfo) => {
        setParseInfo(p => {
          let name = `${parseInfo?.displayedName}`;
          if (parseInfo.level && parseInfo.className && parseInfo.race) {
            name = `[${parseInfo.level} ${parseInfo.className}] ${parseInfo.displayedName} (${parseInfo.race})`;
          } else {
            name = `[ANONYMOUS] ${parseInfo.displayedName}`;
          }
          const zone = supportedZones.find((z) => z.longName === parseInfo.zoneName)?.shortName;
          const previous = p[parseInfo.displayedName] ? p[parseInfo.displayedName] : {};
          if (previous.follow && zone?.length && selectedZone !== zone) {
            setSelectedZone(zone);
          }
          return {
            ...p,
            [parseInfo.displayedName]: {
              ...(previous),
              ...parseInfo,
              zone,
              fullName   : name,
              lastUpdated: new Date()
            }
          };
        });
      });
      newSocket.connect();
      await newSocket.connected;
      setShowParserUi(true);
      setOption('autoConnect', true);
    } catch (e) {
      console.warn('Socket connection failed', e);
      addToast(`Could not connect to ${address}`, {
        appearance: 'error',
      });
      setSocket(null);
      return;
    }
    
   
    

    setSocket(newSocket);
    setConnectionOptionsOpen(false);
  };

  const doDisconnect = () => {
    if (socket) {
      socket.close();
    }
    setParseInfo({});
    setSocket(null);
  };

  const filteredSpawns = useMemo(() => {
    return selectedProcess?.zoneViewer
      ? []
      : spawns.filter((s) => {
        let ret = Boolean(s) && character?.name !== s?.name;
        if (spawnFilter.length) {
          if (spawnFilter === 'HOLDING') {
            ret = s?.primary > 0 || s?.offhand > 0;
          } else {
            ret = s?.displayedName
              ?.toLowerCase()
              ?.includes?.(spawnFilter.toLowerCase()) || s?.id === spawnFilter;
          }
          
        }
        if (showNpcs) {
          ret =
              ret &&
              (showPcs
                ? [1, 0, 3, 2].includes(s.spawnType)
                : s.spawnType === 1 || s.spawnType === 3);
        }
        if (showPcs) {
          ret =
              ret &&
              (showNpcs
                ? [1, 0, 3, 2].includes(s.spawnType)
                : s.spawnType === 0 || s.spawnType === 3);
        }
        return ret;
      });
  }, [selectedProcess, showNpcs, spawns, spawnFilter, showPcs, character]);
  window.filteredSpawns = filteredSpawns;
  window.spawns = spawns;
  const filteredZoneDetails = useMemo(() => {
    if (!showPoi) {
      return [];
    }
    if (!showPoiFilter || !poiFilter.length) {
      return zoneDetails;
    }
    return zoneDetails.filter((z) =>
      z.description.toLowerCase().includes(poiFilter.toLowerCase()),
    );
  }, [poiFilter, showPoiFilter, zoneDetails, showPoi]);

  const filteredStaticSpawns = useMemo(() => {
    if (!showStaticSpawns) {
      return [];
    }
    return staticSpawnFilter.length
      ? staticSpawns.filter((sg) =>
        sg.some((entry) =>
          entry.name.toLowerCase().includes(staticSpawnFilter.toLowerCase()),
        ),
      )
      : staticSpawns;
  }, [showStaticSpawns, staticSpawns, staticSpawnFilter]);

  const zoneName = useMemo(
    () =>
      selectedProcess?.zoneViewer
        ? selectedZone
        : zone?.shortName ?? selectedProcess?.shortName,
    [selectedProcess, selectedZone, zone],
  );

  useEffect(() => {
    if (!selectedProcess) {
      return;
    }
    if (selectedProcess.zoneViewer) {
      zoneViewerRef.current = true;
      setZoneDetails([]);
      setStaticSpawnFilter('');
      setStaticSpawns([]);
      setSpawns([]);
      setCharacter(null);
    } else {
      zoneViewerRef.current = false;
    }
    if (canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      context.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }
    (async () => {
      const zoneDetails = await import('../../common/zoneDetails.json');
      setZoneDetails(
        zoneDetails[
          selectedProcess.zoneViewer ? selectedZone : selectedProcess.shortName
        ] ?? [],
      );

      try {
        const zoneStaticSpawns = await fetch(
          `/zones/${zoneName}.json`,
        ).then((r) => r.json());
        setStaticSpawns(zoneStaticSpawns);
      } catch {}
    })();
    if (!selectedProcess.zoneViewer) {
      socket?.emit?.('selectProcess', selectedProcess.pid);
      window.socketAction = (type, payload, callback) => {
        socket.emit(
          'doAction',
          {
            processId: selectedProcess.pid,
            payload,
            type,
          },
          callback,
        );
      };
    }
  }, [selectedProcess, socket, selectedZone, zoneName]);

  useEffect(() => {
    if (socket || !autoConnect) {
      return;
    }
    doConnect();
  }, []) // eslint-disable-line

  const doTarget = useCallback(
    (id) => {
      if (!socket || !selectedProcess?.pid) {
        return;
      }
      socket.emit('doAction', {
        processId: selectedProcess.pid,
        payload  : { id },
        type     : 'target',
      });
    },
    [socket, selectedProcess],
  );

  const spawnContextMenu = useCallback(
    (spawn) => {
      setDetailedSpawn(spawn);
      handleSpawnOpen();
    },
    [setDetailedSpawn, handleSpawnOpen],
  );

  const spawnColumns = useMemo(
    () => [
      { field: 'displayedName', headerName: 'Name', width: 200 },
      { field: 'level', headerName: 'Level', type: 'number', width: 100 },
      {
        field      : 'type',
        headerName : 'Player Type',
        width      : 150,
        sortable   : false,
        valueGetter: (params) =>
          params.row.spawnType === 0
            ? 'PC'
            : params.row.spawnType === 1
              ? 'NPC'
              : 'Corpse',
      },
      {
        field      : 'location',
        headerName : 'Location (Y,X,Z)',
        width      : 150,
        sortable   : false,
        valueGetter: (params) =>
          `${params.row.y.toFixed(1)}, ${params.row.x.toFixed(
            1,
          )}, ${params.row.z.toFixed(1)}`,
      },
      { field: 'hp', headerName: 'Current HP%', width: 150, sortable: false },
      { field: 'maxHp', headerName: 'Max HP%', width: 100, sortable: false },
      ...(processMode && selectedProcess?.pid && socket
        ? [
          {
            field     : 'Teleport',
            headerName: 'Teleport',
            width     : 100,
            sortable  : false,
            renderCell: ({ row: { x, y, z } }) => {
              return (
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    socket.emit('doAction', {
                      processId: selectedProcess.pid,
                      payload  : {
                        y: x + 0.01,
                        z: z + 0.01,
                        x: y + 0.01,
                      },
                      type: 'warp',
                    });
                  }}
                >
                    Warp
                </Button>
              );
            },
          },
        ]
        : []),
    ],
    [socket, selectedProcess?.pid],
  );
  return (
    <ZoneContext.Provider
      value={{
        character,
        zone,
        groupMembers,
        spawnContextMenu,
        doTarget,
        macroRunning,
        chatLines,
        socket,
        selectedProcess,
        parseInfo,
      }}
    >
      <Paper className="zone-container" elevation={1}>
        <Card className="zone-header" variant="outlined">
          <CardContent className="zone-header">
            <div className="zone-header">
              <div className="btn-row">
                {embedded && <IconButton
                  color="inherit"
                  aria-label="open drawer"
                  onClick={() => drawerOpen ? handleDrawerClose() : handleDrawerOpen('settings')()}
                  edge="start"
                  sx={{ margin: '1px 5px', borderRadius: 2 }}
                >

                  <SettingsIcon />
                </IconButton>
                }
                {!embedded ? <Button
                  sx={{
                    color          : 'black',
                    backgroundColor: socket ? 'lightgreen' : 'white',
                  }}
                  variant="outlined"
                  onClick={handleConnectionOptionsOpen}
                >
                  <Typography variant="subheading" color="inherit" noWrap>
                    {socket ? 'Connected' : 'Connect EQ'}
                  </Typography>
                </Button> : <IconButton
                  sx={{
                    color          : 'black',
                    margin         : '1px 5px', borderRadius   : 2,
                    backgroundColor: socket ? 'lightgreen' : 'white',
                  }}
                  variant="outlined"
                  onClick={handleConnectionOptionsOpen}
                >
                  <Typography variant="subheading" color="inherit" noWrap>
                    <PowerIcon />
                  </Typography>
                </IconButton>}
               
        
                {selectedProcess?.zoneViewer && (
                  <Autocomplete
                    value={
                      supportedZoneOptions.find(
                        (o) => o.shortName === selectedZone,
                      )?.label
                    }
                    isOptionEqualToValue={(a) => a}
                    blurOnSelect
                    disablePortal
                    onChange={(e_, { shortName } = {}) => {
                      if (shortName) {
                        setSelectedZone(null);
                        setTimeout(() => {
                          setSelectedZone(shortName);
                        }, 1);
                      }
                    }}
                    id="combo-box-demo"
                    options={supportedZoneOptions}
                    sx={{ width: 300 }}
                    size="small"
                    renderInput={(params) => (
                      <TextField sx={{ height: 38 }} {...params} label="Zone" />
                    )}
                  />
                )}
                {spawns.length ? (
                  <>
                    <TextField
                      size="small"
                      onChange={({ target: { value } }) =>
                        setSpawnFilter(value)
                      }
                      label="Spawn Filter"
                      value={spawnFilter}
                    />
                    <InputLabel
                      style={{ marginLeft: 8 }}
                      id="demo-simple-select-label"
                    >
                      Showing {filteredSpawns.length} of {spawns.length} Spawns
                    </InputLabel>
                    <Button variant="outlined" onClick={handleSearchOpen}>
                      <Typography variant="subheading" color="inherit" noWrap>
                        Spawn Search
                      </Typography>
                    </Button>
                  </>
                ) : null}
                {showPoiFilter && showPoi ? (
                  <TextField
                    size="small"
                    onChange={({ target: { value } }) => setPoiFilter(value)}
                    label="Marker Filter"
                    value={poiFilter}
                  />
                ) : null}
                {staticSpawns.length && showStaticSpawnFilter ? (
                  <>
                    <TextField
                      size="small"
                      onChange={({ target: { value } }) =>
                        setStaticSpawnFilter(value)
                      }
                      label="Spawn Filter"
                      value={staticSpawnFilter}
                    />
                    <InputLabel
                      style={{ marginLeft: 8 }}
                      id="demo-simple-select-label"
                    >
                      Showing {filteredStaticSpawns.length} of{' '}
                      {staticSpawns.length} Static Spawns
                    </InputLabel>
                  </>
                ) : null}
              </div>

              {/* Search Dialog */}
              <Dialog
                maxWidth="lg"
                open={searchOpen}
                onClose={handleSearchClose}
                PaperComponent={PaperComponent}
                aria-labelledby="draggable-dialog-title"
              >
                <DialogTitle
                  style={{ cursor: 'move' }}
                  id="draggable-dialog-title"
                >
                  Spawn Search and Filter
                </DialogTitle>
                <DialogContent>
                  <div style={{ height: 600 }}>
                    <DataGrid
                      onRowClick={({ row }) => {
                        setMyTarget(row);
                        doTarget(row.id);
                      }}
                      columns={spawnColumns}
                      rows={spawns}
                    />
                  </div>
                </DialogContent>
                <DialogActions>
                  <Button autoFocus onClick={handleSearchClose}>
                    Done
                  </Button>
                </DialogActions>
              </Dialog>

              {/* Spawn Dialog */}
              <Dialog
                maxWidth="xs"
                BackdropProps={{ style: { backgroundColor: 'transparent' } }}
                open={spawnOpen}
                onClose={handleSpawnClose}
                PaperComponent={PaperComponent}
                aria-labelledby="draggable-dialog-title"
              >
                <DialogTitle
                  style={{ cursor: 'move' }}
                  id="draggable-dialog-title"
                >
                  {detailedSpawn.displayedName}
                </DialogTitle>
                <DialogContent>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography
                        sx={{ fontSize: 16 }}
                        color="text.secondary"
                        gutterBottom
                      >
                        Level: {detailedSpawn.level}
                      </Typography>

                      <Typography
                        sx={{ fontSize: 16 }}
                        color="text.secondary"
                        gutterBottom
                      >
                        Class: {classes[detailedSpawn.classId]}
                      </Typography>

                      <Typography
                        sx={{ fontSize: 16 }}
                        color="text.secondary"
                        gutterBottom
                      >
                        Race:{' '}
                        {raceData.find((r) => r.id === detailedSpawn.race)
                          ?.name ?? 'Unknown'}
                      </Typography>

                      <Typography
                        sx={{ fontSize: 16 }}
                        color="text.secondary"
                        gutterBottom
                      >
                        Location (YXZ): {detailedSpawn.y}, {detailedSpawn.x},{' '}
                        {detailedSpawn.z}
                      </Typography>

                      <Typography
                        sx={{ fontSize: 16 }}
                        color="text.secondary"
                        gutterBottom
                      >
                        Health: {detailedSpawn.hp}%
                      </Typography>

                      <div style={{ margin: '10px 0px' }} />

                      <Accordion>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                          <Typography>Detailed Information</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                          <JSONTree
                            data={detailedSpawn}
                            theme={theme}
                            invertTheme={false}
                          />
                        </AccordionDetails>
                      </Accordion>
                    </CardContent>
                  </Card>
                </DialogContent>

                <DialogActions>
                  <Button
                    autoFocus
                    onClick={() => {
                      if (zoneRef.current) {
                        zoneRef.current.targetObject(detailedSpawn);
                      }
                    }}
                  >
                    Camera Pan
                  </Button>
                  <Button autoFocus onClick={() => doTarget(detailedSpawn.id)}>
                    Target
                  </Button>
                  <Button
                    autoFocus
                    onClick={() => {
                      socket.emit('doAction', {
                        processId: selectedProcessRef.current.pid,
                        payload  : {
                          y: detailedSpawn.x + 0.01,
                          z: detailedSpawn.z + 0.01,
                          x: detailedSpawn.y + 0.01,
                        },
                        type: 'warp',
                      });
                    }}
                  >
                    Warp
                  </Button>
                  <Button autoFocus onClick={handleSpawnClose}>
                    Done
                  </Button>
                </DialogActions>
              </Dialog>

              {/* Connection Dialog */}
              <ConnectionDialog
                connectionOptionsOpen={connectionOptionsOpen}
                setConnectionOptionsOpen={setConnectionOptionsOpen}
                PaperComponent={PaperComponent}
                doConnect={doConnect}
                doDisconnect={doDisconnect}
                connected={!!socket}
              />

              {/* Connection Dialog */}
              <MacroEditorDialog
                open={macroEditorOpen}
                setOpen={setMacroEditorOpen}
                PaperComponent={PaperComponent}
              />

              {/* UI Overlay */}

              <Canvas ref={threeRef}>
                {/* <SkyBox /> */}
                <CameraControls
                  addToast={addToast}
                  controls={cameraControls}
                  type={cameraType}
                  flySpeed={flySpeed}
                  ref={cameraControls}
                />
                <ambientLight />
                <pointLight position={[10, 10, 10]} />
                {selectedProcess && zoneName && (
                  <Suspense fallback={<Loader />}>
                    <RenderedZone
                      socket={socket}
                      parseInfo={parseInfo}
                      zoneDetails={filteredZoneDetails}
                      character={selectedProcess?.zoneViewer ? null : character}
                      ref={zoneRef}
                      spawns={filteredSpawns}
                      staticSpawns={filteredStaticSpawns}
                      myTarget={selectedProcess?.zoneViewer ? null : myTarget}
                      setMyTarget={setMyTarget}
                      controls={cameraControls}
                      zoneName={zoneName}
                      canvasRef={canvasRef}
                      doTarget={doTarget}
                      groupMembers={showGroup ? groupMembers : []}
                      selectedProcess={selectedProcess}
                      spawnContextMenu={spawnContextMenu}
                      options={options}
                    />
                  </Suspense>
                )}
              </Canvas>
              {threeRef.current &&
                ReactDOM.createPortal(
                  <canvas
                    style={{
                      position     : 'absolute',
                      top          : 0,
                      left         : 0,
                      pointerEvents: 'none',
                    }}
                    width={threeRef.current?.width ?? 1}
                    height={threeRef.current?.height ?? 1}
                    ref={canvasRef}
                  ></canvas>,
                  threeRef.current.parentNode,
                )}
              {threeRef.current && showParserUi && (
                <UiOverlay
                  camera={cameraControls}
                  rootNode={threeRef.current.parentNode} 
                  parseInfo={parseInfo} socket={socket} 
                  socketConnected={socketConnected} 
                  setZone={setSelectedZone} 
                  setParseInfo={setParseInfo} />
              )}
            </div>
          </CardContent>
          <CardActions></CardActions>
        </Card>
      </Paper>
    </ZoneContext.Provider>
  );
};
