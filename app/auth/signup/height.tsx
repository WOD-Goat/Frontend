import { Button, Page } from "@/components";
import { Colors, Typography } from "@/constants";
import { useAuth, useSignupContext } from "@/hooks";
import { User } from "@/types";
import { router } from "expo-router";
import { useRef, useState } from "react";
import { Alert, Dimensions, FlatList, StyleSheet, Text, View } from "react-native";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");
const ITEM_HEIGHT = 20;
const ITEM_WIDTH = 100;

export default function HeightSelectionScreen() {
  const { signupData, updateSignupData } = useSignupContext();
  const { register } = useAuth();
  const [selectedHeight, setSelectedHeight] = useState(signupData.height || 180);
  const [isLoading, setIsLoading] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  // Generate heights from 140 to 220 cm with intermediate marks
  const generateHeightData = () => {
    const data = [];
    for (let i = 140; i <= 220; i++) {
      // Main height mark
      data.push({ value: i, isMain: true });
      // Add intermediate mark (except for the last item)
      if (i < 220) {
        data.push({ value: i + 0.5, isMain: false });
      }
    }
    return data;
  };

  const heightData = generateHeightData();
  const mainHeights = Array.from({ length: 81 }, (_, i) => i + 140);

  const handleRegister = async () => {
    try {
      setIsLoading(true);
      // Update signup data with final height
      updateSignupData({ height: selectedHeight });
      
      // Get complete signup data
      const completeSignupData = { ...signupData, height: selectedHeight };
      console.log("Complete signup data:", completeSignupData);
      
      // Validate all required fields are present
      if (!completeSignupData.email || 
          !completeSignupData.password || 
          !completeSignupData.fullName || 
          !completeSignupData.nickname || 
          !completeSignupData.mobileNumber || 
          !completeSignupData.gender ||
          !completeSignupData.age ||
          !completeSignupData.weight ||
          !completeSignupData.height) {
        Alert.alert("Error", "Please complete all signup steps");
        return;
      }
      
      // Create User object with all required fields
      const userData: User = {
        email: completeSignupData.email,
        password: completeSignupData.password,
        fullName: completeSignupData.fullName,
        nickname: completeSignupData.nickname,
        mobileNumber: completeSignupData.mobileNumber,
        gender: completeSignupData.gender,
        age: completeSignupData.age,
        weight: completeSignupData.weight,
        height: completeSignupData.height,
      };
      
      // Call register function
      const success = await register(userData);
      
      if (success) {
        console.log("Registration completed successfully!");
        router.replace("/(tabs)");
      }
    } catch (error) {
      console.error("Registration error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderHeightItem = ({
    item,
    index,
  }: {
    item: { value: number; isMain: boolean };
    index: number;
  }) => {
    const isSelected = item.isMain && item.value === selectedHeight;
    const isMainMark = item.isMain;

    return (
      <View style={styles.heightItem}>
        <View style={styles.heightTextContainer}>
          {isMainMark && (
            <Text
              style={[
                styles.heightText,
                isSelected
                  ? styles.selectedHeightText
                  : styles.unselectedHeightText,
              ]}
            >
              {Math.floor(item.value)}
            </Text>
          )}
        </View>
        <View
          style={[
            styles.rulerMark,
            isMainMark ? styles.mainRulerMark : styles.shortRulerMark,
          ]}
        />
      </View>
    );
  };

  const onScroll = (event: any) => {
    const contentOffset = event.nativeEvent.contentOffset.y;
    // Calculate which main height should be selected based on scroll position
    // Since we have pairs (main + intermediate), divide by (ITEM_HEIGHT * 2)
    const mainIndex = Math.round(contentOffset / (ITEM_HEIGHT * 2));
    const selectedMainHeight = mainHeights[mainIndex];
    if (selectedMainHeight && selectedMainHeight !== selectedHeight) {
      setSelectedHeight(selectedMainHeight);
    }
  };

  return (
    <Page
      title="Height"
      footer={
        <View>
          <Button
            title={isLoading ? "Registering..." : "Register →"}
            onPress={handleRegister}
            variant="secondary"
            size="large"
            fullWidth
            disabled={isLoading}
          />
        </View>
      }
    >
      <View style={styles.container}>
        {/* Title Section */}
        <View style={styles.titleSection}>
          <Text style={[styles.title, Typography.displaySmall]}>
            What Is Your Height?
          </Text>
        </View>

        <View style={styles.contentContainer}>
          <View style={styles.heightDisplayContainer}>
            <Text style={[styles.heightDisplay, Typography.displayLarge]}>
              {selectedHeight}
              <Text style={[styles.unitText, Typography.headingMedium]}>
                cm
              </Text>
            </Text>
          </View>
          {/* Height Picker */}
          <View style={styles.pickerContainer}>
            {/* Triangle pointer */}
            <View style={styles.trianglePointer} />

            <FlatList
              ref={flatListRef}
              data={heightData}
              renderItem={renderHeightItem}
              keyExtractor={(item, index) => `${item.value}-${index}`}
              showsVerticalScrollIndicator={false}
              snapToInterval={ITEM_HEIGHT * 2} // Snap to every 2 items (main + intermediate)
              decelerationRate="fast"
              onScroll={onScroll}
              scrollEventThrottle={16}
              contentContainerStyle={styles.flatListContent}
              getItemLayout={(data, index) => ({
                length: ITEM_HEIGHT,
                offset: ITEM_HEIGHT * index,
                index,
              })}
              initialScrollIndex={mainHeights.indexOf(selectedHeight) * 2}
              style={styles.flatList}
            />
          </View>
        </View>

        {/* Register Button */}
      </View>
    </Page>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "space-between",
  },

  // Title Section
  titleSection: {
    alignItems: "center",
    paddingVertical: 10,
    gap: 10,
  },
  title: {
    color: "#000000",
    textAlign: "center",
  },

  contentContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingHorizontal: 30,
    minHeight: 400,
  },

  // Height Display
  heightDisplayContainer: {
    alignItems: "center",
    justifyContent: "center",
    width: screenWidth * 0.35,
  },

  heightDisplay: {
    color: "#000000",
    fontWeight: "bold",
    fontSize: screenWidth * 0.2, // Responsive font size
    lineHeight: screenWidth * 0.22,
  },

  unitText: {
    color: "#000000",
    fontSize: screenWidth * 0.06,
    marginTop: 5,
  },

  // Picker Container
  pickerContainer: {
    width: screenWidth * 0.38,
    height: screenHeight * 0.52,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    flexDirection: "row",
    gap: 10,
  },

  trianglePointer: {
    width: 0,
    height: 0,
    borderTopWidth: 12,
    borderBottomWidth: 12,
    borderLeftWidth: 18,
    borderTopColor: "transparent",
    borderBottomColor: "transparent",
    borderLeftColor: "#000000",
    zIndex: 2,
  },

  flatList: {
    width: "100%",
    backgroundColor: Colors.primary[500],
    borderRadius: 12,
  },

  flatListContent: {
    paddingVertical: 209,
  },

  heightItem: {
    height: ITEM_HEIGHT,
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 15,
  },

  heightTextContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  rulerMark: {
    backgroundColor: "#000000",
  },

  mainRulerMark: {
    width: 50,
    height: 2,
  },

  shortRulerMark: {
    width: 30,
    height: 1,
  },

  heightText: {
    fontSize: screenWidth * 0.045,
    fontWeight: "500",
    textAlign: "center",
  },

  selectedHeightText: {
    color: "#000000",
    fontSize: screenWidth * 0.055,
    fontWeight: "bold",
  },

  unselectedHeightText: {
    color: "#666666",
    fontSize: screenWidth * 0.04,
  },
});
