import type { SignInIdentifier, ConnectorMetadata } from '@logto/schemas';

import { EmailRegister } from '@/containers/EmailForm';
import { PhonePasswordless } from '@/containers/Passwordless';
import SocialSignIn from '@/containers/SocialSignIn';
import UsernameRegister from '@/containers/UsernameRegister';
import { UserFlow } from '@/types';

import * as styles from './index.module.scss';

type Props = {
  signUpMethod?: SignInIdentifier;
  socialConnectors: ConnectorMetadata[];
};

const Main = ({ signUpMethod, socialConnectors }: Props) => {
  switch (signUpMethod) {
    case 'email':
      return <EmailRegister className={styles.main} />;

    case 'sms':
      return <PhonePasswordless type={UserFlow.register} className={styles.main} />;

    case 'username':
      return <UsernameRegister className={styles.main} />;

    default: {
      if (socialConnectors.length > 0) {
        return <SocialSignIn />;
      }

      return null;
    }
  }
};

export default Main;