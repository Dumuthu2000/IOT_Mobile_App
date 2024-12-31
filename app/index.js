import React, { useState } from 'react';
import { StyleSheet, View, Button, Alert, Text, ActivityIndicator } from 'react-native';
import axios from 'axios';

export default function App() {
  const [isLoading, setIsLoading] = useState(false);
  const [deviceStatus, setDeviceStatus] = useState('unknown');
  
  // It's better to store this in a config file or environment variable
  const NODEMCU_IP = "192.168.174.205"; // Replace with your NodeMCU's IP address
  const TIMEOUT = 5000; // 5 seconds timeout

  // Configure axios instance with timeout
  const axiosInstance = axios.create({
    timeout: TIMEOUT,
    headers: {
      'Content-Type': 'application/json',
    }
  });

  const controlDevice = async (action) => {
    setIsLoading(true);
    try {
      const response = await axiosInstance.get(`http://${NODEMCU_IP}/${action}`);
      
      if (response.status === 200) {
        setDeviceStatus(action === 'on' ? 'on' : 'off');
        Alert.alert(
          "Success", 
          `D4 turned ${action.toUpperCase()}`
        );
      } else {
        throw new Error(`Unexpected response: ${response.status}`);
      }
    } catch (error) {
      let errorMessage = "Failed to communicate with the device";
      
      if (error.code === 'ECONNABORTED') {
        errorMessage = "Connection timeout - Please check if the device is powered on";
      } else if (error.response) {
        errorMessage = `Server error: ${error.response.status}`;
      } else if (error.code === 'ERR_NETWORK') {
        errorMessage = "Network error - Please check your connection and device IP";
      }
      
      Alert.alert("Error", errorMessage);
      console.error('Device control error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.status}>
        Status: {deviceStatus.toUpperCase()}
      </Text>
      
      <View style={styles.buttonContainer}>
        <Button 
          title="Turn ON" 
          onPress={() => controlDevice('on')}
          disabled={isLoading}
        />
        <View style={styles.spacer} />
        <Button 
          title="Turn OFF" 
          onPress={() => controlDevice('off')}
          disabled={isLoading}
        />
      </View>
      
      {isLoading && (
        <ActivityIndicator 
          style={styles.loader} 
          size="large" 
          color="#0000ff" 
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  buttonContainer: {
    width: '100%',
    maxWidth: 200,
    marginVertical: 20,
  },
  spacer: {
    height: 20,
  },
  status: {
    fontSize: 18,
    marginBottom: 20,
    fontWeight: 'bold',
  },
  loader: {
    marginTop: 20,
  }
});