import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Camera } from 'expo-camera';
import React, { useState, useRef, useEffect } from 'react';


export default function App() {

  const [hasPermission, setHasPermission] = useState(null);
  const [type, setType] = useState(Camera.Constants.Type.front);
  const cameraRef = useRef(null);
  const [mydata, setMyData] = useState([]);



  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();

  }, []);

  if (hasPermission === null) {
    return <View />
  }
  if (hasPermission === false) {
    return <Text>No access to camera</Text>
  }

  const TakePicture = async () => {
    if (cameraRef.current) {
      try {
        const options = { quality: 0.5, base64: true };
        const data = await cameraRef.current.takePictureAsync(options);

        // console.log('Photo save at? ', data.uri);
        // console.log(data.base64);

        fetch('https://be36-2001-4450-46b7-f00-c138-7e62-20e5-b9c0.ngrok-free.app/server', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ image: data.base64 })
        })
          .then(response => response.json())
          .then(data => {
            console.log(data);
            setMyData(data);
          })
          .catch(e => console.error("Error: ", e))
      }
      catch (error) {
        console.error(error);
      }
    }
  }
  return (
    <View style={styles.container}>
      <Camera style={{ flex: 1, }} type={type} ref={cameraRef}>
        <View style={{ flex: 1, backgroundColor: 'transparent', flexDirection: 'row', alignSelf: 'center' }}>
          <View style={styles.rectangle}></View>
        </View>
      </Camera>
      <TouchableOpacity style={{ flex: 0.1, alignSelf: 'flex-end', alignItems: 'center' }}
        onPress={() => setType(
          type === Camera.Constants.Type.back
            ? Camera.Constants.Type.front
            : Camera.Constants.Type.back
        )}>
        <Text style={{ fontSize: 18, marginBottom: 10, color: 'red' }}> Flip </Text>
      </TouchableOpacity>
      {/* <Text style={{ fontSize: 18, marginBottom: 10, color: 'red' }}> {mydata.shoulder_width_cm} </Text> */}
      <TouchableOpacity style={{ alignSelf: 'flex-end', alignItems: 'center', marginBottom: 20 }}
        onPress={TakePicture}>
        <Text style={{ fontSize: 18, marginBottom: 10, color: 'red' }}> TakePicture </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  rectangle: {
    borderColor: 'black',
    borderWidth: 5,
    alignSelf: 'center',
    zIndex: 1,
    height: '100%',
    width: '50%',
    marginBottom: 20
  },

});
