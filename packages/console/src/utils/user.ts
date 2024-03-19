import type { UserInfo } from '@logto/schemas';
import { getUserDisplayName } from '@logto/shared/universal';
import { t } from 'i18next';

export const getUserTitle = (user?: UserInfo): string =>
  (user ? getUserDisplayName(user) : undefined) ?? t('admin_console.users.unnamed');

export const getUserSubtitle = (user?: UserInfo) => {
  if (!user?.name) {
    return;
  }

  const { username, primaryEmail, primaryPhone } = user;

  return getUserDisplayName({ username, primaryEmail, primaryPhone });
};
