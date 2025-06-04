import { create } from "zustand/react";
import { UMJS } from "../lib/umjs";

export const keybindStore = create<{
    keybinds: Record<string, {
        label: string;
        action: () => void;
        unregister: () => void;
    }>;
}>(() => ({
    keybinds: {}
}));

export function registerKeybind(key: string, action: () => void, title: string): () => void {
    if (keybindStore.getState().keybinds[key]) {
        console.warn(`Keybind for "${key}" already exists. Overwriting.`);
        keybindStore.getState().keybinds[key].unregister();
    }

    const k = UMJS.registerKeybind(key, action);

    keybindStore.setState((state) => ({
        keybinds: {
            ...state.keybinds,
            [key]: {
                label: title,
                action,
                unregister: () => {
                    keybindStore.setState((s) => {
                        const newKeybinds = { ...s.keybinds };
                        delete newKeybinds[key];
                        return { keybinds: newKeybinds };
                    });
                    k();
                }
            }
        }
    }));
    

    return () => {
        keybindStore.setState((state) => {
            const newKeybinds = { ...state.keybinds };
            delete newKeybinds[key];
            return { keybinds: newKeybinds };
        });

        k();
    };
}