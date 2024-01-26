import { isValidUrl } from '@logto/core-kit';
import { ApplicationType, type Application, type RequestErrorBody } from '@logto/schemas';
import { isValidSubdomain } from '@logto/shared/universal';
import { conditional } from '@silverhand/essentials';
import classNames from 'classnames';
import { HTTPError } from 'ky';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import useSWRImmutable from 'swr/immutable';

import { isCloud, isDevFeaturesEnabled } from '@/consts/env';
import Button, { type Props as ButtonProps } from '@/ds-components/Button';
import FormField from '@/ds-components/FormField';
import TextInput from '@/ds-components/TextInput';
import useApi from '@/hooks/use-api';

import * as styles from './index.module.scss';

type Props = {
  className?: string;
  buttonAlignment?: 'left' | 'right';
  buttonText?: ButtonProps['title'];
  buttonSize?: ButtonProps['size'];
  hasDetailedInstructions?: boolean;
  hasRequiredLabel?: boolean;
  onCreateSuccess?: (createdApp: Application) => void;
};

function ProtectedAppForm({
  className,
  buttonAlignment = 'right',
  buttonSize = 'large',
  buttonText = 'protected_app.form.create_application',
  hasDetailedInstructions,
  hasRequiredLabel,
  onCreateSuccess,
}: Props) {
  const { data } = useSWRImmutable<ProtectedAppsDomainConfig>(
    isDevFeaturesEnabled && isCloud && 'api/systems/application'
  );
  const defaultDomain = data?.protectedApps.defaultDomain ?? '';
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ProtectedAppForm>();

  const api = useApi({ hideErrorToast: true });

  const onSubmit = handleSubmit(async (data) => {
    if (isSubmitting) {
      return;
    }

    try {
      const createdApp = await api
        .post('api/applications', {
          json: {
            // App name is subdomain on create, but user can change it later in app details.
            name: data.subDomain,
            type: ApplicationType.Protected,
            protectedAppMetadata: data,
          },
        })
        .json<Application>();
      toast.success(t('applications.application_created'));
      onCreateSuccess?.(createdApp);
    } catch (error: unknown) {
      if (error instanceof HTTPError) {
        const { code, message } = await error.response.json<RequestErrorBody>();

        if (code === 'application.protected_application_subdomain_exists') {
          setError('subDomain', { type: 'custom', message });
        }
      }
    }
  });

  return (
    <form className={className}>
      <div className={styles.formFieldWrapper}>
        {hasDetailedInstructions && (
          <div className={styles.withDashedLine}>
            <div className={styles.index}>1</div>
            <div className={styles.dashedLine} />
          </div>
        )}
        <FormField
          isRequired={hasRequiredLabel}
          className={styles.field}
          title="protected_app.form.domain_field_label"
          description={`protected_app.form.domain_field_description${
            hasDetailedInstructions ? '' : '_short'
          }`}
          tip={conditional(
            !hasDetailedInstructions && t('protected_app.form.domain_field_tooltip')
          )}
        >
          <div className={styles.domainFieldWrapper}>
            <TextInput
              className={styles.subdomain}
              {...register('subDomain', {
                required: true,
                validate: (value) =>
                  isValidSubdomain(value) || t('protected_app.form.errors.invalid_domain_format'),
              })}
              placeholder={t('protected_app.form.domain_field_placeholder')}
              error={
                // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
                errors.subDomain?.message ||
                (errors.subDomain?.type === 'required' &&
                  t('protected_app.form.errors.domain_required'))
              }
            />
            {defaultDomain && <div className={styles.domain}>{defaultDomain}</div>}
          </div>
        </FormField>
      </div>
      <div className={styles.formFieldWrapper}>
        {hasDetailedInstructions && <div className={styles.index}>2</div>}
        <FormField
          isRequired={hasRequiredLabel}
          className={styles.field}
          title="protected_app.form.url_field_label"
          description={conditional(
            hasDetailedInstructions && 'protected_app.form.url_field_description'
          )}
          tip={conditional(!hasDetailedInstructions && t('protected_app.form.url_field_tooltip'))}
        >
          <TextInput
            {...register('origin', {
              required: true,
              validate: (value) => isValidUrl(value) || t('protected_app.form.errors.invalid_url'),
            })}
            placeholder={t('protected_app.form.url_field_placeholder')}
            error={
              // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
              errors.origin?.message ||
              (errors.origin?.type === 'required' && t('protected_app.form.errors.url_required'))
            }
          />
        </FormField>
      </div>
      <Button
        className={classNames(
          styles.submitButton,
          buttonAlignment === 'left' && styles.leftAligned
        )}
        size={buttonSize}
        type="primary"
        title={buttonText}
        isLoading={isSubmitting}
        onClick={onSubmit}
      />
    </form>
  );
}

export default ProtectedAppForm;
