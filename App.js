import React, { useState, useEffect, useRef, useMemo } from "react";
import { StatusBar } from "expo-status-bar";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  Animated,
} from "react-native";
import { Accelerometer } from "expo-sensors";
import LottieView from "lottie-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");
const CALORIES_PER_STEP = 0.05;

export default function App() {
  const [steps, setSteps] = useState(0);
  const [isCounting, setIsCounting] = useState(false);
  const lastY = useRef(0);
  const lastTimestamp = useRef(0);
  const animationRef = useRef(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let subscription;
    const subscribeToAccelerometer = async () => {
      const isAvailable = await Accelerometer.isAvailableAsync();
      if (!isAvailable) {
        console.error("Accelerometer not available on this device!");
        return;
      }
      subscription = Accelerometer.addListener(({ y }) => {
        const threshold = 0.1;
        const timestamp = Date.now();

        if (
          Math.abs(y - lastY.current) > threshold &&
          !isCounting &&
          timestamp - lastTimestamp.current > 800
        ) {
          setIsCounting(true);
          lastY.current = y;
          lastTimestamp.current = timestamp;

          setSteps((prevSteps) => prevSteps + 1);

          setTimeout(() => {
            setIsCounting(false);
          }, 1200);
        }
      });
    };

    subscribeToAccelerometer();
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();

    return () => subscription && subscription.remove();
  }, [isCounting]);

  const resetSteps = () => setSteps(0);

  const estCaloriesBurned = useMemo(() => steps * CALORIES_PER_STEP, [steps]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <LinearGradient colors={["#4B58EC", "#A798FF"]} style={styles.gradient}>
        <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
          <Text style={styles.title}>STEP TRACKER</Text>
          <View style={styles.card}>
            <View style={styles.stepsWrap}>
              <Text style={styles.stepsTxt}>{steps}</Text>
              <Text style={styles.stepsLbl}>Steps</Text>
            </View>
            <View style={styles.caloriesWrap}>
              <Text style={styles.caloriesLbl}>Estimated Calories Burned:</Text>
              <Text style={styles.caloriesTxt}>
                {estCaloriesBurned.toFixed(2)} calories
              </Text>
            </View>
          </View>
          <View style={styles.animationWrap}>
            <LottieView
              autoPlay
              ref={animationRef}
              style={styles.animation}
              source={
                isCounting
                  ? require("./assets/walking.json")
                  : require("./assets/chilling.json")
              }
            />
            <TouchableOpacity style={styles.btn} onPress={resetSteps}>
              <Ionicons name="refresh" size={24} color="white" />
              <Text style={styles.btnTxt}>RESET</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 32,
    marginBottom: 30,
    fontWeight: "bold",
    color: "white",
    textShadowColor: "rgba(0, 0, 0, 0.75)",
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  card: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 20,
    width: width - 40,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  stepsWrap: {
    flexDirection: "row",
    alignItems: "baseline",
    marginBottom: 15,
  },
  stepsTxt: {
    fontSize: 75,
    color: "#4B58EC",
    fontWeight: "bold",
    marginRight: 10,
  },
  stepsLbl: {
    fontSize: 20,
    color: "#555",
  },
  caloriesWrap: {
    alignItems: "center",
  },
  caloriesLbl: {
    fontSize: 18,
    color: "#555",
    marginBottom: 5,
  },
  caloriesTxt: {
    fontSize: 20,
    color: "#e74c3c",
    fontWeight: "bold",
  },
  animationWrap: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "white",
    borderRadius: 20,
    padding: 20,
    marginVertical: 30,
    width: width - 40,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  animation: {
    width: 250,
    height: 250,
  },
  btn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(52, 152, 219, 0.8)",
    paddingVertical: 10,
    paddingHorizontal: 50,
    borderRadius: 30,
    marginTop: 20,
  },
  btnTxt: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 10,
  },
});
