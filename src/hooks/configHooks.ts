import { auth } from '../backend/firebase';
import { useRecoilState } from 'recoil';
import { configState } from '../recoil/configState';
import { doc, getDoc } from 'firebase/firestore';
import { useEffect } from 'react';
import { firestoreDB } from '../backend/firestore';
import { CONFIG_COLLECTION } from '../constants/firebaseConstants';
import { z } from 'zod';
import { userState } from '../recoil/authState';

const rolesSchema = z.object({
  roles: z.array(z.string()),
});

export const useConfig = () => {
  const [user] = useRecoilState(userState);
  const [, setConfig] = useRecoilState(configState);

  useEffect(() => {
    if (user && user.role === 'admin') {
      const rolesDocRef = doc(firestoreDB, CONFIG_COLLECTION, 'roles');

      const getConfig = async () => {
        const roles = (await getDoc(rolesDocRef)).data();

        const validatedRoles = rolesSchema.safeParse(roles);
        if (validatedRoles.success) {
          setConfig({
            roles: validatedRoles.data.roles,
          });
        } else {
          auth.signOut();
        }
      };
      getConfig();
    }

    if (!user) {
      setConfig(null);
    }
  }, [user, setConfig]);
};
