import { Colors, Typography, responsiveSize } from '@/constants';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import {
    Dimensions,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

const { width } = Dimensions.get('window');

// Mock subscription data - same as in the offers component
const subscriptionData = {
  'premium-monthly': {
    id: 'premium-monthly',
    title: 'Premium Monthly',
    subtitle: 'Full access to all features',
    originalPrice: '$29.99',
    discountPrice: '$19.99',
    discount: '30%',
    duration: 'per month',
    bgColor: Colors.gradients.primary,
    features: [
      'Unlimited workout access',
      'Personal trainer consultations',
      'Custom nutrition plans',
      'Progress tracking & analytics',
      'Community access',
      'Video tutorials',
      'Equipment recommendations',
      'Meal planning tools',
    ],
    benefits: [
      'Cancel anytime',
      'Instant access',
      '24/7 support',
      'Regular updates',
    ],
    description: 'Get full access to our premium features with unlimited workouts, personal trainer support, and comprehensive nutrition guidance.',
  },
  'premium-yearly': {
    id: 'premium-yearly',
    title: 'Premium Yearly',
    subtitle: 'Best value - Save 50%',
    originalPrice: '$359.88',
    discountPrice: '$179.99',
    discount: '50%',
    duration: 'per year',
    bgColor: Colors.gradients.sunset,
    features: [
      'Everything in Monthly plan',
      '2 months completely FREE',
      'Priority customer support',
      'Exclusive premium content',
      'Advanced analytics',
      'Personal coaching sessions',
      'Nutrition consultation',
      'Workout plan customization',
      'Progress milestones tracking',
      'Achievement badges',
    ],
    benefits: [
      'Best value for money',
      'Priority support',
      'Exclusive content',
      'Advanced features',
    ],
    description: 'Our most popular plan! Get the best value with 2 months free, priority support, and exclusive content only available to yearly subscribers.',
  },
  'basic-monthly': {
    id: 'basic-monthly',
    title: 'Basic Monthly',
    subtitle: 'Essential fitness features',
    originalPrice: '$14.99',
    discountPrice: '$9.99',
    discount: '30%',
    duration: 'per month',
    bgColor: Colors.gradients.dark,
    features: [
      'Basic workout library',
      'Progress tracking',
      'Community access',
      'Basic nutrition tips',
      'Weekly challenges',
      'Basic analytics',
    ],
    benefits: [
      'Affordable pricing',
      'Essential features',
      'No commitment',
      'Perfect for beginners',
    ],
    description: 'Perfect for beginners! Get access to essential fitness features and start your journey with our basic plan.',
  },
};

export default function SubscriptionDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const subscription = subscriptionData[id as keyof typeof subscriptionData];

  if (!subscription) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Subscription not found</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const handleSubscribe = () => {
    // Handle subscription logic here
    console.log('Subscribe to:', subscription.id);
    // You can integrate with payment processing here
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backIconButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={Colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Subscription Details</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Hero Section */}
        <View style={[styles.heroSection, { backgroundColor: subscription.bgColor[0] }]}>
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>{subscription.discount}</Text>
            <Text style={styles.discountLabel}>OFF</Text>
          </View>
          
          <Text style={styles.planTitle}>{subscription.title}</Text>
          <Text style={styles.planSubtitle}>{subscription.subtitle}</Text>
          
          <View style={styles.priceContainer}>
            <Text style={styles.originalPrice}>{subscription.originalPrice}</Text>
            <Text style={styles.discountPrice}>{subscription.discountPrice}</Text>
            <Text style={styles.duration}>{subscription.duration}</Text>
          </View>
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About This Plan</Text>
          <Text style={styles.description}>{subscription.description}</Text>
        </View>

        {/* Features */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>What's Included</Text>
          {subscription.features.map((feature, index) => (
            <View key={index} style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={20} color={Colors.success[500]} />
              <Text style={styles.featureText}>{feature}</Text>
            </View>
          ))}
        </View>

        {/* Benefits */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Key Benefits</Text>
          {subscription.benefits.map((benefit, index) => (
            <View key={index} style={styles.benefitItem}>
              <Ionicons name="star" size={16} color={Colors.primary[500]} />
              <Text style={styles.benefitText}>{benefit}</Text>
            </View>
          ))}
        </View>

        {/* CTA Section */}
        <View style={styles.ctaSection}>
          <TouchableOpacity style={styles.subscribeButton} onPress={handleSubscribe}>
            <Text style={styles.subscribeButtonText}>
              Subscribe Now - {subscription.discountPrice}
            </Text>
          </TouchableOpacity>
          
          <Text style={styles.disclaimer}>
            Cancel anytime. No hidden fees. 30-day money-back guarantee.
          </Text>
        </View>
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
    paddingHorizontal: responsiveSize(20),
    paddingVertical: responsiveSize(15),
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
  },
  backIconButton: {
    padding: responsiveSize(5),
  },
  headerTitle: {
    ...Typography.headingMedium,
    color: Colors.text.primary,
  },
  placeholder: {
    width: responsiveSize(34),
  },
  scrollView: {
    flex: 1,
  },
  heroSection: {
    padding: responsiveSize(30),
    alignItems: 'center',
    position: 'relative',
  },
  discountBadge: {
    position: 'absolute',
    top: responsiveSize(20),
    right: responsiveSize(20),
    backgroundColor: Colors.error[500],
    paddingHorizontal: responsiveSize(15),
    paddingVertical: responsiveSize(8),
    borderRadius: responsiveSize(25),
    alignItems: 'center',
  },
  discountText: {
    ...Typography.labelLarge,
    color: Colors.text.inverse,
    fontWeight: 'bold',
  },
  discountLabel: {
    ...Typography.caption,
    color: Colors.text.inverse,
    fontSize: responsiveSize(10),
  },
  planTitle: {
    ...Typography.displayMedium,
    color: Colors.text.inverse,
    textAlign: 'center',
    marginBottom: responsiveSize(10),
  },
  planSubtitle: {
    ...Typography.bodyMedium,
    color: Colors.text.inverse,
    textAlign: 'center',
    opacity: 0.9,
    marginBottom: responsiveSize(20),
  },
  priceContainer: {
    alignItems: 'center',
  },
  originalPrice: {
    ...Typography.bodyMedium,
    color: Colors.text.inverse,
    textDecorationLine: 'line-through',
    opacity: 0.7,
  },
  discountPrice: {
    ...Typography.displayLarge,
    color: Colors.text.inverse,
    fontWeight: 'bold',
    marginVertical: responsiveSize(5),
  },
  duration: {
    ...Typography.bodySmall,
    color: Colors.text.inverse,
    opacity: 0.8,
  },
  section: {
    padding: responsiveSize(20),
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
  },
  sectionTitle: {
    ...Typography.headingSmall,
    color: Colors.text.primary,
    marginBottom: responsiveSize(15),
  },
  description: {
    ...Typography.bodyMedium,
    color: Colors.text.secondary,
    lineHeight: responsiveSize(22),
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: responsiveSize(12),
  },
  featureText: {
    ...Typography.bodyMedium,
    color: Colors.text.primary,
    marginLeft: responsiveSize(12),
    flex: 1,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: responsiveSize(8),
  },
  benefitText: {
    ...Typography.bodySmall,
    color: Colors.text.secondary,
    marginLeft: responsiveSize(8),
    flex: 1,
  },
  ctaSection: {
    padding: responsiveSize(20),
    paddingBottom: responsiveSize(40),
  },
  subscribeButton: {
    backgroundColor: Colors.primary[500],
    borderRadius: responsiveSize(15),
    paddingVertical: responsiveSize(18),
    paddingHorizontal: responsiveSize(30),
    alignItems: 'center',
    marginBottom: responsiveSize(15),
    shadowColor: Colors.shadow.dark,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  subscribeButtonText: {
    ...Typography.buttonLarge,
    color: Colors.text.primary,
  },
  disclaimer: {
    ...Typography.caption,
    color: Colors.text.secondary,
    textAlign: 'center',
    lineHeight: responsiveSize(16),
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: responsiveSize(20),
  },
  errorText: {
    ...Typography.headingMedium,
    color: Colors.text.primary,
    marginBottom: responsiveSize(20),
  },
  backButton: {
    backgroundColor: Colors.primary[500],
    paddingHorizontal: responsiveSize(20),
    paddingVertical: responsiveSize(10),
    borderRadius: responsiveSize(10),
  },
  backButtonText: {
    ...Typography.buttonMedium,
    color: Colors.text.primary,
  },
});
