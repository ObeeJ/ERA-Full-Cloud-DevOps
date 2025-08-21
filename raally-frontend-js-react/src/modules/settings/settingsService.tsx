import authAxios from 'src/modules/shared/axios/authAxios';
import AuthCurrentTenant from 'src/modules/auth/authCurrentTenant';

export default class SettingsService {
  static async applyThemeFromTenant() {
    try {
      const settings = await this.find();
      const theme = (settings && settings.theme) || 'default';
      this.applyTheme(theme);
    } catch (error) {
      // If we can't fetch settings, fallback to default theme
      console.warn('Could not load theme from tenant settings, using default theme:', error);
      this.applyTheme('default');
    }
  }

  static async find() {
    const tenantId = AuthCurrentTenant.get();

    const response = await authAxios.get(
      `/tenant/${tenantId}/settings`,
    );

    return response.data;
  }

  static async save(settings) {
    const body = {
      settings,
    };

    const tenantId = AuthCurrentTenant.get();
    const response = await authAxios.put(
      `/tenant/${tenantId}/settings`,
      body,
    );
    return response.data;
  }

  static applyTheme(color) {
    const oldLink = document.getElementById('theme-link');

    if (oldLink) {
      oldLink.setAttribute(
        'href',
        `${process.env.PUBLIC_URL || ''}/theme/dist/${color}.css`,
      );
      return;
    }

    const link = document.createElement('link');
    link.setAttribute('id', 'theme-link');
    link.setAttribute('rel', 'stylesheet');
    link.setAttribute('type', 'text/css');
    link.setAttribute(
      'href',
      `${process.env.PUBLIC_URL || ''}/theme/dist/${color}.css`,
    );

    // Add error handling for theme loading
    link.onerror = () => {
      console.warn(`Failed to load theme: ${color}. Falling back to default theme.`);
      if (color !== 'default') {
        this.applyTheme('default');
      }
    };

    const head = document
      .getElementsByTagName('head')
      .item(0);

    if (!head) {
      return;
    }

    head.appendChild(link);
  }
}
