import { Button, Page } from "@/components";
import { Colors, Typography } from "@/constants";
import { router } from "expo-router";
import { useRef, useState } from "react";
import { Dimensions, FlatList, StyleSheet, Text, View } from "react-native";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");
const ITEM_WIDTH = 25;
const ITEM_HEIGHT = 100;

export default function WeightSelectionScreen() {
  const [selectedWeight, setSelectedWeight] = useState(80);
  const flatListRef = useRef<FlatList>(null);

  // Generate weights from 40 to 150 kg with intermediate marks
  const generateWeightData = () => {
    const data = [];
    for (let i = 40; i <= 150; i++) {
      // Main weight mark
      data.push({ value: i, isMain: true });
      // Add intermediate mark (except for the last item)
      if (i < 150) {
        data.push({ value: i + 0.5, isMain: false });
      }
    }
    return data;
  };

  const weightData = generateWeightData();
  const mainWeights = Array.from({ length: 111 }, (_, i) => i + 40);

  const handleContinue = () => {
    console.log("Selected weight:", selectedWeight);
    router.push("./height");
  };

  const renderWeightItem = ({
    item,
    index,
  }: {
    item: { value: number; isMain: boolean };
    index: number;
  }) => {
    const isSelected = item.isMain && item.value === selectedWeight;
    const isMainMark = item.isMain;

    return (
      <View style={styles.weightItem}>
        <View
          style={[
            styles.rulerMark,
            isMainMark ? styles.mainRulerMark : styles.shortRulerMark,
          ]}
        />
        <View style={styles.weightTextContainer}>
          {isMainMark && (
            <Text
              style={[
                styles.weightText,
                isSelected
                  ? styles.selectedWeightText
                  : styles.unselectedWeightText,
              ]}
            >
              {Math.floor(item.value)}
            </Text>
          )}
        </View>
      </View>
    );
  };

  const onScroll = (event: any) => {
    const contentOffset = event.nativeEvent.contentOffset.x;
    // Add half the picker width to get the center position
    const centerOffset = contentOffset;
    // Calculate which main weight should be selected based on scroll position
    // Since we have pairs (main + intermediate), divide by (ITEM_WIDTH * 2)
    const mainIndex = Math.round(centerOffset / (ITEM_WIDTH * 2));
    const selectedMainWeight = mainWeights[mainIndex];
    if (selectedMainWeight && selectedMainWeight !== selectedWeight) {
      setSelectedWeight(selectedMainWeight);
    }
  };

  return (
    <Page
      title="Weight"
      footer={
        <View>
          <Button
            title="Continue →"
            onPress={handleContinue}
            variant="secondary"
            size="large"
            fullWidth
          />
        </View>
      }
    >
      <View style={styles.container}>
        {/* Title Section */}
        <View style={styles.titleSection}>
          <Text style={[styles.title, Typography.displaySmall]}>
            What Is Your Weight?
          </Text>
        </View>

        {/* Weight Display */}

        <View style={styles.contentContainer}>
          {/* Weight Picker */}
            <View style={styles.weightDisplayContainer}>
              <Text style={[styles.weightDisplay, Typography.displayLarge]}>
                {selectedWeight}
                <Text style={[styles.unitText, Typography.headingMedium]}>
                  {' '}kg
                </Text>
              </Text>
            </View>
            {/* Triangle pointer */}
            <View style={styles.trianglePointer} />
          <View style={styles.pickerContainer}>

            <FlatList
              ref={flatListRef}
              data={weightData}
              renderItem={renderWeightItem}
              keyExtractor={(item, index) => `${item.value}-${index}`}
              horizontal
              showsHorizontalScrollIndicator={false}
              snapToInterval={ITEM_WIDTH * 2} // Snap to every 2 items (main + intermediate)
              decelerationRate="fast"
              onScroll={onScroll}
              scrollEventThrottle={16}
              contentContainerStyle={styles.flatListContent}
              getItemLayout={(data, index) => ({
                length: ITEM_WIDTH,
                offset: ITEM_WIDTH * index,
                index,
              })}
              initialScrollIndex={mainWeights.indexOf(selectedWeight) * 2}
              style={styles.flatList}
            />
          </View>
        </View>
      </View>
    </Page>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
  },

  // Title Section
  titleSection: {
    alignItems: "center",
    paddingVertical: 40,
    gap: 10,
  },
  title: {
    color: "#000000",
    textAlign: "center",
  },

  contentContainer: {
    flex: 1,
    flexDirection: "column",
    alignItems: "center",
    marginTop: 20,
    minHeight: 400,
    gap: 20,
  },

  // Weight Display
  weightDisplayContainer: {
    alignItems: "center",
    justifyContent: "center",
  },

  weightDisplay: {
    color: "#000000",
    fontWeight: "bold",
    fontSize: screenWidth * 0.2,
    lineHeight: screenWidth * 0.22,
  },

  unitText: {
    color: "#000000",
    fontSize: screenWidth * 0.06,
    marginTop: 5,
  },

  // Picker Container
  pickerContainer: {
    width: screenWidth * 0.8,
    height: screenHeight * 0.13,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },

  trianglePointer: {
    width: 0,
    height: 0,
    borderLeftWidth: 12,
    borderRightWidth: 12,
    borderTopWidth: 18,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderTopColor: "#000000",
    zIndex: 2,
  },

  flatList: {
    width: "100%",
    backgroundColor: Colors.primary[500],
    borderRadius: 12,
  },

  flatListContent: {
    paddingHorizontal: screenWidth * 0.37, // Precise centering for the triangle pointer
  },

  weightItem: {
    width: ITEM_WIDTH,
    height: "100%",
    flexDirection: "column",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
  },

  weightTextContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-end",
    minHeight: 25,
  },

  rulerMark: {
    backgroundColor: "#000000",
  },

  mainRulerMark: {
    width: 3,
    height: 60,
  },

  shortRulerMark: {
    width: 2,
    height: 35,
  },

  weightText: {
    fontSize: screenWidth * 0.045,
    fontWeight: "500",
    textAlign: "center",
    marginTop: 5,
  },

  selectedWeightText: {
    color: "#000000",
    fontSize: screenWidth * 0.055,
    fontWeight: "bold",
  },

  unselectedWeightText: {
    color: "#666666",
    fontSize: screenWidth * 0.04,
  },
});
