import axios from "axios";
import Toast from "react-native-toast-message";
import { colors } from "../infrastructure/theme/colors";

export const showToast = async (type, text1, text2) => {
  Toast.show({
    type: type,
    text1: text1,
    text2: text2,
    visibilityTime: 2500,
  });
};

export const sendEmail = async (payload = {}) => {
  await axios.post(
    "https://email-backend-server.vercel.app/send-email",
    payload
  );
};

export const getRadioButtonStyleProps = () => {
  return {
    containerStyle: {
      backgroundColor: "#f2f2f2",
    },
    checkedColor: colors.brand.primary,
    textStyle: {
      fontSize: 16,
      fontWeight: "normal",
    },
  };
};
