import React from 'react';
import placeHolderImage from '../media/image-placeholder.png'
import { Button, CircularProgress, Snackbar } from "@material-ui/core";

const navBar = () => {

  const frowBetween = {
    display: 'flex',
    flexDirection: 'row' as any,
    justifyContent: 'space-between',
  }

  const frowCenter = {
    display: 'flex',
    flexDirection: 'row' as any,
    justifyContent: 'center',
    paddingTop: '50px',
  }


  return (
    <div style={frowCenter}>
      <div style={{...frowBetween, width: '70%'}}>
        <div>
        <a href='https://supersols.app'>
             <img src={placeHolderImage} style={{width: '120px'}}/>
        </a>  
        </div>
        <div style={{...frowBetween, width: '53%'}}>
          <Button style={{background: '#6a3535', color: 'white'}} href='https://discord.gg/xCdpDaKX2j'>Discord</Button>
          <Button style={{background: '#6a3535', color: 'white'}} href='https://twitter.com/'>Twitter</Button>
        </div>

      </div>
    </div>
  )
}

export default navBar;