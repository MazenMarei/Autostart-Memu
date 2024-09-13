import EmemuC from "./utils";

(async () => {
  const memuC = new EmemuC();

  // * Check if MEmu is installed
  const isInstalled = await memuC.checkEmemuC();
  if (!isInstalled) {
    // * If not, install it
    if (!(await memuC.addEmemuC())) {
      console.error("Failed to install MEmu");
      return;
    }
  }
  console.log("MEmu is installed");

  while (true) {
    console.log("Checking emulators status");
    const emulatorList = await memuC.getEmulatorsStatus();
    console.log(emulatorList);
    await memuC.runShutOffEmulators({ lists: emulatorList });
  }
})();