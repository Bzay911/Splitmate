import { Ionicons } from '@expo/vector-icons';
import { CameraType, CameraView, useCameraPermissions } from 'expo-camera';
import React, { useEffect, useRef, useState } from 'react';
import { Button, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function CameraScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [facing] = useState<CameraType>('back');
  const ref = useRef<CameraView>(null);
  const [uri, setUri] = useState<string | null>(null);

  useEffect(() => {
    requestPermission();
  }, []);

  // Handle permission logic
  if (!permission) {
    return (
      <View style={styles.container}>
        <Text>Requesting permission...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>We need camera permission</Text>
        <Button onPress={requestPermission} title="Grant permission" />
      </View>
    );
  }

  const captureAndUpload = async () => {
    const photo = await ref.current?.takePictureAsync();
    if (photo) {
      setUri(photo.uri);
    }
  }

  const renderPicture = () => {
    return (
      <View style={styles.pictureContainer}>
        {uri && (
          <>
            <Image
              source={{ uri }}
              resizeMode="contain"
              style={styles.image}
            />
            <View style={styles.pictureControls}>
              <TouchableOpacity 
                style={styles.retakeButton} 
                onPress={retakePhoto}
              >
                <Ionicons name="refresh" size={24} color="white" />
                <Text style={styles.buttonText}>Retake</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>
    );
  };

  const renderCamera = () => {
    return (
      <View style={styles.cameraContainer}>
        <CameraView 
          facing={facing} 
          ref={ref}
          style={styles.camera}
        />
        <TouchableOpacity 
          style={styles.buttonContainer} 
          onPress={captureAndUpload}
        >
          <Ionicons name="camera" size={34} color="white" />
        </TouchableOpacity>
      </View>
    );
  };

  const retakePhoto = () => {
    setUri("");
    ref.current?.resumePreview();
  }

  return (
    <View style={styles.container}>
      {uri ? renderPicture() : renderCamera()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  cameraContainer: {
    flex: 1,
    width: '100%',
    position: 'relative',
  },
  camera: {
    flex: 1,
    width: '100%',
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 40,
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
  },
  text: {
    color: 'white',
    textAlign: 'center',
    marginTop: 20,
  },
  pictureContainer: {
    flex: 1,
    width: '100%',
    alignItems: "center",
    justifyContent: "center",
  },
  image: {
    width: '100%',
    height: '100%',
    aspectRatio: 1,
    resizeMode: 'contain',
  },
  pictureControls: {
    position: 'absolute',
    top: 10,
    // left: 0,
    right: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  retakeButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    marginLeft: 5,
  },
});
