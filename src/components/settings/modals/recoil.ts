import { atom } from 'recoil';

interface DeleteTeamProps {
  isOpen: boolean;
  team: string;
}

export const deleteTeamModal = atom<DeleteTeamProps>({
  key: 'deleteDeptModal',
  default: {
    isOpen: false,
    team: '',
  },
});

export const deleteCompanyModal = atom<boolean>({
  key: 'deleteCompany',
  default: false,
});
