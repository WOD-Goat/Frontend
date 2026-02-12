import { apiClient } from "@/api/client";
import { useAuth } from "@/hooks/useAuth";
import { router } from "expo-router";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function ProfileScreen() {
  const { logout, loading } = useAuth();

  const handleLogout = async () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Logout",
          style: "destructive",
          onPress: async () => {
            try {
              await logout();
              router.replace("/auth/login");
            } catch (error) {
              console.error("Logout error:", error);
              Alert.alert("Error", "Failed to logout. Please try again.");
            }
          }
        }
      ]
    );
  };

  const testProfileEndpoint = async () => {
    console.log('🧪 Testing /api/users/profile endpoint');
    
    // Log current token status before making the request
    const hasAccessToken = !!apiClient.getAccessToken();
    const hasRefreshToken = !!apiClient.getRefreshToken();
    console.log('🧪 Before request - Access token exists:', hasAccessToken);
    console.log('🧪 Before request - Refresh token exists:', hasRefreshToken);
    
    try {
      const response = await apiClient.get('/api/users/profile');
      console.log('🧪 Profile endpoint response:', response);
      Alert.alert(
        "Test Success", 
        `Profile data received!\nCheck console for details.`,
        [{ text: "OK" }]
      );
    } catch (error) {
      console.error('🧪 Profile endpoint error:', error);
      
      // Log token status after error
      const hasAccessTokenAfter = !!apiClient.getAccessToken();
      const hasRefreshTokenAfter = !!apiClient.getRefreshToken();
      console.log('🧪 After error - Access token exists:', hasAccessTokenAfter);
      console.log('🧪 After error - Refresh token exists:', hasRefreshTokenAfter);
      
      Alert.alert(
        "Test Result", 
        `Error: ${error instanceof Error ? error.message : 'Unknown error'}\nTokens cleared: ${!hasAccessTokenAfter && !hasRefreshTokenAfter}\nCheck console for details.`,
        [{ text: "OK" }]
      );
    }
  };

  const clearAndTestExpiredTokens = async () => {
    console.log('🧪 Simulating expired tokens scenario');
    
    // Set obviously expired/invalid tokens to simulate the real scenario
    await apiClient.setTokens('expired-access-token', 'expired-refresh-token');
    console.log('🧪 Set expired tokens');
    
    // Now try the profile endpoint - should trigger refresh, fail, and clear tokens
    try {
      const response = await apiClient.get('/api/users/profile');
      console.log('🧪 Unexpected success:', response);
    } catch (error) {
      console.error('🧪 Expected error:', error);
      
      // Check if tokens were cleared
      const hasAccessToken = !!apiClient.getAccessToken();
      const hasRefreshToken = !!apiClient.getRefreshToken();
      console.log('🧪 After expired token test - Access token exists:', hasAccessToken);
      console.log('🧪 After expired token test - Refresh token exists:', hasRefreshToken);
      
      Alert.alert(
        "Expired Token Test", 
        `Tokens cleared: ${!hasAccessToken && !hasRefreshToken}\nShould redirect to login now.`,
        [{ text: "OK" }]
      );
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile</Text>
      <Text style={styles.subtitle}>Your fitness profile and settings</Text>
      
      <TouchableOpacity 
        style={styles.testButton} 
        onPress={testProfileEndpoint}
        disabled={loading}
      >
        <Text style={styles.testButtonText}>
          Test Profile API (Token Renewal)
        </Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={[styles.testButton, {backgroundColor: '#ff8c00'}]} 
        onPress={clearAndTestExpiredTokens}
        disabled={loading}
      >
        <Text style={styles.testButtonText}>
          Test Expired Token Flow
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.logoutButton} 
        onPress={handleLogout}
        disabled={loading}
      >
        <Text style={styles.logoutButtonText}>
          {loading ? "Logging out..." : "Logout"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 40,
  },
  testButton: {
    backgroundColor: '#007bff',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginBottom: 10,
  },
  testButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  logoutButton: {
    backgroundColor: '#ff4444',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 10,
  },
  logoutButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
