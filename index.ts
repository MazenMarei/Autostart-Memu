import EmemuC from "./utils";
import config from "./config";

(async () => {
  try {   
    const memuC = new EmemuC();

  // * Check if MEmu is installed
    try {
      const isInstalled = await memuC.checkEmemuC();
      if (!isInstalled) {
        // * If not, install it
        if (!(await memuC.addEmemuC())) {
          console.error("Failed to install MEmu");
          return;
        }
      }
      console.log("MEmu is installed");
    } catch (error) {
      console.log("Error while checking MEmu installation: " + error);
      return;
    }

  console.log("Checking emulators status");
  let emulatorList; 
  if(config.numberOFDevices === "auto") {
    emulatorList = await memuC.getEmulatorsStatus();
  } else {
    emulatorList = Array.from({ length: parseInt(config.numberOFDevices) }, (_, i) => ({
      index: i,
      status: false,
    }));
  }

    try {
      await memuC.runShutOffEmulators({ lists: emulatorList });

    } catch (error) {
      console.log("Error while running shut off emulators: " + error);
      return;      
    }
  while (true) {
    try {
      console.log(emulatorList);
      await memuC.runShutOffEmulators({ lists: emulatorList , delay : config.delay ?? 5 * 60 * 1000});   
    } catch (error) {
      console.log("Error while running shut off emulators: " + error);
      break;
    }
  }
} catch (error) {
    console.log("error " + error);
  }
})();

process.on("uncaughtException", function (err) {
  console.log("uncaughtException: " + err);
});

process.on("unhandledRejection", function (err) {
  console.log("unhandledRejection: " + err);
});