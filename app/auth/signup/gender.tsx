import { appIcons, mascotAssets } from "@/assets/images";
import { Button, Page } from "@/components";
import { useGlobalState } from "@/components/lib";
import { Colors, Typography } from "@/constants";
import { Gender } from "@/types";
import { router } from "expo-router";
import { useState } from "react";
import {
  Dimensions,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { width: screenWidth } = Dimensions.get("window");

export default function GenderSelectionScreen() {
  const { get: getFromGlobalState, set: setInGlobalState } = useGlobalState();
  const signupData = getFromGlobalState("signupData") || {};
  const [selectedGender, setSelectedGender] = useState<Gender | null>(
    (signupData.gender as Gender) || null,
  );

  const handleContinue = () => {
    if (selectedGender) {
      setInGlobalState("signupData", { ...signupData, gender: selectedGender });
      console.log("Selected gender:", selectedGender);
      router.push("./age");
    }
  };

  const renderGenderOption = (gender: Gender, icon: any, label: string) => {
    const isSelected = selectedGender === gender;

    return (
      <TouchableOpacity
        key={gender}
        style={[
          styles.genderOption,
          isSelected ? styles.selectedOption : styles.unselectedOption,
        ]}
        onPress={() => setSelectedGender(gender)}
      >
        <View style={styles.genderIconContainer}>
          <Image source={icon} style={styles.genderIcon} resizeMode="contain" />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <Page
      title="Gender"
      footer={
        <Button
          title="Continue →"
          onPress={handleContinue}
          variant="primary"
          size="large"
          fullWidth
          disabled={!selectedGender}
        />
      }
    >
      <View style={styles.container}>
        {/* Title Section */}
        <View style={styles.titleSection}>
          <Text style={[styles.title, Typography.displaySmall]}>
            Choose Your Gender
          </Text>
        </View>

        {/* Gender Options */}
        <View style={styles.optionsContainer}>
          {renderGenderOption(Gender.MALE, appIcons.logo, "Male")}
          {renderGenderOption(Gender.FEMALE, mascotAssets.female, "Female")}
        </View>
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
    paddingTop: 40,
  },
  title: {
    color: Colors.text.primary,
    textAlign: "center",
  },

  // Options Container
  optionsContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 60,
    paddingVertical: 60,
  },

  genderOption: {
    width: screenWidth * 0.35,
    height: screenWidth * 0.35,
    borderRadius: screenWidth * 0.175,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    backgroundColor: Colors.background.primary,
  },

  selectedOption: {
    backgroundColor: Colors.primary[500],
  },

  unselectedOption: {
    backgroundColor: "#ffffff",
  },

  genderIconContainer: {
    justifyContent: "center",
    alignItems: "center",
  },

  genderIcon: {
    width: screenWidth * 0.25,
    height: screenWidth * 0.25,
  },

  // Button Section
  buttonSection: {
    paddingTop: 40,
  },
});
