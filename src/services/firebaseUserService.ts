import { 
  updateProfile, 
  updateEmail, 
  updatePassword, 
  reauthenticateWithCredential, 
  EmailAuthProvider,
  User as FirebaseUser
} from 'firebase/auth';
import { doc, updateDoc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/firebase';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export class FirebaseUserService {
  static async updateUserProfile(userData: Partial<UserProfile>): Promise<void> {
    const user = auth.currentUser;
    if (!user) throw new Error('No authenticated user');

    // Update Firebase Auth profile
    if (userData.name || userData.avatar) {
      await updateProfile(user, {
        displayName: userData.name,
        photoURL: userData.avatar
      });
    }

    // Update Firestore document
    const userRef = doc(db, 'users', user.uid);
    await updateDoc(userRef, {
      ...userData,
      updatedAt: new Date()
    });
  }

  static async changeEmail(newEmail: string, currentPassword: string): Promise<void> {
    const user = auth.currentUser;
    if (!user || !user.email) throw new Error('No authenticated user');

    // Reauthenticate user before email change
    const credential = EmailAuthProvider.credential(user.email, currentPassword);
    await reauthenticateWithCredential(user, credential);

    // Update email in Firebase Auth
    await updateEmail(user, newEmail);

    // Update email in Firestore
    const userRef = doc(db, 'users', user.uid);
    await updateDoc(userRef, {
      email: newEmail,
      updatedAt: new Date()
    });
  }

  static async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    const user = auth.currentUser;
    if (!user || !user.email) throw new Error('No authenticated user');

    // Reauthenticate user before password change
    const credential = EmailAuthProvider.credential(user.email, currentPassword);
    await reauthenticateWithCredential(user, credential);

    // Update password
    await updatePassword(user, newPassword);
  }

  static async getUserProfile(userId: string): Promise<UserProfile | null> {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      const data = userSnap.data();
      return {
        id: userSnap.id,
        ...data,
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate()
      } as UserProfile;
    }
    
    return null;
  }

  static async createUserProfile(user: FirebaseUser): Promise<void> {
    const userRef = doc(db, 'users', user.uid);
    const userProfile: UserProfile = {
      id: user.uid,
      name: user.displayName || 'User',
      email: user.email || '',
      avatar: user.photoURL || '',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await setDoc(userRef, userProfile);
  }
}
