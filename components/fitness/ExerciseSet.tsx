import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Card from '../ui/Card';

interface ExerciseSetProps {
  exerciseName: string;
  sets: {
    reps?: number;
    weight?: number;
    duration?: string;
    completed?: boolean;
  }[];
  onSetToggle?: (setIndex: number) => void;
  onAddSet?: () => void;
  showAddButton?: boolean;
}

export default function ExerciseSet({
  exerciseName,
  sets,
  onSetToggle,
  onAddSet,
  showAddButton = true,
}: ExerciseSetProps) {
  return (
    <Card style={styles.card}>
      <Text style={styles.exerciseName}>{exerciseName}</Text>
      
      <View style={styles.setsContainer}>
        {sets.map((set, index) => (
          <TouchableOpacity 
            key={index}
            style={[
              styles.setRow,
              set.completed && styles.completedSet
            ]}
            onPress={() => onSetToggle?.(index)}
          >
            <View style={styles.setInfo}>
              <Text style={styles.setNumber}>Set {index + 1}</Text>
              <View style={styles.setDetails}>
                {set.reps && (
                  <Text style={styles.setDetail}>{set.reps} reps</Text>
                )}
                {set.weight && (
                  <Text style={styles.setDetail}>{set.weight} lbs</Text>
                )}
                {set.duration && (
                  <Text style={styles.setDetail}>{set.duration}</Text>
                )}
              </View>
            </View>
            
            <View style={[
              styles.checkbox,
              set.completed && styles.checkedBox
            ]}>
              {set.completed && (
                <Ionicons name="checkmark" size={16} color="#FFFFFF" />
              )}
            </View>
          </TouchableOpacity>
        ))}
      </View>
      
      {showAddButton && (
        <TouchableOpacity style={styles.addSetButton} onPress={onAddSet}>
          <Ionicons name="add-circle-outline" size={20} color="#007AFF" />
          <Text style={styles.addSetText}>Add Set</Text>
        </TouchableOpacity>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
  },
  exerciseName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1C1C1E',
    marginBottom: 12,
  },
  setsContainer: {
    gap: 8,
    marginBottom: 12,
  },
  setRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#F2F2F7',
    borderRadius: 8,
  },
  completedSet: {
    backgroundColor: '#34C759' + '20',
  },
  setInfo: {
    flex: 1,
  },
  setNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 2,
  },
  setDetails: {
    flexDirection: 'row',
    gap: 8,
  },
  setDetail: {
    fontSize: 12,
    color: '#8E8E93',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E5EA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkedBox: {
    backgroundColor: '#34C759',
    borderColor: '#34C759',
  },
  addSetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    gap: 8,
  },
  addSetText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
});
