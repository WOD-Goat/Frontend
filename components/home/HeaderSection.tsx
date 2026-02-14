import { Colors, FontFamilies, FontSizes, Typography } from '@/constants';
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
        <Ionicons name="notifications-outline" size={24} color={Colors.text.primary} />
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
  },
  greetingSection: {
    flex: 1,
  },
  greeting: {
    fontFamily: FontFamilies.poppinsBold,
    fontSize: FontSizes.heading2XL,
    color: Colors.text.primary,
    marginBottom: 4,
  },
  subtitle: {
    fontFamily: FontFamilies.spartanMedium,
    fontSize: FontSizes.bodyMD,
    color: Colors.text.primary,
    lineHeight: 20,
  },
  notificationIcon: {
    marginTop: 2,
  },
});
