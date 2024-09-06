import { doc, getDoc } from 'firebase/firestore';
import { useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useRecoilState } from 'recoil';
import { auth } from '../backend/firebase';
import { firestoreDB } from '../backend/firestore';
import {
  COMPANIES_COLLECTION,
  USERS_COLLECTION,
} from '../constants/firebaseConstants';
import { companyState, userState } from '../recoil/authState';
import { getRoleFromClaims } from '../backend/authUtils';
import { logoutModal } from '../components/auth/logoutModal/recoil';
import { userSchema } from '../schemas/userSchema';
import { CompanySchema } from '../schemas/companySchema';
import { DEFAULT_USERS_STATE, usersState } from '../recoil/usersState';
import { configState } from '../recoil/configState';

export const useAuth = () => {
  const [user] = useAuthState(auth);
  const [, setUserData] = useRecoilState(userState);

  useEffect(() => {
    if (user) {
      const userDocRef = doc(firestoreDB, USERS_COLLECTION, user.uid);

      const getUser = async () => {
        const userData = (await getDoc(userDocRef)).data();
        const userStateData = {
          ...userData,
          uid: user.uid,
          role: await getRoleFromClaims(user),
        };

        const validatedUser = userSchema.safeParse(userStateData);
        if (validatedUser.success) {
          setUserData(validatedUser.data);
        } else {
          auth.signOut();
        }
      };
      getUser();
    }

    if (!user) {
      setUserData(null);
    }
  }, [user, setUserData]);
};

export const useCompany = () => {
  const [user] = useRecoilState(userState);
  const [company, setCompany] = useRecoilState(companyState);

  useEffect(() => {
    if (user && !company) {
      const businessDocRef = doc(
        firestoreDB,
        COMPANIES_COLLECTION,
        user.companyId
      );

      const getCompany = async () => {
        const companyData = (
          await getDoc(businessDocRef)
        ).data() as CompanySchema;
        setCompany(companyData);
      };
      getCompany();
    }

    if (!user && company) {
      setCompany(null);
    }
  }, [user, company, setCompany]);
};

export const useResetDataOnAuthChange = () => {
  const [, setLogoutModal] = useRecoilState(logoutModal);
  const [user, setUserData] = useRecoilState(userState);
  const [, setConfig] = useRecoilState(configState);
  const [, setUsers] = useRecoilState(usersState);

  useEffect(() => {
    if (!user) {
      setLogoutModal(false);
      setUsers(DEFAULT_USERS_STATE);
      setConfig(null);
    }
  }, [setUserData, user, setLogoutModal, setUsers, setConfig]);
};
