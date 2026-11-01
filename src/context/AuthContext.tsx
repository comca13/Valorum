/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { 
  auth, 
  db, 
  googleProvider, 
  signInWithPopup, 
  firebaseSignOut, 
  onAuthStateChanged, 
  doc, 
  getDoc, 
  setDoc, 
  onSnapshot, 
  handleFirestoreError, 
  OperationType,
  type User 
} from '../services/firebase';
import { PlannerData, MacroPriceAlert } from '../types/financial';

interface CloudSyncState {
  status: 'offline' | 'syncing' | 'synced' | 'error';
  lastSyncedAt: Date | null;
  errorMessage?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  cloudSync: CloudSyncState;
  loginWithGoogle: () => Promise<User | null>;
  logout: () => Promise<void>;
  syncDataToCloud: (plannerData: PlannerData, alerts: MacroPriceAlert[]) => Promise<void>;
  remotePlannerData: PlannerData | null;
  remoteAlerts: MacroPriceAlert[] | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEYS = {
  PLANNER: 'valorum_personal_planner_v1',
  ALERTS: 'valorum_macro_alerts_v1',
  LAST_LOGIN_PROMPT: 'valorum_last_login_prompt',
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [cloudSync, setCloudSync] = useState<CloudSyncState>({
    status: 'offline',
    lastSyncedAt: null,
  });
  const [remotePlannerData, setRemotePlannerData] = useState<PlannerData | null>(null);
  const [remoteAlerts, setRemoteAlerts] = useState<MacroPriceAlert[] | null>(null);

  // Monitor Auth State
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setIsLoading(false);

      if (currentUser) {
        setCloudSync((prev) => ({ ...prev, status: 'synced', errorMessage: undefined }));
        // Ensure user profile document exists
        try {
          const userDocRef = doc(db, 'users', currentUser.uid);
          await setDoc(userDocRef, {
            uid: currentUser.uid,
            email: currentUser.displayName ? currentUser.email : (currentUser.email || 'user@example.com'),
            displayName: currentUser.displayName || 'Investidor Valorum',
            photoURL: currentUser.photoURL || '',
            updatedAt: new Date().toISOString(),
          }, { merge: true });
        } catch (err) {
          console.warn('Could not update user profile metadata:', err);
        }
      } else {
        setCloudSync({
          status: 'offline',
          lastSyncedAt: null,
          errorMessage: undefined,
        });
        setRemotePlannerData(null);
        setRemoteAlerts(null);
      }
    });

    return () => unsubscribe();
  }, []);

  // Real-time Firestore sync listener when user is authenticated
  useEffect(() => {
    if (!user) return;

    const plannerDocRef = doc(db, 'users', user.uid, 'data', 'planner');
    
    const unsubscribe = onSnapshot(plannerDocRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        if (data.plannerData) {
          setRemotePlannerData(data.plannerData as PlannerData);
          try {
            localStorage.setItem(STORAGE_KEYS.PLANNER, JSON.stringify(data.plannerData));
          } catch (e) {
            console.warn('Local storage update error', e);
          }
        }
        if (data.alerts && Array.isArray(data.alerts)) {
          setRemoteAlerts(data.alerts as MacroPriceAlert[]);
          try {
            localStorage.setItem(STORAGE_KEYS.ALERTS, JSON.stringify(data.alerts));
          } catch (e) {
            console.warn('Local storage update error', e);
          }
        }
        setCloudSync({
          status: 'synced',
          lastSyncedAt: new Date(),
        });
      } else {
        // Document doesn't exist yet on cloud, attempt to push initial local state
        const localPlanner = localStorage.getItem(STORAGE_KEYS.PLANNER);
        const localAlerts = localStorage.getItem(STORAGE_KEYS.ALERTS);
        if (localPlanner) {
          try {
            const parsedPlanner = JSON.parse(localPlanner);
            const parsedAlerts = localAlerts ? JSON.parse(localAlerts) : [];
            setDoc(plannerDocRef, {
              userId: user.uid,
              plannerData: parsedPlanner,
              alerts: parsedAlerts,
              updatedAt: new Date().toISOString(),
            }, { merge: true }).catch((err) => {
              handleFirestoreError(err, OperationType.WRITE, `users/${user.uid}/data/planner`);
            });
          } catch (e) {
            console.error('Error migrating initial local data to cloud:', e);
          }
        }
      }
    }, (error) => {
      console.error('Firestore snapshot listener error:', error);
      setCloudSync((prev) => ({
        ...prev,
        status: 'error',
        errorMessage: 'Falha na conexão com a nuvem',
      }));
    });

    return () => unsubscribe();
  }, [user]);

  // Google Login popup
  const loginWithGoogle = async (): Promise<User | null> => {
    setIsLoading(true);
    setCloudSync((prev) => ({ ...prev, status: 'syncing' }));

    try {
      const result = await signInWithPopup(auth, googleProvider);
      const loggedUser = result.user;
      setUser(loggedUser);

      // Check and sync user planner data
      const plannerDocRef = doc(db, 'users', loggedUser.uid, 'data', 'planner');
      const snap = await getDoc(plannerDocRef);

      if (snap.exists()) {
        const cloudData = snap.data();
        if (cloudData.plannerData) {
          setRemotePlannerData(cloudData.plannerData as PlannerData);
          localStorage.setItem(STORAGE_KEYS.PLANNER, JSON.stringify(cloudData.plannerData));
        }
        if (cloudData.alerts) {
          setRemoteAlerts(cloudData.alerts as MacroPriceAlert[]);
          localStorage.setItem(STORAGE_KEYS.ALERTS, JSON.stringify(cloudData.alerts));
        }
      } else {
        // First login: upload existing local items to cloud
        const localPlanner = localStorage.getItem(STORAGE_KEYS.PLANNER);
        const localAlerts = localStorage.getItem(STORAGE_KEYS.ALERTS);
        if (localPlanner) {
          await setDoc(plannerDocRef, {
            userId: loggedUser.uid,
            plannerData: JSON.parse(localPlanner),
            alerts: localAlerts ? JSON.parse(localAlerts) : [],
            updatedAt: new Date().toISOString(),
          });
        }
      }

      setCloudSync({
        status: 'synced',
        lastSyncedAt: new Date(),
      });
      return loggedUser;
    } catch (err: unknown) {
      console.error('Google Sign-In failed:', err);
      setCloudSync({
        status: 'error',
        lastSyncedAt: null,
        errorMessage: 'Erro ao conectar com Google. Tente novamente.',
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Sign out
  const logout = async (): Promise<void> => {
    try {
      await firebaseSignOut(auth);
      setUser(null);
      setCloudSync({
        status: 'offline',
        lastSyncedAt: null,
      });
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  // Explicit sync to cloud
  const syncDataToCloud = useCallback(async (
    plannerData: PlannerData, 
    alerts: MacroPriceAlert[]
  ): Promise<void> => {
    if (!user) {
      // Still persist locally
      try {
        localStorage.setItem(STORAGE_KEYS.PLANNER, JSON.stringify(plannerData));
        localStorage.setItem(STORAGE_KEYS.ALERTS, JSON.stringify(alerts));
      } catch (e) {
        console.warn('LocalStorage save error:', e);
      }
      return;
    }

    setCloudSync((prev) => ({ ...prev, status: 'syncing' }));
    try {
      const plannerDocRef = doc(db, 'users', user.uid, 'data', 'planner');
      await setDoc(plannerDocRef, {
        userId: user.uid,
        plannerData,
        alerts,
        updatedAt: new Date().toISOString(),
      }, { merge: true });

      setCloudSync({
        status: 'synced',
        lastSyncedAt: new Date(),
      });
    } catch (err) {
      console.error('Cloud synchronization error:', err);
      setCloudSync((prev) => ({
        ...prev,
        status: 'error',
        errorMessage: 'Falha ao sincronizar alterações na nuvem',
      }));
    }
  }, [user]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        cloudSync,
        loginWithGoogle,
        logout,
        syncDataToCloud,
        remotePlannerData,
        remoteAlerts,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
