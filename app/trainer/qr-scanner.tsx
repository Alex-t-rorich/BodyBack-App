import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { router } from 'expo-router';
import { qrCodeService, ScanQRCodeResponse } from '@/services/qrCode';

export default function QRScanner() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [isValidating, setIsValidating] = useState(false);

  useEffect(() => {
    // Request camera permission on mount
    if (!permission?.granted) {
      requestPermission();
    }
  }, []);

  const handleBarCodeScanned = async ({ data }: { type: string; data: string }) => {
    if (scanned || isValidating) return;

    setScanned(true);
    setIsValidating(true);

    try {
      // Validate the QR code with the backend
      const result: ScanQRCodeResponse = await qrCodeService.scanQRCode(data);

      if (result.valid) {
        Alert.alert(
          'QR Code Scanned',
          `Customer: ${result.user_name}\n\n${result.message}`,
          [
            {
              text: 'Scan Another',
              onPress: () => {
                setScanned(false);
                setIsValidating(false);
              },
            },
            {
              text: 'Done',
              onPress: () => router.back(),
            },
          ]
        );
      } else {
        Alert.alert(
          'Invalid QR Code',
          result.message || 'This QR code is not valid',
          [
            {
              text: 'Try Again',
              onPress: () => {
                setScanned(false);
                setIsValidating(false);
              },
            },
            {
              text: 'Cancel',
              onPress: () => router.back(),
            },
          ]
        );
      }
    } catch (error: any) {
      console.error('Error validating QR code:', error);
      Alert.alert(
        'Error',
        error.response?.data?.detail || 'Failed to validate QR code',
        [
          {
            text: 'Try Again',
            onPress: () => {
              setScanned(false);
              setIsValidating(false);
            },
          },
          {
            text: 'Cancel',
            onPress: () => router.back(),
          },
        ]
      );
    }
  };

  if (!permission) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#2196F3" />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <View style={styles.permissionContainer}>
          <Text style={styles.permissionTitle}>Camera Permission Required</Text>
          <Text style={styles.permissionText}>
            This app needs camera access to scan QR codes
          </Text>
          <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
            <Text style={styles.permissionButtonText}>Grant Permission</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={styles.camera}
        barcodeScannerSettings={{
          barcodeTypes: ['qr'],
        }}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
      >
        <View style={styles.overlay}>
          <View style={styles.header}>
            <TouchableOpacity style={styles.closeButton} onPress={() => router.back()}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
            <Text style={styles.title}>Scan Customer QR Code</Text>
          </View>

          <View style={styles.scanArea}>
            <View style={styles.scanFrame}>
              <View style={[styles.corner, styles.topLeft]} />
              <View style={[styles.corner, styles.topRight]} />
              <View style={[styles.corner, styles.bottomLeft]} />
              <View style={[styles.corner, styles.bottomRight]} />
            </View>
          </View>

          <View style={styles.instructionContainer}>
            {isValidating ? (
              <>
                <ActivityIndicator size="large" color="white" />
                <Text style={styles.instructionText}>Validating QR code...</Text>
              </>
            ) : (
              <Text style={styles.instructionText}>
                {scanned
                  ? 'Processing...'
                  : 'Position the QR code within the frame'}
              </Text>
            )}
          </View>
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingTop: 50,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  closeButtonText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  scanArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanFrame: {
    width: 250,
    height: 250,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderColor: '#2196F3',
  },
  topLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 4,
    borderLeftWidth: 4,
  },
  topRight: {
    top: 0,
    right: 0,
    borderTopWidth: 4,
    borderRightWidth: 4,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 4,
    borderRightWidth: 4,
  },
  instructionContainer: {
    padding: 30,
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  instructionText: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 10,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    backgroundColor: '#f5f5f5',
  },
  permissionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    textAlign: 'center',
  },
  permissionText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
  },
  permissionButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 8,
    marginBottom: 15,
  },
  permissionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  backButton: {
    padding: 15,
  },
  backButtonText: {
    color: '#2196F3',
    fontSize: 16,
  },
});
