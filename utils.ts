import WinReg from "winreg";
import sudo from "sudo-prompt";
import { exec , execSync} from "child_process";

export default class EmemuC {
  memucPath: string = "C:\\Program Files\\Microvirt\\MEmu";
  currentPath?: string;

  async checkEmemuC(): Promise<boolean> {
    const regKey = new WinReg({
      hive: WinReg.HKLM,
      key: "\\SYSTEM\\CurrentControlSet\\Control\\Session Manager\\Environment",
    });

    return new Promise((resolve, reject) => {
      regKey.get("Path", (err, item) => {
        if (err) {
          return resolve(false);
        }
        if (item) {
          this.currentPath = item.value;
          if (item.value.includes(this.memucPath)) {

            let cmd = execSync("memuc");
           if(cmd) {
            if (cmd.includes("is not recognized")) resolve(false);
            else resolve(true)
           } else resolve(false)
          } else {
            resolve(false);
          }
        }
      });
    });
  }

  async addEmemuC(): Promise<boolean> {
    const regKey = new WinReg({
      hive: WinReg.HKLM,
      key: "\\SYSTEM\\CurrentControlSet\\Control\\Session Manager\\Environment",
    });

    if (!this.currentPath) {
      console.error("Current PATH is not set.");
      return false;
    }

    console.log("Appending to PATH:", this.memucPath);

    const newPath: string = `"${this.currentPath}${this.memucPath};"`;

    const command: string = `reg add "HKLM\\SYSTEM\\CurrentControlSet\\Control\\Session Manager\\Environment" /v Path /t REG_EXPAND_SZ /d "${this.currentPath};${this.memucPath}" /f`;

    return new Promise((resolve, reject) => {
      sudo.exec(command, { name: "Add EmemuC" }, (error, stdout, stderr) => {
        if (error) {
          console.error(error);
          return reject(error);
        }
        console.log("EmemuC added to PATH");
        resolve(true);
      });
    });
  }

  async getEmulatorsStatus(): Promise<{ index: number; status: Boolean }[]> {
    // Placeholder implementation
    return new Promise(async (resolve, reject) => {
      const listCmd = await sudo.exec(
        "memuc listvms",
        { name: "get emulators list" },
        (error, stdout, stderr) => {
          if (error) {
            console.error("Error: ");
            return reject(error);
          }
          if (stdout) {
            const lines = stdout.toString().trim().split("\n");
            const emulatorList = lines.map((line) => {
              const [index, , , status] = line.split(",");
              return { index: parseFloat(index), status: status !== "0" };
            });

            resolve(emulatorList);
          }
        }
      );
    });
  }
  async delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
  async checkEmulatorIsRunning({ index }: { index: number }): Promise<Boolean> {
    const command = `memuc isvmrunning -i ${index}`;
    return new Promise((resolve, reject) => {
      sudo.exec(
        command,
        { name: `Check emulator ${index}` },
        (error, stdout, stderr) => {
          if (error) {
            console.error(error);
            return reject(error);
          }
          if (stdout) {
            resolve(
              stdout.toString().trim().toLocaleLowerCase() ==
                "Running".toLocaleLowerCase()
            );
          }
        }
      );
    });
  }
  async runShutOffEmulators({
    lists,
    delay,
  }: {
    lists: { index: number; status: Boolean }[];
    delay?: number;
  }) {
    if (!lists || lists.length === 0) {
      console.error("No emulator list provided");
      return false;
    }

    for (let index = 0; index < lists.length; index++) {
      const item = lists[index];
      if (item.index === 0) continue;

      const command = `memuc start -i ${item.index}`;
      const isRunning = await this.checkEmulatorIsRunning({
        index: item.index,
      });

      if (isRunning) {
        console.log(`Emulator ${item.index} is already running`);
        continue;
      }

      if (delay) {
        console.log(`waiting for ${delay / (60 * 1000)} minutes`);
        await this.delay(delay);
        console.log(`${delay / (60 * 1000)}  minutes passed`);
      }
      await new Promise(async (resolve, reject) => {
        sudo.exec(
          command,
          { name: `Start emulator ${item.index}` },
          async (error, stdout, stderr) => {
            if (error) {
              console.error(error);
            }
            console.log(`Emulator ${item.index} started`);
            resolve(true);
          }
        );
      });
    }
    console.log("All emulators is running");
  }
}
