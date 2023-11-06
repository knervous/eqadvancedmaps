import * as React from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';

import './component.scss';
import { Button, Link } from '@mui/material';

const dotNetLink = 'https://dotnet.microsoft.com/en-us/download/dotnet/thank-you/runtime-desktop-5.0.17-windows-x64-installer';

const version = '0.2.1';

export const MapParser = () => {
  return (
    <Box className="map-parser-content">
      <Card variant="outlined">
        <CardContent>
          <Typography variant="h3" noWrap component="div">
              Advanced Map Parser
          </Typography>
          <Typography variant="h4" noWrap component="div">
              Latest Version: {version}
          </Typography>
          <Typography variant="h4" noWrap component="div">
            <a target="_blank" href="https://github.com/knervous/AdvancedMapParser" rel="noreferrer">Source code</a>
          </Typography>
          <br />
          {/* <Card className="map-parser-req-software" variant="outlined"> */}
          {/* <img width={'90%'} src="/img/amp-cover2.png" alt="cover" /> */}
          <Typography sx={{ margin: '5px 0' }} variant="h4" component="div">
               New: Multi-User Support!
          </Typography>
          <img width={'90%'} src="/img/amp-cover4.png" alt="cover" />
          {/* </Card> */}

          <Card className="map-parser-req-software" variant="outlined">
            <CardContent>
              <Typography variant="h4" component="div">
               Required Software
              </Typography>
              <Typography variant="p" component="div">
               The .NET Desktop Runtime is required to run the Advanced Map Parser. <br/> Below are download links for both the runtime and the latest version of the tool.
              </Typography>
              
            </CardContent>
            <CardActions style={{ display: 'flex', justifyContent: 'center' }}>
              <Button target="_blank" href={dotNetLink} size="large">Download the .NET Runtime</Button>
              <Button download href={`/map-parser/AdvancedMapParser-${version}.zip`} size="large">Download Advanced Map Parser {version}</Button>
            </CardActions>
          </Card>
        
          <Card className="map-parser-installation" variant="outlined">
            <CardContent>
              <Typography variant="h4" component="div">
               First time setup
              </Typography>
              <Typography className="map-parser-installation-steps" sx={{ fontSize: 18 }} gutterBottom component="div">
               1. Extract the Map Parser contents into your ROOT EverQuest folder. An example would be C:/Program Files (x86)/Sony/EverQuest <br/> 
               2. Start AdvancedMapParser.exe. This should guide you through some prompts and eventually open a command console.<br/> 
               3. Copy the address in the command console for the local server, default of wss://127.0.0.1:9004. You can also connect via LAN by the network address or through the internet. <br/> 
               4. While in game, type the /log command to start logging. If there are no log files try this link to troubleshoot <a href="https://wiki.project1999.com/Logfiles" target="_blank" rel="noreferrer">https://wiki.project1999.com/Logfiles</a><br/> 
               5. Create a hotkey that runs the /loc command. People generally double bind this to a frequently used key like A or D to automatically execute /loc. <br/> 
               6. Open the Advanced Map Parser on this site and press "Connect EQ". Paste in the address from the AdvancedMapParser console. <br/>
               7. Click the "Launch Tab to Override" button and follow instructions in the troubleshooting section<br/>
               8. Once you've seen the message "Successfully connected!" you can return to the EQ Advanced Map website and click "Connect" in the connection dialog.
               9. You're connected! Now any /loc command in game should update your character's zone and location. Type /who while not anonymous or roleplaying to update your race, class and level.
              </Typography>
            </CardContent>
          </Card>
          <br />

          <Card className="map-parser-installation" variant="outlined">
            <CardContent>
              <Typography variant="h4" component="div">
                Next Time Use
              </Typography>
              <Typography className="map-parser-installation-steps" sx={{ fontSize: 18 }} gutterBottom component="div">
               1. If you've successfully installed and connected previously, just make sure your AdvancedMapTool.exe is running<br/> 
               2. Load up the EQ Advanced Map in your browser. You should connect automatically. If you don't, try the "Launch Tab to Override" button in the Connect dialog.<br/> 
              </Typography>
            </CardContent>
          </Card>
          <br />

          <Card className="map-parser-installation" variant="outlined">
            <CardContent>
              <Typography variant="h4" component="div">
                Multi-User Support: Host
              </Typography>
              <Typography className="map-parser-installation-steps" sx={{ fontSize: 18 }} gutterBottom component="div">
               1. If you are the host, you will need to open config.ini and change the value to HOST=true. Start AdvancedMapParser.exe and ensure the console prints "You are configured as a host...etc." <br/> 
               2. Chances are if you are using a LAN, you will need to enable port forwarding for the specific machine you're hosting on. This looks different depending on hardware, but is configured
               through the router. <Link target='_blank' href="https://www.linksys.com/sa/support-article/?articleNum=138535">Here</Link> is an example of settings on a Linksys router. Whatever port you choose (9004) 
               by default will need to be forwarded to your machine.<br/> 
               3. Note your public IP address (shown in the console on startup - likely this IP unless a VPN is active) and distribute it to friends to have them configure their HOST_IP in config.ini and to
               connect in the client site.<br/>
               4. Connect to your Advanced Map Parser like normal as outlined in the first time setup.
              </Typography>
            </CardContent>
          </Card>

          <Card className="map-parser-installation" variant="outlined">
            <CardContent>
              <Typography variant="h4" component="div">
                Multi-User Support: Client
              </Typography>
              <Typography className="map-parser-installation-steps" sx={{ fontSize: 18 }} gutterBottom component="div">
               1. If you are configuring as a client of the host, the host will give you their public IP (something like 1.2.3.4:9004). Set this value in 
               config.ini as HOST_IP=1.2.3.4:9004<br/> 
               2. Start AdvancedMapParser.exe and ensure the terminal is able to connect to the host.
               3. Connect to the host's Advanced Map Parser as outlined in the first time setup using their IP to connect to (1.2.3.4:9004)
               4. You should see updates from everyone connected to the Parser: The host, yourself and anyone else connected.
              </Typography>
            </CardContent>
          </Card>

          <Card className="map-parser-installation" variant="outlined">
            <CardContent>
              <img width={'90%'} src="/img/host-client.png" alt="cover" />
            </CardContent>
          </Card>
          <br />
        </CardContent>
      </Card>
    </Box>
  );
};
