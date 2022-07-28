// dependencies
import React, { useState, useEffect } from 'react';
import { useHistory } from "react-router-dom";
import Quagga from 'quagga';

// misc
import './scannerStyle.css';
import PushAlert from '../../commons/notification';

function ScannerRaw(props) {
  let [isScanned , setScanned]  = useState(false);
  let history                   = useHistory();
  let isScannerOn;

  function _onDetected(scanResult) {
    Quagga.stop();
    console.log(scanResult.codeResult.code);
    PushAlert.info(`Scanned Code: ${scanResult.codeResult.code}`);

    setScanned(true);
    history.push(`/${props.storecode}/products/detail/${scanResult.codeResult.code}`);
  }

  function _initScan() {
    if (document.querySelector('[data-id="reScan"'))
      document.querySelector('[data-id="reScan"').remove();

    Quagga.init(
      {
        inputStream: {
          name: "Live",
          type: 'LiveStream',
          target: document.querySelector('[data-id="scannerView"'),
        },
        locator: {
          patchSize: 'medium',
          halfSample: true,
        },
        numOfWorkers: 4,
        decoder: {
          readers: [
            "code_128_reader",
            "ean_reader",
            "ean_8_reader",
            "code_39_reader",
            "code_39_vin_reader",
            "codabar_reader",
            "upc_reader",
            "upc_e_reader",
            "i2of5_reader",
          ],
          multiple: false,
        },
        locate: true,
      },
      function(err) {
        if (err) {
          return console.log(err);
        }

        Quagga.start();

        if (void 0 === isScannerOn) {
          isScannerOn = setTimeout(()=> {   
            isScannerOn = void 0;       
            Quagga.stop();
    
            let restartToggle = `<div data-id='reScan' class='rescan'><div>Re-Scan</div></div>`;
            
            if (document.querySelector('[data-id="scannerView"')) {
                document.querySelector('[data-id="scannerView"').innerHTML = restartToggle;
    
                document.querySelector('[data-id="reScan"')
                    .addEventListener("click", _initScan);
            }
          }, 5000);

        } else {
          clearTimeout(isScannerOn);
        };
      },
    );

    Quagga.onDetected(_onDetected);
    
    setScanned(false);
  }

  useEffect(() => {
    !isScanned && _initScan();

    return () => {
      clearTimeout(isScannerOn);
      Quagga.offDetected();
      Quagga.stop();
    }
  }, []);

  return (
    <div style={{height: '100%'}}>
      {
        !isScanned && 
        <div className='scanner-container'>
          <div className='message'>
            <div className='message-label'>Scan Bar Code</div>
            <div className='message-subtext'>Place bar-code inside the frame to scan.</div>
          </div>
          <div className='barcode-marker'>
            <div data-id='scannerView' className='scanner-view'></div>
          </div>   
        </div>
      }
    </div>
  )
};

const Scanner = React.memo(ScannerRaw);

export default Scanner;