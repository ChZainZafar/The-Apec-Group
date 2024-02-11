import Toast from "react-native-toast-message";

export const showToast = async (type, text1, text2) => {
  Toast.show({
    type: type,
    text1: text1,
    text2: text2,
    visibilityTime: 2500,
  });
};
