import { StyleSheet, Text, View } from "react-native";

export default function PRsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Personal Records</Text>
      <Text style={styles.subtitle}>Track your best lifts and achievements</Text>
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
  },
});
