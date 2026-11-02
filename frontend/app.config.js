module.exports = {
  expo: {
    name: "CropCycle Manager",
    slug: "crop-cycle-manager",
    version: "1.0.1",
    orientation: "portrait",
    icon: "./assets/icon.png",
    scheme: "vibezcropcycle",
    userInterfaceStyle: "light",
    owner: "donv4",
    splash: {
      // 🌟 FIXED: Swapped 'splash.png' for your true filename 'splash-icon.png'
      image: "./assets/splash-icon.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff"
    },
    android: {
      package: "com.vibezlabs.cropcycle",
      adaptiveIcon: {
        // 🌟 FIXED: Swapped out the old path variables to use your true background/foreground assets
        foregroundImage: "./assets/android-icon-foreground.png",
        backgroundImage: "./assets/android-icon-background.png",
        backgroundColor: "#ffffff"
      }
    },
    extra: {
      eas: {
        projectId: "d7b5ad67-9921-4bdc-bd8c-0f99df1d020e"
      }
    }
  }
};
