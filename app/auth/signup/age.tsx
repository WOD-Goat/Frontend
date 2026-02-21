import { Button, Page } from "@/components";
import { useGlobalState } from "@/components/lib";
import { Colors, Typography } from "@/constants";
import { router } from "expo-router";
import { useRef, useState } from "react";
import { Dimensions, FlatList, StyleSheet, Text, View } from "react-native";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");
const ITEM_WIDTH = 60;

export default function AgeSelectionScreen() {
  const { get: getFromGlobalState, set: setInGlobalState } = useGlobalState();
  const signupData = getFromGlobalState("signupData") || {};
  const [selectedAge, setSelectedAge] = useState(signupData.age || 22);
  const flatListRef = useRef<FlatList>(null);

  // Generate ages from 16 to 80 (no intermediate marks needed)
  const ages = Array.from({ length: 65 }, (_, i) => i + 16);

  const handleContinue = () => {
    setInGlobalState("signupData", { ...signupData, age: selectedAge });
    console.log("Selected age:", selectedAge);
    router.push("./weight");
  };

  const renderAgeItem = ({ item, index }: { item: number; index: number }) => {
    const isSelected = item === selectedAge;

    return (
      <View style={styles.ageItem}>
        <Text
          style={[
            styles.ageText,
            isSelected ? styles.selectedAgeText : styles.unselectedAgeText,
          ]}
        >
          {item}
        </Text>
      </View>
    );
  };

  const onScroll = (event: any) => {
    const contentOffset = event.nativeEvent.contentOffset.x;
    // Calculate which age should be selected based on scroll position
    const index = Math.round(contentOffset / ITEM_WIDTH);
    const age = ages[index];
    if (age && age !== selectedAge) {
      setSelectedAge(age);
    }
  };

  return (
    <Page
      title="Age"
      footer={
        <Button
          title="Continue →"
          onPress={handleContinue}
          variant="primary"
          size="large"
          fullWidth
        />
      }
    >
      <View style={styles.container}>
        {/* Title Section */}
        <View style={styles.titleSection}>
          <Text style={[styles.title, Typography.displaySmall]}>
            How Old Are You?
          </Text>
        </View>

        {/* Age Display */}

        <View style={styles.contentContainer}>
          <View style={styles.ageDisplayContainer}>
            <Text style={[styles.ageDisplay, Typography.displayLarge]}>
              {selectedAge}
              <Text style={[styles.unitText, Typography.headingMedium]}>
                {" "}
                years
              </Text>
            </Text>
          </View>
          <View style={styles.trianglePointer} />
          {/* Age Picker */}
          <View style={styles.pickerContainer}>
            {/* Triangle pointer pointing down */}

            {/* Fixed selection square */}
            <View style={styles.selectionSquare} />

            <FlatList
              ref={flatListRef}
              data={ages}
              renderItem={renderAgeItem}
              keyExtractor={(item) => item.toString()}
              horizontal
              showsHorizontalScrollIndicator={false}
              snapToInterval={ITEM_WIDTH}
              decelerationRate="fast"
              onScroll={onScroll}
              scrollEventThrottle={16}
              contentContainerStyle={styles.flatListContent}
              getItemLayout={(data, index) => ({
                length: ITEM_WIDTH,
                offset: ITEM_WIDTH * index,
                index,
              })}
              initialScrollIndex={ages.indexOf(selectedAge)}
              style={styles.flatList}
            />
          </View>
        </View>

        {/* Continue Button */}
        <View style={styles.buttonSection}></View>
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
    paddingVertical: 20,
    paddingTop: 40,
    gap: 10,
  },
  title: {
    color: Colors.text.primary,
    textAlign: "center",
  },

  contentContainer: {
    flex: 1,
    flexDirection: "column",
    alignItems: "center",
    paddingHorizontal: 30,
    minHeight: 400,
    gap: 20,
    marginTop: 20,
  },

  // Age Display
  ageDisplayContainer: {
    alignItems: "center",
    justifyContent: "center",
  },

  ageDisplay: {
    color: Colors.text.primary,
    fontWeight: "bold",
    fontSize: screenWidth * 0.2,
    lineHeight: screenWidth * 0.22,
  },

  unitText: {
    color: Colors.text.primary,
    fontSize: screenWidth * 0.06,
    marginTop: 5,
  },

  // Picker Container
  pickerContainer: {
    width: screenWidth * 0.8,
    height: screenHeight * 0.1,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },

  selectionSquare: {
    position: "absolute",
    width: ITEM_WIDTH + 4,
    height: screenHeight * 0.1 - 10,
    backgroundColor: "transparent",
    borderWidth: 3,
    borderColor: Colors.text.primary, // Secondary colored border
    borderRadius: 12,
    zIndex: 1,
    pointerEvents: "none", // Allow touch events to pass through
  },

  trianglePointer: {
    width: 0,
    height: 0,
    borderLeftWidth: 12,
    borderRightWidth: 12,
    borderTopWidth: 15,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderTopColor: Colors.text.primary,
    zIndex: 2,
    pointerEvents: "none", // Allow touch events to pass through
  },

  flatList: {
    width: "100%",
    borderRadius: 15,
    backgroundColor: Colors.primary[500],
  },

  flatListContent: {
    paddingHorizontal: (screenWidth * 0.8 - ITEM_WIDTH) / 2, // Precise centering calculation
  },

  ageItem: {
    width: ITEM_WIDTH,
    height: 80,
    justifyContent: "center",
    alignItems: "center",
  },

  ageText: {
    fontSize: screenWidth * 0.06,
    fontWeight: "500",
    textAlign: "center",
    color: Colors.text.primary, // Ensure visibility on yellow background
  },

  selectedAgeText: {
    color: Colors.text.primary,
    fontSize: screenWidth * 0.07,
    fontWeight: "bold",
  },

  unselectedAgeText: {
    color: "#FFFFFF", // Darker for better contrast on yellow
    fontSize: screenWidth * 0.05,
  },

  // Button Section
  buttonSection: {
    paddingTop: 20,
  },
});
