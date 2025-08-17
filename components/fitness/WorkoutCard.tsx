import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Card from '../ui/Card';

interface WorkoutCardProps {
  title: string;
  duration?: string;
  exercises?: number;
  lastPerformed?: string;
  difficulty?: 'Beginner' | 'Intermediate' | 'Advanced';
  onPress?: () => void;
  onFavorite?: () => void;
  isFavorite?: boolean;
}

export default function WorkoutCard({
  title,
  duration,
  exercises,
  lastPerformed,
  difficulty,
  onPress,
  onFavorite,
  isFavorite = false,
}: WorkoutCardProps) {
  const getDifficultyColor = () => {
    switch (difficulty) {
      case 'Beginner':
        return '#34C759';
      case 'Intermediate':
        return '#FF9500';
      case 'Advanced':
        return '#FF3B30';
      default:
        return '#8E8E93';
    }
  };

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <Card style={styles.card}>
        <View style={styles.header}>
          <Text style={styles.title}>{title}</Text>
          <TouchableOpacity onPress={onFavorite}>
            <Ionicons 
              name={isFavorite ? 'heart' : 'heart-outline'} 
              size={24} 
              color={isFavorite ? '#FF3B30' : '#8E8E93'} 
            />
          </TouchableOpacity>
        </View>
        
        <View style={styles.details}>
          {duration && (
            <View style={styles.detail}>
              <Ionicons name="time-outline" size={16} color="#8E8E93" />
              <Text style={styles.detailText}>{duration}</Text>
            </View>
          )}
          
          {exercises && (
            <View style={styles.detail}>
              <Ionicons name="fitness-outline" size={16} color="#8E8E93" />
              <Text style={styles.detailText}>{exercises} exercises</Text>
            </View>
          )}
        </View>
        
        <View style={styles.footer}>
          {difficulty && (
            <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor() + '20' }]}>
              <Text style={[styles.difficultyText, { color: getDifficultyColor() }]}>
                {difficulty}
              </Text>
            </View>
          )}
          
          {lastPerformed && (
            <Text style={styles.lastPerformed}>Last: {lastPerformed}</Text>
          )}
        </View>
      </Card>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1C1C1E',
    flex: 1,
  },
  details: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  detail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailText: {
    fontSize: 14,
    color: '#8E8E93',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  difficultyText: {
    fontSize: 12,
    fontWeight: '600',
  },
  lastPerformed: {
    fontSize: 12,
    color: '#8E8E93',
  },
});
