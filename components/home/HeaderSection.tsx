import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

interface HeaderSectionProps {
  userName: string;
}

export default function HeaderSection({ userName }: HeaderSectionProps) {
  return (
    <View style={styles.container}>
      <View style={styles.greetingSection}>
        <Text style={styles.greeting}>Hi, {userName} 👋</Text>
        <Text style={styles.subtitle}>It's time to challenge your limits.</Text>
      </View>
      <View style={styles.notificationIcon}>
        <Ionicons name="notifications-outline" size={24} color="#000000" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
  },
  greetingSection: {
    flex: 1,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
  },
  notificationIcon: {
    marginTop: 2,
  },
});
