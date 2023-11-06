import * as React from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';

import './component.scss';
import { Link } from '@mui/material';

export const Contact = () => {
  return (
    <Box className="map-parser-content">
      <Card variant="outlined">
        <CardContent>
          <Typography variant="h4" noWrap component="div">
              Contact
          </Typography>
          <br />
          <Card className="map-parser-req-software" variant="outlined">
            <CardContent>
              <Typography variant="h5" component="div">
               Email
              </Typography>
              <Typography variant="p" component="div">
              Feel free to email comments and suggestions to eqadvancedmaps@gmail.com
              </Typography>
              <br />
              <Typography variant="h5" component="div">
               Discord
              </Typography>
              <Typography variant="p" component="div">
              I can be contacted on discord as <Link href="https://discordapp.com/users/162654344875999232">temp0</Link>
              </Typography>
            </CardContent>
          </Card>
          <br />

          <Typography variant="h4" noWrap component="div">
              EQ Requiem
          </Typography>
          <br />
          <Card className="map-parser-req-software" variant="outlined">
            <CardContent>
              <Typography sx={{ fontSize: 18 }} color="text.secondary" gutterBottom>
                <Link href="https://eqrequiem.com">EQ Requiem</Link>  is another passion project of mine that is currently in development. It attempts to recreate the EQ client in the browser using another 3D framework.
              </Typography>
            </CardContent>
          </Card>

          <Typography variant="h4" noWrap component="div">
              About Me
          </Typography>
          <br />
          <Card className="map-parser-req-software" variant="outlined">
            <CardContent>
              <Typography sx={{ fontSize: 18 }} color="text.secondary" gutterBottom>
              I've been playing EQ on and off since 1999 and started toying with the emulator back when it was part of hackersquest.gomp.ch. 
              Now I enjoy building new tools around an old game to help relive some nostalgia and as added utilities for when I do have time to play ;) 
              I spend most of my time on the project EQ Requiem deconstructing the old client and creating the new one.
              </Typography>
            </CardContent>
          </Card>
          <br />
        </CardContent>
      
      </Card>
    </Box>
  );
};
