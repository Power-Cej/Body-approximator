// every time ngrok executed make sure to change the fetch "value" besides "PATH(/server)" to match the nrok generated link.
// open the link click "Visit Site" for authentication,
// otherwise it won't connect to back-end.
import { StyleSheet, Text, TouchableOpacity, View, Image, Modal } from 'react-native';
import { Camera } from 'expo-camera';
import React, { useState, useRef, useEffect } from 'react';



export default function App() {
  const [hasPermission, setHasPermission] = useState(null);
  const [type, setType] = useState(Camera.Constants.Type.front);
  const cameraRef = useRef(null);
  const [timer, setTimer] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  const [mydata, setMyData] = useState('');



  useEffect(() => {
    // check permission 
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

  //

  const TimerDefault = () => {
    if (!timer) {
      setTimer(5);

      const timerInterval = setInterval(() => {
        setTimer(prevTimer => prevTimer - 1);
      }, 1000);

      setTimeout(async () => {
        clearInterval(timerInterval);
        TakePicture();
      }, 5000)
    }

  }

  const TakePicture = async () => {
    if (cameraRef.current) {
      try {
        const options = { quality: 0.5, base64: true, };
        const data = await cameraRef.current.takePictureAsync(options);

        fetch('https://curvz-style-client-mobile.onrender.com/server',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ image: data.base64 })
          })
          .then(async (response) => {
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
              const data = await response.json();
              console.log(data);
              setMyData(data);
            } else {
              console.error('Response is not JSON');
            }
          })
          .catch(e => console.error("Error: ", e))
          .finally(() => {
            setTimer(null);
          });
      }
      catch (error) {
        console.error(error);
        setTimer(null);
      }
    }
  }

  const BulletText = ({ text }) => (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <Text style={{ fontSize: 30, marginRight: 5 }}>•</Text>
      <Text style={{ fontSize: 20 }}>{text}</Text>
    </View>
  );

  return (
    <View style={styles.container}>

      {/* cameraView */}
      <Camera style={{ flex: 1, }} type={type} ref={cameraRef}>
        <View style={{ flex: 1, backgroundColor: 'transparent', flexDirection: 'row', alignSelf: 'center' }}>
          <View style={styles.rectangle}></View>
        </View>

        {/* how to use floating button*/}
        <TouchableOpacity style={{ height: 50, width: 50, zIndex: 2, position: 'absolute', left: 300, top: 30 }}
          onPress={() => setModalVisible(true)}>
          <Image style={{ width: 50, height: 50 }} source={require('./resources/how.png')} />
        </TouchableOpacity>
        {/* customize alert Dialog  */}
        <Modal
          animationType='slide'
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => { setModalVisible(false) }}
        >
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <View style={{ backgroundColor: 'grey', padding: 20, borderRadius: 10, alignItems: 'center' }}>
              {/* Add your modal content here */}
              <Text style={{ fontWeight: 'bold' }}>HOW TO USE?</Text>
              <Text>Take a picture with a 5-seconds default timer.</Text>
              <Image style={{ width: 280, height: 230, borderRadius: 10, margin: 10 }} source={require('./resources/ref.png')} />
              <Text style={{ fontWeight: 'bold' }}>IDEAL POSITION:</Text>
              <View>
                <BulletText text='Pitch angle - Portrait shot' />
                <BulletText text='Height from ground - 20cm' />
                <BulletText text='Distance from character - 50cm' />
                <BulletText text='Focal angle - Reference reactangle' />
              </View>
              <TouchableOpacity style={{ marginTop: 10, width: 50, height: 30, justifyContent: 'center', alignItems: 'center' }} onPress={() => setModalVisible(false)}>
                <Text style={{ fontWeight: 'bold', color: 'red', fontSize: 20 }}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Flip button  */}
        <TouchableOpacity style={{
          borderRadius: 100, backgroundColor: 'grey', width: 50, height: 50, justifyContent: 'center', position: 'absolute',
          top: 100, left: 300
        }}
          onPress={() => setType(
            type === Camera.Constants.Type.back
              ? Camera.Constants.Type.front
              : Camera.Constants.Type.back
          )}>
          <Text style={{ fontSize: 20, alignSelf: 'center', color: 'white', fontWeight: 'bold' }}> F </Text>
        </TouchableOpacity>

      </Camera>

      {/* buttons  */}
      <View style={{ height: '40%', width: '100%', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', }}>
        {/* display timer count */}
        {timer !== null && (
          <Text style={{ fontSize: 18, color: 'blue' }}>{timer} seconds remaining</Text>
        )}

        {/* TakePicture button  */}
        <View style={{ flexDirection: 'row' }}>
          <TouchableOpacity style={styles.button}
            onPress={TakePicture}>
            <Text style={styles.buttonText}> TakePicture </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.button}
            onPress={TimerDefault}>
            <Text style={styles.buttonText}> 5sTimer </Text>
          </TouchableOpacity>
        </View>
        <View style={{ flexDirection: 'column' }}>
          <BulletText text={'Shoulder: ' + mydata.shoulder_width_cm}></BulletText>
          <BulletText text={'Top: ' + mydata.top_length_cm}></BulletText>
          <BulletText text={'Leg: ' + mydata.leg_length_cm}></BulletText>
        </View>


      </View>
    </View >
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  rectangle: {
    borderColor: 'white',
    borderWidth: 5,
    alignSelf: 'center',
    zIndex: 1,
    height: '100%',
    width: '50%',
    marginBottom: 20
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'grey',
    margin: 10,
    height: 50,
    width: '30%',
    borderRadius: 10
  },
  buttonText: {
    fontSize: 20,
    color: 'white',
    fontWeight: 'bold',
  }

});
