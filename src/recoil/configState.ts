import { atom } from 'recoil';

interface ConfigSchema {
  roles: string[];
}

export const configState = atom<ConfigSchema | null>({
  key: 'configState',
  default: null,
});
