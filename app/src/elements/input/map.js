import React, { useState, useRef, useMemo, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import { GeoSearchControl, OpenStreetMapProvider } from 'leaflet-geosearch';
import 'leaflet/dist/leaflet.css';
import 'leaflet-geosearch/dist/geosearch.css';

export default function Map(props) {
  const [position, setPosition]   = useState(props.position || {lat: null, lng: null});
  const markerRef                 = useRef(null);
  const searchProvider            = useMemo(() => new OpenStreetMapProvider(), []);
  const searchControl             = useMemo(() => new GeoSearchControl({
    style: 'bar',
    autocomplete: true,
    autoCompleteDelay: 250,
    maxSuggestions: 5,
    provider: searchProvider,
    showMarker: false,
    maxMarkers: 1,
    showPopup: false,
    maxMarkers: 1,
    keepResult: true,
  }), []);

  const iconStyles = {
    position: 'absolute',
    left: '10px',
    width: '40px',
    height: '40px',
    zIndex: '1000',
    backgroundSize: '40px',
    cursor: 'pointer',
    boxShadow: '0 0 15px 2px',
    backgroundColor: 'rgb(255,255,255,0.6)',
    borderRadius: '50%',
    backgroundSize: '30px',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center',
  }

  const markerDragEventHandler = useMemo(
    () => ({
      dragend() {
        const marker = markerRef.current;
        if (marker != null) {
          setPosition(marker.getLatLng());
        }
      },
    }),
    [],
  );

  function LocationMarker() {
    const map = useMapEvents({
      locationfound(e) {
        setPosition(e.latlng);
      },
    });

    map.addControl(searchControl);

    useEffect(() => { 
      props.setPosition && props.setPosition(position);
      if(position.lat && position.lng) {
        map.flyTo(position, map.getZoom());
      }
  
      const addressTextInput = document.querySelector('.leaflet-control-container .leaflet-control-geosearch.leaflet-geosearch-bar > form > input');
      addressTextInput && props.setAddress && props.setAddress(addressTextInput.value);
    }, [position]);
  
    return position === null ? null : (
      <Marker 
        position={position} 
        draggable={true} 
        eventHandlers={markerDragEventHandler} 
        ref={markerRef}
      >
        <Popup>You are here</Popup>
      </Marker>
    )
  }

  function DropMarker() {
    const map = useMapEvents({});

    const dropMarkerStyle = {
      ...iconStyles,
      bottom: '70px',
      backgroundImage: 'url("data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiA/PjxzdmcgaWQ9IkxheWVyXzEiIHN0eWxlPSJlbmFibGUtYmFja2dyb3VuZDpuZXcgMCAwIDEwMC4zNTMgMTAwLjM1MjsiIHZlcnNpb249IjEuMSIgdmlld0JveD0iMCAwIDEwMC4zNTMgMTAwLjM1MiIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayI+PGc+PHBhdGggZD0iTTU4LjIzLDY5Ljk5MmwxNC45OTMtMjQuMTA4YzAuMDQ5LTAuMDc4LDAuMDktMC4xNiwwLjEyMi0wLjI0NWMyLjU4OS00LjIyMiwzLjk1Ni05LjA0NSwzLjk1Ni0xMy45NjkgICBjMC0xNC43NzItMTIuMDE4LTI2Ljc5LTI2Ljc5LTI2Ljc5UzIzLjcyLDE2Ljg5OCwyMy43MiwzMS42N2MwLDQuOTI1LDEuMzY5LDkuNzUsMy45NiwxMy45NzVjMC4wMywwLjA3NCwwLjA2NSwwLjE0NiwwLjEwNywwLjIxNiAgIGwxNC40NTUsMjQuMTkxYy0xMS4yMjEsMS41ODYtMTguNiw2LjItMTguNiwxMS43OTdjMCw2LjkzNSwxMS43ODUsMTIuMzY2LDI2LjgyOSwxMi4zNjZTNzcuMyw4OC43ODMsNzcuMyw4MS44NDkgICBDNzcuMzAxLDc2LjIyNiw2OS41NzgsNzEuNTA5LDU4LjIzLDY5Ljk5MnogTTMwLjM3Myw0NC4yOTRjLTIuMzktMy44MDQtMy42NTMtOC4xNjktMy42NTMtMTIuNjI0ICAgYzAtMTMuMTE4LDEwLjY3Mi0yMy43OSwyMy43OTEtMjMuNzljMTMuMTE4LDAsMjMuNzksMTAuNjcyLDIzLjc5LDIzLjc5YzAsNC40NTctMS4yNjMsOC44MjItMy42NTIsMTIuNjI0ICAgYy0wLjA1LDAuMDgtMC4wOTEsMC4xNjMtMC4xMjQsMC4yNDlMNTQuNjg1LDcwLjAxYy0wLjIzOCwwLjM2NS0wLjI4NSwwLjQ0OC0wLjU3NiwwLjkyNmwtNCw2LjQzMkwzMC41MDcsNDQuNTY0ICAgQzMwLjQ3Miw0NC40NzEsMzAuNDI3LDQ0LjM4LDMwLjM3Myw0NC4yOTR6IE01MC40NzIsOTEuMjE1Yy0xNC4wNDMsMC0yMy44MjktNC45MzctMjMuODI5LTkuMzY2YzAtNC4wMiw3LjM3LTcuODA4LDE3LjI4My04Ljk4MSAgIGw0Ljg3LDguMTUxYzAuMjY5LDAuNDQ5LDAuNzUxLDAuNzI2LDEuMjc0LDAuNzNjMC4wMDQsMCwwLjAwOSwwLDAuMDEzLDBjMC41MTgsMCwxLTAuMjY4LDEuMjc0LTAuNzA4bDUuMTItOC4yMzIgICBDNjYuNTQ4LDczLjksNzQuMyw3Ny43ODQsNzQuMyw4MS44NDlDNzQuMzAxLDg2LjI3OSw2NC41MTUsOTEuMjE1LDUwLjQ3Miw5MS4yMTV6Ii8+PHBhdGggZD0iTTYwLjIxMywzMS42N2MwLTUuMzcxLTQuMzctOS43NDEtOS43NDEtOS43NDFzLTkuNzQxLDQuMzctOS43NDEsOS43NDFzNC4zNyw5Ljc0MSw5Ljc0MSw5Ljc0MSAgIEM1NS44NDMsNDEuNDExLDYwLjIxMywzNy4wNDEsNjAuMjEzLDMxLjY3eiBNNDMuNzMxLDMxLjY3YzAtMy43MTcsMy4wMjQtNi43NDEsNi43NDEtNi43NDFzNi43NDEsMy4wMjQsNi43NDEsNi43NDEgICBzLTMuMDIzLDYuNzQxLTYuNzQxLDYuNzQxUzQzLjczMSwzNS4zODcsNDMuNzMxLDMxLjY3eiIvPjwvZz48L3N2Zz4=")',
    }

    return (
      <div style={dropMarkerStyle} onClick={e => { 
        setPosition(map.getCenter());
      }}></div>
    )
  }

  function LocateMe() {
    const locateMeStyle = {
      ...iconStyles,
      bottom: '10px',
      backgroundImage: 'url("data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiA/PjxzdmcgaGVpZ2h0PSIyNzZweCIgdmVyc2lvbj0iMS4xIiB2aWV3Qm94PSIwIDAgMjc2IDI3NiIgd2lkdGg9IjI3NnB4IiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIj48dGl0bGUvPjxkZXNjLz48ZGVmcy8+PGcgZmlsbD0ibm9uZSIgZmlsbC1ydWxlPSJldmVub2RkIiBpZD0iUGFnZS0xIiBzdHJva2U9Im5vbmUiIHN0cm9rZS13aWR0aD0iMSI+PGcgZmlsbC1ydWxlPSJub256ZXJvIiBpZD0idHJhY2tlciI+PHBhdGggZD0iTTEzNy42NjcsMTY4LjAyMSBDMTU0LjQwNCwxNjguMDIxIDE2OC4wMjEsMTU0LjQwNCAxNjguMDIxLDEzNy42NjcgQzE2OC4wMjEsMTIwLjkzIDE1NC40MDQsMTA3LjMxMyAxMzcuNjY3LDEwNy4zMTMgQzEyMC45MywxMDcuMzEzIDEwNy4zMTMsMTIwLjkzIDEwNy4zMTMsMTM3LjY2NyBDMTA3LjMxMywxNTQuNDA0IDEyMC45MywxNjguMDIxIDEzNy42NjcsMTY4LjAyMSBaIE0xMzcuNjY3LDExOS4zMTMgQzE0Ny43ODgsMTE5LjMxMyAxNTYuMDIxLDEyNy41NDYgMTU2LjAyMSwxMzcuNjY3IEMxNTYuMDIxLDE0Ny43ODggMTQ3Ljc4OCwxNTYuMDIxIDEzNy42NjcsMTU2LjAyMSBDMTI3LjU0NiwxNTYuMDIxIDExOS4zMTMsMTQ3Ljc4OCAxMTkuMzEzLDEzNy42NjcgQzExOS4zMTMsMTI3LjU0NiAxMjcuNTQ2LDExOS4zMTMgMTM3LjY2NywxMTkuMzEzIFoiIGZpbGw9IiNGQjRBNUUiIGlkPSJTaGFwZSIvPjxwYXRoIGQ9Ik0yNjkuMzM0LDEzMS42NjcgTDI0NS41NTksMTMxLjY2NyBDMjQyLjU0NCw3Ni44NDkgMTk4LjQ4NSwzMi43OSAxNDMuNjY3LDI5Ljc3NSBMMTQzLjY2Nyw2IEMxNDMuNjY3LDIuNjg3IDE0MC45OCwwIDEzNy42NjcsMCBDMTM0LjM1NCwwIDEzMS42NjcsMi42ODcgMTMxLjY2Nyw2IEwxMzEuNjY3LDM1LjYwNSBDMTMxLjY2NywzOC45MTggMTM0LjM1NCw0MS42MDUgMTM3LjY2Nyw0MS42MDUgQzE5MC42MzYsNDEuNjA1IDIzMy43MjksODQuNjk4IDIzMy43MjksMTM3LjY2NyBDMjMzLjcyOSwxOTAuNjM2IDE5MC42MzYsMjMzLjcyOSAxMzcuNjY3LDIzMy43MjkgQzg0LjY5OCwyMzMuNzI5IDQxLjYwNSwxOTAuNjM2IDQxLjYwNSwxMzcuNjY3IEM0MS42MDUsMTAwLjg4NCA2My4wNTcsNjYuODUgOTYuMjU2LDUwLjk2MyBDOTkuMjQ1LDQ5LjUzMiAxMDAuNTA5LDQ1Ljk1IDk5LjA3OCw0Mi45NjEgQzk3LjY0OCwzOS45NzMgOTQuMDYzLDM4LjcwOSA5MS4wNzYsNDAuMTM5IEM3Mi45NDUsNDguODE1IDU3LjYwMyw2Mi4zNTYgNDYuNzEsNzkuMjk3IEMzNi42LDk1LjAyMSAzMC44MTMsMTEzLjAxNSAyOS43ODYsMTMxLjY2NyBMNiwxMzEuNjY3IEMyLjY4NywxMzEuNjY3IDAsMTM0LjM1NCAwLDEzNy42NjcgQzAsMTQwLjk4IDIuNjg3LDE0My42NjcgNiwxNDMuNjY3IEwyOS43NzUsMTQzLjY2NyBDMzIuNzksMTk4LjQ4NSA3Ni44NDksMjQyLjU0NCAxMzEuNjY3LDI0NS41NTkgTDEzMS42NjcsMjY5LjMzNCBDMTMxLjY2NywyNzIuNjQ3IDEzNC4zNTQsMjc1LjMzNCAxMzcuNjY3LDI3NS4zMzQgQzE0MC45OCwyNzUuMzM0IDE0My42NjcsMjcyLjY0NyAxNDMuNjY3LDI2OS4zMzQgTDE0My42NjcsMjQ1LjU1OSBDMTk4LjQ4NSwyNDIuNTQ0IDI0Mi41NDQsMTk4LjQ4NSAyNDUuNTU5LDE0My42NjcgTDI2OS4zMzQsMTQzLjY2NyBDMjcyLjY0NywxNDMuNjY3IDI3NS4zMzQsMTQwLjk4IDI3NS4zMzQsMTM3LjY2NyBDMjc1LjMzNCwxMzQuMzU0IDI3Mi42NDcsMTMxLjY2NyAyNjkuMzM0LDEzMS42NjcgWiIgZmlsbD0iIzAwMDAwMCIgaWQ9IlNoYXBlIi8+PC9nPjwvZz48L3N2Zz4=")',
    }
    return (
      <div style={locateMeStyle} onClick={e => { 
          if(navigator.geolocation) { 
            navigator.geolocation.getCurrentPosition(
              (geoPos) => { setPosition({lat: geoPos.coords.latitude, lng: geoPos.coords.longitude}) },
              () => { console.log('Error in identifying geo-location') }
            );
          } else { alert('Geolocation is not supported by your browser!') }
        }}>
      </div>
    );
  }

  return (
    <MapContainer
      center={position}
      zoom={13}
      scrollWheelZoom={true}
    >
      <DropMarker />
      <LocateMe />
      <TileLayer
        attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <LocationMarker position={position} />
    </MapContainer>
  );
}