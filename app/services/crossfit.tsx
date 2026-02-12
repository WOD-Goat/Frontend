import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Card from '../../components/ui/Card';
import { Colors } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';

export default function CrossfitService() {
  const router = useRouter();

  const benefits = [
    'High-intensity functional movements',
    'Improved cardiovascular endurance',
    'Increased strength and power',
    'Community-driven workouts',
    'Scalable for all fitness levels'
  ];

  const programs = [
    {
      title: 'CrossFit Fundamentals',
      duration: '4 weeks',
      description: 'Learn the basics of CrossFit movements and techniques'
    },
    {
      title: 'CrossFit Performance',
      duration: 'Ongoing',
      description: 'Advanced training for competitive athletes'
    },
    {
      title: 'CrossFit Open Prep',
      duration: '12 weeks',
      description: 'Specialized training for CrossFit Open competition'
    }
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>CrossFit</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.heroSection}>
          <View style={styles.iconContainer}>
            <Text style={styles.heroIcon}>🏋️</Text>
          </View>
          <Text style={styles.heroTitle}>CrossFit Training</Text>
          <Text style={styles.heroDescription}>
            Experience the ultimate fitness challenge with our comprehensive CrossFit program. 
            Build strength, endurance, and mental toughness through varied functional movements.
          </Text>
        </View>

        <Card variant="elevated" padding="large" style={styles.section}>
          <Text style={styles.sectionTitle}>What is CrossFit?</Text>
          <Text style={styles.sectionDescription}>
            CrossFit is a high-intensity fitness program that combines elements of weightlifting, 
            gymnastics, and cardiovascular training. Our workouts are constantly varied, 
            functional movements performed at high intensity to deliver maximum results.
          </Text>
        </Card>

        <Card variant="elevated" padding="large" style={styles.section}>
          <Text style={styles.sectionTitle}>Benefits</Text>
          {benefits.map((benefit, index) => (
            <View key={index} style={styles.benefitItem}>
              <View style={styles.bulletPoint} />
              <Text style={styles.benefitText}>{benefit}</Text>
            </View>
          ))}
        </Card>

        <Card variant="elevated" padding="large" style={styles.section}>
          <Text style={styles.sectionTitle}>Our Programs</Text>
          {programs.map((program, index) => (
            <View key={index} style={styles.programItem}>
              <Text style={styles.programTitle}>{program.title}</Text>
              <Text style={styles.programDuration}>{program.duration}</Text>
              <Text style={styles.programDescription}>{program.description}</Text>
            </View>
          ))}
        </Card>

        <TouchableOpacity style={styles.ctaButton}>
          <Text style={styles.ctaButtonText}>Book a Free Trial</Text>
        </TouchableOpacity>

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    ...Typography.headingMedium,
    color: Colors.text.primary,
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  heroSection: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 32,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primary[500],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  heroIcon: {
    fontSize: 40,
  },
  heroTitle: {
    ...Typography.displayMedium,
    color: Colors.text.primary,
    textAlign: 'center',
    marginBottom: 16,
  },
  heroDescription: {
    ...Typography.bodyMedium,
    color: Colors.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  section: {
    marginHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    ...Typography.headingMedium,
    color: Colors.text.primary,
    marginBottom: 16,
  },
  sectionDescription: {
    ...Typography.bodyMedium,
    color: Colors.text.secondary,
    lineHeight: 24,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  bulletPoint: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.primary[500],
    marginTop: 8,
    marginRight: 12,
  },
  benefitText: {
    ...Typography.bodyMedium,
    color: Colors.text.secondary,
    flex: 1,
    lineHeight: 22,
  },
  programItem: {
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
  },
  programTitle: {
    ...Typography.headingSmall,
    color: Colors.text.primary,
    marginBottom: 4,
  },
  programDuration: {
    ...Typography.labelMedium,
    color: Colors.primary[500],
    marginBottom: 8,
  },
  programDescription: {
    ...Typography.bodySmall,
    color: Colors.text.secondary,
    lineHeight: 20,
  },
  ctaButton: {
    backgroundColor: Colors.primary[500],
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    marginHorizontal: 20,
    marginTop: 16,
    alignItems: 'center',
  },
  ctaButtonText: {
    ...Typography.buttonMedium,
    color: Colors.text.primary,
  },
  bottomSpacing: {
    height: 40,
  },
});
