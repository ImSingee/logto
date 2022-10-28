import { Controller, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import FormField from '@/components/FormField';

import type { SignInExperienceForm } from '../../types';
import SocialConnectorEditBox from './components/SocialConnectorEditBox';
import * as styles from './index.module.scss';

const SocialSignInForm = () => {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const { control } = useFormContext<SignInExperienceForm>();

  return (
    <>
      <div className={styles.title}>
        {t('sign_in_exp.sign_up_and_sign_in.social_sign_in.title')}
      </div>

      <FormField title="sign_in_exp.sign_up_and_sign_in.social_sign_in.social_sign_in">
        <div className={styles.formFieldDescription}>
          {t('sign_in_exp.sign_up_and_sign_in.social_sign_in.description')}
        </div>
        <Controller
          control={control}
          name="socialSignInConnectorTargets"
          render={({ field: { value, onChange } }) => {
            return <SocialConnectorEditBox value={value} onChange={onChange} />;
          }}
        />
      </FormField>
    </>
  );
};

export default SocialSignInForm;