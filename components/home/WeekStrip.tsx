import { Colors, FontFamilies, responsiveSize } from "@/constants";
import { getDayLetter, isSameDay } from "@/utils";
import { Pressable, StyleSheet, Text, View } from "react-native";

export interface WeekDayCell {
  date: Date;
  status: "completed" | "missed" | "upcoming" | "empty";
  isToday: boolean;
}

interface WeekStripProps {
  days: WeekDayCell[];
  selectedDate: Date;
  onDaySelect: (date: Date) => void;
}

const STATUS_DOT_COLOR: Record<WeekDayCell["status"], string> = {
  completed: Colors.success[500],
  missed:    Colors.error[500],
  upcoming:  Colors.primary[500],
  empty:     Colors.neutral[600],
};

export default function WeekStrip({ days, selectedDate, onDaySelect }: WeekStripProps) {
  return (
    <View style={styles.row}>
      {days.map((cell) => {
        const isSelected = isSameDay(cell.date, selectedDate);
        const label = getDayLetter(cell.date);
        const num = cell.date.getDate();
        const isRest = cell.status === "empty";

        return (
          <Pressable
            key={cell.date.toISOString()}
            onPress={() => onDaySelect(cell.date)}
            style={[
              styles.cell,
              cell.isToday && styles.cellToday,
              !cell.isToday && isSelected && styles.cellSelected,
            ]}
          >
            <Text
              style={[
                styles.dayLetter,
                cell.isToday && styles.textWhite,
                !cell.isToday && isSelected && styles.textOrange,
              ]}
            >
              {label}
            </Text>

            <Text
              style={[
                styles.dayNum,
                cell.isToday && styles.textWhite,
                !cell.isToday && isSelected && styles.textOrange,
              ]}
            >
              {num}
            </Text>

            {isRest ? (
              <Text
                style={[
                  styles.restLabel,
                  cell.isToday && styles.textWhite,
                ]}
              >
                REST
              </Text>
            ) : (
              <View
                style={[
                  styles.dot,
                  { backgroundColor: cell.isToday ? "#fff" : STATUS_DOT_COLOR[cell.status] },
                ]}
              />
            )}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: Colors.secondary[700],
    borderRadius: responsiveSize(20),
    paddingHorizontal: responsiveSize(6),
    paddingVertical: responsiveSize(6),
    borderWidth: 1,
    borderColor: Colors.neutral[700],
    gap: responsiveSize(4),
  },
  cell: {
    flex: 1,
    alignItems: "center",
    paddingVertical: responsiveSize(8),
    paddingHorizontal: responsiveSize(2),
    borderRadius: responsiveSize(14),
    gap: responsiveSize(3),
    borderWidth: 1,
    borderColor: "transparent",
  },
  cellToday: {
    backgroundColor: "#FF6A1A",
  },
  cellSelected: {
    backgroundColor: Colors.primary[500] + "18",
    borderColor: Colors.primary[500],
  },
  dayLetter: {
    fontFamily: FontFamilies.spartanMedium,
    fontSize: responsiveSize(10),
    color: Colors.text.secondary,
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  dayNum: {
    fontFamily: FontFamilies.spartanBold,
    fontSize: responsiveSize(26),
    color: Colors.text.inverse,
    lineHeight: responsiveSize(28),
  },
  dot: {
    width: responsiveSize(6),
    height: responsiveSize(6),
    borderRadius: responsiveSize(3),
  },
  restLabel: {
    fontFamily: FontFamilies.spartanBold,
    fontSize: responsiveSize(8),
    color: Colors.text.secondary,
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
  textWhite: {
    color: "#FFFFFF",
  },
  textOrange: {
    color: Colors.primary[500],
  },
});
