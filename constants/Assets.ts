export const ICONS = {
  nav_home: require("../assets/icons/nav_home.png"),
  nav_ai: require("../assets/icons/nav_ai.png"),
  nav_chart: require("../assets/icons/nav_chart.png"),
  nav_user: require("../assets/icons/nav_user.png"),
  nav_center: require("../assets/icons/nav_center.png"),
  instagram: require("../assets/icons/instagram.png"),
  tiktok: require("../assets/icons/tiktok.png"),
  facebook: require("../assets/icons/facebook.png"),
  youtube: require("../assets/icons/youtube.png"),
  snapchat: require("../assets/icons/snapchat.png"),
  twitter: require("../assets/icons/twitter.png"),
  edit: require("../assets/icons/edit.png"),
  delete: require("../assets/icons/delete.png"),
  chat: require("../assets/icons/chat.png"),
  chat_ai: require("../assets/icons/chat_ai.png"),
  send_msg: require("../assets/icons/send-msg.png"),
  menu: require("../assets/icons/menu.png"),
  connect: require("../assets/icons/connect.png"),
  disconnect: require("../assets/icons/disconnect.png"),
};

export const IMAGES = {
  background: require("../assets/images/background.png"),
  logo: require("../assets/images/logo.png"),
  notification: require("../assets/images/notification.png"),
  avatar: require("../assets/images/avtar.png"),
  button_bg: require("../assets/images/button-bg.png"),
};

// Use this array to preload all assets in app startup
export const PRELOAD_ASSETS = [
  ...Object.values(ICONS),
  ...Object.values(IMAGES),
];
