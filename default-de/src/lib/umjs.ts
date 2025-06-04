export interface Process {
  pid: number;
  output: {
    stdout: string;
    stderr: string;
  };
  exitCode: number;
  kill(): void;
}

export interface LaunchOptions {
  cwd?: string;
  env?: Record<string, string>;
  shell?: boolean;
  args?: string[];
  compositorArgs: {
    directRender?: boolean;
  }
}

export class UMJS {
  static async execProcess(command: string, opts: LaunchOptions): Promise<Process> {
    Object.assign({}, opts); // unused in this mock implementation
    console.log(`Launching app with command: ${command}`);
    const p = Math.floor(Math.random() * 10000);
    return {
      pid: p,
      output: {
        stdout: `Output of ${command}`,
        stderr: "",
      },
      exitCode: 0,
      async kill() {
        console.log(`Killing process with PID: ${p}`);
        UMJS.terminateProcess(p);
      },
    };
  }

  static terminateProcess(pid: number): void {
    console.log(`Terminating process with PID: ${pid}`);
    // no actual process termination. the mock implementation is not *that* good
  }


  protected static parseKeycode(key: string): { modifiers: { control: boolean; alt: boolean; shift: boolean; meta: boolean }; key: string } {
    const modifiers: string[] = [];
    const keyParts = key.split("+");
    keyParts.forEach(part => {
        switch (part.trim().toLowerCase()) {
            case "ctrl":
            case "control":
                modifiers.push("Ctrl");
                break;
            case "alt":
            case "option":
                modifiers.push("Alt");
                break;
            case "shift":
            case "cmd":
                modifiers.push("Shift");
                break;
            case "meta":
            case "super":
                modifiers.push("Meta");
                break;
            default:
                modifiers.push(part.trim().toLowerCase());
                break;
        }
    });
    return { modifiers: { control: modifiers.includes("Ctrl"), alt: modifiers.includes("Alt"), shift: modifiers.includes("Shift"), meta: modifiers.includes("Meta") }, key: keyParts.pop()?.trim() || "" };
  }

  static registerKeybind(
    key: string,
    action: () => void
  ): () => void {
    console.log(`Registering keybind for key: ${key}`);
    const fn = (event: KeyboardEvent) => {
      if (event.defaultPrevented) {
        return;
      }
      const parsedKey = UMJS.parseKeycode(key);
      
      const modifiersMatch = 
        parsedKey.modifiers.control === event.ctrlKey &&
        parsedKey.modifiers.alt === event.altKey &&
        parsedKey.modifiers.shift === event.shiftKey &&
        parsedKey.modifiers.meta === event.metaKey;
      
      if (modifiersMatch && event.key.toLowerCase() === parsedKey.key.toLowerCase()) {
        event.preventDefault();
        console.log(`Keybind triggered for key: ${key}`);
        action();
      }
    };
    console.log(`Keybind registered for key: ${key}`);
    document.addEventListener("keydown", fn);
    return () => {
      console.log(`Unregistering keybind for key: ${key}`);
      document.removeEventListener("keydown", fn);
    };
  }
}