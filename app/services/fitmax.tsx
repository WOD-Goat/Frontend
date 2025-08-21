import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Card from '../../components/ui/Card';
import { Colors } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';

export default function FitmaxService() {
  const router = useRouter();

  const benefits = [
    'Personalized nutrition planning',
    'Sustainable lifestyle changes',
    'Weight management support',
    'Energy optimization',
    'Holistic wellness approach'
  ];

  const programs = [
    {
      title: 'Nutrition Coaching',
      duration: '12 weeks',
      description: 'Comprehensive nutrition guidance and meal planning'
    },
    {
      title: 'Wellness Lifestyle',
      duration: 'Ongoing',
      description: 'Holistic approach to health and well-being'
    },
    {
      title: 'Body Composition',
      duration: '8 weeks',
      description: 'Targeted programs for body composition goals'
    }
  ];

  const services = [
    'Personalized meal plans',
    'Nutritional counseling',
    'Supplement guidance',
    'Lifestyle coaching',
    'Progress tracking',
    'Recipe development'
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
        <Text style={styles.headerTitle}>Fitmax</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.heroSection}>
          <View style={styles.iconContainer}>
            <Text style={styles.heroIcon}>🏃</Text>
          </View>
          <Text style={styles.heroTitle}>Fitmax Wellness</Text>
          <Text style={styles.heroDescription}>
            Transform your relationship with nutrition and wellness through our comprehensive 
            Fitmax program. Combining fitness with nutrition science for optimal results.
          </Text>
        </View>

        <Card variant="elevated" padding="large" style={styles.section}>
          <Text style={styles.sectionTitle}>Nutrition & Wellness</Text>
          <Text style={styles.sectionDescription}>
            Our Fitmax program integrates nutrition coaching with fitness training to create 
            sustainable lifestyle changes. We focus on building healthy habits that last, 
            not quick fixes that fade away.
          </Text>
        </Card>

        <Card variant="elevated" padding="large" style={styles.section}>
          <Text style={styles.sectionTitle}>Program Benefits</Text>
          {benefits.map((benefit, index) => (
            <View key={index} style={styles.benefitItem}>
              <View style={styles.bulletPoint} />
              <Text style={styles.benefitText}>{benefit}</Text>
            </View>
          ))}
        </Card>

        <Card variant="elevated" padding="large" style={styles.section}>
          <Text style={styles.sectionTitle}>Our Services</Text>
          {services.map((service, index) => (
            <View key={index} style={styles.benefitItem}>
              <View style={styles.bulletPoint} />
              <Text style={styles.benefitText}>{service}</Text>
            </View>
          ))}
        </Card>

        <Card variant="elevated" padding="large" style={styles.section}>
          <Text style={styles.sectionTitle}>Wellness Programs</Text>
          {programs.map((program, index) => (
            <View key={index} style={styles.programItem}>
              <Text style={styles.programTitle}>{program.title}</Text>
              <Text style={styles.programDuration}>{program.duration}</Text>
              <Text style={styles.programDescription}>{program.description}</Text>
            </View>
          ))}
        </Card>

        <TouchableOpacity style={styles.ctaButton}>
          <Text style={styles.ctaButtonText}>Start Your Transformation</Text>
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
