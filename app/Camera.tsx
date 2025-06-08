import { CameraType, CameraView, useCameraPermissions } from 'expo-camera';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Animated, Button, Dimensions, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { auth } from "../src/firebaseConfig";

export default function CameraScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [facing] = useState<CameraType>('back');
  const ref = useRef<CameraView>(null);
  const [uri, setUri] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [isPreview, setIsPreview] = useState(false);
  const scanAnim = useRef(new Animated.Value(0)).current;
  const [isUploading, setIsUploading] = useState(false);
  const [receiptData, setReceiptData] = useState(null);
  
  // Get screen dimensions
  const screenHeight = Dimensions.get('window').height;
  const frameHeight = 700; // Match your frame height

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
    if (ref.current) {
      try {
        // Take the picture
        const captured = await ref.current.takePictureAsync();
        setUri(captured.uri);
        setIsPreview(true);
        setIsScanning(false);
        scanAnim.stopAnimation();

        // console.log("captured: ", uri);
        
        // Create form data with the image
        const formData = new FormData();
        formData.append('receipt', {
          uri: captured.uri,
          type: 'image/jpeg',
          name: 'receipt.jpg',
        });
        
        // Set uploading state
        setIsUploading(true);
        
        const user = auth.currentUser;
        if(!user){
          Alert.alert("Error", "Please login to upload a receipt");
          return;
        }
        const token = await user.getIdToken();

        // Replace with your actual API endpoint
        const response = await fetch('http://192.168.1.12:3000/api/auth/upload-receipt', {
          method: 'POST',
          body: formData,
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}` // Uncomment if using auth
          },
        });
        
        if (!response.ok) {
          throw new Error(`Server error: ${response.status}`);
        }
        
        const result = await response.json();
        
        if (result.success) {
          console.log('Receipt data:', result.data);
          setReceiptData(result.data);
          Alert.alert('Success', 'Receipt scanned successfully!');
        } else {
          throw new Error(result.error || 'Failed to process receipt');
        }
        
      } catch (error) {
        console.error('Error capturing/uploading receipt:', error);
        Alert.alert('Error', 'Failed to process receipt. Please try again.');
      } finally {
        setIsUploading(false);
      }
    }
  }

  const startScanAnimation = () => {
    setIsScanning(true);
    scanAnim.setValue(0);
    Animated.loop(
      Animated.sequence([
        Animated.timing(scanAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(scanAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Simulate scan delay, then take picture
    setTimeout(() => {
      captureAndUpload();
    }, 2000);
  };

  const scanTranslateY = scanAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [
      (screenHeight / 2) - (frameHeight / 2), 
      (screenHeight / 2) + (frameHeight / 2) - 2 
    ],
  });

  const retakePhoto = () => {
    setUri("");
    setIsPreview(false);
    ref.current?.resumePreview();
  }

  const ScannerFrame = () => {
    return (
      <View style={styles.scannerFrameContainer} pointerEvents='none'>
        <View style={styles.scannerFrame}>
          {/* Top-left corner */}
          <View style={[styles.corner, styles.cornerTopLeft]}>
            <View style={styles.cornerHorizontal} />
            <View style={styles.cornerVertical} />
          </View>

          {/* Top-right corner */}
          <View style={[styles.corner, styles.cornerTopRight]}>
            <View style={styles.cornerHorizontal} />
            <View style={styles.cornerVertical} />
          </View>

          {/* Bottom-left corner */}
          <View style={[styles.corner, styles.cornerBottomLeft]}>
            <View style={styles.cornerHorizontal} />
            <View style={styles.cornerVertical} />
          </View>

          {/* Bottom-right corner */}
          <View style={[styles.corner, styles.cornerBottomRight]}>
            <View style={styles.cornerHorizontal} />
            <View style={styles.cornerVertical} />
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {isPreview && uri ? (
        <>
          <Image source={{ uri: uri }} style={styles.preview} />
          
          {receiptData ? (
            <View style={styles.receiptDataContainer}>
              <Text style={styles.receiptTitle}>Receipt Details</Text>
              <Text style={styles.receiptText}>Merchant: {receiptData.merchant}</Text>
              <Text style={styles.receiptText}>Date: {receiptData.date}</Text>
              <Text style={styles.receiptText}>Total: ${receiptData.total.toFixed(2)}</Text>
              
              {receiptData.items && (
                <>
                  <Text style={styles.receiptSubtitle}>Items:</Text>
                  {receiptData.items.map((item, index) => (
                    <Text key={index} style={styles.receiptItemText}>
                      {item.name}: ${item.price.toFixed(2)}
                    </Text>
                  ))}
                </>
              )}
            </View>
          ) : (
            <View style={styles.buttonRow}>
              <TouchableOpacity onPress={retakePhoto} style={styles.retakeButton}>
                <Text>Retake</Text>
              </TouchableOpacity>
              {isUploading ? (
                <View style={[styles.useButton, styles.disabledButton]}>
                  <ActivityIndicator color="#fff" size="small" />
                </View>
              ) : (
                <TouchableOpacity style={styles.useButton} disabled={true}>
                  <Text style={styles.buttonText}>Processing...</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </>
      ) : (
        <View style={styles.cameraWrapper}>
          <CameraView 
            ref={ref} 
            style={styles.camera} 
            facing={facing} 
          />
          
          <ScannerFrame />
          
          {isScanning && (
            <Animated.View
              style={[styles.scanLine, { transform: [{ translateY: scanTranslateY }] }]}
            />
          )}
          
          {!isScanning && (
            <TouchableOpacity
              style={styles.captureButton}
              onLongPress={startScanAnimation}
              delayLongPress={500}
            >
              <Text style={styles.captureText}>Hold to Scan</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
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
  cameraWrapper: { 
    flex: 1,
    width: '100%',
    position: 'relative',
  },
  camera: { 
    flex: 1,
    width: '100%',
  },
  captureButton: {
    position: "absolute",
    bottom: 40,
    alignSelf: "center",
    backgroundColor: "#4caf50",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 10,
  },
  captureText: { 
    fontSize: 16, 
    fontWeight: "bold",
    color: "#fff"
  },
  scanLine: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: "lime",
    zIndex: 10,
  },
  preview: { 
    flex: 1,
    width: '100%'
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    padding: 20,
    backgroundColor: "#000",
    width: '100%'
  },
  retakeButton: {
    backgroundColor: "#eee",
    padding: 15,
    borderRadius: 8,
  },
  useButton: {
    backgroundColor: "#4caf50",
    padding: 15,
    borderRadius: 8,
  },
  text: {
    color: 'black',
    textAlign: 'center',
    marginTop: 20,
  },
  scannerFrameContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 5,
  },
  scannerFrame: {
    width: 400,
    height: 700,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 20,
    height: 20,
  },
  cornerTopLeft: {
    top: 0,
    left: 0,
  },
  cornerTopRight: {
    top: 0,
    right: 0,
    transform: [{ scaleX: -1 }],
  },
  cornerBottomLeft: {
    bottom: 0,
    left: 0,
    transform: [{ scaleY: -1 }],
  },
  cornerBottomRight: {
    bottom: 0,
    right: 0,
    transform: [{ scale: -1 }],
  },
  cornerHorizontal: {
    position: 'absolute',
    width: 20,
    height: 2,
    backgroundColor: '#fff',
  },
  cornerVertical: {
    position: 'absolute',
    width: 2,
    height: 20,
    backgroundColor: '#fff',
  },
  receiptDataContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  receiptTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  receiptText: {
    fontSize: 16,
    marginBottom: 5,
  },
  receiptSubtitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  receiptItemText: {
    fontSize: 16,
    marginBottom: 2,
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
});
